import React, { useEffect, useReducer, useRef } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Platform, ActivityIndicator } from 'react-native'
import { observer, inject } from 'mobx-react'
import auth from '@react-native-firebase/auth'
import { PERMISSIONS } from 'react-native-permissions'
import { TextInput, Button } from 'react-native-paper'
import { APP_MAIN_COLOR, ALARM_RESPONSE_MODES } from '../constants/app'
import FrontendContainer from '../containers/misc/frontend_container'
import CssHelper from '../helpers/css_helper'
import MiscHelper from '../helpers/misc_helper'
import StartShiftsDb, { StartShift, STATUSES } from '../firebase/start_shifts'
import LogsDb from '../firebase/logs'
import Error from '../components/error'

const WelcomeContainer = inject('mobxStore')(observer(({ mobxStore, navigation }) => {
    const [state, setState] = useReducer(
        (state, newState) => ({...state, ...newState}),
        {
            carRego: '',
            odometer: '',
            carRegoError: '',
            odometerError: '',
            coords: null,
            shiftNotFoundError: false,
            isLoading: true,
            isFormSubmitting: false
        }
    )

    const { carRego, odometer, carRegoError, odometerError, coords, shiftNotFoundError, isLoading, isFormSubmitting } = state
    const carRegoRef = useRef(null)
    const odometerRef = useRef(null)

    const user = mobxStore.user
    const uid = mobxStore.uid

    useEffect(() => {
        async function checkStartShift() {
            try {
                const startShift = await StartShiftsDb.getUserStartShift(uid, STATUSES.ON_PROGRESS)
                if (startShift instanceof StartShift && startShift.getStatus() === STATUSES.ON_PROGRESS) {
                    mobxStore.setValues({
                        startShift
                    })
    
                    navigation.navigate('ShiftDashboard', {
                        patrol_shift_id: startShift.getPatrolShiftId(),
                        start_date: startShift.getStartDate()
                    })
                } else {
                    setState({
                        isLoading: false
                    })
                }
            } catch (e) {
                LogsDb.saveLog(e)
            }
        }

        checkStartShift()
    }, [])

    useEffect(() => {
        async function requestLocationPermission() {
            try {
                const granted = await MiscHelper.requestPermission(
                    Platform.select({
                        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                    })
                )

                if (granted) {
                    const position = await MiscHelper.getCurrentPosition()
                    setState({
                        coords: position.coords
                    })
                }
            } catch (e) {
                MiscHelper.openSettings()
            }
        }
        
        requestLocationPermission()
    }, [])

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setState({
                carRego: '',
                odometer: '',
                isFormSubmitting: false
            })
        })

        return unsubscribe
    }, [navigation])

    const onChange = (e, name) => {
        const { text } = e.nativeEvent
        const obj = {}
        obj[name] = text
        setState(obj)
    }

    const onSubmit = async () => {
        setState({
            carRegoError: '',
            odometerError: '',
            shiftNotFoundError: false
        })
        if (carRego === '') {
            setState({
                carRegoError: 'Car Rego is required'
            })
            carRegoRef.current.focus()
        } else if (odometer === '') {
            setState({
                odometerError: 'Odometer is required'
            })
            odometerRef.current.focus()
        } else {
            setState({
                isFormSubmitting: true
            })
            try {
                const startShift = await StartShiftsDb.getUserStartShift(uid)
                if (startShift instanceof StartShift) {
                    startShift.setCarRego(carRego)
                    startShift.setOdometer(odometer)
                    startShift.setStatus(STATUSES.ON_PROGRESS)
                    if (coords) {
                        const { latitude, longitude } = coords
                        startShift.setLocation({
                            latitude,
                            longitude
                        })
                    }
                    
                    await StartShiftsDb.updateStartShift(startShift.getStartShiftId(), startShift)
                    mobxStore.setValues({
                        startShift
                    })
    
                    navigation.navigate('ShiftDashboard', {
                        patrol_shift_id: startShift.getPatrolShiftId(),
                        start_date: startShift.getStartDate()
                    })
                } else {
                    setState({
                        shiftNotFoundError: true,
                        isFormSubmitting: false
                    })
                }    
            } catch (error) {
                LogsDb.saveLog(error)
            }
        }
    }

    const logout = () => {
        auth().signOut()
    }

    const goAlarmResponse = () => {
        navigation.navigate('AlarmResponse', {
            alarmResponseMode: ALARM_RESPONSE_MODES.WELCOME_PAGE
        })
    }

    const title = user ? `Welcome, ${user.getFirstName()}` : ''

    return (
        <FrontendContainer title={title}>
            { isLoading ? (
                <View style={{marginTop: 100}}>
                    <ActivityIndicator size="large" color={APP_MAIN_COLOR}/>
                </View>
            ) : (
                <>
                    <Text style={CssHelper['note']}>
                        To get started, fill out your details below.
                    </Text>
                    { shiftNotFoundError &&
                        <View style={styles.notFound}>
                            <Error errorText="No shift is available for this user"/>
                        </View>
                    }
                    <TextInput style={styles.textInput}
                        ref={carRegoRef}
                        label="Car Rego"
                        mode="outlined"
                        value={carRego}
                        onChange={(e) => onChange(e, 'carRego')}
                        error={carRegoError.length > 0}
                        disabled={isFormSubmitting ? true : false}
                    />
                    <Error errorText={carRegoError}/>
                    <TextInput style={styles.textInput}
                        ref={odometerRef}
                        label="Odometer"
                        mode="outlined"
                        value={odometer}
                        onChange={(e) => onChange(e, 'odometer')}
                        error={odometerError.length > 0}
                        disabled={isFormSubmitting ? true : false}
                    />
                    <Error errorText={odometerError}/>
                    <Button onPress={onSubmit} 
                        mode="contained" 
                        style={CssHelper['button']} 
                        labelStyle={CssHelper['buttonLabel']} 
                        uppercase={false}
                        loading={isFormSubmitting ? true : false}
                        disabled={isFormSubmitting ? true : false}
                    >
                        Start Shift
                    </Button>
                    <View style={styles.linkContainer}>
                        <View style={styles.arContaniner}>
                            <TouchableOpacity onPress={logout}>
                                <Text style={CssHelper['link']}>Logout</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={goAlarmResponse}>
                                <Text style={CssHelper['link']}>Alarm Response</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}
        </FrontendContainer>
    )
}))

const styles = StyleSheet.create({
    textInput: {
        marginTop: 15
    },
    linkContainer: {
        marginTop: 25
    },
    notFound: {
        paddingTop: 5
    },
    arContaniner: {
        marginTop: 25,
        flex: 1,
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-between'
    }
})

export default WelcomeContainer