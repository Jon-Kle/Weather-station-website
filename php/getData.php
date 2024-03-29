<?php

date_default_timezone_set('CET'); // just for continuity between this and the DB-Manager

# get all the variables from the request
$selection1 = $_POST['selection1'];
$selection2 = $_POST['selection2'];
$start = $_POST['startDate'];
$end = $_POST['endDate'];

// echo $selection1, " ", $selection2, ' ', $dateStr;
try {
$databaseFileContent = file_get_contents("../conf/database.json");
$loginData = json_decode($databaseFileContent, true)["mysqlConnection"];
$host = $loginData["host"]; //connected via docker network wetter-website
$username = $loginData["username"];
$password = $loginData["password"];
$dbname = $loginData["database"];
$tablename = $loginData["table"];
$port = $loginData["port"];
} catch (Exception $e) {
	echo 'error when reading config file&' . $e->getMessage();
	return;
}

try {
$conn = mysqli_connect($host, $username, $password, $dbname, $port);
} catch (Exception $e) {
	echo 'error when connecting to database&' . $e->getMessage();
	return;
}
// query values
$queryValuesString = "entryDate, $selection1" . $selection2;

// get Data from Database
$sqlQuery = "SELECT $queryValuesString FROM $tablename WHERE entryDate BETWEEN '$start' AND '$end' ORDER BY entryDate ASC;";
// echo $sqlQuery;
// return;
try {
$result = mysqli_query($conn, $sqlQuery);
$rows = mysqli_fetch_all($result);
} catch (Exception $e) {
	echo 'error when requesting data&' . $e->getMessage();
	return;
}
// $rows is a two dimensional array

if (sizeof($rows) <= 0) {
	echo 'no data returned&';
	return;
}

$transmission_str = $queryValuesString . '&';
// transform into string
for ($i = 0; $i < sizeof($rows) - 1; $i++) {

	for ($j = 0; $j < sizeof($rows[$i]) - 1; $j++) {
		$transmission_str .= $rows[$i][$j];
		$transmission_str .= '|';
	}
	$transmission_str .= $rows[$i][$j];
	$transmission_str .= '&';
}
for ($j = 0; $j < sizeof(end($rows)) - 1; $j++) {
	$transmission_str .= $rows[$i][$j];
	$transmission_str .= '|';
}
$transmission_str .= $rows[$i][$j];
echo $transmission_str;
// create string with values (Values : ; | & )
