import firestore from '@react-native-firebase/firestore'

class User {
    user_id = null
    first_name = null
    last_name = null
    email = null
    phone = null
    security_license = null
    company_id = null
    constructor(data) {
        this.setValues(data)
    }
    setValues(data) {
        for (let prop in data) {
            if (this.hasOwnProperty(prop))
                this[prop] = data[prop]
        }
    }
    getUserId() {
        return this.user_id
    }
    getFirstName() {
        return this.first_name
    }
    getLastName() {
        return this.last_name
    }
    getEmail() {
        return this.email
    }
    getPhone() {
        return this.phone
    }
    getSecurityLicense() {
        return this.security_license
    }
    getCompanyId() {
        return this.company_id
    }
}

class UsersDb {
    /**
     * Gets user
     * @returns Promise
     */
    static getUser(uid) {
        return new Promise(async (resolve, reject) => {
            try {
                const get = await firestore()
                    .collection('users')
                    .doc(uid)
                    .get()

                const user = new User(get.data())
                resolve(user)

            } catch (error) {
                reject(error)
            }
        })
    }
}

export default UsersDb