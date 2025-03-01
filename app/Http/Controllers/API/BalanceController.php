<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Balance;
use App\Models\BankDeposit;
use Illuminate\Support\Facades\DB;

class BalanceController extends Controller
{
    /**
     * Mostrar el balance del usuario
     */
    public function show(Request $request)
    {
        $balance = Balance::where('user_id', $request->user()->id)->first();
        
        if (!$balance) {
            $balance = Balance::create([
                'user_id' => $request->user()->id,
                'banco' => 0,
                'cajon' => 0
            ]);
        }

        return response()->json($balance);
    }

    /**
     * Actualizar el balance del usuario
     */
    public function update(Request $request)
    {
        $request->validate([
            'banco' => 'required|numeric|min:0',
            'cajon' => 'required|numeric|min:0',
        ]);

        $balance = Balance::where('user_id', $request->user()->id)->first();
        
        if (!$balance) {
            $balance = new Balance();
            $balance->user_id = $request->user()->id;
        }

        $balance->banco = $request->banco;
        $balance->cajon = $request->cajon;
        $balance->save();

        return response()->json($balance);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Añadir dinero al banco
     */
    public function addToBanco(Request $request)
    {
        $request->validate([
            'cantidad' => 'required|numeric|min:0.01',
            'descripcion' => 'required|string|max:255'
        ]);

        try {
            DB::beginTransaction();

            $balance = Balance::where('user_id', $request->user()->id)->first();
            
            if (!$balance) {
                $balance = new Balance();
                $balance->user_id = $request->user()->id;
                $balance->cajon = 0;
                $balance->banco = 0;
            }

            $balanceAnterior = $balance->banco;
            $balance->banco += $request->cantidad;
            $balance->save();

            // Registrar el depósito con tipo 'banco'
            BankDeposit::create([
                'user_id' => $request->user()->id,
                'tipo' => 'banco',
                'cantidad' => $request->cantidad,
                'balance_anterior' => $balanceAnterior,
                'balance_posterior' => $balance->banco,
                'descripcion' => $request->descripcion,
                'fecha' => now()
            ]);

            DB::commit();

            return response()->json([
                'balance' => $balance,
                'deposito' => [
                    'cantidad' => $request->cantidad,
                    'balance_anterior' => $balanceAnterior,
                    'balance_actual' => $balance->banco,
                    'descripcion' => $request->descripcion,
                    'tipo' => 'banco'
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al procesar el depósito'
            ], 500);
        }
    }

    /**
     * Añadir dinero al cajón
     */
    public function addToCajon(Request $request)
    {
        $request->validate([
            'cantidad' => 'required|numeric|min:0.01',
            'descripcion' => 'required|string|max:255'
        ]);

        try {
            DB::beginTransaction();

            $balance = Balance::where('user_id', $request->user()->id)->first();
            
            if (!$balance) {
                $balance = new Balance();
                $balance->user_id = $request->user()->id;
                $balance->cajon = 0;
                $balance->banco = 0;
            }

            $balanceAnterior = $balance->cajon;
            $balance->cajon += $request->cantidad;
            $balance->save();

            // Registrar el depósito con tipo 'cartera'
            BankDeposit::create([
                'user_id' => $request->user()->id,
                'tipo' => 'cartera',
                'cantidad' => $request->cantidad,
                'balance_anterior' => $balanceAnterior,
                'balance_posterior' => $balance->cajon,
                'descripcion' => $request->descripcion,
                'fecha' => now()
            ]);

            DB::commit();

            return response()->json([
                'balance' => $balance,
                'deposito' => [
                    'cantidad' => $request->cantidad,
                    'balance_anterior' => $balanceAnterior,
                    'balance_actual' => $balance->cajon,
                    'descripcion' => $request->descripcion,
                    'tipo' => 'cartera'
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al procesar el depósito'
            ], 500);
        }
    }

    /**
     * Ver historial de depósitos
     */
    public function depositHistory(Request $request)
    {
        $deposits = BankDeposit::where('user_id', $request->user()->id)
            ->orderBy('fecha', 'desc')
            ->get();

        return response()->json($deposits);
    }
}
