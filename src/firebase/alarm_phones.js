import firestore from '@react-native-firebase/firestore'

export class AlarmPhone {
    alarm_phone_id = null
    company_id = null
    phone_numbers = []
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
    getAlarmPhoneId() {
        return this.alarm_phone_id
    }
    getCompanyId() {
        return this.company_id
    }
    getPhoneNumbers() {
        return this.phone_numbers
    }
}

class AlarmPhonesDb {
    /**
     * Gets Alarm Phones
     * 
     * @param company_id String
     * @returns Promise
     */
    static getAlarmPhones(company_id) {
        return new Promise(async (resolve, reject) => {
            try {
                const collection = await firestore()
                    .collection('alarm_phones')
                    .where('company_id', '==', company_id)
                    .get()

                let alarmPhone = null
                collection.forEach(doc => {
                    alarmPhone = new AlarmPhone(doc.data())
                })
        
                resolve(alarmPhone)
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default AlarmPhonesDb