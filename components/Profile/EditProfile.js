import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from "react-native";
import Colors from "../../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  MediaTypeOptions,
  useCameraPermissions,
  launchCameraAsync,
  PermissionStatus,
  launchImageLibraryAsync,
} from "expo-image-picker";
import { useContext, useEffect, useState } from "react";
import { Overlay } from "@rneui/themed";
import Divider from "../UI/Divider";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db, storage } from "../../firebaseConfig";
import { UserContext } from "../../store/user-context";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useTranslation } from "react-i18next";

function EditProfile() {
  const [cameraPermissionInformation, requestPermission] =
    useCameraPermissions();

  const userCtx = useContext(UserContext);

  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  const [image, setImage] = useState();

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [checkPasswordVisible, setCheckPasswordVisible] = useState(false);

  const [userName, setUserName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState();
  const [errorMessagePassowrd, setErrorMessagePasssword] = useState();

  const {t} = useTranslation();

  function toggleIsVisible() {
    setIsDialogVisible((prev) => !prev);
  }

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function verifyPermission() {
    if (cameraPermissionInformation.status === PermissionStatus.UNDETERMINED) {
      const permissionResponse = await requestPermission();
      return permissionResponse.granted;
    }
    if (cameraPermissionInformation.status === PermissionStatus.DENIED) {
      Alert.alert("Error", t("Permission not granted"));
      return false;
    }
    return true;
  }

  function goBackHandler() {
    navigation.goBack();
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

  function userNameChangeHandler(gotUserName) {
    setUserName(gotUserName);
  }

  function emailChangeHandler(gotEmail) {
    setEmail(gotEmail);
  }

  function changePasswordHandler() {
    navigation.navigate("reset-password");
  }

  function isAlphanumeric(str) {
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  async function saveHandler() {
    setErrorMessage("");
    if (
      userName.trim().length < 2 ||
      !isAlphanumeric(userName) ||
      userName.trim().length > 15
    ) {
      // dodac czy unikalna
      setErrorMessage(
        t("Username should be at least 2 characters long and contain only letters and numbers")
      );
      return;
    }
    if (
      !email.includes("@") ||
      !email.includes(".")
      // dodac czy email jest zajety
    ) {
      setErrorMessage(t("Wrong email"));
      return;
    }
    try {
      const data = await getDocs(
        query(collection(db, `users`), where("email", "==", email))
      );
      const data1 = await getDocs(
        query(collection(db, "users"), where("name", "==", userName))
      );
      if (!data.empty && data.docs[0].id !== userCtx.id) {
        setErrorMessage(t("This email is taken."));
        return;
      }
      if (!data1.empty && userName != userCtx.name) {
        setErrorMessage(t("This username is taken."));
        return;
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Error", t("Error message"));
    }
    setCheckPasswordVisible(true);
  }

  function passwordChangeHandler(gotPassword) {
    setPassword(gotPassword);
  }
  async function submitPasswordHandler() {
    setErrorMessagePasssword("");
    const user = auth.currentUser;
    const credentials = EmailAuthProvider.credential(user.email, password);
    try {
      await reauthenticateWithCredential(user, credentials);
      await updateDoc(doc(db, `users/${userCtx.id}`), {
        name: userName,
        email: email,
      });
      const fetchRes = await fetch(image);
      const blob = await fetchRes.blob();
      await uploadBytesResumable(
        ref(storage, `users/${userCtx.id}/photo.jpg`),
        blob
      );
      navigation.goBack();
    } catch (e) {
      console.log(e);
      if (e.code === "auth/wrong-password")
        setErrorMessagePasssword(t("Wrong password!"));
      else if (e.code === "auth/too-many-requests") {
        setErrorMessagePasssword(t("Too many failed atempts! Try again later."));
      } else {
        Alert.alert("Error", t("Error message"));
      }
    }
  }

  async function fetchInitialData() {
    try {
      const data = await getDoc(doc(db, `users/${userCtx.id}`));
      setUserName(data.data().name);
      setEmail(data.data().email);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", t("Error message"));
    }
    try {
      const url = await getDownloadURL(
        ref(storage, `users/${userCtx.id}/photo.jpg`)
      );

      setImage(url);
    } catch (e) {
      console.log(e);
    }
  }
  //username, email, password, profile picture,
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
      <Pressable onPress={toggleIsVisible}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.img} />
          <Text style={styles.infoPhoto}>{t("Press to change photo")}</Text>
        </View>
      </Pressable>
      <View style={styles.subContainer}>
        <Text style={styles.inputTitle}>{t("Username")}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            maxLength={20}
            autoCapitalize="none"
            onChangeText={userNameChangeHandler}
            value={userName}
          />
        </View>
      </View>
      <View style={styles.subContainer}>
        <Text style={styles.inputTitle}>Email</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            maxLength={50}
            autoCapitalize="none"
            onChangeText={emailChangeHandler}
            value={email}
          />
        </View>
      </View>
      <Pressable onPress={changePasswordHandler}>
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonText}>{t("Change password")}</Text>
        </View>
      </Pressable>
      <Text style={styles.errorMessage}>{errorMessage}</Text>
      <Pressable onPress={saveHandler}>
        <View style={styles.saveButtonContainer}>
          <Text style={styles.saveButtonText}>{t("Save")}</Text>
        </View>
      </Pressable>
      <Overlay
        isVisible={checkPasswordVisible}
        onBackdropPress={() => setCheckPasswordVisible(false)}
        overlayStyle={styles.dialogContainer}
      >
        <Text style={styles.passwordText}>{t("Enter password")}</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={passwordChangeHandler}
            autoCapitalize="none"
            secureTextEntry={true}
          />
        </View>
        <Text style={styles.errorMessage}>{errorMessagePassowrd}</Text>
        <Pressable onPress={submitPasswordHandler}>
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonText}>{t("Submit")}</Text>
          </View>
        </Pressable>
      </Overlay>
      <Overlay
        isVisible={isDialogVisible}
        onBackdropPress={toggleIsVisible}
        overlayStyle={styles.dialogContainer}
      >
        <View style={styles.optionsContainer}>
          <Pressable onPress={imagePressHandler.bind(this, "library")}>
            <View style={styles.optionContainer}>
              <MaterialIcons name="photo-library" size={24} color="white" />
              <Text style={styles.dialogOption}>{t("Choose photo from library")}</Text>
            </View>
          </Pressable>
          <Divider />
          <Pressable onPress={imagePressHandler.bind(this, "camera")}>
            <View style={styles.optionContainer}>
              <MaterialIcons name="photo-camera" size={24} color="white" />
              <Text style={styles.dialogOption}>{t("Take new photo")}</Text>
            </View>
          </Pressable>
        </View>
      </Overlay>
    </View>
  );
}

export default EditProfile;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
    alignItems: "center",
  },
  header: {
    width: "100%",
    height: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  imageContainer: {
    alignItems: "center",
  },
  img: {
    height: 130,
    width: 130,
    borderRadius: 65,
  },
  infoPhoto: {
    marginTop: 10,
    marginBottom: 20,
    color: Colors.primary100,
    fontSize: 15,
    fontWeight: "700",
  },
  input: {
    color: Colors.primary100,
    fontSize: 20,
  },
  inputContainer: {
    backgroundColor: Colors.primary500,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 8,
    width: 300,
  },
  subContainer: {
    marginVertical: 15,
  },
  inputTitle: {
    color: Colors.primary100,
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 30,
    backgroundColor: Colors.accent300,
    padding: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: Colors.primary100,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  saveButtonContainer: {
    marginTop: 100,
    backgroundColor: Colors.accent500,
    paddingVertical: 10,
    width: 300,
    borderRadius: 20,
    justifyContent: "center",
  },
  saveButtonText: {
    textAlign: "center",
    color: Colors.primary100,
    fontSize: 30,
    fontWeight: "bold",
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
  passwordText: {
    marginHorizontal: 10,
    color: Colors.primary100,
    fontSize: 22,
    fontWeight: "700",
  },
  passwordInput: {
    color: Colors.primary100,
    width: "90%",
    textAlign: "center",
    alignSelf: "center",
  },
  passwordContainer: {
    width: 220,
    marginTop: 15,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 5,
    backgroundColor: Colors.primary400,
  },
  errorMessage: {
    alignSelf: "center",
    fontWeight: "700",
    fontSize: 15,
    color: Colors.accent500,
    marginTop: 15,
  },
});
