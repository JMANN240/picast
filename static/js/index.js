var self_video = document.getElementById('self-video');
var remote_video = document.getElementById('remote-video');
var connect_button = document.getElementById('connectButton');

$.ajax({
  type: 'GET',
  url: '/settings',
  success: (res) => {
    socket = io.connect(res.socketio_host + ':' + res.port);

    socket.on("offer", async (desc) => {
      console.log("offer");
    });
    
    socket.on("answer", async (desc) => {
      console.log("answer");
    });
    
    socket.on("candidate", async (cnd) => {
      console.log("candidate");
    });
  }
});

var pc = new RTCPeerConnection({
  iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
});

pc.onicecandidate = ({cnd}) => {
  console.log(cnd);
  socket.emit('candidate', cnd);
}

pc.ontrack = (e) => {
  if (remote_video.srcObject) return;
  remote_video.srcObject = e.streams[0];
}

var start = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({video: true});
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream)
    });
    self_video.srcObject = stream;
  } catch (err) {
    console.error(err);
  }
}

connect_button.addEventListener('click', start);