import { createContext, useState } from "react";

export const SettingsContext = createContext({
  laguage: "en",
  permissions: [],
  allowNotifications: true,
  getSettings: (isAllowedNotifications,gotLanguage) => {},
  getPermissions: (permissions) => {},
});

function SettingsContextProvider({ children }) {
  const [permissions, setPermissions] = useState([]);
  const [language, setLanguage] = useState("en");
  const [allowNotifications,setAllowNotifications] = useState(true);

  function getSettings(isAllowedNotifications,gotLanguage) {
    setAllowNotifications(isAllowedNotifications)
    setLanguage(gotLanguage);
  }

  function getPermissions(gotPermissions) {
    setPermissions(gotPermissions);
  }

  const value = {
    laguage: language,
    permissions: permissions,
    allowNotifications: allowNotifications,
    getSettings: getSettings,
    getPermissions: getPermissions,
  };
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export default SettingsContextProvider;
