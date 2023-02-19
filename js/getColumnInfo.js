function getColor(type, alpha) {
	// return alpha["0"];
	
	var color;
	var colorArray = [];
	switch (type) {
			case "temp":
				color = "rgba(231, 76, 60, ";
				break;
			case "pressure":
				color = "rgba(10, 100, 10, ";
				break;
			case "hum":
				color = "rgba(52, 152, 219, ";
				break;
			case "windspeed":
				color = "rgba(52, 152, 219, ";
				break;
			case "winddir":
				color = "rgba(52, 152, 219, ";
				break;
			case "rainrate":
				color = "rgba(149, 165, 166, ";
				break;
			case "uvindex":
				color = "rgba(192, 57, 43, ";
				break;
	}
	for (var i = 0; i < alpha.length; i++) {
		colorArray.push(color + alpha[i] + ")");
	}
	return colorArray;
}

function getName(type) {
	switch (type) {
		case "temp":
			return "Temperature"
		case "pressure":
			return "Pressure"
		case "hum":
			return "Humidity"
		case "windspeed":
			return "Wind speed"
		case "winddir":
			return "Wind direction"
		case "rainrate":
			return "Rain rate"
		case "uvindex":
			return "UV-index"
	}
}

function getUnit(type) {
	switch (type) {
		case "temp":
			return "°C"
		case "pressure":
			return "hPa"
		case "hum":
			return "%"
		case "windspeed":
			return "km/h"
		case "rainrate":
			return "mm/h"
		case "uvindex":
			return ""
	}
}