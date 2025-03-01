<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ExpenseType;
use Illuminate\Http\Request;

class ExpenseTypeController extends Controller
{
    /**
     * Obtener todos los tipos de gastos (predeterminados y del usuario)
     */
    public function index(Request $request)
    {
        $expenseTypes = ExpenseType::where(function($query) use ($request) {
            $query->where('is_default', true)
                  ->orWhere('user_id', $request->user()->id);
        })->get();

        return response()->json($expenseTypes);
    }

    /**
     * Crear un nuevo tipo de gasto personalizado
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
        ]);

        $expenseType = new ExpenseType();
        $expenseType->nombre = $request->nombre;
        $expenseType->user_id = $request->user()->id;
        $expenseType->is_default = false;
        $expenseType->save();

        return response()->json($expenseType, 201);
    }

    /**
     * Eliminar un tipo de gasto personalizado
     */
    public function destroy(Request $request, ExpenseType $expenseType)
    {
        // Verificar que no sea un tipo predeterminado
        if ($expenseType->is_default) {
            return response()->json([
                'message' => 'No se pueden eliminar tipos de gastos predeterminados'
            ], 403);
        }

        // Verificar que pertenezca al usuario
        if ($expenseType->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        // Verificar si hay gastos asociados
        if ($expenseType->expenses()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar un tipo de gasto que tiene gastos asociados'
            ], 422);
        }

        $expenseType->delete();

        return response()->json([
            'message' => 'Tipo de gasto eliminado correctamente'
        ]);
    }
}
