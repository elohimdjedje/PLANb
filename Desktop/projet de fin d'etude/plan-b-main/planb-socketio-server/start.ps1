# Script PowerShell pour démarrer le serveur Socket.io
# Usage: .\start.ps1

Write-Host "🚀 Démarrage du serveur Socket.io..." -ForegroundColor Cyan

# Vérifier que Node.js est installé
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js n'est pas installé !" -ForegroundColor Red
    exit 1
}

# Vérifier que le fichier .env existe
if (-not (Test-Path .env)) {
    Write-Host "⚠️  Fichier .env non trouvé. Création depuis env.example..." -ForegroundColor Yellow
    if (Test-Path env.example) {
        Copy-Item env.example .env
        Write-Host "✅ Fichier .env créé" -ForegroundColor Green
    } else {
        Write-Host "❌ env.example non trouvé !" -ForegroundColor Red
        exit 1
    }
}

# Vérifier que les dépendances sont installées
if (-not (Test-Path node_modules)) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
}

# Démarrer le serveur
Write-Host "🚀 Démarrage sur le port 3001..." -ForegroundColor Green
npm start


