<?php
$db = new PDO('sqlite:var/data.db');
$tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'");
echo "Tables in database:\n";
foreach($tables as $t) {
    echo "- " . $t['name'] . "\n";
}
