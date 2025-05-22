import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  refreshing?: boolean;
  onRefresh?: () => void;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  refreshing,
  onRefresh,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [0, HEADER_HEIGHT],
            [0, -HEADER_HEIGHT]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  const refreshControl = onRefresh ? (
    <RefreshControl
      style={styles.refreshControl}
      refreshing={refreshing ?? false}
      onRefresh={onRefresh}
      tintColor={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
      colors={['#007AFF']}
      progressBackgroundColor={colorScheme === 'dark' ? '#1A1A1A' : '#F5F5F5'}
    />
  ) : undefined;

  return (
    <ThemedView style={styles.container}>
    {/* Move header out of scrollable content */}
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { height: HEADER_HEIGHT, backgroundColor: headerBackgroundColor[colorScheme] },
        headerAnimatedStyle,
      ]}>
      {headerImage}
    </Animated.View>

    <Animated.ScrollView
      ref={scrollRef}
      scrollEventThrottle={16}
      scrollIndicatorInsets={{ bottom }}
      contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: bottom }}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </Animated.ScrollView>
  </ThemedView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    overflow: 'hidden',
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
  refreshControl: {
    zIndex: 2,
  },
});
