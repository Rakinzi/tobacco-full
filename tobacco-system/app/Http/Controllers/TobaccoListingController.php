<?php

namespace App\Http\Controllers;

use App\Models\TobaccoListing;
use App\Services\ImageDetectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\TobaccoListingImage;
use Illuminate\Support\Facades\Storage;

class TobaccoListingController extends Controller
{
    protected $imageDetectionService;

    public function __construct(ImageDetectionService $imageDetectionService)
    {
        $this->imageDetectionService = $imageDetectionService;
    }

    /**
     * List all tobacco listings
     */
    public function index()
    {
        $listings = TobaccoListing::with(['user', 'companyProfile', 'images'])
            ->when(auth()->user()->user_type !== 'admin', function ($query) {
                return $query->where('user_id', auth()->id());
            })
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $listings
        ]);
    }
    /**
     * Store a new tobacco listing
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'batch_number' => 'required|string|unique:tobacco_listings',
            'tobacco_type' => 'required|in:flue_cured,burley,dark_fired',
            'quantity' => 'required|numeric|min:0',
            'grade' => 'required|string',
            'region_grown' => 'required|string',
            'season_grown' => 'required|string',
            'description' => 'nullable|string',
            'minimum_price' => 'required|numeric|min:0',
            'images' => 'required|array|min:1|max:5',
            'images.*' => 'required|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Add user and company data
        $data = $validator->validated();
        $data['user_id'] = auth()->id();
        $data['company_profile_id'] = auth()->user()->companyProfile->id;
        $data['status'] = 'pending';

        $listing = TobaccoListing::create($data);

        // Store image paths for later processing
        $imagePaths = [];

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('tobacco-images', 'public');
                $imagePaths[] = $path;

                TobaccoListingImage::create([
                    'tobacco_listing_id' => $listing->id,
                    'image_path' => $path
                ]);
            }
        }

        // Send images to Python API for automatic verification
        try {
            $this->imageDetectionService->sendImagesToPythonDetection($imagePaths, $listing->id);
        } catch (\Exception $e) {
            \Log::error('Error during tobacco image detection: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Tobacco listing created successfully. Images are being verified.',
            'data' => $listing->load(['user', 'companyProfile', 'images'])
        ], 201);
    }

    /**
     * Show a specific tobacco listing
     */
    public function show($id)
    {
        $listing = TobaccoListing::with(['user', 'companyProfile', 'images'])->findOrFail($id);

        // Check if user can view this listing
        if (auth()->user()->user_type !== 'admin' && $listing->user_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $listing
        ]);
    }

    /**
     * Update a tobacco listing
     */
    public function update(Request $request, $id)
    {
        $listing = TobaccoListing::findOrFail($id);

        // Check if user can update this listing
        if (auth()->user()->user_type !== 'admin' && $listing->user_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'batch_number' => 'sometimes|string|unique:tobacco_listings,batch_number,' . $id,
            'tobacco_type' => 'sometimes|in:flue_cured,burley,dark_fired',
            'quantity' => 'sometimes|numeric|min:0',
            'grade' => 'sometimes|string',
            'region_grown' => 'sometimes|string',
            'season_grown' => 'sometimes|string',
            'description' => 'nullable|string',
            'minimum_price' => 'sometimes|numeric|min:0',
            'images' => 'sometimes|array|min:1|max:5',
            'images.*' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $listing->update($validator->validated());

        // Handle image uploads if new images are provided
        if ($request->hasFile('images')) {
            // Delete old images
            foreach ($listing->images as $image) {
                Storage::disk('public')->delete($image->image_path);
                $image->delete();
            }

            // Upload new images
            foreach ($request->file('images') as $image) {
                $path = $image->store('tobacco-images', 'public');

                TobaccoListingImage::create([
                    'tobacco_listing_id' => $listing->id,
                    'image_path' => $path
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Tobacco listing updated successfully',
            'data' => $listing->fresh()->load(['user', 'companyProfile', 'images'])
        ]);
    }


    public function showTimbOfficer()
    {
        // Verify that the authenticated user is a TIMB officer
        if (auth()->user()->user_type !== "timb_officer") {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized action'
            ], 403);
        }

        // Fetch all tobacco listings with their related data
        $listings = TobaccoListing::with(['user', 'companyProfile', 'images'])
            ->latest()  // Order by most recently created first
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $listings
        ]);
    }

    /**
     * TIMB clearance for tobacco listing
     */
    public function timbClearance($id)
    {
        // Check if request is from API or authenticated user
        $isApiRequest = request()->header('Authorization') === 'Bearer ' . config('services.python_backend.token');

        // If not API request, check user permissions
        if (!$isApiRequest && auth()->user()->user_type !== 'timb_officer') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized action'
            ], 403);
        }

        $listing = TobaccoListing::findOrFail($id);

        $listing->update([
            'timb_cleared' => true,
            'timb_cleared_at' => now(),
            'timb_certificate_number' => 'TIMB-' . date('Y') . '-' . str_pad($listing->id, 6, '0', STR_PAD_LEFT),
            'status' => 'approved'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Tobacco listing cleared by TIMB' . ($isApiRequest ? ' (Automatic)' : ''),
            'data' => $listing->fresh()->load(['user', 'companyProfile'])
        ]);
    }
}