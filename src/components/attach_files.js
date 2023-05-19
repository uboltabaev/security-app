import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import { Button, ProgressBar, Colors } from 'react-native-paper'
import _ from 'underscore'
import { APP_MAIN_COLOR } from '../constants/app'
import CssHelper from '../helpers/css_helper'
import MiscHelper from '../helpers/misc_helper'
import ImageIcon from '../components/icons/image_icon'
import AudioIcon from '../components/icons/audio_icon'
import VideoIcon from '../components/icons/video_icon'

const AttachFiles = React.memo(({ switchCamera, attachedFiles, onDelete, disabled }) => {
    const addFile = async () => {
        if (switchCamera) {
            switchCamera()
        }
    }

    const removeFile = (n) => {
        if (onDelete) {
            onDelete(n)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                Attach Files <Text style={styles.normal}>(optional)</Text>
            </Text>
            { attachedFiles.map((file, index) =>
                <View key={index}>
                    <View style={styles.file}>
                        <View style={styles.icon}>
                            { MiscHelper.isImage(file.fileType) &&
                                <ImageIcon width={16} height={16} color={APP_MAIN_COLOR}/>
                            }
                            { MiscHelper.isAudio(file.fileType) &&
                                <AudioIcon width={16} height={16} color={APP_MAIN_COLOR}/>
                            }
                            { MiscHelper.isVideo(file.fileType) &&
                                <VideoIcon width={16} height={16} color={APP_MAIN_COLOR}/>
                            }
                        </View>
                        <View style={styles.filename}>
                            <Text style={styles.filenameText}>
                                {file.name}
                            </Text>
                        </View>
                        { !file.isUploading &&
                            <TouchableOpacity onPress={() => removeFile(file.id)}>
                                <Text style={styles.removeFile}>Remove File</Text>
                            </TouchableOpacity>
                        }
                    </View>
                    { file.isUploading &&
                        <ProgressBar progress={file.uploadingProgress} color={Colors.blue800} />
                    }
                </View>
            )}
            <View style={styles.buttonContainer}>
                <Button mode="contained" 
                    style={[CssHelper['smallButton']]} 
                    labelStyle={[CssHelper['smallButtonLabel']]} 
                    uppercase={false}
                    onPress={addFile}
                    disabled={disabled}
                >
                    Add File
                </Button>
            </View>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginTop: 5,
        marginBottom: 20
    },
    header: {
        fontSize: 16,
        color: APP_MAIN_COLOR,
        fontWeight: 'bold'
    },
    normal: {
        fontWeight: 'normal'
    },
    file: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
        paddingVertical: 15
    },
    filename: {
        flex: 1,
        paddingRight: 10
    },
    filenameText: {
        color: APP_MAIN_COLOR
    },
    icon: {
        marginRight: 10
    },
    removeFile: {
        color: APP_MAIN_COLOR,
        fontWeight: 'bold'
    },
    buttonContainer: {
        marginTop: 20,
        width: 120
    }
})

AttachFiles.propTypes = {
    switchCamera: PropTypes.func,
    attachedFiles: PropTypes.array,
    onDelete: PropTypes.func,
    disabled: PropTypes.bool
}

AttachFiles.defaultProps = {
    attachedFiles: [],
    disabled: false
}

export default AttachFiles