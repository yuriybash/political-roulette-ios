
import _ from 'lodash';
import {
  RTCPeerConnection,
  mediaDevices,
  RTCSessionDescription,
  RTCIceCandidate,
  registerGlobals,
} from 'react-native-webrtc';

import {localStream, remoteStream} from './App';

import {log_error} from './client_util';

var uuid = require('react-native-uuid');

const host = __DEV__ ? 'ws://192.168.1.237:5000' : 'SOME_ENV_HOST';

let connection = null;
let clientID = null;
let opponentClientID = null; // targetClientID
let offerer_clientID = null;
let myPeerConnection = null;
let hasAddTrack = false;

export var myParty = '';

function sendToServer(msg) {
  var msgJSON = JSON.stringify(msg);
  console.log('sending message: ' + JSON.stringify(msg));
  connection.send(msgJSON);
}

registerGlobals();

export const startLocalStream = async localStreamSetter => {
  console.log('in startlocalstream');

  // isFront will determine if the initial camera should face user or environment
  const isFront = true;
  const devices = await mediaDevices.enumerateDevices();

  const facing = isFront ? 'front' : 'environment';
  const videoSourceId = devices.find(
    device => device.kind === 'videoinput' && device.facing === facing,
  );
  const facingMode = isFront ? 'user' : 'environment';
  const constraints = {
    audio: true,
    video: {
      mandatory: {
        minWidth: 500, // Provide your own width, height and frame rate here
        minHeight: 300,
        minFrameRate: 30,
      },
      facingMode,
      optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
    },
  };
  const newStream = await mediaDevices.getUserMedia(constraints);
  localStreamSetter(newStream);
  // localStream = newStream
  return new Promise((resolve, reject) => {
    if (true) {
      resolve(newStream);
    } else {
      reject(newStream);
    }
  });
};

export async function connect(
  party,
  on_delay,
  on_call_start,
  on_call_end,
  localStreamSetter,
  remoteStreamSetter,
) {
  myParty = party;
  console.log('Initiating connection as member of ' + party + ' party\n');

  // startLocalStream(localStreamSetter);

  connection = new WebSocket(host, 'json');
  connection.onopen = function(evt) {
    clientID = uuid.v4();

    sendToServer({
      type: 'invite',
      clientID: clientID,
      party: party,
    });

    connection.onmessage = async function(evt) {
      const msg = JSON.parse(evt.data);

      switch (msg.type) {
        case 'delay':
          on_delay();
          break;

        case 'peer_info':
          console.log('on ' + party + ' side ' + 'peer info receieved');
          opponentClientID = msg.peer_id;
          on_call_start();
          console.log('L124');

          startLocalStream(localStreamSetter)
            .then(newStream => {
              createPeerConnection(on_call_end, remoteStreamSetter);
              console.log(
                'in party ' +
                  myParty +
                  ' , just set local stream, looks like: ' +
                  JSON.stringify(newStream),
              );
              myPeerConnection.addStream(newStream);
            })
            .then(() => {
              // createPeerConnection(on_call_end, remoteStreamSetter);
              myPeerConnection
                .createOffer()
                .then(offer => {
                  myPeerConnection
                    .setLocalDescription(offer)
                    .then(() => {
                      console.log(
                        'on ' + myParty + ' side ' + 'sending video-offer',
                      );
                      sendToServer({
                        type: 'video-offer',
                        target: opponentClientID,
                        sdp: myPeerConnection.localDescription,
                        username: clientID,
                        clientID,
                        party,
                      });
                    })
                    .catch(reportError);
                })
                .catch(reportError);
            })
            .catch(reportError);
          break;

        case 'video-offer':
          console.log('on ' + party + ' side ' + 'video-offer receieved');
          on_call_start();
          handleVideoOfferMsg(
            msg,
            on_call_end,
            localStreamSetter,
            remoteStreamSetter,
          );
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
            handleIceCandidateFromPeerReceived(msg);
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

function createPeerConnection(on_call_end, remoteStreamSetter) {
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

  myPeerConnection.onicecandidate = handleICECandidateCreatedLocallyEvent;
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
    myPeerConnection.onaddstream = _.bind(
      handleAddStreamEvent,
      null,
      _,
      remoteStreamSetter,
    );
    // myPeerConnection.onaddstream = handleAddStreamEvent;
  }
}

function handleICECandidateCreatedLocallyEvent(event) {
  console.log(
    'on ' + myParty + ' side ' + 'in handleICECandidateCreatedLocallyEvent',
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

function handleVideoOfferMsg(
  msg,
  on_call_end,
  local_stream_setter,
  remote_stream_setter,
) {
  console.log('on ' + myParty + ' side ' + 'in handleVideoOfferMsg');

  let newLocalStream = null;
  offerer_clientID = msg.clientID;
  opponentClientID = msg.clientID;

  // const desc = new RTCSessionDescription(msg.sdp);

  startLocalStream(local_stream_setter)
    .then(newStream => {
      createPeerConnection(on_call_end, remote_stream_setter);
      console.log('on ' + myParty + ' side ' + 'L276');
      myPeerConnection.addStream(newStream);

      myPeerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      console.log('on ' + myParty + ' side ' + ' L279');
    })
    .then(() => {
      myPeerConnection.createAnswer().then(answer => {
        console.log('answer L283:::' + JSON.stringify(answer));
        myPeerConnection.setLocalDescription(answer).then(() => {
          let msg = {
            clientID,
            target: offerer_clientID,
            type: 'video-answer',
            sdp: myPeerConnection.localDescription,
          };
          sendToServer(msg);
          console.log(
            'on ' +
              myParty +
              ' side, video-answer sent; sdp sent: ' +
              myPeerConnection.localDescription,
          );
        });
      });
    })
    .catch(reportError);
}

function handleVideoAnswerMsg(msg) {
  console.log(
    'on ' +
      myParty +
      ' side ' +
      'in handleVideoAnswerMsg, msg: ' +
      JSON.stringify(msg),
  );
  const desc = new RTCSessionDescription(msg.sdp);
  myPeerConnection.setRemoteDescription(desc).catch(reportError);
  console.log('on ' + myParty + ' side ' + 'just set RemoteDescription');

  console.log(
    'on ' +
      myParty +
      ' side ' +
      'in handleVideoAnswerMsg, video answer handled',
  );
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

function handleIceCandidateFromPeerReceived(msg) {
  console.log('in handleIceCandidateFromPeerReceived');
  const candidate = new RTCIceCandidate(msg.candidate);

  myPeerConnection.addIceCandidate(candidate).catch(reportError);
  // myPeerConnection.addIceCandidate(msg.candidate).catch(err => {
  //   console.log('blarggg' + err);
  // });
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
      console.log('other type of handleICEConnectionStateChangeEvent');
      break;
  }
}

function handleAddStreamEvent(event, remote_stream_setter) {
  console.log(
    'on ' +
      myParty +
      ' side ' +
      'in handleAddStreamEvent, stream looks like: ' +
      JSON.stringify(event.stream),
  );
  remote_stream_setter(event.stream);
  // myPeerConnection.addStream(event.stream)
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
  console.log('on ' + myParty + ' side, in handleNegotiationNeededEvent');
  // if (myPeerConnection._negotiating === true) {
  //   return;
  // }
  // myPeerConnection._negotiating = true;
  // try {
  //   const offer = await myPeerConnection.createOffer();
  //
  //   await myPeerConnection.setLocalDescription(offer);
  //
  //   sendToServer({
  //     type: 'video-offer',
  //     target: opponentClientID,
  //     name: clientID,
  //     sdp: myPeerConnection.localDescription,
  //   });
  // } catch (e) {
  //   reportError(e);
  // } finally {
  //   myPeerConnection._negotiating = false;
  // }
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
  log_error('Error::: ' + errMessage);
}

function handleGetUserMediaError(e, on_call_end) {
  console.log('on ' + myParty + ' side ' + 'in handleGetUserMediaError');
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
