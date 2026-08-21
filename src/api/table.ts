import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

export const getAllTable = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await api.get("/tables", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error during fetch data:", error);
    throw error;
  }
};
