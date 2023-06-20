import { auth } from "../firebaseConfig";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useContext} from "react";
import { AuthContext } from "../store/auth-context";
import Authenticated from "./Authenticated";
import AuthStack from "./AuthStack";

function RootNavigation() {
  const authCtx = useContext(AuthContext);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        authCtx.authenticate(user.stsTokenManager.accessToken);
      } else {
        authCtx.logout();
      }
    });
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <NavigationContainer>
        {authCtx.isAuth && <Authenticated />}
        {!authCtx.isAuth && <AuthStack />}
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default RootNavigation;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
