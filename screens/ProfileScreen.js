import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import Colors from "../constants/colors";
import {
  Menu,
  MenuTrigger,
  MenuOption,
  MenuOptions,
} from "react-native-popup-menu";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Divider from "../components/UI/Divider";
import { Entypo } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import PostsDisplay from "../components/Profile/PostsDisplay";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import AchivementsDisplay from "../components/Profile/AchivementsDisplay";
import { useNavigation } from "@react-navigation/native";
import { auth, db, storage } from "../firebaseConfig";
import { useContext, useState } from "react";
import { AuthContext } from "../store/auth-context";
import { UserContext } from "../store/user-context";
import ChartDisplay from "../components/Profile/ChartDisplay";
import { doc, getDoc } from "firebase/firestore";
import { ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { ref, getDownloadURL } from "firebase/storage";

const DUMMY_USER = {
  name: "Robert",
  id: 1,
  photoUrl: "url",
  posts: [
    {
      id: 1,
      miniatureUrl: "url",
      score: 12,
      mode: "3MIN",
      createdAt: new Date(),
    },
  ],
  friends: [
    {
      id: 3,
      name: "mankowskae",
      photoUrl: "url",
    },
  ],
};

function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const Tab = createMaterialTopTabNavigator();

  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);

  const [image, setImage] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    setIsLoading(true);
    try {
      const data = await getDoc(doc(db, `users/${userCtx.id}`));
      const readyUser = { id: data.id, ...data.data() };
      setUser(readyUser);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
    try {
      const url = await getDownloadURL(
        ref(storage, `users/${userCtx.id}/photo.jpg`)
      );
      setImage(url);
    } catch (e) {
      console.log(e);
      if (e.code === "storage/object-not-found") {
        try {
          const url = await getDownloadURL(
            ref(storage, `users/defaultPhoto.jpg`)
          );
          setImage(url);
        } catch (e) {
          console.log(e);
        }
      }
    }
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 15, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <Menu>
          <MenuTrigger>
            <Entypo name="dots-three-vertical" size={30} color="white" />
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: styles.info,
              optionText: styles.infoText,
              optionsWrapper: styles.infoWraper,
            }}
          >
            <MenuOption
              onSelect={() => navigation.navigate("edit-profile")}
              text="Edit profile"
            />
            <Divider />
            <MenuOption
              onSelect={() => navigation.navigate("edit-shelf")}
              text="Edit shelf"
            />
            <Divider />
            <MenuOption
              onSelect={() =>
                navigation.navigate("profile-stats", { id: userCtx.id })
              }
              text="Stats"
            />
            <Divider />
            <MenuOption
              onSelect={() =>
                navigation.navigate("friends-display", { id: userCtx.id })
              }
              text="Friends"
            />
            <Divider />
            <MenuOption
              customStyles={{
                optionText: styles.infoTextRed,
              }}
              onSelect={() => {
                authCtx.logout();
                auth.signOut();
                userCtx.delUser();
              }}
              text="Log out"
            />
          </MenuOptions>
        </Menu>
      </View>
      {!isLoading ? (
        <>
          <Image style={styles.image} source={{ uri: image }} />
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.tabContainer}>
            <Tab.Navigator
              screenOptions={{
                tabBarShowLabel: false,
                tabBarIconStyle: { height: 60, width: 60 },
                tabBarStyle: { backgroundColor: Colors.primary700, height: 60 },
                tabBarIndicatorStyle: { backgroundColor: Colors.primary100 },
              }}
            >
              <Tab.Screen
                name="posts"
                component={PostsDisplay}
                options={{
                  tabBarIcon: ({ focused }) => (
                    <Image
                      source={require("../assets/boxIcon.png")}
                      style={[
                        {
                          resizeMode: "contain",
                          height: 60,
                          width: 60,
                          bottom: 8,
                        },
                        !focused && { opacity: 0.3 },
                      ]}
                    />
                  ),
                }}
              />
              <Tab.Screen
                name="charts"
                component={ChartDisplay}
                initialParams={{ id: userCtx.id }}
                options={{
                  tabBarIcon: ({ focused }) => (
                    <View
                      style={{
                        height: 60,
                        width: 60,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <AntDesign
                        style={{ bottom: 10 }}
                        name="barschart"
                        size={40}
                        color={
                          focused ? Colors.primary100 : Colors.primary100_30
                        }
                      />
                    </View>
                  ),
                }}
              />
              <Tab.Screen
                name="achivements"
                component={AchivementsDisplay}
                options={{
                  tabBarIcon: ({ focused }) => (
                    <View
                      style={{
                        height: 60,
                        width: 60,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        style={{ bottom: 10 }}
                        name="trophy-sharp"
                        size={38}
                        color={
                          focused ? Colors.primary100 : Colors.primary100_30
                        }
                      />
                    </View>
                  ),
                }}
              />
            </Tab.Navigator>
          </View>
        </>
      ) : (
        <ActivityIndicator
          size={"large"}
          color={Colors.accent500}
          style={{ marginTop: 20 }}
        />
      )}
    </View>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
    alignItems: "center",
  },
  header: {
    width: "100%",
    justifyContent: "flex-end",
    flexDirection: "row",
    paddingHorizontal: 20,
  },

  info: {
    width: 200,
    backgroundColor: Colors.primary500,
    borderRadius: 20,
    marginTop: 40,
  },
  infoText: {
    color: Colors.primary100,
    fontSize: 20,
    textAlign: "center",
  },
  infoTextRed: {
    color: Colors.accent500,
    fontSize: 20,
    textAlign: "center",
    fontWeight: "700",
  },
  infoWraper: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  image: {
    marginTop: 20,
    height: 130,
    width: 130,
    borderRadius: 65,
  },
  userName: {
    marginTop: 15,
    fontSize: 28,
    color: Colors.primary100,
    fontWeight: "bold",
  },
  tabContainer: {
    width: "100%",
    flex: 1,
  },
});
