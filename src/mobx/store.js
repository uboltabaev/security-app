import { makeAutoObservable, observable } from 'mobx';

class Store {
    isSignedIn = false
    uid = null
    user = null
    startShift = null
    patrolShift = null

    constructor() {
        makeAutoObservable(this, {
            isSignedIn: observable,
            uid: observable,
            user: observable,
            startShift: observable,
            patrolShift: observable
        })
    }

    setIsSignedIn = (v) => this.isSignedIn = v

    setValues = (vs) => {
        for (let prop in vs) {
            if (this.hasOwnProperty(prop))
                this[prop] = vs[prop];
        }
    }
}

export default Store