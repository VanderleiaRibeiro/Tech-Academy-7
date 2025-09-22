import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Habitos from "../telas/Habitos/HabitsScreen";
import AddHabitScreen from "../telas/Habitos/AddHabitScreen";
import EditHabitScreen from "../telas/Habitos/EditHabitScreen";

export type HabitosStackParamList = {
  HabitosList: undefined;
  CadastrarHabito: undefined;
  EditarHabito: { habito: any };
};

const Stack = createNativeStackNavigator<HabitosStackParamList>();

export default function HabitosStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="HabitosList"
    >
      <Stack.Screen name="HabitosList" component={Habitos} />
      <Stack.Screen name="CadastrarHabito" component={AddHabitScreen} />
      <Stack.Screen name="EditarHabito" component={EditHabitScreen} />
    </Stack.Navigator>
  );
}
