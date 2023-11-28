import {
  Menu,
  MenuOption,
  MenuTrigger,
  MenuOptions,
} from "react-native-popup-menu";
import Divider from "../../UI/Divider";
import { useEffect, useState } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "../../../firebaseConfig";
import { StyleSheet, View, Text, Pressable, Image } from "react-native";
import { Entypo } from "@expo/vector-icons";
import Colors from "../../../constants/colors";
import { useContext } from "react";
import { UserContext } from "../../../store/user-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { doc, runTransaction } from "firebase/firestore";

function MemberListItem({ item, isOwn, viewProfile, teamId }) {
  const [image, setImage] = useState();
  const [isOwner, setIsOwner] = useState(isOwn);

  const userCtx = useContext(UserContext);

  useEffect(() => {
    console.log(item);
    async function fetchPhoto() {
      try {
        const url = await getDownloadURL(
          ref(storage, `users/${item.id}/photo.jpg`)
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
    fetchPhoto();
  }, []);

  async function makeLeaderHander() {
    //ZROBIC MAKE LEADER
    await runTransaction(db, async (transaction) => {
      try {
        const userData = await transaction.get(doc(db, `users/${userCtx.id}`));
        const user2Data = await transaction.get(doc(db, `users/${item.id}`));
        const teamData = await transaction.get(
          doc(db, `trainingGroups/${teamId}`)
        );

        const userPermissions = userData
          .data()
          .permissions.filter(
            (perm) => perm.id === teamId && perm.type === "owner"
          );
        const user2Permissions = [
          ...user2Data.data().permissons,
          { id: teamId, type: "owner" },
        ];
        const teamMembers = teamData.data().members;
        const readyMembers = [
          ...teamMembers.filter(
            (mem) => mem.id !== userCtx.id && mem.id !== item.id
          ),
          { id: userCtx.id, name: userCtx.name, isOwner: false },
          { id: item.id, name: item.name, isOwner: true },
        ];

        transaction.update(doc(db, `users/${userCtx.id}`), {
          permissions: userPermissions,
        });
        transaction.update(doc(db, `users/${item.id}`), {
          permissions: user2Permissions,
        });
        transaction.update(doc(db, `trainingGroups/${teamId}`), {
          members: readyMembers,
        });
      } catch (e) {
        console.log(e);
      }
    });
  }

  function viewProfileHandler() {
    viewProfile();
  }

  return (
    <View style={styles.resultContainer}>
      <View style={styles.userContainer}>
        {item.isOwner ? (
          <MaterialCommunityIcons name="crown" size={24} color="white" />
        ) : (
          <Ionicons name="person" size={24} color="white" />
        )}
        <Pressable onPress={viewProfileHandler}>
          <Image style={styles.img} source={{ uri: image }} />
        </Pressable>
        <Pressable onPress={viewProfileHandler}>
          <Text style={styles.resultText}>{item.name}</Text>
        </Pressable>
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
          <MenuOption onSelect={viewProfileHandler} text="View profile" />

          {isOwner && item.id !== userCtx.id && (
            <>
              <Divider />
              <MenuOption
                onSelect={makeLeaderHander}
                text="Make the group leader"
              />
              <Divider />

              <MenuOption
                customStyles={{
                  optionText: styles.infoTextRed,
                }}
                onSelect={() => alert(`Removed friends`)}
                text="Remove from the team"
              />
            </>
          )}
        </MenuOptions>
      </Menu>
    </View>
  );
}

export default MemberListItem;

const styles = StyleSheet.create({
  info: {
    width: 200,
    backgroundColor: Colors.primary500,
    borderRadius: 20,
    marginTop: 40,
  },
  infoText: {
    color: Colors.primary100,
    fontSize: 20,
    textAlign: "center",
  },
  infoTextRed: {
    color: Colors.accent500,
    fontSize: 20,
    textAlign: "center",
  },
  infoWraper: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  resultContainer: {
    height: 60,
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
  img: {
    height: 46,
    width: 46,
    borderRadius: 23,
    marginRight: 20,
    marginLeft: 20,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  placeholder: {
    height: 32,
    width: 32,
  },
});
