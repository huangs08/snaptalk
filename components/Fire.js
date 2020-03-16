import FirebaseKeys from "./config";
import firebase from 'firebase';
require("firebase/firestore");

class Fire {

    constructor() {
        firebase.initializeApp(FirebaseKeys);
    }


    addPost = async({text, localUri}) => {
        const remoteUri = await this.uploadPhotoAsync(localUri, 'photos/'+this.uid+'/'+Date.now());

        const user = await firebase.firestore().collection("users").doc(this.uid).get();

        const fieldPath = new firebase.firestore.FieldPath('name');

        const userAgain = await firebase.firestore().collection("users").doc(this.uid).get();

        const fieldPath2 = new firebase.firestore.FieldPath('profilePicture');

        return new Promise((res, rej) => {
            this.firestore.collection("posts").add({
                text,
                uid: this.uid,
                timestamp: this.timestamp,
                image: remoteUri,
                username: user.get(fieldPath),
                avatar: userAgain.get(fieldPath2)
            })
            .then( ref=> {
                res(ref);
            })
            .catch(error => {
                rej(error);
            })
        })
    };


    createUser = async user => {
        let remoteAvatarUri = null

        try{

            await firebase.auth().createUserWithEmailAndPassword(user.email, user.password).catch(error => re.setState({errorMessage: error.message}));

            let db = this.firestore.collection("users").doc(this.uid);

            db.set({
                name: user.name,
                email: user.email,
                listOfFollowers: [],
                listOfFollowing: [],
                listOfPosts: [],
                profilePicture: remoteAvatarUri
            });

            if(user.avatar)
            {
                remoteAvatarUri = await this.uploadPhotoAsync(user.avatar, 'avatar/'+this.uid);
                db.set({profilePicture: remoteAvatarUri}, {merge: true})
            }

        } catch(error){
            alert("Error: Format is wrong.");
       }
    }

    uploadPhotoAsync = async (uri, filename) => {

        return new Promise(async (res, rej) => {
            const response = await fetch(uri);
            const file = await response.blob();

            let upload = firebase
                .storage()
                .ref(filename)
                .put(file);

            upload.on("state_changed", snapshot => {}, err => {
                rej(err);
            },
            async () => {
                const url = await upload.snapshot.ref.getDownloadURL();
                res(url);
            }
        );
    });
};
    

    get firestore(){
        return firebase.firestore();
    }

    get uid() {
        return (firebase.auth().currentUser || {}).uid;
    }

    get timestamp() {
        return Date.now();
    }
}




Fire.shared = new Fire();
export default Fire;