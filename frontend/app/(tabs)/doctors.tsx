import { StyleSheet, View, Linking, TouchableOpacity, ScrollView, Dimensions, Animated, Platform, UIManager, Easing, AppState } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useState, useEffect, useRef } from 'react';
import { Doctor } from '@/types/doctor';
import * as Location from 'expo-location';
import { Collapsible } from '@/components/Collapsible';
import { openWebsite } from '@/utils/webNavigation';
import MapView, { Marker } from 'react-native-maps';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SettingsScreen() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const screenHeight = Dimensions.get('window').height;
    const minHeight = 100;
    const maxHeight = screenHeight * 0.8;
    const mapRef = useRef<MapView>(null);
    const markerRefs = useRef<{ [key: string]: any }>({});
    const animatedHeight = useRef(new Animated.Value(minHeight)).current;
    const lastTapRef = useRef<{ [key: string]: number }>({});

    const animateSheet = (toValue: number) => {
        Animated.timing(animatedHeight, {
            toValue,
            duration: 800,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false,
        }).start();
    };

    const toggleSheet = () => {
        setIsExpanded((prev) => {
            const next = !prev;
            animateSheet(next ? maxHeight : minHeight);
            return next;
        });
    };

    const viewDoctorOnMap = (doctor: Doctor) => {
        setSelectedMarker(doctor.name);
        mapRef.current?.animateToRegion({
            latitude: doctor.location.lat,
            longitude: doctor.location.lng,
            latitudeDelta: 0.0005,
            longitudeDelta: 0.0005,
        }, 500);
        // Show the callout after the map animation
        setTimeout(() => {
            const marker = markerRefs.current[doctor.name];
            if (marker) {
                marker.showCallout();
            }
        }, 600);
        setIsExpanded(false);
        animateSheet(minHeight);
    };

    const handleDoctorPress = (doctor: Doctor) => {
        const now = Date.now();
        const lastTap = lastTapRef.current[doctor.name] || 0;
        
        if (now - lastTap < 300) { // Double tap within 300ms
            viewDoctorOnMap(doctor);
            lastTapRef.current[doctor.name] = 0; // Reset the tap timer
        } else {
            setSelectedMarker(doctor.name);
            lastTapRef.current[doctor.name] = now;
        }
    };

    const checkLocationPermission = async () => {
        const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            setErrorMsg(null);
            // Fetch doctors data
            let location = await Location.getCurrentPositionAsync({});
            const response = await fetch('https://backend-681014983462.us-east4.run.app/doctors/find-dermatologists', {
                method: 'POST',
                body: JSON.stringify({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setDoctors(data.dermatologists as Doctor[]);
                setErrorMsg(null);
            } else {
                setErrorMsg(await response.text());
            }
        } else {
            setErrorMsg(canAskAgain 
                ? 'Permission to access location was denied'
                : 'Location access is required but was denied. Please enable it in your device settings to find nearby doctors.');
        }
    };

    useEffect(() => {
        checkLocationPermission();

        // Add listener for app state changes
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                checkLocationPermission();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const openMaps = async (address: string) => {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        await Linking.openURL(mapsUrl);
    };

    return (
        <View style={styles.container}>
            {errorMsg && (
                <View style={styles.noDoctorsOverlay}>
                    <ThemedView style={styles.noDoctorsCard}>
                        <IconSymbol name="location.slash.fill" size={48} color="#FFD700" />
                        <ThemedText type="title" style={styles.noDoctorsTitle}>Location Access Required</ThemedText>
                        <ThemedText style={styles.noDoctorsText}>
                            {errorMsg}
                        </ThemedText>
                        <TouchableOpacity 
                            style={styles.permissionButton}
                            onPress={async () => {
                                if (errorMsg.includes('settings')) {
                                    Linking.openSettings();
                                } else {
                                    checkLocationPermission();
                                }
                            }}
                        >
                            <ThemedText style={styles.permissionButtonText}>
                                {errorMsg.includes('settings') ? 'Open Settings' : 'Grant Permission'}
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </View>
            )}

            {!errorMsg && (
                <>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={{
                            latitude: doctors.length > 0 ? doctors[0].location.lat : 42.2813,
                            longitude: doctors.length > 0 ? doctors[0].location.lng : 42.2813,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        onPress={() => setSelectedMarker(null)}
                    >
                        {doctors.map((doctor) => (
                            <Marker
                                ref={(ref) => {
                                    if (ref) {
                                        markerRefs.current[doctor.name] = ref;
                                    }
                                }}
                                key={doctor.name}
                                coordinate={{
                                    latitude: doctor.location.lat,
                                    longitude: doctor.location.lng,
                                }}
                                title={doctor.name}
                                description={doctor.address}
                                onCalloutPress={() => openMaps(doctor.address)}
                                onPress={() => setSelectedMarker(doctor.name)}
                                tracksViewChanges={false}
                            >
                            </Marker>
                        ))}
                    </MapView>

                    {doctors.length === 0 && (
                        <View style={styles.noDoctorsOverlay}>
                            <ThemedView style={styles.noDoctorsCard}>
                                <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#FFD700" />
                                <ThemedText type="title" style={styles.noDoctorsTitle}>No Doctors Found</ThemedText>
                                <ThemedText style={styles.noDoctorsText}>
                                    We couldn't find any dermatologists in your area. Please try again later or check your location settings.
                                </ThemedText>
                            </ThemedView>
                        </View>
                    )}

                    <Animated.View style={[styles.bottomSheet, { height: animatedHeight }]}> 
                        <TouchableOpacity onPress={toggleSheet} activeOpacity={0.7} style={styles.handleContainer}>
                            <IconSymbol
                                name={isExpanded ? 'chevron.down' : 'chevron.up'}
                                size={32}
                                color="#FFFFFF"
                            />
                            <ThemedText style={styles.handleText}>{isExpanded ? 'Hide' : 'Show'} Doctors</ThemedText>
                        </TouchableOpacity>
                        <ScrollView 
                            style={styles.doctorsList}
                            scrollEnabled={isExpanded}
                        >
                            {doctors.map((doctor, index) => (
                                <TouchableOpacity 
                                    key={doctor.name}
                                    style={[
                                        styles.doctorCard,
                                        selectedMarker === doctor.name && styles.selectedDoctorCard
                                    ]}
                                    onPress={() => handleDoctorPress(doctor)}
                                >
                                    <View style={styles.doctorHeader}>
                                        <ThemedText style={styles.doctorName}>{doctor.name}</ThemedText>
                                        <View style={styles.ratingContainer}>
                                            <IconSymbol name="star.fill" size={16} color="#FFD700" />
                                            <ThemedText style={styles.rating}>
                                                {doctor.rating}
                                            </ThemedText>
                                        </View>
                                    </View>
                                    <View style={styles.doctorInfo}>
                                        <View style={styles.infoRow}>
                                            <IconSymbol name="location.fill" size={16} color="#666666" style={styles.icon} />
                                            <ThemedText style={styles.wrappedText}>{doctor.address}</ThemedText>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <IconSymbol name="phone.fill" size={16} color="#666666" style={styles.icon} />
                                            <ThemedText style={styles.wrappedText}>{doctor.phone}</ThemedText>
                                        </View>
                                        {doctor.website !== "N/A" && (
                                            <View style={styles.infoRow}>
                                                <IconSymbol name="globe" size={16} color="#666666" style={styles.icon} />
                                                <TouchableOpacity 
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        openWebsite(doctor.website);
                                                    }}
                                                >
                                                    <ThemedText style={styles.linkText}>Visit Website</ThemedText>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Animated.View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    doctorsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '60%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    noDoctorsOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noDoctorsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        maxWidth: 400,
        width: '90%',
    },
    noDoctorsTitle: {
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    noDoctorsText: {
        textAlign: 'center',
        opacity: 0.8,
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    doctorCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    selectedDoctorCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: '#0a7ea4',
        borderWidth: 1,
    },
    doctorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    doctorName: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 16,
        color: '#FFD700',
    },
    doctorInfo: {
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    icon: {
        marginTop: 2,
    },
    wrappedText: {
        flex: 1,
        fontSize: 14,
        opacity: 0.8,
    },
    linkText: {
        color: '#0a7ea4',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        marginBottom: 40,
    },
    handleContainer: {
        width: '100%',
        paddingBottom: 12,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        marginBottom: 0,
    },
    handleText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    doctorsList: {
        flex: 1,
        padding: 16,
    },
    permissionButton: {
        backgroundColor: '#0a7ea4',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 16,
    },
    permissionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}); 

