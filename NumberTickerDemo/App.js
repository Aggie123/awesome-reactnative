/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";

import Ticker, { Tick } from "./NumberTicker";

const styles = {
  view: {
    alignItems: 'center',
    border: '1px solid red',
    marginTop: 50
  },
  text: {
    fontSize: 20,
    color: "#abe333"
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333"
  },
}

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      serviceNum: 344546573,
      cureRate: '98.77%',
      height: 20,
    };

    setInterval(() => {
      this.setState({
        serviceNum: 344546573,
      });
    }, 5000);
  }

  /**
   * 生成一个随机数
   */
  getRandomNum = num => {
    return Math.random() * num;
  }

  addCommas = nStr => {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }

  render() {

    var value = this.addCommas(this.state.serviceNum);
    return (
      <View style={styles.container}>
        <Text style={styles.text} >累计服务</Text>
        <Ticker textStyle={styles.text} tickerNum={3} height={26} >
          {value}
        </Ticker>
      </View>
    );
  }
}


// export default App
