<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'auction_id',
        'buyer_id',
        'seller_id',
        'amount',
        'status',
        'order_number',
        'delivery_instructions',
        'delivery_date',
        'delivery_status'
    ];


    public function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'delivery_date' => 'datetime'
        ];
    }

    public function auction()
    {
        return $this->belongsTo(Auction::class);
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}