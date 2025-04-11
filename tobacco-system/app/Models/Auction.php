<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    //
    use HasFactory;

    protected $fillable = [
        'tobacco_listing_id',
        'user_id',
        'starting_price',
        'current_price',
        'reserve_price',
        'start_time',
        'end_time',
        'status',
        'winner_id'
    ];

    public function casts(): array
    {
        return [
            'starting_price' => 'decimal:2',
            'current_price' => 'decimal:2',
            'reserve_price' => 'decimal:2',
            'start_time' => 'datetime',
            'end_time' => 'datetime',
        ];
    }

    public function tobaccoListing()
    {
        return $this->belongsTo(TobaccoListing::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function winner()
    {
        return $this->belongsTo(User::class, 'winner_id');
    }

    public function bids()
    {
        return $this->hasMany(Bid::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
