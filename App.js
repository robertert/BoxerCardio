import * as SplashScreen from "expo-splash-screen";
import AuthContextProvider from "./store/auth-context";
import RootNavigation from "./navigation/RootNavigation";


SplashScreen.preventAutoHideAsync();

export default function App() {
  return (
    <AuthContextProvider>
      <RootNavigation />
    </AuthContextProvider>
  );
}
