import { auth } from "../firebaseConfig";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useContext } from "react";
import { AuthContext } from "../store/auth-context";
import AuthStack from "./AuthStack";
import Colors from "../constants/colors";

import { View } from "react-native";
import MainStack from "./MainStack";

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
    <View
        style={styles.root}
      >
    <NavigationContainer>
      <StatusBar style="light" />
      
        {authCtx.isAuth && <MainStack />}
        {!authCtx.isAuth && <AuthStack />} 
    </NavigationContainer>
    </View>
  );
}

export default RootNavigation;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary500,
  },
});
