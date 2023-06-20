import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import AuthScreen from "../screens/AuthScreen";

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ header: () => {} }}>
      <Stack.Screen name="auth" component={AuthScreen} />
      <Stack.Screen name="resetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

export default AuthStack;