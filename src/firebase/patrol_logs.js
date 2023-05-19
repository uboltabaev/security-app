import firestore from '@react-native-firebase/firestore'

export class PatrolLog {
    patrol_log_id = null
    patrol_shift_id = null
    client_id = null
    client_name = null
    company_id = null
    comments = null
    start_date_time = null
    end_start_time = null
    duration = null
    location = null
    click_to_call = []
    timer_activity = []
    attachments = []
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
    getData() {
        return Object.assign({}, this)
    }
    getPatrolLogId() {
        return this.patrol_log_id
    }
    getPatrolShiftId() {
        return this.patrol_shift_id
    }
    getClientId() {
        return this.client_id
    }
    getClientName() {
        return this.client_name
    }
    getCompanyId() {
        return this.company_id
    }
    getComments() {
        return this.comments
    }
    getStartDateTime() {
        return this.start_date_time
    }
    getEndStartTime() {
        return this.end_start_time
    }
    getDuration() {
        return this.duration
    }
    getLocation() {
        return this.location
    }
    setLocation(location) {
        const { latitude, longitude } = location
        this.location = new firestore.GeoPoint(latitude, longitude)
    }
    getClickToCall() {
        return this.click_to_call
    }
    getTimerActivity() {
        return this.timer_activity
    }
    getAttachments() {
        return this.attachments
    }
    getCreatedTime() {
        return this.created_time
    }
}

class PatrolLogsDb {
    /**
     * Saves Patrol Log
     * 
     * @param patrolLog PatrolLog
     * @returns Promise
     */
    static save(patrolLog) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = patrolLog.getData()
                const ref = firestore().collection('patrol_logs').doc()

                await firestore().collection("patrol_logs").doc(ref.id).set({
                    ...data,
                    patrol_log_id: ref.id,
                })
        
                resolve(ref.id)
            } catch (error) {
                reject(error)
            }
        })
    }
    /**
     * Gets Patrol Logs by doc id
     * 
     * @param {String} docId
     * @returns Promise
     */
    static get(docId) {
        return new Promise(async (resolve, reject) => {
            try {
                const snapshot = await firestore().collection("patrol_logs").doc(docId).get()
                const patrolLog = new PatrolLog(snapshot.data())

                resolve(patrolLog)
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default PatrolLogsDb