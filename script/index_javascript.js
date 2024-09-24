function enableElement(id, enabled) {
    let element = document.getElementById(id);
    if (enabled) {
        element.removeAttribute("disabled");
    } else {
        element.setAttribute("disabled", "disabled");
    }
}

function setElementOpacity(id, opacity) {
    let element = document.getElementById(id);
    element.style.opacity = opacity;
}

function setPointerEvents(id, events) {
    let element = document.getElementById(id);
    if (events) {
        element.style.pointerEvents = "all";
    } else {
        element.style.pointerEvents = "none";
    }
}

function toggleNoAccountPopup(show) {
    setElementOpacity("noAccountContainer", show);
    setPointerEvents("noAccountContainer", show);
    enableElement("closeNoAccountButton", show);
}

function toggleLogin(show) {
    setElementOpacity("loginContainer", show);
    setPointerEvents("loginContainer", show);
    enableElement("closeLoginButton", show);
    document.getElementById("usernameError").innerHTML = '';
    document.getElementById("passwordError").innerHTML = '';
    if (show) {
        document.getElementById("loginForm").reset();
    }
}

$(document).ready(function () {
    document.getElementById("usernameError").innerHTML = '';
    document.getElementById("passwordError").innerHTML = '';

    $("#loginForm").submit(function(e) {

        e.preventDefault(); // avoid to execute the actual submit of the form.

        var form = $(this);
        var actionUrl = form.attr('action');
    
        $.ajax({
            type: "POST",
            url: "php/loginUser",
            data: form.serialize(), // serializes the form's elements.
            success: function(data)
            {
                if (data == "NA") {
                    document.getElementById("usernameError").innerHTML = 'Account does not exist';
                    document.getElementById("passwordError").innerHTML = '';
                } else if (data == "WP") {
                    document.getElementById("passwordError").innerHTML = 'Incorrect Password';
                    document.getElementById("usernameError").innerHTML = '';
                }
                else {
                    document.getElementById("usernameError").innerHTML = '';
                    document.getElementById("passwordError").innerHTML = '';
                    location.reload();
                }
            }
        });
    });
});

window.onload = function() {
    toggleNoAccountPopup(0);
    toggleLogin(0);
}
