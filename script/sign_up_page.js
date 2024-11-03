var confirmationCode;

function checkPassword() {
    const matchingError = "Passwords do not match.";
    const formName = "signUpForm";

    const password = document.forms[formName]["password"];
    const confirmPassword = document.forms[formName]["passwordConfirm"];

    var isEqual = password.value == confirmPassword.value;
    var isEmpty = password.value == "";
    var isValid = password.checkValidity() && confirmPassword.checkValidity();

    if (!isEqual) {
        password.setCustomValidity(matchingError);
        confirmPassword.setCustomValidity(matchingError);
    } else if (!isEmpty && isValid) {
        confirmPassword.setCustomValidity("");
    }
}

function validateSignUpForm() {
    let username = document.forms["signUpForm"]["username"];
    let email = document.forms["signUpForm"]["email"];
    let password = document.forms["signUpForm"]["password"];
    let submitButton = "#submitSignUpFormButton";

    let isValid =
        username.checkValidity() &&
        email.checkValidity() &&
        password.checkValidity();
    enableElement(submitButton, isValid);
}

function userExists() {
    const username = document.forms["signUpForm"]["username"];
    const email = document.forms["signUpForm"]["email"];

    $.ajax({
        url: "php/userExists",
        type: "post",
        async: false,
        datatype: "json",
        data: { username: username.value, email: email.value },
        error: function () {
            username.setCustomValidity("Error in php");
            email.setCustomValidity("Error in php");
        },
        success: function (result) {
            const usernameTaken = "Username is unavailable.";
            const emailTaken = "Email already has associated account.";

            const usernameError = $("#userError");
            const emailError = $("#emailError");

            var usernameResult = result.substring(0, 2);
            var emailResult = result.substring(2, 4);

            switch (usernameResult) {
                case "UE":
                    usernameError.html(usernameTaken);
                    break;
                case "UD":
                    usernameError.empty();
                    break;
                default:
                    usernameError.html("Error");
                    break;
            }

            switch (emailResult) {
                case "EE":
                    emailError.html(emailTaken);
                    break;
                case "ED":
                    emailError.empty();
                    break;
                default:
                    emailError.html("Error");
                    break;
            }
        },
    });
}

function confirmEmail() {
    let email = document.forms["signUpForm"]["email"];
    confirmationCode = Math.floor(100000 + Math.random() * 900000);

    const finalizeAccount = "#finalizeAccountContainer";
    setOpacity(finalizeAccount, 1);
    setPointerEvents(finalizeAccount, true);

    $.ajax({
        url: "php/sendConfirmEmail",
        type: "post",
        async: true,
        datatype: "json",
        data: { email: email.value, code: confirmationCode },
        error: function () {
            alert("Email could not be sent");
        },
    });
}

function validateConfirmCode() {
    const confirmCode = $("#confirmCode");

    if (confirmCode.val() == confirmationCode) {
        let username = document.forms["signUpForm"]["username"];
        let email = document.forms["signUpForm"]["email"];
        let password = document.forms["signUpForm"]["password"];

        $.ajax({
            url: "php/createUser",
            type: "post",
            async: false,
            datatype: "json",
            data: {
                username: username.value,
                email: email.value,
                password: password.value,
            },
            error: function () {
                alert("User could not be created.");
            },
            success: function () {
                window.location.replace("/");
            },
        });
    }
}

$(document).ready(function () {
    clearLoginErrors();
});

window.onload = function () {
    $("#confirmCode").empty();
    validateSignUpForm();
};

setInterval(validateSignUpForm, 100);
setInterval(validateConfirmCode, 100);
