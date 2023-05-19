import storage from '@react-native-firebase/storage'

class AppStorage {
    /**
     * Uploads file to Cloud Storage
     * 
     * @param fileName 
     * @returns Promise
     */
    static upload(fileName) {
        return new Promise(async (resolve, reject) => {
            try {
                const reference = storage().ref('black-t-shirt-sm.png');
                const task = reference.putFile(fileName)
                task.on('state_changed', taskSnapshot => {
                    const percentage = (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100;
                    console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`)
                })
                task.then(() => {
                    console.log('Image uploaded to the bucket!');
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default AppStorage