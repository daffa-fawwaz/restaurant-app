import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { login } from "../api/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Login gagal", "Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        email,
        password,
      });

      await AsyncStorage.setItem("token", response.data.accessToken);
      router.replace("/home");
    } catch (error) {
      console.error(error);
      Alert.alert("Login gagal", "Email atau password tidak valid. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="justify-center flex-1 px-6">
          <View className="mb-10">
            <Text className="mb-8 text-2xl font-bold text-[#E86A33]">
              WARUNGKU
            </Text>

            <Text className="mb-2 text-3xl font-bold text-[#1F1F1F]">
              Welcome Back
            </Text>

            <Text className="text-[15px] text-[#777777]">
              Login untuk melanjutkan ke aplikasi
            </Text>
          </View>

          {/* Form */}
          <View>
            {/* Email */}
            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-[#333333]">
                Email
              </Text>

              <TextInput
                className="h-[52px] rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-4 text-[15px] text-[#222222]"
                placeholder="Masukkan email"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-[#333333]">
                Password
              </Text>

              <View className="h-[52px] flex-row items-center rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-4">
                <TextInput
                  className="flex-1 text-[15px] text-[#222222]"
                  placeholder="Masukkan password"
                  placeholderTextColor="#A0A0A0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text className="text-[13px] font-semibold text-[#E86A33]">
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="self-end mb-6">
              <Text className="text-[13px] font-semibold text-[#E86A33]">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className="h-[52px] items-center justify-center rounded-xl bg-[#E86A33]"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-bold text-white">
                  Login
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Register */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-sm text-[#777777]">
              Belum punya akun?{" "}
            </Text>

            <TouchableOpacity>
              <Text className="text-sm font-bold text-[#E86A33]">
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
