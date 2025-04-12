<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Auction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Notifications\OrderCreatedNotification;
use App\Notifications\OrderStatusNotification;

class OrderController extends Controller
{
    public function index()
    {
        // Determine which orders to fetch based on user type
        $query = Order::with([
            'buyer', 
            'seller', 
            'auction' => function($query) {
                $query->with([
                    'tobaccoListing' => function($subQuery) {
                        $subQuery->with('images');
                    }
                ]);
            }
        ]);

        // For admin, show all orders
        if (auth()->user()->user_type === 'admin') {
            $orders = $query->latest()->get();
        } 
        // For traders, show orders where they are the seller
        elseif (auth()->user()->user_type === 'trader') {
            $orders = $query->where('seller_id', auth()->id())->latest()->get();
        } 
        // For buyers, show orders where they are the buyer
        else {
            $orders = $query->where('buyer_id', auth()->id())->latest()->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'auction_id' => 'required|exists:auctions,id',
            'delivery_instructions' => 'nullable|string',
            'delivery_date' => 'required|date|after:today'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Get auction and verify it's ended and user is winner
        $auction = Auction::findOrFail($request->auction_id);

        if ($auction->status !== 'ended') {
            return response()->json([
                'status' => 'error',
                'message' => 'Auction must be ended to create order'
            ], 422);
        }

        if ($auction->winner_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only auction winner can create order'
            ], 403);
        }

        // Create order
        $order = Order::create([
            'auction_id' => $auction->id,
            'buyer_id' => auth()->id(),
            'seller_id' => $auction->user_id,
            'amount' => $auction->current_price,
            'status' => 'pending',
            'order_number' => 'ORD-' . date('Y') . '-' . Str::padLeft(Order::count() + 1, 6, '0'),
            'delivery_instructions' => $request->delivery_instructions,
            'delivery_date' => $request->delivery_date,
            'delivery_status' => 'scheduled'
        ]);

        $order->seller->notify(new OrderCreatedNotification($order));
        $order->buyer->notify(new OrderCreatedNotification($order));

        return response()->json([
            'status' => 'success',
            'message' => 'Order created successfully',
            'data' => $order->load([
                'buyer', 
                'seller', 
                'auction' => function($query) {
                    $query->with([
                        'tobaccoListing' => function($subQuery) {
                            $subQuery->with('images');
                        }
                    ]);
                }
            ])
        ], 201);
    }

    public function show($id)
    {
        $order = Order::with([
            'buyer', 
            'seller', 
            'auction' => function($query) {
                $query->with([
                    'tobaccoListing' => function($subQuery) {
                        $subQuery->with('images');
                    }
                ]);
            }, 
            'transactions'
        ])->findOrFail($id);

        // Check if user is buyer, seller or admin
        if (
            !in_array(auth()->id(), [$order->buyer_id, $order->seller_id]) &&
            auth()->user()->user_type !== 'admin'
        ) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view this order'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $order
        ]);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        // Only seller can update delivery details
        if ($order->seller_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only seller can update order'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'delivery_date' => 'sometimes|date|after:today',
            'delivery_status' => 'sometimes|in:scheduled,in_transit,delivered',
            'delivery_instructions' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $order->update($validator->validated());

        if ($request->has('delivery_status')) {
            $order->buyer->notify(new OrderStatusNotification($order, $request->delivery_status));
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Order updated successfully',
            'data' => $order->fresh()->load([
                'buyer', 
                'seller', 
                'auction' => function($query) {
                    $query->with([
                        'tobaccoListing' => function($subQuery) {
                            $subQuery->with('images');
                        }
                    ]);
                }
            ])
        ]);
    }

    // New method to check existing orders for multiple auctions
    public function checkAuctionOrders(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'auction_ids' => 'required|array',
            'auction_ids.*' => 'exists:auctions,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find orders for the given auction IDs where the current user is the buyer
        $orders = Order::whereIn('auction_id', $request->auction_ids)
            ->where('buyer_id', auth()->id())
            ->get();

        // Create a map of auction IDs to their corresponding order IDs
        $auctionOrderMap = $orders->mapWithKeys(function ($order) {
            return [$order->auction_id => $order->id];
        });

        return response()->json([
            'status' => 'success',
            'data' => $auctionOrderMap
        ]);
    }
}