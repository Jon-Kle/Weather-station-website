
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
    resizeLinkPanel()
    resizeContent()
    // calculate first entry of the last month
    firstDate = new Date()
    firstDate.setMonth(firstDate.getMonth() - 1)
    firstDate.setDate(1)
    firstDate.setHours(0)
    firstDate.setMinutes(0)
    firstDate.setSeconds(0)
    firstDate.setMilliseconds(0)
    lastDate = firstDate.setMonth(firstDate.getMonth() + 1)
})

// Do the same as $(document).ready() just, 
// when the window gets resized
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
    // hide the lineChart controls if necessary
    if ($('#lineChart').css('display') == 'block') {
        viewMode = "lineChart"
        $('#lineChart').slideUp(resizeContent)
        // hide the table controls if necessary
        // also hide the blue bottom line and adjust the corners
    } else {
        viewMode = "table"
        $('#table').slideUp(resizeContent)
        $('.title-bar.bottom').slideUp(resizeContent)
        $('#table-title').css({ 'border-radius': '0px 0px 4px 4px' })
    }
    // if the clicked panel is a different panel than the clicked one
    if (state != 'block') {
        if (id == "table") {
            // show the blue bottom line
            $('.title-bar.bottom').slideDown(resizeContent)
            // change the corners
            $('#table-title').css({ 'border-radius': '0px' })
        }
        // show the controls that were clicked
        $('#' + id).slideDown(resizeContent)
    }
}
function updateConfig() {
    // get all the new configs and calculate the new start and end date
    selection1 = document.getElementById('selection1').value,
    selection2 = document.getElementById('selection2').value,
    frequency = document.getElementById('interval').value;

    updateContent()
}
function updateContent() {

    // !!! all this has to go into updateConfig() !!!

    // create date string yyyy-mm-dd
    currentDateStr = `${firstDate.getFullYear()}-${firstDate.getMonth()+1}-${firstDate.getDate()}`,
    end = firstDate;

    // year = end.getFullYear()

    switch (interval) {// extend the date according to interval
        case 'day':
        case 'week':
        case 'month':
            end = end.setMonth(end.getMonth() + 1);
        case 'year':
            // year = end.getFullYear();
            // end = end.setFullYear(year + 1);
    }


    // calculate end from currentDateStr and interval


    switch (viewMode) {
        case "lineChart":
            spinner = new Spinner(spinnerOptions).spin(document.getElementById('content'))
            if (window.XMLHttpRequest) { //try to create a Request
                requestVar = new XMLHttpRequest();
            }
            else if (window.ActiveXObject) { //method for older browsers
                requestVar = new ActiveXObject("Msxml2.XMLHTTP");
            }
            else {
                throw new Error("Ajax is not supported by this browser");
            }

            // function that handles response
            requestVar.onreadystatechange = function () {
                if (requestVar.readyState == 4 && requestVar.status == 200) {
                    spinner.stop();
                    // document.querySelector('canvas').style.display = "block";
                    // document.getElementById("table").innerHTML = "";

                    //get the text content of the response
                    var resultString = requestVar.responseText; // looks like: 'string(324) "2022-06-16 00:00:00|16.9&20...'
                    // decode received data string
                    resultString = resultString.split('"')[1] // looks like: '2022-06-16 00:00:00|16.9&20...'
                    var resultArray = resultString.split('&')
                    dataArray = []
                    resultArray.forEach(element => {
                        dataArray.push(element.split('|'))
                    });
                    console.log(dataArray)
                    // console.log(resultString)

                    // handle exception

                    // display  data
                }
            }

            // initialize the request
            requestVar.open('POST', 'php/getDataCopy.php'); // temporary
            requestVar.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

            // send request
            {// adjust the second selection string for the sql query
                var secondSelectionStr;
                if (selection2 == "none") {
                    secondSelectionStr = '';
                } else {
                    secondSelectionStr = `, ${selection2}`;
                }
            }
            requestVar.send("selection1=" + selection1 + "&selection2=" + secondSelectionStr + "&startDate=" + currentDateStr + "&endDate=" + interval);
        case "table":
            break;
    }
}