import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Text,
  ActivityIndicator,
} from "react-native";
import Colors from "../../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import Divider from "../UI/Divider";
import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { UserContext } from "../../store/user-context";
import { db, storage } from "../../firebaseConfig";
import { getDownloadURL, ref } from "firebase/storage";
import FriendDisplay from "./FriendDisplay";
import { useTranslation } from "react-i18next";

function FriendsDisplay({ route }) {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const id = route.params.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [friends, setFriends] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const userCtx = useContext(UserContext);

  const {t} = useTranslation();

  useEffect(() => {
    fetchFriends();
  }, []);

  async function fetchFriends() {
    setIsLoading(true);
    try {
      const data = await getDoc(doc(db, `users/${id}`));
      const gotFriends = data.data().friends;
      setFriends([...gotFriends]);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsError(true);
    }
  }

  function renderFriendHandler(itemData) {
    const item = itemData.item;
    return <FriendDisplay item={item} />;
  }

  function goBackHandler() {
    navigation.goBack();
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={goBackHandler}>
          <Ionicons name="chevron-back" size={42} color="white" />
        </Pressable>
      </View>
      <Text style={styles.titleText}>{t("Friends")}</Text>

      <FlashList
        data={friends}
        renderItem={renderFriendHandler}
        keyExtractor={(item) => item.id}
        estimatedItemSize={80}
        refreshing={refresh}
        onRefresh={() => {
          setRefresh(true);
          setIsError(false);
          setFriends([]);
          try {
            fetchFriends();
            setRefresh(false);
          } catch (e) {
            console.log(e);
            setIsError(true);
          }
        }}
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
                {t("Error message")}
              </Text>
            </View>
          )
        }
        ListEmptyComponent={
          !isLoading && (
            <Text style={styles.errorText}>
              {userCtx.id === id
                ? t("You don't have any friends yet.")
                : t("This user don't have any friends yet")}
            </Text>
          )
        }
      />
    </View>
  );
}

export default FriendsDisplay;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
  },
  header: {
    width: "100%",
    height: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  titleText: {
    marginBottom: 15,
    color: Colors.primary100,
    fontSize: 30,
    fontWeight: "800",
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
