import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SignupScreen from "../telas/Signup/Signup";
import { RootStackParamList } from "@/telas/Signup/Signup"; // aproveitando o tipo

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Signup" component={SignupScreen} />
        {/* depois você adiciona Login, Home, etc */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
