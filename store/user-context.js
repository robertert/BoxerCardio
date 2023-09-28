import { createContext,useState } from "react";

export const UserContext = createContext({
    id: '',
    name: '',
    photoUrl: '',
    getUser: ()=>{},
    delUser: ()=>{},
});

function UserContextProvider({children}){

    const [name,setName]=useState('');
    const [photoUrl,setPhotoUrl] = useState('');
    const [id,setId] = useState();

    function getUser(gotName,gotPhotoUrl,gotId){
        setId(gotId)
        setName(gotName);
        setPhotoUrl(gotPhotoUrl);
    }

    function delUser(){
        setId(null);
        setName(null);
        setPhotoUrl(null);
    }

    const value = {
        id: id,
        name: name,
        photoUrl: photoUrl,
        getUser: getUser,
        delUser: delUser,
    }

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export default UserContextProvider;