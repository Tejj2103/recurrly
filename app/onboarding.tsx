import { useAuth } from "@clerk/expo";
import { Link, Redirect, useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Onboarding = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/" replace />;
  }

  return (
    <SafeAreaView className="auth-safe-area">
      <ScrollView
        className="auth-content"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="auth-brand-block">
          <View className="auth-logo-wrap">
            <View className="auth-logo-mark">
              <Text className="auth-logo-mark-text">S</Text>
            </View>
            <View>
              <Text className="auth-wordmark">Subscribe</Text>
              <Text className="auth-wordmark-sub">billing made easy</Text>
            </View>
          </View>

          <Text className="auth-title">Stay on top of every renewal</Text>
          <Text className="auth-subtitle">
            Track subscriptions, control your billing, and never miss a payment
            again with a simple dashboard built for busy makers.
          </Text>
        </View>

        <View className="auth-card">
          <View className="onboarding-features">
            <View className="onboarding-feature">
              <Text className="onboarding-feature-title">
                All plans in one place
              </Text>
              <Text className="onboarding-feature-copy">
                See every renewal date and subscription cost at a glance.
              </Text>
            </View>
            <View className="onboarding-feature">
              <Text className="onboarding-feature-title">Smart reminders</Text>
              <Text className="onboarding-feature-copy">
                Get notified before payments hit your account so you can decide.
              </Text>
            </View>
            <View className="onboarding-feature">
              <Text className="onboarding-feature-title">Secure sign in</Text>
              <Text className="onboarding-feature-copy">
                Sign in with email, password, or social accounts like Google.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/sign-in")}
            className="auth-button"
          >
            <Text className="auth-button-text">Sign in</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/sign-up")}
            className="auth-secondary-button"
          >
            <Text className="auth-secondary-button-text">
              Create an account
            </Text>
          </Pressable>

          <View className="auth-link-row">
            <Text className="auth-link-copy">Already have an account?</Text>
            <Link href="/sign-in">
              <Text className="auth-link">Sign in</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Onboarding;
