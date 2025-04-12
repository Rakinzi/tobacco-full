<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use App\Models\TobaccoListing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Notifications\AuctionEndedNotification;
use Illuminate\Support\Facades\Storage;

class AuctionController extends Controller
{
    public function index()
    {
        $auctions = Auction::with([
            'tobaccoListing',
            'tobaccoListing.images', // Eager load the tobacco images
            'user',
            'winner'
        ])
            ->when(auth()->user()->user_type === 'trader', function ($query) {
                return $query->where('user_id', auth()->id());
            })
            ->latest()
            ->get();

        // Transform the response to include image URLs
        $auctions->each(function ($auction) {
            $this->addImageUrls($auction);
        });

        return response()->json([
            'status' => 'success',
            'data' => $auctions
        ]);
    }

    public function store(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'tobacco_listing_id' => 'required|exists:tobacco_listings,id',
            'starting_price' => 'required|numeric|min:0',
            'reserve_price' => 'nullable|numeric|min:0',
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if tobacco listing belongs to user
        $listing = TobaccoListing::findOrFail($request->tobacco_listing_id);
        if ($listing->user_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to create auction for this listing'
            ], 403);
        }

        // Create auction
        $data = $validator->validated();
        $data['user_id'] = auth()->id();
        $data['current_price'] = $data['starting_price'];
        $data['status'] = 'pending';

        $auction = Auction::create($data);
        $auction->load(['tobaccoListing', 'tobaccoListing.images', 'user']);

        // Add image URLs to the response
        if ($auction instanceof \Illuminate\Database\Eloquent\Collection) {
            $auction->each(function ($item) {
                $this->addImageUrls($item);
            });
        } else {
            $this->addImageUrls($auction);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Auction created successfully',
            'data' => $auction
        ], 201);
    }

    public function show($id)
    {
        $auction = Auction::with([
            'tobaccoListing',
            'tobaccoListing.images',
            'user',
            'winner',
            'bids.user'
        ])->findOrFail($id);

        // Check and update auction status
        $now = now();

        if ($auction->status === 'pending' && $now >= $auction->start_time) {
            $auction->update(['status' => 'active']);
            $auction->refresh();
        }

        if ($auction->status === 'active' && $now >= $auction->end_time) {
            // Get highest bid and update winner
            $highestBid = $auction->bids()->orderBy('amount', 'desc')->first();

            $updateData = ['status' => 'ended'];

            if ($highestBid) {
                $updateData['winner_id'] = $highestBid->user_id;
                $updateData['current_price'] = $highestBid->amount;
            }

            $auction->update($updateData);
            $auction->refresh();
        }

        // Add image URLs to the response
        $this->addImageUrls($auction);

        return response()->json([
            'status' => 'success',
            'data' => $auction
        ]);
    }
    public function update(Request $request, $id)
    {
        $auction = Auction::findOrFail($id);

        // Check ownership
        if ($auction->user_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update this auction'
            ], 403);
        }

        // Can't update active or ended auctions
        if ($auction->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot update auction that has started or ended'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'starting_price' => 'sometimes|numeric|min:0',
            'reserve_price' => 'nullable|numeric|min:0',
            'start_time' => 'sometimes|date|after:now',
            'end_time' => 'sometimes|date|after:start_time'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $auction->update($validator->validated());
        $auction->load(['tobaccoListing', 'tobaccoListing.images', 'user']);

        // Add image URLs to the response
        $this->addImageUrls($auction);

        return response()->json([
            'status' => 'success',
            'message' => 'Auction updated successfully',
            'data' => $auction
        ]);
    }

    public function cancel($id)
    {
        $auction = Auction::findOrFail($id);

        // Check ownership or admin
        if ($auction->user_id !== auth()->id() && auth()->user()->user_type !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to cancel this auction'
            ], 403);
        }

        // Can only cancel pending auctions
        if ($auction->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Can only cancel pending auctions'
            ], 422);
        }

        $auction->update(['status' => 'cancelled']);
        $auction->load(['tobaccoListing', 'tobaccoListing.images', 'user']);

        // Add image URLs to the response
        $this->addImageUrls($auction);

        return response()->json([
            'status' => 'success',
            'message' => 'Auction cancelled successfully',
            'data' => $auction
        ]);
    }

    public function end($id)
    {
        $auction = Auction::findOrFail($id);

        // Get highest bid
        $highestBid = $auction->bids()->orderBy('amount', 'desc')->first();

        if (!$highestBid) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot end auction without any bids'
            ], 422);
        }

        $auction->update([
            'status' => 'ended',
            'winner_id' => $highestBid->user_id,
            'current_price' => $highestBid->amount
        ]);

        // Notifications...

        return response()->json([
            'status' => 'success',
            'message' => 'Auction ended successfully',
            'data' => $auction
        ]);
    }

    /**
     * Add full image URLs to the tobacco listing images
     *
     * @param \App\Models\Auction $auction
     * @return void
     */
    private function addImageUrls($model)
    {
        if ($model instanceof \Illuminate\Database\Eloquent\Collection) {
            $model->each(function ($item) {
                $this->addImageUrls($item);
            });
            return;
        }

        if ($model instanceof TobaccoListing && $model->images) {
            $model->images->each(function ($image) {
                $image->image_url = $this->getImageUrl($image->image_path);
            });
        } elseif ($model instanceof Auction && $model->tobaccoListing && $model->tobaccoListing->images) {
            $model->tobaccoListing->images->each(function ($image) {
                $image->image_url = $this->getImageUrl($image->image_path);
            });
        }
    }

    public function wonAuctions()
    {
        $wonAuctions = Auction::with(['tobaccoListing', 'user'])
            ->where('winner_id', auth()->id())
            ->where('status', 'ended')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $wonAuctions
        ]);
    }

    /**
     * Get the full URL for an image path
     *
     * @param string $path
     * @return string
     */
    private function getImageUrl($path)
    {
        if (!$path) {
            return null;
        }

        // If the path is already a URL, return it as is
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        // Otherwise, generate a URL using Storage::url()
        return url(Storage::url($path));
    }
}