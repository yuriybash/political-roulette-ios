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
import {PartySelection} from './components';
import {styles} from './styles';
import {Provider} from 'react-redux';
import configureStore from './store';
import {WaitingForOpponentScreen} from './components/waiting_for_opponent_screen';
import {Header} from './components/header';


const initialState = {}
const store = configureStore(initialState)

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
            {<RTCView style={styles.rtc} streamURL={remoteStream.toURL()} />}
          </View>
        )}
      </SafeAreaView>
    </Provider>
  );
}
