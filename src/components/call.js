import React, { useReducer, useEffect, useImperativeHandle } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import PropTypes from 'prop-types'
import Modal from 'react-native-modal'
import PhoneCall from 'react-native-phone-call'
import { APP_MAIN_COLOR } from '../constants/app'
import CssHelper from '../helpers/css_helper'
import AlarmPhonesDb from '../firebase/alarm_phones'
import { Client } from '../firebase/clients'
import PhoneIcon from '../components/icons/phone_icon'
import CloseIcon from '../components/icons/close_icon'

export const CALL_MODES = Object.freeze({
    ALARM_RESPONSE: 'alarmResponse',
    LOG_PATROL_CHECK: 'logPatrolCheck'
})

const Call = React.forwardRef((props, ref) => {
    const { mode, companyId, client, alarmClient, height, disabled } = props
    
    const [state, setState] = useReducer(
        (state, newState) => ({...state, ...newState}),
        {
            isVisible: false,
            isLoading: true,
            alarmPhones: null,
            calledPhones: [],
            granted: null
        }
    )

    const { isVisible, isLoading, alarmPhones, calledPhones, granted } = state

    useEffect(() => {
        async function fetchData() {
            const phones = await AlarmPhonesDb.getAlarmPhones(companyId)
            if (phones) {
                const phoneNumbers = phones.getPhoneNumbers()
                setState({
                    alarmPhones: phoneNumbers,
                    isLoading: false
                })
            }
        }

        fetchData()
    }, [])

    useImperativeHandle(ref, () => ({ 
        getCalledPhones: () => {
            return calledPhones
        }
    }))

    const showModal = () => {
        if (disabled)
            return null

        setState({
            isVisible: true
        })
    }

    const hideModal = () => {
        setState({
            isVisible: false
        })
    }

    const callNumber = (data) => {
        const { phone_number } = data

        const args = {
            number: phone_number,
            prompt: false
        }

        PhoneCall(args).catch(console.error)

        const callData = {
            ...data,
            date_time: new Date()
        }
        calledPhones.push(callData)
        setState({
            calledPhones
        })
    }

    const keyholders = client instanceof Client ? client.getKeyholders() : []

    return (
        <>
            <TouchableOpacity style={[styles.phoneContainer, {backgroundColor: disabled ? "#e0e0e0" : APP_MAIN_COLOR}]} onPress={showModal} activeOpacity={disabled ? 1 : 0.8}>
                <View style={CssHelper['flexSingleCentered']}>
                    <PhoneIcon width={32} height={32} color={"#fff"}/>
                </View>
            </TouchableOpacity>
            <Modal isVisible={isVisible} useNativeDriver={true}>
                <View style={[CssHelper['dialogueContainer'], styles.container, {height}]}>
                    <View style={CssHelper['dialogueHeader']}>
                        <View style={CssHelper['dialogueInnerHeader']}>
                            <Text style={CssHelper['dialogueTitle']}>{"Click to call..."}</Text>
                            <TouchableOpacity onPress={hideModal} style={CssHelper['closeIcon']}>
                                <CloseIcon width={24} height={24} color={APP_MAIN_COLOR}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={[CssHelper['dialogueContent'], styles.content]}>
                        { isLoading ? (
                            <View style={CssHelper['flexSingleCentered']}>
                                <ActivityIndicator color={APP_MAIN_COLOR} size="small"/>
                            </View>
                        ) : (
                            <ScrollView style={CssHelper['flex']} showsVerticalScrollIndicator={false}>
                                { mode === CALL_MODES.LOG_PATROL_CHECK && client &&
                                    <>
                                        <Text style={[styles.titleK, styles.titleP]}>Primary Contact</Text>
                                        <View style={styles.keyholder}>
                                            <TouchableOpacity style={styles.keyholderInner} onPress={() => callNumber({name: client.getFullName(), phone_number: client.getPhone()})}>
                                                <Text style={styles.keyholderName}>{client.getFirstName()} {client.getLastName()}</Text>
                                                <Text style={styles.keyholderPhone}>{client.getPhone()}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                }
                                { mode === CALL_MODES.LOG_PATROL_CHECK && client &&
                                    <>
                                        <Text style={styles.titleK}>Keyholders</Text>
                                        { keyholders.map((keyholder, index) => {
                                            const fullName = [keyholder.first_name, keyholder.last_name]
                                            return (
                                                <View key={index} style={styles.keyholder}>
                                                    <TouchableOpacity style={styles.keyholderInner} onPress={() => callNumber({name: fullName.join(" "), phone_number: keyholder.phone})}>
                                                        <Text style={styles.keyholderName}>{fullName.join(" ")}</Text>
                                                        <Text style={styles.keyholderPhone}>{keyholder.phone}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )
                                        }
                                        )}
                                    </>
                                }
                                { mode === CALL_MODES.LOG_PATROL_CHECK && client &&
                                    <View style={styles.divider}/>
                                }
                                { alarmPhones.map((phone, index) =>
                                    <TouchableOpacity key={index} style={styles.call} onPress={() => callNumber(phone)}>
                                        <View style={styles.callInner}>
                                            <PhoneIcon width={16} height={16} color={APP_MAIN_COLOR}/>
                                            <Text style={styles.callText}>{phone.name} ({phone.phone_number})</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                { mode === CALL_MODES.ALARM_RESPONSE && alarmClient &&
                                    <TouchableOpacity style={styles.call} onPress={() => callNumber(alarmClient)}>
                                        <View style={styles.callInner}>
                                            <PhoneIcon width={16} height={16} color={APP_MAIN_COLOR}/>
                                            <Text style={styles.callText}>{alarmClient.name} ({alarmClient.phone_number})</Text>
                                        </View>
                                    </TouchableOpacity>
                                }
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    )    
})

const styles = StyleSheet.create({
    container: {
        height: 380
    },
    phoneContainer: {
        backgroundColor: APP_MAIN_COLOR,
        width: 56,
        height: 56,
        borderRadius: 5
    },
    call: {
        borderBottomColor: '#f0f0f0',
        borderBottomWidth: 1,
        height: 50
    },
    callInner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    callText: {
        color: APP_MAIN_COLOR,
        marginLeft: 12,
        fontWeight: 'bold',
        fontSize: 16
    },
    titleK: {
        color: APP_MAIN_COLOR,
        fontWeight: 'bold',
        fontSize: 16,
        paddingVertical: 12,
        marginTop: 20,
        borderBottomColor: '#f0f0f0',
        borderBottomWidth: 1
    },
    titleP: {
        marginTop: 0
    },
    keyholder: {
        borderBottomColor: '#f0f0f0',
        borderBottomWidth: 1,
        height: 40
    },
    keyholderInner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    keyholderName: {
        fontSize: 12,
        color: APP_MAIN_COLOR
    },
    keyholderPhone: {
        fontSize: 12,
        color: APP_MAIN_COLOR,
        fontWeight: 'bold'
    },
    content: {
        flex: 1,
        paddingTop: 2
    },
    divider: {
        height: 20
    }
})

Call.propTypes = {
    mode: PropTypes.string,
    companyId: PropTypes.string,
    client: PropTypes.object,
    alarmClient: PropTypes.object,
    height: PropTypes.number,
    disabled: PropTypes.bool
}

Call.defaultProps = {
    mode: CALL_MODES.ALARM_RESPONSE,
    companyId: null,
    client: null,
    alarmClient: null,
    height: 380,
    disabled: false
}

export default Call