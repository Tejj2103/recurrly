import { useClerk, useUser } from "@clerk/expo";
import { styled } from "nativewind";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useClerk();
  const { user } = useUser();

  const displayEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.identifier ||
    "Your account";

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="home-header">
        <Text className="list-title">Settings</Text>
      </View>
      <View className="auth-card">
        <View className="auth-field">
          <Text className="auth-label">Signed in as</Text>
          <Text className="auth-subtitle">{displayEmail}</Text>
        </View>
        <Pressable onPress={() => signOut()} className="auth-button">
          <Text className="text-base font-sans-bold text-background">
            Sign out
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
