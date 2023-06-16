import { SafeAreaView, StyleSheet, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import AuthScreen from "./screens/AuthScreen";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Header from "./components/UI/Header";
import AuthContextProvider from "./store/auth-context";

const Tab = createMaterialBottomTabNavigator();

function Auth() {
  return <AuthScreen />;
}

function Authenticated() {
  return <Text>TEST</Text>;
}

SplashScreen.preventAutoHideAsync();
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthContextProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ header: () => {} }}>
            <Stack.Screen name="auth" component={Auth} />
            <Stack.Screen name="authenticated" component={Authenticated} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </AuthContextProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
