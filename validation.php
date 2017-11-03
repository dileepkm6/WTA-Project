<?php
session_start();
$username=$_POST['username'];
$password=$_POST['password'];
$con=mysqli_connect('localhost','root');
mysqli_select_db($con,'videochat');
$q="select * from users where username='$username' && password='$password';";
$result=mysqli_query($con,$q);
$num=mysqli_num_rows($result);
if($num==1)
{
	$_SESSION['username']=$username;
	header('location:index.php');
}
else
{
	?>
	
<font color="#FF0000"><p align="center">username or password did\'t match..try again..</p></font>
<?php
}



?>