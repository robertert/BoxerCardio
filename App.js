import { SafeAreaView, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import AuthScreen from "./screens/AuthScreen";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthContextProvider, { AuthContext } from "./store/auth-context";
import { useEffect, useContext, useState } from "react";
import MainScreen from "./screens/MainScreen";
import { auth } from "./firebaseConfig";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";

const Tab = createMaterialBottomTabNavigator();
SplashScreen.preventAutoHideAsync();
const Stack = createNativeStackNavigator();

function Auth() {
  return (
    <Stack.Navigator screenOptions={{ header: () => {} }}>
      <Stack.Screen name="auth" component={AuthScreen} />
      <Stack.Screen name="resetPassword" component={ResetPasswordScreen}/>
    </Stack.Navigator>
  );
}

function Authenticated() {
  return (
    <Stack.Navigator screenOptions={{ header: () => {} }}>
      <Stack.Screen name="authenticated" component={MainScreen} />
    </Stack.Navigator>
  );
}

function Root() {
  const authCtx = useContext(AuthContext);


  useEffect(()=>{
    auth.onAuthStateChanged((user)=>{
      if(user){
        authCtx.authenticate(user.stsTokenManager.accessToken);
      }else{
        authCtx.logout();
      }
    })    
  },[])


  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <NavigationContainer>
        {authCtx.isAuth && <Authenticated />}
        {!authCtx.isAuth && <Auth />}
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthContextProvider>
      <Root />
    </AuthContextProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
