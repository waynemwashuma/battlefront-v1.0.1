<?php
if (isset($_POST['submit'])) {
    #user form input
    $name = $_POST['username'];
    $email = $_POST['email'];
    $password = $_POST['pwd'];
    $conpassword = $_POST['conpwd'];

    require_once 'db.inc.php';
    require_once 'functions.php';
    echo 'true';

    #errorHandlers
    if (inputIsEmpty($name,$email,$password,$conpassword) !== false) {
        header('location: ../app/signup.html?error=emptyinput');
        exit();
    };
    if (invalidUser($name) !== false) {
        header('location: ../app/signup.html?error=invalidUser');
        exit();
    };
    if (invalidEmail($email) !== false) {
        header('location: ../app/signup.html?error=invalidEmail');
        exit();
    };
    if (isMatch($password,$conpassword) !== false) {
        header('location: ../app/signup.html?error=passMismatch');
        exit();
    };
    if ($dd = UserIs($conn,$name,$email)) {
        header('location: ../app/signup.html?error=userTaken');
        exit();
    };



    #user has no mistake
    createUser($conn,$name,$email,$password);
}else {
    header('location: ../app/signup.html');
    exit();
};
