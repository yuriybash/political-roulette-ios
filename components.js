import React, {Component} from 'react';
import {Text, TouchableHighlight, View} from 'react-native';

export class PartySelection extends Component {
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

