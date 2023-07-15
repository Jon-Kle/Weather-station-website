
var viewMode = "lineChart",
    interval = "month",
    frequency, // calculated in $(document).ready()
    selection1 = "temp",
    selection2 = "none",
    firstDate, // calculated in $(document).ready()
    firstDateStr,
    lastDate, // calculated in $(document).ready()
    lastDateStr,
    data;

// needs to be predefined for event calling
var v;

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

// When the page is loaded, resize the link panel 
// and the content panel.
$(document).ready(function () {
    resizeLinkPanel();
    resizeContent();

    // visualization object
    v = new Visualization();
    // calculate first entry of the last month
    v.startDate = new Date();
    v.startDate.setMonth(v.startDate.getMonth() - 1);
    v.startDate.setDate(1);
    v.startDate.setHours(0);
    v.startDate.setMinutes(0);
    v.startDate.setSeconds(0);
    v.startDate.setMilliseconds(0);

    v.endDate = new Date()
})

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
// ----------------------
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

class Visualization{
    // variables
    labelFrequency;
    selection1;
    selection2;
    viewMode;
    startDate;
    endDate;
    dateRange = 'month';
    data;

    range = [] // date range of entries to show
    graphData = {
        type: 'line',
        data: {
            labels: [1, 2, 3, 4, 5],
            datasets: [{
                label: '',
                data: [],
                borderWidth: 1,
                yAxisID: 'y'
            }, {
                label: '',
                data: [],
                borderWidth: 1,
                yAxisID: 'y1'
            }
            ]
        },
        options: {
            animation: {
                duration: 200
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left'
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right'
                }
            },
        },
    };
    visState = "graph" // options: graph, table

    constructor(){
        // initialize attributes
        this.labelFrequency = document.getElementById('interval').value;
        this.selection1 = document.getElementById('selection1').value;
        this.selection2 = document.getElementById('selection2').value;

        // set starting range
        // set starting selection
        // update

    }
    setViewMode(val){
        if (['table', 'graph'].includes(val)){
            viewMode = val
        } else {
            throw new TypeError("val must be either \"graph\" or \"table\" but it can't be " + val)
        }
    }
    update(){
        // update attributes
        this.labelFrequency = document.getElementById('interval').value;
        this.selection1 = document.getElementById('selection1').value;
        this.selection2 = document.getElementById('selection2').value;

        this.getData()
        // get data that is not yet loaded
        //  -> Data will be of type object

        // empty data, scale, labels
        // setScale
        // setLabels
        // setVisData


        // change in type of visualization
        // remove Graph
        // show Table
        // or inverted
    }
    startSpinner(){
        spinner = new Spinner(spinnerOptions).spin(document.getElementById('content'))
    }
    stopSpinner(){
        spinner.stop();
    }
    getDateStr(date) {
        return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} 00:00:00`
    }
    getData(){
        if (window.XMLHttpRequest) { // try to create a request
            var request = new XMLHttpRequest();
        }
        else if (window.ActiveXObject) { // method for older browsers
            var request = new ActiveXObject("Msxml2.XMLHTTP");
        }
        else {
            alert('Ajax is not supported by this browser!');
        }

        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) {
                let resultString = request.responseText; // looks like: '2022-06-16 00:00:00|16.9&20...'
                let tempArray;
                let dataArray = [];
                // decode received data String
                tempArray = resultString.split('&')
                tempArray.forEach(function (currentVal, i) {
                    dataArray.push(currentVal.split('|'));
                });
                v.data = dataArray;
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
        console.log(this.startDate)
        console.log(this.endDate)
        let startDateStr = this.getDateStr(this.startDate)
        let endDateStr = this.getDateStr(this.endDate)

        let requestStr = 'selection1=' + this.selection1 + '&selection2=' + secondSelectionStr + '&startDate=' + startDateStr + '&endDate=' + endDateStr;
        request.send(requestStr)
    }
    exchangeVisData(dataset, data){
        // dataset -> number
        // data -> list
    }
    setSelection(side, name){
        // side -> number
        // name -> string
    }
    setLabels(){
        // create labels for the graph (writing on the x-axis)
    }

    // change visualization type
    setVisType(type){
        // change between graph and table
        // if switching, clear html space and call create...()
    }
    createGraph(){
        // create the graph on top of canvas
    }
    createTable(){
        // display text: not available yet / noch nicht verfügbar
    }
}