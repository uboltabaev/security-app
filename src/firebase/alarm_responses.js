import firestore from '@react-native-firebase/firestore'

export class AlarmResponse {
    patrol_shift_id = null
    company_id = null
    docket_no = null
    monitoring_station = null
    address = null
    section_activation = null
    job_no = null
    invoice_to = null
    comments = null
    click_to_call = null
    time_onsite = null
    time_offsite = null
    location = null
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
    getPatrolShiftId() {
        return this.patrol_shift_id
    }
    getCompanyId() {
        return this.company_id
    }
    getDocketNo() {
        return this.docket_no
    }
    getMonitoringStation() {
        return this.monitoring_station
    }
    getAddress() {
        return this.address
    }
    getSectionActivation() {
        return this.section_activation
    }
    getJobNo() {
        return this.job_no
    }
    getInvoiceTo() {
        return this.invoice_to
    }
    getComments() {
        return this.comments
    }
    getClickToCall() {
        return this.click_to_call
    }
    getTimeOnsite() {
        return this.time_onsite
    }
    getTimeOffsite() {
        return this.time_offsite
    }
    getLocation() {
        return this.location
    }
    setLocation(location) {
        const { latitude, longitude } = location
        this.location = new firestore.GeoPoint(latitude, longitude)
    }
    getAttachments() {
        return this.attachments
    }
    getCreatedTime() {
        return this.created_times
    }
}

class AlarmResponsesDb {
    /**
     * Saves Alarm Response
     * 
     * @param alarmResponse AlarmResponse
     * @returns Promise
     */
    static save(alarmResponse) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = alarmResponse.getData()
                const ref = firestore().collection('alarm_responses').doc()

                await firestore().collection("alarm_responses").doc(ref.id).set({
                    ...data,
                    alarm_response_id: ref.id,
                })
        
                resolve(ref.id)
            } catch (error) {
                reject(error)
            }
        })
    }
    /**
     * Gets Alarm Response by doc id
     * 
     * @param {String} docId 
     * @returns Promise
     */
    static get(docId) {
        return new Promise(async (resolve, reject) => {
            try {
                const snapshot = await firestore().collection("alarm_responses").doc(docId).get()
                const alarmResponse = new AlarmResponse(snapshot.data())

                resolve(alarmResponse)
            } catch (error) {
                reject(error)
            }
        })
    }
    /**
     * Gets last Alarm response doc by created time
     * 
     * @returns Promise
     */
    static getLastDoc() {
        return new Promise(async (resolve, reject) => {
            try {
                const collection = await firestore()
                    .collection('alarm_responses')
                    .orderBy('created_time', 'desc')
                    .limit(1)
                    .get()

                let alarmResponse = null
                collection.forEach(doc => {
                    alarmResponse = new AlarmResponse(doc.data())
                })

                resolve(alarmResponse)
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default AlarmResponsesDb