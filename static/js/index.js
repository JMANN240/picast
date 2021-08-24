var self_video = document.getElementById('self-video');
var remote_video = document.getElementById('remote-video');
var connect_button = document.getElementById('connectButton');

var socket = io.connect("10.12.224.5:8000");
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

socket.on("offer", async (desc) => {

});

socket.on("answer", async (desc) => {

});

socket.on("candidate", async (cnd) => {

});

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