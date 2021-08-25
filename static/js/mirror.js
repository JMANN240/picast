var video = document.querySelector('#video')

async function start() {
    stream = await navigator.mediaDevices.getUserMedia({video: true});
    video.srcObject = stream;
}

start();