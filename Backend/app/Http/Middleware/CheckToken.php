<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
// use Symfony\Component\HttpFoundation\Response;
use App\Models\User;
use Illuminate\Support\Facades\Response;

class CheckToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $request->header('Authorization');

        // If no token is found in the header, return an error
        if( !$token ) {
            return Response::json([
                "error" => "Token not provided."
            ], 401);
        }

        // Remove "Bearer " prefix from the token (if present)
        if (strpos($token, 'Bearer ') === 0) {
            $token = substr($token, 7); // Get the token value without the "Bearer "
        }

        // Check if the token exists in the database and is associated with a valid user
        $user = User::where('token', $token)->first();

        if(!$user) {
            return Response::json([
                "error" => "Invalid token."
            ], 401);
        }

        // Store the user data on the request
        $request->attributes->set('user', $user);

        // If the token is valid, pass the request to the next middleware or controller
        return $next($request);
    }
}
