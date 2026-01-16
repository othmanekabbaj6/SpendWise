import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ManageCategoriesScreen from "../screens/ManageCategoriesScreen"; 
import AnalyticsScreen from "../screens/AnalyticsScreen";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: "Home" }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsScreen} 
        options={{ title: "Transactions" }}
      />
      <Tab.Screen
        name="Add"
        component={AddExpenseScreen}
        options={{ title: "Add" }}
      />
 

        <Tab.Screen
    name="Analytics"
    component={AnalyticsScreen}
    options={{ title: "Analytics" }}
  />

        <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}
