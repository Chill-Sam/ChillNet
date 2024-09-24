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
        url: "php/userExists",
        type: "post",
        async: false,
        datatype: 'json',
        data: {username: username.value, email: email.value},
        error: function(){
            username.setCustomValidity("Error in php");
            email.setCustomValidity("Error in php");
        },
        success:function(result) {
            let userError = document.getElementById("userError");
            let emailError = document.getElementById("emailError");
            if (result == "UEEE") {
                username.setCustomValidity("Username is unavailable.");
                email.setCustomValidity("Email already has associated account.");
                userError.innerHTML = "Username in use";
                emailError.innerHTML = "Email in use";
            } else if (result == "UEED") {
                username.setCustomValidity("Username is unavailable");
                email.setCustomValidity("");
                userError.innerHTML = "Username in use";
                emailError.innerHTML = "";
            } else if (result == "UDEE") {
                username.setCustomValidity("");
                email.setCustomValidity("Email already has associated account.")
                userError.innerHTML = "";
                emailError.innerHTML = "Email in use";
            } else if (result == "UDED") {
                username.setCustomValidity("");
                email.setCustomValidity("");
                userError.innerHTML = "";
                emailError.innerHTML = "";
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
        url: "php/sendConfirmEmail",
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
            url: "php/createUser",
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

function toggleLogin(show) {
    setElementOpacity("loginContainer", show);
    setPointerEvents("loginContainer", show);
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
                    window.location.replace("/");
                }
            }
        });
    });
});

window.onload = function() {
    document.getElementById("confirmCode").value = '';
    validateSignUpForm();
}
setInterval(validateSignUpForm, 100);
setInterval(validateConfirmCode, 100);
