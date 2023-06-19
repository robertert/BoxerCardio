import { View,Text } from "react-native"
import ButtonPrim from "../components/UI/ButtonPrim";
import { auth } from "../firebaseConfig";

function MainScreen (){


    async function handler(){
        await auth.signOut();
    }


    return <View>
        <ButtonPrim onPress={handler}>Log out</ButtonPrim>
    </View>
}

export default MainScreen;