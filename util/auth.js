import { createUserWithEmailAndPassword, signInWithEmailAndPassword,signInWithCustomToken } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Alert } from "react-native";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";



export async function authenticate(mode, email, password, authCtx, userCtx, name, photoUrl) {
  if (mode === "signIn") {
    return await signIn(email, password,authCtx,userCtx, name, photoUrl);
  } else {
    return await logIn(email,password,authCtx,userCtx);
  }
}

async function signIn(email, password,authCtx,userCtx, name, photoUrl) {
  try {
    const response = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await addDoc(collection(db,"users"),{
      name: name,
      photoUrl: photoUrl,
      email: email,
      friends: [],
      lastLogin: new Date(),
    });

    userCtx.getUser(name,photoUrl);

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


        const user = await getDocs(query(collection(db,"users")),where("email","==",email));
        let logedUser;
        user.forEach((use)=>{logedUser = {id: use.id ,...use.data()}});
        userCtx.getUser(logedUser.name,logedUser.photoUrl);


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
