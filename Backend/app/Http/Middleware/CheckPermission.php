<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        $user = User::where('token', $token)->first();

        $get_permissions = getPermissions($user->id);
        $full_url = $request->fullUrl();
        $url_array = explode("/", $full_url);
        $permission_name = $url_array[4];
        $module_name = $url_array[5];
        $decoded_data = json_decode($get_permissions->getContent(), true)['data'];
        if( isset($decoded_data[$module_name]) && isset($decoded_data[$module_name][$permission_name]) && $decoded_data[$module_name][$permission_name] == 1 ) {
            return $next($request);
        }
        return setApiResponse(0, "You don't have permission to access this resource!", 403);
    }
}
