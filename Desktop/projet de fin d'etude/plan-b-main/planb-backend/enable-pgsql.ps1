# Script pour activer extension pdo_pgsql dans php.ini
$phpIniPath = "C:\xampp\php\php.ini"

Write-Host "Activation de extension pdo_pgsql..." -ForegroundColor Cyan

# Lire le contenu du fichier php.ini
$content = Get-Content $phpIniPath

# Chercher et décommenter les lignes pdo_pgsql
$modified = $false
$newContent = $content | ForEach-Object {
    if ($_ -match ";extension=pdo_pgsql") {
        Write-Host "Ligne trouvee et activee : $_" -ForegroundColor Green
        $_ -replace ";extension=pdo_pgsql", "extension=pdo_pgsql"
        $modified = $true
    }
    elseif ($_ -match ";extension=pgsql") {
        Write-Host "Ligne trouvee et activee : $_" -ForegroundColor Green
        $_ -replace ";extension=pgsql", "extension=pgsql"
        $modified = $true
    }
    else {
        $_
    }
}

if ($modified) {
    # Sauvegarder les modifications
    $newContent | Set-Content $phpIniPath
    Write-Host "`n🎉 Extensions PostgreSQL activées dans php.ini !" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT : Redémarrez votre terminal/IDE pour appliquer les changements" -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️  Aucune ligne à décommenter trouvée." -ForegroundColor Yellow
    Write-Host "Vérification manuelle nécessaire dans : $phpIniPath" -ForegroundColor Yellow
}

pause
