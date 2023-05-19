import React from 'react'
import { StyleSheet, StatusBar, ScrollView, View, Text, Image, SafeAreaView } from 'react-native'
import PropTypes from 'prop-types'
import CssHelper from '../../helpers/css_helper'
import { APP_MAIN_COLOR, WINDOW_HEIGHT } from '../../constants/app'

const FrontendContainer = React.memo(({title, children}) => {
    return (
        <SafeAreaView style={[CssHelper['flex'], {backgroundColor: '#000'}]}>
            <StatusBar hidden={false} barStyle="light-content" translucent backgroundColor="transparent"/>
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                <View style={[styles.logo, {height: WINDOW_HEIGHT / 3}]}>
                    <Image source={require('../../../assets/images/logo.png')} style={CssHelper['image']}/>
                </View>
                <View style={styles.content}>
                    <Text style={[styles.header, {color: APP_MAIN_COLOR}]}>{title}</Text>
                    <View>
                        {children}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
})

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
    },
    logo: {
        flex: 1,
        backgroundColor: '#707070',
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        flex: 1,
        paddingHorizontal: 30
    },
    header: {
        marginTop: 25,
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: -12
    }
})

FrontendContainer.propTypes = {
    title: PropTypes.string.isRequired
}

export default FrontendContainer