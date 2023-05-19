import React from 'react';
import { StyleSheet, View, ImageBackground, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import { APP_MAIN_COLOR, WINDOW_WIDTH, AUDIO_FILE_FORMATS } from "../../constants/app";
import CssHelper from '../../helpers/css_helper';
import MinusIcon from '../icons/minus_icon';
import LockIcon from '../icons/lock_icon';
import AudioIcon from '../icons/audio_icon';

export const MODE_PICTURES_CAMERA = 'camera';

export const PICTURE_TYPE_TOKEN = 'token';
export const PICTURE_TYPE_ATTACHED = 'attached';

const DELETE_ICON_SIZE = 20;
const MAX_PICTURES_NUM_ON_SCREEN = 5;

const Pictures = React.memo(({ mode, isLocked, margin, paddingHorizontal, pictures, picturesNum, attachedPictures, onDelete }) => {
    const calculatedPicNum = picturesNum < MAX_PICTURES_NUM_ON_SCREEN ? MAX_PICTURES_NUM_ON_SCREEN : picturesNum;
    const imageSize = (WINDOW_WIDTH - (paddingHorizontal * 2) - ((calculatedPicNum - 1) * margin)) / calculatedPicNum;

    const deletePicture = (n) => {
        const newPictures = _.reject(pictures, {id: n});
        if (_.isFunction(onDelete)) {
            onDelete(newPictures);
        }
    }

    const styleProps = {
        IMAGE_SIZE: imageSize, 
        IMAGE_MARGIN: margin, 
        MODE: mode,
        PICTURES_NUM: picturesNum
    }

    const allPictures = _.union(attachedPictures, pictures)

    return (
        <View style={[CssHelper['flexRowCentered'], styles(styleProps).gallery, styles(styleProps).galleryBackground()]} >
            { _.times(picturesNum, (n) => {
                let picture = allPictures[n];
                const _isLocked = (_.isObject(picture) && picture.type === PICTURE_TYPE_ATTACHED && (mode === MODE_PICTURES_CAMERA)) || isLocked;
                const isAudio = _.contains(AUDIO_FILE_FORMATS, _.isObject(picture) ? picture.fileType : '')

                if (isAudio) {
                    return (
                        <View key={n} style={[styles(styleProps).imageContainer, n === (picturesNum - 1) && ({marginRight: 0})]}>
                            <View style={[CssHelper['flexSingleCentered'], styles(styleProps).imageInnerContainer]}>
                                <AudioIcon width={24} height={24} color={'#fff'}/>
                                { _isLocked &&
                                    <View style={[CssHelper['flexSingleCentered']]}>
                                        <LockIcon width={16} height={16} color={"#dddddd"}/>
                                    </View>
                                }
                                { !_isLocked &&
                                    <View style={[styles(styleProps).delete]}>
                                        <TouchableOpacity style={[CssHelper['flex']]} onPress={() => deletePicture(picture.id)}>
                                            <View style={[styles(styleProps).deleteInner, CssHelper['flexSingleCentered']]}>
                                                <MinusIcon width={12} height={12} color="#fff"/>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                }
                            </View>
                        </View>
                    )
                }

                return(
                    <View key={n} style={[_.isObject(picture) ? styles(styleProps).imageContainer : styles(styleProps).imageEmptyContainer, n === (picturesNum - 1) && ({marginRight: 0})]}>
                        { _.isObject(picture) &&
                            <View style={[CssHelper['flex'], styles(styleProps).imageInnerContainer]}>
                                <ImageBackground source={{uri: picture.uri}} style={styles(styleProps).image} resizeMode="cover">
                                    { _isLocked &&
                                        <View style={[CssHelper['flexSingleCentered'], styles(styleProps).imageLocked]}>
                                            <LockIcon width={16} height={16} color={"#dddddd"}/>
                                        </View>
                                    }
                                </ImageBackground>
                                { !_isLocked &&
                                    <View style={styles(styleProps).delete}>
                                        <TouchableOpacity style={[CssHelper['flex'], CssHelper['standartLink']]} activeOpacity={1} onPress={() => deletePicture(picture.id)}>
                                            <View style={[styles(styleProps).deleteInner, CssHelper['flexSingleCentered']]}>
                                                <MinusIcon width={12} height={12} color="#fff"/>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                }
                            </View>
                        }
                    </View>
                );
            })}
        </View>
    )
})

const styles = (props) => StyleSheet.create({
    gallery: {
        justifyContent: props.PICTURES_NUM < MAX_PICTURES_NUM_ON_SCREEN ? 'center' : 'space-between',
        height: props.MODE === MODE_PICTURES_CAMERA ? (props.IMAGE_SIZE + (props.IMAGE_MARGIN * 2)) : props.IMAGE_SIZE + props.IMAGE_MARGIN,
        paddingHorizontal: props.MODE === MODE_PICTURES_CAMERA ? props.IMAGE_MARGIN : 0,
    },
    galleryBackground: () => {
        let backgroundColor = '#fff';
        switch(props.MODE) {
            case MODE_PICTURES_CAMERA:
                backgroundColor =  'rgba(0, 0, 0, 0.5)';
                break;
        }
        return {
            backgroundColor
        };
    },
    imageEmptyContainer: {
        width: props.IMAGE_SIZE,
        height: props.IMAGE_SIZE,
        borderWidth: 1,
        borderColor: props.MODE === MODE_PICTURES_CAMERA ? 'rgba(255, 255, 255, 0.5)' : '#979797',
        borderStyle: 'dashed',
        borderRadius: 5,
        marginRight: props.IMAGE_MARGIN
    },
    imageContainer: {
        width: props.IMAGE_SIZE + props.IMAGE_MARGIN,
        paddingVertical: props.MODE === MODE_PICTURES_CAMERA ? (props.IMAGE_MARGIN / 2) : 0
    },
    imageInnerContainer: {
        paddingTop: props.MODE === MODE_PICTURES_CAMERA ? 0 : (DELETE_ICON_SIZE / 4),
        paddingRight: props.IMAGE_MARGIN
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageLocked: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    delete: {
        backgroundColor: '#fff',
        width: DELETE_ICON_SIZE,
        height: DELETE_ICON_SIZE,
        borderRadius: (DELETE_ICON_SIZE / 2),
        position: 'absolute',
        top: 0,
        right: props.MODE === MODE_PICTURES_CAMERA ? (props.IMAGE_MARGIN - (DELETE_ICON_SIZE / 2)) : (props.IMAGE_MARGIN - (DELETE_ICON_SIZE / 4)),
        padding: 1
    },
    deleteInner: {
        flex: 1,
        backgroundColor: APP_MAIN_COLOR,
        borderRadius: ((DELETE_ICON_SIZE - 2) / 2)
    }
});

Pictures.propTypes = {
    mode: PropTypes.string,
    isLocked: PropTypes.bool,
    pictures: PropTypes.array,
    attachedPictures: PropTypes.array,
    margin: PropTypes.number,
    picturesNum: PropTypes.number,
    onDelete: PropTypes.func,
    paddingHorizontal: PropTypes.number
}

Pictures.defaultProps = {
    mode: MODE_PICTURES_CAMERA,
    isLocked: false,
    pictures: [],
    attachedPictures: [],
    margin: 15,
    picturesNum: 5,
    paddingHorizontal: 15
}

export default Pictures;