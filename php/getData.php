<?php
function getData($mode, $dayBegin, $dayEnd, $interval) {
	// Connecting to database
	// this has to be read from a file!!!
	$host = ""; //connected via docker network wetter-website
	$username = "";
	$password = "";
	$dbname = "";
	$port = 3306;
	$sql_qu_base = "SELECT DATE_FORMAT(entryDate,'%H:%i %a, %d.%b %Y') AS entryDate, ";
	# this is probably not necessary anymore
	$highestValueAry = array("hitemp","hispeed","hisolarrad","hiuv");
	$tempoVar = 0;
	$package = array(array());
	$countnum = 0;
	$countnum2 = 0;

	// Create and check connection
	$conn = mysqli_connect($host, $username, $password, $dbname, $port);
	//die("Connection failed: " . mysqli_connect_error($conn));
	
	
	if (in_array("hidir", $mode)) {
		if (!in_array("hispeed", $mode)) {
			array_push($mode, "hispeed");
			$hispeedexists = false;
		} else {
			$hispeedexists = true;
		}
	}

	foreach ($mode as &$value) {
		if ($countnum != 0) {
			$sql_qu_base .= ", ";
		}
		$countnum++;
		$sql_qu_base .= $value;
	}
	$sql_qu_base .= " FROM weatherdata WHERE entryDate BETWEEN '";
	$sql_qu_base .= $dayBegin;
	$sql_qu_base .= "' AND DATE_ADD('";
	$sql_qu_base .= $dayBegin;
	$sql_qu_base .= "', INTERVAL '";
	$sql_qu_base .= $dayEnd;
	$sql_qu_base .= "' DAY_HOUR)";

	//echo $sql_qu_base . "\n";
	
	$result = mysqli_query($conn, $sql_qu_base);
	//$resultCount = mysql_num_rows($result);

	# test, if returned rows is more than one
	if ($result->num_rows == 0) {
		return false;
	}
	# manipulate data according to the interval value received
	switch ($interval) {
		case "all":
				while($row = $result->fetch_assoc()) {
					for ($i = 0; $i < count($mode) + 1; $i++) {
						if ($i == 0) {
							array_push($package[0], $row["entryDate"]);
						} else {
							if (count ($package) < $i+ 1) {
								array_push($package, array());
							}
							if ($mode[$i -1] == "winddir" or $mode[$i -1] == "hidir") {
								switch ($row[$mode[$i - 1]]) {
									case 'N': $rotation = 0; break;
									case 'NNE': $rotation = 22.5; break;
									case 'NE': $rotation = 45; break;
									case 'ENE': $rotation = 67.5; break;
									case 'E': $rotation = 90; break;
									case 'ESE': $rotation = 112.5; break;
									case 'SE': $rotation = 135; break;
									case 'SSE': $rotation = 157.5; break;
									case 'S': $rotation = 180; break;
									case 'SSW': $rotation = 202.5; break;
									case 'SW': $rotation = 225; break;
									case 'WSW': $rotation = 247.5; break;
									case 'W': $rotation = 270; break;
									case 'WNW': $rotation = 292.5; break;
									case 'NW': $rotation = 315; break;
									case 'NNW': $rotation = 337.5; break;
									default: $rotation = 0;
								}
								array_push($package[$i], $rotation.'_'.$row[$mode[$i - 1]]);
							} else {
								array_push($package[$i], $row[$mode[$i - 1]]);
							}
						}
					}
				}
				break;
		case "hour":
				$previousAry = array(array());
				$return = 0;
				while($row = $result->fetch_assoc()) {
					for ($i = 0; $i < count($mode) + 1; $i++) {
						$cycleMins = intval(substr($row["entryDate"], 3, 2));
						if ($cycleMins == 00) {
							if ($i == 0) {
								array_push($package[0], $row["entryDate"]);
							} else {
								if (!empty($previousAry[$i-1])) {
									if (count ($package) < $i + 1) {
										array_push($package, array());
									}
									if ($mode[$i - 1] == "lowtemp") {
										for ($i2 = 0; $i2 < count($previousAry[$i-1]); $i2++) {
											if ($i2 == 0 or $tempoVar > floatval($previousAry[$i-1][$i2])) {
												$tempoVar = floatval($previousAry[$i-1][$i2]);
											}
										}
										$return = $tempoVar;
									} elseif (in_array($mode[$i - 1], $highestValueAry)) {
										for ($i2 = 0; $i2 < count($previousAry[$i-1]); $i2++) {
											if ($i2 == 0 or $tempoVar < floatval($previousAry[$i-1][$i2])) {
												$tempoVar = floatval($previousAry[$i-1][$i2]);
											}
										}
										$return = $tempoVar;
									} elseif ($mode[$i - 1] == "winddir") {
										$i3 = 0;
										for ($i2 = 0; $i2 < count($previousAry[$i-1]); $i2++) {
											$i3++;
											$rotation = 0;
											switch ($previousAry[$i-1][$i2]) {
												case 'N': $rotation = 0; break;
												case 'NNE': $rotation = 22.5; break;
												case 'NE': $rotation = 45; break;
												case 'ENE': $rotation = 67.5; break;
												case 'E': $rotation = 90; break;
												case 'ESE': $rotation = 112.5; break;
												case 'SE': $rotation = 135; break;
												case 'SSE': $rotation = 157.5; break;
												case 'S': $rotation = 180; break;
												case 'SSW': $rotation = 202.5; break;
												case 'SW': $rotation = 225; break;
												case 'WSW': $rotation = 247.5; break;
												case 'W': $rotation = 270; break;
												case 'WNW': $rotation = 292.5; break;
												case 'NW': $rotation = 315; break;
												case 'NNW': $rotation = 337.5; break;
												default: $i3--;
											}
											$return += $rotation;
										}
										$return /= $i3;
										$return = round($return, 1);
										/*if ($return == 0) {
											$return = '---';
										}*/
										$return = (string)$return;
										$return += '_';
										$return += 'N';
										echo $return.' ';
									} elseif ($mode[$i - 1] == "hidir") {
										for ($i2 = 0; $i2 < count($previousAry[$i-1]); $i2++) {
											switch ($previousAry[$i-1][$i2]) {
												case 'N': $rotation = 0; break;
												case 'NNE': $rotation = 22.5; break;
												case 'NE': $rotation = 45; break;
												case 'ENE': $rotation = 67.5; break;
												case 'E': $rotation = 90; break;
												case 'ESE': $rotation = 112.5; break;
												case 'SE': $rotation = 135; break;
												case 'SSE': $rotation = 157.5; break;
												case 'S': $rotation = 180; break;
												case 'SSW': $rotation = 202.5; break;
												case 'SW': $rotation = 225; break;
												case 'WSW': $rotation = 247.5; break;
												case 'W': $rotation = 270; break;
												case 'WNW': $rotation = 292.5; break;
												case 'NW': $rotation = 315; break;
												case 'NNW': $rotation = 337.5; break;
												default: $rotation = 360;
											}
											if ($i2 == 0 or $tempoVar < $rotation) {
												$tempoVar = $rotation;
											}
										}
										$return = $tempoVar;
									} else {
										for ($i2 = 0; $i2 < count($previousAry[$i-1]); $i2++) {
											$return = $return + floatval($previousAry[$i-1][$i2]);
										}
										$return /= $i2;
									}
									$previousAry[$i-1] = array();

									if ($mode[$i-1] == 'winddir' or $mode[$i-1] == 'hidir') {
										array_push($package[$i], $return);
									} else {
										array_push($package[$i], round($return, 1));
									}

									$return = 0;
									$tempoVar = 0;
								}
								if (count ($previousAry) < $i) {
									array_push($previousAry, array());
								}
								array_push($previousAry[$i-1], $row[$mode[$i - 1]]);
							}
						} else {
							if ($i != 0) {
								if (count ($previousAry) < $i) {
									array_push($previousAry, array());
								}
								array_push($previousAry[$i-1], $row[$mode[$i - 1]]);
							}
						}
					}
					$countnum2++;
				}
				if (count($package[0]) > count($package[1])) {
					for ($i = 0; $i < count($previousAry); $i++) {
						if ($mode[$i] == "lowtemp") {
							for ($i2 = 0; $i2 < count($previousAry[$i]); $i2++) {
								if ($i2 == 0 or $tempoVar > floatval($previousAry[$i][$i2])) {
									$tempoVar = floatval($previousAry[$i][$i2]);
								}
							}
							$return = $tempoVar;
						} elseif (in_array($mode[$i], $highestValueAry)) {
							for ($i2 = 0; $i2 < count($previousAry[$i]); $i2++) {
								if ($i2 == 0 or $tempoVar < floatval($previousAry[$i][$i2])) {
									$tempoVar = floatval($previousAry[$i][$i2]);
								}
							}
							$return = $tempoVar;
						} else {
							for ($i2 = 0; $i2 < count($previousAry[$i]); $i2++) {
								$return = $return + floatval($previousAry[$i][$i2]);
							}
							$return /= $i2;
						}
						$previousAry[$i] = array();
						array_push($package[$i+1], round($return, 1));
					}
				}
				break;
		case "day":
				$previousAry = array(array());
				$return = 0;
				while($row = $result->fetch_assoc()) {
					if ($countnum2 == 0) {
						$cycleDate = substr($row["entryDate"], 11, 2);
					}
					for ($i = 0; $i < count($mode) + 1; $i++) {
						if ($cycleDate != substr($row["entryDate"], 11, 2) or $countnum2 == 0) {
							if ($i == 0) {
								array_push($package[0], $row["entryDate"]);
							} else {
								if (!empty($previousAry[$i-1])) {
									if (count ($package) < $i + 1) {
										array_push($package, array());
									}
									if ($mode[$i - 1] == "lowtemp") {
										for ($i2 = 0; $i2 < count($previousAry[$i-1]); $i2++) {
											if ($i2 == 0 or $tempoVar > floatval($previousAry[$i-1][$i2])) {
												$tempoVar = floatval($previousAry[$i-1][$i2]);
											}
										}
										$return = $tempoVar;
									} elseif (in_array($mode[$i - 1], $highestValueAry)) {
										for ($i2 = 0; $i2 < count($previousAry[$i-1]); $i2++) {
											if ($i2 == 0 or $tempoVar < floatval($previousAry[$i-1][$i2])) {
												$tempoVar = floatval($previousAry[$i-1][$i2]);
											}
										}
										$return = $tempoVar;
									} else {
										for ($i2 = 0; $i2 < count($previousAry[$i-1]); $i2++) {
											$return = $return + floatval($previousAry[$i-1][$i2]);
										}
										$return /= $i2;
									}
									$previousAry[$i-1] = array();
									array_push($package[$i], round($return, 1));
									if ($i == count($mode)) {
										$cycleDate = substr($row["entryDate"], 11, 2);
									}
									$return = 0;
									$tempoVar = 0;
								}
								if (count ($previousAry) < $i) {
									array_push($previousAry, array());
								}
								array_push($previousAry[$i-1], $row[$mode[$i - 1]]);
							}
						} else {
							if ($i != 0) {
								if (count ($previousAry) < $i) {
									array_push($previousAry, array());
								}
								array_push($previousAry[$i-1], $row[$mode[$i - 1]]);
							}
						}
					}
					$countnum2++;
				}
				if (count($package[0]) > count($package[1])) {
					for ($i = 0; $i < count($previousAry); $i++) {
						if ($mode[$i] == "lowtemp") {
							for ($i2 = 0; $i2 < count($previousAry[$i]); $i2++) {
								if ($i2 == 0 or $tempoVar > floatval($previousAry[$i][$i2])) {
									$tempoVar = floatval($previousAry[$i][$i2]);
								}
							}
							$return = $tempoVar;
						} elseif (in_array($mode[$i], $highestValueAry)) {
							for ($i2 = 0; $i2 < count($previousAry[$i]); $i2++) {
								if ($i2 == 0 or $tempoVar < floatval($previousAry[$i][$i2])) {
									$tempoVar = floatval($previousAry[$i][$i2]);
								}
							}
							$return = $tempoVar;
						} else {
							for ($i2 = 0; $i2 < count($previousAry[$i]); $i2++) {
								$return = $return + floatval($previousAry[$i][$i2]);
							}
							$return /= $i2;
						}
						$previousAry[$i] = array();
						array_push($package[$i+1], round($return, 1));
					}
				}
				break;
		/*case "month":
				$previousAry = array(array());
				$return = 0;
				while($row = $result->fetch_assoc()) {
					for ($i = 0; $i < count($mode) + 1; $i++) {
						$cycleMins = intval(substr($row["entryDate"], 14, 2));
						if ($cycleMins == 00) {
							if ($i == 0) {
								array_push($package[0], $row["entryDate"]);
							} else {
								if (count ($package) < $i+ 1) {
									array_push($package, array());
								}
								if (count ($previousAry) < $i) {
									array_push($previousAry, array());
								}
								array_push($previousAry[$i-1], $row[$mode[$i - 1]]);
								for ($i2 = 0; $i2 < count($previousAry[$i-1]); $i2++) {
									$return = $return + floatval($previousAry[$i-1][$i2]);
								}
								$previousAry = array(array());
								$return /= $i2;
								array_push($package[$i], $return);
								$return = 0;
							}
						} else {
							if ($i != 0) {
								if (count ($previousAry) < $i) {
									array_push($previousAry, array());
								}
								array_push($previousAry[$i-1], $row[$mode[$i - 1]]);
							}
						}
					}
				}
				break;*/
	}
	// which format does this have??
	return $package;
	mysqli_close($conn);
}
?> 