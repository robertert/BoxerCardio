import { auth, db } from "../firebaseConfig";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useContext } from "react";
import { AuthContext } from "../store/auth-context";
import AuthStack from "./AuthStack";
import Colors from "../constants/colors";

import { View } from "react-native";
import MainStack from "./MainStack";
import { UserContext } from "../store/user-context";
import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { SettingsContext } from "../store/settings-context";
import { useTranslation } from "react-i18next";

function RootNavigation() {
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);
  const settingsCtx = useContext(SettingsContext);

  const {i18n} = useTranslation();


  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      async function auth() {
        const userDb = await getDocs(
          query(collection(db, `users`), where("email", "==", user.email))
        );
        const gotUser = { id: userDb.docs[0].id, ...userDb.docs[0].data() };
        userCtx.getUser(gotUser.name, gotUser.photoUrl, gotUser.id);
        settingsCtx.getPermissions(gotUser.permissions);
        settingsCtx.getSettings(...gotUser.settings);
        i18n.changeLanguage(gotUser.settings.language);
      }
      if (user) {
        authCtx.authenticate(user.stsTokenManager.accessToken);
        auth();
      } else {
        authCtx.logout();
      }
    });
  }, []);

  return (
    <View style={styles.root}>
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
