import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "./MainTabNavigator";
import ManageCategoriesScreen from "../screens/ManageCategoriesScreen";

const Stack = createNativeStackNavigator();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator>
      {/* Your tabs stay the same */}
      <Stack.Screen
        name="Tabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Screens you only open programmatically */}
      <Stack.Screen
        name="ManageCategories"
        component={ManageCategoriesScreen}
        options={{ title: "Manage Categories" }}
      />
    </Stack.Navigator>
  );
}
