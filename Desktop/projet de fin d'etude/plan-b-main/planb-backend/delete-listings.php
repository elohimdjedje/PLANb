<?php
$db = new PDO('pgsql:host=localhost;port=5432;dbname=planb', 'postgres', 'root');
$db->exec('TRUNCATE TABLE listings CASCADE');
echo "Toutes les annonces supprimees\n";
