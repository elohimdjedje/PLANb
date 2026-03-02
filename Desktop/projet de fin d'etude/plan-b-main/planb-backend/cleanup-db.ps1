# Script pour nettoyer la base de données
Write-Host "🗑️  Nettoyage de la base de données Plan B" -ForegroundColor Cyan
Write-Host ""

# Compter les utilisateurs actuels
Write-Host "📊 Comptage des utilisateurs..." -ForegroundColor Yellow
docker exec planb_postgres psql -U postgres -d planb -c "SELECT COUNT(*) as total_users FROM \`"user\`";"

Write-Host ""
$confirmation = Read-Host "⚠️  Voulez-vous vraiment supprimer TOUS les utilisateurs de test? (oui/non)"

if ($confirmation -eq "oui") {
    Write-Host ""
    Write-Host "🗑️  Suppression en cours..." -ForegroundColor Red
    
    # Supprimer tous les utilisateurs
    docker exec planb_postgres psql -U postgres -d planb -c "DELETE FROM \`"user\`";"
    
    # Supprimer toutes les annonces
    docker exec planb_postgres psql -U postgres -d planb -c "DELETE FROM listing;"
    
    # Supprimer tous les favoris
    docker exec planb_postgres psql -U postgres -d planb -c "DELETE FROM favorite;"
    
    # Supprimer toutes les conversations
    docker exec planb_postgres psql -U postgres -d planb -c "DELETE FROM message;"
    docker exec planb_postgres psql -U postgres -d planb -c "DELETE FROM conversation;"
    
    # Supprimer tous les signalements
    docker exec planb_postgres psql -U postgres -d planb -c "DELETE FROM report;"
    
    # Supprimer tous les logs de sécurité
    docker exec planb_postgres psql -U postgres -d planb -c "DELETE FROM security_log;"
    
    # Réinitialiser les séquences
    docker exec planb_postgres psql -U postgres -d planb -c "ALTER SEQUENCE user_id_seq RESTART WITH 1;"
    docker exec planb_postgres psql -U postgres -d planb -c "ALTER SEQUENCE listing_id_seq RESTART WITH 1;"
    
    Write-Host ""
    Write-Host "✅ Base de données nettoyée avec succès!" -ForegroundColor Green
    Write-Host ""
    
    # Vérifier
    Write-Host "📊 Vérification..." -ForegroundColor Yellow
    docker exec planb_postgres psql -U postgres -d planb -c "SELECT COUNT(*) as total_users FROM \`"user\`";"
} else {
    Write-Host ""
    Write-Host "❌ Annulation du nettoyage" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Terminé!" -ForegroundColor Green
