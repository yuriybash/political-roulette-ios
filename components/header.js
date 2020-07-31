import React, {Component} from 'react';
import {Text, View} from 'react-native';
import {connect} from 'react-redux';

// const mapStateToProps = state => ({...state.visible_state});
//
// const mapDispatchToProps = dispatch => ({});

export class Header extends Component {
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
//
// export default connect(
//   mapStateToProps,
//   mapDispatchToProps,
// )(Header);
