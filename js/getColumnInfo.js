function getColor(type, alpha) {
	var color;
	var colorArray = [];
	switch (type) {
			case "tempout":
				color = "rgba(231, 76, 60, ";
				break;
			case "hitemp":
				color = "rgba(241, 196, 15, ";
				break;
			case "lowtemp":
				color = "rgba(41, 128, 185, ";
				break;
			case "outhum":
				color = "rgba(52, 152, 219, ";
				break;
			case "dewpt":
				color = "rgba(46, 204, 113, ";
				break;
			case "windspeed":
				color = "rgba(39, 174, 96, ";
				break;
			case "windrun":
				color = "rgba(127, 140, 141, ";
				break;
			case "hispeed":
				color = "rgba(211, 84, 0, ";
				break;
			case "windchill":
				color = "rgba(127, 140, 141, ";
				break;
			case "thwindex":
				color = "rgba(127, 140, 141, ";
				break;
			case "bar":
				color = "rgba(22, 160, 133, ";
				break;
			case "rain":
				color = "rgba(52, 73, 94, ";
				break;
			case "rainrate":
				color = "rgba(149, 165, 166, ";
				break;
			case "solarrad":
				color = "rgba(201, 156, 15, ";
				break;
			case "solarenergy":
				color = "rgba(211, 84, 0,";
				break;
			case "hisolarrad":
				color = "rgba(230, 126, 34, ";
				break;
			case "uvindex":
				color = "rgba(192, 57, 43, ";
				break;
			case "uvdose":
				color = "rgba(155, 89, 182, ";
				break;
			case "hiuv":
				color = "rgba(230, 126, 34, ";
				break;
			case "heatdd":
				color = "rgba(127, 140, 141, ";
				break;
			case "cooldd":
				color = "rgba(127, 140, 141, ";
				break;
	}
	for (var i = 0; i < alpha.length; i++) {
		colorArray.push(color + alpha[i] + ")");
	}
	return colorArray;
}
function getName(type) {
	/** get the real name of the value name. e.g. tempout => Temperature */
	switch (type) {
		case "none" : 
		return "None";
		case "tempout" : 
		return "Temperature";
		case "hitemp" : 
		return "Highest temperature";
		case "lowtemp" : 
		return "Lowest temperature";
		case "outhum" : 
		return "Humidity";
		case "dewpt" : 
		return "Dew point";
		case "windspeed" : 
		return "Wind speed";
		case "winddir" : 
		return "Wind direction";
		case "windrun" : 
		return "Wind run";
		case "hispeed" : 
		return "Highest wind speed";
		case "hidir" : 
		return "Direction of highest wind speed";
		case "windchill" : 
		return "Wind chill";
		case "heatindex" : 
		return "Heat index";
		case "thwindex" : 
		return "Temp./dampness/wind-index";
		case "thswindex" : 
		return "Temp./dampness/sun/wind-index";
		case "bar" : 
		return "Air pressure";
		case "rain" : 
		return "Rain";
		case "rainrate" : 
		return "Rain rate";
		case "solarrad" : 
		return "Solar rad";
		case "solarenergy" : 
		return "Solar energy";
		case "hisolarrad" : 
		return "Highest solar rad";
		case "uvindex" : 
		return "UV index";
		case "uvdose":
		return "UV dose";
		case "hiuv" : 
		return "Highest UV";
		case "heatdd" : 
		return "heatdd";
		case "cooldd" : 
		return "cooldd";
	}
}
function getUnit(type) {
	switch (type) {
		case "tempout" : 
		case "hitemp" : 
		case "lowtemp" : 
		return "C°";
		case "outhum" : 
		return "%";
		case "dewpt" : 
		return "kPa";
		case "windspeed" : 
		case "hispeed" :
		return "km/h";
		case "winddir" : 
		return "*";
		case "windrun" : 
		return "";
		case "hidir" : 
		return "*";
		case "windchill" : 
		return "WCT";
		case "heatindex" : 
		return "HI";
		case "thwindex" : 
		return "*";
		case "thswindex" : 
		return "*";
		case "bar" : 
		return "hPa";
		case "rain" : 
		return "mm";
		case "rainrate" : 
		return "*";
		case "solarrad" : 
		return "*";
		case "solarenergy" : 
		case "hisolarrad" : 
		return "kW/m<sup>2</sup>";
		case "uvindex" : 
		return "*";
		case "uvdose":
		return "mJ/cm<sup>2</sup>";
		case "hiuv" : 
		return "mJ/cm<sup>2</sup>";
		case "heatdd" : 
		return "*";
		case "cooldd" : 
		return "*";
	}
}