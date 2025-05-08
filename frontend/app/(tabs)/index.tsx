import { StyleSheet, View, Platform, TouchableOpacity } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function CameraScreen() {
  const [type, setType] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [classification, setClassification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const cameraRef = useRef<CameraView>(null);

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
			ref={cameraRef}
			style={styles.camera} 
			facing={type}
			active={true}
			onCameraReady={() => {
				setClassification("test");
				console.log('Camera is ready');
			}}
			onMountError={(error) => {
				console.error('Camera mount error:', error);
			}}
			>
			<View style={styles.buttonContainer}>
				<TouchableOpacity onPress={toggleCameraType} style={styles.flipButton}>
				<IconSymbol
					name="arrow.triangle.2.circlepath.camera.fill"
					size={32}
					color={Colors[colorScheme ?? 'light'].text}
				/>
				</TouchableOpacity>
			</View>
			</CameraView>
		</View>
		{classification && (
			<View style={styles.classificationContainer}>
				<ThemedText style={styles.classificationText}>You have: {classification}</ThemedText>
			</View>
		)}
		{isLoading && (
			<View style={styles.classificationContainer}>
				<ThemedText style={styles.classificationText}>Loading...</ThemedText>
			</View>
		)}
		{error && (
			<View style={styles.classificationContainer}>
				<ThemedText style={styles.classificationText}>{error}</ThemedText>
			</View>
		)}
    	<TouchableOpacity style={styles.captureButton} onPress={async () => {
        	if (cameraRef.current) {
				const photo = await cameraRef.current.takePictureAsync({
					base64: true,
					quality: 0.8,
					exif: true,
				});

				try {
					setIsLoading(true);
					setClassification(null);
					setError(null);

					// Replace with whatever domain we end up using
					const res = await fetch('https://problemsquasher.dev/classify/classify-rash', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ image: photo.base64 }),
					});

					try {
						const json = await res.json();
						setClassification(json.classification);
					} catch (error) {
						console.error('Error taking photo:', error);
						setError('Error taking photo');
						setClassification(null);
					}
				} catch (error) {
					console.error('Error taking photo:', error);
					setError('Error taking photo');
					setClassification(null);
				}
			}

			setIsLoading(false);
		}}>
			<View style={styles.captureButtonInner}>
				<IconSymbol
					name="camera.fill"
					size={32}
					color={Colors[colorScheme ?? 'light'].text}
				/>
			</View>
      	</TouchableOpacity>
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
  message: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  flipButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
  },
  captureButton: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
  },
  captureButtonInner: {
    padding: 12,
  },
  classificationContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    transform: [{ translateY: -20 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  classificationText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 8,
  },
});
