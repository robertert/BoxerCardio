import { useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../../firebaseConfig";
import { UserContext } from "../../../store/user-context";

import MemberListItem from "./MemberListItem";

function MemberList({ route }) {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const teamId = route.params.teamId;
  const teamName = route.params.teamName;
  const isOwner = route.params.isOwner;
  const member = route.params.members;

  const userCtx = useContext(UserContext);

  const [members, setMembers] = useState([
    ...member.filter((mem) => mem.isOwner),
    ...member.filter((mem) => !mem.isOwner),
  ]);

  function goBackHandler() {
    navigation.goBack();
  }

  function renderResultHandler(itemData) {
    const item = itemData.item;
    function viewProfileHandler() {
      navigation.navigate("friend-profile", { id: item.id });
    }
    return (
      <MemberListItem
        item={item}
        isOwn={isOwner}
        teamId={teamId}
        viewProfile={viewProfileHandler}
      />
    );
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 10, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={goBackHandler}>
          <Ionicons name="chevron-back" size={42} color="white" />
        </Pressable>
      </View>
      <View style={styles.searchResultsContainer}>
        <FlashList
          data={members}
          renderItem={renderResultHandler}
          keyExtractor={(item) => item.id}
          estimatedItemSize={40}
        />
      </View>
    </View>
  );
}

export default MemberList;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  header: {
    height: 50,
    width: "100%",
  },
  searchResultsContainer: {
    width: "90%",
    flex: 1,
    marginVertical: 20,
  },
});
