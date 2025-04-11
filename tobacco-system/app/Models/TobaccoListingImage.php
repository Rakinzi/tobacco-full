<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TobaccoListingImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'tobacco_listing_id',
        'image_path'
    ];

    public function tobaccoListing()
    {
        return $this->belongsTo(TobaccoListing::class);
    }
}