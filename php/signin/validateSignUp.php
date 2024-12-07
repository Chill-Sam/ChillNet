<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_STRING);
    $confirmPassword = filter_input(INPUT_POST, 'passwordConfirm', FILTER_SANITIZE_STRING);
    $userExists = filter_input(INPUT_POST, 'userExists', FILTER_SANITIZE_STRING);

    function validateSignUp($username, $email, $password, $confirmPassword, $userExistResult)
    {
        $errors = [];

        $usernameResult = substr($userExistResult, 0, 2);
        $emailResult = substr($userExistResult, 2, 2);

        // Validate Username
        if (trim($username) === '') {
            $errors['username'] = 'Username is required';
            return $errors;
        } else if (strlen($username) < 6 || strlen($username) > 15) {
            $errors['username'] = 'Username must be 6-15 characters';
            return $errors;
        } else if (!preg_match('/^[A-Za-z0-9_\-]+$/', $username)) {
            $errors['username'] = 'Username can only contain A-Z, a-z, numbers, - and _';
            return $errors;
        } else if ($usernameResult === 'UE' && $emailResult !== 'EE') {
            $errors['username'] = 'Username is taken';
            return $errors;
        }

        // Validate Email
        if (trim($email) === '') {
            $errors['email'] = 'Email is required';
            return $errors;
        } else if (strlen($email) > 100) {
            $errors['email'] = 'Email is way too long';
            return $errors;
        } else if (!preg_match('/^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,}$/', $email)) {
            $errors['email'] = 'Please provide a valid email';
            return $errors;
        } else if ($emailResult === 'EE') {
            $errors['email'] = 'Email is used, maybe try logging in';
            return $errors;
        }

        // Validate Password
        if (trim($password) === '') {
            $errors['password'] = 'Password is required';
            return $errors;
        } else if (strlen($password) < 8 || strlen($password) > 18) {
            $errors['password'] = 'Password must be 8-18 characters';
            return $errors;
        }

        // Confirm Password
        if ($password !== $confirmPassword) {
            $errors['passwordConfirm'] = 'Passwords do not match';
            return $errors;
        }

        return $errors;
    }

    $errors = validateSignUp($username, $email, $password, $confirmPassword, $userExists);

    // Return JSON response
    header('Content-Type: application/json');
    if (!empty($errors)) {
        echo json_encode(['success' => false, 'errors' => $errors]);
    } else {
        echo json_encode(['success' => true, 'message' => 'Validation passed!']);
    }
}
?>
