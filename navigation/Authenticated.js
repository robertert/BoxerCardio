import MainScreen from "../screens/MainScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons,Entypo } from "@expo/vector-icons";
import Colors from "../constants/colors";
import { View, StyleSheet } from "react-native";
import FriendsScreen from "../screens/FriendsScreen";
import NfcScreen from "../screens/NfcScreen";
import NotificationScreen from "../screens/NotificationScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const Tab = createBottomTabNavigator();

function Authenticated() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      id="Tabs"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary100,
        tabBarInactiveTintColor: Colors.primary100_30,
        tabBarShowLabel: false,
        tabBarBackground: () => (
          <View style={[styles.tabBar,{height: insets.bottom+70,paddingBottom: insets.bottom}]}>
            <View style={styles.tabBarInner} />
          </View>
        ),
        tabBarStyle: {
          marginBottom: Platform.OS !== "android" ? insets.bottom-8: insets.bottom,
          height: 70,
          alignItems: "center",
          justifyContent: "center",
          borderTopWidth: 0,
        },
        tabBarIconStyle: {
          paddingBottom: Platform.OS === "android" && 30
        }
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
                  height: 80,
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
              <Entypo name="home" size={38} color={color} />
            </View>
          ),
        }}
        listeners={({ navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('home');
          },
        })}
      />
      <Tab.Screen
        name="friends"
        component={FriendsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                {
                  height: 80,
                  paddingBottom: 0,
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
                  height: 80,
                  paddingBottom: 5,
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
              <MaterialCommunityIcons
                name="cellphone-nfc"
                size={40}
                color={color}
              />
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
                  height: 80,
                  paddingBottom: 5,
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
                  height: 80,
                  paddingBottom: 5,
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
