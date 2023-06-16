import { View, StyleSheet } from "react-native";
import AuthForm from "../components/Auth/AuthForm";

function AuthScreen() {
  return <View style={styles.rootContainer}><AuthForm/></View>;
}

export default AuthScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
});
