<!DOCTYPE HTML>
<!--
useful links:
JQuery documentation: https://api.jquery.com/jQuery/	
-->
<html>

<head>
	<meta charset="utf-8">
	<title>Wetterstation Ismaning</title>
	<link rel="stylesheet" type="text/css" href="index.css" />
	<link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans" />
	<script type="text/javascript" src="js/chart.umd.js"></script>
	<script type="text/javascript" src="js/jquery-2.1.4.min.js"></script>
	<script type="text/javascript" src="js/spin.min.js"></script>
	<script type="text/javascript" src="js/moment-with-locales.min.js"></script>
	<script type="text/javascript" src="js/combodate.js"></script>
	<script type="text/javascript" src="js/getColumnInfo.js"></script>
	<script type="text/javascript" src="index.js"></script>
	<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/chartjs-adapter-moment"></script>
</head>

<body>
	<div id="links" class="box-base">
		<div class="top"><a href="http://www.waldorfschule-ismaning.de">Zurück zur Waldorfschule</a></div>
		<div class="middle"><a href="#">Der Quellcode</a></div>
		<div class="bottom"><a href="#"></a></div>
	</div>
	<div id="control" class="box box-base">
		<div class="title-bar top" onclick="switchControl('graph')">Liniendiagramm</div>
		<div id="graph" class="control-content">
			<div class="selection value">
				<label>Erster Wert</label>
				<select id="selection1" onchange="v.update()">
					<option value="temp">Temperatur</option>
					<option value="pressure">Druck</option>
					<option value="hum">Luftfeuchtigkeit</option>
					<option value="windspeed">Windgeschwindigkeit</option>
					<option value="rainrate">Regenrate</option>
					<option value="uvindex">UV-Index</option>
				</select>
			</div>
			<div class="selection value">
				<label>Zweiter Wert</label>
				<select id="selection2" onchange="v.update()">
					<option value="none">Nichts</option>
					<option value="temp">Temperatur</option>
					<option value="pressure">Druck</option>
					<option value="hum">Luftfeuchtigkeit</option>
					<option value="windspeed">Windgeschwindigkeit</option>
					<option value="rainrate">Regenrate</option>
					<option value="uvindex">UV-Index</option>
				</select>
			</div>
			<div class="selection newline">
				<label>Beginn</label>
				<div class="date"><input type="text" id="date-picker1" onchange="changeDate(0)" data-format="DD-MM-YYYY" data-template="D MMM YYYY" name="date"></div>
			</div>
			<div class="selection">
				<label>Ende</label>
				<div class="date"><input type="text" id="date-picker2" onchange="changeDate(1)" data-format="DD-MM-YYYY" data-template="D MMM YYYY" name="date"></div>
			</div>
		</div>
		<div id="table-title" class="title-bar" onclick="switchControl('table')">Tabelle</div>
		<div id="table" class="control-content" style="display: none">
			<div class="construction-site">
				Ups, hier fehlt noch was...
			</div>
			<div class="selection value">
				<label>Interval</label>
				<select id="interval" onchange="v.update()"></select>
			</div>
			<div class="selection value">
				<label>Erster Wert</label>
				<select id="selection1" onchange="v.update()"></select>
			</div>
			<div class="selection value">
				<label>Optionaler zweiter Wert</label>
				<select id="selection2" onchange="v.update()"></select>
			</div>
			<!-- there should be possibilities to select as many values as one wants, not just 2 -->
		</div>
		<div class="title-bar bottom" style="display: none"></div>
	</div>
	<div id="content" class="box box-base">
		<canvas></canvas>
		<div id="table"></div>
	</div>
</body>

</html>