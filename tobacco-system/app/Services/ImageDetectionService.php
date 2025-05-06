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
            // Prepare multipart form data
            $multipart = [];
            
            // Add images to multipart request
            foreach ($imagePaths as $index => $imagePath) {
                // Get full path of the image
                $fullPath = Storage::path($imagePath);
                
                // Create multipart item for each image
                $multipart[] = [
                    'name' => 'images[]',
                    'contents' => fopen($fullPath, 'r'),
                    'filename' => basename($fullPath)
                ];
            }

            // Add listing ID to the request
            $multipart[] = [
                'name' => 'listing_id',
                'contents' => $listingId
            ];

            // Send request to Python backend
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . config('services.python_backend.token')
            ])->attach($multipart)
              ->post(config('services.python_backend.url') . '/detect', $multipart);

            // Log the response
            Log::info('Python Detection Response', [
                'status' => $response->status(),
                'body' => $response->body()
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