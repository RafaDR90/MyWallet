<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\MonthlyBudget;
use Illuminate\Http\Request;

class MonthlyBudgetController extends Controller
{
    /**
     * Obtener todos los presupuestos mensuales del usuario
     */
    public function index(Request $request)
    {
        $budgets = MonthlyBudget::where('user_id', $request->user()->id)
            ->orderBy('mes', 'desc')
            ->get();

        return response()->json($budgets);
    }

    /**
     * Crear un nuevo presupuesto mensual
     */
    public function store(Request $request)
    {
        $request->validate([
            'monto' => 'required|numeric|min:0',
            'mes' => 'required|date|date_format:Y-m-d',
        ]);

        // Verificar si ya existe un presupuesto activo para ese mes
        $existingBudget = MonthlyBudget::where('user_id', $request->user()->id)
            ->whereYear('mes', date('Y', strtotime($request->mes)))
            ->whereMonth('mes', date('m', strtotime($request->mes)))
            ->where('activo', true)
            ->first();

        if ($existingBudget) {
            return response()->json([
                'message' => 'Ya existe un presupuesto activo para este mes'
            ], 422);
        }

        $budget = new MonthlyBudget();
        $budget->user_id = $request->user()->id;
        $budget->monto = $request->monto;
        $budget->mes = $request->mes;
        $budget->activo = true;
        $budget->save();

        return response()->json($budget, 201);
    }

    /**
     * Eliminar un presupuesto mensual
     */
    public function destroy(Request $request, MonthlyBudget $monthlyBudget)
    {
        // Verificar que pertenezca al usuario
        if ($monthlyBudget->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        $monthlyBudget->delete();

        return response()->json([
            'message' => 'Presupuesto mensual eliminado correctamente'
        ]);
    }
}
