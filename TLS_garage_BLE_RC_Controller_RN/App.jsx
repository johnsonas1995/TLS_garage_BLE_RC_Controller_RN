import React from 'react'
import {useState, useEffect} from 'react'
import {Buffer} from 'buffer'

import {
	StatusBar,
	StyleSheet,
	Text,
	PermissionsAndroid,
	View,
	Button,
	NativeModules,
	NativeEventEmitter,
	Platform, useColorScheme
} from 'react-native'

import BleManager, {
	BleScanCallbackType,
	BleScanMatchMode,
	BleScanMode,
} from 'react-native-ble-manager'

import Slider from '@react-native-community/slider'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

const App = () => {
	const deviceScheme = useColorScheme()
	const textColor = deviceScheme === 'dark' ? 'white' : 'black'
	const [throttleVal, setThrottleVal] = useState(0)
	const [steerVal, setSteerVal] = useState(0)
	const [lights, setLights] = useState(false)
	const [devices, setDevices] = useState([])
	const lightsHandler = () => {
		setLights(current => !current)
		console.log('Lights:', lights)
	}
	const [isScanning, setIsScanning] = useState(false)
	const [isConnected, setIsConnected] = useState(false)
	const [peripheralState, setPeripheralState] = useState([])
	const [peripheralId, setPeripheralId] = useState('')
	console.log('Speed:', throttleVal)
	console.log('Steering:', steerVal)

	const peripherals = []
	bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral) => {
		console.log('Discovered peripheral:', peripheral.name)
		if (peripheral.name) {
			const existingPeripheral = peripherals.find(item => item.id === peripheral.id)
			if (!existingPeripheral) {
				peripherals.push({name: peripheral.name, id: peripheral.id})
			}
		}
	})

	bleManagerEmitter.addListener(
		'BleManagerStopScan',
		() => {
			console.log('done')
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

			await BleManager.scan([], 2, true, {
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
		setPeripheralId(foundDevice.id)
		console.log(foundDevice)
		if (foundDevice) {
			try {
				await BleManager.connect(foundDevice.id)
				console.log('Connected!')
				setIsConnected(true)
				const info = await BleManager.retrieveServices(foundDevice.id)
				console.log('Services retrieved', info)
			} catch (e) {
				setIsConnected(false)
				console.log(e)
			}
		}
	}

	const writeToDevice = async ({id, message}) => {
		try {
			const buffer = Buffer.from(message)
			await BleManager.writeWithoutResponse(id, 'ffe0', 'ffe1', buffer.toJSON().data)
			console.log(`Wrote ${message} to BLE Device`)
		} catch (e) {
			console.log(e)
		}
	}
	const delay = ms => new Promise(res => setTimeout(res, ms))

	useEffect(() => {
		console.log('effect', peripheralState)
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

			<Text style={{alignSelf: 'flex-start', marginTop: 25, color: textColor}}> Speed: {throttleVal}</Text>

			<Slider style={{
				width: 200,
				height: 70,
				transform: [{rotate: '-90deg'}],
				alignSelf: 'flex-start',
				marginTop: 75
			}}
					minimumValue={-10}
					maximumValue={10}
					onValueChange={(value) => setThrottleVal(value)}
					step={1}
					value={throttleVal}
			/>
			{isConnected ?
				<Text style={{alignSelf: 'center', color: textColor}}>Connected</Text>
				: <Text style={{alignSelf: 'center', color: textColor}}>Not Connected</Text>}

			<Button
				onPress={() => writeToDevice({id: peripheralId, message: 'N'})}
				style={styles.scanButton}
				title="TURN ON"
				color="white"
				accessibilityLabel="Toggle Lights"
			/>
			<Button
				onPress={() => writeToDevice({id: peripheralId, message: 'O'})}
				style={styles.scanButton}
				title="TURN OFF"
				color="white"
				accessibilityLabel="Toggle Lights"
			/>


			<Slider style={{width: 200, height: 40, alignSelf: 'flex-end'}}
					minimumValue={-1}
					maximumValue={1}
					onValueChange={(value) => setSteerVal(value)}
					step={1}
					value={steerVal}
			/>

			<Text style={{alignSelf: 'flex-end', color: textColor}}> Steering: {steerVal}   </Text>
			<Button
				onPress={lightsHandler}
				style={styles.scanButton}
				title="Lights"
				color="#40E0D0"
				accessibilityLabel="Toggle Lights"
			/>

			<StatusBar style="auto"/>
		</View>

	)
}

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
		alignSelf: 'flex-start',
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
})

export default App
