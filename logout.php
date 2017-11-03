<?php
session_start();
session_destroy();
header('location:http://localhost/loginExample/login_form.php');
?>