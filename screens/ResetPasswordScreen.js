import { View, StyleSheet, Text, TextInput } from "react-native";
import Header from "../components/UI/Header";
import { useState } from "react";
import ButtonPrim from "../components/UI/ButtonPrim";
import Colors from "../constants/colors";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useTranslation } from "react-i18next";

function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [message,setMessage] = useState('');

  const {t} = useTranslation();

  const emailChangeHandler = (enteredEmail) => {
    setMessage('');
    setInvalidEmail(false);
    setEmail(enteredEmail);
  };

  const sendHandler = async () => {
    try {     
     await sendPasswordResetEmail(auth,email);
      navigation.navigate("auth");
    } catch (error) {
        if(error.code === 'auth/invalid-email'){
            setMessage(t("Invalid email"));
        }
        else{
            setMessage(t("Error message"));
        }
        //console.log(error.code);
    }
  };

  const backHandler = () =>{
    navigation.goBack();
  }

  return (
    <View style={styles.rootContainer}>
      <Header settings={false} back={true} onPress={backHandler}/>
      <View style={styles.inner}>
        <View style={styles.inputContainer}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, invalidEmail && styles.invalid]}
        onChangeText={emailChangeHandler}
        value={email}
      />
      </View>
      <Text style={styles.invalidMessage}>{message}</Text>
      <ButtonPrim text={t("Send")} onPress={sendHandler} />
      </View>
    </View>
  );
}

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.primary700,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    width: '70%',
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
