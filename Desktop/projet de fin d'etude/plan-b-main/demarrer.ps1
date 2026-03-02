# Script de demarrage - Plan B
# Application de petites annonces immobilieres

$Host.UI.RawUI.WindowTitle = "Plan B - Demarrage"

# Chemin racine du projet
$ROOT_PATH = "c:\Users\ST Pierre\Downloads\plan-b-projet\plan-b-main"
$BACKEND_PATH = "$ROOT_PATH\planb-backend"
$FRONTEND_PATH = "$ROOT_PATH\planb-frontend"
$SOCKETIO_PATH = "$ROOT_PATH\planb-socketio-server"

# Ports
$BACKEND_PORT = 8000
$FRONTEND_PORT = 5173
$SOCKETIO_PORT = 3001
$MAILPIT_HTTP_PORT = 8025
$MAILPIT_SMTP_PORT = 1025

function Write-Banner {
    Write-Host ""
    Write-Host "  =========================================" -ForegroundColor Cyan
    Write-Host "              PLAN B                       " -ForegroundColor Cyan
    Write-Host "     Plateforme d annonces immobilieres    " -ForegroundColor Cyan
    Write-Host "  =========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

function Stop-ProcessOnPort {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $processIds) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                Write-Host "  [OK] Processus sur le port $Port arrete" -ForegroundColor Yellow
            } catch {}
        }
        Start-Sleep -Seconds 1
    }
}

function Start-BackendServer {
    Write-Host ""
    Write-Host "  -----------------------------------------" -ForegroundColor Cyan
    Write-Host "  [1/3] BACKEND - PHP/Symfony (Port $BACKEND_PORT)" -ForegroundColor White
    Write-Host "  -----------------------------------------" -ForegroundColor Cyan
    
    if (Test-Port $BACKEND_PORT) {
        Write-Host "  [!] Port $BACKEND_PORT deja utilise" -ForegroundColor Yellow
        $response = Read-Host "  Arreter le processus existant? (O/n)"
        if ($response -ne "n") {
            Stop-ProcessOnPort $BACKEND_PORT
        } else {
            Write-Host "  [OK] Backend existant conserve" -ForegroundColor Green
            return
        }
    }
    
    # Verifier PHP
    try {
        $phpVersion = php -v 2>&1 | Select-Object -First 1
        Write-Host "  [OK] $phpVersion" -ForegroundColor Green
    } catch {
        Write-Host "  [ERREUR] PHP n est pas installe" -ForegroundColor Red
        return
    }
    
    # Demarrer le serveur PHP
    Write-Host "  [*] Demarrage du serveur..." -ForegroundColor Cyan
    $backendCmd = "cd `"$BACKEND_PATH`"; php -S localhost:$BACKEND_PORT -t public"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Minimized
    
    Start-Sleep -Seconds 2
    
    if (Test-Port $BACKEND_PORT) {
        Write-Host "  [OK] Backend demarre sur http://localhost:$BACKEND_PORT" -ForegroundColor Green
    } else {
        Write-Host "  [!] Verifiez la fenetre Backend" -ForegroundColor Yellow
    }
}

function Start-Mailpit {
    Write-Host "" 
    Write-Host "  -----------------------------------------" -ForegroundColor Cyan
    Write-Host "  [0/3] EMAIL - Mailpit (Ports $MAILPIT_HTTP_PORT/$MAILPIT_SMTP_PORT)" -ForegroundColor White
    Write-Host "  -----------------------------------------" -ForegroundColor Cyan

    $mailpitCmd = Get-Command mailpit -ErrorAction SilentlyContinue
    if (-not $mailpitCmd) {
        Write-Host "  [!] Mailpit non trouvé (optionnel)." -ForegroundColor Yellow
        Write-Host "      Pour l'installer: choco install mailpit" -ForegroundColor Gray
        Write-Host "      Puis configurer MAILER_DSN=smtp://127.0.0.1:$MAILPIT_SMTP_PORT dans planb-backend/.env.local" -ForegroundColor Gray
        return
    }

    if (Test-Port $MAILPIT_HTTP_PORT) {
        Write-Host "  [OK] Mailpit déjà démarré: http://localhost:$MAILPIT_HTTP_PORT" -ForegroundColor Green
        return
    }

    Write-Host "  [*] Démarrage de Mailpit..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "mailpit" -WindowStyle Minimized

    Start-Sleep -Seconds 2
    if (Test-Port $MAILPIT_HTTP_PORT) {
        Write-Host "  [OK] Mailpit: http://localhost:$MAILPIT_HTTP_PORT" -ForegroundColor Green
    } else {
        Write-Host "  [!] Vérifiez la fenêtre Mailpit" -ForegroundColor Yellow
    }
}

function Start-FrontendServer {
    Write-Host ""
    Write-Host "  -----------------------------------------" -ForegroundColor Cyan
    Write-Host "  [2/3] FRONTEND - React/Vite (Port $FRONTEND_PORT)" -ForegroundColor White
    Write-Host "  -----------------------------------------" -ForegroundColor Cyan
    
    if (Test-Port $FRONTEND_PORT) {
        Write-Host "  [!] Port $FRONTEND_PORT deja utilise" -ForegroundColor Yellow
        $response = Read-Host "  Arreter le processus existant? (O/n)"
        if ($response -ne "n") {
            Stop-ProcessOnPort $FRONTEND_PORT
        } else {
            Write-Host "  [OK] Frontend existant conserve" -ForegroundColor Green
            return
        }
    }
    
    # Verifier Node.js
    try {
        $nodeVersion = node -v 2>&1
        Write-Host "  [OK] Node.js $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "  [ERREUR] Node.js n est pas installe" -ForegroundColor Red
        return
    }
    
    # Verifier si node_modules existe
    if (-not (Test-Path "$FRONTEND_PATH\node_modules")) {
        Write-Host "  [*] Installation des dependances..." -ForegroundColor Yellow
        Push-Location $FRONTEND_PATH
        npm install
        Pop-Location
    }
    
    # Demarrer Vite
    Write-Host "  [*] Demarrage du serveur..." -ForegroundColor Cyan
    $frontendCmd = "cd `"$FRONTEND_PATH`"; npm run dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Minimized
    
    Start-Sleep -Seconds 3
    
    if (Test-Port $FRONTEND_PORT) {
        Write-Host "  [OK] Frontend demarre sur http://localhost:$FRONTEND_PORT" -ForegroundColor Green
    } else {
        Write-Host "  [!] Verifiez la fenetre Frontend" -ForegroundColor Yellow
    }
}

function Start-SocketIOServer {
    Write-Host ""
    Write-Host "  -----------------------------------------" -ForegroundColor Cyan
    Write-Host "  [3/3] SOCKET.IO - Chat temps reel (Port $SOCKETIO_PORT)" -ForegroundColor White
    Write-Host "  -----------------------------------------" -ForegroundColor Cyan
    
    if (Test-Port $SOCKETIO_PORT) {
        Write-Host "  [!] Port $SOCKETIO_PORT deja utilise" -ForegroundColor Yellow
        $response = Read-Host "  Arreter le processus existant? (O/n)"
        if ($response -ne "n") {
            Stop-ProcessOnPort $SOCKETIO_PORT
        } else {
            Write-Host "  [OK] Socket.IO existant conserve" -ForegroundColor Green
            return
        }
    }
    
    # Verifier si node_modules existe
    if (-not (Test-Path "$SOCKETIO_PATH\node_modules")) {
        Write-Host "  [*] Installation des dependances..." -ForegroundColor Yellow
        Push-Location $SOCKETIO_PATH
        npm install
        Pop-Location
    }
    
    # Demarrer Socket.IO
    Write-Host "  [*] Demarrage du serveur..." -ForegroundColor Cyan
    $socketCmd = "cd `"$SOCKETIO_PATH`"; npm start"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $socketCmd -WindowStyle Minimized
    
    Start-Sleep -Seconds 2
    
    if (Test-Port $SOCKETIO_PORT) {
        Write-Host "  [OK] Socket.IO demarre sur http://localhost:$SOCKETIO_PORT" -ForegroundColor Green
    } else {
        Write-Host "  [!] Verifiez la fenetre Socket.IO" -ForegroundColor Yellow
    }
}

function Show-Summary {
    Write-Host ""
    Write-Host "  =========================================" -ForegroundColor Green
    Write-Host "  APPLICATION PLAN B DEMARREE" -ForegroundColor Green
    Write-Host "  =========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  URLs disponibles :" -ForegroundColor White
    Write-Host ""
    Write-Host "     Frontend   : http://localhost:$FRONTEND_PORT" -ForegroundColor Cyan
    Write-Host "     Backend    : http://localhost:$BACKEND_PORT" -ForegroundColor Cyan
    Write-Host "     API        : http://localhost:$BACKEND_PORT/api" -ForegroundColor Cyan
    Write-Host "     Socket.IO  : http://localhost:$SOCKETIO_PORT" -ForegroundColor Cyan
    Write-Host "     Mailpit    : http://localhost:$MAILPIT_HTTP_PORT" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Conseils :" -ForegroundColor Yellow
    Write-Host "     - Ouvrez http://localhost:$FRONTEND_PORT dans votre navigateur" -ForegroundColor Gray
    Write-Host "     - Les serveurs tournent dans des fenetres minimisees" -ForegroundColor Gray
    Write-Host "     - Pour arreter : executez .\arreter.ps1" -ForegroundColor Gray
    Write-Host ""
}

# EXECUTION PRINCIPALE

Clear-Host
Write-Banner

Start-Mailpit
Start-BackendServer
Start-FrontendServer
Start-SocketIOServer

Show-Summary

# Ouvrir le navigateur
$openBrowser = Read-Host "  Ouvrir le navigateur? (O/n)"
if ($openBrowser -ne "n") {
    $url = "http://localhost:$FRONTEND_PORT"
    Start-Process $url
}

Write-Host ""
