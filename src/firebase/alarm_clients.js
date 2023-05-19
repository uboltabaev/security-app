import firestore from '@react-native-firebase/firestore'

export class AlarmClient {
    alarm_client_id = null
    company_id = null
    clients = []
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
    getAlarmClientId() {
        return this.alarm_client_id
    }
    getCompanyId() {
        return this.company_id
    }
    getClients() {
        return this.clients
    }
}

class AlarmClientsDb {
    /**
     * Gets Alarm Phones
     * 
     * @param company_id String
     * @returns Promise
     */
    static getAlarmClients(company_id) {
        return new Promise(async (resolve, reject) => {
            try {
                const collection = await firestore()
                    .collection('alarm_clients')
                    .where('company_id', '==', company_id)
                    .get()

                let alarmClient = null
                collection.forEach(doc => {
                    alarmClient = new AlarmClient(doc.data())
                })
        
                resolve(alarmClient)
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default AlarmClientsDb