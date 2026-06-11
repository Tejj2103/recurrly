import { useAuth } from "@clerk/expo";
import { Redirect, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const { width } = Dimensions.get("window");
const pageWidth = width - 40;

const pages = [
  {
    title: "Track every subscription",
    description:
      "Organize recurring bills, due dates, and savings in one simple dashboard.",
  },
  {
    title: "Never miss a renewal",
    description:
      "Get reminders before payments renew so you can cancel or adjust plans on time.",
  },
  {
    title: "Secure billing visibility",
    description:
      "Connect your accounts, manage payment methods, and keep your budget in control.",
  },
];

const Onboarding = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const isFirst = page === 0;
  const isLast = page === pages.length - 1;

  const updatePage = (offsetX: number) => {
    const nextPage = Math.round(offsetX / pageWidth);
    if (nextPage !== page) {
      setPage(nextPage);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    updatePage(event.nativeEvent.contentOffset.x);
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    updatePage(event.nativeEvent.contentOffset.x);
  };

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    scrollRef.current?.scrollTo({ x: nextPage * pageWidth, animated: true });
  };

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView className="auth-safe-area">
      <View className="flex-1 px-5 pt-6 pb-4">
        <View className="flex-row items-center justify-between">
          <View />
          <Pressable
            onPress={() => router.push("/sign-in")}
            className="rounded-full bg-muted px-4 py-2"
          >
            <Text className="text-base font-sans-semibold text-accent">
              Skip
            </Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          snapToInterval={pageWidth}
          snapToAlignment="center"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingTop: 24 }}
        >
          {pages.map((item) => (
            <View
              key={item.title}
              style={{ width: pageWidth }}
              className="px-2"
            >
              <View className="p-6 h-full items-center justify-center">
                <Text className="text-3xl font-sans-bold text-primary text-center mb-4">
                  {item.title}
                </Text>
                <Text className="text-base font-sans-medium text-muted-foreground text-center">
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View className="mt-6 items-center">
          <Text className="text-sm font-sans-semibold text-muted-foreground mb-3">
            {page + 1} / {pages.length}
          </Text>
          <View className="flex-row items-center gap-2 py-2">
            {pages.map((_, index) => (
              <View
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === page ? "bg-accent" : "bg-border"
                }`}
              />
            ))}
          </View>
        </View>

        <View className="mt-auto flex-row items-center justify-between gap-3">
          <Pressable
            onPress={() => goToPage(Math.max(0, page - 1))}
            disabled={isFirst}
            className={`flex-1 items-center rounded-2xl border py-4 ${
              isFirst ? "border-border bg-muted" : "border-accent bg-background"
            }`}
          >
            <Text
              className={`text-base font-sans-semibold ${
                isFirst ? "text-muted-foreground" : "text-accent"
              }`}
            >
              Back
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              if (isLast) {
                router.push("/sign-in");
              } else {
                goToPage(page + 1);
              }
            }}
            className="flex-1 items-center rounded-2xl bg-accent py-4"
          >
            <Text className="text-base font-sans-bold text-primary">
              {isLast ? "Get Started" : "Next"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;
