<?php
$db = new PDO('sqlite:var/data.db');
$db->exec('DELETE FROM listings');
$db->exec('DELETE FROM users');
echo "Tables cleared\n";
