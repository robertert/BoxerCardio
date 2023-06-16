import {createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Alert } from "react-native";

export async function authenticate(email, password) {
     return await signIn(email, password);
 }

async function signIn(email, password) {
    try {
        const response = await createUserWithEmailAndPassword(auth, email, password);
        console.log(response.user.stsTokenManager.accessToken);
        return response.user.stsTokenManager.accessToken;

    } catch (error) {
        Alert.alert("There was an error", "Please try again");
    }    
  }

  