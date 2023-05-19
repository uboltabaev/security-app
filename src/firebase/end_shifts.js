import firestore from '@react-native-firebase/firestore'

export class EndShift {
    end_shift_id = null
    patrol_shift_id = null
    user_id = null
    odometer = null
    comments = null
    company_id = null
    end_date = null
    location = null
    attachments = []
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
    getEndShiftId() {
        return this.end_shift_id
    }
    getPatrolShiftId() {
        return this.patrol_shift_id
    }
    getUserId() {
        return this.user_id
    }
    getOdometer() {
        return this.odometer
    }
    getComments() {
        return this.comments
    }
    getCompanyId() {
        return this.company_id
    }
    getEndDate() {
        return this.end_date
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
}

class EndShiftsDb {
    /**
     * Saves End Shift
     * 
     * @param endShift EndShift
     * @returns Promise
     */
    static save(endShift) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = endShift.getData()
                const ref = firestore().collection('end_shifts').doc()

                await firestore().collection("end_shifts").doc(ref.id).set({
                    ...data,
                    end_shift_id: ref.id,
                })
        
                resolve(ref.id)
            } catch (error) {
                reject(error)
            }
        })
    }
    /**
     * Gets End Shift by doc id
     * 
     * @param {String} docId
     * @returns Promise
     */
    static get(docId) {
        return new Promise(async (resolve, reject) => {
            try {
                const snapshot = await firestore().collection("end_shifts").doc(docId).get()
                const endShift = new EndShift(snapshot.data())

                resolve(endShift)
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default EndShiftsDb