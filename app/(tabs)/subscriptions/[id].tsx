import { Link, useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SubcriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>SubcriptionDetails: {id}</Text>
      <Text>Testing</Text>
      <Link href="/" className="mt-4 rounded bg-primary text-white p-4">
        Go Back
      </Link>
    </View>
  );
};

export default SubcriptionDetails;
