import React, { useReducer, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import PropTypes from 'prop-types';
import { RNCamera } from 'react-native-camera';
import DocumentPicker from 'react-native-document-picker';
import _ from 'underscore';
import CssHelper from '../../helpers/css_helper';
import Pictures, { PICTURE_TYPE_ATTACHED, PICTURE_TYPE_TOKEN } from '../camera/pictures';
import MiscHelper from '../../helpers/misc_helper';
import FlipIcon from '../icons/flip_icon';
import FlashOffIcon from '../icons/flash_off_icon';
import FlashOnIcon from '../icons/flash_on_icon';
import FlashAutoIcon from '../icons/flash_auto_icon';
import CameraIcon from '../icons/camera_icon';
import CameraMovieIcon from '../icons/camera_movie_icon';
import FolderIcon from '../icons/folder_icon';
import CheckIcon from '../icons/check_icon';
import StopIcon from '../icons/stop_icon';

const MODES = Object.freeze({
    PHOTO: 'photo',
    VIDEO: 'video'
})

const Camera = React.memo(({ attachedPictures, allowedImagesNum, hide, submit }) => {
    const [state, setState] = useReducer(
        (state, newState) => ({...state, ...newState}),
        {
            selectedMode: MODES.PHOTO,
            isProcessing: false,
            isRecording: false,
            hasPermission: null,
            type: RNCamera.Constants.Type.back,
            flashMode: RNCamera.Constants.FlashMode.off,
            captures: []
        }
    )

    const { selectedMode, isProcessing, isRecording, hasPermission, type, flashMode, captures } = state
    const camera = useRef(null)

    useEffect(() => {
        setState({
            startedToScroll: true
        })
    }, [])

    const isAvailable = () => {
        return !isProcessing;
    }

    const changeFlash = () => {
        let v = flashMode
        switch(flashMode) {
            case RNCamera.Constants.FlashMode.off:
                v = RNCamera.Constants.FlashMode.torch;
                break;
            case RNCamera.Constants.FlashMode.torch:
                v = RNCamera.Constants.FlashMode.auto;
                break;
            case RNCamera.Constants.FlashMode.auto:
                v = RNCamera.Constants.FlashMode.off;
                break;
        }
        setState({
            flashMode: v
        })
    }

    const flipCamera = () => {
        if (!isAvailable())
            return null;
        setState({
            type: type === RNCamera.Constants.Type.back ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back
        })
    }

    const browseFiles = async () => {
        try {
            const results = await DocumentPicker.pickMultiple({
                type: [DocumentPicker.types.images, DocumentPicker.types.audio, DocumentPicker.types.video]
            })

            for (const res of results) {
                const file = Object.assign({}, res)
                file.id = MiscHelper.getUUID()
                file.fileType = res.type
                file.type = PICTURE_TYPE_TOKEN

                captures.push(file)

                fetch(file.uri).then(res => {
                    console.log(res.blob())

                    //res.blob()
                })
            }

            setState({
                captures
            })
        } catch (e) {
            console.log(e)
        }
    }

    const ok = () => {
        if (!isAvailable())
            return null

        if (submit) {
            _.each(captures, (n) => {
                n.type = PICTURE_TYPE_ATTACHED
                return n
            });
            const response = _.union(attachedPictures, captures)
            submit(response)
        }
    }

    const takePicture = async () => {
        if (camera && isAvailable()) {

            // Disable action if process is not ended
            setState({
                isProcessing: true
            })

            const picture = await camera.current.takePictureAsync({
                quality: 0.5, 
                base64: false 
            })

            camera.current.pausePreview()
            
            if (picture) {
                const obj = Object.assign({}, picture)
                obj.id = MiscHelper.getUUID()
                obj.type = PICTURE_TYPE_TOKEN
                obj.name = picture.uri.replace(/^.*[\\\/]/, '')
                obj.fileType = 'image/jpeg'
                captures.push(obj)

                camera.current.resumePreview()
                setState({
                    captures,
                    isProcessing: false
                })
            } else {
                camera.current.resumePreview()
            }
        }
    }

    const recordVideo = async () => {
        if (camera && isRecording) {
            stopRecordingVideo()
        }

        if (camera && isAvailable()) {

            // Disable action if process is not ended
            setState({
                isProcessing: true,
                isRecording: true
            })

            const video = await camera.current.recordAsync()
            if (video) {
                const obj = Object.assign({}, video)
                obj.id = MiscHelper.getUUID()
                obj.type = PICTURE_TYPE_TOKEN
                obj.name = video.uri.replace(/^.*[\\\/]/, '')
                obj.fileType = 'video/mp4'
                captures.push(obj)

                setState({
                    captures,
                    isProcessing: false,
                    isRecording: false
                })
            }
        }
    }

    const stopRecordingVideo = () => {
        if (camera && isRecording) {
            camera.current.stopRecording()
        }
    }

    const deleteFile = (newPictures) => {
        setState({
            captures: newPictures
        })
    }

    const changeMode = (mode) => {
        setState({
            selectedMode: mode
        })
    }

    const allImages = _.union(attachedPictures, captures),
        isSubmitAvailable = allImages.length < allowedImagesNum ? true : false;

    return (
        <View style={[CssHelper['flex'], hide && (CssHelper['hidden'])]}>
            <RNCamera style={[CssHelper['flex']]} 
                type={type} 
                flashMode={flashMode} 
                autoFocus={RNCamera.Constants.AutoFocus.on} 
                ref={camera} 
                androidCameraPermissionOptions={{
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                }}
                androidRecordAudioPermissionOptions={{
                    title: 'Permission to use audio recording',
                    message: 'We need your permission to use your audio',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                }}
            >
                <View style={styles.top}>
                    <View style={CssHelper['flexRowCentered']}>
                        <View style={type === RNCamera.Constants.Type.front ? CssHelper['hidden'] : {}}>
                            <TouchableOpacity style={[styles.flash]} onPress={changeFlash}>
                                {((f) => {
                                    switch(f) {
                                        case RNCamera.Constants.FlashMode.off:
                                            return (
                                                <FlashOffIcon width={24} height={24} color={'#fff'}/>
                                            );
                                        case RNCamera.Constants.FlashMode.torch:
                                            return (
                                                <FlashOnIcon width={24} height={24} color={'#fff'}/>
                                            );
                                        case RNCamera.Constants.FlashMode.auto:
                                            return (
                                                <FlashAutoIcon width={24} height={24} color={'#fff'}/>
                                            );    
                                    }
                                })(flashMode)}
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={flipCamera}>
                            <FlipIcon width={24} height={24} color={"#fff"}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.bottom}>
                    <Pictures pictures={captures} 
                        attachedPictures={attachedPictures}
                        onDelete={deleteFile} 
                        u={captures.length}
                    />
                    <View style={[styles.actions, CssHelper['flexRowCentered']]}>
                        <View style={CssHelper['flex']}>
                            <TouchableOpacity style={styles.ac} onPress={() => changeMode(MODES.PHOTO)}>
                                <View style={CssHelper['flexSingleCentered']}>
                                    <CameraIcon width={24} height={24} color={selectedMode === MODES.PHOTO ? '#ffe400' : '#fff'}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={CssHelper['flex']}>
                            <TouchableOpacity style={styles.ac} onPress={() => changeMode(MODES.VIDEO)}>
                                <View style={CssHelper['flexSingleCentered']}>
                                    <CameraMovieIcon width={24} height={24} color={selectedMode === MODES.VIDEO ? '#ffe400' : '#fff'}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.cameraContainer}>
                            <TouchableOpacity disabled={!isSubmitAvailable} 
                                style={[CssHelper['flexSingleCentered'], !isSubmitAvailable && (styles.cameraDisabled)]} 
                                activeOpacity={0.9} 
                                onPress={selectedMode === MODES.VIDEO ? recordVideo : takePicture}
                            >
                                <View style={styles.takePicture}>
                                    { selectedMode === MODES.VIDEO && isRecording &&
                                        <View style={CssHelper['flexSingleCentered']}>
                                            <StopIcon width={16} height={16} color="#000"/>
                                        </View>
                                    } 
                                    { selectedMode === MODES.VIDEO && !isRecording &&
                                        <View style={CssHelper['flexSingleCentered']}>
                                            <View style={styles.record}/>
                                        </View>
                                    }
                                </View>
                            </TouchableOpacity>                        
                        </View>
                        <View style={CssHelper['flex']}>
                            <TouchableOpacity style={styles.ac} onPress={browseFiles}>
                                <View style={CssHelper['flexSingleCentered']}>
                                    <FolderIcon width={24} height={24} color={'#fff'}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={[CssHelper['flex']]}>
                            <TouchableOpacity style={styles.ac} onPress={ok}>
                                <View style={CssHelper['flexSingleCentered']}>
                                    <CheckIcon width={24} height={24} color={'#fff'}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </RNCamera>
        </View>
    )
})

const styles = StyleSheet.create({
    top: {
        position: 'absolute',
        top: 10,
        right: 0,
        paddingHorizontal: 20,
    },
    flash: {
        marginRight: 30
    },
    bottom: {
        position: 'absolute',
        bottom: 0,
        width: '100%'
    },
    actions: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        height: 70
    },
    ac: {
        paddingLeft: 10,
        paddingRight: 10,
        height: '100%',
    },
    cameraContainer: {
        flex: 1
    },
    takePicture: {
        backgroundColor: '#fff',
        width: 56,
        height: 56,
        borderRadius: 28
    },
    record: {
        width: 16,
        height: 16,
        backgroundColor: '#ff0000',
        borderRadius: 8
    },
    bottomB: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

})

Camera.propTypes = {
    attachedPictures: PropTypes.array,
    allowedImagesNum: PropTypes.number,
    hide: PropTypes.bool,
    submit: PropTypes.func
}

Camera.defaultProps = {
    attachedPictures: [],
    allowedImagesNum: 5,
    hide: false
}

export default Camera