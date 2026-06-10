import { useAuth, useSignIn } from "@clerk/expo";
import { Link, Redirect, useRouter } from "expo-router";
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

export default function ForgotPassword() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const [phase, setPhase] = useState<"request" | "verify">("request");
  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  const requestReset = async () => {
    setGeneralError(null);
    setSuccessMessage(null);

    if (!emailAddress) {
      setGeneralError("Please enter the email address for your account.");
      return;
    }

    const { error } = await signIn.create({
      identifier: emailAddress,
      strategy: "reset_password_email_code",
    });

    if (error) {
      setGeneralError(
        error.longMessage ||
          error.message ||
          "Unable to start password recovery. Please try again.",
      );
      return;
    }

    setPhase("verify");
    setSuccessMessage(
      "We sent a reset code to your email. Enter it below along with a new password.",
    );
  };

  const handleReset = async () => {
    setGeneralError(null);

    if (!code || !password) {
      setGeneralError("Enter the code and a new password to continue.");
      return;
    }

    const { error: verifyError } = await signIn.attemptFirstFactor({
      strategy: "reset_password_email_code",
      code,
    });

    if (verifyError) {
      setGeneralError(
        verifyError.longMessage ||
          verifyError.message ||
          "The reset code is invalid. Please try again.",
      );
      return;
    }

    const { error: passwordError } = await signIn.resetPassword({
      password,
    });

    if (passwordError) {
      setGeneralError(
        passwordError.longMessage ||
          passwordError.message ||
          "Unable to reset your password. Please try again.",
      );
      return;
    }

    router.push("/sign-in");
  };

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
            <Text className="auth-title">Reset your password</Text>
            <Text className="auth-subtitle">
              Recover access by verifying your email and choosing a new
              password.
            </Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">
              {phase === "request" ? (
                <>
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

                  {generalError ? (
                    <Text className="auth-error">{generalError}</Text>
                  ) : null}
                  {successMessage ? (
                    <Text className="auth-helper">{successMessage}</Text>
                  ) : null}

                  <Pressable
                    onPress={requestReset}
                    disabled={!emailAddress || fetchStatus === "fetching"}
                    className={`auth-button ${!emailAddress || fetchStatus === "fetching" ? "auth-button-disabled" : ""}`}
                  >
                    <Text className="text-base font-sans-bold text-background">
                      Send reset code
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <View className="auth-field">
                    <Text className="auth-label">Reset code</Text>
                    <TextInput
                      className={`auth-input ${errors?.fields?.code ? "auth-input-error" : ""}`}
                      value={code}
                      placeholder="Enter the code"
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

                  <View className="auth-field">
                    <Text className="auth-label">New password</Text>
                    <TextInput
                      className={`auth-input ${errors?.fields?.password ? "auth-input-error" : ""}`}
                      secureTextEntry
                      value={password}
                      placeholder="Create a new password"
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
                    onPress={handleReset}
                    disabled={!code || !password || fetchStatus === "fetching"}
                    className={`auth-button ${!code || !password || fetchStatus === "fetching" ? "auth-button-disabled" : ""}`}
                  >
                    <Text className="text-base font-sans-bold text-background">
                      Reset password
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setPhase("request");
                      setCode("");
                      setPassword("");
                      setGeneralError(null);
                      setSuccessMessage(null);
                    }}
                    className="auth-secondary-button"
                  >
                    <Text className="auth-secondary-button-text">
                      Start over
                    </Text>
                  </Pressable>
                </>
              )}

              <View className="auth-link-row">
                <Link href="/sign-in">
                  <Text className="auth-link">Return to sign in</Text>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
