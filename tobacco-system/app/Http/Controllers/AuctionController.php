<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use App\Models\TobaccoListing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Notifications\AuctionEndedNotification;

class AuctionController extends Controller
{
    public function index()
    {
        $auctions = Auction::with(['tobaccoListing', 'user', 'winner'])
            ->when(auth()->user()->user_type === 'trader', function ($query) {
                return $query->where('user_id', auth()->id());
            })
            ->latest()
            ->get();

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

        return response()->json([
            'status' => 'success',
            'message' => 'Auction created successfully',
            'data' => $auction->load(['tobaccoListing', 'user'])
        ], 201);
    }

    public function show($id)
    {
        $auction = Auction::with(['tobaccoListing', 'user', 'winner', 'bids.user'])
            ->findOrFail($id);

        // Check and update auction status
        $now = now();

        if ($auction->status === 'pending' && $now >= $auction->start_time) {
            $auction->update(['status' => 'active']);
            $auction->refresh();
        }

        if ($auction->status === 'active' && $now >= $auction->end_time) {
            $auction->update(['status' => 'ended']);
            $auction->refresh();
        }

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

        return response()->json([
            'status' => 'success',
            'message' => 'Auction updated successfully',
            'data' => $auction->fresh()->load(['tobaccoListing', 'user'])
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

        return response()->json([
            'status' => 'success',
            'message' => 'Auction cancelled successfully',
            'data' => $auction->fresh()->load(['tobaccoListing', 'user'])
        ]);
    }

    public function end($id)
    {
        $auction = Auction::findOrFail($id);

        // Only admin or auction owner can end auction
        if (auth()->user()->user_type !== 'admin' && $auction->user_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized action'
            ], 403);
        }

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

        $auction->user->notify(new AuctionEndedNotification($auction));
        if ($auction->winner) {
            $auction->winner->notify(new AuctionEndedNotification($auction));
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Auction ended successfully',
            'data' => $auction->fresh()->load(['winner', 'bids'])
        ]);
    }
}