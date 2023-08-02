import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import Colors from "../../../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { TextInput } from "react-native";
import { useContext, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { UserContext } from "../../../store/user-context";
import { AntDesign } from "@expo/vector-icons";

function AddNewMember() {

  const navigation = useNavigation();

  function addHandler() {
    navigation.navigate("add-new-member-form");
  }
  return (
    <Pressable onPress={addHandler}>
      <View style={styles.footerContainer}>
        <AntDesign name="plus" size={30} color="white" />
        <Text style={styles.footerText}>Add new member</Text>
      </View>
    </Pressable>
  );
}

function TrainingGroupForm() {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const userCtx = useContext(UserContext);

  const [tag, setTag] = useState("");
  const [name, setName] = useState("");
  const [members, setMembers] = useState([
    {
      id: Math.floor(Math.random() * Math.floor(Math.random() * Date.now())),
      name: userCtx.name,
      photoUrl: userCtx.photoUrl,
    },
  ]);

  function goBackHandler() {
    navigation.goBack();
  }

  function settingsHandler(){}

  function tagChangeHandler(givenTag) {
    setTag(givenTag.toUpperCase());
  }

  function nameChangeHandler(givenName) {
    setName(givenName);
  }
  function submitHandler(){

    //DODAĆ TEAM DO LISTY 

    navigation.goBack();
  }

  function renderMemberHandler(itemData) {
    const item = itemData.item;
    console.log(item);
    return (
      <View style={styles.memberContainer}>
        <Image
          source={require("../../../assets/icon.png")}
          style={styles.memberPhoto}
        />
        <Text style={styles.memberName}>{item.name}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={[styles.root, { paddingTop: insets.top + 10, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={goBackHandler}>
            <Ionicons name="chevron-back" size={42} color="white" />
          </Pressable>
          <Pressable onPress={settingsHandler}>
            <Ionicons name="md-settings-sharp" size={35} color="white" />
          </Pressable>
        </View>
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={require("../../../assets/icon.png")}
          />
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.shortContainer}>
            <Text style={styles.text}>Tag</Text>
            <View style={styles.shortInputContainer}>
              <TextInput
                style={[styles.input, styles.inputTag]}
                autoCapitalize="characters"
                onChangeText={tagChangeHandler}
                value={tag}
                maxLength={4}
              />
            </View>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.text}>Name</Text>
            <View style={styles.nameInputContainer}>
              <TextInput
                style={styles.input}
                onChangeText={nameChangeHandler}
                value={name}
              />
            </View>
          </View>
        </View>
        <View style={styles.membersContainer}>
          <FlashList
            data={members}
            renderItem={renderMemberHandler}
            keyExtractor={(item) => item.id}
            estimatedItemSize={50}
            ListFooterComponent={AddNewMember}
          />
        </View>
        <Pressable onPress={submitHandler}>
        <View style={styles.submitButton}>
            <Text style={styles.submitText}>Submit</Text>
        </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

export default TrainingGroupForm;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary500,
    alignItems: "center",
    paddingHorizontal: 15,
  },
  header: {
    height: 50,
    width: "100%",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  imageContainer: {},
  image: {
    height: 120,
    width: 230,
    borderRadius: 20,
  },
  inputContainer: {
    width: "70%",
    marginTop: 20,
    alignItems: "center",
  },
  shortContainer: {
    alignItems: "center",
    width: "100%",
  },
  nameContainer: {
    width: "100%",
    alignItems: "center",
  },
  shortInputContainer: {
    marginVertical: 10,
    height: 55,
    backgroundColor: Colors.primary700,
    borderRadius: 20,
    width: "45%",
    justifyContent: "center",
    alignItems: "center",
  },
  nameInputContainer: {
    marginVertical: 10,
    height: 40,
    backgroundColor: Colors.primary700,
    borderRadius: 20,
    width: "95%",
    justifyContent: "center",
  },
  text: {
    color: Colors.primary100,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 5,
    marginTop: 8,
  },
  input: {
    marginHorizontal: 20,
    color: Colors.primary100,
    fontSize: 20,
  },
  inputTag: {
    marginHorizontal: 21,
    fontWeight: "bold",
    fontSize: 28,
  },
  membersContainer: {
    height: 270,
    width: "90%",
    backgroundColor: Colors.primary400,
    borderRadius: 30,
    marginTop: 20,
    padding: 10,
  },
  memberContainer: {
    marginVertical: 10,
    marginHorizontal: 15,
    height: 50,
    backgroundColor: Colors.primary400,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  memberName: {
    color: Colors.primary100,
    fontSize: 25,
    marginHorizontal: 20,
  },
  memberPhoto: {
    height: 44,
    width: 44,
    borderRadius: 22,
  },
  footerContainer: {
    height: 50,
    flexDirection: "row",
    marginHorizontal: 20,
    alignItems: "center",
  },
  footerText: {
    marginHorizontal: 15,
    color: Colors.primary100,
    fontSize: 20,
  },
  submitButton:{
    backgroundColor: Colors.accent500,
    borderRadius: 30,
    height: 60,
    width: 150,
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText:{
    color: Colors.primary100,
    fontSize: 27,
    fontWeight: "600",
  }
});
