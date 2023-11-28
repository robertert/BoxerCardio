import { useContext, useState } from "react";
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
import ButtonPrim from "../UI/ButtonPrim";
import { authenticate } from "../../util/auth";
import * as SplashScreen from "expo-splash-screen";
import { AuthContext } from "../../store/auth-context";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../store/user-context";
import { SettingsContext } from "../../store/settings-context";

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
  const [isLoading, setIsLoading] = useState(false);

  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);
  const settingsCtx = useContext(SettingsContext);
  const navigation = useNavigation();

  const usernameChangeHandler = (enteredUsername) => {
    setInvaildUsername(false);
    setUsername(enteredUsername);
    authCtx.changeMessage("");
  };
  const emailChangeHandler = (enteredEmail) => {
    setInvalidEmail(false);
    setEmail(enteredEmail);
    authCtx.changeMessage("");
  };
  const passwordChangeHandler = (enteredPassword) => {
    setInvalidPassword(false);
    setPassword(enteredPassword);
    authCtx.changeMessage("");
  };

  const confirmPasswordChangeHandler = (enteredConfirmPassword) => {
    setInvalidConfirmPassword(false);
    setConfirmPassword(enteredConfirmPassword);
    authCtx.changeMessage("");
  };

  function isAlphanumeric(str) {
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  function validateRegister() {
    if (
      username.trim().length < 2 ||
      !isAlphanumeric(username) ||
      username.trim().length > 15
    ) {
      // dodac czy unikalna
      setInvaildUsername(true);
      authCtx.changeMessage(
        "Username should be at least 2 characters long and contain only letters and numbers"
      );
      return false;
    }
    if (
      !email.includes("@") ||
      !email.includes(".")
      // dodac czy email jest zajety
    ) {
      setInvalidEmail(true);
      authCtx.changeMessage("Wrong email");
      return false;
    }
    if (password.trim().length < 8) {
      setInvalidPassword(true);
      authCtx.changeMessage("Password should contain at least 8 characters");
      return false;
    }
    if (password.trim() != confirmPassword.trim()) {
      setInvalidConfirmPassword(true);
      authCtx.changeMessage("Password don't match");
      return false;
    }

    return true;
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
    authCtx.changeMessage("");
  }

  function resetPasswordHandler() {
    navigation.navigate("resetPassword");
  }

  async function submitRegisterHandler() {
    if (validateRegister()) {
      setIsLoading(true);
      await authenticate(
        "signIn",
        email.trim(),
        password.trim(),
        authCtx,
        userCtx,
        username.trim(),
        settingsCtx
      );
      setIsLoading(false);
    }
  }

  async function logInHandler() {
    setIsLoading(true);
    await authenticate(
      "logIn",
      email.trim(),
      password.trim(),
      authCtx,
      userCtx,
      settingsCtx
    );
    setIsLoading(false);
  }

  SplashScreen.preventAutoHideAsync();
  if (!isLoading) {
    SplashScreen.hideAsync();
  }

  if (toggleScreen) {
    return (
      <View style={styles.rootContainer}>
        <ScrollView style={styles.scrollview}>
          <View style={styles.innerContainer}>
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
                maxLength={12}
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
            <Text style={styles.invalidMessage}>{authCtx.message}</Text>
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
            <View>
              <Image
                source={require("../../assets/icon.png")}
                style={styles.image}
              />
            </View>
            <View style={styles.imputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
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
            </View>
            <Text style={styles.invalidMessage}>{authCtx.message}</Text>
            <ButtonPrim text="Log in" onPress={logInHandler} />
            <Pressable
              onPress={resetPasswordHandler}
              style={({ pressed }) => pressed && { opacity: 0.4 }}
            >
              <Text style={[styles.label, { marginTop: 30 }]}>
                Forgot your password? Click here
              </Text>
            </Pressable>
            <Pressable
              onPress={toggleScreenPressHandler}
              style={({ pressed }) => pressed && { opacity: 0.4 }}
            >
              <Text style={[styles.label, { marginTop: 5 }]}>
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
