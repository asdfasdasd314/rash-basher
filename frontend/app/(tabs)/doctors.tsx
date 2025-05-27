// React Native example
import { View, Text, Platform, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { useState, useEffect, useRef } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Doctor } from '@/types/doctor';
import * as Location from 'expo-location';
import { openWebsite } from '@/utils/webNavigation';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function DoctorsScreen() {
    const colorScheme = useColorScheme();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const screenHeight = Dimensions.get('window').height;
    const minHeight = 100;
    const maxHeight = screenHeight * 0.8;
    const animatedHeight = useRef(new Animated.Value(minHeight)).current;
    const webViewRef = useRef<WebView>(null);

    // Function to generate the HTML content for the map
    const generateMapHtml = (doctors: Doctor[], selectedDoctor: Doctor | null) => {
        const markers = doctors.map(doctor => {
            const isSelected = selectedDoctor?.name === doctor.name;
            return `
                L.marker([${doctor.location.lat}, ${doctor.location.lng}])
                    .addTo(map)
                    .bindPopup(
                        <div class="popup-content">
                            <h3>${doctor.name}</h3>
                            <p>${doctor.address}</p>
                            <p>Rating: ${doctor.rating}</p>
                            <p>Phone: ${doctor.phone}</p>
                            ${doctor.website !== "N/A" ? `<a href="${doctor.website}" target="_blank">Visit Website</a>` : ''}
                        </div>
                    )
                    ${isSelected ? '.openPopup()' : ''};
            `;
        }).join('\n');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
                <style>
                    body { margin: 0; }
                    #map { height: 100vh; }
                    .popup-content {
                        padding: 10px;
                    }
                    .popup-content h3 {
                        margin: 0 0 10px 0;
                    }
                    .popup-content a {
                        color: #0a7ea4;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div id="map"></div>
                <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
                <script>
                    var map = L.map('map').setView([42.2813, -83.7311], 13);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                    
                    ${markers}

                    // Handle popup open/close
                    map.on('popupopen', function(e) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'popupOpen',
                            doctor: {
                                name: e.popup.getContent().querySelector('h3').textContent,
                                address: e.popup.getContent().querySelector('p').textContent,
                                rating: e.popup.getContent().querySelectorAll('p')[1].textContent.split(': ')[1],
                                phone: e.popup.getContent().querySelectorAll('p')[2].textContent.split(': ')[1],
                                website: e.popup.getContent().querySelector('a')?.href || "N/A"
                            }
                        }));
                    });

                    map.on('popupclose', function() {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'popupClose'
                        }));
                    });
                </script>
            </body>
            </html>
        `;
    };

    // Handle messages from the WebView
    const handleWebViewMessage = (event: any) => {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'popupOpen') {
            setSelectedDoctor(data.doctor);
            setIsExpanded(true);
            animateSheet(maxHeight);
        } else if (data.type === 'popupClose') {
            setSelectedDoctor(null);
            setIsExpanded(false);
            animateSheet(minHeight);
        }
    };

    const animateSheet = (toValue: number) => {
        Animated.timing(animatedHeight, {
            toValue,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    useEffect(() => {
        async function onMount() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
      
            let location = await Location.getCurrentPositionAsync({});

            // const response = await fetch('https://backend-681014983462.us-east4.run.app/doctors/find-dermatologists', {
            //     method: 'POST',
            //     body: JSON.stringify({
            //         latitude: location.coords.latitude,
            //         longitude: location.coords.longitude,
            //     }),
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            // });

            const data = {dermatologists: [
                {"address": "1500 E Medical Center Dr #1910, Ann Arbor, MI 48109, USA", "is_open": false, "location": { "lat": 42.2813, "lng": -83.7311 }, "name": "Cosmetic Dermatology and Laser Center", "phone": "(734) 615-0682", "rating": 4.2, "total_ratings": 5, "website": "http://cosmeticderm.med.umich.edu/"},
                {"address": "1500 E. Medical Center Drive, Floor 1, Reception B, Ann Arbor, MI 48109, USA", "is_open": false, "location": { "lat": 42.2814, "lng": -83.7312 }, "name": "Dermatology at Taubman Center", "phone": "(734) 936-4054", "rating": 2.4, "total_ratings": 17, "website": "https://www.uofmhealth.org/our-locations/taubman-dermatology"},
                {"address": "4990 Clark Rd Suite 200, Ypsilanti, MI 48197, USA", "is_open": false, "location": { "lat": 42.2815, "lng": -83.7313 }, "name": "Trinity Health IHA Medical Group, Dermatologic Surgery - Arbor Park", "phone": "(734) 572-7500", "rating": 5, "total_ratings": 3, "website": "https://ihacares.com/locations/mi/ypsilanti/iha-dermatologic-surgery?utm_source=googlemybusiness&utm_campaign=Google%20My%20Business&utm_medium=organic"},
                {"address": "305 E Eisenhower Pkwy Suite 320, Ann Arbor, MI 48108, USA", "is_open": false, "location": { "lat": 42.2816, "lng": -83.7314 }, "name": "A. Craig Cattell, MD, FAAD", "phone": "(734) 800-2055", "rating": 4.8, "total_ratings": 69, "website": "https://forefrontdermatology.com/provider/craig-cattell-md/?utm_source=GMB&utm_medium=Yext&y_source=1_MTQ4NjQ0MjgtNzE1LWxvY2F0aW9uLndlYnNpdGU%3D"},
                {"address": "250 W Eisenhower Pkwy #100, Ann Arbor, MI 48103, USA", "is_open": false, "location": { "lat": 42.2817, "lng": -83.7315 }, "name": "Art of Dermatology - Ann Arbor", "phone": "(248) 581-0333", "rating": 4.9, "total_ratings": 284, "website": "http://www.theartofderm.com/"},
                {"address": "1979 Huron Pkwy, Ann Arbor, MI 48104, USA", "is_open": false, "location": { "lat": 42.2818, "lng": -83.7316 }, "name": "Ganger Dermatology (Ann Arbor)", "phone": "(734) 344-4567", "rating": 4.7, "total_ratings": 601, "website": "https://gangerdermatology.com/site/schedule-appointment/"},
                {"address": "1500 E Medical Center Dr, Ann Arbor, MI 48109, USA", "is_open": false, "location": { "lat": 42.2819, "lng": -83.7317 }, "name": "Derm Clinical Studies", "phone": "(734) 936-4070", "rating": "N/A", "total_ratings": 0, "website": "N/A"},
                {"address": "1500 E Medical Center Dr # 1, Ann Arbor, MI 48109, USA", "is_open": false, "location": { "lat": 42.2820, "lng": -83.7318 }, "name": "Ellis Charles MD", "phone": "(734) 936-4054", "rating": 5, "total_ratings": 1, "website": "http://www.uofmhealth.org/"},
                {"address": "1500 E Medical Center Dr, Ann Arbor, MI 48109, USA", "is_open": true, "location": { "lat": 42.2821, "lng": -83.7319 }, "name": "A. Alfred Taubman Health Care Center", "phone": "(734) 936-4000", "rating": 4.2, "total_ratings": 136, "website": "http://www.med.umich.edu/"},
                {"address": "207 Fletcher St, Ann Arbor, MI 48109, USA", "is_open": false, "location": { "lat": 42.2822, "lng": -83.7320 }, "name": "University Health Service, University of Michigan", "phone": "(734) 764-8320", "rating": 2.5, "total_ratings": 151, "website": "https://uhs.umich.edu/"}
            ]};

            // if (response.ok) {
            //     const data = await response.json();
                setDoctors(data.dermatologists as Doctor[]);
                setErrorMsg(null);
            // } else {
            //     setErrorMsg(await response.text());
            // }
        }
      
        onMount();
    }, []);

    return (
        <>
            {Platform.OS === 'web' ? (
                <View style={styles.container}>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.30591910525!2d-74.25986432970718!3d40.697149422113014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1647043087963!5m2!1sen!2s"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </View>
            ) : (
                <View style={styles.container}>
                    {/* <WebView
                        ref={webViewRef}
                        originWhitelist={['*']}
                        source={{ html: generateMapHtml(doctors, selectedDoctor) }}
                        onMessage={handleWebViewMessage}
                        style={styles.map}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        scalesPageToFit={true}
                    /> */}
                </View>
            )}

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
                <TouchableOpacity 
                    onPress={() => {
                        setIsExpanded(!isExpanded);
                        animateSheet(isExpanded ? minHeight : maxHeight);
                    }} 
                    style={styles.handleContainer}
                >
                    <IconSymbol
                        name={isExpanded ? 'chevron.down' : 'chevron.up'}
                        size={32}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>
                <ScrollView style={styles.doctorsList}>
                    {doctors.map((doctor) => (
                        <TouchableOpacity 
                            key={doctor.name}
                            style={[
                                styles.doctorCard,
                                selectedDoctor?.name === doctor.name && styles.selectedDoctorCard
                            ]}
                            onPress={() => {
                                setSelectedDoctor(doctor);
                                webViewRef.current?.injectJavaScript(`
                                    map.setView([${doctor.location.lat}, ${doctor.location.lng}], 15);
                                    document.querySelectorAll('.leaflet-popup').forEach(popup => popup.remove());
                                    L.marker([${doctor.location.lat}, ${doctor.location.lng}])
                                        .addTo(map)
                                        .bindPopup(
                                            <div class="popup-content">
                                                <h3>${doctor.name}</h3>
                                                <p>${doctor.address}</p>
                                                <p>Rating: ${doctor.rating}</p>
                                                <p>Phone: ${doctor.phone}</p>
                                                ${doctor.website !== "N/A" ? `<a href="${doctor.website}" target="_blank">Visit Website</a>` : ''}
                                            </div>
                                        )
                                        .openPopup();
                                `);
                            }}
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        position: 'relative',
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#25292e',
    },
    headerImage: {
        color: '#808080',
        bottom: -50,
        left: -35,
        position: 'absolute',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    section: {
        marginBottom: 24,
        gap: 12,
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
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    handleContainer: {
        width: '100%',
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    doctorsList: {
        flex: 1,
        padding: 16,
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
});
