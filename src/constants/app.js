import { Dimensions } from 'react-native';

export const APP_MAIN_COLOR = '#1d1a1a';

export const WINDOW_HEIGHT = Dimensions.get('window').height
export const WINDOW_WIDTH = Dimensions.get('window').width

export const ALARM_RESPONSE_MODES = Object.freeze({
    DEFAULT: 'default',
    WELCOME_PAGE: 'welcomePage'
})

export const ATTACHMENT_TYPES = Object.freeze({
    'IMAGE': 'IMAGE',
    'AUDIO': 'AUDIO',
    'VIDEO': 'VIDEO',
})

export const SCREEN_MODES = Object.freeze({
    DEFAULT: 'default',
    CAMERA: 'camera'
})

export const IMAGE_FILE_FORMATS = [
    'image/jpeg',
    'image/gif',
    'image/png'
]

export const AUDIO_FILE_FORMATS = [
    'audio/3gp',
    'audio/aa',
    'audio/aac',
    'audio/aax',
    'audio/act',
    'audio/aiff',
    'audio/alac',
    'audio/amr',
    'audio/ape',
    'audio/au',
    'audio/awb',
    'audio/dss',
    'audio/dvf',
    'audio/3gp',
    'audio/flac',
    'audio/gsm',
    'audio/iklax',
    'audio/ivs',
    'audio/m4a',
    'audio/m4b',
    'audio/m4p',
    'audio/mmf',
    'audio/mp3',
    'audio/mpc',
    'audio/msv',
    'audio/nmf',
    'audio/ogg',
    'audio/oga',
    'audio/mogg',
    'audio/opus',
    'audio/ra',
    'audio/rm',
    'audio/raw',
    'audio/rf64',
    'audio/sln',
    'audio/tta',
    'audio/voc',
    'audio/vox',
    'audio/wav',
    'audio/wma',
    'audio/wv',
    'audio/webm',
    'audio/8svx',
    'audio/cda',
]

export const VIDEO_FILE_FORMATS = [
    'video/webm',
    'video/mkv',
    'video/flv',
    'video/vob',
    'video/ogv',
    'video/ogg',
    'video/drc',
    'video/gif',
    'video/gifv',
    'video/mng',
    'video/avi',
    'video/mov',
    'video/qt',
    'video/wmv',
    'video/yuv',
    'video/rm',
    'video/rmvb',
    'video/viv',
    'video/asf',
    'video/amv',
    'video/mp4',
    'video/m4p',
    'video/m4v',
    'video/mpg',
    'video/mp2',
    'video/mpeg',
    'video/mpe',
    'video/mpv',
    'video/m2v',
    'video/svi',
    'video/3gp',
    'video/3g2',
    'video/mxf',
    'video/roq',
    'video/nsv',
    'video/f4v',
    'video/f4p',
    'video/f4a',
    'video/f4b'
]