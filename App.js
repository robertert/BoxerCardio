import * as SplashScreen from "expo-splash-screen";
import AuthContextProvider from "./store/auth-context";
import RootNavigation from "./navigation/RootNavigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MenuProvider } from "react-native-popup-menu";
import { SafeAreaProvider } from "react-native-safe-area-context";
import UserContextProvider from "./store/user-context";
import CommentContextProvider from "./store/comment-context";
SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <MenuProvider>
        <QueryClientProvider client={queryClient}>
          <UserContextProvider>
            <CommentContextProvider>
              <AuthContextProvider>
                <RootNavigation />
              </AuthContextProvider>
            </CommentContextProvider>
          </UserContextProvider>
        </QueryClientProvider>
      </MenuProvider>
    </SafeAreaProvider>
  );
}
