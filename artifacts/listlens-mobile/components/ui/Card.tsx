import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props extends ViewProps {
  padded?: boolean;
  highlight?: boolean;
}

export function Card({ children, padded = true, highlight = false, style, ...rest }: Props) {
  const colors = useColors();
  return (
    <View
      {...rest}
      style={[
        styles.card,
        {
          backgroundColor: highlight ? "rgba(8, 51, 68, 0.45)" : "rgba(24, 24, 27, 0.55)",
          borderColor: highlight ? colors.cyan800 : colors.zinc800,
          borderRadius: colors.radius,
          padding: padded ? 18 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});

export default Card;
