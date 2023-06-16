import { View, Text, Pressable, StyleSheet } from "react-native";
import Colors from "../../constants/colors";

function ButtonPrim({onPress,text}) {
  return <View style={styles.outerContainer}>
    <Pressable onPress={onPress} style={({pressed})=>[styles.button,pressed && styles.pressed]}>
      <View style={styles.buttonContainer}>
        <Text style={styles.buttonText}>{text}</Text>
      </View>
    </Pressable>
  </View>;
}

export default ButtonPrim;

const styles = StyleSheet.create({
    outerContainer: {
        shadowColor: "black",
        shadowOffset: {height: 0,width: 0},
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 5,
        opacity: 0.7,
        marginTop: 12,
        height: 50,
        width: 200,
        backgroundColor: Colors.accent500,
        borderRadius: 20,
    },

  button: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colors.primary100,
  },
  pressed: {
    opacity: 0.3,
  }
});
