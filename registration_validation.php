<?php
session_start();
$name=$_POST['name'];
$username=$_POST['username'];
$password=$_POST['password'];
$repeat_password=$_POST['repeat_password'];
if(strcmp($password,$repeat_password)==0)
{
	$con=mysqli_connect('localhost','root');
	mysqli_select_db($con,'videochat');
	$q="insert into users (name,username,password) values ('$name','$username','$password');";
	$result=mysqli_query($con,$q);
	$num=mysqli_affected_rows($result);
	if($result)
	{
		$_SESSION['username']=$username;
		header('location:login_form.php');
	}
	else
	{
		echo "something error..try again";
		header('location:registration_form.php');
	}
}
else
{
	echo "password did't match..try again";
	header('location:registration_form.php');
}


?>