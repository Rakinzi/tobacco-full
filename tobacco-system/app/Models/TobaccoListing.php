<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TobaccoListing extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_profile_id',
        'batch_number',
        'tobacco_type',
        'quantity',
        'grade',
        'region_grown',
        'season_grown',
        'description',
        'minimum_price',
        'timb_cleared',
        'timb_cleared_at',
        'timb_certificate_number',
        'status'
    ];

    public function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'minimum_price' => 'decimal:2',
            'timb_cleared' => 'boolean',
            'timb_cleared_at' => 'datetime'
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function companyProfile()
    {
        return $this->belongsTo(CompanyProfile::class);
    }

    public function images()
    {
        return $this->hasMany(TobaccoListingImage::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCleared($query)
    {
        return $query->where('timb_cleared', true);
    }
}