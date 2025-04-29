import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function HistoryScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F5F5F5', dark: '#1A1A1A' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="clock.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Analysis History</ThemedText>
      </ThemedView>

      {/* Recent Analyses */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Recent Analyses</ThemedText>
        <ThemedView style={styles.analysisCard}>
          <ThemedView style={styles.cardHeader}>
            <IconSymbol name="calendar" size={20} color="#808080" />
            <ThemedText>Today, 2:30 PM</ThemedText>
          </ThemedView>
          <ThemedView style={styles.cardContent}>
            <ThemedView style={styles.imagePreview}>
              <IconSymbol name="photo.fill" size={40} color="#808080" />
            </ThemedView>
            <ThemedView style={styles.analysisInfo}>
              <ThemedText type="defaultSemiBold">Right Arm Analysis</ThemedText>
              <ThemedText>Mild irritation detected</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.analysisCard}>
          <ThemedView style={styles.cardHeader}>
            <IconSymbol name="calendar" size={20} color="#808080" />
            <ThemedText>Yesterday, 4:15 PM</ThemedText>
          </ThemedView>
          <ThemedView style={styles.cardContent}>
            <ThemedView style={styles.imagePreview}>
              <IconSymbol name="photo.fill" size={40} color="#808080" />
            </ThemedView>
            <ThemedView style={styles.analysisInfo}>
              <ThemedText type="defaultSemiBold">Left Leg Analysis</ThemedText>
              <ThemedText>Moderate rash detected</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Statistics */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Statistics</ThemedText>
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statCard}>
            <IconSymbol name="chart.bar.fill" size={24} color="#4CAF50" />
            <ThemedText type="defaultSemiBold">12</ThemedText>
            <ThemedText>Total Scans</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statCard}>
            <IconSymbol name="clock.arrow.circlepath" size={24} color="#2196F3" />
            <ThemedText type="defaultSemiBold">3</ThemedText>
            <ThemedText>This Week</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Export Option */}
      <TouchableOpacity>
        <ThemedView style={styles.exportButton}>
          <IconSymbol name="square.and.arrow.up" size={20} color="#808080" />
          <ThemedText>Export Analysis History</ThemedText>
        </ThemedView>
      </TouchableOpacity>
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
  analysisCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  imagePreview: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    gap: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 8,
  },
}); 