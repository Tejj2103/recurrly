import { useAuth, useSignUp } from "@clerk/expo";
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

export default function SignUp() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showVerificationStep, setShowVerificationStep] = useState(false);

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const finalizeSignUp = async () => {
    try {
      let navigated = false;
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log("Unexpected Clerk task:", session.currentTask);
            return;
          }
          const url = decorateUrl("/");
          if (typeof window !== "undefined" && url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as Href);
          }
          navigated = true;
        },
      });
      if (!navigated) {
        console.log("finalizeSignUp: finalize() returned without navigation");
      }
      setShowVerificationStep(false);
    } catch (err) {
      throw err;
    }
  };

  const isAlreadyVerifiedError = (error: any) => {
    if (!error) {
      return false;
    }

    const code = String(error.code ?? "").toLowerCase();
    const message = String(
      error.longMessage ?? error.message ?? "",
    ).toLowerCase();

    return (
      code === "verification_already_verified" ||
      code === "email_already_verified" ||
      code === "already_verified" ||
      message.includes("already verified")
    );
  };

  const handleSubmit = async () => {
    setGeneralError(null);
    setShowVerificationStep(false);

    if (!username || !emailAddress || !password) {
      setGeneralError("Please enter username, email address and password.");
      return;
    }

    const trimmedUsername = username.trim();
    const result: any = await signUp.password({
      username: trimmedUsername,
      emailAddress,
      password,
    });

    if (result?.error) {
      setGeneralError(
        result.error.longMessage ||
          result.error.message ||
          "Unable to create your account.",
      );
      return;
    }

    const status = result.status ?? signUp.status;
    const unverifiedFields =
      result.unverifiedFields ?? signUp.unverifiedFields ?? [];

    if (status === "complete") {
      await finalizeSignUp();
      return;
    }

    if (
      (status === "missing_requirements" || status === "needs_verification") &&
      unverifiedFields.includes("email_address")
    ) {
      setShowVerificationStep(true);
      if (status === "missing_requirements") {
        try {
          await signUp.verifications.sendEmailCode();
        } catch {
          // ignore; verify screen will still render
        }
      }
      return;
    }

    setGeneralError("We couldn't finish your account setup. Please try again.");
  };

  const handleVerify = async () => {
    setGeneralError(null);
    try {
      const res: any = await signUp.verifications.verifyEmailCode({ code });
      const error = res?.error ?? null;

      if (error) {
        if (isAlreadyVerifiedError(error)) {
          try {
            await finalizeSignUp();
            return;
          } catch (err: any) {
            setGeneralError(
              err?.message ||
                "Verification already completed, but we could not finish sign up.",
            );
            return;
          }
        }

        setGeneralError(
          error.longMessage || error.message || "Unable to verify your code.",
        );
        return;
      }
      await finalizeSignUp();
    } catch (err) {
      setGeneralError(
        "An unexpected error occurred. Check console for details.",
      );
    }
  };

  const isVerificationStep = showVerificationStep;

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
            <Text className="auth-title">Create your account</Text>
            <Text className="auth-subtitle">
              Start tracking every renewal and keep your payment plan on one
              screen.
            </Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">
              {!isVerificationStep ? (
                <>
                  <View className="auth-field">
                    <Text className="auth-label">Username</Text>
                    <TextInput
                      className={`auth-input ${
                        errors?.fields?.username ? "auth-input-error" : ""
                      }`}
                      autoCapitalize="none"
                      value={username}
                      placeholder="Choose a username"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                      onChangeText={setUsername}
                    />
                  </View>
                  {errors?.fields?.username && (
                    <Text className="auth-error">
                      {errors.fields.username.message}
                    </Text>
                  )}

                  <View className="auth-field">
                    <Text className="auth-label">Email address</Text>
                    <TextInput
                      className={`auth-input ${errors?.fields?.emailAddress ? "auth-input-error" : ""}`}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={emailAddress}
                      placeholder="you@example.com"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                      onChangeText={setEmailAddress}
                    />
                    {errors?.fields?.emailAddress && (
                      <Text className="auth-error">
                        {errors.fields.emailAddress.message}
                      </Text>
                    )}
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Password</Text>
                    <TextInput
                      className={`auth-input ${errors?.fields?.password ? "auth-input-error" : ""}`}
                      secureTextEntry
                      value={password}
                      placeholder="Create a strong password"
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
                      !username ||
                      !emailAddress ||
                      !password ||
                      fetchStatus === "fetching"
                    }
                    className={`auth-button ${
                      !username ||
                      !emailAddress ||
                      !password ||
                      fetchStatus === "fetching"
                        ? "auth-button-disabled"
                        : ""
                    }`}
                  >
                    <Text className="text-base font-sans-bold text-background">
                      Create account
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text className="auth-info">
                    Check your email and enter the verification code.
                  </Text>

                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className={`auth-input ${
                        errors?.fields?.code ? "auth-input-error" : ""
                      }`}
                      value={code}
                      placeholder="Enter the code"
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      onChangeText={setCode}
                    />
                  </View>

                  {generalError ? (
                    <Text className="auth-error">{generalError}</Text>
                  ) : null}

                  <Pressable
                    onPress={handleVerify}
                    disabled={fetchStatus === "fetching" || code.length < 4}
                    className={`auth-button ${
                      fetchStatus === "fetching" || code.length < 4
                        ? "auth-button-disabled"
                        : ""
                    }`}
                  >
                    <Text className="text-base font-sans-bold text-background">
                      Verify email
                    </Text>
                  </Pressable>
                </>
              )}

              {isVerificationStep ? <View nativeID="clerk-captcha" /> : null}

              {!isVerificationStep ? (
                <View className="auth-link-row">
                  <Text className="auth-link-copy">
                    Already have an account?
                  </Text>
                  <Link href="/sign-in">
                    <Text className="auth-link">Sign in</Text>
                  </Link>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
