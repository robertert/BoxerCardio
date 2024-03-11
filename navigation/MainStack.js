import Comment from "../components/MainScreen/Comments";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Authenticated from "./Authenticated";
import TrainingGroups from "../components/Friends/TrainingGroups";
import TrainingGroupForm from "../components/Friends/TrainingGroups/TrainingGroupForm";
import AddNewMemberForm from "../components/Friends/TrainingGroups/AddNewMemberForm";
import TrainingGroupDetails from "../components/Friends/TrainingGroups/TrainingGroupDetails";
import TrainingGroupSettings from "../components/Friends/TrainingGroups/TrainingGroupSettings";
import TrainingGroupStats from "../components/Friends/TrainingGroups/TrainingGroupStats";
import PostsDisplayDetails from "../components/Profile/PostsDisplayDetails";
import AchivementsDisplayDetails from "../components/Profile/AchivementsDisplayDetails";
import FriendsDisplay from "../components/Profile/FriendsDisplay";
import EditShelf from "../components/Profile/EditShelf";
import ChartDisplayDetails from "../components/Profile/ChartDisplayDetails";
import ProfileStats from "../components/Profile/ProfileStats";
import EditProfile from "../components/Profile/EditProfile";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import FriendProfileScreen from "../screens/FriendProfileScreen";
import Settings from "../components/MainScreen/Settings";
import MemberList from "../components/Friends/TrainingGroups/MemberList";
import AchivementModal from "../components/UI/AchievementModal";
import { View } from "react-native";

const Stack = createNativeStackNavigator();

function MainStack() {
  return (
    <View style={{flex: 1,justifyContent: "flex-end"}}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="mainPage" component={Authenticated} />
      <Stack.Screen name="reset-password" component={ResetPasswordScreen}/>
      <Stack.Screen name="comment" component={Comment} />
      <Stack.Screen name="training-groups" component={TrainingGroups}/>
      <Stack.Screen name="training-group-form" component={TrainingGroupForm}/>
      <Stack.Screen name="add-new-member-form" component={AddNewMemberForm}/>
      <Stack.Screen name="member-list" component={MemberList}/>
      <Stack.Screen name="training-groups-details" component={TrainingGroupDetails}/>
      <Stack.Screen name="training-group-settings" component={TrainingGroupSettings}/>
      <Stack.Screen name="training-group-stats" component={TrainingGroupStats}/>
      <Stack.Screen name="posts-display-details" component={PostsDisplayDetails}/>
      <Stack.Screen name="achivements-display-details" component={AchivementsDisplayDetails}/>
      <Stack.Screen name="friends-display" component={FriendsDisplay}/>
      <Stack.Screen name="edit-shelf" component={EditShelf}/>
      <Stack.Screen name="chart-display-details" component={ChartDisplayDetails}/>
      <Stack.Screen name="profile-stats" component={ProfileStats}/>
      <Stack.Screen name="edit-profile" component={EditProfile}/>
      <Stack.Screen name="friend-profile" component={FriendProfileScreen}/>
      <Stack.Screen name="settings" component={Settings}/>
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="achivement" component={AchivementModal}/>
      </Stack.Group>
    </Stack.Navigator>
    <AchivementModal/>
    </View>
  );
}

export default MainStack;
