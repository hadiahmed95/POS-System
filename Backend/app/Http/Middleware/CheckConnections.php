<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckConnections
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $errors = [];
        if( !checkInternetConnection()) {
            $errors[] = "No internet connection";
        }
        if( !checkDatabaseConnection() ) {
            $errors[] = "Database connection failed";
        }
        if( count($errors) > 0 ) {
            return setApiResponse(0, "Something went wrong. Please try again!", 400, $errors);
        }
        return $next($request);
    }
}
