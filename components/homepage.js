import {View} from 'react-native';
import React, {Component} from 'react';
import {Header} from './header';
import {PartySelection} from './party_selection';
import {connect} from 'react-redux';
import {CONSERVATIVE, LIBERAL} from '../constants/consts';

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
        <PartySelection party={CONSERVATIVE} opposite_party={LIBERAL} />
        <PartySelection party={LIBERAL} opposite_party={CONSERVATIVE} />
      </View>
    );
  }
}

export const HomePage = connect(mapStateToProps)(HomepageComponent);
