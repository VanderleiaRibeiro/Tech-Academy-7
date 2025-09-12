import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// suas telas
import Habitos from "../telas/Habitos/HabitsScreen";        // lista
import AddHabitScreen from "../telas/Habitos/AddHabitScreen";     // Cadastrar
import EditHabitScreen from "../telas/Habitos/EditHabitScreen";   // Editar

export type HabitosStackParamList = {
  HabitosList: undefined;          // << novo nome
  CadastrarHabito: undefined;
  EditarHabito: { habito: any };   // ou seu HabitDTO
};

const Stack = createNativeStackNavigator<HabitosStackParamList>();

export default function HabitosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="HabitosList">
      <Stack.Screen name="HabitosList" component={Habitos} />
      <Stack.Screen name="CadastrarHabito" component={AddHabitScreen} />
      <Stack.Screen name="EditarHabito" component={EditHabitScreen} />
    </Stack.Navigator>
  );
}
