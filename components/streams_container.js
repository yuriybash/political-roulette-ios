import {Text, View} from 'react-native';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {styles} from '../styles';
import {RTCView} from 'react-native-webrtc';

const mapStateToProps = state => ({...state.stream_info});

class StreamsContainerComponent extends Component {
  constructor(props) {
    super(props);
  }

  // handlePress = () => {
  //   // Need to check to prevent null exception.
  //   this.props.onPress?.(); // Same as this.props.onPress && this.props.onPress();
  // };

  render() {
    const visible = this.props.in_call;

    if (visible !== true) {
      return null;
    }

    return (
      <View style={{flex: 1}}>
        <View style={styles.rtcview}>
          {
            <RTCView
              style={styles.rtc}
              streamURL={this.props.local_stream.toURL()}
            />
          }
        </View>

        <Text style={{fontSize: 24}}>LOCALSTREAM TEST</Text>

        <View style={styles.rtcview}>
          {
            <RTCView
              style={styles.rtc}
              streamURL={this.props.remote_stream.toURL()}
            />
          }
        </View>
      </View>
    );
  }
}

export const HomePage = connect(mapStateToProps)(StreamsContainerComponent);
