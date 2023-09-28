import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Colors from "../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import Notification from "../components/Notifications/Notification";
import { useContext, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  startAfter,
  limit,
  addDoc,
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { UserContext } from "../store/user-context";

const DUMMY_NOTIFICATIONS = [
  {
    type: "info",
    userId: "pDp6QVVSqBpYfasyHTiu",
    name: "mankowskae",
    photoUrl: "url",
    text: "mankowskae has just beaten record of your gym. Aren't you able to make it even better? Go and give ita try",
    createTime: new Date(),
  },
  {
    type: "groupInvitation",
    userId: "pDp6QVVSqBpYfasyHTiu",
    name: "mankowskae",
    group: "ATHLETES",
    photoUrl: "url",
    text: "mankowskae send you an invitation to ATHLETES training group.",
    createTime: new Date(),
  },
  {
    type: "friendInvitation",
    userId: "pDp6QVVSqBpYfasyHTiu",
    name: "mankowskae",
    photoUrl: "url",
    text: "mankowskae send you a friend request.",
    createTime: new Date(),
  },
];

function NotificationScreen() {
  const insets = useSafeAreaInsets();

  const userCtx = useContext(UserContext);

  const [notifications, setNotifications] = useState([]);
  const [isFirstLoading, setIsFirstLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState();
  const [isNextPage, setIsNextPage] = useState(false);
  const [isError, setIsError] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    initialFetchNotifications();
  }, []);

  async function initialFetchNotifications() {
    setIsFirstLoading(true);
    try {
      const data = await getDocs(
        query(
          collection(db, `users/${userCtx.id}/notifications`),
          orderBy("createTime"),
          limit(10)
        )
      );
      const lastD = data.docs[data.docs.length - 1];
      setLastDoc(lastD);
      let readyNotifications = [];

      data.forEach((nofi) => {
        readyNotifications.push({ id: nofi.id, ...nofi.data() });
      });
      if (readyNotifications.length === 10) {
        setIsNextPage(true);
      } else {
        setIsNextPage(false);
      }
      setIsFirstLoading(false);
      setNotifications([...readyNotifications]);
    } catch (e) {
      console.log(e);
      setIsError(true);
    }
  }

  async function nextFetchNotifications() {
    if (isNextPage) {
      setIsLoading(true);
      try {
        const data = await getDocs(
          query(
            collection(db, `users/${userCtx.id}/notifications`),
            orderBy("createTime"),
            startAfter(lastDoc),
            limit(10)
          )
        );
        let readyNotifications = [];
        const lastD = data.docs[data.docs.length - 1];
        setLastDoc(lastD);
        data.forEach((nofi) => {
          readyNotifications.push({ id: nofi.id, ...nofi.data() });
        });
        if (readyNotifications.length === 10) {
          setIsNextPage(true);
        } else {
          setIsNextPage(false);
        }
        setIsLoading(false);

        setNotifications((prev) => [...prev, ...readyNotifications]);
      } catch (e) {
        console.log(e);
        setIsError(true);
      }
    }
  }

  function renderNotificationHandler(itemData) {
    const item = itemData.item;
    if (item.groupId) {
      return (
        <Notification
          groupPhotoUrl={item.groupPhotoUrl}
          groupName={item.groupName}
          groupId={item.groupId}
          id={item.id}
          type={item.type}
          text={item.text}
          photoUrl={item.photoUrl}
          userId={item.userId}
          name={item.name}
        />
      );
    }
    return (
      <Notification
        id={item.id}
        type={item.type}
        text={item.text}
        photoUrl={item.photoUrl}
        userId={item.userId}
      />
    );
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 15, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Latest notifications</Text>
      </View>
      <View style={styles.notificationsContainer}>
        {!isFirstLoading ? (
          <FlashList
            extraData={notifications}
            data={notifications}
            renderItem={renderNotificationHandler}
            keyExtractor={(item) => item.id}
            estimatedItemSize={80}
            onEndReached={nextFetchNotifications}
            onEndReachedThreshold={0.5}
            refreshing={refresh}
            onRefresh={async () => {
              try {
                setIsError(false);
                setRefresh(true);
                setNotifications([]);
                await initialFetchNotifications();
                setRefresh(false);
              } catch (e) {
                console.log(e);
                setIsError(true);
              }
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>There is no notifications.</Text>
            }
            ListFooterComponent={
              !isError ? (
                isLoading && (
                  <ActivityIndicator
                    size="large"
                    color={Colors.accent500}
                    style={styles.loading}
                  />
                )
              ) : (
                <View style={styles.footerContainer}>
                  <Text style={styles.footerTextTitle}>Error</Text>
                  <Text style={styles.footerText}>
                    There was an error while loading. Please check your internet
                    conection or try again later.
                  </Text>
                </View>
              )
            }
          />
        ) : (
          <ActivityIndicator
            size="large"
            color={Colors.accent500}
            style={styles.loading}
          />
        )}
      </View>
    </View>
  );
}

export default NotificationScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
  },
  header: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    textAlign: "center",
    color: Colors.primary100,
    fontSize: 27,
    fontWeight: "500",
  },
  notificationsContainer: {
    flex: 1,
    marginTop: 20,
  },
  emptyText: {
    color: Colors.primary100,
    fontSize: 22,
    textAlign: "center",
  },
  loading: {
    marginTop: 30,
  },
  footerContainer: {
    height: 200,
    width: "100%",
    flexDirection: "column",
    padding: 25,
    marginTop: "5%",
  },
  footerText: {
    color: Colors.primary100,
    fontSize: 20,
    fontWeight: "400",
    textAlign: "center",
    marginHorizontal: "10%",
  },
  footerTextTitle: {
    color: Colors.primary100,
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
  },
  errorText: {
    marginVertical: 20,
    textAlign: "center",
    color: Colors.primary100,
    fontSize: 25,
    marginTop: "50%",
  },
});
