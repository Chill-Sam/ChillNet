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

function toggleLoginPopup(show) {
    setElementOpacity("loginContainer", show);
    enableElement("profileButton", !show);
}
