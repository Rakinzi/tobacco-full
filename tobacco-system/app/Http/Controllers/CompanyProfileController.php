<?php

namespace App\Http\Controllers;

use App\Models\CompanyProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanyProfileController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255',
            'trading_name' => 'nullable|string|max:255',
            'company_registration_number' => 'required|string|unique:company_profiles',
            'bp_number' => 'nullable|string|unique:company_profiles',
            'zimra_number' => 'required|string|unique:company_profiles',
            'physical_address' => 'required|string',
            'city' => 'required|string',
            'contact_person' => 'required|string',
            'contact_phone' => 'required|string',
            'contact_email' => 'required|email',
            'business_type' => 'required|in:auction_floor,contractor,merchant',
            'license_expiry_date' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $profile = auth()->user()->companyProfile()->create($validator->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Company profile created successfully',
            'data' => $profile
        ], 201);
    }

    public function show()
    {
        $profile = auth()->user()->companyProfile;

        if (!$profile) {
            return response()->json([
                'status' => 'error',
                'message' => 'Company profile not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $profile
        ]);
    }

    public function showAll(){

        if(auth()->user()->user_type !== 'admin'){
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $profiles = CompanyProfile::all();

        return response()->json([
            'status' => 'success',
            'data' => $profiles
        ]);
    }

    public function update(Request $request)
    {
        $profile = auth()->user()->companyProfile;

        if (!$profile) {
            return response()->json([
                'status' => 'error',
                'message' => 'Company profile not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'company_name' => 'sometimes|string|max:255',
            'trading_name' => 'sometimes|nullable|string|max:255',
            'company_registration_number' => 'sometimes|string|unique:company_profiles,company_registration_number,' . $profile->id,
            'bp_number' => 'sometimes|nullable|string|unique:company_profiles,bp_number,' . $profile->id,
            'zimra_number' => 'sometimes|string|unique:company_profiles,zimra_number,' . $profile->id,
            'physical_address' => 'sometimes|string',
            'city' => 'sometimes|string',
            'contact_person' => 'sometimes|string',
            'contact_phone' => 'sometimes|string',
            'contact_email' => 'sometimes|email',
            'business_type' => 'sometimes|in:auction_floor,contractor,merchant',
            'license_expiry_date' => 'sometimes|nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $profile->update($validator->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Company profile updated successfully',
            'data' => $profile
        ]);
    }

    public function verify($id)
    {
        if (auth()->user()->user_type !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $profile = CompanyProfile::findOrFail($id);
        
        if ($profile->is_verified) {
            return response()->json([
                'status' => 'error',
                'message' => 'Company profile is already verified'
            ], 422);
        }

        $profile->update(['is_verified' => true]);

        return response()->json([
            'status' => 'success',
            'message' => 'Company profile verified successfully',
            'data' => $profile
        ]);
    }
}