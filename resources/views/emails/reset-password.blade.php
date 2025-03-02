<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #1a1a1a;
            color: #ffffff;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
            font-size: 24px;
            font-weight: bold;
            color: #6366f1;
        }
        .card {
            background: #2a2a2a;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            color: #ffffff;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #6366f1;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
            text-align: center;
        }
        .button:hover {
            background-color: #5558e6;
        }
        .footer {
            text-align: center;
            font-size: 0.9em;
            color: #888;
            margin-top: 30px;
        }
        .warning {
            font-size: 0.85em;
            color: #888;
            margin-top: 20px;
            padding: 10px;
            border: 1px solid #888;
            border-radius: 6px;
        }
        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            MyWallet
        </div>
        
        <div class="card">
            <h2 style="margin-top: 0; color: #6366f1;">Restablecer Contraseña</h2>
            
            <p style="color: #ffffff;">Hola,</p>
            
            <p style="color: #ffffff;">Recibimos una solicitud para restablecer la contraseña de tu cuenta en MyWallet. 
               Si no realizaste esta solicitud, puedes ignorar este correo.</p>
            
            <div class="text-center">
                <a href="{{ $url }}" class="button">
                    Restablecer mi contraseña
                </a>
            </div>
            
            <div class="warning">
                <strong>Nota de seguridad:</strong><br>
                - Este enlace expirará en 60 minutos.<br>
                - Si no solicitaste este cambio, te recomendamos cambiar tu contraseña por seguridad.
            </div>
        </div>
        
        <div class="footer">
            <p>© {{ date('Y') }} MyWallet. Todos los derechos reservados.</p>
            <p style="font-size: 0.8em;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
    </div>
</body>
</html> 