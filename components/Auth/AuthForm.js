import { useContext, useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import Colors from "../../constants/colors";
import Header from "../UI/Header";
import ButtonPrim from "../UI/ButtonPrim";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../store/auth-context";
import AppLoading from 'expo-app-loading';
import { authenticate } from "../../util/auth";
import * as SplashScreen from 'expo-splash-screen';

function AuthForm() {
  const [username, setUsername] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [invalidUsername, setInvaildUsername] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [invalidConfirmPassword, setInvalidConfirmPassword] = useState(false);
  const [toggleScreen, setToggleScreen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading,setIsLoading] = useState(false);


  const navigation = useNavigation();

  const authCtx = useContext(AuthContext);


  
  const usernameChangeHandler = (enteredUsername) => {
    setInvaildUsername(false);
    setUsername(enteredUsername);
    setMessage("");
  };
  const emailChangeHandler = (enteredEmail) => {
    setInvalidEmail(false);
    setEmail(enteredEmail);
    setMessage("");
  };
  const passwordChangeHandler = (enteredPassword) => {
    setInvalidPassword(false);
    setPassword(enteredPassword);
    setMessage("");
  };

  const confirmPasswordChangeHandler = (enteredConfirmPassword) => {
    setInvalidConfirmPassword(false);
    setConfirmPassword(enteredConfirmPassword);
    setMessage("");
  };

  function isAlphanumeric(str) {
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  async function validateRegister() {
    if (username.trim().length < 6 || !isAlphanumeric(username)) {
      // dodac czy unikalna
      setInvaildUsername(true);
      setMessage(
        "Username should be at least 6 characters long and contain only letters and numbers"
      );
      return false;
    }
    if (
      !email.includes("@") ||
      !email.includes(".")
      // dodac czy email jest zajety
    ) {
      setInvalidEmail(true);
      setMessage("Wrong email");
      return false;
    }
    if (password.trim().length < 8) {
      setInvalidPassword(true);
      setMessage("Password should contain at least 8 characters");
      return false;
    }
    if (password.trim() != confirmPassword.trim()) {
      setInvalidConfirmPassword(true);
      setMessage("Password don't match");
      return false;
    }
    
    return true;
  }

  function validateLogin(){
    if(username.trim().length > 6 && password.trim().length > 8 && isAlphanumeric(username)){
      
    }
  }



  function toggleScreenPressHandler() {
    setToggleScreen((prev) => !prev);
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setInvaildUsername(false);
    setInvalidConfirmPassword(false);
    setInvalidEmail(false);
    setInvalidPassword(false);
  }

   async function submitRegisterHandler() {
    if (validateRegister()) {
      setIsLoading(true);
      const token = await authenticate(email,password);
      authCtx.authenticate(token);
      setIsLoading(false);
      navigation.replace("authenticated");
    }
  }
  SplashScreen.preventAutoHideAsync();
  if(!isLoading){
    SplashScreen.hideAsync();
  }


  if (toggleScreen) {
    return (
      <View style={styles.rootContainer}>
          <ScrollView style={styles.scrollview}>
            <View style={styles.innerContainer}>
            <Header />
            <View>
              <Image
                source={require("../../assets/icon.png")}
                style={styles.image}
              />
            </View>
            <View style={styles.imputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={[styles.input, invalidUsername && styles.invalid]}
                onChangeText={usernameChangeHandler}
                value={username}
              />
              <Text style={styles.label}>Email</Text>
              <TextInput
                keyboardType="email-address"
                style={[styles.input, invalidEmail && styles.invalid]}
                onChangeText={emailChangeHandler}
                value={email}
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, invalidPassword && styles.invalid]}
                onChangeText={passwordChangeHandler}
                value={password}
              />
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[styles.input, invalidConfirmPassword && styles.invalid]}
                onChangeText={confirmPasswordChangeHandler}
                value={confirmPassword}
              />
            </View>
            <Text style={styles.invalidMessage}>{message}</Text>
            <ButtonPrim text="Sign up" onPress={submitRegisterHandler} />
            <Pressable
              onPress={toggleScreenPressHandler}
              style={({ pressed }) => pressed && { opacity: 0.4 }}
            >
              <Text style={[styles.label, { marginTop: 30 }]}>
                Already have an account? Log in
              </Text>
            </Pressable>
            
            </View>
          </ScrollView>
      </View>
    );
  } else {
    return (
      <View style={styles.rootContainer}>
          <ScrollView style={styles.scrollview}>
            <View style={styles.innerContainer}>
            <Header />
            <View>
              <Image
                source={require("../../assets/icon.png")}
                style={styles.image}
              />
            </View>
            <View style={styles.imputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={[styles.input, invalidUsername && styles.invalid]}
                onChangeText={usernameChangeHandler}
                value={username}
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, invalidPassword && styles.invalid]}
                onChangeText={passwordChangeHandler}
                value={password}
              />
            </View>
            <ButtonPrim text="Log in" />
            <Pressable
              onPress={toggleScreenPressHandler}
              style={({ pressed }) => pressed && { opacity: 0.4 }}
            >
              <Text style={[styles.label, { marginTop: 30 }]}>
                Don't have an account? Create a new one
              </Text>
            </Pressable>
            </View>
          </ScrollView>
      </View>
    );
  }
}

export default AuthForm;

const styles = StyleSheet.create({
  scrollview: {
    flex: 1,
  },

  innerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },

  rootContainer: {
    flex: 1,
    backgroundColor: Colors.primary700,
  },
  image: {
    marginTop: 40,
    height: 150,
    width: 150,
    borderRadius: 75,
    margin: 20,
  },
  imputContainer: {
    marginTop: 20,
    width: "75%",
  },
  input: {
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.primary400,
    borderRadius: 15,
    height: 32,
    color: Colors.primary100,
  },
  label: {
    color: Colors.primary400,
    fontSize: 17,
    marginBottom: 4,
    fontWeight: "700",
  },

  invalid: {
    backgroundColor: Colors.accent500_40,
    borderWidth: 1,
    borderColor: Colors.accent500,
  },
  invalidMessage: {
    marginHorizontal: 30,
    color: Colors.accent500,
    fontSize: 17,
    fontWeight: "700",
  },
});
