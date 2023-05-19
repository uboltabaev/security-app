import React, { useEffect, useReducer, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import * as EmailValidator from 'email-validator';
import auth from '@react-native-firebase/auth';
import { TextInput, Button } from 'react-native-paper';
import FrontendContainer from '../containers/misc/frontend_container';
import CssHelper from '../helpers/css_helper';
import Error from '../components/error';

function LoginContainer({ navigation }) {
    const [state, setState] = useReducer(
        (state, newState) => ({...state, ...newState}),
        {
            email: '',
            error: '',
            isFormSubmitting: false
        }
    )

    const { email, error, isFormSubmitting } = state
    const emailRef = useRef(null)

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setState({
                email: '',
                error: ''
            })
        })

        return unsubscribe
    }, [navigation])

    const onChange = (e) => {
        const { text } = e.nativeEvent
        setState({
            email: text
        })
    }

    const onSubmit = () => {
        setState({
            error: ''
        })
        if (email === '') {
            setState({
                error: 'Email is required'
            })
            emailRef.current.focus()
        } else if (!EmailValidator.validate(email)) {
            setState({
                error: 'Email is invalid'
            })
            emailRef.current.focus()
        } else {
            setState({
                isFormSubmitting: true
            })
            auth().sendPasswordResetEmail(email).then((user) => {
                setState({
                    error: 'Instruction email has been sent to your email',
                    isFormSubmitting: false
                })
            }).catch((e) => {
                setState({
                    error: e.code,
                    isFormSubmitting: false
                })
            })
        }
    }

    return (
        <FrontendContainer title="Forgot password">
            <Text style={CssHelper['note']}>
                Enter the email address associated with your account and we'll send an email with
                instructions to reset your password.
            </Text>
            <TextInput style={styles.textInput}
                ref={emailRef}
                label="Email Address"
                mode="outlined"
                keyboardType='email-address'
                value={email}
                onChange={onChange}
                autoCapitalize='none'
                error={error.length > 0}
                disabled={isFormSubmitting ? true : false}
            />
            <Error errorText={error}/>
            <Button onPress={onSubmit} 
                mode="contained" 
                style={CssHelper['button']} 
                labelStyle={CssHelper['buttonLabel']} 
                uppercase={false}
                loading={isFormSubmitting ? true : false}
                disabled={isFormSubmitting ? true : false}
            >
                Send Instructions
            </Button>
            <View style={styles.linkContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={CssHelper['link']}>Back to Login</Text>
                </TouchableOpacity>
            </View>
        </FrontendContainer>
    )
}

const styles = StyleSheet.create({
    textInput: {
        marginTop: 20
    },
    linkContainer: {
        marginTop: 25
    }
});

export default LoginContainer;