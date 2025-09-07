import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./src/telas/Login";
import Signup from "./src/telas/Signup";
import Habitos from "./src/telas/Habitos"

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Habitos" component={Habitos} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}