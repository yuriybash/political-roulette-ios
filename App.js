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
  _opposite_party(party) {
    if (party === 'conservative') {
      return 'liberal';
    } else {
      return 'conservative';
    }
  }

  _party_color(party) {
    if (party === 'conservative') {
      return 'red';
    } else {
      return 'blue';
    }
  }

  _onPressConservative() {
    alert('You are a conserative');
  }

  _onPressLiberal() {
    alert('You are a liberal');
  }

  render() {
    return (
      <View style={{flex: 2}}>
        <TouchableHighlight
          onPress={this._onPressLiberal}
          underlayColor="black">
          <View
            style={{
              alignItems: 'center',
              backgroundColor: this._party_color(this.props.party),
              justifyContent: 'center',
              height: 400,
            }}>
            <Text>
              I'm a {this.props.party}, bring me a{' '}
              {this._opposite_party(this.props.party)}
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

        <PartySelection party="conservative" />

        <PartySelection party={'liberal'} />
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
