# Script pour nettoyer la base de donnees Plan B
Write-Host "=== Nettoyage de la base de donnees Plan B ===" -ForegroundColor Cyan
Write-Host ""

# Compter les utilisateurs actuels
Write-Host "Comptage des utilisateurs..." -ForegroundColor Yellow
docker exec planb_postgres psql -U postgres -d planb -c "SELECT COUNT(*) as total_users FROM users;"

Write-Host ""
$confirmation = Read-Host "Voulez-vous vraiment supprimer TOUS les utilisateurs et donnees de test? (oui/non)"

if ($confirmation -eq "oui") {
    Write-Host ""
    Write-Host "Suppression en cours..." -ForegroundColor Red
    
    # Supprimer dans le bon ordre (contraintes de cles etrangeres)
    docker exec planb_postgres psql -U postgres -d planb -c "DELETE FROM images;"
    docker exec planb_postgres psql -U postgres -d planb -c "DELETE FROM payments;"
    docker exec planb_postgres psql -U postgres -d planb -c "DELETE FROM listings;"
    docker exec planb_postgres psql -U postgres -d planb -c "DELETE FROM subscriptions;"
    docker exec planb_postgres psql -U postgres -d planb -c "DELETE FROM users;"
    
    Write-Host ""
    Write-Host "Base de donnees nettoyee avec succes!" -ForegroundColor Green
    Write-Host ""
    
    # Verifier
    Write-Host "Verification..." -ForegroundColor Yellow
    docker exec planb_postgres psql -U postgres -d planb -c "SELECT COUNT(*) as total_users FROM users;"
    docker exec planb_postgres psql -U postgres -d planb -c "SELECT COUNT(*) as total_listings FROM listings;"
} else {
    Write-Host ""
    Write-Host "Annulation du nettoyage" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Termine!" -ForegroundColor Green
