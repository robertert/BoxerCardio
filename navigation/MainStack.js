import Comment from "../components/MainScreen/Comments";
import Report from "../components/MainScreen/Report";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Authenticated from "./Authenticated";

const Stack = createNativeStackNavigator();

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="mainPage" component={Authenticated} />
      <Stack.Screen name="comment" component={Comment} />
      <Stack.Screen name="report" component={Report} />
    </Stack.Navigator>
  );
}

export default MainStack;
