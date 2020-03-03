/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {View, Text, Button, TouchableHighlight, StyleSheet} from 'react-native';

class PartySelection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
    };
  }

  onClick = () => {
    alert(this.props.party);
  };

  render() {
    if (this.state.visible !== true) {
      return null;
    }

    return (
      <View style={{flex: 2}}>
        <TouchableHighlight onPress={this.onClick} underlayColor="black">
          <View
            style={{
              alignItems: 'center',
                backgroundColor: this.props.party == 'conservative' ? 'red':'blue',
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

export default class PoliticalRouletteApp extends Component {
  render() {
    return (
      <View style={{flex: 1}}>
        <Header />
        <PartySelection party="conservative" opposite_party="liberal" />
        <PartySelection party="liberal" opposite_party="conservative" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  // container: {
  //   paddingTop: 60,
  //   alignItems: 'center',
  // },
  button: {
    // marginBottom: 30,
    // width: 260,
    alignItems: 'center',
    backgroundColor: '#2196F3',
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
  },
  // header: {
  //   flex: 1,
  //   backgroundColor: 'grey',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
});
