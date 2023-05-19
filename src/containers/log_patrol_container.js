import React, { useReducer, useRef, useEffect } from 'react'
import { StyleSheet, ScrollView, View, Keyboard, Platform } from 'react-native'
import { TextInput, Button } from 'react-native-paper'
import { observer, inject } from 'mobx-react'
import _ from 'underscore'
import storage from '@react-native-firebase/storage'
import { PERMISSIONS } from 'react-native-permissions'
import { SCREEN_MODES } from '../constants/app'
import CssHelper from '../helpers/css_helper'
import MiscHelper from '../helpers/misc_helper'
import PatrolLogsDb, { PatrolLog } from '../firebase/patrol_logs'
import PatrolShiftsDb, { PatrolShift } from '../firebase/patrol_shifts'
import LogsDb from '../firebase/logs'
import BackendContainer from '../containers/misc/backend_container'
import Timer from '../components/timer'
import Call, { CALL_MODES } from '../components/call'
import AttachFiles from '../components/attach_files'
import ConfirmModal from '../components/confirm_modal'
import Camera from '../components/camera/camera'

const LogPatrolContainer = inject('mobxStore')(observer(({ mobxStore, route, navigation }) => {
    const [state, setState] = useReducer(
        (state, newState) => ({...state, ...newState}),
        {
            mode: SCREEN_MODES.DEFAULT,
            coords: null,
            comments: '',
            attachedFiles: [],
            isCancelModalVisible: false,
            isConfirmModalVisible: false,
            isFormSubmitting: false
        }
    )

    const { mode, coords, comments, attachedFiles, isCancelModalVisible, isConfirmModalVisible, isFormSubmitting } = state

    const commentsRef = useRef(null)
    const timerRef = useRef(null)
    const callRef = useRef(null)

    let timer = null
    
    const { user, startShift } = mobxStore
    const { client, client_shift_id } = route.params

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

        return () => {
            clearTimeout(timer)
        }
    }, [])

    const switchMode = (mode) => {
        Keyboard.dismiss()
        setState({
            mode
        })
    }

    const onChange = (e) => {
        const { text } = e.nativeEvent
        setState({
            comments: text
        })
    }

    const cancel = () => {
        if (mode === SCREEN_MODES.CAMERA) {
            setState({
                mode: SCREEN_MODES.DEFAULT
            })
        } else {
            setState({
                isCancelModalVisible: true
            })    
        }
    }

    const closeCancelModal = () => {
        setState({
            isCancelModalVisible: false
        })
    }

    const confirmCancelModal = () => {
        setState({
            isCancelModalVisible: false
        })
        timer = setTimeout(() => {
            navigation.navigate('Client')
        }, 200)
    }

    const onSubmit = () => {
        setState({
            isConfirmModalVisible: true
        })
    }

    const closeConfirmModal = () => {
        setState({
            isConfirmModalVisible: false
        })
    }

    const confirmedModal = async () => {
        setState({
            isConfirmModalVisible: false,
            isFormSubmitting: true
        })

        try {
            timerRef.current.stopWatcher()

            const calledPhones = callRef.current.getCalledPhones()
            const timer = timerRef.current.getTimer()
            const { startTime, stopTime, duration, timerActivity } = timer
    
            const arr = Array.from({ length: attachedFiles.length }, (value, index) => index)
            await Promise.all(arr.map(async index => {
                const file = attachedFiles[index]
                file.isUploading = true
    
                setState({
                    attachedFiles
                })
    
                const reference = storage().ref(file.name)
                const task = reference.putFile(file.uri)
    
                const url = await new Promise((resolve, reject) => {
                    task.on('state_changed', taskSnapshot => {
                        const percentage = (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes)
                        file.uploadingProgress = percentage
                        file.size = taskSnapshot.totalBytes
        
                        setState({
                            attachedFiles
                        })
                    }, error => reject(error),
                    async () => {
                        const downloadUrl = await task.snapshot.ref.getDownloadURL()
                        resolve(downloadUrl)
                    })
                })
    
                file.downloadUrl = url
                
                setState({
                    attachedFiles
                })
            }))
    
            const data = {
                patrol_shift_id: startShift.getPatrolShiftId(),
                client_id: client.getClientId(),
                client_name: client.getName(),
                company_id: user.getCompanyId(),
                comments,
                start_date_time: startTime,
                end_start_time: stopTime,
                duration,
                click_to_call: calledPhones,
                timer_activity: timerActivity,
                attachments: attachedFiles,
                created_time: new Date()
            }
    
            const patrolLog = new PatrolLog(data)
    
            if (coords) {
                const { latitude, longitude } = coords
                patrolLog.setLocation({
                    latitude, 
                    longitude
                })
            }
    
            const docId = await PatrolLogsDb.save(patrolLog)
    
            const patrolShift = await PatrolShiftsDb.getPatrolShift(startShift.getPatrolShiftId())
            if (patrolShift instanceof PatrolShift) {
                const clients = _.map(patrolShift.getPatrolShiftClients(), (obj) => {
                    if (obj.id === client_shift_id) {
                        obj.total_checks ++
                        const durationData = {
                            patrol_log_id: docId,
                            duration
                        }
                        if (_.isArray(obj.durations))
                            obj.durations.push(durationData)
                        else
                            obj.durations = [durationData]
                    }
                    return obj
                })
                patrolShift.setPatrolShiftClients(clients)
            }
    
            await PatrolShiftsDb.update(patrolShift)
    
            navigation.navigate('LogPatrolTY', {
                docId
            })
        } catch (error) {
            LogsDb.saveLog(error)
        }
    }

    const submitCamera = (attachedFiles) => {
        setState({
            attachedFiles,
            mode: SCREEN_MODES.DEFAULT
        })
    }

    const removeFile = (n) => {
        const newFiles = _.reject(attachedFiles, {id: n})
        setState({
            attachedFiles: newFiles
        })
    }

    return (
        <BackendContainer navigation={navigation} 
            title="Log Patrol Check" 
            secondText={client.getAddressLine()} 
            displayCancel={true}
            cancelHandler={cancel}
            noContentPadding={mode === SCREEN_MODES.CAMERA ? true : false}
        >
            <Camera submit={submitCamera} 
                attachedPictures={attachedFiles}
                hide={mode === SCREEN_MODES.DEFAULT ? true : false}
            />
            <ScrollView style={[styles.content, mode === SCREEN_MODES.CAMERA && (CssHelper['hidden'])]} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={CssHelper['f']}>
                    <View style={CssHelper['fInner']}>
                        <Timer ref={timerRef}
                            disabled={isFormSubmitting ? true : false}
                        />
                    </View>
                    <View>
                        <Call ref={callRef}
                            mode={CALL_MODES.LOG_PATROL_CHECK}
                            companyId={user.getCompanyId()}
                            client={client}
                            height={480}
                            disabled={isFormSubmitting ? true : false}
                        />
                    </View>
                </View>
                <TextInput style={styles.textArea}
                    multiline={true}
                    numberOfLines={6}
                    ref={commentsRef}
                    label="Comments"
                    mode="outlined"
                    value={comments}
                    onChange={onChange}
                    disabled={isFormSubmitting ? true : false}
                />
                <View style={styles.attached}>
                    <AttachFiles switchCamera={() => switchMode(SCREEN_MODES.CAMERA)} 
                        attachedFiles={attachedFiles}
                        onDelete={removeFile}
                        disabled={isFormSubmitting ? true : false}
                    />
                </View>
                <Button mode="contained" 
                    style={[CssHelper['button']]} 
                    labelStyle={[CssHelper['buttonLabel']]} 
                    uppercase={false}
                    onPress={onSubmit}
                    loading={isFormSubmitting ? true : false}
                    disabled={isFormSubmitting ? true : false}
                >
                    Submit Patrol Check
                </Button>
            </ScrollView>
            <ConfirmModal isVisible={isCancelModalVisible}
                title="Cancel?"
                text="Would you like to cancel your patrol check?"
                confirmHandle={confirmCancelModal}
                closeModal={closeCancelModal}
            />
            <ConfirmModal isVisible={isConfirmModalVisible}
                title="Confirm"
                text="Are you ready to submit your patrol check?"
                confirmHandle={confirmedModal}
                closeModal={closeConfirmModal}
            />
        </BackendContainer>
    )
}))

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingVertical: 20
    },
    contentContainer: {
        paddingBottom: 40
    },
    textArea: {
        marginTop: 20
    },
    attached: {
        marginTop: 20
    }
})

export default LogPatrolContainer