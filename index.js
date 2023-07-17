
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

    // create date pickers
    // this calls changeDate() which in turn calls v.update()
    let datePickerData = {minYear: 2012, maxYear: (new Date().getFullYear()), firstItem: "none", smartDays: true}
    $("#date-picker1").combodate(datePickerData);
    $("#date-picker2").combodate(datePickerData);

    //set ending date for date pickers
    v.endDate = normalizeDate(new Date())
    v.endDate.setDate(v.endDate.getDate()+1)
    let endDate = v.endDate.getDate()
    // set starting date for date pickers
    v.startDate = new Date(v.endDate)
    v.startDate.setDate(endDate-7)

    // set date pickers values
    $("#date-picker1").combodate("setValue", v.startDate)
    $("#date-picker2").combodate("setValue", v.endDate)
})

// set hours, minutes and seconds as well as ms to 0
function normalizeDate(date) {
    newDate = new Date(date);
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
}

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

// update the date variables of the visualization
function changeDate(selectorIndex) {
    v.update()
    if (selectorIndex == 0) {
        let dateStr = $("#date-picker1").combodate('getValue', 'YYYY-M-DD')
        let dateArray = dateStr.split('-')
        v.startDate.setYear(Number(dateArray[0]))
        v.startDate.setMonth(Number(dateArray[1])-1)
        v.startDate.setDate(Number(dateArray[2]))
        // console.log(v.startDate)
    } else if (selectorIndex == 1) {
        let dateStr = $("#date-picker2").combodate('getValue', 'YYYY-M-DD')
        let dateArray = dateStr.split('-')
        v.endDate.setYear(Number(dateArray[0]))
        v.endDate.setMonth(Number(dateArray[1])-1)
        v.endDate.setDate(Number(dateArray[2]))
        // console.log(v.endDate)
    } else {
        throw TypeError(`Selector Index must be valid index! It can't be ${selectorIndex}`)
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
    spinner;
    requestNum = 0;

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
        this.spinner = new Spinner(spinnerOptions).spin(document.getElementById('content'))
    }
    stopSpinner(){
        this.spinner.stop();
    }
    getDateStr(date) {
        return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} 00:00:00`
    }
    getData(){
        if (this.requestNum > 0) {
            return
        }
        this.startSpinner()
        this.requestNum++;

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
                v.stopSpinner()
                v.requestNum--;
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
        // let startDateStr = this.getDateStr(this.startDate)
        // let endDateStr = this.getDateStr(this.endDate)
        let startDateStr = ''
        let endDateStr = ''

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