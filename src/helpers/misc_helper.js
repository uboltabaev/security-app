import moment from 'moment'
import _ from 'underscore'
import { Alert, Linking } from 'react-native'
import Geolocation from 'react-native-geolocation-service'
import { IMAGE_FILE_FORMATS, AUDIO_FILE_FORMATS, VIDEO_FILE_FORMATS } from '../constants/app'
import { check, request, RESULTS } from 'react-native-permissions'

class MiscHelper {
    /**
     * Generate UUID
     * @returns string
     */
    static getUUID() {
        let lut = []
        for (let i = 0; i < 256; i++) { 
            lut[i] = (i<16?'0':'')+(i).toString(16)
        }
        let d0 = Math.random()*0xffffffff|0
        let d1 = Math.random()*0xffffffff|0
        let d2 = Math.random()*0xffffffff|0
        let d3 = Math.random()*0xffffffff|0
        return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
        lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
        lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
        lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff] 
    }
    /**
     * Return date format of given date tie
     * 
     * @param dateTime Date
     * @returns string
     */
    static dateFormat(dateTime) {
        let date = dateTime.toDate();
        return moment(date).format('ddd, D MMMM [at] h:mma')
    }

    static jsDateFormat(dateTime) {
        return moment(dateTime).format('ddd, D MMMM [at] h:mma')
    }

    static isImage(fileType) {
        return _.contains(IMAGE_FILE_FORMATS, fileType)
    }

    static isAudio(fileType) {
        return _.contains(AUDIO_FILE_FORMATS, fileType)
    }
    
    static isVideo(fileType) {
        return _.contains(VIDEO_FILE_FORMATS, fileType)
    }

    static getCurrentPosition() {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true, 
                timeout: 15000, 
                maximumAge: 10000
            })
        })
    }

    static async checkPermission(permission) {
        let isPermissionGranted = false
        const result = await check(permission)
        switch (result) {
            case RESULTS.GRANTED:
                isPermissionGranted = true
                break
            case RESULTS.DENIED:
                isPermissionGranted = false
                break
            case RESULTS.BLOCKED:
                isPermissionGranted = false
                break
            case RESULTS.UNAVAILABLE:
                isPermissionGranted = false
                break
        }
        return isPermissionGranted
    }

    static async requestPermission(permission) {
        let isPermissionGranted = false
        const result = await request(permission)
        switch (result) {
            case RESULTS.GRANTED:
                isPermissionGranted = true
                break
            case RESULTS.DENIED:
                isPermissionGranted = false
                break
            case RESULTS.BLOCKED:
                isPermissionGranted = false
                break
            case RESULTS.UNAVAILABLE:
                isPermissionGranted = false
                break
        }
        return isPermissionGranted
    }

    static openSettings() {
        Alert.alert(
            'Location Permission',
            'This App needs access to your location so we can know where you are.',
            [
                {
                    text: 'Go to Settings',
                    onPress: () => {
                        Linking.openSettings()
                    }
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ],
            { cancelable: false }
        )
    }
}

export default MiscHelper