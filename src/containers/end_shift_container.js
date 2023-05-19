import React, { useReducer, useRef, useEffect, useMemo } from 'react'
import { StyleSheet, ScrollView, Keyboard, Platform } from 'react-native'
import { TextInput, Button } from 'react-native-paper'
import { observer, inject } from 'mobx-react'
import _ from 'underscore'
import storage from '@react-native-firebase/storage'
import { PERMISSIONS } from 'react-native-permissions'
import { SCREEN_MODES } from '../constants/app'
import CssHelper from '../helpers/css_helper'
import MiscHelper from '../helpers/misc_helper'
import EndShiftsDb, { EndShift } from '../firebase/end_shifts'
import LogsDb from '../firebase/logs'
import BackendContainer from '../containers/misc/backend_container'
import AttachFiles from '../components/attach_files'
import ConfirmModal from '../components/confirm_modal'
import Camera from '../components/camera/camera'
import Error from '../components/error'

const EndShiftContainer = inject('mobxStore')(observer(({ mobxStore, navigation }) => {
    const [state, setState] = useReducer(
        (state, newState) => ({...state, ...newState}),
        {
            mode: SCREEN_MODES.DEFAULT,
            odometer: '',
            comments: '',
            odometerError: '',
            attachedFiles: [],
            coords: null,
            isCancelModalVisible: false,
            isConfirmModalVisible: false,
            isFormSubmitting: false
        }
    )

    const { mode, odometer, comments, odometerError, attachedFiles, coords, isCancelModalVisible, isConfirmModalVisible, isFormSubmitting } = state
    const odometerRef = useRef(null)

    const { user, startShift } = mobxStore

    let timer = null

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

    const onChange = (e, name) => {
        const { text } = e.nativeEvent
        const obj = {}
        obj[name] = text
        setState(obj)
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
            navigation.navigate('ShiftDashboard')
        })
    }

    const onSubmit = () => {
        setState({
            odometerError: ''
        })
        if (odometer === '') {
            setState({
                odometerError: 'Odometer is required'
            })
            odometerRef.current.focus()
        } else {
            setState({
                isConfirmModalVisible: true
            })
        }
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
                user_id: user.getUserId(),
                odometer,
                comments,
                company_id: user.getCompanyId(),
                end_date: new Date(),
                location: null,
                attachments: attachedFiles
            }
    
            const endShift = new EndShift(data)
    
            if (coords) {
                const { latitude, longitude } = coords
                endShift.setLocation({
                    latitude,
                    longitude
                })
            }
    
            const docId = await EndShiftsDb.save(endShift)
    
            navigation.navigate('EndShiftTY', {
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

    const date = useMemo(() => MiscHelper.jsDateFormat(new Date()), [])

    return (
        <BackendContainer navigation={navigation} 
            title="End Shift" 
            secondText={date} 
            displayCancel={true}
            cancelHandler={cancel}
            noContentPadding={mode === SCREEN_MODES.CAMERA ? true : false}
        >
            <Camera submit={submitCamera} 
                attachedPictures={attachedFiles}
                hide={mode === SCREEN_MODES.DEFAULT ? true : false}
            />
            <ScrollView style={[styles.content, mode === SCREEN_MODES.CAMERA && (CssHelper['hidden'])]} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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
                <TextInput style={styles.textArea}
                    multiline={true}
                    numberOfLines={6}
                    label="Comments"
                    mode="outlined"
                    value={comments}
                    onChange={(e) => onChange(e, 'comments')}
                    disabled={isFormSubmitting ? true : false}
                />
                <AttachFiles switchCamera={() => switchMode(SCREEN_MODES.CAMERA)} 
                    attachedFiles={attachedFiles}
                    onDelete={removeFile}
                    disabled={isFormSubmitting ? true : false}
                />
                <Button mode="contained" 
                    style={[CssHelper['button']]} 
                    labelStyle={[CssHelper['buttonLabel']]} 
                    uppercase={false}
                    onPress={onSubmit}
                    loading={isFormSubmitting ? true : false}
                    disabled={isFormSubmitting ? true : false}
                >
                    Confirm End Shift
                </Button>
            </ScrollView>
            <ConfirmModal isVisible={isCancelModalVisible}
                title="Cancel?"
                text="Would you like to cancel your shift?"
                confirmHandle={confirmCancelModal}
                closeModal={closeCancelModal}
            />
            <ConfirmModal isVisible={isConfirmModalVisible}
                title="Confirm"
                text="Are you ready to submit your shift?"
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
        marginVertical: 20,
    }
})

export default EndShiftContainer