<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CompanyProfileController;
use App\Http\Controllers\TobaccoListingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuctionController;
use App\Http\Controllers\BidController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\NotificationController;


// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get("/", function () {
    return response()->json([
        "message" => "Welcome to the API"
    ]);
});


// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get("/logout", [AuthController::class, 'logout']);
    Route::get("/user", function (Request $request) {
        return response()->json([
            'user' => $request->user()
        ]);
    });

    Route::get('/auctions/won', [AuctionController::class, 'wonAuctions']);

    // Company profile routes
    Route::prefix('company_profile')->group(function () {
        Route::post('/', [CompanyProfileController::class, 'store']);
        Route::get('/', [CompanyProfileController::class, 'show']);
        Route::put('/', [CompanyProfileController::class, 'update']);
        Route::post('/{id}/verify', [CompanyProfileController::class, 'verify']);
        Route::get('/all', [CompanyProfileController::class, 'showAll']);
    });

    // Tobacco listing routes
    Route::prefix('tobacco_listings')->group(function () {
        Route::get('/', [TobaccoListingController::class, 'index']);
        Route::post('/', [TobaccoListingController::class, 'store']);
        // Place specific routes BEFORE wildcard routes
        Route::get('/timb', [TobaccoListingController::class, 'showTimbOfficer']);
        // Routes with parameters come AFTER specific routes
        Route::get('/{id}', [TobaccoListingController::class, 'show']);
        Route::put('/{id}', [TobaccoListingController::class, 'update']);
        Route::post('/{id}/timb_clearance', [TobaccoListingController::class, 'timbClearance']);
    });

    Route::prefix('auctions')->group(function () {
        // Auction routes
        Route::get('/', [AuctionController::class, 'index']);
        Route::post('/', [AuctionController::class, 'store']);
        Route::get('/{id}', [AuctionController::class, 'show']);
        Route::put('/{id}', [AuctionController::class, 'update']);
        Route::post('/{id}/cancel', [AuctionController::class, 'cancel']);
        Route::post('/{id}/end', [AuctionController::class, 'end']);

        // Bid routes
        Route::get('/{auction_id}/bids', [BidController::class, 'index']);
        Route::post('/{auction_id}/bids', [BidController::class, 'store']);
    });

    // Order routes
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::put('/{id}', [OrderController::class, 'update']);

        // Transaction routes
        Route::post('/{order_id}/transactions', [TransactionController::class, 'store']);
        Route::get('/{order_id}/transactions/{transaction_id}', [TransactionController::class, 'show']);
    });

    // Notification routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });
});
