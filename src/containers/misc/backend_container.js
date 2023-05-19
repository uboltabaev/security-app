import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import PropTypes from 'prop-types';
import { APP_MAIN_COLOR } from '../../constants/app'
import CssHelper from '../../helpers/css_helper';
import ArrowLeftIcon from '../../components/icons/arrow_left_icon';

const BackendContainer = React.memo(({navigation, displayBack, displayCancel, title, secondText, cancelHandler, backHandler, noContentPadding, children}) => {
    const cancel = () => {
        if (cancelHandler) 
            cancelHandler()
    }

    const back = () => {
        if (backHandler)
            backHandler()
        else
            navigation.goBack()
    }
    
    return (
        <SafeAreaView style={[CssHelper['flex'], {backgroundColor: '#1d1a1a'}]}>
            <StatusBar hidden={false} barStyle="light-content" translucent backgroundColor="transparent"/>
            <View style={styles.container}>
                <View style={[styles.header]}>
                    <View style={CssHelper['backendLayoutBack']}>
                        { displayBack &&
                            <>
                                <TouchableOpacity style={styles.backInner} onPress={back}>
                                    <ArrowLeftIcon width={16} height={16} color="#fff"/>
                                    <Text style={styles.navText}>Back</Text>
                                </TouchableOpacity>
                            </>
                        }
                        { displayCancel &&
                            <TouchableOpacity style={styles.backInner} onPress={cancel}>
                                <ArrowLeftIcon width={16} height={16} color="#fff"/>
                                <Text style={styles.navText}>Cancel</Text>
                            </TouchableOpacity>
                        }
                    </View>
                    <Text style={[CssHelper['backendLayoutTitle']]}>
                        {title}
                    </Text>
                    <Text style={CssHelper['backendLayoutSecondText']}>
                        {secondText}
                    </Text>
                </View>
                <View style={[styles.content, noContentPadding && ({paddingHorizontal: 0})]}>
                    {children}
                </View>
            </View>
        </SafeAreaView>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20
    },
    header: {
        backgroundColor: APP_MAIN_COLOR,
        height: 135,
        paddingHorizontal: 20,
        paddingTop: StatusBar.currentHeight
    },
    backInner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    navText: {
        color: '#fff',
        fontSize: 16,
        paddingLeft: 7,
        lineHeight: 20
    }
});

BackendContainer.propTypes = {
    displayBack: PropTypes.bool,
    displayCancel: PropTypes.bool,
    title: PropTypes.string.isRequired,
    secondText: PropTypes.string,
    cancelHandler: PropTypes.func,
    backHandler: PropTypes.func,
    noContentPadding: PropTypes.bool
}

BackendContainer.defaultTypes = {
    displayBack: false,
    displayCancel: false,
    noContentPadding: false
}

export default BackendContainer;