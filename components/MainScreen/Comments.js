import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Entypo, AntDesign, MaterialIcons } from "@expo/vector-icons";
import {
  Menu,
  MenuOption,
  MenuTrigger,
  MenuOptions,
} from "react-native-popup-menu";
import Colors, {
  DUMMY_COMENTS,
  generageRandomUid,
} from "../../constants/colors";
import Comment from "./Coments/Comment";
import { useKeyboard } from "@react-native-community/hooks";
import { useContext, useEffect, useRef } from "react";
import { useState } from "react";
import {
  collection,
  getDocs,
  limit,
  startAfter,
  orderBy,
  query,
  addDoc,
  updateDoc,
  doc,
  increment,
  getDoc,
  runTransaction,
} from "firebase/firestore";
import { db, storage } from "../../firebaseConfig";
import { UserContext } from "../../store/user-context";
import { Keyboard } from "react-native";
import Divider from "../UI/Divider";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  MediaTypeOptions,
  useCameraPermissions,
  launchCameraAsync,
  PermissionStatus,
  launchImageLibraryAsync,
} from "expo-image-picker";
import { Overlay } from "@rneui/themed";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";

const LIMIT = 10;

function Comments({ route }) {
  /////// HOOKS AND INITIALIZATION ///////////////////////////////////////////////////////

  const [cameraPermissionInformation, requestPermission] =
    useCameraPermissions();

  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  const commentInputRef = useRef();

  const keyboard = useKeyboard();

  const [replying, setReplying] = useState(false);
  const [replyPerson, setRelplyPerson] = useState({
    name: "",
    id: "",
    parentId: "",
  });
  const [isErrorRender, setIsErrorRender] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoading, setFirstLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState();
  const [comment, setComment] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [commentData, setCommentData] = useState([]);
  const [isNextPage, setIsNextPage] = useState(false);
  const [image, setImage] = useState();
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [commentImage, setCommentImage] = useState();
  const [userName, setUserName] = useState("");
  const [scroll,setScroll] = useState(false);

  const id = route.params.id;
  const userId = route.params.userId;

  const userCtx = useContext(UserContext);


  const { t } = useTranslation();

  ////// ALL HANDLERS ////////////////////////////////////////////////////////////////////

  async function removeFriendHandler() {
    try {
      await runTransaction(db, async (transaction) => {
        const data = await transaction.get(doc(db, `users/${userCtx.id}`));
        const data1 = await transaction.get(doc(db, `users/${userId}`));

        const friends = data
          .data()
          .friends.filter((friend) => friend.id !== userId);
        const friends1 = data1
          .data()
          .friends.filter((friend) => friend.id !== userCtx.id);

        transaction.update(doc(db, `users/${userCtx.id}`), {
          friends: friends,
        });
        transaction.update(doc(db, `users/${userId}`), {
          friends: friends1,
        });
      });
    } catch (e) {
      Alert.alert("Error", t("Error message"));
      console.log(e);
    }
  }

  async function fetchUserName() {
    try {
      const data = await getDoc(doc(db, `users/${userId}`));
      setUserName(data.data().name);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", t("Error message"));
    }
  }

  useEffect(() => {
    fetchUserName();
  }, []);

  function toggleIsVisible() {
    setIsDialogVisible((prev) => !prev);
  }

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
      setCommentImage(result.assets[0].uri);
    }
    setIsPreviewVisible(true);
    toggleIsVisible();
  }

  async function sendPhotoHandler() {
    try {
      const doc = await submitCommentHandler("image");
      const commentId = doc;

      const fetchRes = await fetch(commentImage);
      const blob = await fetchRes.blob();
      await uploadBytes(ref(storage, `comments/${commentId}.jpg`), blob);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", t("Error message"));
    }
    setIsPreviewVisible(false);
  }
  function cancelPhotoHandler() {
    setIsPreviewVisible(false);
    setCommentImage(undefined);
  }

  function backHandler() {
    navigation.goBack();
  }

  function commentChangeHandler(enteredComment) {
    setComment(enteredComment);
  }

  function viewProfileHandler() {
    navigation.navigate("friend-profile", { id: userId });
  }

  async function submitCommentHandler(type) {
    const commentId = generageRandomUid();
    if (comment.trim().length < 100 || commentImage !== undefined) {
      // GÓRNY LIMIT DŁUGOŚCI KOMENTARZY
      if (comment.trim().length > 0 || commentImage !== undefined) {
        // DOLNY LIMIT DŁUGOŚCI KOMENTARZY
        try {
          await runTransaction(db, async (transaction) => {
            const data = await transaction.get(doc(db, `posts/${id}`));
            const data1 = await transaction.get(
              doc(db, `users/${userId}/posts/${id}`)
            );
            transaction.update(doc(db, `posts/${id}`), {
              commentsNum: data.data().commentsNum + 1,
            });

            transaction.update(doc(db, `users/${userId}/posts/${id}`), {
              commentsNum: data1.data().commentsNum + 1,
            });
            if (replying) {
              if (replyPerson.parentId === "") {
                transaction.set(
                  doc(
                    db,
                    `posts/${id}/comments/${
                      replyPerson.id
                    }/responses/${commentId}`
                  ),
                  {
                    type: type,
                    userId: userCtx.id,
                    name: userCtx.name,
                    content: comment.trim(),
                    createDate: new Date(),
                    areResponses: false,
                  }
                );

                transaction.update(
                  doc(db, `posts/${id}/comments/${replyPerson.id}`),
                  {
                    areResponses: true,
                  }
                );
              } else {
                transaction.set(
                  doc(
                    db,
                    `posts/${id}/comments/${replyPerson.parentId}/responses/${
                      replyPerson.id
                    }/responses/${commentId}`
                  ),
                  {
                    type: type,
                    userId: userCtx.id,
                    name: userCtx.name,
                    content: comment.trim(),
                    createDate: new Date(),
                    areResponses: false,
                  }
                );

                transaction.update(
                  doc(
                    db,
                    `posts/${id}/comments/${replyPerson.parentId}/responses/${replyPerson.id}`
                  ),
                  {
                    areResponses: true,
                  }
                );
              }
            } else {
              transaction.set(
                doc(db, `posts/${id}/comments/${commentId}`),
                {
                  type: type,
                  userId: userCtx.id,
                  name: userCtx.name,
                  content: comment.trim(),
                  createDate: new Date(),
                  areResponses: false,
                }
              );
            }
          });
        } catch (e) {
          console.log(e);
          Alert.alert("Error", t("Error message"));
        }
        setFirstLoading(true);
        setCommentData([]);
        await initialFetch();
        setFirstLoading(false);
        setReplying(false);
        setComment("");
        Keyboard.dismiss();
      } else {
        Alert.alert(
          t("Too short!"),
          t("Your comment must have at least 1 characters")
        );
      }
    } else {
      Alert.alert(
        t("Too long!"),
        t("Your comment can't have more that 105 characters")
      );
    }
    return commentId;
  }

  function replyHandler({ id, name }, parentId) {
    commentInputRef.current.focus();
    setComment(`@${name} `);
    setReplying(true);
    setRelplyPerson({ name: name, id: id, parentId: parentId });
  }

  function replyCloseHandler() {
    setReplying(false);
  }

  function renderCommentHandler(itemData) {
    const item = itemData.item;
    //console.log(item.areResponses);
    return (
      <Comment
        type={item.type}
        userId={item.userId}
        postId={id}
        name={item.name}
        content={item.content}
        areResponses={item.areResponses}
        createDate={item.createDate}
        onReply={replyHandler}
        level={1}
        photoUrl={item.photoUrl}
        id={item.id}
        key={item.id}
        parentId=""
        grandparentId=""
      />
    );
  }

  async function fetchPhoto() {
    try {
      const url = await getDownloadURL(
        ref(storage, `users/${userId}/photo.jpg`)
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

  function addPhotoHandler() {
    toggleIsVisible();
  }

  ///////  FETCHING COMMENTS  ///////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    initialFetch();
    fetchPhoto();
  }, []);

  async function initialFetch() {
    try {
      const comments = await getDocs(
        query(
          collection(db, `posts/${id}/comments`),
          orderBy("createDate", "desc"),
          limit(10)
        )
      );

      const lastD = comments.docs[comments.docs.length - 1];
      setLastDoc(lastD);

      let readyComments = [];
      comments.forEach((comment) => {
        readyComments.push({ id: comment.id, ...comment.data() });
      });
      //console.log(readyComments);
      setFirstLoading(false);

      if (readyComments.length === 10) {
        setIsNextPage(true);
      } else {
        setIsNextPage(false);
      }

      setCommentData([...readyComments]);
    } catch (error) {
      console.log(error);
      setIsErrorRender(true); //////// ZMIENIĆ POŹŃEJ
    }
  }

  async function nextFetch() {
    if (isNextPage){
      setIsLoading(true);
      try {
        const comments = await getDocs(
          query(
            collection(db, `posts/${id}/comments`),
            orderBy("createDate", "desc"),
            startAfter(lastDoc),
            limit(10) //   ZMIENIĆ POŹNIEJ NA DOBRZE i setERRROT TEŻ  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
          )
        );

        const lastD = comments.docs[comments.docs.length - 1];
        setLastDoc(lastD);

        let readyComments = [];

        comments.forEach((comment) => {
          readyComments.push({ id: comment.id, ...comment.data() });
        });
        setIsLoading(false);
        if (readyComments.length === 10) {
          setIsNextPage(true);
        } else {
          setIsNextPage(false);
        }

        setCommentData((prev) => {
          //console.log(readyComments);
          //console.log(prev);
          return [...prev, ...readyComments]
        });
      } catch (e) {
        console.log(e);
        setIsErrorRender(true); //////// ZMIENIĆ POŹŃEJ
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////

  return (
    <View
      style={[
        styles.root,
        keyboard.keyboardShown &&
          Platform.OS === "ios" && { paddingBottom: keyboard.keyboardHeight },
      ]}
    >
      <View style={[styles.top, { marginTop: insets.top + 10 }]}>
        <Pressable onPress={backHandler}>
          <Ionicons name="chevron-back" size={42} color="white" />
        </Pressable>
        <View style={styles.user}>
          <Image source={{ uri: image }} style={styles.userImage} />
          <Text style={styles.userName}>{userName}</Text>
        </View>
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
              onSelect={viewProfileHandler}
              text={t("View profile")}
            />
            <Divider />
            <MenuOption
              onSelect={removeFriendHandler}
              text={t("Remove friend")}
            />
          </MenuOptions>
        </Menu>
      </View>
      {!Keyboard.isVisible() && (
        <View style={styles.postPreview}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.postImg}
          />
        </View>
      )}
      <Divider />
      <View
        style={[styles.listContainer, keyboard.keyboardShown && { flex: 3 }]}
      >
        {!isFirstLoading ? (
          !isErrorRender ? (
            <View style={{ flex: 1, height: "100%" }}>
              <FlatList
                extraData={commentData}
                data={commentData}
                renderItem={renderCommentHandler}
                keyExtractor={(item) => item.id}
                onEndReached={({ distanceFromEnd }) => {
                  console.log(distanceFromEnd);
                  if (distanceFromEnd === 0 && !scroll){
                    nextFetch();
                    setScroll(true);
                  }
                }}
                onEndReachedThreshold={0}
                onMomentumScrollBegin={()=>{
                  setScroll(false)
                }}
                refreshing={refresh}
                onRefresh={async () => {
                  try {
                    setIsErrorRender(false);
                    setCommentData([]);
                    setFirstLoading(true);
                    await initialFetch();
                    setFirstLoading(false);
                    setRefresh(false);
                  } catch (e) {
                    setIsErrorRender(true);
                    console.log(e);
                  }
                }}
                ListEmptyComponent={
                  <Text style={styles.errorText}>
                    {t(
                      "There aren't any comments yet. Be the first to comment!"
                    )}
                  </Text>
                }
                ListFooterComponent={
                  isLoading && (
                    <ActivityIndicator
                      size="large"
                      color={Colors.accent500}
                      style={styles.loading}
                    />
                  )
                }
              />
            </View>
          ) : (
            <View style={styles.footerContainer}>
              <Text style={styles.footerTextTitle}>Error</Text>
              <Text style={styles.footerText}>{t("Error message")}</Text>
            </View>
          )
        ) : (
          <ActivityIndicator
            size="large"
            color={Colors.accent500}
            style={styles.loading}
          />
        )}
      </View>
      {replying && (
        <View style={styles.replying}>
          <Text style={styles.replyingText}>
            {t("Replying to replyPerson.name", { name: replyPerson.name })}
          </Text>
          <Pressable onPress={replyCloseHandler}>
            <AntDesign name="close" size={24} color="white" />
          </Pressable>
        </View>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            marginBottom:
              Platform.OS === "android" ? insets.bottom + 16 : insets.bottom,
          },
        ]}
      >
        <Pressable onPress={addPhotoHandler}>
          <MaterialIcons name="photo-camera" size={24} color="white" />
        </Pressable>
        <TextInput
          ref={commentInputRef}
          style={styles.input}
          placeholder={t("Add your comment here")}
          value={comment}
          onChangeText={commentChangeHandler}
          multiline={true}
        />
        <Pressable onPress={submitCommentHandler.bind(this, "text")}>
          <Text style={styles.submitText}>{t("Publish")}</Text>
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
              <Text style={styles.dialogOption}>
                {t("Choose photo from library")}
              </Text>
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
      <Overlay
        fullScreen={false}
        isVisible={isPreviewVisible}
        onBackdropPress={() => setIsPreviewVisible(false)}
        overlayStyle={styles.previewContainer}
      >
        <Image style={styles.commentImage} source={{ uri: commentImage }} />
        <View style={styles.buttonsConatiner}>
          <Pressable onPress={cancelPhotoHandler}>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>{t("Cancel")}</Text>
            </View>
          </Pressable>
          <Pressable onPress={sendPhotoHandler}>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>{t("Send")}</Text>
            </View>
          </Pressable>
        </View>
      </Overlay>
    </View>
  );
}

export default Comments;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
    flexDirection: "column",
    marginBottom: 0,
  },
  top: {
    flex: 1,
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  user: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    marginHorizontal: 10,
    color: Colors.primary100,
    fontSize: 23,
  },

  userImage: {
    height: 45,
    width: 45,
    borderRadius: 22.5,
  },
  info: {
    width: 200,
    height: 100,
    backgroundColor: Colors.primary500,
    borderRadius: 20,
    marginTop: 40,
  },
  infoText: {
    color: Colors.primary100,
    fontSize: 20,
    textAlign: "center",
  },
  infoWraper: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  postPreview: {
    flex: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  postImg: {
    height: 120,
    width: 200,
    borderRadius: 20,
  },
  listContainer: {
    flex: 8,
    marginTop: 30,
    marginHorizontal: 15,
  },
  inputContainer: {
    backgroundColor: Colors.primary400,
    marginHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    marginVertical: 10,
    minHeight: 40,
    maxHeight: 70,
    paddingVertical: 10,
  },
  input: {
    marginLeft: 10,
    marginRight: 10,
    flex: 1,
    color: Colors.primary100,
  },
  submitText: {
    color: Colors.accent500,
    fontSize: 15,
    fontWeight: "bold",
  },
  replying: {
    height: 35,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.primary500,
    borderRadius: 10,
    marginHorizontal: 15,
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  replyingText: {
    color: Colors.primary100_30,
  },
  errorText: {
    marginVertical: 20,
    textAlign: "center",
    color: Colors.primary100,
    fontSize: 25,
    marginTop: "50%",
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
  loading: {
    marginTop: 30,
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
  previewContainer: {
    backgroundColor: Colors.primary500,
    borderRadius: 20,
    paddingVertical: 50,
  },
  commentImage: {
    marginVertical: 20,
    alignSelf: "center",
    height: 300,
    width: 300,
    borderRadius: 20,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    marginVertical: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: Colors.accent700,
    height: 60,
    width: 160,
    borderRadius: 20,
  },
  buttonText: {
    color: Colors.primary100,
    fontSize: 22,
    fontWeight: "700",
  },
  buttonsConatiner: {
    flexDirection: "row",
  },
});
