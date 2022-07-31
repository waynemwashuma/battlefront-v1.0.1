<?php
if (isset($_POST['submit'])) {
    $name = $_POST['username'];
    $password = $_POST['pwd'];
    die $user;
    require_once 'db.inc.php';
    require_once 'functions.php';

    if (!$name || !$password) {
        header('location: ../app/login.html');
        exit();
    };
    loginUser($conn,$name,$password);
}else {
    header('location: ../app/login.html');
}
