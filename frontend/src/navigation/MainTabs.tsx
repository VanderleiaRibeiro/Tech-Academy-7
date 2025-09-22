import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Home from "../telas/Home/Home";
import Profile from "../telas/Profile/Profile";
import HabitosStack from "@/navigation/HabitosStack";

export const TAB_HOME = "Home" as const;
export const TAB_HABITOS = "Habitos" as const;
export const TAB_PROFILE = "Profile" as const;

export type MainTabParamList = {
  [TAB_HOME]: undefined;
  [TAB_HABITOS]: undefined;
  [TAB_PROFILE]: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName={TAB_HOME}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#64748B",
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          height: 60,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0.5,
          borderTopColor: "#E5E7EB",
        },
        tabBarIcon: ({ color, size, focused }) => {
          let icon: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case TAB_HOME:
              icon = focused ? "home" : "home-outline";
              break;
            case TAB_HABITOS:
              icon = focused ? "list" : "list-outline";
              break;
            case TAB_PROFILE:
              icon = focused ? "person" : "person-outline";
              break;
            default:
              icon = "ellipse";
          }
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name={TAB_HOME}
        component={Home}
        options={{ title: "Início" }}
      />
      <Tab.Screen
        name={TAB_HABITOS}
        component={HabitosStack}
        options={{ title: "Hábitos" }}
      />
      <Tab.Screen
        name={TAB_PROFILE}
        component={Profile}
        options={{ title: "Perfil" }}
      />
    </Tab.Navigator>
  );
}
