import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Keluar", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFFEFC]">
      <View className="px-5 pt-6">
        <Text className="text-3xl font-bold text-[#1F1F1F]">Profil</Text>
        <Text className="mt-1 text-[15px] text-[#88796D]">
          Pengaturan akun Anda
        </Text>

        <TouchableOpacity
          className="mt-8 h-[52px] items-center justify-center rounded-xl border border-[#FF6900]"
          onPress={handleLogout}
        >
          <Text className="text-base font-bold text-[#FF6900]">Keluar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
