import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import React, { createContext, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { db } from "../firebaseConfig";
import { UserContext } from "./user-context";

const AchievementContext = createContext();

export const useAchievements = () => useContext(AchievementContext);

export const AchievementContextProvider = ({ children }) => {
  const [achievement, setAchievement] = useState(null);
  const { t } = useTranslation();
  const userCtx = useContext(UserContext);

  const unlockAchievement = async (achievementInfo) => {
    setAchievement(achievementInfo);
  };

  const clearAchievement = () => setAchievement(null);

  return (
    <AchievementContext.Provider
      value={{ achievement, unlockAchievement, clearAchievement }}
    >
      {children}
    </AchievementContext.Provider>
  );
};
