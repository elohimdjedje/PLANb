<?php
$db = new PDO('sqlite:var/data.db');
$result = $db->query("PRAGMA table_info(users)");
echo "USERS columns:\n";
foreach($result as $col) {
    echo "- " . $col['name'] . " (" . $col['type'] . ")\n";
}
echo "\nLISTINGS columns:\n";
$result = $db->query("PRAGMA table_info(listings)");
foreach($result as $col) {
    echo "- " . $col['name'] . " (" . $col['type'] . ")\n";
}
