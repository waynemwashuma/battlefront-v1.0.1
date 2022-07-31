<?php
#server name
$serverName = 'localhost';
$dbUsername = 'root';
$dbPassword = '';
$dbName = 'BFlogin';

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$conn = mysqli_connect($serverName,$dbUsername,$dbPassword,$dbName);
if (!$conn) {
    die('connection failed'.mysqli_connect_error());
};