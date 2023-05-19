import React, { useReducer, useEffect, useMemo } from 'react'
import { StyleSheet, Text, ScrollView, View, ActivityIndicator } from 'react-native'
import { APP_MAIN_COLOR } from '../constants/app'
import { Button } from 'react-native-paper'
import { ALARM_RESPONSE_MODES } from '../constants/app'
import CssHelper from '../helpers/css_helper'
import MiscHelper from '../helpers/misc_helper'
import AlarmResponsesDb, { AlarmResponse } from '../firebase/alarm_responses'
import LogsDb from '../firebase/logs'
import BackendContainer from '../containers/misc/backend_container'
import AttachedFiles from '../components/attached_files'
import Row from '../components/row'
import CheckCircleIcon from '../components/icons/check_circle_icon'

function AlarmResponseTYContainer({ navigation, route }) {
    const [state, setState] = useReducer(
        (state, newState) => ({...state, ...newState}),
        {
            alarmResponse: null,
            isLoading: true
        }
    )

    const { alarmResponse, isLoading } = state
    
    useEffect(() => {
        async function fetchData() {
            try {
                const { docId } = route.params
                const aR = await AlarmResponsesDb.get(docId)
    
                if (aR instanceof AlarmResponse) {
                    setState({
                        alarmResponse: aR,
                        isLoading: false
                    })
                }    
            } catch (error) {
                LogsDb.saveLog(error)
            }
        }

        fetchData()
    }, [])

    const back = () => {
        const { alarmResponseMode } = route.params
        if (alarmResponseMode === ALARM_RESPONSE_MODES.WELCOME_PAGE) {
            navigation.navigate('Welcome')
        } else {
            navigation.navigate('ShiftDashboard')
        }
    }

    const date = useMemo(() => MiscHelper.jsDateFormat(new Date()), [])

    return (
        <BackendContainer navigation={navigation} 
            title="Alarm Response" 
            secondText={date}
            displayBack={true}
            backHandler={back}
        >
            { isLoading ? (
                <View style={CssHelper['flexSingleCentered']}>
                    <ActivityIndicator size="large" color={APP_MAIN_COLOR}/>
                </View>
            ) : (
                <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    <View style={CssHelper['checkCircle']}>
                        <CheckCircleIcon width={44} height={44} color={APP_MAIN_COLOR}/>
                    </View>
                    <Text style={styles.header}>Thank You! Your alarm response was submitted successfully.</Text>
                    <Row title="Monitoring Station" value={alarmResponse.getMonitoringStation()}/>
                    <Row title="Address" value={alarmResponse.getAddress()}/>
                    <Row title="Section Activation" value={alarmResponse.getSectionActivation()}/>
                    <Row title="Time Onsite" value={alarmResponse.getTimeOnsite()}/>
                    <Row title="Time Offsite" value={alarmResponse.getTimeOffsite()}/>
                    <Row title="Order No. / Job No." value={alarmResponse.getJobNo()}/>
                    <Row title="Invoice To" value={alarmResponse.getInvoiceTo()} lastRow={true}/>
                    <Text style={styles.commentsTitle}>
                        Comments
                    </Text>
                    <Text style={styles.comments}>
                        {alarmResponse.getComments()}
                    </Text>
                    <AttachedFiles attachedFiles={alarmResponse.getAttachments()}/>
                    <Button mode="contained" 
                        style={[CssHelper['button']]} 
                        labelStyle={[CssHelper['buttonLabel']]} 
                        uppercase={false}
                        onPress={back}
                    >
                        Back to Shift Dashboard
                    </Button>
                </ScrollView>
            )}
        </BackendContainer>
    )
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingVertical: 20
    },
    contentContainer: {
        paddingBottom: 40
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        color: APP_MAIN_COLOR,
        marginBottom: 20
    },
    commentsTitle: {
        marginTop: 20,
        marginBottom: 15,
        fontWeight: 'bold',
        color: APP_MAIN_COLOR
    },
    comments: {
        color: APP_MAIN_COLOR
    }
})

export default AlarmResponseTYContainer