const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Animations
const container = document.getElementById("sign-container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

registerBtn.addEventListener("click", () => {
    container.classList.add("active");
    document.getElementById("login-form").reset();
    clearFormErrors();
});

loginBtn.addEventListener("click", () => {
    container.classList.remove("active");
    document.getElementById("login-form").reset();
    clearFormErrors();
});

document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", (_event) => {
        clearFormErrors();
    });
});

// Clear all errors
function clearFormErrors() {
    $("form")
        .find("label")
        .each(function () {
            $(this).empty();
        });
}

// OTP input
const inputs = document.querySelectorAll(".sign-container .input-field input"),
    button = document.querySelector(".sign-container .confirm-form button");

inputs.forEach((input, index1) => {
    input.addEventListener("keyup", (e) => {
        const currentInput = input,
            nextInput = input.nextElementSibling,
            prevInput = input.previousElementSibling;

        if (currentInput.value.length > 1) {
            currentInput.value = "";
            return;
        }
        if (
            nextInput &&
            nextInput.hasAttribute("disabled") &&
            currentInput.value !== ""
        ) {
            nextInput.removeAttribute("disabled");
            nextInput.focus();
        }
        if (e.key === "Backspace") {
            inputs.forEach((input, index2) => {
                if (index1 <= index2 && prevInput) {
                    input.setAttribute("disabled", true);
                    input.value = "";
                    prevInput.focus();
                }
            });
        }
        if (!inputs[5].disabled && inputs[5].value !== "") {
            button.removeAttribute("disabled");
            return;
        }
        button.setAttribute("disabled", true);
    });
});

// Sign up
// OTP Code handling
function displayEnterCode() {
    const sign = document.getElementById("sign-container");
    const confirmSign = document.getElementById("confirm-container");

    confirmSign.classList.toggle("visible");
    sign.classList.toggle("hide");
}

async function waitCreationOTP() {
    return new Promise((resolve) => {
        button.addEventListener("click", async function () {
            let inputCode = "";
            inputs.forEach((input) => {
                inputCode += input.value;
            });

            const form = $("#signup-form");
            const email = form[0]["email"].value;
            $.ajax({
                type: "POST",
                url: "/php/signin/creationOTP",
                data: { action: "verify_otp", email: email, otp: inputCode },
            });

            await delay(200);

            let response = await $.ajax({
                type: "POST",
                url: "/php/signin/creationOTP",
                data: { action: "check_verification", email: email },
            });

            if (response.trim() === "OTP verified.") {
                resolve(response);
            }
        });
    });
}

// Form Validation
// Checks if user exists
async function checkUserExists(username, email) {
    return $.ajax({
        url: "/php/signin/userExists",
        type: "post",
        datatype: "json",
        data: { username, email },
    });
}

// Validate the form
async function validateSignUp(
    username,
    email,
    password,
    passwordConfirm,
    userExists,
) {
    return $.ajax({
        url: "/php/signin/validateSignUp",
        type: "post",
        datatype: "json",
        data: {
            username,
            email,
            password,
            passwordConfirm,
            userExists,
        },
    });
}

$("#signup-form").submit(async function (e) {
    e.preventDefault();

    const form = $(this);
    const username = form[0]["username"].value;
    const email = form[0]["email"].value;
    const password = form[0]["password"].value;
    const passwordConfirm = form[0]["passwordConfirm"].value;

    clearFormErrors();

    try {
        const userExists = (await checkUserExists(username, email)).trim();
        const validationResult = await validateSignUp(
            username,
            email,
            password,
            passwordConfirm,
            userExists,
        );

        if (!validationResult.success) {
            const errors = validationResult.errors;
            if (errors.general) alert(errors.general);
            if (errors.username) $("#newUsernameError").text(errors.username);
            if (errors.email) $("#newEmailError").text(errors.email);
            if (errors.password) $("#newPasswordError").text(errors.password);
            if (errors.passwordConfirm)
                $("#confirmPasswordError").text(errors.passwordConfirm);
            return; // Exit early if validation failed
        }
    } catch (error) {
        alert("An error occured during account creation. Please try again.");
        console.error("Validation Error:", error);
    }

    displayEnterCode();

    $.ajax({
        type: "POST",
        url: "/php/signin/creationOTP",
        data: { action: "send_otp", email: email },
    });

    await waitCreationOTP();

    await $.ajax({
        type: "POST",
        url: "/php/signin/createUser",
        data: { username, email, password },
    });

    window.location.replace("/");
});

// Log in
$("#login-form").submit(async function (e) {
    e.preventDefault();

    const form = $(this);

    const result = await $.ajax({
        type: "POST",
        url: "/php/loginUser",
        data: form.serialize(), // serializes the form's elements.
    });

    const usernameError = $("#usernameError");
    const passwordError = $("#passwordError");

    const noAccountError = "Account does not exist";
    const wrongPasswordError = "Incorrect password";

    switch (result.trim()) {
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
            window.location.replace("/");
            break;
    }
});
