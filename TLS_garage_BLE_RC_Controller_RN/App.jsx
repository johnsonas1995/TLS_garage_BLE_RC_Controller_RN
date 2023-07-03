import React from 'react';
import { useState } from 'react';    
import type {Node} from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  PermissionsAndroid,
  View,
  Button,
  Image,
  NativeModules, DeviceEventEmitter,
} from 'react-native';

import Slider from '@react-native-community/slider'

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const NewAppScreen_1 = require("react-native/Libraries/NewAppScreen");
function Section({ children, title }) {
    const isDarkMode = (0, react_native_1.useColorScheme)() === 'dark';
    return (<react_native_1.View style={styles.sectionContainer}>
      <react_native_1.Text style={[
            styles.sectionTitle,
            {
                color: isDarkMode ? NewAppScreen_1.Colors.white : NewAppScreen_1.Colors.black,
            },
        ]}>
        {title}
      </react_native_1.Text>
      <react_native_1.Text style={[
            styles.sectionDescription,
            {
                color: isDarkMode ? NewAppScreen_1.Colors.light : NewAppScreen_1.Colors.dark,
            },
        ]}>
        {children}
      </react_native_1.Text>
    </react_native_1.View>);
}

const App: () => Node = () => {
    const [throttleVal, setThrottleVal] = useState(0);
    const [steerVal, setSteerVal] = useState(0);
    const [lights, setLights] = useState(false);
    const [devices, setDevices] = useState([]);
    const lightsHandler = () => {// need to add bt write function
      setLights(current => !current)
      console.log("Lights:", lights)
    }
    console.log("Speed:", throttleVal)
    console.log("Steering:", steerVal)
  
  
    return (
      <View style={styles.container}>
      {/* <Image source={logo} style={{width:150, height:150, alignSelf:'center'}}/> */}
      
      <Text style={{alignSelf:'flex-start'}}>   Speed: {throttleVal}</Text>
  
      <Slider style={{width:200, height:40, transform: [ { rotate: "-90deg" } ], alignSelf:'flex-start'}} //could use wheel picker instead
        minimumValue={-10} 
        maximumValue={10}
        onValueChange={(value) => setThrottleVal(value)}
        step={1}
        value={throttleVal}
        />
      
        <Slider style={{width:200, height:40, alignSelf:'flex-end'}} //could use wheel picker instead
        minimumValue={-1} 
        maximumValue={1}
        onValueChange={(value) => setSteerVal(value)}
        step={1}
        value={steerVal}
        />
  
      <Text style={{alignSelf:'flex-end'}}>   Steering: {steerVal}   </Text>
      <Button
          onPress={lightsHandler}
          title="Lights"
          color="#40E0D0"
          accessibilityLabel="Toggle Lights"
        />
        <StatusBar style="auto" />
      </View>
      
    );
  };
  
  const styles = StyleSheet.create({
    sectionContainer: {
      marginTop: 32,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '600',
    },
    sectionDescription: {
      marginTop: 8,
      fontSize: 18,
      fontWeight: '400',
    },
    highlight: {
      fontWeight: '700',
    },
  });
  
  export default App;
