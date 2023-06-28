import * as SplashScreen from "expo-splash-screen";
import AuthContextProvider from "./store/auth-context";
import RootNavigation from "./navigation/RootNavigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MenuProvider } from "react-native-popup-menu";
SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function App() {
  return (
    <MenuProvider>
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <RootNavigation />
      </AuthContextProvider>
    </QueryClientProvider>
    </MenuProvider>
  );
}
