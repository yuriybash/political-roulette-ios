import React, {Component} from 'react';
import {Text, TouchableHighlight, View} from 'react-native';
import {connect} from 'react-redux';
import {INITIAL_CONNECT_ATTEMPT} from '../constants/actionTypes';

function mapStateToProps(state) {
  return state.visible_state;
}

const mapDispatchToProps = dispatch => {
  return {
    onRequestPairing: function(party) {
      dispatch({type: INITIAL_CONNECT_ATTEMPT, party: party});
    },
  };
};

class PartySelectionComponent extends Component {
  constructor(props) {
    super(props);
  }

  handlePress = () => {
    // Need to check to prevent null exception.
    this.props.onPress?.(); // Same as this.props.onPress && this.props.onPress();
  };

  render() {
    console.log('xxxx');
    console.log(this.props);
    const visible = this.props.on_homepage;

    // if (visible !== true) {
    //   return null;
    // }

    return (
      <View style={{flex: 2}}>
        <TouchableHighlight
          onPress={this.props.onRequestPairing}
          underlayColor="black">
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

export const PartySelection = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PartySelectionComponent);
