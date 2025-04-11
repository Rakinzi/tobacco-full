<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    public function store(Request $request, $order_id)
    {
        $order = Order::findOrFail($order_id);

        // Only buyer can initiate payment
        if ($order->buyer_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only buyer can initiate payment'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'payment_method' => 'required|string',
            'payment_gateway' => 'required|string',
            'payment_details' => 'required|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create transaction
        $transaction = Transaction::create([
            'order_id' => $order->id,
            'transaction_reference' => 'TXN-' . Str::random(10),
            'amount' => $order->amount,
            'type' => 'payment',
            'status' => 'pending',
            'payment_method' => $request->payment_method,
            'payment_gateway' => $request->payment_gateway,
            'payment_details' => $request->payment_details
        ]);

        // Here you would integrate with actual payment gateway
        // For now, we'll just mark it as processing
        $transaction->update(['status' => 'processing']);

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction initiated successfully',
            'data' => $transaction
        ], 201);
    }

    public function show($order_id, $transaction_id)
    {
        $transaction = Transaction::with('order')
            ->where('order_id', $order_id)
            ->findOrFail($transaction_id);

        // Check if user is buyer, seller or admin
        if (!in_array(auth()->id(), [$transaction->order->buyer_id, $transaction->order->seller_id]) && 
            auth()->user()->user_type !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view this transaction'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $transaction
        ]);
    }

    // This would be called by payment gateway webhook
    public function webhook(Request $request, $transaction_id)
    {
        $transaction = Transaction::findOrFail($transaction_id);
        
        // Verify webhook signature/authenticity
        // Update transaction status based on webhook data
        // Update order status if payment is completed
        
        return response()->json([
            'status' => 'success',
            'message' => 'Webhook processed'
        ]);
    }
}