import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function ProfileScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E6E6FA', dark: '#2D2D3D' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="bandage.fill"
          style={styles.infoRow}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Conditions</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">User Information</ThemedText>
        <ThemedView style={styles.infoRow}>
          <IconSymbol name="person.fill" size={20} color="black" />
          <ThemedText>John Doe</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <IconSymbol name="envelope.fill" size={20} color="black" />
          <ThemedText>john.doe@example.com</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <IconSymbol name="calendar" size={20} color="black" />
          <ThemedText>Member since January 2024</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Stats</ThemedText>
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statItem}>
            <ThemedText type="defaultSemiBold">128</ThemedText>
            <ThemedText>Posts</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText type="defaultSemiBold">1.2k</ThemedText>
            <ThemedText>Followers</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText type="defaultSemiBold">256</ThemedText>
            <ThemedText>Following</ThemedText>
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
}); 