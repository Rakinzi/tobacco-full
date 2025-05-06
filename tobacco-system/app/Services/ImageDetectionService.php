<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImageDetectionService
{
    /**
     * Send images to Python backend for tobacco detection
     * 
     * @param array $imagePaths Array of image paths
     * @param int $listingId Tobacco listing ID
     * @return bool
     */
    public function sendImagesToPythonDetection(array $imagePaths, $listingId)
    {
        try {
            // Python endpoint URL from config
            $pythonUrl = config('services.python_backend.url') . '/detect';
            $token = config('services.python_backend.token');
            
            // Prepare multipart form data
            $multipart = [];
            
            // Add images to multipart request
            foreach ($imagePaths as $index => $imagePath) {
                // Get full path of the image in storage
                $fullPath = Storage::disk('public')->path($imagePath);
                
                if (!file_exists($fullPath)) {
                    Log::warning("Image not found at path: {$fullPath}");
                    continue;
                }
                
                // Create multipart item for each image
                $multipart[] = [
                    'name' => 'images[]',
                    'contents' => fopen($fullPath, 'r'),
                    'filename' => basename($fullPath)
                ];
            }

            if (empty($multipart)) {
                Log::warning("No valid images found for listing ID: {$listingId}");
                return false;
            }

            // Add listing ID to the request
            $multipart[] = [
                'name' => 'listing_id',
                'contents' => $listingId
            ];

            // Send request to Python backend
            $response = Http::withToken($token)
                ->acceptJson()
                ->timeout(30) // Increase timeout for image processing
                ->withOptions(['verify' => false]) // For local development, disable SSL verification
                ->post($pythonUrl, [
                    'multipart' => $multipart
                ]);

            // Log the response
            Log::info('Python Detection Response', [
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            // Check if the request was successful
            return $response->successful();

        } catch (\Exception $e) {
            // Log any errors
            Log::error('Error sending images to Python backend', [
                'message' => $e->getMessage(),
                'listing_id' => $listingId
            ]);

            return false;
        }
    }
}