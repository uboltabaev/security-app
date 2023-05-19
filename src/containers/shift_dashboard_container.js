import React, { useEffect, useReducer } from 'react'
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView } from 'react-native'
import { Button, TextInput } from 'react-native-paper'
import { observer, inject } from 'mobx-react'
import _ from 'underscore'
import firestore from '@react-native-firebase/firestore'
import LogsDb from '../firebase/logs'
import { APP_MAIN_COLOR } from '../constants/app'
import CssHelper from '../helpers/css_helper'
import MiscHelper from '../helpers/misc_helper'
import { PatrolShift } from '../firebase/patrol_shifts'
import InfoCircleIcon from '../components/icons/info_circle_icon'
import Error from '../components/error'

const Item = React.memo(({shift, navigation}) => {
    let f = '';
    if (shift.address.unit_number !== '' && shift.address.unit_number !== null) {
        f += 'U ' + shift.address.unit_number + ' / '
    }

    const address = [
        f + shift.address.street_number + ' ' + shift.address.street_name, 
        shift.address.street_type,
        shift.address.suburb,
    ]
    
    const { client_id, client_name } = shift.client

    return (
        <View style={styles.shift}>
            <View style={styles.client}>
                <TouchableOpacity onPress={() => navigation.navigate('Client', {
                    client_id,
                    client_shift_id: shift.id
                })}>
                    <Text style={styles.clientName}>
                        {client_name}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.address}>
                    {address.join(", ")}
                </Text>
            </View>
            <View style={styles.totalChecks}>
                <Text style={styles.checksText}>
                    {shift.total_checks}
                </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Client', {
                client_id,
                client_shift_id: shift.id
            })}>
                <InfoCircleIcon width={24} height={24} color={APP_MAIN_COLOR}/>
            </TouchableOpacity>
        </View>
    )
})

const ShiftDashboardContainer = inject('mobxStore')(observer(({ mobxStore, route, navigation }) => {

    const [state, setState] = useReducer(
        (state, newState) => ({...state, ...newState}),
        {
            patrolShift: null,
            filteredData: [],
            filter: '',
            sort: 'default',
            isLoading: true
        }
    )

    const { patrolShift, filteredData, sort, filter, isLoading } = state

    useEffect(() => {
        let unsubscribe = null
        const { patrol_shift_id } = route.params

        try {
            unsubscribe = firestore()
                .collection("patrol_shifts")
                .doc(patrol_shift_id)
                .onSnapshot(doc => {
                    const data = new PatrolShift(doc.data())
                    const clients = sortClients(data.getPatrolShiftClients())
                    data.setPatrolShiftClients(clients)

                    setState({
                        patrolShift: data,
                        filteredData: clients,
                        isLoading: false    
                    })

                    mobxStore.setValues({
                        patrolShift: data
                    })
                })
        } catch (error) {
            LogsDb.saveLog(error)
        }

        return () => {
            if (unsubscribe) {
                unsubscribe()
            }
        }
    }, [])

    useEffect(() => {
        if (patrolShift instanceof PatrolShift) {
            const clients = _.filter(patrolShift.getPatrolShiftClients(), (item) => {
                return item.client.client_name.indexOf(filter) != -1
            })

            setState({
                filteredData: clients
            })    
        }
    }, [filter])

    const { start_date } = route.params

    const renderItem = ({ item }, navigation) => (
        <Item shift={item} navigation={navigation}/>
    )

    const onChange = (e) => {
        const { text } = e.nativeEvent
        setState({
            filter: text
        })        
    }

    const sortClients = (clients) => {
        switch (sort) {
            case 'default':
                return _.sortBy(clients, (obj) => obj.client.client_name)
            case 'asc':
                return _.sortBy(clients, (obj) => obj.total_checks)
            case 'desc':
                return _.sortBy(clients, (obj) => obj.total_checks).reverse()
        }
    }
    
    const f = "Shift started " + MiscHelper.dateFormat(start_date)

    return (
        <SafeAreaView style={[CssHelper['flex'], {backgroundColor: '#1d1a1a'}]}>
            <StatusBar hidden={false} barStyle="light-content" translucent backgroundColor="transparent"/>
            <View style={styles.container}>
                <View style={[styles.header]}>
                    <View style={CssHelper['backendLayoutBack']}/>
                    <Text style={[CssHelper['backendLayoutTitle']]}>
                        Current Shift
                    </Text>
                    <Text style={CssHelper['backendLayoutSecondText']}>
                        {f}
                    </Text>
                    <TextInput style={{marginTop: 8}}
                        multiline={false}
                        numberOfLines={1}
                        label=""
                        mode="outlined"
                        value={filter}
                        onChange={onChange}
                    />
                </View>
                <View style={[styles.c]}>
                    { isLoading ? (
                        <View style={CssHelper['flexSingleCentered']}>
                            <ActivityIndicator size="large" color={APP_MAIN_COLOR}/>
                        </View>
                    ) : (
                        patrolShift instanceof PatrolShift ? (
                            <FlatList style={styles.content}
                                contentContainerStyle={styles.contentContainer}
                                data={filteredData}
                                keyExtractor={(item, index) => index}
                                renderItem={(i) => renderItem(i, navigation)}
                                showsVerticalScrollIndicator={false}
                                ListFooterComponent={
                                    <View style={styles.buttons}>
                                        <Button onPress={() => navigation.navigate('AlarmResponse', { patrol_shift_id: patrolShift.getPatrolShiftId() })} 
                                            mode="contained" 
                                            style={[CssHelper['button'], styles.button, styles.alarmButton]} 
                                            labelStyle={[CssHelper['buttonLabel'], styles.buttonLabel]} 
                                            uppercase={false}
                                        >
                                            Start Alarm Response
                                        </Button>
                                        <Button onPress={() => navigation.navigate('EndShift')} 
                                            mode="outlined" 
                                            style={[CssHelper['button'], styles.button]} 
                                            labelStyle={[CssHelper['buttonLabel'], styles.buttonLabel, {color: APP_MAIN_COLOR}]} 
                                            uppercase={false}
                                        >
                                            End Shift
                                        </Button>
                                    </View>
                                }
                            />
                        ) : (
                            <View style={CssHelper['flexSingleCentered']}>
                                <Error errorText="An error occured while fetching data"/>
                            </View>
                        )
                    )}
                </View>
            </View>
        </SafeAreaView>
    )
}))

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
    },
    header: {
        backgroundColor: APP_MAIN_COLOR,
        height: 205,
        paddingHorizontal: 20,
        paddingTop: StatusBar.currentHeight
    },
    c: {
        flex: 1,
        paddingHorizontal: 20
    },
    content: {
        flex: 1
    },
    contentContainer: {
        paddingVertical: 20
    },
    shift: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: '#f0f0f0',
        borderBottomWidth: 1,
        paddingVertical: 10
    },
    client: {
        flex: 1
    },
    clientName: {
        color: APP_MAIN_COLOR,
        fontSize: 16,
        fontWeight: 'bold'
    },
    address: {
        color: APP_MAIN_COLOR,
        fontSize: 12,
        paddingTop: 3
    },
    totalChecks: {
        flex: 1
    },
    checksText: {
        textAlign: 'center',
        color: APP_MAIN_COLOR,
        fontSize: 24,
    },
    buttons: {
        marginTop: 20,
        flex: 1,
        flexDirection: 'row'
    },
    button: {
        flex: 1,
        marginTop: 0,
        height: 55
    },
    buttonLabel: {
        fontSize: 13,
        fontWeight: 'normal'
    },
    alarmButton: {
        flex: 0,
        marginRight: 15,
        width: 180
    }
})

export default ShiftDashboardContainer