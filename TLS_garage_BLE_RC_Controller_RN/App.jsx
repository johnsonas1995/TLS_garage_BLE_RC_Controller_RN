import React from 'react';
import { useState, useEffect } from 'react';

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
    Pressable, Platform
} from 'react-native'

import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from 'react-native-ble-manager';

import Slider from '@react-native-community/slider'

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const App = () => {
    const [throttleVal, setThrottleVal] = useState(0);
    const [steerVal, setSteerVal] = useState(0);
    const [lights, setLights] = useState(false);
    const [devices, setDevices] = useState([]);
    const lightsHandler = () => {
      setLights(current => !current)
      console.log("Lights:", lights)
    }
    const [isScanning, setIsScanning] = useState(false);
    const [peripheralState, setPeripheralState] = useState([])
    console.log("Speed:", throttleVal)
    console.log("Steering:", steerVal)

    const peripherals = []
    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral) => {
        console.log('Discovered peripheral:', peripheral.name)
        if (peripheral.name){
          const existingPeripheral = peripherals.find(item => item.id === peripheral.id);
          if(!existingPeripheral){
            peripherals.push({name:peripheral.name, id:peripheral.id})
          }
        }
    });

    bleManagerEmitter.addListener(
        'BleManagerStopScan',
        () => {
            console.log("done")
            // console.log(peripherals)
        }
    )

    const startScan = async () => {
        try {
            if (Platform.OS === 'android') {
                await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                ])
            }
            console.log('Starting Scan')
            await BleManager.start({showAlert: true})
            let state = await BleManager.checkState()
            while (state !== 'on') {
                await delay(500)
                state = await BleManager.checkState()
                console.log(state)
            }
            console.log(state, 'fuck')
            await BleManager.scan([], 5, true, {
              matchMode: BleScanMatchMode.Sticky,
              scanMode: BleScanMode.LowLatency,
              callbackType: BleScanCallbackType.AllMatches,
            })
            await delay(6000)
            setPeripheralState(peripherals)
        } catch (e) {
            console.log(e)
        }
    }

    const connectDevice = async () => {
        const foundDevice = peripheralState.find(device => device.name === 'DSD TECH')
        console.log(foundDevice)
        if (foundDevice) {
            try {
                await BleManager.connect(foundDevice.id)
                console.log('Connected!')
            } catch (e) {

            }
        }
    }
    const delay = ms => new Promise(res => setTimeout(res, ms))

    useEffect(() => {
        console.log("effect", peripheralState)
        if (peripheralState.length > 0) connectDevice()
    }, [peripheralState])

    return (
      <View style={styles.sectionContainer}>
      
      <Button 
        style={styles.scanButton} 
        title="Scan" 
        color="#40E0D0"
        onPress={startScan}>
      </Button>
      {/* <Image source={logo} style={{width:150, height:150, alignSelf:'center'}}/> */}
      
      <Text style={{alignSelf:'flex-start', marginTop: 25}}>   Speed: {throttleVal}</Text>
  
      <Slider style={{width:200, height:70, transform: [ { rotate: "-90deg" } ], alignSelf:'flex-start', marginTop: 75}}
        minimumValue={-10} 
        maximumValue={10}
        onValueChange={(value) => setThrottleVal(value)}
        step={1}
        value={throttleVal}
      />
      
        
      <Slider style={{width:200, height:40, alignSelf:'flex-end'}} 
        minimumValue={-1} 
        maximumValue={1}
        onValueChange={(value) => setSteerVal(value)}
        step={1}
        value={steerVal}
      />
      
      <Text style={{alignSelf:'flex-end'}}>   Steering: {steerVal}   </Text>
      <Button
          onPress={lightsHandler}
          style={styles.scanButton} 
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
      marginTop: 20,
      alignSelf:'flex-start',
    },
    lightsButton: {
      marginTop: 40,
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
