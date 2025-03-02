<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ApiCsrfMiddleware
{
    protected $except = [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout'
    ];

    public function handle(Request $request, Closure $next)
    {
        // Si la ruta coincide con alguna de las excepciones
        foreach ($this->except as $excluded) {
            if ($request->is($excluded)) {
                // Añadir headers necesarios para API
                $request->headers->set('Accept', 'application/json');
                $request->headers->set('X-Requested-With', 'XMLHttpRequest');
                
                // Bypass CSRF para rutas API
                return $next($request);
            }
        }

        // Para otras rutas, continuar con la verificación normal
        return $next($request);
    }
} 