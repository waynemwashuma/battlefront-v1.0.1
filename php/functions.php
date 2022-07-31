<?php
function inputIsEmpty($name,$email,$password,$conpassword){
    if (empty($name) || empty($email) || empty($password) ||empty($conpassword)) {
        return true;
    }
    return false;
};
function invalidUser($name){
    if(!preg_match('/^[a-zA-Z0-9]*$/',$name)) {
        return true;
    }
    return false;
}
function invalidEmail($email){
    if (!filter_var($email ,FILTER_VALIDATE_EMAIL)) {
          return true;
    }
    return false;
}
function isMatch($password,$conpassword){
    if ($password !== $conpassword) {
        return true;
    }
    return false;
}

function UserIs($conn,$name,$email) {
    $sql = 'SELECT * FROM users WHERE userName= ? OR userMail = ?;';
    $stmt = mysqli_stmt_init($conn);
    if(!mysqli_stmt_prepare($stmt,$sql)){
        header('location: ../app/signup.php?error=sqlerror');
        exit();
    }
    mysqli_stmt_bind_param($stmt,'ss',$name,$email);
    mysqli_stmt_execute($stmt);

    $resData = mysqli_stmt_get_result($stmt);
    if($dt = mysqli_fetch_assoc($resData)){
        return $dt;
    }else{
        return false;
    }
    mysqli_stmt_close($stmt);
}

function createUser($conn,$name,$email,$password){
    $sql = 'INSERT INTO users(userName,userMail,UserPwd) VALUES (?,?,?)';
    $stmt = mysqli_stmt_init($conn);
    if(!mysqli_stmt_prepare($stmt,$sql)){
        header('location: ../app/signup.php?error=sqlerror');
        exit(); 
    }

    $HashPassword = password_hash($password,PASSWORD_DEFAULT);
    mysqli_stmt_bind_param($stmt,'sss',$name,$email,$HashPassword);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    ini_set('session.save_path', './tmp');
    session_start();
    $_SESSION['user'] = $name;
    $_SESSION['auth'] = true;
    $_SESSION['lastlogin'] = time();
    header('location: http://localhost:3000?username='.$_SESSION['user']);
    
};
function loginUser($conn,$name,$password){
    $uidExists = UserIs($conn,$name,$name);
    if (!$uidExists) {
        header('location: ../app/login.html?error=userNull');
        exit();
    }
    $HashPassword = $uidExists['userPwd'];
    $checkpass = password_verify($password,$HashPassword);

    if ($checkpass === false) {
        header('location: ../app/login.html?error=passMismatch');
        exit();
    }else if ($checkpass === true) {
        ini_set('session.save_path', './tmp');
        session_start();
        $_SESSION['userid'] = $uidExists['userId'];
        $_SESSION['user'] = $uidExists['userName'];
        $_SESSION['auth'] = true;
        $_SESSION['lastlogin'] = time();
        header('location: http://localhost:3000?username='.$_SESSION['user']);
        
    }
}