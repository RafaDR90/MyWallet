<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ApiCsrfMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->is('api/*')) {
            return $next($request);
        }

        return $next($request);
    }
} 