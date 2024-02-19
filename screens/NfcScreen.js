import { View, StyleSheet, Pressable,Text } from "react-native";
import Colors from "../constants/colors";
import { doc, runTransaction } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useContext, useState } from "react";
import { UserContext } from "../store/user-context";

function NfcScreen() {

    const [id,setId] = useState();
    const [desc,setDesc] = useState("");
    const postId = 1;

    const userCtx = useContext(UserContext)
    

    function connectHandler(){

    }

    async function createPost(){
      await runTransaction(db,async (transaction) => {
        const data = await transaction.get(doc(db,`machines/${id}`))
        const userData = await transaction.get(doc(db,`users/${userCtx.id}`));
        transaction.set(doc(db,`posts/${postId}`),{
          userId: userCtx.id,
          userName: userCtx.name,
          likes: [],
          likesNum: 0,
          commentsNum: 0,
          description: desc,
          createdAt: new Date(),
          score: data.data().score,
          mode: data.data().mode,

        })
        //SPRAWDZIC CZY JEST HIGHSCORE
        if(userData.highScores[data.data().mode]>data.data().score){
          let highScores = userData.highScores;
          highScores[data.data().mode]=data.data().score;
          transaction.update(doc(db,`users/${userCtx.id}`),{
            highScores: highScores
          })
          //
          //UPDATE RANKINGS
          //
        }
      })
    }

  return (
    <View style={styles.root}>
      <Pressable onPress={connectHandler}>
        <View style={styles.button}>
            <Text style={styles.buttonText}>Connect</Text>
        </View>
      </Pressable>
    </View>
  );
}

export default NfcScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary700,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    shadowColor: "black",
    shadowOffset: {height: 2,width: 2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 15,
    height: 150,
    width: 150,
    borderRadius: 75,
    backgroundColor: Colors.accent500,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: Colors.primary100,
    fontSize: 30,
    fontWeight: "bold",
  },
});
