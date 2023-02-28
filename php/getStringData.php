<?php
# This requests the actual data from getData.php and formats it.
# the single values get separated by "|" and "$" which later get used as separators

include 'getData.php';

$mode0 = trim($_POST["columns0"]);
$mode1 = trim($_POST["columns1"]);
$dayendbin = trim($_POST["dateInput"]);
$interval = trim($_POST["interval"]);
$dayBegin = substr($dayendbin, 0, 10);
$dayEnd = substr($dayendbin, 10, 3);

$mode = array($mode0);
if ($mode1 != "") {
	array_push($mode, $mode1);
}
$datapackage = getData($mode, $dayBegin, $dayEnd, $interval);
if ($datapackage == false) {

} else {
	$dateArray = $datapackage[0];
	$firstArray = $datapackage[1];
	$countnum = 0;
	foreach ($dateArray as &$value) {
		if ($countnum != 0) {
			echo "|";
		}
		$countnum++;
		echo $value;
		/*if ($valCheck != substr($value, 0, 10)) {
			echo substr($value, 0, 16);
			$valCheck = substr($value, 0, 10);
		} else {
			echo substr($value, 11, 5);
		}*/
	}
	echo "$";
	$countnum = 0;
	foreach ($firstArray as &$value) {
		if ($countnum != 0) {
			echo "|";
		}
		$countnum++;
		echo $value;
	}
	if (count($datapackage) > 2) {
		echo "$";
		$countnum = 0;
		$secoundArray = $datapackage[2];
		foreach ($secoundArray as &$value) {
			if ($countnum != 0) {
				echo "|";
			}
			$countnum++;
			echo $value;
		}
	}
}
?>