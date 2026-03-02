# Script pour configurer le pare-feu Windows pour Plan B Mobile
# Encodage: UTF-8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration du Pare-feu" -ForegroundColor Cyan
Write-Host "  Plan B Mobile (Mise à jour)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[ERREUR] Ce script nécessite les droits administrateur" -ForegroundColor Red
    Write-Host ""
    Write-Host "Relancez PowerShell en tant qu'administrateur :" -ForegroundColor Yellow
    Write-Host "  1. Clic droit sur PowerShell" -ForegroundColor Gray
    Write-Host "  2. 'Exécuter en tant qu'administrateur'" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "[*] Mise à jour des règles de pare-feu..." -ForegroundColor Yellow
Write-Host "    Note : Application aux profils Public, Privé et Domaine" -ForegroundColor Gray
Write-Host ""

function Update-FirewallRule {
    param (
        [string]$Name,
        [int]$Port
    )

    try {
        # Supprimer l'ancienne règle si elle existe pour forcer la mise à jour
        Remove-NetFirewallRule -DisplayName $Name -ErrorAction SilentlyContinue
        
        # Créer la nouvelle règle
        New-NetFirewallRule -DisplayName $Name `
            -Direction Inbound `
            -LocalPort $Port `
            -Protocol TCP `
            -Action Allow `
            -Profile Domain, Private, Public `
            -ErrorAction Stop | Out-Null
            
        Write-Host "[OK] Port $Port ($Name) autorisé" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERREUR] Échec pour le port $Port : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Appliquer les règles
Update-FirewallRule "Plan B Backend" 8000
Update-FirewallRule "Plan B Frontend" 5173
Update-FirewallRule "Expo Dev Server" 19000
Update-FirewallRule "Expo Metro Bundler" 19001

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Configuration terminée !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Vos ports sont maintenant ouverts sur tous les réseaux." -ForegroundColor Cyan
Write-Host "Veuillez relancer l'application mobile." -ForegroundColor Yellow
Write-Host ""
