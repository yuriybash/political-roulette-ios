import React, {Component} from 'react';
import {Text, View} from 'react-native';

export class WaitingForOpponentScreen extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
        }}>
        <Text style={{fontSize: 24}}>Finding partner, please wait...</Text>
      </View>
    );
  }
}
