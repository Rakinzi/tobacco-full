<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'transaction_reference',
        'amount',
        'type',
        'status',
        'payment_method',
        'payment_gateway',
        'payment_details',
        'notes'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_details' => 'json'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}