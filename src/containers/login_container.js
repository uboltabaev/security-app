import React, { useEffect, useRef, useReducer } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import * as EmailValidator from 'email-validator';
import auth from '@react-native-firebase/auth';
import FrontendContainer from '../containers/misc/frontend_container';
import CssHelper from '../helpers/css_helper';
import Error from '../components/error';

function LoginContainer({ navigation }) {
    const [state, setState] = useReducer(
        (state, newState) => ({...state, ...newState}),
        {
            email: '',
            password: '',
            emailError: '',
            passwordError: '',
            isFormSubmitting: false
        }
    )

    const { email, password, emailError, passwordError, isFormSubmitting } = state

    const emailRef = useRef(null)
    const passwordRef = useRef(null)

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setState({
                email: '',
                password: '',
                emailError: '',
                passwordError: ''
            })
        })

        return unsubscribe
    }, [navigation])

    const onChange = (e, name) => {
        const { text } = e.nativeEvent
        const obj = {}
        obj[name] = text
        setState(obj)
    }

    const onSubmit = () => {
        setState({
            emailError: '',
            passwordError: ''
        })
        if (email === '') {
            setState({
                emailError: 'Email is required'
            })
            emailRef.current.focus()
        } else if (!EmailValidator.validate(email)) {
            setState({
                emailError: 'Email is invalid'
            })
            emailRef.current.focus()
        } else if (password === '') {
            setState({
                passwordError: 'Password is required'
            })
            passwordRef.current.focus()
        } else {
            setState({
                isFormSubmitting: true
            })
            auth().signInWithEmailAndPassword(email, password).then((user) => {
                // We have listener on the Index screen...

            }).catch((e) => {
                setState({
                    isFormSubmitting: false,
                    emailError: e.code
                })
            })
        }
    }

    return (
        <FrontendContainer title="Login">
            <TextInput style={styles.textInput}
                ref={emailRef}
                label="Email Address"
                mode="outlined"
                keyboardType='email-address'
                value={email}
                onChange={e => onChange(e, 'email')}
                autoCapitalize='none'
                error={emailError.length > 0}
                disabled={isFormSubmitting ? true : false}
            />
            <Error errorText={emailError}/>
            <TextInput style={styles.textInput}
                ref={passwordRef}
                label="Password"
                mode="outlined"
                value={password}
                onChange={e => onChange(e, 'password')}
                autoCapitalize='none'
                secureTextEntry={true}
                error={passwordError.length > 0}
                disabled={isFormSubmitting ? true : false}
            />
            <Error errorText={passwordError}/>
            <Button onPress={onSubmit} 
                mode="contained" 
                style={CssHelper['button']} 
                labelStyle={CssHelper['buttonLabel']} 
                uppercase={false}
                loading={isFormSubmitting ? true : false}
                disabled={isFormSubmitting ? true : false}
            >
                Sign In
            </Button>
            <View style={styles.linkContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={[CssHelper['link']]}>Forgot password?</Text>
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