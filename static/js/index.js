var self_video = document.getElementById('self-video');
var remote_video = document.getElementById('remote-video');
var connect_button = document.getElementById('connectButton');

$.ajax({
  type: 'GET',
  url: '/settings',
  success: (res) => {
    socket = io.connect(res.socketio_host + ':' + res.port);

    socket.on("offer", async (desc) => {
      console.log("We got an offer");
      await pc.setRemoteDescription(desc);
      await pc.setLocalDescription(await pc.createAnswer());
      console.log("Sending an answer");
      socket.emit("answer", pc.localDescription);
      pc.ontrack = (e) => {
        remote_video.srcObject = e.streams[0];
      }
    });
    
    socket.on("answer", async (desc) => {
      console.log("We got an answer");
      await pc.setRemoteDescription(desc);
    });
    
    socket.on("candidate", async (cnd) => {
      console.log("We got a candidate");
      pc.addIceCandidate(cnd);
    });
  }
});

var pc = new RTCPeerConnection({
  iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
});

pc.onicecandidate = (e) => {
  console.log("Created a candidate");
  if (e.candidate) {
    socket.emit('candidate', e.candidate);
  }
}

pc.onnegotiationneeded = async () => {
  try {
    console.log("Time to negotiate");
    await pc.setLocalDescription(await pc.createOffer());
    socket.emit('offer', pc.localDescription);
    console.log("Sending an offer");
  } catch (err) {
    console.error(err);
  }
}

pc.ontrack = (e) => {
  if (remote_video.srcObject) return;
  remote_video.srcObject = e.streams[0];
}

var start = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: true});
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream)
    });
    self_video.srcObject = stream;
  } catch (err) {
    console.error(err);
  }
}

connect_button.addEventListener('click', start);