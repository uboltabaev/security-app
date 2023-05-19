import React, { useMemo, useEffect, useReducer } from 'react'
import { StyleSheet, Text, ScrollView, View, ActivityIndicator } from 'react-native'
import { observer, inject } from 'mobx-react'
import { APP_MAIN_COLOR } from '../constants/app'
import { Button } from 'react-native-paper'
import CssHelper from '../helpers/css_helper'
import MiscHelper from '../helpers/misc_helper'
import StartShiftsDb, { StartShift, STATUSES } from '../firebase/start_shifts'
import EndShiftsDb from '../firebase/end_shifts'
import EndShiftSummariesDb, { EndShiftSummary } from '../firebase/end_shift_summaries'
import LogsDb from '../firebase/logs'
import BackendContainer from '../containers/misc/backend_container'
import Row from '../components/row'
import CheckCircleIcon from '../components/icons/check_circle_icon'

const EndShiftTYContainer = inject('mobxStore')(observer(({ mobxStore, navigation, route }) => {
    const [state, setState] = useReducer(
        (state, newState) => ({...state, ...newState}),
        {
            isSaving: true,
            endShiftSummary: null
        }
    )    

    const { isSaving, endShiftSummary } = state

    const date = useMemo(() => MiscHelper.jsDateFormat(new Date()), [])

    const { user, startShift, patrolShift } = mobxStore

    useEffect(() => {
        async function saveSummaries() {
            try {
                const { docId } = route.params
                const endShift = await EndShiftsDb.get(docId)
    
                const totalDistance = parseInt(endShift.getOdometer()) - parseInt(startShift.getOdometer())
    
                const summaries = {
                    patrol_shift_id: startShift.getPatrolShiftId(),
                    user_id: user.getUserId(),
                    company_id: user.getCompanyId(),
                    start_shift_time: startShift.getStartDate(),
                    end_shift_time: new Date(),
                    number_of_clients: patrolShift.getClientsNumber(),
                    total_patrol_logs: patrolShift.getTotalChecksNumber(),
                    total_distance: totalDistance,
                    total_duration: patrolShift.getTotalDuration()
                }
    
                const newEndShiftSummary = new EndShiftSummary(summaries)
                await EndShiftSummariesDb.save(newEndShiftSummary)
    
                if (startShift instanceof StartShift) {
                    startShift.setStatus(STATUSES.COMPLETED)
                    await StartShiftsDb.updateStartShift(startShift.getStartShiftId(), startShift)
                }
    
                setState({
                    endShiftSummary: newEndShiftSummary,
                    isSaving: false
                })    
            } catch (error) {
                LogsDb.saveLog(error)
            }
        }

        saveSummaries()
    }, [])

    const back = () => {
        navigation.navigate('Welcome')
    }

    return (
        <BackendContainer navigation={navigation} 
            title={'End Shift'}
            secondText={date} 
            displayBack={true}
            backHandler={back}
        >
            { isSaving ? (
                <View style={CssHelper['flexSingleCentered']}>
                    <ActivityIndicator size="large" color={APP_MAIN_COLOR}/>
                </View>
            ) : (
                <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    <View style={CssHelper['checkCircle']}>
                        <CheckCircleIcon width={44} height={44} color={APP_MAIN_COLOR}/>
                    </View>
                    <Text style={styles.header}>Thank You! Your shift has been logged successfully.</Text>
                    <Row title="Number of clients serviced" value={endShiftSummary.getNumberOfClients()}/>
                    <Row title="Total patrol checks logged" value={endShiftSummary.getTotalPatrolLogs()}/>
                    <Row title="Shift started" value={MiscHelper.dateFormat(endShiftSummary.getStartShiftTime())}/>
                    <Row title="Shift ended" value={MiscHelper.jsDateFormat(endShiftSummary.getEndShiftTime())}/>
                    <Row title="Shift duration" value={endShiftSummary.getTotalDuration()}/>
                    <Row title="Total distance travelled" value={endShiftSummary.getTotalDistance() + "km"} lastRow={true}/>
                    <Button mode="contained" 
                        style={[CssHelper['button'], styles.button]} 
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
}))

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
    button: {
        marginTop: 30
    }
})

export default EndShiftTYContainer