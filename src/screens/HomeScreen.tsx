import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter } from "expo-router";

import { changeStatusOrder, getAllOrder } from "@/api/order";
import { Order } from "@/types/Order";

const formatRupiah = (value: number) => {
  return `Rp ${value.toLocaleString("id-ID")}`;
};

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response = await getAllOrder();

      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setError("Gagal mengambil data order.");
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleChangeStatus = async (orderId: number, status: string) => {
    try {
      await changeStatusOrder(orderId, status);

      await fetchOrders();
    } catch (error) {
      console.error("Failed to change status order:", error);
      setError("Gagal mengubah status order.");
    }
  };

  const inProgress = orders.filter(
    (order) => order.status !== "SERVED" && order.status !== "PAID",
  ).length;

  const served = orders.filter((order) => order.status === "SERVED").length;

  const totalRevenue = orders
    .filter((order) => order.isPaid)
    .reduce((total, order) => total + Number(order.total), 0);

  const handleCheckout = (orderId: number) => {
    router.push({
      pathname: "/(app)/checkout",
      params: {
        id: orderId.toString(),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFFEFC]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrders(true)}
            colors={["#FF6900"]}
            tintColor="#FF6900"
          />
        }
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        <View className="border-b border-[#EAE4DC] px-5 pb-5 pt-4">
          <Text className="text-3xl font-bold text-[#1F1F1F]">Dashboard</Text>

          <Text className="mt-1 text-[15px] font-medium text-[#88796D]">
            Ringkasan aktivitas restaurant
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 20,
            gap: 12,
          }}
        >
          {/* In Progress */}
          <View className="h-[105px] w-[245px] rounded-2xl border border-[#EAE4DC] bg-white p-5 shadow-sm">
            <View className="flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF5EB]">
                <Ionicons name="restaurant-outline" size={24} color="#FF6900" />
              </View>

              <View className="ml-4">
                <Text className="text-[14px] font-semibold text-[#88796D]">
                  In Progress
                </Text>

                <Text className="mt-1 text-2xl font-bold text-[#1F1F1F]">
                  {inProgress}
                </Text>
              </View>
            </View>
          </View>

          {/* Served */}
          <View className="h-[105px] w-[245px] rounded-2xl border border-[#EAE4DC] bg-white p-5 shadow-sm">
            <View className="flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF5EB]">
                <Ionicons
                  name="checkmark-circle-outline"
                  size={25}
                  color="#FF6900"
                />
              </View>

              <View className="ml-4">
                <Text className="text-[14px] font-semibold text-[#88796D]">
                  Served
                </Text>

                <Text className="mt-1 text-2xl font-bold text-[#1F1F1F]">
                  {served}
                </Text>
              </View>
            </View>
          </View>

          <View className="h-[105px] w-[245px] rounded-2xl border border-[#EAE4DC] bg-white p-5 shadow-sm">
            <View className="flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF5EB]">
                <Ionicons name="wallet-outline" size={24} color="#FF6900" />
              </View>

              <View className="flex-1 ml-4">
                <Text className="text-[14px] font-semibold text-[#88796D]">
                  Total Pendapatan
                </Text>

                <Text
                  className="mt-1 text-xl font-bold text-[#1F1F1F]"
                  numberOfLines={1}
                >
                  {formatRupiah(totalRevenue)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Orders Header */}
        <View className="px-5 mb-3">
          <Text className="text-xl font-bold text-[#1F1F1F]">New Orders</Text>

          <Text className="mt-1 text-sm text-[#88796D]">
            Pesanan yang sedang diproses
          </Text>
        </View>

        {/* Loading */}
        {loading && (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color="#FF6900" />

            <Text className="mt-3 text-sm text-[#88796D]">
              Memuat pesanan...
            </Text>
          </View>
        )}

        {/* Error */}
        {!loading && error && (
          <View className="mx-5 items-center rounded-2xl border border-[#EAE4DC] bg-white px-5 py-10">
            <Ionicons name="alert-circle-outline" size={42} color="#FF6900" />

            <Text className="mt-3 text-base font-semibold text-[#5F5148]">
              {error}
            </Text>

            <TouchableOpacity
              onPress={fetchOrders}
              className="mt-4 rounded-xl bg-[#FF6900] px-5 py-3"
            >
              <Text className="font-bold text-white">Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Orders */}
        {!loading && !error && (
          <View className="px-5">
            {orders.length === 0 ? (
              <View className="items-center rounded-2xl border border-[#EAE4DC] bg-white px-5 py-10">
                <Ionicons name="receipt-outline" size={42} color="#B8AAA0" />

                <Text className="mt-3 text-base font-semibold text-[#5F5148]">
                  Belum ada pesanan
                </Text>

                <Text className="mt-1 text-center text-sm text-[#998A7E]">
                  Pesanan baru akan muncul di sini.
                </Text>
              </View>
            ) : (
              orders.map((order) => {
                const time = new Date(order.createdAt).toLocaleTimeString(
                  "id-ID",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                );

                return (
                  <View
                    key={order.id}
                    className="mb-4 rounded-2xl border border-[#EAE4DC] bg-white p-5 shadow-sm"
                  >
                    {/* Order Header */}
                    <View className="flex-row items-start">
                      <View className="flex-1 pr-3">
                        <Text className="text-[14px] font-semibold text-[#88796D]">
                          ORD-{order.id} · {time}
                        </Text>

                        <Text className="mt-2 text-2xl font-bold text-[#1F1F1F]">
                          Meja {order.table.number}
                        </Text>

                        <Text className="mt-1 text-[14px] text-[#88796D]">
                          {order.nameCustomer
                            ? `Pelanggan · ${order.nameCustomer}`
                            : "Pelanggan · Umum"}
                        </Text>
                      </View>

                      {/* Status */}
                      <View
                        className={`max-w-[110px] flex-shrink rounded-full px-3 py-2 ${
                          order.status === "SERVED"
                            ? "bg-[#EAF8EF]"
                            : order.status === "PAID"
                              ? "bg-[#E8F0FF]"
                              : "bg-[#FFF0D9]"
                        }`}
                      >
                        <Text
                          className="text-xs font-bold text-[#8A5A00]"
                          numberOfLines={1}
                        >
                          {order.status}
                        </Text>
                      </View>
                    </View>

                    {/* Divider */}
                    <View className="my-5 h-[1px] bg-[#EAE4DC]" />

                    {/* Items */}
                    <View className="gap-3">
                      {order.items.map((item) => (
                        <View
                          key={item.id}
                          className="flex-row items-center justify-between"
                        >
                          <View className="flex-row items-center flex-1">
                            <Text className="text-sm font-bold text-[#FF6900]">
                              {item.quantity}x
                            </Text>

                            <Text
                              className="ml-2 flex-shrink text-[15px] font-medium text-[#332C28]"
                              numberOfLines={1}
                            >
                              {item.menu.name}
                            </Text>
                          </View>

                          <Text className="ml-3 text-[15px] font-medium text-[#88796D]">
                            {formatRupiah(Number(item.price) * item.quantity)}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Divider */}
                    <View className="my-5 h-[1px] bg-[#EAE4DC]" />

                    {/* Summary */}
                    <View className="gap-2">
                      <View className="flex-row justify-between">
                        <Text className="text-[15px] text-[#88796D]">
                          Subtotal
                        </Text>

                        <Text className="text-[15px] text-[#88796D]">
                          {formatRupiah(Number(order.subtotal))}
                        </Text>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-[15px] text-[#88796D]">
                          Service charge 10%
                        </Text>

                        <Text className="text-[15px] text-[#88796D]">
                          {formatRupiah(Number(order.serviceCharge))}
                        </Text>
                      </View>

                      <View className="flex-row justify-between mt-1">
                        <Text className="text-lg font-bold text-[#FF6900]">
                          Total
                        </Text>

                        <Text className="text-lg font-bold text-[#FF6900]">
                          {formatRupiah(Number(order.total))}
                        </Text>
                      </View>
                    </View>

                    {/* Actions */}
                    <View className="gap-3 mt-5">
                      <TouchableOpacity
                        className="h-[50px] flex-row items-center justify-center rounded-xl border border-[#EAE4DC] bg-white"
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="print-outline"
                          size={20}
                          color="#332C28"
                        />

                        <Text className="ml-2 text-[15px] font-bold text-[#332C28]">
                          Print
                        </Text>
                      </TouchableOpacity>

                      {order.status === "PAID" ? null : (
                        <View className="flex-row gap-3">
                          {order.status === "SERVED" && (
                            <TouchableOpacity
                              onPress={() =>
                                handleChangeStatus(order.id, "IN_PROGRESS")
                              }
                              className="h-[50px] w-[52px] flex-row items-center justify-center rounded-xl border border-[#EAE4DC] bg-white"
                              activeOpacity={0.8}
                            >
                              <Ionicons
                                name="arrow-back-outline"
                                size={20}
                                color="#332C28"
                              />
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            onPress={() => {
                              if (order.status === "IN_PROGRESS") {
                                handleChangeStatus(order.id, "SERVED");
                              } else {
                                handleCheckout(order.id);
                              }
                            }}
                            className="h-[50px] flex-1 flex-row items-center justify-center rounded-xl bg-[#FF6900]"
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name={
                                order.status === "IN_PROGRESS"
                                  ? "checkmark-circle-outline"
                                  : "card-outline"
                              }
                              size={20}
                              color="#FFFFFF"
                            />

                            <Text className="ml-2 text-[15px] font-bold text-white">
                              {order.status === "IN_PROGRESS"
                                ? "Served"
                                : "Checkout"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
