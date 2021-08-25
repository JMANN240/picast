var video = document.getElementById('video');
var share_screen_button = document.getElementById('share-screen-button');
var watch_button = document.getElementById('watch-button');
var room_id_input = document.getElementById('room-id');
var copy_link_button = document.getElementById('copy-link-button');
var link_input = document.getElementById("link");
var query_string = window.location.search;
var url_params = new URLSearchParams(query_string);
room_id_input.value = url_params.get('room_id');

var connections = {};

$.ajax({
  type: 'GET',
  url: '/settings',
  success: (res) => {
    socket = io.connect(res.socketio_host + ':' + res.port);

    socket.on("offer", async (offer_event) => {
      console.log("We got an offer from", offer_event.from_id);

      var pc = new RTCPeerConnection(config);
      connections[offer_event.from_id] = pc;

      pc.ontrack = (video_event) => {
        console.log("Setting remote video");
        video.srcObject = video_event.streams[0];
      };
      
      await pc.setRemoteDescription(offer_event.offer);
      await pc.setLocalDescription(await pc.createAnswer());

      console.log("Sending an answer to", offer_event.from_id);
      socket.emit("answer", offer_event.from_id, offer_event.to_id, pc.localDescription);

      pc.onicecandidate = (candidate_event) => {
        if (candidate_event.candidate) {
          console.log("sending candidate to", offer_event.from_id);
          socket.emit("candidate", offer_event.from_id, offer_event.to_id, candidate_event.candidate);
        }
      }
    });
    
    socket.on("answer", (answer_event) => {
      console.log("We got an answer from", answer_event.from_id);
      connections[answer_event.from_id].setRemoteDescription(answer_event.answer);
    });
    
    socket.on("candidate", (candidate_event) => {
      console.log("We got a candidate from", candidate_event.from_id);
      if (candidate_event.cnd) {
        connections[candidate_event.from_id].addIceCandidate(new RTCIceCandidate(candidate_event.cnd));
      }
    });

    socket.on("watcher", async (watcher_event) => {
      console.log("new watcher", watcher_event.from_id);

      var pc = new RTCPeerConnection(config);
      connections[watcher_event.from_id] = pc;

      var stream = video.srcObject;

      stream.getTracks().forEach((track) => {
        console.log("Adding tracks to the peer", watcher_event.from_id);
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (candidate_event) => {
        if (candidate_event.candidate) {
          console.log("sending candidate to", watcher_event.from_id);
          socket.emit("candidate", watcher_event.from_id, watcher_event.to_id, candidate_event.candidate);
        }
      }

      await pc.setLocalDescription(await pc.createOffer());
      console.log("sending an offer");
      socket.emit("offer", watcher_event.from_id, watcher_event.to_id, pc.localDescription);
    });
  }
});

var config = {
  iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
};

var share_screen = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: true});
    video.srcObject = stream;
    room_id_input.value = socket.id;
    link_input.value = "picast.ejrobotics.com?room_id=" + socket.id;
  } catch (err) {
    console.error(err);
  }
}

var watch = () => {
  socket.emit("watcher", room_id_input.value, socket.id);
}

var copy_link = () => {
  link_input.focus();
  link_input.select();
  document.execCommand("copy");

}

share_screen_button.addEventListener('click', share_screen);
watch_button.addEventListener('click', watch);
copy_link_button.addEventListener('click', copy_link);