import {SafeAreaView, Text, TouchableHighlight, View} from 'react-native';
import React, {Component} from 'react';
import {Header} from './header';
import {PartySelection} from './party_selection';
import {connect} from 'react-redux';

const mapStateToProps = state => ({...state.visible_state});

class HomepageComponent extends Component {
  constructor(props) {
    super(props);
  }

  // handlePress = () => {
  //   // Need to check to prevent null exception.
  //   this.props.onPress?.(); // Same as this.props.onPress && this.props.onPress();
  // };

  render() {
    const visible = this.props.on_homepage;

    if (visible !== true) {
      return null;
    }

    return (
      <View style={{flex: 1}}>
        <Header />
        <PartySelection party="conservative" opposite_party="liberal" />
        <PartySelection party="liberal" opposite_party="conservative" />
      </View>
    );
  }
}

export const HomePage = connect(
  mapStateToProps,
)(HomepageComponent);
