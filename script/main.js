function setOpacity(selector, opacity) {
    $(selector).css("opacity", opacity);
}

function enableElement(selector, toggle=true) {
    $(selector).prop("disabled", !toggle); 
}

function setPointerEvents(selector, hasEvents) {
    $(selector).css("pointer-events", hasEvents ? "all" : "none");
}

function setVisibility(selector, isVisible) {
    $(selector).css("visibility", isVisible ? "visible" : "hidden");
}

function enableChildren(selector, toggle, filter='*') {
    $(selector).find(filter).each(function() {
        $(this).prop("disabled", !toggle);
    });
}
