import React, { useReducer, useEffect, useRef, useImperativeHandle } from 'react'
import { StyleSheet, View, Text, Platform } from 'react-native'
import PropTypes from 'prop-types'
import Geolocation from 'react-native-geolocation-service'
import firestore from '@react-native-firebase/firestore'
import { PERMISSIONS } from 'react-native-permissions'
import { Button } from 'react-native-paper'
import { APP_MAIN_COLOR } from '../constants/app'
import CssHelper from '../helpers/css_helper'
import MiscHelper from '../helpers/misc_helper'

const formatTimeString = (time) => {
    let msecs = time % 1000
  
    if (msecs < 10) {
        msecs = `00${msecs}`
    } else if (msecs < 100) {
        msecs = `0${msecs}`
    }
  
    let seconds = Math.floor(time / 1000)
    let minutes = Math.floor(time / 60000)
    let hours = Math.floor(time / 3600000)
    seconds = seconds - minutes * 60
    minutes = minutes - hours * 60

    let formatted = `${minutes < 10 ? 0 : ""}${minutes}:${seconds < 10 ? 0 : ""}${seconds}`
  
    return formatted
}

const Timer = React.forwardRef((props, ref) => {
    const { start, startTime, laps, disabled } = props

    const [state, setState] = useReducer(
        (state, newState) => ({...state, ...newState}),
        {
            startTime: null,
            stopTime: null,
            pausedTime: null,
            started: false,
            elapsed: startTime || 0,
            granted: false,
            timerActivity: []
        }
    )

    const { stopTime, pausedTime, started, elapsed, granted, timerActivity } = state
    const interval = useRef(null)

    useEffect(() => {
        if (start) {
            startWatcher()
        }

        return () => {
            clearInterval(interval.current)
        }
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

                setState({
                    granted
                })
            } catch(e) {
                console.log(e)
            }
        }

        requestLocationPermission()
    }, [])

    useEffect(() => {
        if (start) {
            startWatcher()
        } else {
            stopWatcher()
        }
    }, [start])

    useEffect(() => {
        if (started) {
            interval.current = interval.current ? interval.current : setInterval(() => {
                setState({
                    elapsed: new Date() - state.startTime
                })
            }, 1000)    
        }
    }, [started])

    useImperativeHandle(ref, () => ({ 
        getTimer: () => {
            const duration = formatTimeString(elapsed)
            const timer = {
                startTime: new Date(state.startTime),
                stopTime: new Date(),
                duration,
                timerActivity
            }
            return timer
        },
        stopWatcher
    }))

    const startWatcher = () => {
        if (laps && elapsed) {
            let lap = new Date() - stopTime
            setState({
                stopTime: null,
                pausedTime: pausedTime + lap
            })
        }

        if (timerActivity.length > 0) {
            timerActivity[timerActivity.length - 1]['unpause_date_time'] = new Date()
        }

        setState({
            startTime: elapsed ? new Date() - elapsed : new Date(),
            started: true,
            timerActivity
        })
    }

    const stopWatcher = () => {
        if (interval.current) {
            if (laps) {
                setState({
                    stopTime: new Date()
                })
            }

            clearInterval(interval.current)
            interval.current = null
        }

        if (granted) {
            Geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    const timerData = {
                        paused_date_time: new Date(),
                        unpause_date_time: null,
                        location: new firestore.GeoPoint(latitude, longitude)
                    }
                    timerActivity.push(timerData)

                    setState({
                        timerActivity
                    })            
                },
                (error) => {
                    console.log(error.code, error.message)
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            )
        }

        setState({
            started: false
        })
    }

    const switchWatcher = () => {
        if (started) {
            stopWatcher()
        } else {
            startWatcher()
        }
    }

    const formatTime = () => {
        const now = elapsed
        return formatTimeString(now)
    }

    return (
        <>
            <Text style={styles.text}>Time Onsite</Text>
            <View style={styles.timer}>
                <Text style={styles.time}>{formatTime()}</Text>
                <View>
                    <Button mode="contained" 
                        style={[CssHelper['smallButton']]} 
                        labelStyle={[CssHelper['smallButtonLabel']]} 
                        uppercase={false}
                        onPress={switchWatcher}
                        disabled={disabled}
                    >
                        { started ? 'Pause' : 'Start' }
                    </Button>
                </View>
            </View>
        </>
    )
})

const styles = StyleSheet.create({
    timer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: 5
    },
    time: {
        fontSize: 36,
        lineHeight: 40,
        height: 36,
        paddingBottom: 0,
        color: APP_MAIN_COLOR,
        fontWeight: 'bold',
        paddingRight: 15
    },
    text: {
        color: APP_MAIN_COLOR,
        fontSize: 12
    }
})

Timer.propTypes = {
    start: PropTypes.bool,
    startTime: PropTypes.number,
    laps: PropTypes.bool,
    disabled: PropTypes.bool
}

Timer.defaultProps = {
    start: true,
    startTime: 0,
    laps: true,
    disabled: false
}

export default Timer