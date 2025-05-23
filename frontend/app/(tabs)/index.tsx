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

export default function CameraScreen() {
  const [type, setType] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [classification, setClassification] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(true);
  const colorScheme = useColorScheme();
  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

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
          ratio="1:1"
          onCameraReady={() => {}}
          onMountError={(error) => {
            setError(error.message);
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

      {(isLoading || (classification && showResults)) && !error && (
        <View style={styles.floatingCard}>
          <Animated.View 
            style={[
              styles.resultCard,
              {
                opacity: isLoading ? pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }) : 1,
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
                  size={24}
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
              skipProcessing: false,
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
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 500,
    maxHeight: 500,
    alignSelf: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
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
  floatingCard: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  resultCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
    top: 8,
    right: 8,
    padding: 4,
  },
});
