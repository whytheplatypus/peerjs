var util = require('./util');
//var DataConnection = require('./dataconnection');
//var EventEmitter = require('events').EventEmitter;

/**
 * Manages DataConnections between its peer and one other peer.
 * Internally, manages PeerConnection.
 */
function openConnection(id, peer, socket, options) {


  options = util.extend({
    config: { 'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }] }
  }, options);

  _options = options;

  // PeerConnection is not yet dead.
  open = true;

  var pc = null;

  // Mapping labels to metadata and serialization.
  // label => { metadata: ..., serialization: ..., reliable: ...}
  var labels = {};
  // A default label in the event that none are passed in.
  var _default = 0;

  // DataConnections on this PC.
  //this.connections = {};
  //this._queued = [];

  _socket = socket;

  _startPeerConnection();

  // Process queued DCs.
  _processQueue();

  // Listen for ICE candidates.
  _setupIce();

  // Listen for negotiation needed.
  // Chrome only **
  _setupNegotiationHandler();

  /** Start a PC. */
  function _startPeerConnection() {
    util.log('Creating RTCPeerConnection');
    pc = new RTCPeerConnection(_options.config, { optional: [ { RtpDataChannels: true } ]});
  }


/** Set up ICE candidate handlers. */
  function _setupIce() {
    util.log('Listening for ICE candidates.');
    pc.onicecandidate = function(evt) {
      if (evt.candidate) {
        util.log('Received ICE candidates.');
        _socket.send({
          type: 'CANDIDATE',
          payload: {
            candidate: evt.candidate
          },
          dst: self.peer
        });
      }
    };
    pc.oniceconnectionstatechange = function() {
      if (!!pc && pc.iceConnectionState === 'disconnected') {
        util.log('iceConnectionState is disconnected, closing connections to ' + this.peer);
        //self.close();
      }
    };
    // Fallback for older Chrome impls.
    pc.onicechange = function() {
      if (!!pc && pc.iceConnectionState === 'disconnected') {
        util.log('iceConnectionState is disconnected, closing connections to ' + this.peer);
        //self.close();
      }
    };
  }

  function _setupNegotiationHandler() {
    util.log('Listening for `negotiationneeded`');
    pc.onnegotiationneeded = function() {
      util.log('`negotiationneeded` triggered');
      _makeOffer();
    };
  }

  /** Send an offer. */
  function _makeOffer(){
    pc.createOffer(function(offer) {
      util.log('Created offer.');
      // Firefox currently does not support multiplexing once an offer is made.
      self.firefoxSingular = true;

      pc.setLocalDescription(offer, function() {
        util.log('Set localDescription to offer');
        _socket.send({
          type: 'OFFER',
          payload: {
            sdp: offer,
            config: _options.config,
            labels: labels
          },
          dst: self.peer
        });
        // We can now reset labels because all info has been communicated.
        labels = {};
      }, function(err) {
        //self.emit('error', err);
        util.log('Failed to setLocalDescription, ', err);
      });
    });
  }

  /** Create an answer for PC. */
  function _makeAnswer() {
    pc.createAnswer(function(answer) {
      util.log('Created answer.');
      pc.setLocalDescription(answer, function() {
        util.log('Set localDescription to answer.');
        _socket.send({
          type: 'ANSWER',
          payload: {
            sdp: answer
          },
          dst: self.peer
        });
      }, function(err) {
        //self.emit('error', err);
        util.log('Failed to setLocalDescription, ', err);
      });
    }, function(err) {
      //self.emit('error', err);
      util.log('Failed to create answer, ', err);
    });
  }

  /** Clean up PC, close related DCs. */
  function _cleanup() {
    util.log('Cleanup ConnectionManager for ' + this.peer);
    if (!!pc && (pc.readyState !== 'closed' || pc.signalingState !== 'closed')) {
      pc.close();
      pc = null;
    }

    _socket.send({
      type: 'LEAVE',
      dst: peer
    });

    //this.open = false;
    //this.emit('close');
  };

  return pc;
}

/** Handle an SDP. */
function handleSDP(pc, sdp, type) {
  sdp = new RTCSessionDescription(sdp);

  pc.setRemoteDescription(sdp, function() {
    util.log('Set remoteDescription: ' + type);
    if (type === 'OFFER') {
      _makeAnswer();
    }
  }, function(err) {
    //self.emit('error', err);
    util.log('Failed to setRemoteDescription, ', err);
  });
}

/** Handle a candidate. */
function handleCandidate(pc, message) {
  var candidate = new RTCIceCandidate(message.candidate);
  pc.addIceCandidate(candidate);
  util.log('Added ICE candidate.');
}

module.exports = {
  openConnection: openConnection,
  handleCandidate: handleCandidate,
  handleSDP: handleSDP

};
