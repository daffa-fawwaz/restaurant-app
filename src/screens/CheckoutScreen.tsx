import { getOrderById } from "@/api/order";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatRupiah = (value: number) => {
  return `Rp ${value.toLocaleString("id-ID")}`;
};

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    console.log(id);
    const idNumber = Number(id);
    const fecthData = async () => {
      try {
        const response = await getOrderById(idNumber);
        console.log(response.data);
      } catch (error) {}
    };
    fecthData();
  }, []);

  const dummyOrder = {
    id: "ORD-15",
    table: "Meja 1",
    customer: "Pelanggan",
    orderType: "Dine-in",
    status: "Served",
    items: [
      {
        id: 1,
        name: "ayam geprek",
        quantity: 1,
        pricePerUnit: 15000,
        totalPrice: 15000,
        unitLabel: "porsi",
      },
    ],
    subtotal: 15000,
    serviceChargePercent: 10,
    serviceCharge: 1500,
    totalTagihan: 16500,
  };

  const [uangDiterimaText, setUangDiterimaText] = useState<string>("0");

  const numericUangDiterima =
    parseInt(uangDiterimaText.replace(/[^0-9]/g, ""), 10) || 0;
  const kembalian =
    numericUangDiterima >= dummyOrder.totalTagihan
      ? numericUangDiterima - dummyOrder.totalTagihan
      : 0;

  const quickAmounts = [50000, 100000, 150000, 200000];

  const handleSelectQuickAmount = (amount: number) => {
    setUangDiterimaText(amount.toString());
  };

  const handleUangPas = () => {
    setUangDiterimaText(dummyOrder.totalTagihan.toString());
  };

  const handlePay = () => {
    if (numericUangDiterima < dummyOrder.totalTagihan) {
      Alert.alert(
        "Jumlah Uang Less",
        "Jumlah uang yang diterima kurang dari total tagihan.",
      );
      return;
    }

    Alert.alert(
      "Pembayaran Berhasil",
      `Order ${dummyOrder.id} telah ditandai Paid.\nKembalian: ${formatRupiah(kembalian)}`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header Bar */}
        <View className="flex-row items-center justify-between border-b border-[#EAE4DC] bg-white px-6 py-5 shadow-xs">
          <View>
            <Text className="text-2xl font-bold text-[#1F1F1F]">
              Checkout {dummyOrder.id}
            </Text>
            <Text className="mt-1 text-[14px] font-medium text-[#88796D]">
              {dummyOrder.table} · {dummyOrder.customer} ·{" "}
              {dummyOrder.orderType}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center rounded-xl border border-[#EAE4DC] bg-white px-4 py-2.5 shadow-xs"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color="#1F1F1F" />
            <Text className="ml-2 text-sm font-semibold text-[#1F1F1F]">
              Kembali
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Container (Card Grid / Layout) */}
        <View className="gap-6 px-6 pt-6 md:flex-row">
          {/* Left Card: Rincian Tagihan */}
          <View className="flex-1 rounded-3xl border border-[#EAE4DC] bg-white p-6 shadow-sm">
            {/* Card Header & Status Badge */}
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-[#1F1F1F]">
                Rincian tagihan
              </Text>
              <View className="rounded-full bg-[#FFF0D9] px-4 py-1.5">
                <Text className="text-xs font-bold text-[#8A5A00]">
                  {dummyOrder.status}
                </Text>
              </View>
            </View>

            <View className="gap-4 mt-6">
              {dummyOrder.items.map((item) => (
                <View key={item.id}>
                  <View className="flex-row items-start justify-between">
                    <Text className="text-base text-[#1F1F1F]">
                      <Text className="font-bold text-[#FF6900]">
                        {item.quantity}×
                      </Text>{" "}
                      <Text className="font-bold text-[#1F1F1F]">
                        {item.name}
                      </Text>
                    </Text>
                    <Text className="text-base font-bold text-[#1F1F1F]">
                      {formatRupiah(item.totalPrice)}
                    </Text>
                  </View>
                  <Text className="mt-1 text-xs text-[#88796D]">
                    {formatRupiah(item.pricePerUnit)} / {item.unitLabel}
                  </Text>
                </View>
              ))}
            </View>

            {/* Divider */}
            <View className="my-6 h-[1px] bg-[#EAE4DC]" />

            {/* Price Calculations */}
            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-[15px] font-medium text-[#88796D]">
                  Subtotal
                </Text>
                <Text className="text-[15px] font-medium text-[#88796D]">
                  {formatRupiah(dummyOrder.subtotal)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-[15px] font-medium text-[#88796D]">
                  Service charge {dummyOrder.serviceChargePercent}%
                </Text>
                <Text className="text-[15px] font-medium text-[#88796D]">
                  {formatRupiah(dummyOrder.serviceCharge)}
                </Text>
              </View>

              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-lg font-bold text-[#FF6900]">
                  Total tagihan
                </Text>
                <Text className="text-xl font-bold text-[#FF6900]">
                  {formatRupiah(dummyOrder.totalTagihan)}
                </Text>
              </View>
            </View>
          </View>

          {/* Right Card: Pembayaran Tunai */}
          <View className="flex-1 rounded-3xl border border-[#EAE4DC] bg-white p-6 shadow-sm">
            <Text className="text-xl font-bold text-[#1F1F1F]">
              Pembayaran tunai
            </Text>

            {/* Uang Diterima Input */}
            <View className="mt-5">
              <Text className="text-sm font-semibold text-[#1F1F1F] mb-2">
                Uang diterima
              </Text>
              <View className="flex-row items-center rounded-xl border border-[#EAE4DC] bg-white px-4 py-3">
                <TextInput
                  value={uangDiterimaText}
                  onChangeText={(text) => setUangDiterimaText(text)}
                  keyboardType="numeric"
                  className="flex-1 text-base font-medium text-[#1F1F1F] p-0"
                  placeholder="0"
                  placeholderTextColor="#A09388"
                />
              </View>
            </View>

            {/* Quick Amounts Grid */}
            <View className="mt-4 flex-row flex-wrap gap-2.5">
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => handleSelectQuickAmount(amount)}
                  className={`rounded-xl border border-[#EAE4DC] bg-white px-4 py-3 flex-1 min-w-[100px] items-center justify-center ${
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
                className={`rounded-xl border border-[#EAE4DC] bg-white px-4 py-3 flex-1 min-w-[100px] items-center justify-center ${
                  numericUangDiterima === dummyOrder.totalTagihan
                    ? "border-[#FF6900] bg-[#FFF5EB]"
                    : ""
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm font-bold ${
                    numericUangDiterima === dummyOrder.totalTagihan
                      ? "text-[#FF6900]"
                      : "text-[#1F1F1F]"
                  }`}
                >
                  Uang pas
                </Text>
              </TouchableOpacity>
            </View>

            {/* Kembalian Box */}
            <View className="mt-6 rounded-2xl bg-[#FFF0E5] p-5">
              <Text className="text-xs font-bold text-[#88796D]">
                Kembalian
              </Text>
              <Text className="mt-1 text-2xl font-bold text-[#1F1F1F]">
                {formatRupiah(kembalian)}
              </Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={handlePay}
              className={`mt-6 h-14 rounded-xl items-center justify-center ${
                numericUangDiterima >= dummyOrder.totalTagihan
                  ? "bg-[#FF6900]"
                  : "bg-[#FDBA74]"
              }`}
              activeOpacity={0.8}
            >
              <Text className="text-base font-bold text-white">
                Bayar & tandai Paid
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
