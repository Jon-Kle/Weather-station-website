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
	<script type="text/javascript" src="js/jquery-2.1.4.min.js"></script>
	<script type="text/javascript" src="js/spin.min.js"></script>
	<script type="text/javascript" src="js/getColumnInfo.js"></script>
	<script type="text/javascript" src="js/chart_min.js"></script>
	<script type="text/javascript" src="js/moment.min.js"></script>
	<script type="text/javascript" src="js/combodate.js"></script>
	<script>
		//variables for the appearance of the website
		//for example the interval of values to be displayed or the style in which to be displayed
		var activeView = "controlLine",
			changed = 0,
			spinner,
			counterChart = 0,
			dateInterval = [1, 0],
			dateInputVar = "2015-04-241 0", //start date + length of interval
			advancedBool = false;

		//what does this do?
		var opts = {
			lines: 13,
			length: 34,
			width: 14,
			radius: 42,
			scale: 0.18,
			corners: 1,
			color: '#000',
			opacity: 0.25,
			rotate: 0,
			direction: 1,
			speed: 1,
			trail: 60,
			fps: 20,
			zIndex: 2e9,
			className: 'spinner',
			top: '40px',
			left: '50%',
			shadow: false,
			hwaccel: false,
			position: 'relative'
		}
		//execute once, when DOM is ready
		//this is a jquery thing: https://learn.jquery.com/using-jquery-core/document-ready/
		$(document).ready(function () {

			//correct the appearance of the links on the left side
			resizeLinks();
			//when hovering over control panel, change positioning of table to fixed
			$(".control").hover(
				function () {
					$("#table").css("position", "fixed");
				},
				function () {
					$("#table").css("position", "inherit");
				}
			);
			// this includes all elements of the class "select-toggle"
			$('.select-toggle').each(function () {
				//the context is a JQuery object, that includes the calling instance which is defied by class="select-toggle"
				var context = $(this);
				values = {};
				//gets every option of the elements included by context
				$('option', context).each(function (index, option) {
					//gets the selected value(bool) of each option and adds it to the values dictionary
					values[option.value] = option.selected;
				}).click(function (event) {
					//when an option is clicked
					//invert the boolean value of the option in the values dict
					values[this.value] = !values[this.value];
					//update all option selected values with the dict of values
					$('option', context).each(function (index, option) {
						option.selected = values[option.value];
					});
				});
			});
			//action of left double-arrow
			$("#timeline .a0").click(function () {
				changeDate(0, -4);
			});
			//action of left single-arrow
			$("#timeline .a1").click(function () {
				changeDate(0, -1);
			});
			//action of right single-arrow
			$("#timeline .a2").click(function () {
				changeDate(0, 1);
			});
			//action of right double-arrow
			$("#timeline .a3").click(function () {
				changeDate(0, 4);
			});
			//action of minus button
			$("#timeline .i0").click(function () {
				changeDate(1, -1);
			});
			//action of plus button
			$("#timeline .i1").click(function () {
				changeDate(1, 1);
			});
			//action of the date selection element
			$("#timeline .t0 input").combodate({ minYear: 2012, maxYear: 2023, firstItem: 'none', errorClass: '#timeline .t0' });
		});
		//make sure, the links are positioned properly when the window is resized
		window.onresize = function (event) {
			resizeLinks();
		}
		//change the starting date or the length of the interval of values to be displayed
		function changeDate(mode, increaseVal) {
			if (activeView != "") {
				switch (mode) {
					//change the starting date of the values to display
					case 0:
						//payload for ajax post request
						var dateInfoObject = {
							dateString: dateInputVar.substring(0, 10),
							interval: increaseVal
						};
						//use the script php/getNewDate.php with the parameter dateInfoObject
						//ajax is a protocol that allows to exchange Javascript and XML data with the server after the website has been loaded.
						$.ajax({
							type: "POST",
							url: "php/getNewDate.php",
							data: dateInfoObject,
							cache: false,
							success: function (result) {
								//change the dateInputVar string
								//carry over the last three characters from the old string
								dateInputVar = result + dateInputVar.substr(10, 3);
								onAnyChange(500);
							}
						});
						break;
					//change the length of the interval of values to display
					case 1:
						dateInterval[0] += increaseVal;
						//if the dateInterval[0] value comes below 1, set the value back to 1
						//also return 1 => function did
						if (dateInterval[0] < 1) {
							dateInterval[0] = 1;
							return 1;
						}
						// change the second value of the dateInputVar string to the new length of the interval
						dateInputVar = dateInputVar.substr(0, 10) + dateInterval[0].toString() + " " + dateInterval[1].toString();
						onAnyChange(500);
						break;
					//change the starting date according to the typed input
					case 2:
						document.querySelectorAll('#timeline .t0 input')[0].value
						dateInputVar = document.querySelectorAll('#timeline .t0 input')[0].value + dateInputVar.substr(10, 3);
						onAnyChange(500);
						break;
				}
				return 0;
			}
		}
		//get selected data from the database and display it
		function updateContent() {
			//get the first value in the list of options for interval of the current view
			var intervalVar = document.querySelectorAll('#' + activeView + ' .styled-select .interval')[0].value;

			switch (activeView) {
				case "controlBar":
				case "controlLine":
					//tries to create a Request
					if (window.XMLHttpRequest) {
						requestVar = new XMLHttpRequest();
					}
					//method for older browsers
					else if (window.ActiveXObject) {
						requestVar = new ActiveXObject("Msxml2.XMLHTTP");
					}
					else {
						throw new Error("Ajax is not supported by this browser");
					}
					//if the request has returned and was successful
					requestVar.onreadystatechange = function () {
						if (requestVar.readyState == 4 && requestVar.status == 200) {
							spinner.stop();
							document.getElementById("canvas").style.display = "block";
							document.getElementById("table").innerHTML = "";
							//get the text content of the response
							var resultString = requestVar.responseText;

							// console.log("resultString:", resultString); //fehlende Exception!

							//split the content from the database into smaller chunks
							var bigResultArray = resultString.split("$");
							var dateArray = bigResultArray[0].split("|");
							var dataArray0 = bigResultArray[1].split("|");
							if (bigResultArray.length > 2) {
								var dataArray1 = bigResultArray[2].split("|");
							} else {
								var dataArray1 = ["none"];
							}
							//display the received data
							if (activeView == "controlLine") {
								newLineChart(dateArray, dataArray0, dataArray1);
							} else {
								newBarChart(dateArray, dataArray0, dataArray1);
							}
						}
					}
					//get the values that have been selected with the controls
					var columnsVar0 = document.querySelectorAll('#' + activeView + ' .styled-select .columnsSelect0')[0].value;
					var columnsVar1 = document.querySelectorAll('#' + activeView + ' .styled-select .columnsSelect1')[0].value;
					//initialize the request
					requestVar.open('POST', 'php/getStringData.php');
					requestVar.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

					// console.log("requestVar:", requestVar)
					//send the request with the parameters for the php script as body
					if (columnsVar1 == "none" || columnsVar1 == "undefined") {
						requestVar.send("columns0=" + columnsVar0 + "&columns1=" + '' + "&dateInput=" + dateInputVar + "&interval=" + intervalVar);
					} else {
						requestVar.send("columns0=" + columnsVar0 + "&columns1=" + columnsVar1 + "&dateInput=" + dateInputVar + "&interval=" + intervalVar);
					}
					break;
				case "controlTable":
					var select = document.querySelectorAll('#' + activeView + ' .styled-select .columnsSelect')[0];
					var selectedList = [];
					var selectedListStr;

					//loop through all options
					for (var i = 0; i < select.options.length; i++) {
						//if option is selected
						if (select.options[i].selected) {
							//append/add option to list of selected
							selectedList.push(select.options[i].value);
						}
					}
					selectedListStr = "";
					//loop through list of selected
					for (var i = 0; i < selectedList.length; i++) {
						//add options to string separated by commas
						if (i > 0) {
							selectedListStr += ",";
						}
						selectedListStr += selectedList[i];
					}

					//take list of selected, the date and the interval of values to display
					var columnVarObject = {
						columns0: selectedListStr,
						dateInput: dateInputVar,
						interval: intervalVar
					};
					$.ajax({
						type: "POST",
						url: "../php/table.php",
						data: columnVarObject,
						cache: false,
						success: function (result) {
							spinner.stop();
							document.getElementById("canvas").style.display = "none";
							document.getElementById("legend").innerHTML = "";
							//destroy old chart if there is one
							if (counterChart > 0) {
								myBar.destroy();
							}
							//fill table?
							$("#table").html(result);
							var thElements = document.getElementsByTagName("th");
							for (var i = 0; i < thElements.length; i++) {
								if (thElements[i].colspan != 1) {
									thElements[i].innerHTML = getName(thElements[i].innerHTML);
								}
							}
						}
					});
					break;
			}
		}
		//add spinner and update the content with a timeout in milliseconds
		function onAnyChange(time) {
			//add a spinner to the content panel
			var target = document.getElementById('content');
			if (changed < 1) {
				spinner = new Spinner(opts).spin(target);
			}
			//this prohibits updateContent from being called if the last timeout has not finished yet
			changed++;
			//this is setting a delay which is purely cosmetic and could be removed
			// setTimeout(function () { changed--; if (changed == 0) { updateContent(); } }, time);
			updateContent();
		}
		//correct the vertical placement of the links on the left side
		function resizeLinks() {
			//vph = vertical panel height(?)
			var vph = $(window).height() - 32;
			//content height
			var conHeight = $("#control").outerHeight(true) + 20;
			$('#links').css({ 'height': vph + 'px' });
			$('#links .a1').css({ 'margin-top': vph / 2 - 128 + 'px' });
			$('#links .a2').css({ 'margin-top': vph / 2 - 160 + 'px' });
			$('#content').css({ 'min-height': vph - conHeight + 'px' });
		}
		//switch the control panel
		function controlSwitchTo(viewMode) {
			//close current control panel
			if ($("#controlBar").css("display") == "block") {
				$('#controlBar').slideUp("slow");
			}
			if ($("#controlLine").css("display") == "block") {
				$('#controlLine').slideUp("slow");
			}
			if ($("#controlTable").css("display") == "block") {
				$('#controlTable').slideUp("slow");
			}
			//open the new one
			$('#' + viewMode).slideDown("slow");

			activeView = viewMode;
			onAnyChange(6000);
		}
		//action to show or hide the legend for the graph
		function legendToggle() {
			$("#legend").fadeToggle();
		};
		//action of advanced options switch
		function advancedSwitch() {
			//if control panel for bar chart is open, change open control panel to line graph
			if (activeView == "controlBar") {
				controlSwitchTo("controlLine");
			}
			//show legend switch
			$(".legendOuter").fadeToggle();
			//show bar chart control
			$("#control .bar").slideToggle(function () { resizeLinks(); });
		};
		//
		function newBarChart(dateArraySet, dataArray0Set, dataArray1Set) {
			//if there is an old chart, destroy it
			if (counterChart > 0) {
				myBar.destroy();
			}
			counterChart++;
			if (dataArray1Set[0] == "none") {
				var columnsValue0 = document.querySelectorAll('#' + activeView + ' .styled-select .columnsSelect0')[0].value;
				var colors0 = getColor(document.querySelectorAll('#' + activeView + ' .styled-select .columnsSelect0')[0].value, ["1", "0.8", "0.75", "0.5"]);
				var barChartData = {
					labels: dateArraySet,
					datasets: [
						{
							label: "0",
							fillColor: colors0[3],
							strokeColor: colors0[1],
							highlightFill: colors0[2],
							highlightStroke: colors0[0],
							data: dataArray0Set
						}
					]
				}
				var ctx = document.getElementById("canvas").getContext("2d");
				window.myBar = new Chart(ctx).Bar(barChartData, {
					responsive: true,
					legendTemplate: "<h1>Legend:</h1><ul class=\"legend\"><li style=\"color:" + colors0[0] + "\"><span>" + getName(columnsValue0) + " (" + getUnit(columnsValue0) + ")</span></li></ul>"
				});
			} else {
				var columnsValue0 = document.querySelectorAll('#' + activeView + ' .styled-select .columnsSelect0')[0].value;
				var columnsValue1 = document.querySelectorAll('#' + activeView + ' .styled-select .columnsSelect1')[0].value;
				var colors0 = getColor(document.querySelectorAll('#' + activeView + ' .styled-select .columnsSelect0')[0].value, ["1", "0.8", "0.75", "0.5"]);
				var colors1 = getColor(document.querySelectorAll('#' + activeView + ' .styled-select .columnsSelect1')[0].value, ["1", "0.8", "0.75", "0.5"]);
				var barChartData = {
					labels: dateArraySet,
					datasets: [
						{
							label: "0",
							fillColor: colors0[3],
							strokeColor: colors0[1],
							highlightFill: colors0[2],
							highlightStroke: colors0[0],
							data: dataArray0Set
						},
						{
							label: "1",
							fillColor: colors1[3],
							strokeColor: colors1[1],
							highlightFill: colors1[2],
							highlightStroke: colors1[0],
							data: dataArray1Set
						}
					]
				}
				var ctx = document.getElementById("canvas").getContext("2d");
				window.myBar = new Chart(ctx).Bar(barChartData, {
					responsive: true,
					legendTemplate: "<h1>Legend:</h1><ul class=\"legend\"><li style=\"color:" + colors0[0] + "\"><span>" + getName(columnsValue0) + " (" + getUnit(columnsValue0) + ")</span></li><li style=\"color:" + colors1[0] + "\"><span>" + getName(columnsValue1) + "  (" + getUnit(columnsValue1) + ")</span></li></ul>"
				});
			}
			document.getElementById("legend").innerHTML = window.myBar.generateLegend();
		}
		//
		function newLineChart(dateArraySet, dataArray0Set, dataArray1Set) {
			//if there is an old chart, destroy it
			if (counterChart > 0) {
				myBar.destroy();
			}
			counterChart++;
			if (dataArray1Set[0] == "none") {
				//if there is only one value which should be displayed
				var columnsValue0 = document.querySelectorAll('#' + activeView + ' .styled-select .columnsSelect0')[0].value;
				var colors0 = getColor(document.querySelectorAll('#' + activeView + ' .styled-select .columnsSelect0')[0].value, ["1", "0.2"]);
				var barChartData = {
					labels: dateArraySet,
					datasets: [
						{
							label: "0",
							fillColor: colors0[1],
							strokeColor: colors0[0],
							pointColor: colors0[0],
							pointStrokeColor: "#fff",
							pointHighlightFill: "#fff",
							pointHighlightStroke: colors0[0],
							data: dataArray0Set
						}
					]
				}
				//create a drawing area, where the 
				var context = document.getElementById("canvas").getContext("2d");
				//create new chart in prepared area
				window.myBar = new Chart(context).Line(barChartData, {
					responsive: true,
					legendTemplate: "<h1>Legend:</h1><ul class=\"legend\"><li style=\"color:" + colors0[0] + "\"><span>" + getName(columnsValue0) + " (" + getUnit(columnsValue0) + ")</span></li></ul>",
					bezierCurve: false,
					scaleShowGridLines: false,
				});
			} else {
				//if there are two values to be displayed
				//this is very similar to the other option
				var columnsValue0 = document.querySelectorAll('#' + activeView + ' .styled-select .columnsSelect0')[0].value;
				var columnsValue1 = document.querySelectorAll('#' + activeView + ' .styled-select .columnsSelect1')[0].value;
				var colors0 = getColor(document.querySelectorAll('#' + activeView + ' .styled-select .columnsSelect0')[0].value, ['1', '0.2']);
				var colors1 = getColor(document.querySelectorAll('#' + activeView + ' .styled-select .columnsSelect1')[0].value, ['1', '0.2']);
				var barChartData = {
					labels: dateArraySet,
					datasets: [
						{
							label: "0",
							fillColor: colors0[1],
							strokeColor: colors0[0],
							pointColor: colors0[0],
							pointStrokeColor: "#fff",
							pointHighlightFill: "#fff",
							pointHighlightStroke: colors0[0],
							data: dataArray0Set
						},
						{
							label: "1",
							fillColor: colors1[1],
							strokeColor: colors1[0],
							pointColor: colors1[0],
							pointStrokeColor: "#fff",
							pointHighlightFill: "#fff",
							pointHighlightStroke: colors1[0],
							data: dataArray1Set
						}
					]
				}
				var context = document.getElementById("canvas").getContext("2d");
				//i don't know, how this works, but this method creates a line chart with two values
				//this uses the code from the chart_min.js file
				window.myBar = new Chart(context).WeatherLine(barChartData, {
					responsive: true,
					legendTemplate: "<h1>Legend:</h1><ul class=\"legend\"><li style=\"color:" + colors0[0] + "\"><span>" + getName(columnsValue0) + " (" + getUnit(columnsValue0) + ")</span></li><li style=\"color:" + colors1[0] + "\"><span>" + getName(columnsValue1) + " (" + getUnit(columnsValue1) + ")</span></li></ul>"
				});
			}
			document.getElementById("legend").innerHTML = window.myBar.generateLegend();
		}
	</script>
</head>

<body>
		<div id="links">
			<div class="a0"><a href="http://www.waldorfschule-ismaning.de">Back to the website from which you came</a></div>
			<div class="a1"><a href="#">Information about this website</a></div>
			<div class="a2"><a href="#">Contact</a></div>
		</div>
		<div id="control">
			<ul>
				<li>
					<div class="openLink line"><a href="#" onClick="controlSwitchTo('controlLine')">Line Chart</a>
						<div class="advancedOuter">
							<span class="title">Advanced Options</span>
							<div class="advancedSwitch">
								<div class="onoffswitch">
									<input name="onoffswitch" class="onoffswitch-checkbox" id="onoffswitch2" checked=""
										type="checkbox" onchange="advancedSwitch();">
									<label class="onoffswitch-label" for="onoffswitch2">
										<div class="onoffswitch-inner"></div>
										<span class="onoffswitch-switch"></span>
									</label>
								</div>
							</div>
						</div>
					</div>
					<div class="control" id="controlLine">
						<div class="styled-select">
							<label>Interval</label>
							<select class="interval" name="interval" onChange="onAnyChange(4000)">
								<option value="all">All</option>
								<option value="hour">Every sixty minutes</option>
								<option value="day">Every day</option>
								<option value="month">Each month</option>
							</select>
						</div>
						<div class="styled-select">
							<label>Select one measurement</label>
							<select class="columnsSelect0" name="columns0" onChange="onAnyChange(4000)">
								<option value="temp">Temperature</option>
								<option value="pressure">Pressure</option>
								<option value="hum">Humidity</option>
								<option value="windspeed">Wind speed</option>
								<option value="rainrate">Rain rate</option>
								<option value="uvindex">UV-index</option>
							</select>
						</div>
						<div class="styled-select">
							<label>Select the second one</label>
							<select class="columnsSelect1" name="columns1" onChange="onAnyChange(4000)">
								<option value="none">None</option>
								<option value="temp">Temperature</option>
								<option value="pressure">Pressure</option>
								<option value="hum">Humidity</option>
								<option value="windspeed">Wind speed</option>
								<option value="rainrate">Rain rate</option>
								<option value="uvindex">UV-index</option>
							</select>
						</div>
						<div class="legendOuter">
							<span class="title">Legend</span>
							<div class="legendSwitch">
								<div class="onoffswitch">
									<input name="onoffswitch" class="onoffswitch-checkbox" id="onoffswitch1" checked=""
										type="checkbox" onchange="legendToggle();">
									<label class="onoffswitch-label" for="onoffswitch1">
										<div class="onoffswitch-inner"></div>
										<span class="onoffswitch-switch"></span>
									</label>
								</div>
							</div>
						</div>
					</div>
				</li>
				<!-- 
					this bar is not used and does not appear on the website
					I really don't know why. I cant find the css line, that hides this...
				-->
				<li class="bar">
					<div class="openLink bar"><a href="#" onClick="controlSwitchTo('controlBar')">Bar Chart</a></div>
					<div class="control" id="controlBar">
						<div class="styled-select">
							<label>Interval</label>
							<select class="interval" name="interval" onChange="onAnyChange(4000)">
								<option value="all">All</option>
								<option value="hour">Every sixty minutes</option>
								<option value="day">Every day</option>
								<!--<option value="month">Each month</option>-->
							</select>
						</div>
						<div class="styled-select">
							<label>Select one measurement</label>
							<select class="columnsSelect0" name="columns0" onChange="onAnyChange(4000)">
								<option value="temp">Temperature</option>
								<option value="pressure">Pressure</option>
								<option value="hum">Humidity</option>
								<option value="windspeed">Wind speed</option>
								<option value="winddir">Wind direction</option>
								<option value="rainrate">Rain rate</option>
								<option value="uvindex">UV-index</option>
							</select>
						</div>
						<div class="styled-select">
							<label>Select the second one</label>
							<select class="columnsSelect1" name="columns1" onChange="onAnyChange(4000)">
								<option value="none">None</option>
								<option value="temp">Temperature</option>
								<option value="pressure">Pressure</option>
								<option value="hum">Humidity</option>
								<option value="windspeed">Wind speed</option>
								<option value="winddir">Wind direction</option>
								<option value="rainrate">Rain rate</option>
								<option value="uvindex">UV-index</option>
							</select>
						</div>
						<div class="legendOuter">
							<span class="title">Legend</span>
							<div class="legendSwitch">
								<div class="onoffswitch">
									<input name="onoffswitch" class="onoffswitch-checkbox" id="onoffswitch0" checked=""
										type="checkbox" onchange="legendToggle();">
									<label class="onoffswitch-label" for="onoffswitch0">
										<div class="onoffswitch-inner"></div>
										<span class="onoffswitch-switch"></span>
									</label>
								</div>
							</div>
						</div>
					</div>
				</li>
				<li>
					<div class="openLink table"><a href="#" onClick="controlSwitchTo('controlTable')">Table</a></div>
					<div class="control" id="controlTable">
						<div class="styled-select">
							<label>Interval</label>
							<select class="interval" name="interval" onChange="onAnyChange(4000)">
								<option value="all">All</option>
								<option value="hour">Every sixty minutes</option>
								<option value="day">Every day</option>
								<!--<option value="month">Each month</option>-->
							</select>
						</div>
						<div class="styled-select multiple">
							<label>Select all measurements</label>
							<select class="select-toggle columnsSelect" name="columns0" multiple="multiple"
								onChange="onAnyChange(4000)">
								<option value="temp">Temperature</option>
								<option value="pressure">Pressure</option>
								<option value="hum">Humidity</option>
								<option value="windspeed">Wind speed</option>
								<option value="winddir">Wind direction</option>
								<option value="rainrate">Rain rate</option>
								<option value="uvindex">UV-index</option>
							</select>
						</div>
					</div>
				</li>
				<li><div class="control bar">This is a simple test</div></li>
			</ul>
		</div>
	<!-- panel that shows the graph(s) if the data is available -->
	<div id="content">
		<div id="legendOut">
			<div id="legend"></div>
		</div>
		<div id="canvasCon"><canvas id="canvas"></canvas></div>
		<div id="table"></div>
		<div id="timeline">
			<div class="a0 inner left"></div>
			<div class="a1 inner left"></div>
			<div class="outer center">
				<div class="inner i0"></div>
				<div class="inner i1"></div>
				<div class="inner t0"><input type="text" onChange="changeDate(2,0)" data-format="YYYY-MM-DD"
						data-template="D MMM YYYY" name="date" value="2012-07-09"></input></div>
			</div>
			<div class="a3 inner right"></div>
			<div class="a2 inner right"></div>
		</div>
	</div>
</body>

</html>