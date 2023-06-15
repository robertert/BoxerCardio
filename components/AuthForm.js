import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { TextInput } from "react-native-paper";

function AuthForm() {
  const [username, setUsername] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();

  const usernameChangeHandler = (enteredUsername) => {
    setUsername(enteredUsername);
  };
  const emailChangeHandler = (enteredEmail) => {
    setEmail(enteredEmail);
  };
  const passwordChangeHandler = (enteredPassword) => {
    setPassword(enteredPassword);
  };

  const confirmPasswordChangeHandler = (enteredConfirmPassword) => {
    setConfirmPassword(enteredConfirmPassword);
  };

  function validate() {
    // czy username,email jest unikalna
    if (username.trim().length < 6) {
      return false;
    }
  }

  return (
    <View>
      <View>
        <Text>Username</Text>
        <TextInput onChangeText={usernameChangeHandler} value={username} />
        <Text>Email</Text>
        <TextInput onChangeText={emailChangeHandler} value={email} />
        <Text>Password</Text>
        <TextInput onChangeText={passwordChangeHandler} value={password} />
        <Text>Confirm Password</Text>
        <TextInput
          onChangeText={confirmPasswordChangeHandler}
          value={confirmPassword}
        />
      </View>
      <Pressable>
        <View>
            <Text>Sign up</Text>
        </View>
      </Pressable>
    </View>
  );
}

export default AuthForm;
