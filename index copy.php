<!DOCTYPE HTML>
<!--
useful links:
JQuery documentation: https://api.jquery.com/jQuery/	
-->
<html>

<head>
	<meta charset="utf-8">
	<title>Wetterstation Ismaning</title>
	<link rel="stylesheet" type="text/css" href="index copy.css"/>
	<link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans" />
	<script type="text/javascript" src="js/chart.umd.js"></script>
	<script type="text/javascript" src="js/jquery-2.1.4.min.js"></script>
	<script type="text/javascript" src="js/spin.min.js"></script>
	<script type="text/javascript" src="js/moment.min.js"></script>
	<script type="text/javascript" src="js/combodate.js"></script>
	<script type="text/javascript" src="js/getColumnInfo.js"></script>
	<script type="text/javascript" src="index.js"></script>
	<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/chartjs-adapter-moment"></script>
</head>

<body>
	<div id="links" class="box-base">
		<div class="top"><a href="http://www.waldorfschule-ismaning.de">Zurück zu der Website, von der Sie kommen</a></div>
		<div class="middle"><a href="#">über diese Website</a></div>
		<div class="bottom"><a href="#">Kontakt</a></div>
	</div>
	<div id="control" class="box box-base">
		<div class="title-bar top" onclick="switchControl('graph')">Liniendiagramm</div>
		<div id="graph" class="control-content">
					<div class="selection value">
						<label>Select value</label>
						<select id="selection1" onchange="v.update()">
								<option value="temp">Temperature</option>
								<option value="pressure">Pressure</option>
								<option value="hum">Humidity</option>
								<option value="windspeed">Wind speed</option>
								<option value="rainrate">Rain rate</option>
								<option value="uvindex">UV-index</option>
						</select>
					</div>
					<div class="selection value">
						<label>Optional second value</label>
						<select id="selection2" onchange="v.update()">
							<option value="none">None</option>
								<option value="temp">Temperature</option>
								<option value="pressure">Pressure</option>
								<option value="hum">Humidity</option>
								<option value="windspeed">Wind speed</option>
								<option value="rainrate">Rain rate</option>
								<option value="uvindex">UV-index</option>
						</select>
					</div>
					<div class="selection newline">
						<label>Start Date</label>
						<div class="date"><input type="text" id="date-picker1" onchange="changeDate(0)" data-format="DD-MM-YYYY" data-template="D MMM YYYY" name="date"></div>
					</div>
					<div class="selection">
						<label>End Date</label>
						<div class="date"><input type="text" id="date-picker2" onchange="changeDate(1)" data-format="DD-MM-YYYY" data-template="D MMM YYYY" name="date"></div>
					</div>
		</div>
		<div id="table-title" class="title-bar" onclick="switchControl('table')">Table</div>
		<div id="table" class="control-content" style="display: none">
					<div class="selection">
						<label>Interval</label>
						<select id="interval" onchange="v.update()()"></select>
					</div>
					<div class="selection">
						<label>Select value</label>
						<select id="selection1" onchange="v.update()()"></select>
					</div>
					<div class="selection">
						<label>Optional second value</label>
						<select id="selection2" onchange="v.update()()"></select>
					</div>
		</div>
		<div class="title-bar bottom" style="display: none"></div>
	</div>
	<div id="content" class="box box-base">
		<canvas></canvas>
		<div id="table"></div>
	</div>
</body>

</html>