import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function ExploreScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F0F8FF', dark: '#1A1B26' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="magnifyingglass"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Trending Topics</ThemedText>
        <ThemedView style={styles.topicsContainer}>
          <ThemedView style={styles.topicItem}>
            <IconSymbol name="flame.fill" size={24} color="#FF6B6B" />
            <ThemedText>#TechNews</ThemedText>
          </ThemedView>
          <ThemedView style={styles.topicItem}>
            <IconSymbol name="flame.fill" size={24} color="#FF6B6B" />
            <ThemedText>#Design</ThemedText>
          </ThemedView>
          <ThemedView style={styles.topicItem}>
            <IconSymbol name="flame.fill" size={24} color="#FF6B6B" />
            <ThemedText>#Programming</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Featured Content</ThemedText>
        <ThemedView style={styles.contentCard}>
          <ThemedView style={styles.contentHeader}>
            <IconSymbol name="star.fill" size={24} color="#FFD700" />
            <ThemedText type="defaultSemiBold">Top Picks for You</ThemedText>
          </ThemedView>
          <ThemedText>
            Discover hand-picked content tailored to your interests
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Categories</ThemedText>
        <ThemedView style={styles.categoriesContainer}>
          <ThemedView style={styles.categoryItem}>
            <IconSymbol name="camera.fill" size={24} color="#808080" />
            <ThemedText>Photography</ThemedText>
          </ThemedView>
          <ThemedView style={styles.categoryItem}>
            <IconSymbol name="music.note" size={24} color="#808080" />
            <ThemedText>Music</ThemedText>
          </ThemedView>
          <ThemedView style={styles.categoryItem}>
            <IconSymbol name="book.fill" size={24} color="#808080" />
            <ThemedText>Books</ThemedText>
          </ThemedView>
          <ThemedView style={styles.categoryItem}>
            <IconSymbol name="gamecontroller.fill" size={24} color="#808080" />
            <ThemedText>Gaming</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
    gap: 12,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '45%',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
