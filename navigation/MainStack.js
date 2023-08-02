import Comment from "../components/MainScreen/Comments";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Authenticated from "./Authenticated";
import TrainingGroups from "../components/Friends/TrainingGroups";
import TrainingGroupForm from "../components/Friends/TrainingGroups/TrainingGroupForm";
import AddNewMemberForm from "../components/Friends/TrainingGroups/AddNewMemberForm";

const Stack = createNativeStackNavigator();

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="mainPage" component={Authenticated} />
      <Stack.Screen name="comment" component={Comment} />
      <Stack.Screen name="training-groups" component={TrainingGroups}/>
      <Stack.Screen name="training-group-form" component={TrainingGroupForm}/>
      <Stack.Screen name="add-new-member-form" component={AddNewMemberForm}/>
    </Stack.Navigator>
  );
}

export default MainStack;
