<?php
session_start();
if(!isset($_SESSION['username']))
{
	header('location:login_form.php');
}
?>
<!DOCTYPE html>
<html> 
 
   <head> 
     
  <meta charset="utf-8">
  <meta name="description" content="WebRTC code samples">
  <meta name="viewport" content="width=device-width, user-scalable=yes, initial-scale=1, maximum-scale=1">
  <meta itemprop="description" content="Client-side WebRTC code samples">
  <meta itemprop="image" content="../../../images/webrtc-icon-192x192.png">
  <meta itemprop="name" content="WebRTC code samples">
  <meta name="mobile-web-app-capable" content="yes">
  <meta id="theme-color" name="theme-color" content="#ffffff">

  <base target="_blank">

  <title>video conferencing</title>
  <link rel = "stylesheet" href = "js/node_modules/bootstrap/dist/css/bootstrap.min.css"/>
  <link rel = "stylesheet" href = "js/style.css"/>
   </head>
        
   <body>
       
   <div id = "loginPage" class = "container text-center"> 
        
      <div class = "row"> 
         <div class = "col-md-4 col-md-offset-4">
                        
            <h2>video chatting application</h2> 
            <input type = "email" id = "username" value="<?php echo $_SESSION['username'];?>"c
               lass = "form-control formgroup" placeholder = "Login" 
               required = "" autofocus = "" style="display:none;"> 
            <button id = "loginBtn" class = "btn btn-lg btn-primary btnblock">
               Let's chat</button>
                                
         </div> 
      </div> 
                
   </div>
   
  
   <div id="profile" class="text-right"><?php echo $_SESSION['username'];?><br/><a href="logout.php" target="_self">Logout</a></div>
   <div class="floating-box">     
   <div id = "callPage" class = "call-page"> 
      <video id = "localVideo" autoplay></video> 
      <video id = "remoteVideo" autoplay></video>
                
      <div class = "row text-center"> 
         <div class = "col-md-12"> 
            <input id = "callTousername" type = "text"
               placeholder = "username to call" /> 
            <button id = "callBtn" class = "btn-success btn">Call</button> 
            <button id = "hangUpBtn" class = "btn-danger btn">Hang Up</button> 
         </div> 
      </div> 
                
   </div> 
</div>
<div class="floating-box" id="messageSection">
<div  style="border:1px solid #73AD21; border-radius: 10px" id="messageBox">
   <div id="messageArea"></div>
</div>

<div class = "row text-center"> 
         <div class = "col-md-12"> 
            <input id = "text" type = "text"
               placeholder = "Type message...." /> 
            <button id = "sendMessage" class = "btn-success btn">SendMess</button> 
        </div> 
</div>
</div>


<div>
<div id="container">
    <section >
        <input type="file" id="fileInput" name="files"/>
        <button id="send">Send</button>

      <div class="progress">
        <div class="label">Send progress: </div>
        <progress id="sendProgress" max="0" value="0"></progress>
      </div>

      <div class="progress">
        <div class="label">Receive progress: </div>
        <progress id="receiveProgress" max="0" value="0"></progress>
      </div>

      <div id="bitrate"></div>
      <a id="download"></a>
      <div id="downloadlink"></div>
      <span id="status"></span>

    </section>
  </div>
  <div>
  
  <script src="js/adapter.js"></script>
  <script src="js/common.js"></script>
  <script src = "js/client1.js"></script> 
  </body>
        
</html>           