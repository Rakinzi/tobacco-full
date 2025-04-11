<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // Register a new user  
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|confirmed',
            'phone_number' => 'nullable|string',
            'user_type' => 'required|in:admin,trader,buyer,timb_officer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                "errors" => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'user_type' => $request->user_type,
            'password' => Hash::make($request->password),
            "is_active" => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            "message" => "User registered successfully",
            "user" => $user,
            "token" => $token
        ], 201);
    }

    // Login user

    public function login(Request $request){
        $validator = Validator::make($request->all(),[
            'email' => 'required|email|string',
            'password' => 'required|string',
        ]);

        if($validator->fails()){
            return response()->json([
                'status' => 'error',
                "errors" => $validator->errors()
            ], 422);
        }

        $user = User::where('email',$request->email)->first();

        if(!$user || !Hash::check($request->password, $user->password)){
            return response()->json([
                'status' => 'error',
                "message" => "Invalid credentials"
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'status' => 'error',
                "message" => "User account is not active"
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            "message" => "User logged in successfully",
            "user" => $user,
            "token" => $token
        ], 200);
    }

    // Logout user

    public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            "message" => "User logged out successfully"
        ]);
    }
}
