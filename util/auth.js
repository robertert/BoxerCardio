import { createUserWithEmailAndPassword, signInWithEmailAndPassword,signInWithCustomToken } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Alert } from "react-native";
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../firebaseConfig";



export async function authenticate(mode, email, password, authCtx, userCtx, name) {
  if (mode === "signIn") {
    return await signIn(email, password,authCtx,userCtx, name);
  } else {
    return await logIn(email,password,authCtx,userCtx);
  }
}

async function signIn(email, password,authCtx,userCtx, name) {
  try {
    const response = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const newUser = await addDoc(collection(db,"users"),{
      name: name,
      photoUrl: "url",
      email: email,
      friends: [],
      pending: [],
      incoming: [],
      trainingGroups: [],
      achivements: [],
      postsPreview: [],
      lastLogin: new Date(),
      createdAt: new Date(),
    });


    userCtx.getUser(name,photoUrl,newUser.id);

    return response.user.stsTokenManager.accessToken;
  } catch (error) {
    if(error.code === "auth/email-already-in-use"){
        authCtx.changeMessage("This email is taken");
    }
    else{
        Alert.alert("Error","Error please try again later")
    }
    console.log(error.code);    
  }
}
async function logIn(email,password,authCtx ,userCtx) {
  
    try {
        const response = await signInWithEmailAndPassword(auth,email,password);
        const q = query(collection(db,"users"),where("email","==",email))
        const user = await getDocs(q);
        const readyUser = {id: user.docs[0].id, ...user.docs[0].data()};
        userCtx.getUser(readyUser.name,readyUser.photoUrl,readyUser.id);
        await updateDoc(doc(db,`users/${readyUser.id}`),{lastLogin: new Date()})

        return response._tokenResponse.idToken;
    } catch (e) {
        if(e.code === 'auth/wrong-password'){
            authCtx.changeMessage("Wrong password");
        }
        else{
          Alert.alert("There was an error", "Please try again");
        }
        console.log(e.message);
    }
}
