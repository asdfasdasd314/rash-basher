import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Switch } from 'react-native';

export default function SettingsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F5F5F5', dark: '#1A1A1A' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="person.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Doctors</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Appearance</ThemedText>
        <ThemedView style={styles.settingRow}>
          <ThemedView style={styles.settingInfo}>
            <IconSymbol name="moon.fill" size={20} color="black" />
            <ThemedText>Dark Mode</ThemedText>
          </ThemedView>
          <Switch value={false} />
        </ThemedView>
        <ThemedView style={styles.settingRow}>
          <ThemedView style={styles.settingInfo}>
            <IconSymbol name="textformat.size" size={20} color="black" />
            <ThemedText>Font Size</ThemedText>
          </ThemedView>
          <ThemedText>Medium</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Notifications</ThemedText>
        <ThemedView style={styles.settingRow}>
          <ThemedView style={styles.settingInfo}>
            <IconSymbol name="bell.fill" size={20} color="black" />
            <ThemedText>Push Notifications</ThemedText>
          </ThemedView>
          <Switch value={true} />
        </ThemedView>
        <ThemedView style={styles.settingRow}>
          <ThemedView style={styles.settingInfo}>
            <IconSymbol name="envelope.fill" size={20} color="black" />
            <ThemedText>Email Notifications</ThemedText>
          </ThemedView>
          <Switch value={true} />
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Account</ThemedText>
        <ThemedView style={styles.settingRow}>
          <ThemedView style={styles.settingInfo}>
            <IconSymbol name="lock.fill" size={20} color="black" />
            <ThemedText>Change Password</ThemedText>
          </ThemedView>
          <IconSymbol name="chevron.right" size={20} color="black" />
        </ThemedView>
        <ThemedView style={styles.settingRow}>
          <ThemedView style={styles.settingInfo}>
            <IconSymbol name="trash.fill" size={20} color="black" />
            <ThemedText>Delete Account</ThemedText>
          </ThemedView>
          <IconSymbol name="chevron.right" size={20} color="black" />
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
}); 