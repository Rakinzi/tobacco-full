<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        "phone_number",
        "user_type",
        "is_active",
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function companyProfile()
    {
        return $this->hasOne(CompanyProfile::class);
    }

    public function tobaccoListings()
    {
        return $this->hasMany(TobaccoListing::class);
    }

    public function wonAuctions()
    {
        return $this->hasMany(Auction::class, 'winner_id');
    }

    public function bids()
    {
        return $this->hasMany(Bid::class);
    }

    public function buyerOrders()
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    /**
     * Get orders where user is seller
     */
    public function sellerOrders()
    {
        return $this->hasMany(Order::class, 'seller_id');
    }
}
