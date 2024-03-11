import { useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import Colors from "../../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { AntDesign } from "@expo/vector-icons";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { UserContext } from "../../../store/user-context";
import AddNewMemberFormItem from "./AddNewMemberFormItem";
import { useTranslation } from "react-i18next";

function AddNewMemberForm({ route }) {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const teamId = route.params.teamId;
  const teamName = route.params.teamName;
  const teamShort = route.params.teamShort;

  const userCtx = useContext(UserContext);
  const {t,i18n} = useTranslation()

  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => {
      submitSearchHandler();
    }, 1000);
    return () => clearTimeout(delay);
  }, [search]);

  async function fetchResults() {
    try {
      setIsLoading(true);
      const data = await getDocs(
        query(collection(db, "users"), where("name", "==", search))
      );
      let readyResults = [];

      const dataMem = await getDoc(doc(db, `trainingGroups/${teamId}`));
      const members = dataMem.data().members;

      data.forEach((dat) => {
        if (members.filter((mem) => mem.id === dat.id).length === 0) {
          readyResults.push({ id: dat.id, name: dat.data().name });
        }
      });
      console.log(readyResults);
      setResults([]);
      setResults([...readyResults]);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", t("Error message"));
    }
  }

  function goBackHandler() {
    navigation.goBack();
  }

  function searchChangeHandler(givenSearch) {
    setSearch(givenSearch);
  }
  function submitSearchHandler() {
    fetchResults();
  }

  function renderResultHandler(itemData) {
    const item = itemData.item;
    function viewProfileHandler() {
      navigation.navigate("friend-profile", { id: item.id });
    }
    return (
      <AddNewMemberFormItem
        item={item}
        setResults={setResults}
        teamId={teamId}
        teamName={teamName}
        teamShort={teamShort}
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
      <View style={styles.inputContainer}>
        <TextInput
          value={search}
          autoCapitalize="none"
          onChangeText={searchChangeHandler}
          style={styles.input}
        />
        <Pressable onPress={submitSearchHandler}>
          <FontAwesome name="search" size={24} color="white" />
        </Pressable>
      </View>
      <View style={styles.searchResultsContainer}>
        {!isLoading ? (
          <FlashList
            extraData={results}
            data={results}
            renderItem={renderResultHandler}
            keyExtractor={(item) => item.id}
            estimatedItemSize={40}
          />
        ) : (
          <ActivityIndicator
            size="large"
            color={Colors.accent500}
            style={{ marginTop: 40 }}
          />
        )}
      </View>
    </View>
  );
}

export default AddNewMemberForm;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary500,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  header: {
    height: 50,
    width: "100%",
  },
  inputContainer: {
    marginTop: 10,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    flexDirection: "row",
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary700,
  },
  input: {
    width: 280,
    color: Colors.primary100,
    fontSize: 20,
    marginRight: 15,
  },
  searchResultsContainer: {
    width: "90%",
    flex: 1,
    marginVertical: 20,
  },
  resultContainer: {
    height: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: Colors.primary100_30,
    alignItems: "center",
    borderRadius: 25,
  },
  resultText: {
    color: Colors.primary100,
    fontSize: 20,
  },
});
