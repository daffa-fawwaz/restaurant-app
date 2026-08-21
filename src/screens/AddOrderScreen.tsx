import { createOrder } from "@/api/order";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAllMenu } from "@/api/menu";
import { getAllTable } from "@/api/table";

type Table = {
  id: number;
  number: number;
  capacity: number;
  isAvailable: boolean;
  createdAt: string;
};

type Menu = {
  id: number;
  name: string;
  price: string;
  category: string;
  description: string;
  image: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

type CartItem = Menu & {
  quantity: number;
};

const formatRupiah = (value: number) => {
  return `Rp ${value.toLocaleString("id-ID")}`;
};

export default function OrderScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);

  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");

  const [orderType, setOrderType] = useState<"WALK_IN" | "DINE_IN">("WALK_IN");

  const [cart, setCart] = useState<CartItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [tableResponse, menuResponse] = await Promise.all([
        getAllTable(),
        getAllMenu(),
      ]);

      console.log("TABLE DATA:", tableResponse.data);
      console.log("MENU DATA:", menuResponse.data);

      setTables(tableResponse.data);
      setMenus(menuResponse.data);
    } catch (error) {
      console.error("Failed to fetch order data:", error);
      setError("Gagal mengambil data meja dan menu.");
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableTables = useMemo(() => {
    return tables.filter((table) => table.isAvailable);
  }, [tables]);

  useEffect(() => {
    if (availableTables.length === 0) {
      setSelectedTable(null);
      return;
    }

    const selectedStillAvailable = availableTables.some(
      (table) => table.id === selectedTable,
    );

    if (!selectedStillAvailable) {
      setSelectedTable(availableTables[0].id);
    }
  }, [availableTables, selectedTable]);

  const availableMenus = useMemo(() => {
    return menus.filter((menu) => menu.isAvailable);
  }, [menus]);

  const categories = useMemo(() => {
    return [...new Set(availableMenus.map((menu) => menu.category))];
  }, [availableMenus]);

  const getQuantity = (menuId: number) => {
    return cart.find((item) => item.id === menuId)?.quantity ?? 0;
  };

  const addToCart = (menu: Menu) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === menu.id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === menu.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          ...menu,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (menuId: number) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === menuId);

      if (!existingItem) {
        return currentCart;
      }

      if (existingItem.quantity === 1) {
        return currentCart.filter((item) => item.id !== menuId);
      }

      return currentCart.map((item) =>
        item.id === menuId
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item,
      );
    });
  };

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      return total + Number(item.price) * item.quantity;
    }, 0);
  }, [cart]);

  const serviceCharge = useMemo(() => {
    return subtotal * 0.1;
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + serviceCharge;
  }, [subtotal, serviceCharge]);

  const handleSubmit = async () => {
    if (!selectedTable) {
      Alert.alert("Meja belum dipilih", "Silakan pilih meja terlebih dahulu.");
      return;
    }

    if (cart.length === 0) {
      Alert.alert("Pesanan kosong", "Silakan pilih menu terlebih dahulu.");
      return;
    }

    try {
      const selectedTableData = tables.find(
        (table) => table.id === selectedTable,
      );

      const payload = {
        tableId: selectedTable,
        source: "ADMIN",
        nameCustomer: customerName || null,
        items: cart.map((item) => ({
          menuId: item.id,
          quantity: item.quantity,
        })),
      };

      console.log("ORDER PAYLOAD:", payload);

      await createOrder(payload);

      Alert.alert(
        "Pesanan berhasil",
        `Pesanan meja ${selectedTableData?.number} berhasil dibuat dan dikirim ke dapur.`,
        [
          {
            text: "OK",
            onPress: () => {
              setCart([]);
              setCustomerName("");
              router.replace("/(app)/home");
            },
          },
        ],
      );
    } catch (error: any) {
      console.error("Failed to create order:", error?.response?.data || error);

      Alert.alert(
        "Gagal membuat pesanan",
        error?.response?.data?.message ||
          "Terjadi kesalahan saat membuat pesanan.",
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FFFEFC]">
        <ActivityIndicator size="large" color="#FF6900" />
        <Text className="mt-3 text-sm text-[#88796D]">Memuat data menu...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-[#FFFEFC]">
        <View className="items-center justify-center flex-1 px-5">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF3E8]">
            <Ionicons name="alert-circle-outline" size={34} color="#FF6900" />
          </View>

          <Text className="mt-4 text-center text-lg font-bold text-[#332C28]">
            Terjadi kesalahan
          </Text>

          <Text className="mt-2 text-center text-sm text-[#88796D]">
            {error}
          </Text>

          <TouchableOpacity
            onPress={fetchData}
            activeOpacity={0.8}
            className="mt-5 rounded-xl bg-[#FF6900] px-6 py-3"
          >
            <Text className="font-bold text-white">Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FFFEFC]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            colors={["#FF6900"]}
            tintColor="#FF6900"
          />
        }
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <View className="border-b border-[#EAE4DC] px-5 pb-5 pt-4">
          <Text className="text-3xl font-bold text-[#2A231F]">New Order</Text>

          <Text className="mt-1 text-[15px] font-medium text-[#88796D]">
            Buat pesanan baru untuk pelanggan
          </Text>
        </View>

        <View className="px-5 pt-5">
          <View className="rounded-2xl border border-[#EAE4DC] bg-white p-5">
            <View className="flex-row items-center mb-5">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#FFF3E8]">
                <Ionicons name="person-outline" size={22} color="#FF6900" />
              </View>

              <View className="ml-3">
                <Text className="text-xl font-bold text-[#2A231F]">
                  Detail pelanggan
                </Text>

                <Text className="mt-0.5 text-sm text-[#88796D]">
                  Informasi pesanan
                </Text>
              </View>
            </View>

            <Text className="mb-2 text-sm font-semibold text-[#332C28]">
              Nomor meja
            </Text>

            {availableTables.length === 0 ? (
              <View className="rounded-xl border border-[#EAE4DC] bg-[#FFFEFC] p-4">
                <View className="flex-row items-center">
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color="#FF6900"
                  />

                  <Text className="ml-2 text-sm font-medium text-[#88796D]">
                    Tidak ada meja yang tersedia.
                  </Text>
                </View>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 8,
                  paddingBottom: 4,
                }}
              >
                {availableTables.map((table) => {
                  const selected = selectedTable === table.id;

                  return (
                    <TouchableOpacity
                      key={table.id}
                      onPress={() => setSelectedTable(table.id)}
                      activeOpacity={0.8}
                      className={`min-w-[120px] rounded-xl border px-4 py-3 ${
                        selected
                          ? "border-[#FF6900] bg-[#FF6900]"
                          : "border-[#EAE4DC] bg-white"
                      }`}
                    >
                      <Text
                        className={`text-center text-sm font-bold ${
                          selected ? "text-white" : "text-[#332C28]"
                        }`}
                      >
                        Meja {table.number}
                      </Text>

                      <Text
                        className={`mt-1 text-center text-xs ${
                          selected ? "text-white/80" : "text-[#88796D]"
                        }`}
                      >
                        {table.capacity} orang
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <View className="mt-5">
              <Text className="mb-2 text-sm font-semibold text-[#332C28]">
                Nama pelanggan
              </Text>

              <View className="h-[50px] flex-row items-center rounded-xl border border-[#EAE4DC] bg-[#FFFEFC] px-4">
                <Ionicons name="person-outline" size={18} color="#998A7E" />

                <TextInput
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Opsional"
                  placeholderTextColor="#998A7E"
                  className="ml-3 flex-1 text-[15px] text-[#332C28]"
                />
              </View>
            </View>

            <View className="mt-5">
              <Text className="mb-2 text-sm font-semibold text-[#332C28]">
                Tipe pesanan
              </Text>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setOrderType("WALK_IN")}
                  activeOpacity={0.8}
                  className={`flex-1 flex-row items-center justify-center rounded-xl border py-3 ${
                    orderType === "WALK_IN"
                      ? "border-[#FF6900] bg-[#FF6900]"
                      : "border-[#EAE4DC] bg-white"
                  }`}
                >
                  <Ionicons
                    name="walk-outline"
                    size={18}
                    color={orderType === "WALK_IN" ? "#FFFFFF" : "#332C28"}
                  />

                  <Text
                    className={`ml-2 font-bold ${
                      orderType === "WALK_IN" ? "text-white" : "text-[#332C28]"
                    }`}
                  >
                    Walk-in
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setOrderType("DINE_IN")}
                  activeOpacity={0.8}
                  className={`flex-1 flex-row items-center justify-center rounded-xl border py-3 ${
                    orderType === "DINE_IN"
                      ? "border-[#FF6900] bg-[#FF6900]"
                      : "border-[#EAE4DC] bg-white"
                  }`}
                >
                  <Ionicons
                    name="restaurant-outline"
                    size={18}
                    color={orderType === "DINE_IN" ? "#FFFFFF" : "#332C28"}
                  />

                  <Text
                    className={`ml-2 font-bold ${
                      orderType === "DINE_IN" ? "text-white" : "text-[#332C28]"
                    }`}
                  >
                    Dine-in
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {categories.length === 0 ? (
            <View className="mt-5 items-center rounded-2xl border border-[#EAE4DC] bg-white px-5 py-10">
              <Ionicons name="restaurant-outline" size={42} color="#B8AAA0" />

              <Text className="mt-3 text-base font-bold text-[#332C28]">
                Belum ada menu
              </Text>

              <Text className="mt-1 text-center text-sm text-[#88796D]">
                Menu yang tersedia akan muncul di sini.
              </Text>
            </View>
          ) : (
            categories.map((category) => {
              const categoryMenus = availableMenus.filter(
                (menu) => menu.category === category,
              );

              return (
                <View
                  key={category}
                  className="mt-5 rounded-2xl border border-[#EAE4DC] bg-white p-5"
                >
                  <View className="flex-row items-center mb-4">
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FFF3E8]">
                      <Ionicons
                        name="restaurant-outline"
                        size={19}
                        color="#FF6900"
                      />
                    </View>

                    <Text className="ml-3 text-xl font-bold text-[#2A231F]">
                      {category}
                    </Text>
                  </View>

                  <View className="gap-3">
                    {categoryMenus.map((menu) => {
                      const quantity = getQuantity(menu.id);

                      return (
                        <View
                          key={menu.id}
                          className="flex-row items-center rounded-xl border border-[#EAE4DC] bg-[#FFFEFC] p-3"
                        >
                          <View className="flex-1 pr-2">
                            <Text
                              className="text-[15px] font-bold text-[#332C28]"
                              numberOfLines={1}
                            >
                              {menu.name}
                            </Text>

                            <Text className="mt-1 text-sm text-[#88796D]">
                              {formatRupiah(Number(menu.price))}
                            </Text>
                          </View>

                          <View className="flex-row items-center">
                            <TouchableOpacity
                              onPress={() => removeFromCart(menu.id)}
                              disabled={quantity === 0}
                              activeOpacity={0.8}
                              className={`h-10 w-10 items-center justify-center rounded-xl border ${
                                quantity === 0
                                  ? "border-[#F0ECE8] bg-white"
                                  : "border-[#EAE4DC] bg-white"
                              }`}
                            >
                              <Ionicons
                                name="remove"
                                size={18}
                                color={quantity === 0 ? "#D6CEC7" : "#332C28"}
                              />
                            </TouchableOpacity>

                            <Text className="mx-4 min-w-[18px] text-center text-[15px] font-bold text-[#332C28]">
                              {quantity}
                            </Text>

                            <TouchableOpacity
                              onPress={() => addToCart(menu)}
                              activeOpacity={0.8}
                              className="h-10 w-10 items-center justify-center rounded-xl bg-[#FF6900]"
                            >
                              <Ionicons name="add" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })
          )}

          <View className="mt-5 rounded-2xl border border-[#EAE4DC] bg-white p-5">
            <View className="flex-row items-center">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#FFF3E8]">
                <Ionicons name="receipt-outline" size={22} color="#FF6900" />
              </View>

              <View className="ml-3">
                <Text className="text-xl font-bold text-[#2A231F]">
                  Ringkasan pesanan
                </Text>

                <Text className="mt-0.5 text-sm text-[#88796D]">
                  {cart.length === 0
                    ? "Belum ada item dipilih"
                    : `${cart.length} jenis menu dipilih`}
                </Text>
              </View>
            </View>

            {cart.length > 0 && (
              <View className="gap-3 mt-5">
                {cart.map((item) => (
                  <View
                    key={item.id}
                    className="flex-row items-center justify-between"
                  >
                    <View className="flex-1 pr-3">
                      <Text
                        className="text-sm font-semibold text-[#332C28]"
                        numberOfLines={1}
                      >
                        {item.quantity}x {item.name}
                      </Text>

                      <Text className="mt-1 text-xs text-[#88796D]">
                        {formatRupiah(Number(item.price))} / item
                      </Text>
                    </View>

                    <Text className="text-sm font-bold text-[#332C28]">
                      {formatRupiah(Number(item.price) * item.quantity)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View className="my-5 h-[1px] bg-[#EAE4DC]" />

            <View className="flex-row justify-between">
              <Text className="text-[15px] text-[#88796D]">Subtotal</Text>

              <Text className="text-[15px] font-medium text-[#332C28]">
                {formatRupiah(subtotal)}
              </Text>
            </View>

            <View className="flex-row justify-between mt-3">
              <Text className="text-[15px] text-[#88796D]">
                Service charge 10%
              </Text>

              <Text className="text-[15px] font-medium text-[#332C28]">
                {formatRupiah(serviceCharge)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between mt-4">
              <Text className="text-xl font-bold text-[#FF6900]">Total</Text>

              <Text className="text-xl font-bold text-[#FF6900]">
                {formatRupiah(total)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={cart.length === 0 || selectedTable === null}
              activeOpacity={0.8}
              className={`mt-5 h-[52px] flex-row items-center justify-center rounded-xl ${
                cart.length > 0 && selectedTable !== null
                  ? "bg-[#FF6900]"
                  : "bg-[#FFC5A7]"
              }`}
            >
              <Ionicons name="send-outline" size={19} color="#FFFFFF" />

              <Text className="ml-2 text-[15px] font-bold text-white">
                Simpan & kirim ke dapur
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
