
// flags
var changeDateLock, // locks the execution for the event listener changeDate()
    dateWarningActive = false, // shows, that the starting and the end date values are in the wrong order
    requestNum = 0; // number of requests sent -> caps the maximum number of open requests to 1
// awaitDataResponse = false; // shows that db data is being requested

// the spinner for loading data
var spinner;
var spinnerOptions = {
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

// When the page is loaded:
// - resize the link and content panel
// - initialize the date pickers
// - create a new visualization
// - calculate the initial date values
// - create a new graph
// - call update() method of visualization
$(document).ready(function () {
    // adjust site appearance
    resizeLinkPanel();
    resizeContent();

    // create date pickers
    // stops execution of changeDate() function to remove unnecessary calculations and bugs
    changeDateLock = true
    // this calls changeDate() which gets blocked by changeDateLock
    let datePickerData = { minYear: 2012, maxYear: (new Date().getFullYear()), firstItem: "none", smartDays: true }
    $("#date-picker1").combodate(datePickerData);
    $("#date-picker2").combodate(datePickerData);

    // visualization object
    v = new Visualization();

    // set ending and start date for date pickers
    // starting interval is 1 week
    v.endDate = normalizeDate(new Date())
    v.endDate.setDate(v.endDate.getDate() + 1)
    let endDate = v.endDate.getDate()
    v.startDate = new Date(v.endDate)
    v.startDate.setDate(endDate - 7)
    // set date pickers values
    $("#date-picker1").combodate("setValue", v.startDate)
    $("#date-picker2").combodate("setValue", v.endDate)
    changeDateLock = false

    // create graph
    v.createGraph()

    // update the values of the visualization
    v.update()
})

// ---------- Layout ----------
// Do the same as $(document).ready() just, when the window gets resized
window.onresize = function (event) {
    resizeLinkPanel()
    resizeContent()
}
// Resize the link panel and place the links in the right places
function resizeLinkPanel() {
    var vertPanelHeight = $(window).height() - 32;
    var contentHeight = $("#control").outerHeight(true) + 20;
    // change height of link panel
    $('#links').css({ 'height': vertPanelHeight + 'px' });
    // change position of the middle link
    $('#links .middle').css({ 'margin-top': vertPanelHeight / 2 - 128 + 'px' });
    // change position of the bottom line
    $('#links .bottom').css({ 'margin-top': vertPanelHeight / 2 - 160 + 'px' });
}
// Resize the content panel (animated)
function resizeContent() {
    $('#content').animate({ 'min-height': $(window).height() - 50 - $("#control").outerHeight(true) + 'px' }, 200);
}
// Change the view on the control panels
function switchControl(id) {
    var state = $('#' + id).css('display'); // state of the clicked panel
    // if graph controls are open -> close them
    if ($('#graph').css('display') == 'block') {
        v.setViewMode('graph')
        $('#graph').slideUp(resizeContent)
    }
    // if table controls are open -> close them
    else {
        v.setViewMode('table')
        $('#table').slideUp(resizeContent)
        // slide up bottom blue line
        $('.title-bar.bottom').slideUp(resizeContent)
        $('#table-title').css({ 'border-radius': '0px 0px 4px 4px' })
    }
    // if clicked controls are not open -> open them
    if (state != 'block') {
        // if table gets opened, show bottom blue line
        if (id == "table") {
            $('.title-bar.bottom').slideDown(resizeContent)
            // change the corners
            $('#table-title').css({ 'border-radius': '0px' })
        }
        // show the controls that were clicked
        $('#' + id).slideDown(resizeContent)
    }
}

// -------- Utilities --------
// set hours, minutes and seconds as well as ms of date object to 0
function normalizeDate(date) {
    newDate = new Date(date);
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
}
function startSpinner() {
    spinner = new Spinner(spinnerOptions).spin(document.getElementById('content'));
}
function stopSpinner() {
    spinner.stop();
}

// event handler for the date pickers
function changeDate(selectorIndex) {
    if (changeDateLock) {
        return
    }
    if (selectorIndex == 0) {
        let dateStr = $("#date-picker1").combodate('getValue', 'YYYY-M-DD')
        let dateArray = dateStr.split('-')
        let newDate = new Date(v.startDate)
        newDate.setYear(Number(dateArray[0]))
        newDate.setMonth(Number(dateArray[1]) - 1)
        newDate.setDate(Number(dateArray[2]))
        if (newDate >= v.endDate) {
            $(".selection")[2].style.backgroundColor = '#bf1717'
            dateWarningActive = true
        } else {
            $(".selection")[2].style.backgroundColor = '#3b8ec2'
            $(".selection")[3].style.backgroundColor = '#3b8ec2'
            dateWarningActive = false
        }
        v.startDate = new Date(newDate)
    } else if (selectorIndex == 1) {
        let dateStr = $("#date-picker2").combodate('getValue', 'YYYY-M-DD')
        let dateArray = dateStr.split('-')
        let newDate = new Date(v.endDate)
        newDate.setYear(Number(dateArray[0]))
        newDate.setMonth(Number(dateArray[1]) - 1)
        newDate.setDate(Number(dateArray[2]))
        if (newDate <= v.startDate) {
            $(".selection")[3].style.backgroundColor = '#bf1717'
            dateWarningActive = true
        } else {
            $(".selection")[2].style.backgroundColor = '#3b8ec2'
            $(".selection")[3].style.backgroundColor = '#3b8ec2'
            dateWarningActive = false
        }
        v.endDate = new Date(newDate)
        // console.log(v.endDate)
    } else {
        throw TypeError(`Selector Index must be valid index! It can't be ${selectorIndex}`)
    }
    v.update()
}

// class that handles the data as well as the visualization
class Visualization {
    // variables
    viewMode = "graph"; // either graph or table
    selection1; // first selected value
    selection2; // second selected value
    startDate; // starting date for visualization
    endDate; // ending date for visualization
    data; // list of data objects filled by getData() method
    graph; // the graph object
    initialGraphData = {
        type: 'line',
        data: {
            datasets: [{
                data: [{'entryDate': new Date(), temp: NaN}, {'entryDate': new Date(), temp: NaN}]
            }]
        },
        options: {
            parsing: {
                xAxisKey: 'entryDate',
                yAxisKey: 'temp'
            },
            scales: {
                x: {
                    type: 'time',
                }
            }
        }
    }

    update() {
        // update attributes
        this.selection1 = document.getElementById('selection1').value;
        this.selection2 = document.getElementById('selection2').value;

        // get the data from the database
        this.getData()
    }
    getData() {
        if (requestNum > 0) {
            return
        }
        startSpinner()
        requestNum++

        if (window.XMLHttpRequest) { // try to create a request
            var request = new XMLHttpRequest();
        }
        else if (window.ActiveXObject) { // method for older browsers
            var request = new ActiveXObject("Msxml2.XMLHTTP");
        }
        else {
            alert('Ajax is not supported by this browser!');
        }

        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                stopSpinner()
                requestNum--;

                let resultString = request.responseText; // looks like: '2022-06-16 00:00:00|16.9&20...'
                if (resultString == "no data returned") {
                    v.data = [];
                    return;
                }
                let dataList = [];
                // decode received data String into list of objects
                let tempArray = resultString.split('&');
                let valueKeys = tempArray.shift().split(', '); // get first entry of tempArray and create valueKeys from it
                tempArray.forEach(function (currentVal, i) {
                    let newDataObj = {};
                    let values = currentVal.split('|');
                    for (const [index, key] of valueKeys.entries()) {
                        if (key == 'entryDate') {
                            // transform into date object
                            let dateAndTime = values[index].split(' ')
                            let dateList = dateAndTime[0].split('-')
                            let timeList = dateAndTime[1].split(':')
                            let year = Number(dateList[0])
                            let monthIndex = Number(dateList[1]) - 1
                            let day = Number(dateList[2])
                            let hour = Number(timeList[0])
                            let minute = Number(timeList[1])
                            newDataObj[key] = new Date(year, monthIndex, day, hour, minute)
                        } else if (['temp', 'pressure', 'hum', 'windspeed', 'rainrate', 'uvindex'].includes(key)) {
                            // transform into number
                            newDataObj[key] = Number(values[index])
                        }
                    }
                    dataList.push(newDataObj);
                });
                // v.data = dataList;
                v.graph.data.datasets[0].data = dataList
                v.graph.update()
                // v.createGraph()
                // console.log(v.data)
                // awaitDataResponse = false;
            }
        }

        // initialize the request
        request.open('POST', 'php/getDataCopy.php');
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        // send request
        let secondSelectionStr;
        if (this.selection2 == 'none') {
            secondSelectionStr = '';
        } else {
            secondSelectionStr = `, ${this.selection2}`;
        }
        let startDateStr = this.getDateStr(this.startDate)
        let endDateStr = this.getDateStr(this.endDate)

        let requestStr = 'selection1=' + this.selection1 + '&selection2=' + secondSelectionStr + '&startDate=' + startDateStr + '&endDate=' + endDateStr;
        // console.log(requestStr)
        // awaitDataResponse = true
        request.send(requestStr)
    }

    // utils
    getDateStr(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 00:00:00`
    }

    // view mode
    setViewMode(val) {
        if (['table', 'graph'].includes(val)) {
            this.viewMode = val
        } else {
            throw new TypeError("val must be either \"graph\" or \"table\" but it can't be " + val)
        }
    }
    createGraph() {
        // create graph
        let context = document.querySelector('canvas')
        this.graph = new Chart(context, this.initialGraphData)
    }
    createTable() {/*display text: not available yet / noch nicht verfügbar*/ }
}