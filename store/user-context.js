import { createContext, useState } from "react";

export const UserContext = createContext({
  id: "",
  name: "",
  photoUrl: "",
  mainPageRender: false,
  getUser: () => {},
  delUser: () => {},
  changeMain: () => {},
});

function UserContextProvider({ children }) {
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [id, setId] = useState();
  const [mainPageRender, setMainPageRender] = useState(false);

  function getUser(gotName, gotPhotoUrl, gotId) {
    setId(gotId);
    setName(gotName);
    setPhotoUrl(gotPhotoUrl);
  }

  function delUser() {
    setId(null);
    setName(null);
    setPhotoUrl(null);
  }

  function changeMain(value) {
    setMainPageRender(value);
  }

  const value = {
    id: id,
    name: name,
    photoUrl: photoUrl,
    mainPageRender: mainPageRender,
    getUser: getUser,
    delUser: delUser,
    changeMain: changeMain,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export default UserContextProvider;
