import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { ExpenseProvider } from "./src/context/ExpenseContext";
import { UserProvider } from "./src/context/UserContext";
import { CategoryProvider } from "./src/context/CategoryContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AIChatOverlay from "./src/components/AIChatOverlay";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <AuthProvider>
          <ExpenseProvider>
            <CategoryProvider>

              {/* Navigation ONLY */}
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>

              {/* GLOBAL floating draggable AI */}
              <AIChatOverlay />

            </CategoryProvider>
          </ExpenseProvider>
        </AuthProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
