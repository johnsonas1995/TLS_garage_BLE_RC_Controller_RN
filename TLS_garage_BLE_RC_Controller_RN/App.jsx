import React from 'react';
import { useState } from 'react';

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
  NativeEventEmitter,
  Pressable
} from 'react-native';

import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const SECONDS_TO_SCAN_FOR = 7;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = true;

// declare module 'react-native-ble-manager' {
//   // enrich local contract with custom state properties needed by App.tsx
//   interface Peripheral {
//     connected?: boolean;
//     connecting?: boolean;
//   }
// }

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
    const [isScanning, setIsScanning] = useState(false);
    const [peripherals, setPeripherals] = useState(
      // new Map<Peripheral['id'], Peripheral>(),
    );
    console.log("Speed:", throttleVal)
    console.log("Steering:", steerVal)

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral) => {
      console.log('Discovered peripheral:', peripheral);
    });

    bleManagerEmitter.addListener(
        'BleManagerStopScan',
        () => {
            console.log("done")
        }
    )

    const startScan = async () => {
      
        try {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            ])
            console.log('Starting Scan')
            await BleManager.start()
            await BleManager.scan([], 5, true, {
              matchMode: BleScanMatchMode.Sticky,
              scanMode: BleScanMode.LowLatency,
              callbackType: BleScanCallbackType.AllMatches,
            })
            BleManager.stopScan()
            
        } catch (e) {
            console.log(e)
        }
    }

    
  
  
    return (
      <View style={styles.sectionContainer}>
      <Button 
        style={styles.scanButton} 
        title="Scan" 
        onPress={startScan}>
      </Button>
      {/* <Image source={logo} style={{width:150, height:150, alignSelf:'center'}}/> */}
      
      <Text style={{alignSelf:'flex-start'}}>   Speed: {throttleVal}</Text>
  
      <Slider style={{width:200, height:70, transform: [ { rotate: "-90deg" } ], alignSelf:'flex-start'}} //could use wheel picker instead
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
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '600',
    },
    scanButton: {
      alignSelf:'flex-start',
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
