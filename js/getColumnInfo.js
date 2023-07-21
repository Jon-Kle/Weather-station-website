function getColor(type) {
	let colors = {}
	switch (type) {
		case "temp":
			colors.backgroundColor = '#E6332B'
			colors.borderColor = '#AE251D'
			break;
		case "pressure":
			// colors.backgroundColor = '#326084'
			// colors.borderColor = '#0A344E'
			colors.backgroundColor = '#5CC85C'
			colors.borderColor = '#1D771D'
			break;
		case "hum":
			colors.backgroundColor = '#3498DB'
			colors.borderColor = '#0569AC'
			break;
		case "windspeed":
			colors.backgroundColor = '#73D7FF'
			colors.borderColor = '#2F93D6'
			break;
		case "winddir":
			colors.backgroundColor = ''
			colors.borderColor = ''
			break;
			case "rainrate":
			colors.backgroundColor = '#9D90F4'
			colors.borderColor = '#6B5EC2'
			break;
		case "uvindex":
			colors.backgroundColor = '#C631F9'
			colors.borderColor = '#9E09D1'
			break;
	}
	return colors;
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