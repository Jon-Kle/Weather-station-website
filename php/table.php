<?php
include 'getData.php';

$modeStr = $_POST["columns0"];
$dayendbin = $_POST["dateInput"];
$interval = $_POST["interval"];
$dayBegin = substr($dayendbin, 0, 10);
$dayEnd = substr($dayendbin, 10, 3);
$mode = explode(',', $modeStr);
$forDayCount = 0;
$storedDate = "";
$updatedDate = "";
$datapackage = getData($mode, $dayBegin, $dayEnd, $interval);
if (!$datapackage) {
	die("No data for this date");
}

$dateArray = $datapackage[0];
$dateArrayCount = count($dateArray);

echo "<table><colgroup>"; 
for ($i = 0; $i < $dateArrayCount; $i++) {
	echo "<col>";
}
echo "</colgroup><tbody><tr>";
if ($interval == "day") {
	foreach ($dateArray as &$value) {
		echo "<td>". substr($value, 6, 16) . "</td>";
	}
} else {
	$storedDate = substr($dateArray[0], 6, 16);
	for ($i=0; $i < count($dateArray); $i++) {
		$updatedDate = substr($dateArray[$i], 6, 16);
		if ($storedDate != $updatedDate or $i == count($dateArray)-1) {
			echo "<td colspan=\"" . $forDayCount . "\">" . $storedDate . "</td>";
			$storedDate = $updatedDate;
			$forDayCount = 0;
		} else {
			$forDayCount++;
		}
	}
	echo "</tr><tr>";
	foreach ($dateArray as &$value) {
		echo "<td>" . substr($value, 0, 2) . "<sup>" . substr($value, 3, 2) . "</sup></td>";
	}
}
for ($i = 0; $i < count($mode); $i++) {
	echo "</tr><tr class=\"title\"><th colspan=\"" . $dateArrayCount . "\">" . $mode[$i] . "</th></tr><tr>";
	if ($mode[$i] == 'winddir' or $mode[$i] == 'hidir') {
		foreach ($datapackage[$i+1] as &$value) {
			$valueArray = explode('_', $value);
			echo "<td><span>" . $valueArray[1] . "</span><div class =\"windicon " . $valueArray[1] . "\"";
			echo " style='transform: rotate(". $valueArray[0] . "deg);'";
			echo "></div></td>";
		}
	} elseif ($mode[$i] == 'thswindex') {
		foreach ($datapackage[$i+1] as &$value) {
			echo "<td>" . $value . "</td>";
		}
	} else {
		foreach ($datapackage[$i+1] as &$value) {
			echo "<td>" . $value . "</td>";
		}	
	}
}
echo "</tr></tbody></table>";
?>