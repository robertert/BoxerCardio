import { createContext, useState } from "react";


export const AuthContext = createContext({
  isAuth: false,
  token: "",
  authenticate: () => {},
  logout: () => {},
});

function AuthContextProvider({ children }) {
  const [token, setToken] = useState("");

  function authenticate(gotToken){
    setToken(gotToken);
  }
  function logout() {}
  const value = {
    isAuth: !!token,
    token: token,
    authenticate: authenticate,
    logout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
