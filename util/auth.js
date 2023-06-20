import { createUserWithEmailAndPassword, signInWithEmailAndPassword,signInWithCustomToken } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Alert } from "react-native";




export async function authenticate(mode, email, password,authCtx) {
  if (mode === "signIn") {
    return await signIn(email, password,authCtx);
  } else {
    return await logIn(email,password,authCtx);
  }
}

async function signIn(email, password,authCtx) {
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
async function logIn(email,password,authCtx) {
  
    try {
        const response = await signInWithEmailAndPassword(auth,email,password);
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
