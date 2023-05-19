import firestore from '@react-native-firebase/firestore'
import _ from 'underscore'

export class PatrolShift {
    patrol_shift_id = null
    user_id = null
    company_id = null
    patrol_status = null
    patrol_shift_clients = []
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
    getUserId() {
        return this.user_id
    }
    getCompanyId() {
        return this.company_id
    }
    getPatrolStatus() {
        return this.patrol_status
    }
    getPatrolShiftClients() {
        return this.patrol_shift_clients
    }
    setPatrolShiftClients(patrol_shift_clients) {
        this.patrol_shift_clients = patrol_shift_clients
    }
    getClientsNumber() {
        return _.isArray(this.patrol_shift_clients) 
            ? this.patrol_shift_clients.length 
            : 0
    }
    getTotalChecksNumber() {
        let totalChecks = 0
        this.patrol_shift_clients.forEach(element => {
            if (element.total_checks)
                totalChecks += element.total_checks
        })
        return totalChecks
    }
    getTotalDuration() {
        let durations = []
        this.patrol_shift_clients.forEach(element => {
            if (_.isArray(element.durations)) {
                element.durations.forEach(inner => {
                    durations.push(inner.duration)
                })
            }
        })
        let secondsSum = 0
        durations.forEach(time => {
            const split = time.split(':')
            secondsSum += parseInt(split[0]) * 60
            secondsSum += parseInt(split[1])
        })

        let seconds = Math.floor(secondsSum)
        let minutes = Math.floor(secondsSum / 60)
        let hours = Math.floor(secondsSum / 3600)
        seconds = seconds - minutes * 60
        minutes = minutes - hours * 60

        let formatted = ''
        if (hours > 0)
            formatted += `${hours < 10 ? 0 : ""}${hours}:`
        formatted += `${minutes < 10 ? 0 : ""}${minutes}:${seconds < 10 ? 0 : ""}${seconds}`
        return formatted
    }
}

class PatrolShiftsDb {
    /**
     * Saves patrol shift
     * 
     * @param {PatrolShift} patrolShift
     * @returns Promise 
     */
    static update(patrolShift) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = patrolShift.getData()

                await firestore().collection("patrol_shifts").doc(patrolShift.getPatrolShiftId()).set({
                    ...data
                })

                resolve(true)
            } catch (error) {
                reject(error)
            }
        })
    }
    /**
     * Gets patrol shift
     * 
     * @param patrol_shift_id String
     * @returns Promise
     */
    static getPatrolShift(patrol_shift_id) {
        return new Promise(async (resolve, reject) => {
            try {
                const snapshot = await firestore()
                    .collection('patrol_shifts')
                    .doc(patrol_shift_id)
                    .get()

                const patrolShift = new PatrolShift(snapshot.data())

                resolve(patrolShift)
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default PatrolShiftsDb