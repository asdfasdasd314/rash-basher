import { StyleSheet, View, Platform, TouchableOpacity, Animated } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRef, useState, useEffect } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Disclaimer } from '@/components/Disclaimer';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Classification } from '@/types/classification';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking } from 'react-native';

export default function CameraScreen() {
  const [type, setType] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [classification, setClassification] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(true);
  const [zoom, setZoom] = useState(0);
  const [mount, setMount] = useState(false);
  const [flashlight, setFlashlight] = useState(false);
  const colorScheme = useColorScheme();
  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Wait 3 seconds before mounting the camera
    if (permission?.granted) {
      setTimeout(() => {
        setMount(true);
      }, 3000);
    }
  }, [permission]);

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [isLoading]);

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <ThemedView style={styles.container}>
        <View style={styles.permissionOverlay}>
          <ThemedView style={styles.permissionCard}>
            <IconSymbol
              name="camera.fill"
              size={48}
              color={Colors[colorScheme ?? 'light'].text}
              style={styles.permissionIcon}
            />
            <ThemedText style={styles.permissionTitle}>Camera Access Required</ThemedText>
            <ThemedText style={styles.permissionMessage}>
              {permission.canAskAgain 
                ? "We need your permission to access the camera to analyze skin conditions."
                : "Camera access is required but was denied. Please enable it in your device settings to use this feature."}
            </ThemedText>
            {permission.canAskAgain ? (
              <TouchableOpacity 
                style={styles.permissionButton}
                onPress={requestPermission}
              >
                <ThemedText style={styles.permissionButtonText}>Grant Permission</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.permissionButton}
                onPress={() => Linking.openSettings()}
              >
                <ThemedText style={styles.permissionButtonText}>Open Settings</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        </View>
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
		<Disclaimer />
		<View style={styles.imageContainer}>
      {mount && (
        <CameraView 
          ref={cameraRef}
          style={styles.camera} 
          facing={type}
          active={true}
          zoom={zoom}
          enableTorch={flashlight}
          onCameraReady={() => {}}
          onMountError={(error) => {
            setError(error.message);
          }}
        />
      )}
			<View style={styles.buttonContainer}>
				<TouchableOpacity onPress={toggleCameraType} style={styles.flipButton}>
					<IconSymbol
						name="arrow.triangle.2.circlepath.camera.fill"
						size={32}
						color={Colors[colorScheme ?? 'light'].text}
					/>
				</TouchableOpacity>
				<TouchableOpacity 
					onPress={() => setFlashlight(!flashlight)} 
					style={[styles.flipButton, { marginTop: 12, backgroundColor: flashlight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)' }]}
				>
					<IconSymbol
						name={flashlight ? "flashlight.on.fill" : "flashlight.off.fill"}
						size={32}
						color={Colors[colorScheme ?? 'light'].text}
					/>
				</TouchableOpacity>
			</View>
      
			<View style={styles.zoomContainer}>
        <IconSymbol
          name="plus.magnifyingglass"
          size={24}
          color="#FFFFFF"
          style={styles.plusZoomIcon}
        />
        <View style={styles.zoomContainer}></View>
          <Slider
            style={styles.zoomSlider}
            minimumValue={0}
            maximumValue={1}
            value={zoom}
            onValueChange={setZoom}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
            thumbTintColor="#FFFFFF"
          />
        <IconSymbol
          name="minus.magnifyingglass"
          size={24}
          color="#FFFFFF"
          style={styles.minusZoomIcon}
        />
			</View>
		</View>

		{(isLoading || (classification && showResults)) && !error && (
			<View style={styles.floatingCard}>
			<Animated.View 
				style={[
				styles.resultCard,
				{
					opacity: isLoading ? pulseAnim.interpolate({
					inputRange: [0, 1],
					outputRange: [0.5, 1],
					}) : 1.0,
				},
				]}
			>
				{!isLoading && (
				<TouchableOpacity 
					style={styles.closeButton}
					onPress={() => {
						setError(null)
						setClassification(null)
						setConfidence(null)
						setShowResults(false)
					}}
				>
					<IconSymbol
					name="xmark.circle.fill"
					size={20}
					color="#FFFFFF"
					/>
				</TouchableOpacity>
				)}
				{isLoading ? (
				<>
					<IconSymbol
					name="doc.text.fill"
					size={48}
					color="#FFFFFF"
					/>
					<ThemedText style={styles.loadingText}>Analyzing Image...</ThemedText>
				</>
				) : (
				<>
					<View style={styles.resultHeader}>
					<IconSymbol
						name="checkmark.circle.fill"
						size={32}
						color="#4CAF50"
					/>
					<ThemedText style={styles.resultTitle}>Analysis Complete</ThemedText>
					</View>
					<View style={styles.resultContent}>
					<ThemedText style={styles.classificationText}>
						Condition: {classification}
					</ThemedText>
					<View style={styles.confidenceMeter}>
						<View style={styles.meterOutline}>
						<View style={styles.meterBackground}>
							<LinearGradient
							colors={['#FF0000', '#FFFF00', '#00FF00']}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							style={styles.meterGradient}
							/>
						</View>
						</View>
						<View style={styles.tickMarkContainer}>
						{[-90, -60, -30, 0, 30, 60, 90].map((angle, index) => (
							<View
							key={index}
							style={[
								styles.tickMark,
								{
								transform: [
									{ rotate: `${angle}deg` },
									{ translateY: -90 },
								],
								},
							]}
							/>
						))}
						</View>
						<View 
						style={[
							styles.meterNeedle,
							{ transform: [{ rotate: `${-90 + (confidence || 0) * 180}deg` }] }
						]} 
						/>
						<View style={styles.meterCenter} />
					</View>

					<View style={styles.bottomLine} />

					<ThemedText style={styles.confidenceText}>
						Confidence: {confidence ? `${Math.round(confidence * 100)}%` : 'N/A'}
					</ThemedText>
					</View>
				</>
				)}
			</Animated.View>
			</View>
		)}

		{error && !isLoading && (
			<View style={styles.floatingCard}>
			<Animated.View 
				style={[styles.resultCard, styles.errorCard]}
			>
				<TouchableOpacity 
				style={styles.closeButton}
				onPress={() => setError(null)}
				>
				<IconSymbol
					name="xmark.circle.fill"
					size={24}
					color="#FFFFFF"
				/>
				</TouchableOpacity>
				<View style={styles.resultHeader}>
				<IconSymbol
					name="exclamationmark.triangle.fill"
					size={32}
					color="#FF0000"
				/>
				<ThemedText style={styles.errorTitle}>Error</ThemedText>
				</View>
				<View style={styles.resultContent}>
				<ThemedText style={styles.errorText}>{error}</ThemedText>
				</View>
			</Animated.View>
			</View>
		)}

		<TouchableOpacity 
			style={[styles.captureButton, isLoading && styles.captureButtonDisabled]} 
			onPress={async () => {
			if (cameraRef.current && !isLoading) {
				setShowResults(true);
				const photo = await cameraRef.current?.takePictureAsync({
				quality: 0.5,
				base64: false,
				exif: true,
				});

				try {
				setIsLoading(true);
				setClassification(null);
				setError(null);

				// Create form data
				const formData = new FormData();
				formData.append('image', {
					uri: photo?.uri,
					type: 'image/jpeg',
					name: 'photo.jpg',
				} as any);

				// Replace with whatever domain we end up using
				const res = await fetch('https://backend-681014983462.us-east4.run.app/classify/classify-rash', {
					method: 'POST',
					body: formData,
					headers: {
					'Content-Type': 'multipart/form-data',
					},
				});

				try {
					const json = await res.json();
					setClassification(json.result.class);
					setConfidence(json.result.confidence);
					const hash = await Crypto.digestStringAsync(
					Crypto.CryptoDigestAlgorithm.SHA256,
					photo.uri,
					);

					const fileName = `${hash}.jpg`;
					const filePath = `${FileSystem.documentDirectory}${fileName}`;

					// Copy the image to app's local file storage
					await FileSystem.copyAsync({
					from: photo.uri,
					to: filePath,
					});

					const history = await AsyncStorage.getItem('classificationHistory');
					if (history) {
					const parsedHistory = JSON.parse(history);
					const entry: Classification = {
						timestamp: new Date(),
						imagePath: filePath,
						classification: json.result.class,
						confidence: json.result.confidence,
					}
					parsedHistory.push(entry);
					await AsyncStorage.setItem('classificationHistory', JSON.stringify(parsedHistory));
					} else {
					const history: Classification[] = [{
						timestamp: new Date(),
						imagePath: filePath,
						classification: json.result.class,
						confidence: json.result.confidence,
					}];
					await AsyncStorage.setItem('classificationHistory', JSON.stringify(history));
					}
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

				setIsLoading(false);
			}
			}}
			disabled={isLoading}
		>
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
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'transparent',
    zIndex: 2,
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
  floatingCard: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ translateY: -100 }],
    zIndex: 1000,
  },
  resultCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '80%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultContent: {
    width: '100%',
    gap: 8,
  },
  classificationText: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  confidenceText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: 'rgba(255, 82, 82, 0.3)',
    borderColor: 'rgba(255, 82, 82, 0.6)',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  errorText: {
    color: '#D00000',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    opacity: 0.9,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  closeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
  },
  zoomContainer: {
    position: 'absolute',
    right: -50,
    top: '50%',
    transform: [{ rotate: '90deg' }],
    width: 200,
    alignItems: 'center',
    zIndex: 2,
  },
  zoomSlider: {
    width: 200,
    height: 40,
    transform: [{ rotate: '180deg' }],
  },
  plusZoomIcon: {
    position: 'absolute',
    top: 5,
    left: -30,
    transform: [{ rotate: '-90deg' }],
  },
  minusZoomIcon: {
    position: 'absolute',
    top: 5,
    left: 210,
    transform: [{ rotate: '-90deg' }],
  },
  confidenceMeter: {
    width: 200,
    height: 100,
    position: 'relative',
    marginVertical: 16,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  meterOutline: {
	width: '100%',
	height: '100%',
	backgroundColor: '#000000',
	borderTopLeftRadius: 100,
	borderTopRightRadius: 100,
	position: 'relative',
	overflow: 'hidden',
  },

  bottomLine: {
	marginTop: -25, // pull it slightly up to hug the bottom
	width: 200,
	height: 5,
	backgroundColor: '#000000',
	alignSelf: 'center',
	zIndex: 10,
  },
  
  meterBackground: {
	...StyleSheet.absoluteFillObject, // fills parent exactly
	top: 5, bottom: 0, left: 5, right: 5, // manual padding
	backgroundColor: 'rgba(255, 255, 255, 0.1)',
	borderTopLeftRadius: 95,
	borderTopRightRadius: 95,
	overflow: 'hidden',
  },

  meterGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  meterNeedle: {
	width: 4,             // thin needle
    height: 100,          // length of the needle
    backgroundColor: 'red',
    position: 'absolute',
    bottom: 0,            // pivot from bottom center
    left: '50%',
    marginLeft: -2,       // to center it horizontally
    borderRadius: 2,      // smooth edges
    transformOrigin: 'bottom center',
  },
  meterCenter: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    width: 12,
    height: 12,
    backgroundColor: '#000000',
    borderRadius: 6,
    transform: [{ translateX: -6 }, { translateY: -6 }],
    zIndex: 3,
  },
  tickMark: {
	position: 'absolute',
	width: 2,
	height: 10,
	backgroundColor: '#000000',
	transformOrigin: 'bottom center',
  },
  
  tickMarkContainer: {
	// position: 'absolute',
	width: 0,
	height: 0,
	top: 0,
	left: '50%',
	alignItems: 'center',
	justifyContent: 'center',
  },
  permissionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
    width: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  permissionIcon: {
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  permissionButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
