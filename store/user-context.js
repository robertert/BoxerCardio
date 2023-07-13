import { createContext,useState } from "react";

export const UserContext = createContext({
    name: '',
    photoUrl: '',
    getUser: ()=>{},
});

function UserContextProvider({children}){

    const [name,setName]=useState('');
    const [photoUrl,setPhotoUrl] = useState('');

    function getUser(gotName,gotPhotoUrl){
        setName(gotName);
        setPhotoUrl(gotPhotoUrl);
    }

    const value = {
        name: name,
        photoUrl: photoUrl,
        getUser: getUser,
    }

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export default UserContextProvider;