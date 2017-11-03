//our username 
var name; 
var connectedUser;
  
//connecting to our signaling server
var conn = new WebSocket('ws://localhost:9090');
  
conn.onopen = function () { 
   console.log("Connected to the signaling server"); 
};




//****** 
//UI selectors block 
//******
var sendBtn  =document.getElementById('send');
var loginPage = document.querySelector('#loginPage'); 
var username = document.querySelector('#username');
var password = document.getElementById("password"); 
var loginBtn = document.querySelector('#loginBtn'); 
var callPage = document.querySelector('#callPage'); 
var callTousername = document.querySelector('#callTousername');
var callBtn = document.querySelector('#callBtn'); 

var hangUpBtn = document.querySelector('#hangUpBtn');
  
var localVideo = document.querySelector('#localVideo'); 
var remoteVideo = document.querySelector('#remoteVideo'); 


//................datachaannel

var sent_file;
var yourConn;
var remoteConnection;
var sendChannel;
var receiveChannel;
var pcConstraint;
var bitrateDiv = document.querySelector('div#bitrate');
var fileInput = document.querySelector('input#fileInput');
var downloadAnchor = document.querySelector('a#download');
var sendProgress = document.querySelector('progress#sendProgress');
var receiveProgress = document.querySelector('progress#receiveProgress');
var statusMessage = document.querySelector('span#status');
var fileSection    = document.getElementById("container");
var messageSection   = document.getElementById("messageSection");
var profile  = document.getElementById("profile");

//message handling variable
var messageArea=document.getElementById("messageArea");
var sendMessBtn=document.getElementById("sendMessage");
var text=document.getElementById("text");
//

var receiveBuffer = [];
var receivedSize = 0;
var bytesPrev = 0;
var timestampPrev = 0;
var timestampStart;
var statsInterval = null;
var bitrateMax = 0;
var file;
var rec_readyState;
var send_readyState;
var callToUsername; 
var stream;
var receivedFilename;
var receivedFilesize;





 profile.style.display="none";
 fileSection.style.display="none";
 messageSection.style.display="none"; 
//sendBtn.disabled=true;
//sendMessBtn.disabled=true;
//hangUpBtn.disabled=true; 
//when we got a message from a signaling server 
conn.onmessage = function (msg) { 
   console.log("Got message", msg.data);
	
   var data = JSON.parse(msg.data); 
	
   switch(data.type) { 
      case "login": 
         handleLogin(data.success); 
         break; 
      //when somebody wants to call us 
      case "offer": 
         handleOffer(data.offer, data.name); 
         break; 
      case "answer": 
         handleAnswer(data.answer); 
         break; 
      //when a remote peer sends an ice candidate to us 
      case "candidate": 
         handleCandidate(data.candidate); 
         break; 
      case "leave": 
         handleLeave(); 
         break;
      case "file":
         handleFile(data.filename,data.filesize); 
         break;
      case "message":
         handletextMessage(data.name,data.message);
         break;   
      default: 
         break; 
   }
};
  
conn.onerror = function (err) { 
   console.log("Got error", err); 
};
  
//alias for sending JSON encoded messages 
function send(message) { 
   //attach the other peer username to our messages 
   if (connectedUser) { 
      message.name = connectedUser; 
   } 
	
   conn.send(JSON.stringify(message)); 
};
  


fileInput.addEventListener('change', handleFileInputChange, false);

function handleFileInputChange(event) {
  file = event.target.files[0];
  if (file) {
   //alert(file.name);
     send({
       type:"file",
       filename:file.name,
       filesize:file.size
     });
  }// else {
    //createConnection();
  //}
}


//handle receiving filename and filesize....
function handleFile(filename,filesize)
{
   receivedFilename=filename;
   receivedFilesize=filesize;
   receivedSize=0;
   sendProgress=0;
   //alert(sent_file.name+" "+sentfile.size);
}




  
callPage.style.display = "none";

// Login when the user clicks the button 
loginBtn.addEventListener("click", function (event) { 
   name = username.value;
	
   if (name.length > 0) { 
      send({ 
         type: "login", 
         name: name 
      }); 
   }
	
});
  
function  handleLogin(success) { 
   if (success === false) { 
      alert("Ooops...try a different username"); 
   } else { 
      loginPage.style.display = "none"; 
      callPage.style.display = "block";
      fileSection.style.display="block";
      messageSection.style.display="block";
	  profile.style.display="block";
		
      //********************** 
      //Starting a peer connection 
      //********************** 
		
      //getting local video stream 
      navigator.webkitGetUserMedia({ video: true, audio: true }, function (myStream) { 
         stream = myStream; 
			
         //displaying local video stream on the page 
         localVideo.src = window.URL.createObjectURL(stream);
			
         //using Google public stun server 
         var configuration = { 
            "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
         }; 
			
         yourConn = new webkitRTCPeerConnection(configuration); 
			
         // setup stream listening 
         yourConn.addStream(stream); 
			
         //when a remote user adds stream to the peer connection, we display it 
         yourConn.onaddstream = function (e) { 
            remoteVideo.src = window.URL.createObjectURL(e.stream); 
         };
			//data chanel
         sendChannel = yourConn.createDataChannel('sendDataChannel');
         sendChannel.binaryType = 'arraybuffer';
         trace('Created send data channel');
         sendChannel.onopen = onSendChannelStateChange;
         //sendChannel.onclose = onSendChannelStateChange;
         //


         // Setup ice handling 
         yourConn.onicecandidate = function (event) { 
            if (event.candidate) { 
               send({ 
                  type: "candidate", 
                  candidate: event.candidate 
               }); 
            } 
         };
         yourConn.ondatachannel = receiveChannelCallback;  
			
      }, function (error) { 
         console.log(error); 
      }); 
		
   } 
};
  


sendBtn.addEventListener("click",function() {
  // yourConn.ondatachannel = receiveChannelCallback;
   if(file)
   {
      send_readyState = sendChannel.readyState;
      if(send_readyState==='open')
      {
        //receiveChannel.onmessage = onReceiveMessageCallback;
        sendData();
      }
      else
        alert("select person to send file..");
   }
   else
   {
    alert("please..select file");
   }
 });
 






//initiating a call
callBtn.addEventListener("click", function () { 
   callToUsername = callTousername.value;
	
   if (callToUsername.length > 0) { 
	
      connectedUser = callToUsername;
		
      // create an offer 
      yourConn.createOffer(function (offer) { 
         send({ 
            type: "offer", 
            offer: offer 
         }); 
			
         yourConn.setLocalDescription(offer); 
      }, function (error) { 
         alert("Error when creating an offer"); 
      });
		
   } 
});
  
//when somebody sends us an offer 
function handleOffer(offer, name) { 
   connectedUser = name; 
   yourConn.setRemoteDescription(new RTCSessionDescription(offer));
	
   //create an answer to an offer 
   yourConn.createAnswer(function (answer) { 
      yourConn.setLocalDescription(answer); 
		
      send({ 
         type: "answer", 
         answer: answer 
      }); 
		
   }, function (error) { 
      alert("Error when creating an answer"); 
   }); 
};
  
//when we got an answer from a remote user
function handleAnswer(answer) {
   yourConn.setRemoteDescription(new RTCSessionDescription(answer)); 
};
  
//when we got an ice candidate from a remote user 
function handleCandidate(candidate) { 
   yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
};
   
//hang up 
hangUpBtn.addEventListener("click", function () { 

   send({ 
      type: "leave" 
   });  
	
   handleLeave(); 
});
  
function handleLeave() { 
   connectedUser = null; 
   remoteVideo.src = null; 
	
   yourConn.close(); 
   yourConn.onicecandidate = null; 
   yourConn.onaddstream = null; 
};








function receiveChannelCallback(event) {
  trace('Receive Channel Callback');
  receiveChannel = event.channel;
  receiveChannel.binaryType = 'arraybuffer';
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  //receiveChannel.onclose = onReceiveChannelStateChange;

  receivedSize = 0;
  bitrateMax = 0;
  downloadAnchor.textContent = '';
  downloadAnchor.removeAttribute('download');
  if (downloadAnchor.href) {
    URL.revokeObjectURL(downloadAnchor.href);
    downloadAnchor.removeAttribute('href');
  }
}

function onReceiveMessageCallback(event) {
  // trace('Received Message ' + event.data.byteLength);
  receiveBuffer.push(event.data);
  receivedSize += event.data.byteLength;

  receiveProgress.value = receivedSize;

  // we are assuming that our signaling protocol told
  // about the expected file size (and name, hash, etc).
  //var file = fileInput.files[0];
    if (receivedSize === receivedFilesize) {
    var received = new window.Blob(receiveBuffer);
    receiveBuffer = [];

    downloadAnchor.href = URL.createObjectURL(received);
    downloadAnchor.download = receivedFilename;
    downloadAnchor.textContent +=
      'Click to download \'' + receivedFilename + '\' (' + receivedFilesize+ ' bytes)\n\n';
    downloadAnchor.style.display = 'block';

    var bitrate = Math.round(receivedSize * 8 /
        ((new Date()).getTime() - timestampStart));
    bitrateDiv.innerHTML = '<strong>Average Bitrate:</strong> ' +
        bitrate + ' kbits/sec (max: ' + bitrateMax + ' kbits/sec)';

    if (statsInterval) {
      window.clearInterval(statsInterval);
      statsInterval = null;
    }

    //closeDataChannels();
  //}
  }
}

function onSendChannelStateChange() {
   if(file){
   send_readyState = sendChannel.readyState;
  trace('Send channel state is: ' + send_readyState);
  //if (readyState === 'open') {
    //sendData();
  //}
}
}
 

function onReceiveChannelStateChange() {
  rec_readyState = receiveChannel.readyState;
  //trace('Receive channel state is: ' rec_ readyState);
  if (rec_readyState === 'open') {
    timestampStart = (new Date()).getTime();
    timestampPrev = timestampStart;
    statsInterval = window.setInterval(displayStats, 500);
    window.setTimeout(displayStats, 100);
    window.setTimeout(displayStats, 300);
  }
}

// display bitrate statistics.
function displayStats() {
  var display = function(bitrate) {
    bitrateDiv.innerHTML = '<strong>Current Bitrate:</strong> ' +
        bitrate + ' kbits/sec';
  };

  if (yourConn && yourConn.iceConnectionState === 'connected') {
    if (adapter.browserDetails.browser === 'chrome') {
      // TODO: once https://code.google.com/p/webrtc/issues/detail?id=4321
      // lands those stats should be preferrred over the connection stats.
      yourConn.getStats(null, function(stats) {
        for (var key in stats) {
          var res = stats[key];
          if (timestampPrev === res.timestamp) {
            return;
          }
          if (res.type === 'googCandidatePair' &&
              res.googActiveConnection === 'true') {
            // calculate current bitrate
            var bytesNow = res.bytesReceived;
            var bitrate = Math.round((bytesNow - bytesPrev) * 8 /
                (res.timestamp - timestampPrev));
            display(bitrate);
            timestampPrev = res.timestamp;
            bytesPrev = bytesNow;
            if (bitrate > bitrateMax) {
              bitrateMax = bitrate;
            }
          }
        }
      });
    } else {
      // Firefox currently does not have data channel stats. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1136832
      // Instead, the bitrate is calculated based on the number of
      // bytes received.   
      var bytesNow = receivedSize;
      var now = (new Date()).getTime();
      var bitrate = Math.round((bytesNow - bytesPrev) * 8 /
          (now - timestampPrev));
      display(bitrate);
      timestampPrev = now;
      bytesPrev = bytesNow;
      if (bitrate > bitrateMax) {
        bitrateMax = bitrate;
      }
    }
  }
}


function sendData() {
  //var file = fileInput.files[0];
  trace('File is ' + [file.name, file.size, file.type,
      file.lastModifiedDate
  ].join(' '));

  // Handle 0 size files.
  statusMessage.textContent = '';
  downloadAnchor.textContent = '';
  if (file.size === 0) {
    bitrateDiv.innerHTML = '';
    statusMessage.textContent = 'File is empty, please select a non-empty file';
    closeDataChannels();
    return;
  }
  sendProgress.max = file.size;
  receiveProgress.max = file.size;
  var chunkSize = 16384;
  var sliceFile = function(offset) {
    var reader = new window.FileReader();
    reader.onload = (function() {
      return function(e) {
        sendChannel.send(e.target.result);
        if (file.size > offset + e.target.result.byteLength) {
          window.setTimeout(sliceFile, 0, offset + chunkSize);
        }
        sendProgress.value = offset + e.target.result.byteLength;
      };
    })(file);
    var slice = file.slice(offset, offset + chunkSize);
    reader.readAsArrayBuffer(slice);
  };
  sliceFile(0);
}
function progressState()
{
   receiveProgress.value=0;
   sendProgress.value=0;
}


//............................................................................................................................................


sendMessBtn.addEventListener("click",function(){
   var m=text.value;
   messageArea.innerHTML+="You:"+m+"<br>";
   send({
      type:"message",
      message:m
   });
   text.value="";
});
function handletextMessage(senderName,textMessage)
{
   messageArea.innerHTML+=senderName+":"+textMessage+"<br>";
}