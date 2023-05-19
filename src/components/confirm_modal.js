import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { Button } from 'react-native-paper';
import Modal from 'react-native-modal';
import { APP_MAIN_COLOR } from '../constants/app';
import CssHelper from '../helpers/css_helper';
import CloseIcon from '../components/icons/close_icon';

const ConfirmModal = React.memo(({ isVisible, title, text, confirmHandle, closeModal }) => {
    const close = () => {
        if (closeModal)
            closeModal()
    }

    const confirm = () => {
        if (confirmHandle)
            confirmHandle()
    }

    return (
        <Modal isVisible={isVisible} useNativeDriver={true}>
            <View style={CssHelper['dialogueContainer']}>
                <View style={CssHelper['dialogueHeader']}>
                    <View style={CssHelper['dialogueInnerHeader']}>
                        <Text style={CssHelper['dialogueTitle']}>{title}</Text>
                        <TouchableOpacity onPress={close} style={CssHelper['closeIcon']}>
                            <CloseIcon width={24} height={24} color={APP_MAIN_COLOR}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={CssHelper['dialogueContent']}>
                    <Text style={styles.text}>{text}</Text>
                </View>
                <View style={styles.buttonContainer}>
                    <View style={styles.buttonContainerInner}>
                        <View style={styles.nButton}>
                            <Button mode="contained" 
                                style={[CssHelper['button'], styles.bn]} 
                                labelStyle={[CssHelper['buttonLabel'], styles.bnLable]} 
                                uppercase={false}
                                onPress={close}
                            >
                                No
                            </Button>
                        </View>
                        <View style={styles.yButton}>
                            <Button mode="contained" 
                                style={[CssHelper['button']]} 
                                labelStyle={[CssHelper['buttonLabel']]} 
                                uppercase={false}
                                onPress={confirm}
                            >
                                Yes
                            </Button>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
})

const styles = StyleSheet.create({
    text: {
        color: APP_MAIN_COLOR,
        fontSize: 12
    },
    buttonContainer: {
        height: 60
    },
    buttonContainerInner: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    nButton: {
        flex: 1,
        marginRight: 10
    },
    yButton: {
        flex: 1
    },
    bn: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: APP_MAIN_COLOR
    },
    bnLable: {
        color: APP_MAIN_COLOR
    }
})

ConfirmModal.propTypes = {
    isVisible: PropTypes.bool,
    title: PropTypes.string,
    text: PropTypes.string,
    confirmHandle: PropTypes.func,
    closeModal: PropTypes.func
}

ConfirmModal.defaultProps = {
    isVisible: false
}

export default ConfirmModal;