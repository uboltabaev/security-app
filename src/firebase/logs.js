import firestore from '@react-native-firebase/firestore'

export class Log {
    log_id = null
    error = null
    created_time = null
    constructor(data) {
        this.setValues(data)
    }
    setValues(data) {
        for (let prop in data) {
            if (this.hasOwnProperty(prop))
                this[prop] = data[prop]
        }
    }
    getLogId() {
        return this.log_id
    }
    getError() {
        return this.error
    }
    getCreatedTime() {
        return this.created_time
    }
}

class LogsDb {
    /**
     * Saves Log
     * 
     * @param error Any
     * @returns Promise
     */
    static saveLog(error) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = {
                    error, 
                    created_time: new Date()
                }
                const ref = firestore().collection('logs').doc()

                await firestore().collection("logs").doc(ref.id).set({
                    ...data,
                    log_id: ref.id,
                })
        
                resolve(ref.id)
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default LogsDb