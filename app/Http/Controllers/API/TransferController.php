<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Balance;
use App\Models\TransferRecord;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; 
use App\Models\Transfer;

class TransferController extends Controller
{
    /**
     * Obtener historial de transferencias
     */
    public function index(Request $request)
    {
        $transfers = TransferRecord::where('user_id', $request->user()->id)
            ->orderBy('fecha', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($transfers);
    }

    /**
     * Realizar una transferencia entre banco y cajón
     */
    public function store(Request $request)
    {
        $request->validate([
            'cantidad' => 'required|numeric|min:0.01',
            'tipo' => 'required|in:banco_a_cajon,cajon_a_banco',
            'descripcion' => 'nullable|string|max:255'
        ]);

        try {
            DB::beginTransaction();

            $balance = Balance::where('user_id', $request->user()->id)->firstOrFail();
            
            // Guardar valores anteriores
            $bancoAnterior = $balance->banco;
            $cajonAnterior = $balance->cajon;

            // Realizar la transferencia
            if ($request->tipo === 'banco_a_cajon') {
                if ($balance->banco < $request->cantidad) {
                    throw new \Exception('Fondos insuficientes en el banco');
                }
                $balance->banco -= $request->cantidad;
                $balance->cajon += $request->cantidad;
            } else {
                if ($balance->cajon < $request->cantidad) {
                    throw new \Exception('Fondos insuficientes en el cajón');
                }
                $balance->cajon -= $request->cantidad;
                $balance->banco += $request->cantidad;
            }

            $balance->save();

            // Registrar la transferencia
            $transfer = new TransferRecord([
                'user_id' => $request->user()->id,
                'cantidad' => $request->cantidad,
                'banco_anterior' => $bancoAnterior,
                'cajon_anterior' => $cajonAnterior,
                'banco_posterior' => $balance->banco,
                'cajon_posterior' => $balance->cajon,
                'descripcion' => $request->descripcion ?: 'Transferencia',
                'tipo' => $request->tipo,
                'fecha' => now()
            ]);

            $transfer->save();

            DB::commit();

            return response()->json([
                'transfer' => $transfer,
                'balance' => $balance
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Eliminar un registro de transferencia
     */
    public function destroy(Request $request, TransferRecord $transfer)
    {
        try {
            DB::beginTransaction();

            // Verificar si la transferencia pertenece al usuario
            if ($transfer->user_id !== $request->user()->id) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            // Obtener las últimas 10 transferencias del usuario
            $lastTransfers = TransferRecord::where('user_id', $request->user()->id)
                ->orderBy('fecha', 'desc')
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();

            // Verificar si la transferencia está entre las últimas 10
            if (!$lastTransfers->contains($transfer)) {
                return response()->json([
                    'message' => 'Solo se pueden eliminar las últimas 10 transferencias'
                ], 422);
            }

            // Obtener el balance actual
            $balance = Balance::where('user_id', $request->user()->id)->firstOrFail();

            // Revertir la transferencia basándose en el tipo
            if ($transfer->tipo === 'banco_a_cajon') {
                $balance->banco += $transfer->cantidad;
                $balance->cajon -= $transfer->cantidad;
            } else {
                $balance->banco -= $transfer->cantidad;
                $balance->cajon += $transfer->cantidad;
            }

            $balance->save();

            // Actualizar las transferencias posteriores
            $transfersPosterior = TransferRecord::where('user_id', $request->user()->id)
                ->where('fecha', '>=', $transfer->fecha)
                ->where('created_at', '>', $transfer->created_at)
                ->orderBy('fecha', 'asc')
                ->orderBy('created_at', 'asc')
                ->get();

            foreach ($transfersPosterior as $transferPost) {
                if ($transfer->tipo === 'banco_a_cajon') {
                    // Si la transferencia eliminada era banco_a_cajon
                    $transferPost->banco_anterior += $transfer->cantidad;
                    $transferPost->banco_posterior += $transfer->cantidad;
                    $transferPost->cajon_anterior -= $transfer->cantidad;
                    $transferPost->cajon_posterior -= $transfer->cantidad;
                } else {
                    // Si la transferencia eliminada era cajon_a_banco
                    $transferPost->banco_anterior -= $transfer->cantidad;
                    $transferPost->banco_posterior -= $transfer->cantidad;
                    $transferPost->cajon_anterior += $transfer->cantidad;
                    $transferPost->cajon_posterior += $transfer->cantidad;
                }
                $transferPost->save();
            }

            // Actualizar los gastos posteriores
            $gastosPosterior = Expense::where('user_id', $request->user()->id)
                ->where('fecha', '>=', $transfer->fecha)
                ->where('created_at', '>', $transfer->created_at)
                ->orderBy('fecha', 'asc')
                ->orderBy('created_at', 'asc')
                ->get();

            foreach ($gastosPosterior as $gasto) {
                if ($transfer->tipo === 'banco_a_cajon') {
                    $gasto->cajon_posterior -= $transfer->cantidad;
                } else {
                    $gasto->cajon_posterior += $transfer->cantidad;
                }
                $gasto->save();
            }

            // Eliminar la transferencia
            $transfer->delete();

            DB::commit();

            return response()->json([
                'message' => 'Transferencia eliminada correctamente',
                'balance' => $balance
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar la transferencia: ' . $e->getMessage()
            ], 500);
        }
    }
}
