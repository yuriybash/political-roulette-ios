/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {SafeAreaView, Text, View} from 'react-native';

import {RTCView} from 'react-native-webrtc';
import {connect, myParty, myPeerConnection} from './connection';
import {styles} from './styles';
import {Provider} from 'react-redux';
import configureStore from './store';
import {WaitingForOpponentScreen} from './components/waiting_for_opponent_screen';
import {Header} from './components/header';
import {PartySelection} from './components/party_selection';
import {HomePage} from './components/homepage';

const initialState = {
  visible_state: {
    on_homepage: true,
    in_call: false,
    waiting_for_opponent: false,
  },
  stream_info: {
    local_stream: null,
    remote_stream: null,
  },
};

const store = configureStore(initialState);

export default function PoliticalRouletteApp() {
  const [
    waitingForPartySelection,
    setWaitingForPartySelection,
  ] = React.useState(true);
  const [inCall, setInCall] = React.useState(false);
  const [party, setParty] = React.useState();
  const [waitingForOpponent, setWaitingForOpponent] = React.useState(false);

  const [localStream, setLocalStream] = React.useState();
  const [remoteStream, setRemoteStream] = React.useState();

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

  function setRemoteStreamAndlog(remoteStream) {
    console.log('setting remote stream for party ' + myParty);
    setRemoteStream(remoteStream);
  }

  const initializeCall = party => {
    connect(
      party,
      on_delay,
      on_call_start,
      null,
      setLocalStream,
      setRemoteStreamAndlog,
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
    <Provider store={store}>
      <SafeAreaView style={{flex: 1}}>
        <HomePage />

        <WaitingForOpponentScreen />

        {/*{localStream && (*/}
        {/*  <View style={styles.rtcview}>*/}
        {/*    {<RTCView style={styles.rtc} streamURL={localStream.toURL()} />}*/}
        {/*  </View>*/}
        {/*)}*/}

        {/*{localStream && <Text style={{fontSize: 24}}>LOCALSTREAM TEST</Text>}*/}

        {/*{remoteStream && (*/}
        {/*  <View style={styles.rtcview}>*/}
        {/*    {<RTCView style={styles.rtc} streamURL={remoteStream.toURL()} />}*/}
        {/*  </View>*/}
        {/*)}*/}
      </SafeAreaView>
    </Provider>
  );
}
