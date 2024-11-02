function showNoAccount(show) {
    const popupContainer = "#noAccountContainer";
    setOpacity(popupContainer, show);
    setPointerEvents(popupContainer, show);
    enableChildren(popupContainer, show);
}

function showAccount(show) {
    const accountPopup = "#accountPopup";
    setOpacity(accountPopup, show);
    setPointerEvents(accountPopup, show);
    setVisibility(accountPopup, show);
    $(accountPopup).css("right", show ? "0" : "-20%");
}

function updatePosts() {
    $.ajax({
        url: "php/get_posts",
        method: "GET",
        success: function (data) {
            $("#postListContainer").html(data);
        },
    });
}

$(document).ready(function () {
    updatePosts();
    setInterval(updatePosts, 1000);

    clearLoginErrors();

    document.addEventListener(
        "click",
        function handleClickOutsideAccount(event) {
            const accountPopup = document.getElementById("accountPopup");
            const profileButton = document.getElementById("profileButton");

            let pressingPopup = accountPopup?.contains(event.target);
            let pressingProfile = profileButton?.contains(event.target);
            let isVisible = accountPopup?.style.opacity == 1;

            if (!pressingPopup && !pressingProfile && isVisible) {
                showAccount(false);
            }
        },
    );

    $("#postForm").submit(function (e) {
        e.preventDefault();

        var postContent = $("#postInput").val();

        if (postContent.trim() !== "") {
            this.submit();
        }
    });
});

window.onload = function () {
    showNoAccount(0);
    showLogin(0);
};
