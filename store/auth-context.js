import { createContext, useContext, useState } from "react";

export const AuthContext = createContext({
  isAuth: false,
  token: "",
  authenticate: () => {},
  logout: () => {},
  message: "",
  changeMessage: ()=>{},
});

function AuthContextProvider({ children }) {

  const [token, setToken] = useState();
  const [message, setMessage] = useState(""); 


  function authenticate(gotToken){
    setToken(gotToken);
  }
  function logout() {
    setToken(null);
  }

  function changeMessage(mes){
      setMessage(mes);
  }
  const value = {
    isAuth: !!token,
    token: token,
    authenticate: authenticate,
    logout: logout,
    message: message,
    changeMessage: changeMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
