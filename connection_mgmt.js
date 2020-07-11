var all_connections = [],
  lib_callers_queue = [],
  con_callers_queue = [];

function sendToOneUser(target_clientID, msgString) {
  let target_conn = getConnectionForID(target_clientID);
  if (target_conn) {
    console.log("Signaling server is sending the following message to user " + target_clientID + ": " + msgString)
    target_conn.sendUTF(msgString);
  }
}

function getConnectionForID(target_clientID) {
  let connect = null;

  for (let i = 0; i < all_connections.length; i++) {
    if (all_connections[i].clientID === target_clientID) {
      connect = all_connections[i];
      break;
    }
  }
  return connect;
}

function handle_request(request) {
  let connection = request.accept('json', request.origin);
  console.log('request received on signalling server');

  connection.on('message', function(message) {
    var msg;
    if (message.type === 'utf8') {
      msg = JSON.parse(message.utf8Data);
      console.log('message payload in signaling server: ' + JSON.stringify(msg));
    } else {
      console.log('unknown message type received');
      return;
    }

    console.log(msg.type);
    switch (msg.type) {
      case 'invite':
        connection.clientID = msg.clientID;
        all_connections.push(connection);

        let opponent_queue =
          msg.party === 'liberal' ? con_callers_queue : lib_callers_queue;
        let outgoing_msg = {};

        if (opponent_queue.length < 1) {
          let self_queue =
            msg.party === 'liberal' ? lib_callers_queue : con_callers_queue;
          self_queue.push(connection);

          outgoing_msg = {
            type: 'delay',
            message:
              'Please wait while we pair you with someone. This may take a minute.',
          };
        } else {
          let peer = opponent_queue.shift();

          outgoing_msg = {
            type: 'peer_info',
            peer_id: peer.clientID,
          };
        }
        sendToOneUser(connection.clientID, JSON.stringify(outgoing_msg));
        break;
      default:
        sendToOneUser(msg.target, JSON.stringify(msg));
    }
  });

  connection.on('close', function(reason, description) {
    let disconnected = [];
    all_connections = all_connections.filter(function(el, idx, ar) {
      if (!el.connected) {
        disconnected.push(el.clientID);
      }
      return el.connected;
    });
    lib_callers_queue = lib_callers_queue.filter(function(el, idx, ar) {
      return !disconnected.includes(el.clientID);
    });
    con_callers_queue = con_callers_queue.filter(function(el, idx, ar) {
      return !disconnected.includes(el.clientID);
    });

    let logMessage = `Connection closed: ${
      connection.remoteAddress
    } (${reason}`;
    if (description !== null && description.length !== 0) {
      logMessage += ': ' + description;
    }
    console.log(`[${new Date().toLocaleTimeString()}] ${logMessage})`);
  });
}

module.exports = handle_request;
