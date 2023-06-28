import MainScreen from "../screens/MainScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/colors";
import { View, StyleSheet } from "react-native";
import FriendsScreen from "../screens/FriendsScreen";
import NfcScreen from "../screens/NfcScreen";
import NotificationScreen from "../screens/NotificationScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function Authenticated() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary100,
        tabBarInactiveTintColor: Colors.primary100_30,
        tabBarShowLabel: false,
        tabBarBackground: () => (
          <View style={styles.tabBar}>
            <View style={styles.tabBarInner} />
          </View>
        ),
        tabBarStyle: {
          height: 70,
          alignItems: "center",
          justifyContent: "flex-end",
          display: "flex"
        },
      }}
    >
      <Tab.Screen
        name="home"
        component={MainScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                {
                  height: 48,
                  paddingBottom: 3,
                  width: 58,
                  margin: 0,
                  justifyContent: "flex-end",
                  alignItems: "center",
                },
                focused && {
                  borderBottomWidth: 2,
                  borderBottomColor: Colors.primary100,
                },
              ]}
            >
              <Ionicons name={"ios-home"} size={38} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="friends"
        component={FriendsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                {
                  height: 48,
                  paddingBottom: 3,
                  width: 58,
                  margin: 0,
                  justifyContent: "flex-end",
                  alignItems: "center",
                },
                focused && {
                  borderBottomWidth: 2,
                  borderBottomColor: Colors.primary100,
                },
              ]}
            >
              <Ionicons name={"people"} size={45} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="nfc"
        component={NfcScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                {
                  height: 48,
                  paddingBottom: 3,
                  width: 58,
                  justifyContent: "flex-end",
                  alignItems: "center",
                },
                focused && {
                  borderBottomWidth: 2,
                  borderBottomColor: Colors.primary100,
                },
              ]}
            >
              <MaterialCommunityIcons name="cellphone-nfc" size={40} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="notifiactions"
        component={NotificationScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                {
                  height: 48,
                  paddingBottom: 3,
                  width: 58,
                  margin: 0,
                  justifyContent: "flex-end",
                  alignItems: "center",
                },
                focused && {
                  borderBottomWidth: 2,
                  borderBottomColor: Colors.primary100,
                },
              ]}
            >
              <Ionicons name={"notifications"} size={38} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                {
                  height: 48,
                  paddingBottom: 3,
                  width: 58,
                  margin: 0,
                  justifyContent: "flex-end",
                  alignItems: "center",
                },
                focused && {
                  borderBottomWidth: 2,
                  borderBottomColor: Colors.primary100,
                },
              ]}
            >
              <Ionicons name={"person"} size={38} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default Authenticated;

const styles = StyleSheet.create({
  tabBar: {
    width: "100%",
    height: 70,
    backgroundColor: Colors.primary500,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBarInner: {
    width: "98%",
    height: "70%",
    backgroundColor: Colors.primary400,
    borderRadius: 20,
  },
});
