import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import {
  Menu,
  MenuOption,
  MenuTrigger,
  MenuOptions,
} from "react-native-popup-menu";
import Colors, { DUMMY_COMENTS } from "../../constants/colors";
import { FlashList } from "@shopify/flash-list";
import Comment from "./Coments/Comment";
import { useKeyboard } from "@react-native-community/hooks";

function Divider() {
  return <View style={styles.divider}></View>;
}

function Comments({ id }) {
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  // Checking if keyboard is shown and the size of it
  const keyboard = useKeyboard();

  function backHandler() {
    navigation.goBack();
  }

  function renderCommentHandler(itemData) {
    const item = itemData.item;
    return (
      <Comment name="mankowskae" content="Here is a comment!" responses={item.responses}/>
    );
  }

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
          <Image
            source={require("../../assets/icon.png")}
            style={styles.userImage}
          />
          <Text style={styles.userName}>Mankowska</Text>
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
            <MenuOption onSelect={() => alert("fasdfas")} text="Report" />
            <Divider />
            <MenuOption
              onSelect={() => alert(`Removed friends`)}
              text="Remove friend"
            />
          </MenuOptions>
        </Menu>
      </View>
      <View style={styles.postPreview}>
        <Image
          source={require("../../assets/icon.png")}
          style={styles.postImg}
        />
      </View>
      <Divider />
      <View
        style={[styles.listContainer, keyboard.keyboardShown && { flex: 3 } ]}
      >
        <FlashList
          data={DUMMY_COMENTS}
          renderItem={renderCommentHandler}
          estimatedItemSize={10}
        />
      </View>
      <View
        style={[
          styles.inputContainer,
          {
            marginBottom:
              Platform.OS === "android" ? insets.bottom + 16 : insets.bottom,
          },
        ]}
      >
        <TextInput style={styles.input} placeholder="Add your comment here" />
      </View>
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
  divider: {
    backgroundColor: Colors.primary100_30,
    width: "100%",
    height: 1,
  },
  listContainer: {
    flex: 8,
    marginTop: 30,
    marginHorizontal: 20,
  },
  inputContainer: {
    height: 40,
    backgroundColor: Colors.primary400,
    marginHorizontal: 20,
    borderRadius: 20,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  input: {
    color: Colors.primary100,
  },
});
