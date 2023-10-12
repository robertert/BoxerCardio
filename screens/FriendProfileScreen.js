import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
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
import ChartDisplay from "../components/Profile/ChartDisplay";
import {
  collection,
  doc,
  getDoc,
  query,
  updateDoc,
  addDoc,
  runTransaction,
  arrayUnion,
  where,
  arrayRemove,
  and,
  getDocs,
} from "firebase/firestore";
import { db, storage } from "../firebaseConfig";
import { useEffect, useState } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { useContext } from "react";
import { UserContext } from "../store/user-context";

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

function FriendProfileScreen({ route }) {
  const id = route.params.id;

  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const Tab = createMaterialTopTabNavigator();

  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState();
  const [isRemove, setIsRemove] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isIncoming, setIsIncoming] = useState(false);

  const userCtx = useContext(UserContext);

  //FECHING DATA

  useEffect(() => {
    getRemovePending();
    getUser();
  }, []);

  async function getRemovePending() {
    try {
      const data = await getDoc(doc(db, `users/${userCtx.id}`));
      const friends = data.data().friends;
      friends?.forEach((friend) => {
        if (friend.id === id) {
          setIsRemove(true);
        }
      });
      const pending = data.data().pending;
      if (pending.includes(id)) {
        setIsPending(true);
      }
      const incoming = data.data().incoming;
      if (incoming.includes(id)) {
        setIsIncoming(true);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function getUser() {
    setLoading(true);
    const user = await getDoc(doc(db, `users/${id}`));
    setUserData({ id: user.id, ...user.data() });
    try {
      const url = await getDownloadURL(ref(storage, `users/${id}/photo.jpg`));
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
    setLoading(false);
  }

  async function addFriendHandler() {
    try {
      //NOTIFICATION
      await updateDoc(doc(db, `users/${userCtx.id}`), {
        pending: arrayUnion(id),
      });
      await updateDoc(doc(db, `users/${id}`), {
        incoming: arrayUnion(userCtx.id),
      });

      await addDoc(collection(db, `users/${id}/notifications`), {
        type: "friendInvitation",
        userId: userCtx.id,
        name: userCtx.name,
        text: `${userCtx.name} send you a friend request.`,
        createTime: new Date(),
      });
      setIsPending(true);
    } catch (e) {
      console.log(e);
    }
  }

  async function removeFriendHandler() {
    try {
      await runTransaction(db, async (transaction) => {
        const data = await transaction.get(doc(db, `users/${userCtx.id}`));
        const data1 = await transaction.get(doc(db, `users/${id}`));

        const friends = data
          .data()
          .friends.filter((friend) => friend.id !== id);
        const friends1 = data1
          .data()
          .friends.filter((friend) => friend.id !== userCtx.id);

        transaction.update(doc(db, `users/${userCtx.id}`), {
          friends: friends,
        });
        transaction.update(doc(db, `users/${id}`), {
          friends: friends1,
        });
      });
      setIsRemove(false);
      navigation.goBack();
    } catch (e) {
      console.log(e);
    }
  }

  async function acceptHandler() {
    try {
      const notification = await getDocs(
        query(
          collection(db, `users/${userCtx.id}/notifications`),
          and(
            where("type", "==", "friendInvitation"),
            where("userId", "==", id)
          )
        )
      );
      const notificationId = notification.docs[0].id;
      await runTransaction(db, async (transaction) => {
        const data = await transaction.get(doc(db, `users/${userCtx.id}`));
        const data1 = await transaction.get(doc(db, `users/${id}`));

        if (
          data1.data().friends.includes({
            id: userCtx.id,
            name: userCtx.name,
          })
        ) {
          console.log("TEST");
          return;
        }

        const notification = await transaction.get(
          doc(db, `users/${userCtx.id}/notifications/${notificationId}`)
        );

        const incoming = data.data().incoming.filter((user) => user !== id);
        const pending = data1
          .data()
          .pending.filter((user) => user !== userCtx.id);

        transaction.update(doc(db, `users/${userCtx.id}`), {
          friends: [
            ...data.data().friends,
            {
              id: id,
              name: userData.name,
            },
          ],
          incoming: incoming,
        });
        transaction.update(doc(db, `users/${id}`), {
          friends: [
            ...data1.data().friends,
            {
              id: userCtx.id,
              name: userCtx.name,
            },
          ],
          pending: pending,
        });
        transaction.update(doc(db, `users/${userCtx.id}`), {
          incoming: arrayRemove(id),
        });
        transaction.update(doc(db, `users/${id}`), {
          incoming: arrayRemove(userCtx.id),
        });

        transaction.delete(
          doc(db, `users/${userCtx.id}/notifications/${notification.id}`)
        );
      });
      setIsIncoming(false);
      setIsRemove(true);
    } catch (e) {
      console.log(e);
    }
  }

  function goBackHandler() {
    navigation.goBack();
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 15, paddingBottom: insets.bottom },
      ]}
    >
      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size={"large"} color={Colors.accent500} />
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Pressable onPress={goBackHandler}>
              <Ionicons name="chevron-back" size={42} color="white" />
            </Pressable>
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
                  onSelect={() => {
                    alert(id);
                  }}
                  text="Share"
                />
                <Divider />
                <MenuOption
                  onSelect={() =>
                    navigation.navigate("profile-stats", { id: id })
                  }
                  text="Stats"
                />
                <Divider />
                <MenuOption
                  onSelect={() =>
                    navigation.navigate("friends-display", { id: id })
                  }
                  text="Friends"
                />
                {isRemove && (
                  <>
                    <Divider />
                    <MenuOption
                      customStyles={{
                        optionText: styles.infoTextRed,
                      }}
                      onSelect={removeFriendHandler}
                      text="Remove friend"
                    />
                  </>
                )}
                {!isRemove && !isPending && !isIncoming && (
                  <>
                    <Divider />
                    <MenuOption onSelect={addFriendHandler} text="Add friend" />
                  </>
                )}
                {isIncoming && (
                  <>
                    <Divider />
                    <MenuOption
                      onSelect={acceptHandler}
                      text="Accept friend invitation"
                    />
                  </>
                )}
                <Divider />
                <MenuOption onSelect={() => {}} text="Report" />
              </MenuOptions>
            </Menu>
          </View>
          <Image style={styles.image} source={{ uri: image }} />
          <Text style={styles.userName}>{userData.name}</Text>
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
                initialParams={{ id: id }}
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
      )}
    </View>
  );
}

export default FriendProfileScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
    alignItems: "center",
  },
  header: {
    width: "100%",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "center",
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
