<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use App\Models\Bid;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Notifications\BidPlacedNotification;

class BidController extends Controller
{
    public function store(Request $request, $auction_id)
    {
        $auction = Auction::findOrFail($auction_id);

        // Validate auction is active
        if ($auction->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Auction is not active'
            ], 422);
        }

        // Cannot bid on own auction
        if ($auction->user_id === auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot bid on your own auction'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'amount' => [
                'required',
                'numeric',
                'min:' . ($auction->current_price + 0.01) // Must be higher than current price
            ]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create new bid
        $bid = Bid::create([
            'auction_id' => $auction_id,
            'user_id' => auth()->id(),
            'amount' => $request->amount,
            'is_winning' => true
        ]);

        $auction->user->notify(new BidPlacedNotification($bid));

        // Update previous winning bid
        Bid::where('auction_id', $auction_id)
            ->where('id', '!=', $bid->id)
            ->where('is_winning', true)
            ->update(['is_winning' => false]);

        // Update auction current price
        $auction->update([
            'current_price' => $request->amount
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Bid placed successfully',
            'data' => $bid->load(['user', 'auction'])
        ], 201);
    }

    public function index($auction_id)
    {
        $bids = Bid::with(['user'])
            ->where('auction_id', $auction_id)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $bids
        ]);
    }
}