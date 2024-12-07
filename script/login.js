function clearLoginErrors() {
    const popupContainer = "#loginContainer";
    $(popupContainer)
        .find("label")
        .each(function () {
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

$(document).ready(function () {
    document.addEventListener("click", function handleClickOutsideLogin(event) {
        const login = document.getElementById("login");
        const loginButton = document.getElementById("loginButton");

        var pressingLogin = login?.contains(event.target);
        var pressingLoginButton = loginButton?.contains(event.target);

        if (!pressingLogin && !pressingLoginButton && login && loginButton) {
            showLogin(0);
        }
    });

    $("#loginForm").submit(function (e) {
        e.preventDefault();

        const form = $(this);

        $.ajax({
            type: "POST",
            url: "php/loginUser",
            data: form.serialize(), // serializes the form's elements.
            success: function (data) {
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
                        break;
                }
            },
        });
    });
});
