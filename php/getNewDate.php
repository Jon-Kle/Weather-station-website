<?php
$dateString = strval($_POST["dateString"]);
$interval = strval($_POST["interval"])." days";
$date = date_create($dateString);
date_add($date, date_interval_create_from_date_string($interval));
echo date_format($date, 'Y-m-d');
?>