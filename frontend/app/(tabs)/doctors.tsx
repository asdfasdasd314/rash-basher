import { StyleSheet, View, Linking, TouchableOpacity, ScrollView, Dimensions, Animated, Platform, UIManager, Easing } from 'react-native';
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

    useEffect(() => {
        async function onMount() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              setErrorMsg('Permission to access location was denied');
              return;
            }
      
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

            // For testing
            // const data = {dermatologists: [
            //     {"address": "1500 E Medical Center Dr #1910, Ann Arbor, MI 48109, USA", "is_open": false, "location": { "latitude": 42.2813, "longitude": -83.7311 }, "name": "Cosmetic Dermatology and Laser Center", "phone": "(734) 615-0682", "rating": 4.2, "total_ratings": 5, "website": "http://cosmeticderm.med.umich.edu/"},
            //     {"address": "1500 E. Medical Center Drive, Floor 1, Reception B, Ann Arbor, MI 48109, USA", "is_open": false, "location": { "latitude": 42.2814, "longitude": -83.7312 }, "name": "Dermatology at Taubman Center", "phone": "(734) 936-4054", "rating": 2.4, "total_ratings": 17, "website": "https://www.uofmhealth.org/our-locations/taubman-dermatology"},
            //     {"address": "4990 Clark Rd Suite 200, Ypsilanti, MI 48197, USA", "is_open": false, "location": { "latitude": 42.2815, "longitude": -83.7313 }, "name": "Trinity Health IHA Medical Group, Dermatologic Surgery - Arbor Park", "phone": "(734) 572-7500", "rating": 5, "total_ratings": 3, "website": "https://ihacares.com/locations/mi/ypsilanti/iha-dermatologic-surgery?utm_source=googlemybusiness&utm_campaign=Google%20My%20Business&utm_medium=organic"},
            //     {"address": "305 E Eisenhower Pkwy Suite 320, Ann Arbor, MI 48108, USA", "is_open": false, "location": { "latitude": 42.2816, "longitude": -83.7314 }, "name": "A. Craig Cattell, MD, FAAD", "phone": "(734) 800-2055", "rating": 4.8, "total_ratings": 69, "website": "https://forefrontdermatology.com/provider/craig-cattell-md/?utm_source=GMB&utm_medium=Yext&y_source=1_MTQ4NjQ0MjgtNzE1LWxvY2F0aW9uLndlYnNpdGU%3D"},
            //     {"address": "250 W Eisenhower Pkwy #100, Ann Arbor, MI 48103, USA", "is_open": false, "location": { "latitude": 42.2817, "longitude": -83.7315 }, "name": "Art of Dermatology - Ann Arbor", "phone": "(248) 581-0333", "rating": 4.9, "total_ratings": 284, "website": "http://www.theartofderm.com/"},
            //     {"address": "1979 Huron Pkwy, Ann Arbor, MI 48104, USA", "is_open": false, "location": { "latitude": 42.2818, "longitude": -83.7316 }, "name": "Ganger Dermatology (Ann Arbor)", "phone": "(734) 344-4567", "rating": 4.7, "total_ratings": 601, "website": "https://gangerdermatology.com/site/schedule-appointment/"},
            //     {"address": "1500 E Medical Center Dr, Ann Arbor, MI 48109, USA", "is_open": false, "location": { "latitude": 42.2819, "longitude": -83.7317 }, "name": "Derm Clinical Studies", "phone": "(734) 936-4070", "rating": "N/A", "total_ratings": 0, "website": "N/A"},
            //     {"address": "1500 E Medical Center Dr # 1, Ann Arbor, MI 48109, USA", "is_open": false, "location": { "latitude": 42.2820, "longitude": -83.7318 }, "name": "Ellis Charles MD", "phone": "(734) 936-4054", "rating": 5, "total_ratings": 1, "website": "http://www.uofmhealth.org/"},
            //     {"address": "1500 E Medical Center Dr, Ann Arbor, MI 48109, USA", "is_open": true, "location": { "latitude": 42.2821, "longitude": -83.7319 }, "name": "A. Alfred Taubman Health Care Center", "phone": "(734) 936-4000", "rating": 4.2, "total_ratings": 136, "website": "http://www.med.umich.edu/"},
            //     {"address": "207 Fletcher St, Ann Arbor, MI 48109, USA", "is_open": false, "location": { "latitude": 42.2822, "longitude": -83.7320 }, "name": "University Health Service, University of Michigan", "phone": "(734) 764-8320", "rating": 2.5, "total_ratings": 151, "website": "https://uhs.umich.edu/"}
            // ]};

            if (response.ok) {
                const data = await response.json();
                setDoctors(data.dermatologists as Doctor[]);
                setErrorMsg(null);
            }
            else {
                setErrorMsg(await response.text());
            }
        }
      
        onMount();
    }, []);


    const openMaps = async (address: string) => {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        await Linking.openURL(mapsUrl);
    };

    return (
        <View style={styles.container}>
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
                        style={styles.arrowHandle}
                    />
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
        marginBottom: 24,
    },
    handleContainer: {
        width: '100%',
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    arrowHandle: {
        // No extra style needed, but you can add margin if desired
    },
    doctorsList: {
        flex: 1,
        padding: 16,
    },
}); 
