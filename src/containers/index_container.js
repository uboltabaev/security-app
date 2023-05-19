import React, { useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import SplashScreen from 'react-native-splash-screen';
import auth from '@react-native-firebase/auth';
import UsersDb from '../firebase/users';
import LogsDb from '../firebase/logs'

const IndexContainer = inject('mobxStore')(observer(({ mobxStore, navigation }) => {
    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(async (u) => {
            try {
                if (u) {
                    const user = await UsersDb.getUser(u.uid)
                    mobxStore.setValues({
                        isSignedIn: true,
                        uid: u.uid,
                        user
                    })
                    navigation.navigate('Welcome')
                } else {
                    navigation.navigate('Login')
                }
    
                SplashScreen.hide()    
            } catch (error) {
                LogsDb.saveLog(error)
            }
        })

        return subscriber
    }, [])

    return null
}))

export default IndexContainer;