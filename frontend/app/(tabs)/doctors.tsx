import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { Doctor } from '@/types/doctor';
import * as Location from 'expo-location';

export default function SettingsScreen() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    useEffect(() => {
        async function onMount() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              setErrorMsg('Permission to access location was denied');
              return;
            }
      
            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);

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

            // For testing
            const data = {dermatologists: [{"address": "1500 E Medical Center Dr #1910, Ann Arbor, MI 48109, USA", "is_open": false, "location": [Object], "name": "Cosmetic Dermatology and Laser Center", "phone": "(734) 615-0682", "rating": 4.2, "total_ratings": 5, "website": "http://cosmeticderm.med.umich.edu/"}, {"address": "1500 E. Medical Center Drive, Floor 1, Reception B, Ann Arbor, MI 48109, USA", "is_open": false, "location": [Object], "name": "Dermatology at Taubman Center", "phone": "(734) 936-4054", "rating": 2.4, "total_ratings": 17, "website": "https://www.uofmhealth.org/our-locations/taubman-dermatology"}, {"address": "4990 Clark Rd Suite 200, Ypsilanti, MI 48197, USA", "is_open": false, "location": [Object], "name": "Trinity Health IHA Medical Group, Dermatologic Surgery - Arbor Park", "phone": "(734) 572-7500", "rating": 5, "total_ratings": 3, "website": "https://ihacares.com/locations/mi/ypsilanti/iha-dermatologic-surgery?utm_source=googlemybusiness&utm_campaign=Google%20My%20Business&utm_medium=organic"}, {"address": "305 E Eisenhower Pkwy Suite 320, Ann Arbor, MI 48108, USA", "is_open": false, "location": [Object], "name": "A. Craig Cattell, MD, FAAD", "phone": "(734) 800-2055", "rating": 4.8, "total_ratings": 69, "website": "https://forefrontdermatology.com/provider/craig-cattell-md/?utm_source=GMB&utm_medium=Yext&y_source=1_MTQ4NjQ0MjgtNzE1LWxvY2F0aW9uLndlYnNpdGU%3D"}, {"address": "250 W Eisenhower Pkwy #100, Ann Arbor, MI 48103, USA", "is_open": false, "location": [Object], "name": "Art of Dermatology - Ann Arbor", "phone": "(248) 581-0333", "rating": 4.9, "total_ratings": 284, "website": "http://www.theartofderm.com/"}, {"address": "1979 Huron Pkwy, Ann Arbor, MI 48104, USA", "is_open": false, "location": [Object], "name": "Ganger Dermatology (Ann Arbor)", "phone": "(734) 344-4567", "rating": 4.7, "total_ratings": 601, "website": "https://gangerdermatology.com/site/schedule-appointment/"}, {"address": "1500 E Medical Center Dr, Ann Arbor, MI 48109, USA", "is_open": false, "location": [Object], "name": "Derm Clinical Studies", "phone": "(734) 936-4070", "rating": "N/A", "total_ratings": 0, "website": "N/A"}, {"address": "1500 E Medical Center Dr # 1, Ann Arbor, MI 48109, USA", "is_open": false, "location": [Object], "name": "Ellis Charles MD", "phone": "(734) 936-4054", "rating": 5, "total_ratings": 1, "website": "http://www.uofmhealth.org/"}, {"address": "1500 E Medical Center Dr, Ann Arbor, MI 48109, USA", "is_open": true, "location": [Object], "name": "A. Alfred Taubman Health Care Center", "phone": "(734) 936-4000", "rating": 4.2, "total_ratings": 136, "website": "http://www.med.umich.edu/"}, {"address": "207 Fletcher St, Ann Arbor, MI 48109, USA", "is_open": false, "location": [Object], "name": "University Health Service, University of Michigan", "phone": "(734) 764-8320", "rating": 2.5, "total_ratings": 151, "website": "https://uhs.umich.edu/"}]};

            console.log("Fetched data");

            // if (response.ok) {
            //     const data = await response.json();
                setDoctors(data.dermatologists as Doctor[]);
                setErrorMsg(null);
            // }
            // else {
            //     setErrorMsg(await response.text());
            // }
        }
      
        onMount();
    }, []);

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

            {errorMsg && <ThemedText>{errorMsg}</ThemedText>}

            {doctors.length > 0 &&
                <View>
                    <ThemedView style={styles.titleContainer}>
                        <ThemedText type="title">Doctors</ThemedText>
                    </ThemedView>

                    {doctors.map((doctor) => (
                        <View key={doctor.name}>
                            <ThemedText>{doctor.name}</ThemedText>
                            <ThemedText>{doctor.address}</ThemedText>
                            <ThemedText>{doctor.phone}</ThemedText>
                            <ThemedText>{doctor.rating}</ThemedText>
                            <ThemedText>{doctor.total_ratings}</ThemedText>
                            <ThemedText>{doctor.website}</ThemedText>
                            <ThemedText>{doctor.is_open}</ThemedText>
                        </View>
                    ))}
                </View>
            }
            
            {doctors.length === 0 &&
                <View>
                    <ThemedText>No doctors found</ThemedText>
                </View>
            }
            
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
