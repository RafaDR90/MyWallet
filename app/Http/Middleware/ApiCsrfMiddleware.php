<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class ApiCsrfMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->is('api/*')) {
            // Desactivar completamente la verificación CSRF para rutas API
            Session::forget('_token');
            $request->headers->set('X-CSRF-TOKEN', null);
            $request->headers->set('X-Requested-With', 'XMLHttpRequest');
            return $next($request);
        }

        return $next($request);
    }
} 