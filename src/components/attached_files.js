import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { APP_MAIN_COLOR } from '../constants/app'
import MiscHelper from '../helpers/misc_helper'
import ImageIcon from '../components/icons/image_icon'
import AudioIcon from '../components/icons/audio_icon'
import VideoIcon from '../components/icons/video_icon'

const AttachFiles = React.memo(({ attachedFiles }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                Attached Files
            </Text>
            { attachedFiles.map((file, index) =>
                <View key={index} style={styles.file}>
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
                </View>
            )}
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        marginTop: 25,
        marginBottom: 10,
        borderTopColor: '#f0f0f0',
        borderTopWidth: 1
    },
    header: {
        marginTop: 20,
        marginBottom: 10,
        fontWeight: 'bold',
        color: APP_MAIN_COLOR
    },
    file: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 5,
        alignItems: 'center'
    },
    filename: {
        flex: 1,

    },
    filenameText: {
        color: APP_MAIN_COLOR
    },
    icon: {
        marginRight: 10
    }
})

export default AttachFiles