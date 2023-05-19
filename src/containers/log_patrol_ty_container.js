import React, { useReducer, useEffect } from 'react'
import { StyleSheet, Text, ScrollView, View, ActivityIndicator } from 'react-native'
import { APP_MAIN_COLOR } from '../constants/app'
import { Button } from 'react-native-paper'
import CssHelper from '../helpers/css_helper'
import MiscHelper from '../helpers/misc_helper'
import PatrolLogsDb, { PatrolLog } from '../firebase/patrol_logs'
import LogsDb from '../firebase/logs'
import BackendContainer from '../containers/misc/backend_container'
import AttachedFiles from '../components/attached_files'
import Row from '../components/row'
import CheckCircleIcon from '../components/icons/check_circle_icon'

function LogPatrolTYContainer({ navigation, route }) {
    const [state, setState] = useReducer(
        (state, newState) => ({...state, ...newState}),
        {
            patrolLog: null,
            isLoading: true
        }
    )

    const { patrolLog, isLoading } = state

    useEffect(() => {
        async function fetchData() {
            try {
                const { docId } = route.params
                const pL = await PatrolLogsDb.get(docId)
    
                if (pL instanceof PatrolLog) {
                    setState({
                        patrolLog: pL,
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
        navigation.navigate('ShiftDashboard')
    }

    return (
        <BackendContainer navigation={navigation} 
            title="Log Patrol Check" 
            secondText={patrolLog ? patrolLog.getClientName() : ''} 
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
                    <Text style={styles.header}>Thank You! Your patrol check was submitted successfully.</Text>
                    <Row title="Time Onsite" value={MiscHelper.dateFormat(patrolLog.getStartDateTime())}/>
                    <Row title="Time Offsite" value={MiscHelper.dateFormat(patrolLog.getEndStartTime())}/>
                    <Row title="Duration" value={patrolLog.getDuration()} lastRow={true}/>
                    <Text style={styles.commentsTitle}>
                        Comments
                    </Text>
                    <Text style={styles.comments}>
                        {patrolLog.getComments()}
                    </Text>
                    <AttachedFiles attachedFiles={patrolLog.getAttachments()}/>
                    <Button mode="contained" 
                        style={[CssHelper['button']]} 
                        labelStyle={[CssHelper['buttonLabel']]} 
                        uppercase={false}
                        onPress={() => navigation.navigate('ShiftDashboard')}
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

export default LogPatrolTYContainer