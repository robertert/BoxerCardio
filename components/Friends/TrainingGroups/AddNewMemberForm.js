import { useState } from "react";
import { View, StyleSheet, Text, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import Colors from "../../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { AntDesign } from "@expo/vector-icons";

function AddNewMemberForm() {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const [results, setResults] = useState([
    {
      id: Math.floor(Math.random() * Math.floor(Math.random() * Date.now())),
      name: "bobo",
    },
    {
        id: Math.floor(Math.random() * Math.floor(Math.random() + 1 * Date.now())),
        name: "bobo",
    },
  ]);
  const [search, setSearch] = useState("");

  function goBackHandler() {
    navigation.goBack();
  }

  function searchChangeHandler(givenSearch) {
    setSearch(givenSearch);
  }
  function submitSearchHandler() {}

  function renderResultHandler(itemData) {
    const item = itemData.item;
    function addMemberHandler() {
        // DODAWANIE DO LISTY GRUPY
    }
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>{item.name}</Text>
        <Pressable onPress={addMemberHandler}>
          <AntDesign name="plus" size={32} color="white" />
        </Pressable>
      </View>
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
        <FlashList
          data={results}
          renderItem={renderResultHandler}
          keyExtractor={(item) => item.id}
          estimatedItemSize={40}
        />
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
