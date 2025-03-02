<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ApiCsrfMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->is('api/*')) {
            // Bypass CSRF check for API routes
            $request->attributes->set('csrf_bypass', true);
            return $next($request);
        }

        // For non-API routes, continue with normal CSRF protection
        return $next($request);
    }
} 