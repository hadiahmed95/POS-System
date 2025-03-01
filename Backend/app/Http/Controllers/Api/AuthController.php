<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request) {
        if( !$request->has('email') || !$request->has('password') ) {
            $response = setApiResponse(0, "Missing email or password!", 400);
        }
        else {
            $user = User::where("email", $request->email)
                    ->with("branch", "role", "permissions")
                    ->first();

            if(empty($user)) {
                $response = setApiResponse(0, "Invalid credentials!", 403);
            }
            else {
                if( !Hash::check($request->password, $user->password) ) {
                    $response = setApiResponse(0, "Invalid credentials!", 403);
                }
                else {
                    $token = Hash::make($request->email . $request->password);
                    $user->token = $token;
                    $user->save();
    
                    $response = setApiResponse(1, "Login successful!", 200, $user);
                }
            }
        }
        
        return $response;
    }

    public function logout(Request $request) {
        if(!$request->has('user_id')) {
            $response = setApiResponse(0, "Missing user id", 400);
        }
        else {
            $user = User::where("id", $request->user_id)->first();
            $user->token = null;
            $user->save();
            $response = setApiResponse(1, "Logout successful!", 200);
        }

        return $response;
    }
}
