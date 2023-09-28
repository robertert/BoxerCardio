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
import { TextInput } from "react-native";
import { useContext, useState, useEffect } from "react";
import { FlashList } from "@shopify/flash-list";
import { UserContext } from "../../../store/user-context";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Alert } from "react-native";
import {
  addDoc,
  collection,
  writeBatch,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import {
  MediaTypeOptions,
  useCameraPermissions,
  launchCameraAsync,
  PermissionStatus,
  launchImageLibraryAsync,
} from "expo-image-picker";
import { Overlay } from "@rneui/themed";
import Divider from "../../UI/Divider";

function TrainingGroupForm() {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const userCtx = useContext(UserContext);

  const [cameraPermissionInformation, requestPermission] =
    useCameraPermissions();

  const [tag, setTag] = useState("");
  const [name, setName] = useState("");
  const [members, setMembers] = useState([
    {
      id: userCtx.id,
      name: userCtx.name,
      photoUrl: userCtx.photoUrl,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const [image, setImage] = useState();

  const [isDialogVisible, setIsDialogVisible] = useState(false);

  function toggleIsVisible() {
    setIsDialogVisible((prev) => !prev);
  }

  useEffect(() => {
    setImage();
  }, []);

  async function verifyPermission() {
    if (cameraPermissionInformation.status === PermissionStatus.UNDETERMINED) {
      const permissionResponse = await requestPermission();
      return permissionResponse.granted;
    }
    if (cameraPermissionInformation.status === PermissionStatus.DENIED) {
      Alert.alert("Error", "Permission not granted");
      return false;
    }
    return true;
  }

  async function imagePressHandler(type) {
    const hasPermissions = await verifyPermission();
    if (!hasPermissions) {
      return;
    }

    let result;

    if (type === "camera") {
      result = await launchCameraAsync({
        allowsEditing: true,
        quality: 0.5,
        aspect: [4, 4],
      });
    } else {
      result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.5,
        aspect: [4, 4],
      });
    }
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
    toggleIsVisible();
  }

  function goBackHandler() {
    navigation.goBack();
  }

  function settingsHandler() {
    navigation.navigate("training-group-settings", { teamId: null });
  }

  function tagChangeHandler(givenTag) {
    setTag(givenTag.toUpperCase());
  }

  function nameChangeHandler(givenName) {
    setName(givenName);
  }
  async function submitHandler() {
    //DODAĆ TEAM DO LISTY
    setIsLoading(true);
    try {
      const uid =
        Date.now().toString(36) + Math.random().toString(36).substr(2);

      const batch = writeBatch(db);

      batch.set(doc(db, `trainingGroups/${uid}`), {
        banerUrl: "url",
        createdAt: new Date(),
        members: members,
        membersNum: 1,
        name: name,
        settings: {
          //DODAĆ DEFAULT SETTINGS
        },
        stats: {},
        tag: tag,
      });
      batch.update(doc(db, `users/${userCtx.id}`), {
        trainingGroups: arrayUnion({
          id: uid,
          name: name,
          membersNum: 1,
          rank: 1,
          photoUrl: "url",
        }),
      });
      await batch.commit();
      navigation.goBack();
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "There was an error. Try again later");
    }
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
          <Pressable onPress={settingsHandler}>
            <Ionicons name="md-settings-sharp" size={35} color="white" />
          </Pressable>
        </View>
        <Pressable onPress={toggleIsVisible}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.img} />
            <Text style={styles.infoPhoto}>Press to change photo</Text>
          </View>
        </Pressable>
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
          />
        </View>
        <Pressable onPress={submitHandler}>
          <View style={styles.submitButton}>
            <Text style={styles.submitText}>Submit</Text>
          </View>
        </Pressable>
      </View>
      <Overlay
        isVisible={isDialogVisible}
        onBackdropPress={toggleIsVisible}
        overlayStyle={styles.dialogContainer}
      >
        <View style={styles.optionsContainer}>
          <Pressable onPress={imagePressHandler.bind(this, "library")}>
            <View style={styles.optionContainer}>
              <MaterialIcons name="photo-library" size={24} color="white" />
              <Text style={styles.dialogOption}>Chose photo from library</Text>
            </View>
          </Pressable>
          <Divider />
          <Pressable onPress={imagePressHandler.bind(this, "camera")}>
            <View style={styles.optionContainer}>
              <MaterialIcons name="photo-camera" size={24} color="white" />
              <Text style={styles.dialogOption}>Take new photo</Text>
            </View>
          </Pressable>
        </View>
      </Overlay>
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
  imageContainer: {
    alignItems: "center",
  },
  img: {
    height: 120,
    width: 230,
    borderRadius: 20,
  },
  infoPhoto: {
    marginTop: 10,
    marginBottom: 20,
    color: Colors.primary100,
    fontSize: 15,
    fontWeight: "700",
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
  submitButton: {
    backgroundColor: Colors.accent500,
    borderRadius: 30,
    height: 60,
    width: 150,
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: Colors.primary100,
    fontSize: 27,
    fontWeight: "600",
  },
  dialogContainer: {
    backgroundColor: Colors.primary500,
    borderRadius: 20,
  },
  dialogOption: {
    marginVertical: 15,
    fontSize: 20,
    color: Colors.primary100,
    marginHorizontal: 10,
    fontWeight: "700",
  },
  optionsContainer: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
