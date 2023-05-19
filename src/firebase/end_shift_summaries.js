import firestore from '@react-native-firebase/firestore'

export class EndShiftSummary {
    end_shift_summary_id = null
    patrol_shift_id = null
    user_id = null
    company_id = null
    start_shift_time = null
    end_shift_time = null
    number_of_clients = null
    total_distance = null
    total_duration = null
    total_patrol_logs = null
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
    getEndShiftSummaryId() {
        return this.end_shift_summary_id
    }
    getPatrolShiftId() {
        return this.patrol_shift_id
    }
    getUserId() {
        return this.user_id
    }
    getCompanyId() {
        return this.company_id
    }
    getStartShiftTime() {
        return this.start_shift_time
    }
    getEndShiftTime() {
        return this.end_shift_time
    }
    getNumberOfClients() {
        return this.number_of_clients
    }
    getTotalDistance() {
        return this.total_distance
    }
    getTotalDuration() {
        return this.total_duration
    }
    getTotalPatrolLogs() {
        return this.total_patrol_logs
    }
}

class EndShiftSummariesDb {
    /**
     * Saves End Shift Summary
     * 
     * @param endShiftSummary EndShiftSummary
     * @returns Promise
     */
    static save(endShiftSummary) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = endShiftSummary.getData()
                const ref = firestore().collection('end_shift_summaries').doc()

                await firestore().collection("end_shift_summaries").doc(ref.id).set({
                    ...data,
                    end_shift_summary_id: ref.id,
                })
        
                resolve(ref.id)
            } catch (error) {
                reject(error)
            }
        })
    }
    /**
     * Gets End Shift Summary by doc id
     * 
     * @param {String} docId
     * @returns Promise
     */
    static get(docId) {
        return new Promise(async (resolve, reject) => {
            try {
                const snapshot = await firestore().collection("end_shift_summaries").doc(docId).get()
                const endShiftSummary = new EndShiftSummary(snapshot.data())

                resolve(endShiftSummary)
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default EndShiftSummariesDb