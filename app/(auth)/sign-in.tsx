import { useAuth, useSignIn } from "@clerk/expo";
import { type Href, Link, Redirect, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignIn() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  const finalizeSignIn = async () => {
    await signIn.finalize({
      navigate: ({
        session,
        decorateUrl,
      }: {
        session?: any;
        decorateUrl: (path: string) => string;
      }) => {
        if (session?.currentTask) {
          return;
        }
        const url = decorateUrl("/");
        if (typeof window !== "undefined" && url.startsWith("http")) {
          window.location.href = url;
        } else {
          router.push(url as Href);
        }
      },
    });
  };

  const handleSubmit = async () => {
    setGeneralError(null);

    if (!emailAddress || !password) {
      setGeneralError("Please enter your email and password.");
      return;
    }

    const { error } = await signIn.password({
      emailAddress,
      password,
    });

    if (error) {
      setGeneralError(
        error.longMessage || error.message || "Unable to sign in.",
      );
      return;
    }

    if (signIn.status === "complete") {
      await finalizeSignIn();
      return;
    }

    if (signIn.status === "needs_second_factor") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor: any) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
        return;
      }
    }

    setGeneralError("We couldn't complete sign in. Please try again.");
  };

  const handleVerify = async () => {
    setGeneralError(null);

    const { error } = await signIn.mfa.verifyEmailCode({ code });

    if (error) {
      setGeneralError(
        error.longMessage || error.message || "Unable to verify code.",
      );
      return;
    }

    if (signIn.status === "complete") {
      await finalizeSignIn();
      return;
    }

    setGeneralError("Verification is not complete. Please try again.");
  };

  if (signIn.status === "needs_second_factor") {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="auth-screen"
        >
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
              <Text className="auth-title">Verify your sign in</Text>
              <Text className="auth-subtitle">
                Enter the code sent to your inbox to finish signing in safely.
              </Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className={`auth-input ${errors?.fields?.code ? "auth-input-error" : ""}`}
                    value={code}
                    placeholder="Enter code"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    keyboardType="number-pad"
                    onChangeText={setCode}
                  />
                  {errors?.fields?.code && (
                    <Text className="auth-error">
                      {errors.fields.code.message}
                    </Text>
                  )}
                </View>

                {generalError ? (
                  <Text className="auth-error">{generalError}</Text>
                ) : null}

                <Pressable
                  onPress={handleVerify}
                  disabled={fetchStatus === "fetching" || code.length < 4}
                  className={`auth-button ${fetchStatus === "fetching" || code.length < 4 ? "auth-button-disabled" : ""}`}
                >
                  <Text className="text-base font-sans-bold text-background">
                    Verify code
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => signIn.reset()}
                  className="auth-secondary-button"
                >
                  <Text className="auth-secondary-button-text">Start over</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="auth-screen"
      >
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
            <Text className="auth-title">Welcome back</Text>
            <Text className="auth-subtitle">
              Access your dashboard, track renewals, and keep your billing on
              schedule.
            </Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">Email address</Text>
                <TextInput
                  className={`auth-input ${errors?.fields?.identifier ? "auth-input-error" : ""}`}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={emailAddress}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  onChangeText={setEmailAddress}
                />
                {errors?.fields?.identifier && (
                  <Text className="auth-error">
                    {errors.fields.identifier.message}
                  </Text>
                )}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Password</Text>
                <TextInput
                  className={`auth-input ${errors?.fields?.password ? "auth-input-error" : ""}`}
                  secureTextEntry
                  value={password}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  onChangeText={setPassword}
                />
                {errors?.fields?.password && (
                  <Text className="auth-error">
                    {errors.fields.password.message}
                  </Text>
                )}
              </View>

              {generalError ? (
                <Text className="auth-error">{generalError}</Text>
              ) : null}

              <Pressable
                onPress={handleSubmit}
                disabled={
                  !emailAddress || !password || fetchStatus === "fetching"
                }
                className={`auth-button ${!emailAddress || !password || fetchStatus === "fetching" ? "auth-button-disabled" : ""}`}
              >
                <Text className="text-base font-sans-bold text-background">
                  Continue
                </Text>
              </Pressable>

              <View className="auth-link-row">
                <Link href="/forgot-password">
                  <Text className="auth-link">Forgot password?</Text>
                </Link>
              </View>

              <View className="auth-link-row">
                <Text className="auth-link-copy">Don't have an account?</Text>
                <Link href="/sign-up">
                  <Text className="auth-link">Create account</Text>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
