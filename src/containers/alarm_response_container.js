import React, { useReducer, useRef, useEffect, useMemo } from 'react'
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Keyboard, Platform, KeyboardAvoidingView } from 'react-native'
import { observer, inject } from 'mobx-react'
import { TextInput, Button } from 'react-native-paper'
import  DropDown  from  'react-native-paper-dropdown'
import _ from 'underscore'
import moment from 'moment'
import storage from '@react-native-firebase/storage'
import { PERMISSIONS } from 'react-native-permissions'
import { ALARM_RESPONSE_MODES, APP_MAIN_COLOR, SCREEN_MODES,  } from '../constants/app'
import CssHelper from '../helpers/css_helper'
import MiscHelper from '../helpers/misc_helper'
import BackendContainer from '../containers/misc/backend_container'
import AlarmClientsDb, { AlarmClient } from '../firebase/alarm_clients'
import AlarmResponsesDb, { AlarmResponse } from '../firebase/alarm_responses'
import LogsDb from '../firebase/logs'
import Call, { CALL_MODES } from '../components/call'
import AttachFiles from '../components/attach_files'
import ConfirmModal from '../components/confirm_modal'
import Camera from '../components/camera/camera'
import Autocomplete from '../components/autocomplete'
import Error from '../components/error'

const AlarmResponseContainer = inject('mobxStore')(observer(({ mobxStore, route, navigation }) => {
    const [state, setState] = useReducer(
        (state, newState) => ({...state, ...newState}),
        {
            mode: SCREEN_MODES.DEFAULT,
            alarmClients: [],
            alarmClientsData: [],
            selectedClient: null,
            isLoading: true,
            displayDropDown: false,
            docketNo: '',
            monitoringStation: '',
            address: '',
            sectionActivation: '',
            orderNumber: '',
            invoiceTo: '',
            timeOffsite: '',
            comments: '',
            monitoringStationError: '',
            addressError: '',
            sectionActivationError: '',
            orderNumberError: '',
            invoiceToError: '',
            timeOffsiteError: '',
            coords: null,
            scrollY: 0,
            attachedFiles: [],
            isCancelModalVisible: false,
            isConfirmModalVisible: false,
            isFormSubmitting: false
        }
    )

    const { 
        mode, alarmClients, alarmClientsData, selectedClient, isLoading, displayDropDown, docketNo, monitoringStation, address, sectionActivation, orderNumber, invoiceTo, timeOffsite, comments, 
        monitoringStationError, addressError, sectionActivationError, orderNumberError, invoiceToError, timeOffsiteError,
        scrollY, coords, attachedFiles, isCancelModalVisible, isConfirmModalVisible, isFormSubmitting
    } = state

    const callRef = useRef(null)

    const addressRef = useRef(null)
    const sectionActivationRef = useRef(null)
    const orderNumberRef = useRef(null)
    const invoiceToRef = useRef(null)
    const timeOffsiteRef = useRef(null)

    const { patrol_shift_id, alarmResponseMode } = route.params
    const user = mobxStore.user

    let timer = null

    useEffect(() => {
        async function fetchData() {
            try {
                const alarmClient = await AlarmClientsDb.getAlarmClients(user.getCompanyId())
                let clientsList = [], clientsData = []
                if (alarmClient instanceof AlarmClient) {
                    clientsData = alarmClient.getClients()
                    clientsData.forEach(client => {
                        const data = {
                            label: client.name,
                            value: client.name
                        }
                        clientsList.push(data)
                    })
                }
    
                let docketNumber = null
                const lastAlarmResponse = await AlarmResponsesDb.getLastDoc()
                if (lastAlarmResponse instanceof AlarmResponse) {
                    const docket_no = lastAlarmResponse.getDocketNo()
                    let a = parseInt(docket_no)
                    a = a + 1
                    docketNumber = a.toString().padStart(7, '0')
                } else {
                    docketNumber = '1'.padStart(7, '0')
                }
    
                setState({
                    alarmClients: clientsList,
                    alarmClientsData: clientsData,
                    docketNo: docketNumber, 
                    isLoading: false
                })    
            } catch (error) {
                LogsDb.saveLog(error)
            }
        }

        fetchData()

        return () => {
            clearTimeout(timer)
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

    const setMonitoringStation = (monitoringStation) => {
        const selected = _.find(alarmClientsData, {name: monitoringStation})

        setState({
            monitoringStation,
            selectedClient: selected
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
            navigation.navigate('ShiftDashboard')
        }, 200)
    }

    const onSubmit = () => {
        setState({
            monitoringStationError: '',
            addressError: '',
            sectionActivationError: '',
            orderNumberError: '',
            invoiceToError: '',
            timeOffsiteError: ''
        })
        if (monitoringStation === '') {
            setState({
                monitoringStationError: 'Monitoring Station is required'
            })
        } else if (address === '') {
            setState({
                addressError: 'Address is required'
            })
            addressRef.current.focus()
        } else if (sectionActivation === '') {
            setState({
                sectionActivationError: 'Section Activation is required'
            })
            sectionActivationRef.current.focus()
        } else if (orderNumber === '') {
            setState({
                orderNumberError: 'Order No. is required'
            })
            orderNumberRef.current.focus()
        } else if (invoiceTo === '') {
            setState({
                invoiceToError: 'Invoice To is required'
            })
            invoiceToRef.current.focus()
        } else if (timeOffsite === '') {
            setState({
                timeOffsiteError: 'Time Off-Site is required'
            })
            timeOffsiteRef.current.focus()
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
            const calledPhones = callRef.current.getCalledPhones()

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
                patrol_shift_id: alarmResponseMode === ALARM_RESPONSE_MODES.WELCOME_PAGE ? null : patrol_shift_id,
                company_id: user.getCompanyId(),
                docket_no: docketNo,
                monitoring_station: monitoringStation,
                address,
                section_activation: sectionActivation,
                job_no: orderNumber,
                invoice_to: invoiceTo,
                comments,           
                click_to_call: calledPhones,
                time_onsite: timeArrival,
                time_offsite: timeOffsite,
                location: null,
                attachments: attachedFiles,
                created_time: new Date()
            }
    
            const alarmResponse = new AlarmResponse(data)
    
            if (coords) {
                const { latitude, longitude } = coords
                alarmResponse.setLocation({
                    latitude,
                    longitude
                })
            }
    
            const docId = await AlarmResponsesDb.save(alarmResponse)
    
            navigation.navigate('AlarmResponseTY', {
                docId,
                alarmResponseMode
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

    const onScroll = (event) => {
        const { y } = event.nativeEvent.contentOffset
        setState({
            scrollY: y
        })
    }

    const timeArrival = useMemo(() => {
        return moment().format('H:mm')
    }, [])

    return (
        <BackendContainer navigation={navigation} 
            title="Alarm Response" 
            secondText={`Docket No. ${docketNo}`}
            displayCancel={true}
            cancelHandler={cancel}
            noContentPadding={mode === SCREEN_MODES.CAMERA ? true : false}
        >
            { isLoading ? (
                <View style={CssHelper['flexSingleCentered']}>
                    <ActivityIndicator size="large" color={APP_MAIN_COLOR}/>
                </View>
            ) : (
                <KeyboardAvoidingView style={CssHelper['flex']} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                    <Camera submit={submitCamera} 
                        attachedPictures={attachedFiles}
                        hide={mode === SCREEN_MODES.DEFAULT ? true : false}
                    />
                    <ScrollView style={[styles.content, mode === SCREEN_MODES.CAMERA && (CssHelper['hidden'])]} 
                        contentContainerStyle={styles.contentContainer} 
                        keyboardShouldPersistTaps="always" 
                        showsVerticalScrollIndicator={false}
                        onScroll={onScroll}
                    >
                        <View style={CssHelper['f']}>
                            <View style={CssHelper['fInner']}>
                                <Text style={styles.timeArrivalText}>
                                    Time Arrival
                                </Text>
                                <Text style={styles.timeArrival}>
                                    {timeArrival}
                                </Text>
                            </View>
                            <View>
                                <Call ref={callRef}
                                    mode={CALL_MODES.ALARM_RESPONSE} 
                                    companyId={user.getCompanyId()}
                                    alarmClient={selectedClient}
                                    disabled={isFormSubmitting ? true : false}
                                />
                            </View>
                        </View>
                        <View style={styles.textInput}>
                            <DropDown label="Monitoring Station"
                                mode="outlined"
                                value={monitoringStation}
                                setValue={setMonitoringStation}
                                list={alarmClients}
                                visible={displayDropDown}
                                showDropDown={() => setState({displayDropDown: true})}
                                onDismiss={() => setState({displayDropDown: false})}
                                inputProps={{
                                    right:  <TextInput.Icon  name={'menu-down'}/>,
                                    error: monitoringStationError.length > 0,
                                    disabled: isFormSubmitting ? true : false,
                                    style: { marginTop: -6, paddingTop: 0 }
                                }}
                            />
                        </View>
                        <Error errorText={monitoringStationError}/>
                        <Autocomplete style={styles.textInput}
                            ref={addressRef}
                            label="Address"
                            mode="outlined"
                            name="address"
                            value={address}
                            onChange={(e) => onChange(e, 'address')}
                            error={addressError.length > 0}
                            disabled={isFormSubmitting ? true : false}
                            scrollY={scrollY}
                        />
                        <Error errorText={addressError}/>
                        <TextInput style={styles.textInput}
                            ref={sectionActivationRef}
                            label="Section Activation"
                            mode="outlined"
                            value={sectionActivation}
                            onChange={(e) => onChange(e, 'sectionActivation')}
                            error={sectionActivationError.length > 0}
                            disabled={isFormSubmitting ? true : false}
                        />
                        <Error errorText={sectionActivationError}/>
                        <TextInput style={styles.textInput}
                            ref={orderNumberRef}
                            label="Order No. / Job No."
                            mode="outlined"
                            value={orderNumber}
                            onChange={(e) => onChange(e, 'orderNumber')}
                            error={orderNumberError.length > 0}
                            disabled={isFormSubmitting ? true : false}
                        />
                        <Error errorText={orderNumberError}/>
                        <TextInput style={styles.textInput}
                            ref={invoiceToRef}
                            label="Invoice To"
                            mode="outlined"
                            value={invoiceTo}
                            onChange={(e) => onChange(e, 'invoiceTo')}
                            error={invoiceToError.length > 0}
                            disabled={isFormSubmitting ? true : false}
                        />
                        <Error errorText={invoiceToError}/>
                        <TextInput style={styles.textInput}
                            ref={timeOffsiteRef}
                            label="Time Off-Site"
                            mode="outlined"
                            value={timeOffsite}
                            onChange={(e) => onChange(e, 'timeOffsite')}
                            error={timeOffsiteError.length > 0}
                            disabled={isFormSubmitting ? true : false}
                        />
                        <Error errorText={timeOffsiteError}/>
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
                            Submit Alarm Response
                        </Button>
                    </ScrollView>
                    <ConfirmModal isVisible={isCancelModalVisible}
                        title="Cancel?"
                        text="Would you like to cancel your alarm response?"
                        confirmHandle={confirmCancelModal}
                        closeModal={closeCancelModal}
                    />
                    <ConfirmModal isVisible={isConfirmModalVisible}
                        title="Confirm"
                        text="Are you ready to submit your patrol check?"
                        confirmHandle={confirmedModal}
                        closeModal={closeConfirmModal}
                    />
                </KeyboardAvoidingView>
            )}
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
    textInput: {
        marginTop: 20,
        flex: 1
    },
    textArea: {
        marginVertical: 20,
        flex: 1
    },
    autocompleteContainer: {
        flex: 1,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1        
    },
    timeArrival: {
        fontSize: 40,
        lineHeight: 40,
        height: 36,
        paddingBottom: 0,
        color: APP_MAIN_COLOR,
        fontWeight: 'bold',
        paddingRight: 15
    },
    timeArrivalText: {
        color: APP_MAIN_COLOR,
        fontSize: 12,
        paddingBottom: 10
    }
})

export default AlarmResponseContainer