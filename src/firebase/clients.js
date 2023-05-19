import firestore from '@react-native-firebase/firestore'

export class Client {
    client_id = null
    name = null
    company_id = null
    address = null
    details = null
    keyholders = []
    patrols_conducted = null
    primary_contact = null
    shift_patrol_no = null
    start_patrol = null
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
    getClientId() {
        return this.client_id
    }
    getName() {
        return this.name
    }
    getCompanyId() {
        return this.company_id
    }
    getCountry() {
        return this.address ? this.address.country : ''
    }
    getPostcode() {
        return this.address ? this.address.postcode : ''
    }
    getState() {
        return this.address ? this.address.state : ''
    }
    getStreetName() {
        return this.address ? this.address.street_name : ''
    }
    getStreetNo() {
        return this.address ? this.address.street_no : ''
    }
    getStreetType() {
        return this.address ? this.address.street_type : ''
    }
    getSuburb() {
        return this.address ? this.address.suburb : ''
    }
    getUnitNo() {
        return this.address ? this.address.unit_no : ''
    }
    getInstructions() {
        return this.details ? this.details.instructions : ''
    }
    getLocation() {
        return this.details ? this.details.location : ''
    }
    getRadius() {
        return this.details ? this.details.radius : ''
    }
    getVisitsPerShift() {
        return this.details ? this.details.visits_per_shift : ''
    }
    getKeyholders() {
        return this.keyholders
    }
    getPatrolsConducted() {
        return this.patrols_conducted
    }
    getEmail() {
        return this.primary_contact ? this.primary_contact.email : ''
    }
    getFirstName() {
        return this.primary_contact ? this.primary_contact.first_name : ''
    }
    getLastName() {
        return this.primary_contact ? this.primary_contact.last_name : ''
    }
    getFullName() {
        return this.primary_contact ? this.primary_contact.first_name + ' ' + this.primary_contact.last_name : ''
    }
    getPhone() {
        return this.primary_contact ? this.primary_contact.phone : ''
    }
    getShiftPatrolNo() {
        return this.shift_patrol_no
    }
    getStartPatrol() {
        return this.start_patrol
    }
    getAddressLine() {
        const address = this.address ? [
            this.address.unit_no,
            this.address.street_no,
            this.address.street_name,
            this.address.street_type,
            this.address.suburb,
            this.address.postcode
        ] : []
        return address.join(' ')
    }
}

class ClientsDb {
    /**
     * Gets client
     * 
     * @param client_id String
     * @returns Promise
     */
    static getClient(client_id) {
        return new Promise(async (resolve, reject) => {
            try {
                const get = await firestore()
                    .collection('clients')
                    .doc(client_id)
                    .get()

                const client = new Client(get.data())

                resolve(client)
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default ClientsDb