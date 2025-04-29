import { StyleSheet, View, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from 'react-native';

export default function CameraScreen() {
  const [type, setType] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>We need your permission to show the camera</ThemedText>
        <Button title="Grant Permission" onPress={requestPermission} />
      </ThemedView>
    );
  }

  // Check if we're on web platform
  if (Platform.OS === 'web') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>
          Camera functionality is only available on mobile devices
        </ThemedText>
      </ThemedView>
    );
  }

  const toggleCameraType = () => {
    setType(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <CameraView 
          style={styles.camera} 
          facing={type}
          active={true}
          onCameraReady={() => {
            console.log('Camera is ready');
          }}
          onMountError={(error) => {
            console.error('Camera mount error:', error);
          }}
        >
          <View style={styles.buttonContainer}>
            <Button title="Flip Camera" onPress={toggleCameraType} />
          </View>
        </CameraView>
      </View>
      <View style={styles.footerContainer}>
        <Button title="Choose a photo" />
        <Button title="Use this photo" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
});
