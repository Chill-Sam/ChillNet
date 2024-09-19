var confirmationCode;

function confirmPasswordCheck() {
    let password = document.forms["signUpForm"]["password"];
    let confirmPassword = document.forms["signUpForm"]["passwordConfirm"];
    if (password.value != confirmPassword.value) {
        confirmPassword.setCustomValidity("Passwords do not match.");
    } else if (password.value != "" && (confirmPassword.value == password.value) && password.checkValidity()) {
        confirmPassword.setCustomValidity("");
    }
}

function validateSignUpForm() {
    let username = document.forms["signUpForm"]["username"];
    let email = document.forms["signUpForm"]["email"];
    let password = document.forms["signUpForm"]["password"];
    let confirmPassword = document.forms["signUpForm"]["passwordConfirm"];
    let submitButton = document.getElementById("submitSignUpFormButton");

    if (username.checkValidity() && email.checkValidity() && password.checkValidity() && confirmPassword.checkValidity()) {
        submitButton.removeAttribute("disabled");
    }
    else {
        submitButton.setAttribute("disabled", "disabled");
    }
}


function checkIfUserExists() {
    let username = document.forms["signUpForm"]["username"];
    let email = document.forms["signUpForm"]["email"];

    $.ajax({
        url: "php/userExists.php",
        type: "post",
        async: false,
        datatype: 'json',
        data: {username: username.value, email: email.value},
        error: function(){
            username.setCustomValidity("Error in php");
            email.setCustomValidity("Error in php");
        },
        success:function(result) {
            if (result == "UEEE") {
                username.setCustomValidity("Username is unavailable.");
                email.setCustomValidity("Email already has associated account.");
            } else if (result == "UEED") {
                username.setCustomValidity("Username is unavailable");
                email.setCustomValidity("");
            } else if (result == "UDEE") {
                username.setCustomValidity("");
                email.setCustomValidity("Email already has associated account.")
            } else if (result == "UDED") {
                username.setCustomValidity("");
                email.setCustomValidity("");
            } else {
                username.setCustomValidity("Error");
                email.setCustomValidity("Error");
            }
        }
    })
}

function confirmEmail() {
    let email = document.forms["signUpForm"]["email"];
    confirmationCode = Math.floor(100000 + Math.random() * 900000);

    let finalizeAccountContainer = document.getElementById("finalizeAccountContainer");
    finalizeAccountContainer.style.opacity = 1;
    finalizeAccountContainer.style.pointerEvents = "all";

    $.ajax({
        url: "php/sendConfirmEmail.php",
        type: "post",
        async: true,
        datatype: 'json',
        data: {email: email.value, code: confirmationCode},
        error: function(){
            alert("Email could not be sent");
        }
    })
}

function validateConfirmCode() {
    let confirmCode = document.getElementById("confirmCode");
    if (confirmCode.value == confirmationCode) {
        confirmCode.value = '';
        let username = document.forms["signUpForm"]["username"];
        let email = document.forms["signUpForm"]["email"];
        let password = document.forms["signUpForm"]["password"];
        
        $.ajax({
            url: "php/createUser.php",
            type: "post",
            async: false,
            datatype: 'json',
            data: {username: username.value, email: email.value, password: password.value},
            error: function() {
                alert("User could not be created.");
            },
            success: function() {
                window.location.replace("/");
            }
        })
    }
}

window.onload = function() {
    document.getElementById("confirmCode").value = '';
    validateSignUpForm();
}
setInterval(validateSignUpForm, 100);
setInterval(validateConfirmCode, 100);
