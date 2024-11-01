function showNoAccount(show) {
    const popupContainer = "#noAccountContainer";
    setOpacity(popupContainer, show);
    setPointerEvents(popupContainer, show);
    enableChildren(popupContainer, show);
}

function clearLoginErrors() {
    const popupContainer = "#loginContainer"
    $(popupContainer).find('label').each(function() {
        $(this).empty();
    });
}

function showLogin(show) {
    const popupContainer = "#loginContainer";
    setOpacity(popupContainer, show);
    setPointerEvents(popupContainer, show);
    enableChildren(popupContainer, show);
    clearLoginErrors();
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
        url: 'php/get_posts',
        method: 'GET',
        success: function(data) {
            $('#postListContainer').html(data);
        }
    });
}

$(document).ready(function () {
    updatePosts();
    setInterval(updatePosts, 1000);

    clearLoginErrors();

    document.addEventListener(
        'click',
        function handleClickOutsideAccount(event) {
            const accountPopup = document.getElementById("accountPopup");
            const profileButton = document.getElementById("profileButton");

            var pressingPopup = accountPopup.contains(event.target);
            var pressingProfile = profileButton.contains(event.target);
            var isVisible = accountPopup.style.opacity == 1;

            if (!pressingPopup && !pressingProfile && isVisible) {
                showAccount(false);
            }
        }
    );

    $("#postForm").submit(function(e) {
        e.preventDefault();
        
        var postContent = $("#postInput").val();

        if (postContent.trim() !== "") {
            this.submit();
        }
    });

    $("#loginForm").submit(function(e) {
        e.preventDefault();

        const form = $(this);

       $.ajax({
            type: "POST",
            url: "php/loginUser",
            data: form.serialize(), // serializes the form's elements.
            success: function(data)
            {
                const usernameError = $("#usernameError");
                const passwordError = $("#passwordError");

                const noAccountError = "Account does not exist";
                const wrongPasswordError = "Incorrect password"; 

                switch (data) {
                    case "NA":
                        usernameError.html(noAccountError);
                        passwordError.empty();
                        break;
                    case "WP":
                        usernameError.empty();
                        passwordError.html(wrongPasswordError);
                        break;
                    default:
                        usernameError.empty();
                        passwordError.empty();
                        location.reload();
                        break;
                }
            }
        });
    });
});

window.onload = function() {
    showNoAccount(false);
    showLogin(false);
}
