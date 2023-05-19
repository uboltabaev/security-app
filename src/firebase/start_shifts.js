import firestore from '@react-native-firebase/firestore'
import moment from 'moment'

export const STATUSES = Object.freeze({
    PENDING: 'pending',
    ON_PROGRESS: 'on-progress',
    COMPLETED: 'completed'
})

export class StartShift {
    start_shift_id = null
    user = null
    patrol_shift_id = null
    company_id = null
    start_date = null
    car_rego = null
    odometer = null
    location = null
    status = null
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
    getStartShiftId() {
        return this.start_shift_id
    }
    getUserId() {
        return this.user ? this.user.user_id : ''
    }
    getUserFirstName() {
        return this.user ? this.user.first_name : ''
    }
    getUserLicenseNumber() {
        return this.user ? this.user.license_number : ''
    }
    getPatrolShiftId() {
        return this.patrol_shift_id
    }
    getCompanyId() {
        return this.company_id
    }
    getStartDate() {
        return this.start_date
    }
    getCarRego() {
        return this.car_rego
    }
    setCarRego(car_rego) {
        this.car_rego = car_rego
    }
    getOdometer() {
        return this.odometer
    }
    setOdometer(odometer) {
        this.odometer = odometer
    }
    getLocation() {
        return this.location
    }
    setLocation(location) {
        const { latitude, longitude } = location
        this.location = new firestore.GeoPoint(latitude, longitude)
    }
    getStatus() {
        return this.status
    }
    setStatus(status) {
        this.status = status
    }
}

class StartShiftsDb {
    /**
     * Get user's start shift
     * 
     * @param user_id String
     * @param status String
     * @returns Promise
     */
    static getUserStartShift(user_id, status = STATUSES.PENDING) {
        return new Promise(async (resolve, reject) => {
            try {
                const dateFrom = moment().toDate()
                dateFrom.setHours(0)
                dateFrom.setMinutes(0)
                dateFrom.setSeconds(0)
                dateFrom.setMilliseconds(0)

                const dateTo = moment().toDate()
                dateTo.setHours(23)
                dateTo.setMinutes(59)
                dateTo.setSeconds(59)
                dateTo.setMilliseconds(999)

                const collection = await firestore()
                    .collection('start_shifts')
                    .where("user.user_id", "==", user_id)
                    .where("start_date", ">", dateFrom)
                    .where("start_date", "<=", dateTo)
                    .where("status", "==", status)
                    .limit(1)
                    .get()

                let startShift = null 
                collection.forEach((documentSnapshot) => {
                    startShift = new StartShift(documentSnapshot.data())
                })

                resolve(startShift)
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Update start shift by doc id
     * 
     * @param doc_id String
     * @param startShift StartShift
     * @returns Promise
     */
    static updateStartShift(doc_id, startShift) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = startShift.getData()
                await firestore().collection("start_shifts").doc(doc_id).update(data)
                resolve(true)
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default StartShiftsDb