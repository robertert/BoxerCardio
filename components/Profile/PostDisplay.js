import { useNavigation } from "@react-navigation/native";
import { getDownloadURL, ref } from "firebase/storage";
import { useEffect } from "react";
import { Pressable } from "react-native";
import { View, Image, StyleSheet } from "react-native";
import { storage } from "../../firebaseConfig";
import { useState } from "react";

function PostDisplay({id,userId}) {
  const navigation = useNavigation();
  const [image,setImage] = useState();

  useEffect(()=>{
    fetchPhoto();
  },[])

  async function fetchPhoto() {
    try {
      const url = await getDownloadURL(
        ref(storage, `posts/${id}/miniature.jpg`)
      );
      setImage(url);
    } catch (e) {
      console.log(e);
      if (e.code === "storage/object-not-found") {
        try {
          const url = await getDownloadURL(
            ref(storage, `posts/defaultMiniature.jpg`)
          );

          setImage(url);
        } catch (e) {
          console.log(e);
        }
      }
    }
  }
  
  function detailsHandler() {
    navigation.navigate("posts-display-details",{id: userId});
  }



  return (
    <View style={styles.root}>
      <Pressable onPress={detailsHandler}>
        <Image style={styles.img} source={{uri: image}} />
      </Pressable>
    </View>
  );
}

export default PostDisplay;

const styles = StyleSheet.create({
  root: {
    height: 100,
    width: "95%",
    alignSelf: "center",
    marginVertical: 10,
    borderRadius: 20,
  },
  img: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
});
