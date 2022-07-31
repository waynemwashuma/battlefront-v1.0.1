<?php
if (isset($_GET['error'])) {
    if ($_GET['error'] == 'passMismatch') {
        echo '<p class=\'error\'>Please check your password</p>';
    }
    if ($_GET['error'] == 'emptyinput') {
        echo '<p class=\'error\'>Fill all fields!</p>';
    }
    if ($_GET['error'] == 'invalidUser') {
        echo '<p class=\'error\'>Invalid User name</p>';
    }
    if ($_GET['error'] == 'invalidMail') {
        echo '<p class=\'error\'>Invalid email</p>';
    }
    if ($_GET['error'] == 'userTaken') {
        echo '<p class=\'error\'>Username already taken</p>';
    }
    if ($_GET['error'] == 'sqlerror') {
        echo '<p class=\'error\'>Please try again</p>';
    }
    if ($_GET['error'] == 'userNull') {
        echo '<p class=\'error\'>No such user exists</p>';
    }
}