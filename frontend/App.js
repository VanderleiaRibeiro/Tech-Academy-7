import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Button } from "react-native";

import Login from "./src/telas/Login/Login";
import Signup from "./src/telas/Signup/Signup";
import Home from "./src/telas/Home/Home";
import Habitos from "./src/telas/Habitos";
import Profile from "./src/telas/Profile/Profile";

const Stack = createNativeStackNavigator();

function QuickNav({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Button title="Login" onPress={() => navigation.navigate("Login")} />
      <Button title="Signup" onPress={() => navigation.navigate("Signup")} />
      <Button title="Home" onPress={() => navigation.navigate("Home")} />
      <Button title="Habitos" onPress={() => navigation.navigate("Habitos")} />
      <Button
        title="Editar Perfil"
        onPress={() => navigation.navigate("EditProfile")}
      />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="QuickNav"
      >
        <Stack.Screen name="QuickNav" component={QuickNav} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Habitos" component={Habitos} />
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
