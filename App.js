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

export default function PoliticalRouletteApp() {
  const [localStream, setLocalStream] = React.useState();
  const [inCall, setInCall] = React.useState(false);
  const [party, setParty] = React.useState();

  const startLocalStream = async () => {

    console.log("111")


    // isFront will determine if the initial camera should face user or environment
    const isFront = true;
    const devices = await mediaDevices.enumerateDevices();


    console.log("222")

    const facing = isFront ? 'front' : 'environment';
    const videoSourceId = devices.find(device => device.kind === 'videoinput' && device.facing === facing);
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
    setLocalStream(newStream);
  };





  const startcall = () => {
    console.log("startcall")
    startLocalStream()
  };

  const setLiberal = () => {
    setParty('liberal');
    console.log(party);
    startcall();
  };

  const setConservative = () => {
    setParty('conservative');
    console.log(party);
    startcall();
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      {!inCall && <Header />}
      {!inCall && (
        <PartySelection
          party="conservative"
          opposite_party="liberal"
          onPress={setLiberal}
        />
      )}
      {!inCall && (
        <PartySelection
          party="liberal"
          opposite_party="conservative"
          onPress={setConservative}
        />
      )}
    </SafeAreaView>
  );
}
