<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyProfile extends Model
{
    //
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'trading_name',
        'company_registration_number',
        'bp_number',
        'zimra_number',
        'physical_address',
        'city',
        'contact_person',
        'contact_phone',
        'contact_email',
        'business_type',
        'license_expiry_date',
        'is_verified'
    ];

    public function casts(): array
    {
        return [
            'is_verified' => 'boolean',
            'license_expiry_date' => 'date',
        ];
    }


    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
