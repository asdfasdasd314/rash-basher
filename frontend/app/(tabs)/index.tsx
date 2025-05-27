import { StyleSheet, View, Platform, TouchableOpacity, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Disclaimer } from '@/components/Disclaimer';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Classification } from '@/types/classification';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { saveClassification, getClassificationHistory } from '@/utils/storage';

export default function CameraScreen() {
  const [classification, setClassification] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(true);
  const colorScheme = useColorScheme();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  function isBase64DataURI(uri: string) {
    return typeof uri === 'string' && uri.startsWith('data:') && uri.includes(';base64,');
  }

  function dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
  
    return new Blob([ab], { type: mimeString });
  }

  const handleImageUpload = async (uri: string, name: string, mimeType: string) => {
    const formData = new FormData();
    if (isBase64DataURI(uri)) {
      const blob = dataURItoBlob(uri);
      formData.append('image', blob, name);
    } else {
      formData.append('image', {
        uri: uri,
        name: name,
        type: mimeType,
      } as any);
    }
    setShowResults(true);
    setIsLoading(true);
    setClassification(null);
    setError(null);

    try {
      const res = await fetch('https://backend-681014983462.us-east4.run.app/classify/classify-rash', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        console.log(res);
        throw new Error('Failed to classify image');
      }

      const json = await res.json();
      setClassification(json.result.class);
      setConfidence(json.result.confidence);

      // Save to file system
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        uri,
      );

      const fileName = `${hash}.jpg`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      // Copy the image to app's local file storage
      if (Platform.OS !== 'web') {
        await FileSystem.copyAsync({
          from: uri,
          to: filePath,
        });
      }

      // Save to history
      if (Platform.OS !== 'web') {
        saveClassification(filePath, json.result.class, json.result.confidence);
      }
      else {
        saveClassification(null, json.result.class, json.result.confidence);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error uploading image');
      setClassification(null);
    }

    setIsLoading(false);
  };

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

  return (
    <View style={styles.container}>
      <Disclaimer />
      {Platform.OS === 'web' && (
        <View style={styles.webBanner}>
          <ThemedView style={styles.webMessageCard}>
            <IconSymbol
              name="iphone"
              size={24}
              color={Colors[colorScheme ?? 'light'].text}
              style={styles.webMessageIcon}
            />
            <ThemedText style={styles.webMessageText}>
              For the best experience, we recommend using a smartphone
            </ThemedText>
          </ThemedView>
        </View>
      )}
      <View style={styles.imageContainer}>
        <View style={styles.uploadOptionsContainer}>
          <TouchableOpacity 
            style={styles.uploadOption}
            onPress={async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'image/*',
              });

              if (result.canceled) return;

              handleImageUpload(result.assets[0].uri, result.assets[0].name, result.assets[0].mimeType ?? 'image/jpeg');
            }}
          >
            <IconSymbol
              name="folder.fill"
              size={64}
              color={Colors[colorScheme ?? 'light'].text}
              style={styles.uploadIcon}
            />
            <ThemedText style={styles.uploadLabel}>Upload Image</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.uploadOption}
            onPress={async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                setError('Permission not granted to access media library');
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
              });

              if (result.canceled) return;

              handleImageUpload(result.assets[0].uri, result.assets[0].fileName ?? 'image.jpg', result.assets[0].type ?? 'image/jpeg');
            }}
          >
            <IconSymbol
              name="photo.on.rectangle"
              size={64}
              color={Colors[colorScheme ?? 'light'].text}
              style={styles.uploadIcon}
            />
            <ThemedText style={styles.uploadLabel}>Camera Roll</ThemedText>
          </TouchableOpacity>
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
  uploadOptionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  uploadOption: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '45%',
  },
  uploadIcon: {
    marginBottom: 12,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
  },
  actionButton: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
  },
  actionButtonInner: {
    padding: 12,
  },
  actionButtonDisabled: {
    opacity: 0.5,
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
  closeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
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
    marginTop: -25,
    width: 200,
    height: 5,
    backgroundColor: '#000000',
    alignSelf: 'center',
    zIndex: 10,
  },
  meterBackground: {
    ...StyleSheet.absoluteFillObject,
    top: 5,
    bottom: 0,
    left: 5,
    right: 5,
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
    width: 4,
    height: 100,
    backgroundColor: 'red',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -2,
    borderRadius: 2,
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
    width: 0,
    height: 0,
    top: 0,
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  webMessageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  webMessageIcon: {
    marginRight: 4,
  },
  webMessageText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
});