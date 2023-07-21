
// flags
var changeDateLock, // locks the execution for the event listener changeDate()
    dateWarningActive = false, // shows, that the starting and the end date values are in the wrong order
    requestNum = 0; // number of requests sent -> caps the maximum number of open requests to 1

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
    let datePickerData = {
        minYear: 2012,
        maxYear: (new Date().getFullYear()),
        firstItem: "none",
        smartDays: true,
        yearDescending: false,
    }
    $("#date-picker1").combodate(datePickerData);
    $("#date-picker2").combodate(datePickerData);

    // visualization object
    v = new Visualization();

    // set ending and start dates for date pickers (starting interval is 1 week)
    // get endDate
    v.endDate = normalizeDate(new Date(), 'day')
    // calculate endDateExtended (+24h)
    v.endDateExtended = new Date(v.endDate)
    v.endDateExtended.setDate(v.endDate.getDate() + 1)
    // calculate startDate
    let endDate = v.endDate.getDate()
    v.startDate = new Date(v.endDate)
    v.startDate.setDate(endDate - 7)
    // set date pickers values
    $("#date-picker1").combodate("setValue", v.startDate)
    $("#date-picker2").combodate("setValue", v.endDate)
    changeDateLock = false

    // use the german names for the months
    moment.locale("de")
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
function normalizeDate(date, range) {
    newDate = new Date(date);
    switch (range) {
        case 'day':
            newDate.setHours(0);
            newDate.setMinutes(0);
            newDate.setSeconds(0);
            newDate.setMilliseconds(0);
            break;
        case 'half-hour':
            newDate.setSeconds(0)
            newDate.setMilliseconds(0)
            if (newDate.getMinutes() >= 45 || newDate.getMinutes() < 15) {
                newDate.setMinutes(0)
            } else if (15 <= newDate.getMinutes() && newDate.getMinutes() < 45) {
                newDate.setMinutes(30)
            }
    }
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
        // get new value as string
        let dateStr = $("#date-picker1").combodate('getValue', 'YYYY-M-DD')
        // parse string into date
        let dateArray = dateStr.split('-')
        let newDate = new Date(v.startDate)
        newDate.setYear(Number(dateArray[0]))
        newDate.setMonth(Number(dateArray[1]) - 1)
        newDate.setDate(Number(dateArray[2]))
        // warning for overlapping date values
        if (newDate >= v.endDateExtended) {
            $(".selection")[2].style.backgroundColor = '#bf1717' // red
            dateWarningActive = true
        } else {
            $(".selection")[2].style.backgroundColor = '#3b8ec2' // blue
            $(".selection")[3].style.backgroundColor = '#3b8ec2' // blue
            dateWarningActive = false
        }
        v.startDate = new Date(newDate)
    } else if (selectorIndex == 1) {
        // get new value a string
        let dateStr = $("#date-picker2").combodate('getValue', 'YYYY-M-DD');
        // parse string into date
        let dateArray = dateStr.split('-');
        let newDate = new Date(v.endDate);
        newDate.setYear(Number(dateArray[0]));
        newDate.setMonth(Number(dateArray[1]) - 1);
        newDate.setDate(Number(dateArray[2]));
        let newDateExtended = new Date(newDate);
        newDateExtended.setDate(newDate.getDate() + 1);
        // warning for overlapping date values
        if (newDateExtended <= v.startDate) {
            $(".selection")[3].style.backgroundColor = '#bf1717'; // red
            dateWarningActive = true;
        } else {
            $(".selection")[2].style.backgroundColor = '#3b8ec2'; // blue
            $(".selection")[3].style.backgroundColor = '#3b8ec2'; // blue
            dateWarningActive = false;
        }
        v.endDate = new Date(newDate);
        v.endDateExtended = new Date(newDateExtended);
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
    endDateExtended; // same as endDate only 24h are added to it
    data; // list of data objects filled by getData() method
    graph; // the graph object
    datasetNum = 1; // number of currently used datasets
    initialGraphData = {
        type: 'line',
        data: {
            datasets: [{
                parsing: {
                    xAxisKey: 'entryDate',
                    yAxisKey: 'temp'
                },
                yAxisID: 'y',
            }
            ]
        },
        options: {
            plugins: {
                legend: {
                    onClick: (event, legendItem, legend) => { },
                },
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        displayFormats: {
                            day: 'D. MMMM',
                            hour: 'H:mm',
                        },
                        tooltipFormat: 'D. MMMM, YYYY, H:mm'
                    },
                    ticks: {
                        minRotation: 10,
                    },
                },
                y: {
                    title: {
                        text: 'Temperature (°C)',
                        display: true,
                    },
                    beginAtZero: true,
                },
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
    updateGraph() {
        // templates
        let y2AxisTemplate = {
            title: {
                display: true,
                text: ''
            },
            position: 'right',
            beginAtZero: true,
        }
        let dataset2Template = {
            parsing: {
                xAxisKey: 'entryDate',
            },
            yAxisID: 'y2'
        }
        // x Axis range
        this.graph.options.scales.x.min = this.startDate;
        this.graph.options.scales.x.max = this.endDateExtended;

        // dataset 1
        // get label1
        let name1 = getName(this.selection1);
        let unit1 = getUnit(this.selection1);
        let label1 = name1 + ' (' + unit1 + ')';
        // update dataset and scale options
        this.graph.data.datasets[0].label = label1;
        this.graph.data.datasets[0].data = this.data;
        this.graph.data.datasets[0].parsing.yAxisKey = this.selection1;
        this.graph.data.datasets[0].backgroundColor = getColor(this.selection1).backgroundColor;
        this.graph.data.datasets[0].borderColor = getColor(this.selection1).borderColor;
        this.graph.options.scales.y.title.text = label1;

        // dataset 2 optionally
        if (this.selection2 != 'none') {
            if (this.datasetNum <= 1) {
                this.datasetNum++;
                // add dataset 2
                this.graph.data.datasets.push(dataset2Template)
                // add scale y2
                this.graph.options.scales.y2 = y2AxisTemplate;
            }

            // get label2
            let name2 = getName(this.selection2)
            let unit2 = getUnit(this.selection2)
            let label2 = name2 + ' (' + unit2 + ')'

            // update dataset and scale options
            this.graph.data.datasets[1].label = label2;
            this.graph.data.datasets[1].data = this.data
            this.graph.data.datasets[1].parsing.yAxisKey = this.selection2
            this.graph.data.datasets[1].backgroundColor = getColor(this.selection2).backgroundColor;
            this.graph.data.datasets[1].borderColor = getColor(this.selection2).borderColor;
            this.graph.options.scales.y2.title.text = label2
        } else if (this.datasetNum >= 2) {
            this.datasetNum--;
            // remove dataset 2
            this.graph.data.datasets.pop()
            // remove scale y2
            delete this.graph.options.scales.y2;
        }

        this.graph.update()
        resizeContent()
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

        // handle answer of request
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                stopSpinner()
                requestNum--;

                let responseString = request.responseText; // looks like: '2022-06-16 00:00:00|16.9&20...'
                v.data = v.parseDataStr(responseString)
                v.updateGraph()
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
        request.send(requestStr)
    }

    // utils
    getDateStr(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 00:00:00`
    }
    parseDataStr(dataStr) {
        // variables
        let entryList = [];
        let dataList = [];

        if (dataStr == 'no data returned') {
            return entryList;
        }

        // parse existing data
        let sectionArray = dataStr.split('&');
        let keys = sectionArray.shift().split(', ');
        for (let currentVal of sectionArray) {
            let newDataObj = {};
            let values = currentVal.split('|')
            for (const [index, key] of keys.entries()) {
                if (key == 'entryDate') {
                    // transform into date object
                    // get date components from date string
                    let dateAndTime = values[index].split(' ')
                    let dateList = dateAndTime[0].split('-')
                    let timeList = dateAndTime[1].split(':')
                    let year = Number(dateList[0])
                    let monthIndex = Number(dateList[1]) - 1
                    let day = Number(dateList[2])
                    let hour = Number(timeList[0])
                    let minute = Number(timeList[1])
                    // create new date
                    newDataObj[key] = new Date(year, monthIndex, day, hour, minute)
                } else if (['temp', 'pressure', 'hum', 'windspeed', 'rainrate', 'uvindex'].includes(key)) {
                    // transform into number
                    newDataObj[key] = Number(values[index])
                }
            }
            dataList.push(newDataObj)
        }

        // fill gaps with NaN
        let dataIndex = 0 // index of data
        // let currentDate = new Date(this.startDate)
        let currentDate = new Date(dataList[0]['entryDate'])
        currentDate = normalizeDate(currentDate, 'half-hour')
        while (true) {
            if (this.compareDates(currentDate, dataList[dataIndex]['entryDate'], 5 * 60 * 1000)) {
                entryList.push(dataList[dataIndex])
                dataIndex++;
                if (dataIndex >= dataList.length) {
                    break;
                }
            } else {
                let newEntryObj = { 'entryDate': new Date(currentDate) };
                newEntryObj[keys[1]] = NaN;
                if (keys.length > 2) {
                    newEntryObj[keys[2]] = NaN;
                }
                entryList.push(newEntryObj)
            }

            currentDate.setMinutes(currentDate.getMinutes() + 30)
            if (currentDate >= this.endDateExtended) {
                break;
            }
        }
        return entryList;
    }
    compareDates(date1, date2, precisionInMS) {
        let dateDiff = Math.abs(date1 - date2)
        return dateDiff <= precisionInMS ? true : false
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