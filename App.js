import * as SplashScreen from "expo-splash-screen";
import AuthContextProvider from "./store/auth-context";
import RootNavigation from "./navigation/RootNavigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MenuProvider } from "react-native-popup-menu";
import { SafeAreaProvider } from "react-native-safe-area-context";
import UserContextProvider from "./store/user-context";
import CommentContextProvider from "./store/comment-context";
import ShelfContextProvider from "./store/shelf-context";
import SettingsContextProvider from "./store/settings-context";
import "./i18next";
import React from "react";
import { AchievementContextProvider } from "./store/achivement-context";
SplashScreen.preventAutoHideAsync();

export default function App() {
  return (
    <SafeAreaProvider>
      <MenuProvider>
        <AchievementContextProvider>
          <SettingsContextProvider>
            <ShelfContextProvider>
              <UserContextProvider>
                <CommentContextProvider>
                  <AuthContextProvider>
                    <RootNavigation />
                  </AuthContextProvider>
                </CommentContextProvider>
              </UserContextProvider>
            </ShelfContextProvider>
          </SettingsContextProvider>
        </AchievementContextProvider>
      </MenuProvider>
    </SafeAreaProvider>
  );
}
