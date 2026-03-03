<?php
$hash = password_hash('password123', PASSWORD_BCRYPT);
echo "Nouveau hash: " . $hash . "\n";
echo "Vérification: " . (password_verify('password123', $hash) ? 'OK' : 'KO') . "\n";
