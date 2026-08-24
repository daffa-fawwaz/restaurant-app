import { CreateOrderPayload } from "@/types/Order";
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

export const createOrder = async (data: CreateOrderPayload) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await api.post("/order", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error during create data:", error);
    throw error;
  }
};

export const payOrder = async (id: number, amount: number) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await api.post(
      `/order/${id}/pay`,
      { amount },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error during pay order:", error);
    throw error;
  }
};

export const getOrderById = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await api.get(`/order/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error during pay order:", error);
    throw error;
  }
};
