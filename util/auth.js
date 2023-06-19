import { createUserWithEmailAndPassword, signInWithEmailAndPassword,signInWithCustomToken } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Alert } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../store/auth-context";



export async function authenticate(mode, email, password) {
    const authCtx = useContext(AuthContext);
  if (mode === "signIn") {
    return await signIn(email, password);
  } else {
    return await logIn(email,password);
  }
}

async function signIn(email, password) {
  try {
    const response = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

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
async function logIn(email,password) {
    try {
        const response = await signInWithEmailAndPassword(auth,email,password);
        return response._tokenResponse.idToken;
    } catch (e) {
        if(e.code === 'auth/wrong-password'){
            authCtx.changeMessage("Wrong password");
        }
        Alert.alert("There was an error", "Please try again");
        console.log(e.message);
    }
}
