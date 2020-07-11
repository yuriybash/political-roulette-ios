// const express = require('express');
// const sslRedirect = require('heroku-ssl-redirect');
// const path = require('path');
// const http = require('http');
// const WebSocketServer = require('websocket').server;
import _ from 'lodash';
import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  RTCSessionDescription,
  RTCIceCandidate,
  registerGlobals,
} from 'react-native-webrtc';

import {localStream, remoteStream, startLocalStream} from './App';
import {log_error} from './client_util';

var uuid = require('react-native-uuid');

// const host = __DEV__ ? 'ws://127.0.0.1:5000' : 'SOME_ENV_HOST';
const host = __DEV__ ? 'ws://192.168.0.3:5000' : 'SOME_ENV_HOST';

let connection = null;
let clientID = null;
let opponentClientID = null; // targetClientID
let offerer_clientID = null;
let myPeerConnection = null;
let hasAddTrack = false;

let myParty = '';

function sendToServer(msg) {
  var msgJSON = JSON.stringify(msg);
  console.log('sending message: ' + JSON.stringify(msg));
  connection.send(msgJSON);
}

registerGlobals();

// myPeerConnection.setLocalDescription(desc).then(() => {
//   sendToServer({
//     type: 'video-offer',
//     target: opponentClientID,
//     sdp: myPeerConnection.localDescription,
//     username: clientID,
//     clientID,
//     party,
//   });
// });

export async function connect(party, on_delay, on_call_start, on_call_end) {
  myParty = party;
  console.log('Initiating connection as member of ' + party + ' party\n');

  connection = new WebSocket(host, 'json');
  connection.onopen = function(evt) {
    clientID = uuid.v4();

    sendToServer({
      type: 'invite',
      clientID: clientID,
      party: party,
    });

    connection.onmessage = function(evt) {
      const msg = JSON.parse(evt.data);

      switch (msg.type) {
        case 'delay':
          on_delay();
          break;

        case 'peer_info':
          console.log('on ' + party + ' side ' + 'peer info receieved');
          opponentClientID = msg.peer_id;
          on_call_start();
          createPeerConnection(on_call_end);




          startLocalStream()
            .then(stream => {
              console.log("in peer info case, localStream looks like:")
              console.log(localStream)
              // myPeerConnection.addStream(localStream);
            })
            .catch(error => {
              console.log('error adding stream');
            });

          console.log('on ' + party + ' side ' + '1111');
          myPeerConnection.createOffer().then(desc => {
            myPeerConnection.setLocalDescription(desc).then(() => {
              console.log('on ' + myParty + ' side ' + 'sending video-offer');
              sendToServer({
                type: 'video-offer',
                target: opponentClientID,
                sdp: myPeerConnection.localDescription,
                username: clientID,
                clientID,
                party,
              });
            });
          });
          console.log('on ' + party + ' side ' + '2222');

          break;

        case 'video-offer':
          console.log('on ' + party + ' side ' + 'video-offer receieved');
          on_call_start();
          handleVideoOfferMsg(msg, on_call_end);
          break;

        case 'video-answer':
          handleVideoAnswerMsg(msg);
          break;

        case 'new-ice-candidate':
          if (myPeerConnection) {
            console.log(
              'on ' +
                party +
                ' side ' +
                'new-ice-candidate message received and myPeerConnection exists',
            );
            handleNewICECandidateMsg(msg);
          } else {
            console.log(
              'on ' +
                myParty +
                ' side ' +
                "new-ice-candidate message received but myPeerConnection doesn't exist",
            );
          }
          break;

        case 'hang-up':
          handleHangUpMsg(msg, on_call_end);
          break;

        default:
          console.log(
            'on ' + party + ' side ' + 'unexpected msg received: ' + msg,
          );
          log_error(`Unknown message received: ${msg}`);
      }
    };
  };
}

function createPeerConnection(on_call_end) {
  console.log(
    'on ' +
      myParty +
      ' side ' +
      'creating PeerConnection for user ' +
      clientID +
      '\n',
  );
  const configuration = {iceServers: [{url: 'stun:stun.l.google.com:19302'}]};
  myPeerConnection = new RTCPeerConnection(configuration);
  hasAddTrack = myPeerConnection.addTrack !== undefined;

  myPeerConnection.onicecandidate = handleInternalICECandidateEvent;
  myPeerConnection.ontrack = handleTrackEvent;
  myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
  myPeerConnection.onremovetrack = _.bind(
    handleRemoveTrackEvent,
    null,
    _,
    on_call_end,
  );
  myPeerConnection.oniceconnectionstatechange = _.bind(
    handleICEConnectionStateChangeEvent,
    null,
    _,
    on_call_end,
  );
  myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
  myPeerConnection.onsignalingstatechange = _.bind(
    handleSignalingStateChangeEvent,
    null,
    _,
    on_call_end,
  );

  if (hasAddTrack) {
    myPeerConnection.ontrack = handleTrackEvent;
  } else {
    myPeerConnection.onaddstream = handleAddStreamEvent;
  }
}

function handleInternalICECandidateEvent(event) {
  console.log(
    'on ' + myParty + ' side ' + 'in handleInternalICECandidateEvent',
  );

  if (event.candidate) {
    sendToServer({
      type: 'new-ice-candidate',
      target: opponentClientID,
      candidate: event.candidate,
      username: clientID,
    });
  }
}

function handleVideoOfferMsg(msg, on_call_end) {
  console.log('on ' + myParty + ' side ' + 'in handleVideoOfferMsg');

  let newLocalStream = null;
  offerer_clientID = msg.clientID;
  opponentClientID = msg.clientID;

  createPeerConnection(on_call_end);

  const desc = new RTCSessionDescription(msg.sdp);


  // myPeerConnection.setRemoteDescription(desc).then(
  //   startLocalStream().then(stream => {
  //     console.log("on " + myParty + " side, setting localStream. looks like: ")
  //     console.log(localStream)
  //     myPeerConnection.addStream(localStream);
  //   })
  // )

    // .catch(_.bind(handleGetUserMediaError, null, _, on_call_end));



  myPeerConnection
    .setRemoteDescription(desc)
    .then(startLocalStream())
    .then(stream => {
      console.log("on " + myParty + " side, setting stream")
      // myPeerConnection.addStream(localStream);
      console.log("on " + myParty + " side, stream set")
    })
    .then(myPeerConnection.createAnswer())
    .then(answer => myPeerConnection.setLocalDescription(answer))
    .then(() => {
      let msg = {
        clientID,
        target: offerer_clientID,
        type: 'video-answer',
        sdp: myPeerConnection.localDescription,
      };
      sendToServer(msg);
    })
    .catch(_.bind(handleGetUserMediaError, null, _, on_call_end));

  // myPeerConnection
  //   .setRemoteDescription(desc)
  //   .then(() => startLocalStream().then(stream => {
  //     myPeerConnection.addStream(localStream)
  //   }).then(() => myPeerConnection.createAnswer())
  //   .then(answer => myPeerConnection.setLocalDescription(answer))
  //   .then(() => {
  //     console.log('on ' + myParty + ' side ' + "L210")
  //     const msg = {
  //       // name: myUsername,
  //       clientID,
  //       target: offerer_clientID,
  //       // hostname: myHostname,
  //       type: 'video-answer',
  //       sdp: myPeerConnection.localDescription,
  //     };
  //
  //     sendToServer(msg);
  //   })
  //   .catch(_.bind(handleGetUserMediaError, null, _, on_call_end));
  // .catch(handleGetUserMediaError);
}

function handleVideoAnswerMsg(msg) {
  console.log('on ' + myParty + ' side ' + 'in handleVideoAnswerMsg');
  const desc = new RTCSessionDescription(msg.sdp);
  myPeerConnection.setRemoteDescription(desc).catch(reportError);
  console.log('on ' + myParty + ' side ' + 'just set RemoteDescription');
}

function handleSignalingStateChangeEvent(event, on_call_end) {
  console.log('on ' + myParty + ' side ' + 'L232');
  console.log(
    'on ' + myParty + ' side ' + 'in handleSignalingStateChangeEvent',
  );
  switch (myPeerConnection.signalingState) {
    case 'closed':
      closeVideoCall(on_call_end);
      break;
    default:
      console.log(
        'on ' +
          myParty +
          ' side ' +
          'default case: ' +
          myPeerConnection.signalingState,
      );
      // console.log(myPeerConnection.signalingState)
      break;
  }
  console.log('L241');
}

function handleNewICECandidateMsg(msg) {
  console.log('in handleNewICECandidateMsg');
  const candidate = new RTCIceCandidate(msg.candidate);

  myPeerConnection.addIceCandidate(candidate).catch(reportError);
}

function handleICEConnectionStateChangeEvent(event, on_call_end) {
  console.log('in handleICEConnectionStateChangeEvent');

  switch (myPeerConnection.iceConnectionState) {
    case 'closed':
      alert('Your partner disconnected the call.');
    case 'failed':
      alert(
        'There was a communication error - please try starting a new call.',
      );
    case 'disconnected':
      alert('Your partner disconnected the call.');
      closeVideoCall(on_call_end);
      break;
    default:
      break;
  }
}

function handleAddStreamEvent(event) {
  console.log('on ' + myParty + ' side ' + 'in handleAddStreamEvent');
  remoteStream = event.stream;
}

function handleICEGatheringStateChangeEvent(event) {
  console.log(
    'on ' + myParty + ' side ' + 'in handleICEGatheringStateChangeEvent',
  );
}

function handleTrackEvent(event) {
  console.log('on ' + myParty + ' side ' + 'in handleTrackEvent');
  localStream = event.streams[0];
}

async function handleNegotiationNeededEvent() {
  console.log('in handleNegotiationNeededEvent');
  if (myPeerConnection._negotiating === true) {
    return;
  }
  myPeerConnection._negotiating = true;
  try {
    const offer = await myPeerConnection.createOffer();

    await myPeerConnection.setLocalDescription(offer);

    sendToServer({
      type: 'video-offer',
      target: opponentClientID,
      name: clientID,
      sdp: myPeerConnection.localDescription,
    });
  } catch (e) {
    reportError(e);
  } finally {
    myPeerConnection._negotiating = false;
  }
}

function handleRemoveTrackEvent(event, on_call_end) {
  console.log('on ' + myParty + ' side ' + 'in handleRemoveTrackEvent');
  const trackList = remoteStream.getTracks();

  if (trackList.length === 0) {
    closeVideoCall(on_call_end);
  }
}

export function closeVideoCall(on_close) {
  console.log('in closeVideoCall');
  if (myPeerConnection) {
    myPeerConnection.onaddstream = null;
    myPeerConnection.ontrack = null;
    myPeerConnection.onremovestream = null;
    myPeerConnection.onnicecandidate = null;
    myPeerConnection.oniceconnectionstatechange = null;
    myPeerConnection.onsignalingstatechange = null;
    myPeerConnection.onicegatheringstatechange = null;
    myPeerConnection.onnotificationneeded = null;

    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    remoteStream = null;
    localStream = null;

    myPeerConnection.close();
    myPeerConnection = null;
  }

  opponentClientID = offerer_clientID = null;
  on_close();
}

function handleHangUpMsg(msg, on_close) {
  alert('Your partner disconnected the call.');
  closeVideoCall(on_close);
}

function reportError(errMessage) {
  log_error('Error ' + errMessage.name + ': ' + errMessage.message);
}

function handleGetUserMediaError(e, on_call_end) {
  console.log('on ' + myParty + ' side ' + 'in handleGetUserMediaError')
  console.log(e);
  switch (e.name) {
    case 'NotFoundError':
      alert(
        'Unable to open your call because no camera and/or microphone' +
          'were found.',
      );
      break;
    case 'SecurityError':
    case 'PermissionDeniedError':
      break;
    default:
      alert(`Error opening your camera and/or microphone: ${e.message}`);
      break;
  }
}
