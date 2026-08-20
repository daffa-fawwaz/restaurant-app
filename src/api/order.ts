import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

export const getAllOrder = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await api.get("/order/", {
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

export const changeStatusOrder = async (id: number, status: string) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await api.patch(
      `/order/${id}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error during fetch data:", error);
    throw error;
  }
};
