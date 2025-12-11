// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { ExpenseProvider } from "./src/context/ExpenseContext";
import { UserProvider } from "./src/context/UserContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider> 
        <AuthProvider>
          <ExpenseProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </ExpenseProvider>
        </AuthProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
