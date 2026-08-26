import { getOrderById, payOrder } from "@/api/order";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OrderItem = {
  id: number;
  createdAt: string;
  menuId: number;
  note: string | null;
  orderId: number;
  price: string;
  quantity: number;
  menu: {
    id: number;
    name: string;
  };
};

type OrderDetail = {
  id: number;
  amountReceived: string | null;
  changeAmount: string | null;
  createdAt: string;
  isPaid: boolean;
  items: OrderItem[];
  nameCustomer: string;
  paidAt: string | null;
  serviceCharge: string;
  source: string;
  status: string;
  subtotal: string;
  table: {
    capacity: number;
    createdAt: string;
    id: number;
    isAvailable: boolean;
    number: number;
  };
  tableId: number;
  total: string;
  updatedAt: string;
};

const formatRupiah = (value: number) => {
  return `Rp ${value.toLocaleString("id-ID")}`;
};

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [uangDiterimaText, setUangDiterimaText] = useState("0");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const idNumber = Number(id);

        if (!idNumber) {
          Alert.alert("Error", "ID order tidak valid.");
          router.back();
          return;
        }

        const response = await getOrderById(idNumber);

        console.log("ORDER DETAIL:", response.data);

        setOrder(response.data);

        if (response.data.amountReceived) {
          setUangDiterimaText(response.data.amountReceived);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);

        Alert.alert("Gagal", "Gagal mengambil detail order.", [
          {
            text: "Kembali",
            onPress: () => router.back(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF8F5]">
        <ActivityIndicator size="large" color="#FF6900" />

        <Text className="mt-3 text-sm text-[#88796D]">
          Memuat detail order...
        </Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF8F5]">
        <Ionicons name="alert-circle-outline" size={48} color="#FF6900" />

        <Text className="mt-3 text-base font-semibold text-[#5F5148]">
          Data order tidak ditemukan
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 rounded-xl bg-[#FF6900] px-5 py-3"
        >
          <Text className="font-bold text-white">Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const totalTagihan = Number(order.total);

  const numericUangDiterima =
    parseInt(uangDiterimaText.replace(/[^0-9]/g, ""), 10) || 0;

  const kembalian =
    numericUangDiterima >= totalTagihan
      ? numericUangDiterima - totalTagihan
      : 0;

  const quickAmounts = [50000, 100000, 150000, 200000];

  const handleSelectQuickAmount = (amount: number) => {
    setUangDiterimaText(amount.toString());
  };

  const handleUangPas = () => {
    setUangDiterimaText(totalTagihan.toString());
  };

  const handlePay = async () => {
  if (numericUangDiterima < totalTagihan) {
    Alert.alert(
      "Jumlah Uang Kurang",
      "Jumlah uang yang diterima kurang dari total tagihan.",
    );

    return;
  }

  try {
    setPaying(true);

    const response = await payOrder(
      order.id,
      numericUangDiterima,
    );

    console.log("PAY ORDER RESPONSE:", response);

    Alert.alert(
      "Pembayaran Berhasil",
      `Order ORD-${order.id} berhasil dibayar.\nKembalian: ${formatRupiah(
        kembalian,
      )}`,
      [
        {
          text: "OK",
          onPress: () => {
            router.replace("/(app)/home");
          },
        },
      ],
    );
  } catch (error: any) {
    console.error(
      "Failed to pay order:",
      error?.response?.data || error,
    );

    Alert.alert(
      "Pembayaran Gagal",
      error?.response?.data?.message ||
        "Terjadi kesalahan saat melakukan pembayaran.",
    );
  } finally {
    setPaying(false);
  }
};

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <View className="flex-row items-center justify-between border-b border-[#EAE4DC] bg-white px-6 py-5">
          <View>
            <Text className="text-2xl font-bold text-[#1F1F1F]">
              Checkout ORD-{order.id}
            </Text>

            <Text className="mt-1 text-[14px] font-medium text-[#88796D]">
              Meja {order.table.number} · {order.nameCustomer || "Pelanggan"} ·
              Dine-in
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center rounded-xl border border-[#EAE4DC] bg-white px-4 py-2.5"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color="#1F1F1F" />

            <Text className="ml-2 text-sm font-semibold text-[#1F1F1F]">
              Kembali
            </Text>
          </TouchableOpacity>
        </View>

        <View className="gap-6 px-6 pt-6">
          <View className="flex-1 rounded-3xl border border-[#EAE4DC] bg-white p-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-[#1F1F1F]">
                Rincian tagihan
              </Text>

              <View className="rounded-full bg-[#FFF0D9] px-4 py-1.5">
                <Text className="text-xs font-bold text-[#8A5A00]">
                  {order.status}
                </Text>
              </View>
            </View>

            <View className="gap-4 mt-6">
              {order.items.map((item) => {
                const price = Number(item.price);
                const totalPrice = price * item.quantity;

                return (
                  <View key={item.id}>
                    <View className="flex-row items-start justify-between">
                      <Text className="flex-1 text-base text-[#1F1F1F]">
                        <Text className="font-bold text-[#FF6900]">
                          {item.quantity}×
                        </Text>{" "}
                        <Text className="font-bold text-[#1F1F1F]">
                          {item.menu.name}
                        </Text>
                      </Text>

                      <Text className="ml-3 text-base font-bold text-[#1F1F1F]">
                        {formatRupiah(totalPrice)}
                      </Text>
                    </View>

                    <Text className="mt-1 text-xs text-[#88796D]">
                      {formatRupiah(price)} / item
                    </Text>

                    {item.note && (
                      <Text className="mt-1 text-xs text-[#88796D]">
                        Catatan: {item.note}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            <View className="my-6 h-[1px] bg-[#EAE4DC]" />

            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-[15px] font-medium text-[#88796D]">
                  Subtotal
                </Text>

                <Text className="text-[15px] font-medium text-[#88796D]">
                  {formatRupiah(Number(order.subtotal))}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-[15px] font-medium text-[#88796D]">
                  Service charge 10%
                </Text>

                <Text className="text-[15px] font-medium text-[#88796D]">
                  {formatRupiah(Number(order.serviceCharge))}
                </Text>
              </View>

              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-lg font-bold text-[#FF6900]">
                  Total tagihan
                </Text>

                <Text className="text-xl font-bold text-[#FF6900]">
                  {formatRupiah(totalTagihan)}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-1 rounded-3xl border border-[#EAE4DC] bg-white p-6">
            <Text className="text-xl font-bold text-[#1F1F1F]">
              Pembayaran tunai
            </Text>

            <View className="mt-5">
              <Text className="mb-2 text-sm font-semibold text-[#1F1F1F]">
                Uang diterima
              </Text>

              <View className="flex-row items-center rounded-xl border border-[#EAE4DC] bg-white px-4 py-3">
                <TextInput
                  value={uangDiterimaText}
                  onChangeText={setUangDiterimaText}
                  keyboardType="numeric"
                  editable={!paying}
                  className="flex-1 p-0 text-base font-medium text-[#1F1F1F]"
                  placeholder="0"
                  placeholderTextColor="#A09388"
                />
              </View>
            </View>

            <View className="mt-4 flex-row flex-wrap gap-2.5">
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => handleSelectQuickAmount(amount)}
                  disabled={paying}
                  className={`min-w-[100px] flex-1 items-center justify-center rounded-xl border border-[#EAE4DC] bg-white px-4 py-3 ${
                    numericUangDiterima === amount
                      ? "border-[#FF6900] bg-[#FFF5EB]"
                      : ""
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm font-bold ${
                      numericUangDiterima === amount
                        ? "text-[#FF6900]"
                        : "text-[#1F1F1F]"
                    }`}
                  >
                    {formatRupiah(amount)}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={handleUangPas}
                disabled={paying}
                className={`min-w-[100px] flex-1 items-center justify-center rounded-xl border border-[#EAE4DC] bg-white px-4 py-3 ${
                  numericUangDiterima === totalTagihan
                    ? "border-[#FF6900] bg-[#FFF5EB]"
                    : ""
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm font-bold ${
                    numericUangDiterima === totalTagihan
                      ? "text-[#FF6900]"
                      : "text-[#1F1F1F]"
                  }`}
                >
                  Uang pas
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-6 rounded-2xl bg-[#FFF0E5] p-5">
              <Text className="text-xs font-bold text-[#88796D]">
                Kembalian
              </Text>

              <Text className="mt-1 text-2xl font-bold text-[#1F1F1F]">
                {formatRupiah(kembalian)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handlePay}
              disabled={numericUangDiterima < totalTagihan || paying}
              className={`mt-6 h-14 flex-row items-center justify-center rounded-xl ${
                numericUangDiterima >= totalTagihan && !paying
                  ? "bg-[#FF6900]"
                  : "bg-[#FDBA74]"
              }`}
              activeOpacity={0.8}
            >
              {paying ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />

                  <Text className="ml-2 text-base font-bold text-white">
                    Memproses pembayaran...
                  </Text>
                </>
              ) : (
                <Text className="text-base font-bold text-white">
                  Bayar & tandai Paid
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
