import React, { useEffect, useReducer } from 'react'
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Platform, TouchableOpacity } from 'react-native'
import { Button } from 'react-native-paper'
import _ from 'underscore'
import { PERMISSIONS } from 'react-native-permissions'
import PhoneCall from 'react-native-phone-call'
import { APP_MAIN_COLOR } from '../constants/app'
import CssHelper from '../helpers/css_helper'
import MiscHelper from '../helpers/misc_helper'
import ClientsDb, { Client } from '../firebase/clients'
import LogsDb from '../firebase/logs'
import BackendContainer from '../containers/misc/backend_container'
import Error from '../components/error'

const Info = React.memo(({ title, value }) => {
    return (
        <View style={styles.info}>
            <Text style={styles.infoTitle}>
                {title}
            </Text>
            <Text style={styles.infoValue}>
                {value}
            </Text>
        </View>
    )
})

function ClientContainer({ route, navigation }) {

    const [state, setState] = useReducer(
        (state, newState) => ({...state, ...newState}),
        {
            client: null,
            granted: false,
            error: '',
            isLoading: true,
            isSubmitting: false
        }
    )

    const { client, granted, error, isLoading, isSubmitting } = state
    const { client_shift_id } = route.params

    useEffect(() => {
        async function fetchClient() {
            try {
                const { client_id } = route.params
                const data = await ClientsDb.getClient(client_id)
    
                setState({
                    client: data,
                    isLoading: false
                })    
            } catch (error) {
                LogsDb.saveLog(error)
            }
        }

        fetchClient()
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
            } catch (e) {
                MiscHelper.openSettings()
            }
        }

        requestLocationPermission()
    }, [])

    const startPatrolCheck = () => {
        navigation.navigate('LogPatrol', {
            client, 
            client_shift_id
        })
    }

    const checkRadius = async () => {
        try {
            setState({
                isSubmitting: true,
                error: ''
            })

            const postData = {
                origins: null,
                destinations: null
            }

            if (granted) {
                const position = await MiscHelper.getCurrentPosition()
                if (position.coords) {
                    const { latitude, longitude } = position.coords
                    postData.origins = [latitude, longitude]
                }
            }

            const location = client.getLocation()
            if (_.isObject(location)) {
                const { _latitude, _longitude } = location
                postData.destinations = [_latitude, _longitude]
            }

            if (_.isArray(postData.origins) && _.isArray(postData.destinations)) {
                const url = [
                    'https://maps.googleapis.com/maps/api/distancematrix/json?',
                    'origins=' + postData.origins.join(','),
                    '&',
                    'destinations=' + postData.destinations.join(','),
                    '&key=AIzaSyDfzzFRRavQ61peEclzLl0Hdr-4RncUFFE'
                ]

                const response = await fetch(url.join(""))
                const json = await response.json()

                if (json.status === 'OK') {
                    const meter = json?.rows[0]?.elements[0]?.distance?.value
                    if (meter) {
                        if (client.getRadius() >= meter) {
                            setState({
                                isSubmitting: false
                            })                

                            navigation.navigate('LogPatrol', {
                                client, 
                                client_shift_id
                            })
                        } else 
                            throw 'User is out of specified radius of coordinates'
                    } else
                        throw 'Coordinates is not found'
                }
            }
        } catch (e) {
            setState({
                isSubmitting: false,
                error: e
            })
        }
    }

    const callNumber = (phoneNumber) => {
        const args = {
            number: phoneNumber,
            prompt: false
        }

        PhoneCall(args).catch(console.error)
    }

    return ( 
        <BackendContainer navigation={navigation} 
            title={client instanceof Client ? client.getName() : 'Client Name'} 
            secondText={client instanceof Client ? client.getAddressLine() : "Client address"} 
            displayBack={true}
        >
            { isLoading ? (
                <View style={CssHelper['flexSingleCentered']}>
                    <ActivityIndicator size="large" color={APP_MAIN_COLOR}/>
                </View>
            ) : (
                client instanceof Client ? (
                    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        { error.length > 0 &&
                            <View style={styles.errorContainer}>
                                <Error errorText={error}/> 
                            </View>
                        }
                        <Text style={styles.header}>Primary Contact Details</Text>
                        <View style={styles.info}>
                            <Text style={styles.infoTitle}>
                                Phone
                            </Text>
                            <TouchableOpacity onPress={() => callNumber(client.getPhone())}>
                                <Text style={styles.infoValue}>{client.getPhone()}</Text>
                            </TouchableOpacity>
                        </View>
                        <Info title="Email" value={client.getEmail()}/>
                        <Text style={styles.header}>Keyholders</Text>
                        { client.keyholders.map((keyholder, index) => {
                            const fullName = [keyholder.first_name, keyholder.last_name]
                            return (
                                <View key={index} style={styles.info}>
                                    <Text style={styles.infoTitle}>
                                        {fullName.join(' ')}
                                    </Text>
                                    <View>
                                        <View>
                                            <TouchableOpacity style={styles.infoValue} onPress={() => callNumber(keyholder.phone)}>
                                                <Text style={styles.infoValue}>{keyholder.phone}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View>
                                            <Text style={styles.infoValue}>{keyholder.email}</Text>
                                        </View>
                                    </View>
                                </View>
                            )
                        })}
                        <Text style={[styles.header, styles.header2]}>Patrol Instructions</Text>
                        <Text style={styles.instructions}>
                            { client.getInstructions() }
                        </Text>
                        <Button mode="contained" 
                            style={[CssHelper['button']]} 
                            labelStyle={[CssHelper['buttonLabel']]} 
                            uppercase={false}
                            onPress={startPatrolCheck}
                            loading={isSubmitting ? true : false}
                            disabled={isSubmitting ? true : false}        
                        >
                            Start Patrol Check
                        </Button>
                    </ScrollView>    
                ) : (
                    <View style={CssHelper['flexSingleCentered']}>
                        <Error errorText="An error occured while fetching data"/>
                    </View>
                )
            )}
        </BackendContainer>
    )
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingBottom: 20
    },
    contentContainer: {
        paddingBottom: 20
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        color: APP_MAIN_COLOR,
        borderBottomColor: '#f0f0f0',
        borderBottomWidth: 1,
        paddingTop: 22,
        paddingBottom: 12
    },
    info: {
        flex: 1,
        flexDirection: 'row',
        borderBottomColor: '#f0f0f0',
        borderBottomWidth: 1,
        paddingVertical: 12
    },
    infoTitle: {
        width: '40%',
        color: APP_MAIN_COLOR
    },
    infoValue: {
        flex: 1,
        fontWeight: 'bold',
        color: APP_MAIN_COLOR
    },
    header2: {
        borderBottomWidth: 0,
    },
    instructions: {
        color: APP_MAIN_COLOR,
        paddingBottom: 20
    },
    errorContainer: {
        marginTop: 15
    }
})

export default ClientContainer