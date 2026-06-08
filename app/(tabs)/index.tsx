import "@/global.css";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-7xl font-sans-extrabold">Home</Text>
      <Text className="text-7xl font-bold text-blue-500">
        Welcome to Recurrly!
      </Text>
      <Link
        href="/onboarding"
        className="mt-4 rounded font-bold bg-primary text-white p-4"
      >
        Go to Onboarding
      </Link>
      <Link
        href="/(auth)/sign-up"
        className="mt-4 rounded font-bold bg-primary text-white p-4"
      >
        Go to Sign Up
      </Link>
      <Link
        href="/(auth)/sign-in"
        className="mt-4 rounded font-bold bg-primary text-white p-4"
      >
        Go to Sign In
      </Link>
    </SafeAreaView>
  );
}
