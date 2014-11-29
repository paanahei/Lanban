/*****************************************************************************/
//Function to change working window
var view;
var currentView;
var viewIndicator
function showView(index) {
    if (index != currentView) {
        //Hide secondary window when it is opening in the Board.aspx
        if (document.getElementById("kanbanWindow") != null) {
            if (!((currentView != 0) && (index != 0))) hideWindow();
        }
        // Reset data-project-id sharingWindow Project.aspx
        else {
            if (currentView == 2) view[currentView].setAttribute("data-project-id", "");
        }

        //Change main window
        view[currentView].setAttribute("class", "window view");
        setTimeout(function () {
            view[currentView].style.display = "none";
            viewIndicator[currentView].setAttribute("class", "viewIndicator");
            view[index].style.display = "block";
            view[index].setAttribute("class", "window view show");
            viewIndicator[index].setAttribute("class", "viewIndicator show")
            currentView = index;
        }, 250);
    }
}


var _avatar, _name;
$(document).ready(function () {
    var profile = $("#profile");
    _avatar = profile.attr("src");
    _name = profile.attr("title");

    /*Recalibrate based on browser size*/
    recalibrate();
    window.addEventListener('resize', function () {
        recalibrate();
    });

    /*Make working window draggable*/
    $(".window").draggable({
        cursor: "move",
        handle: ".title-bar"
    });

    $(".btnOK").on("click", function () {
        $(".diaglog.show").removeClass("show").fadeOut(100);
    });

    /*Add function when click the icon to change window*/
    viewIndicator = document.getElementsByClassName("viewIndicator");
    view = document.getElementsByClassName("view");
    currentView = 0;
    $(".viewIndicator").on("click", function () {
        showView(this.getAttribute("data-view-indicator"));
    });

    // Nofication center
    initNotificationCenter();

    // Connect to hub
    init_UserHub();
});


/*****************************************************************************/
// Unload page loading spinner
function unloadPageSpinner() {
    $("#overlay").fadeOut(1000, "swing");
    $("#container").fadeOut(1000, "swing", function () {
        $("#container").fadeIn(1000);
        if ($("#notiIndicator").html() != "") $("#notiIndicator").fadeIn(0);
    });
}

// Load page loading spinner
function loadPageSpinner() {
    $("#container").fadeOut(250, "linear", function () {
        $("#overlay").fadeIn(250, "linear");
    });
}


/*****************************************************************************/
// Init Notification center
function initNotificationCenter() {
    $("#notiCenter").perfectScrollbar({
        wheelSpeed: 3,
        wheelPropagation: false,
        suppressScrollX: true,
        includePadding: true
    });

    $("#notiIndicator, #profile").on("click", function (e) {
        e.stopImmediatePropagation();
        $("#notiIndicator").fadeOut("fast").html("");
        if ($("#notiCenter").find($(".noti-msg")).get(0) != null)
            $("#notiCenter").fadeIn("fast").perfectScrollbar("update");
    });

    $("#container").on("click", function () {
        $("#notiCenter").fadeOut("fast");
    });
}


/*****************************************************************************/
// Support function for both board.js and project.js
// Parse JSonDate to dd.mm.yyyy
function parseJSONDate(jsonDate) {
    if (jsonDate != null) {
        var y = jsonDate.substr(0, 4);
        var m = jsonDate.substr(5, 2);
        var d = jsonDate.substr(8, 2);
        return d + "." + m + "." + y;
    }
    else
        return "";
}

// Format date
function formatDate(date) {
    if (date != "") {
        var data = date.split(".");
        d = (data[0] < 10) ? "0" + data[0] : data[0];
        m = (data[1] < 10) ? "0" + data[1] : data[1];
        return d + "." + m + "." + data[2];
    }
    return date;
}


/*****************************************************************************/
/* Diaglog */
// Show error diaglog  - content taken from an array based on parameter
var errorMsg = ["Cannot drop that item because it is not the same type with the items in column.", "Operation failed"];

function showErrorDialog(i) {
    $(".diaglog.error .content-holder").text(errorMsg[i]);
    $(".diaglog.error").addClass("show");
}

// Show success diaglog - content taken from an array based on parameter
var successMsg = ["New item created", "Data updated", "File uploaded"];

function showSuccessDiaglog(i) {
    if (!($(".diaglog.success").hasClass("show")))
        $(".diaglog.success").addClass("show").fadeIn(250);
    else $(".diaglog.success").fadeOut(100, function () {
        $(".diaglog.success").attr("data-diaglog-type", "Success");
        $(".diaglog.success .title-bar").text("Success");
        $(".diaglog.success .content-holder").html(successMsg[i]);
        $(".diaglog.success input").css("display", "block");
        $(".diaglog.success").fadeIn(100);
    })
}

// Show processing message
function showProcessingDiaglog() {
    $(".diaglog.success").attr("data-diaglog-type", "Processing");
    $(".diaglog.success .title-bar").text("Processing");
    $(".diaglog.success .content-holder").html("<div class='loading-spinner'></div>");
    $(".diaglog.success input").css("display", "none");
    $(".diaglog.success").addClass("show").fadeIn(200);
}


/***************************/
/* Real-time communication */
var connUser;
var proxyUser;

function init_UserHub() {
    connUser = $.hubConnection();
    proxyUser = connUser.createHubProxy("userHub");

    proxyUser.on("msgAddUser", function (sender, newMem, projectName) {
        if (newMem.User_ID != userID)
            newMsgAddUser(sender.Avatar, sender.Name, newMem.Name, projectName);
        else
            newMsgAddUser(sender.Avatar, sender.Name, "You", projectName);
    });

    connUser.start().done(function () {
    });
}

/* Notification center */
function newMsgAddUser(avatar, name, newMem, project) {
    content = "<div class='noti-msg'><img src='" + avatar + "' class='noti-msg-avatar' />" +
        "<div class='noti-msg-content'><span class='subject'>"+name+"</span> added "+
        "<span class='target'>" + newMem + "</span> to <i>" + project + "</i></div>";
    $("#notiCenter").prepend(content);
    updateNotiIndicator();
}

function updateNotiIndicator() {
    var msgNum = $("#notiIndicator").html();
    if (msgNum == "") msgNum = 1;
    else msgNum++;
    console.log(msgNum);
    $("#notiIndicator").html(msgNum).fadeIn("fast");
}