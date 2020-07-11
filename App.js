/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  View,
  Text,
  Button,
  TouchableHighlight,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import {RTCPeerConnection, RTCView, mediaDevices} from 'react-native-webrtc';
import {connect, myPeerConnection} from './connection';

class PartySelection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
    };
  }

  handlePress = () => {
    // Need to check to prevent null exception.
    this.props.onPress?.(); // Same as this.props.onPress && this.props.onPress();
  };

  render() {
    if (this.state.visible !== true) {
      return null;
    }

    return (
      <View style={{flex: 2}}>
        <TouchableHighlight onPress={this.handlePress} underlayColor="black">
          <View
            style={{
              alignItems: 'center',
              backgroundColor:
                this.props.party === 'conservative' ? 'red' : 'blue',
              justifyContent: 'center',
              height: 400,
            }}>
            <Text>
              I'm a {this.props.party}, bring me a {this.props.opposite_party}
            </Text>
          </View>
        </TouchableHighlight>
      </View>
    );
  }
}

class Header extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'powderblue',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{fontSize: 24}}>Welcome to Political Roulette</Text>
      </View>
    );
  }
}

class WaitingForOpponentScreen extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
        }}>
        <Text style={{fontSize: 24}}>Loading, please wait...</Text>
      </View>
    );
  }
}

export var localStream;
export var remoteStream;

export const startLocalStream = async () => {


  console.log("in startlocalstream")
  let isFront = true;
  await navigator.mediaDevices.getUserMedia({audio: true, video: true});
  mediaDevices.enumerateDevices().then(sourceInfos => {
    console.log('sourceInfos.length: ' + sourceInfos.length);
    let videoSourceId;
    for (let i = 0; i < sourceInfos.length; i++) {
      const sourceInfo = sourceInfos[i];
      if (
        sourceInfo.kind == 'videoinput' &&
        sourceInfo.facing == (isFront ? 'front' : 'environment')
      ) {
        videoSourceId = sourceInfo.deviceId;
      }
    }
    mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          mandatory: {
            minWidth: 500, // Provide your own width, height and frame rate here
            minHeight: 300,
            minFrameRate: 30,
          },
          facingMode: isFront ? 'user' : 'environment',
          optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
        },
      })
      .then(stream => {
        console.log('setting local stream, looks like:');
        console.log(stream);
        localStream = stream;
        console.log("returning stream, looks like:")
        console.log("L149")
      })
      .catch(error => {
        console.log('error getting stream client-side');
      });
  });
};

export default function PoliticalRouletteApp() {
  // const [localStream, setLocalStream] = React.useState(false);
  // const [cachedLocalPC, setCachedLocalPC] = React.useState();
  // const [cachedRemotePC, setCachedRemotePC] = React.useState();
  // const [remoteStream, setRemoteStream] = React.useState(false);
  const [
    waitingForPartySelection,
    setWaitingForPartySelection,
  ] = React.useState(true);
  const [inCall, setInCall] = React.useState(false);
  const [party, setParty] = React.useState();
  const [waitingForOpponent, setWaitingForOpponent] = React.useState(false);

  function on_delay() {
    setInCall(false);
    setWaitingForPartySelection(false);
    setWaitingForOpponent(true);
  }

  function on_call_start() {
    setWaitingForPartySelection(false);
    setWaitingForOpponent(false);
    setInCall(true);
  }

  const initializeCall = party => {
    connect(
      party,
      on_delay,
      on_call_start,
      null,
    );
  };

  const setLiberal = () => {
    setParty('liberal');
    initializeCall('liberal');
  };

  const setConservative = () => {
    setParty('conservative');
    initializeCall('conservative');
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      {waitingForPartySelection && <Header />}
      {waitingForPartySelection && (
        <PartySelection
          party="conservative"
          opposite_party="liberal"
          onPress={setConservative}
        />
      )}
      {waitingForPartySelection && (
        <PartySelection
          party="liberal"
          opposite_party="conservative"
          onPress={setLiberal}
        />
      )}
      {waitingForOpponent && <WaitingForOpponentScreen />}

      {localStream && (
        <View style={styles.rtcview}>
          {<RTCView style={styles.rtc} streamURL={localStream.toURL()} />}
        </View>
      )}

      {localStream && <Text style={{fontSize: 24}}>LOCALSTREAM TEST</Text>}

      {remoteStream && (
        <View style={styles.rtcview}>
          <Text style={{fontSize: 24}}>REMOTESTREAM TEST</Text>
        </View>
      )}



      {remoteStream && (
        <View style={styles.rtcview}>
          {<RTCView style={styles.rtc} streamURL={remoteStream.toURL()} />}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#313131',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  text: {
    fontSize: 30,
  },
  rtcview: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '40%',
    width: '80%',
    backgroundColor: 'black',
  },
  rtc: {
    width: '80%',
    height: '100%',
  },
  toggleButtons: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
