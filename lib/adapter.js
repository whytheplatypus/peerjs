var util = require('./util');

var RTCPeerConnection = null;
var getUserMedia = null;
var attachMediaStream = null;

if (navigator.mozGetUserMedia) {
  util.browserisms = 'Firefox';

  RTCSessionDescription = window.mozRTCSessionDescription;
  RTCPeerConnection = window.mozRTCPeerConnection;
  getUserMedia = navigator.mozGetUserMedia.bind(navigator);
} else if (navigator.webkitGetUserMedia) {
  util.browserisms = 'Webkit';

  RTCPeerConnection = window.webkitRTCPeerConnection;
  getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
}

window.RTCSessionDescription = RTCSessionDescription;
window.RTCPeerConnection = RTCPeerConnection;
navigator.getUserMedia = getUserMedia;
