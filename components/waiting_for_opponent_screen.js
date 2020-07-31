import React, {Component} from 'react';
import {Text, View} from 'react-native';
import {connect} from 'react-redux';

function mapStateToProps(state) {
  return state.visible_state;
}

export class WaitingForOpponentScreenComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const visible = this.props.waiting_for_opponent;

    if (visible !== true) {
      return null;
    }

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

export const WaitingForOpponentScreen = connect(
  mapStateToProps,
  // mapDispatchToProps,
)(WaitingForOpponentScreenComponent);
