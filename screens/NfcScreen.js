import { View, StyleSheet, Pressable,Text } from "react-native";
import Colors from "../constants/colors";

function NfcScreen() {

    

    function connectHandler(){

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
