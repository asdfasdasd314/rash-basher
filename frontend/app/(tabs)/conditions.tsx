import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { TouchableOpacity } from 'react-native';
import { openWebsite } from '@/utils/webNavigation';

export default function ProfileScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#E6E6FA', dark: '#2D2D3D' }}
            headerImage={
                <IconSymbol
                    size={310}
                    color="#808080"
                    name="bandage.fill"
                    style={styles.infoRow}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Conditions</ThemedText>
            </ThemedView>

            <ThemedView style={styles.disclaimerContainer}>
                <ThemedText type="subtitle">Disclaimer</ThemedText>
                <ThemedText style={styles.disclaimerText}>
                    We purposefully pull information straight from reliable sources such as Mayo Clinic because **WE ARE NOT MEDICAL PROFESSIONALS, WE ARE HIGH SCHOOL STUDENTS**
                </ThemedText>
                <ThemedText style={styles.disclaimerText}>
                    Always always always consult a doctor for any medical advice and never self-diagnose.
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.conditionContainer}>
                <ThemedText type="subtitle">Actinic Keratosis</ThemedText>
                <ThemedText style={styles.conditionQuestion}>How is it detected?</ThemedText>
                <ThemedText style={styles.conditionAnswer}>
                    "Nonpigmented facial actinic keratoses may exhibit a "strawberry pattern." This pattern includes an erythematous vessel pseudo network, prominent follicular openings, and a surrounding white halo." (Marques E, Chen TM)
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.conditionContainer}>
                <ThemedText type="subtitle">Basal Cell Carcinoma</ThemedText>
                <ThemedText style={styles.conditionQuestion}>How is it detected?</ThemedText>
                <ThemedText style={styles.conditionAnswer}>
                    "Basal cell carcinoma often appears as a slightly transparent bump on the skin, though it can take other forms. Basal cell carcinoma occurs most often on areas of the skin that are exposed to the sun, such as your head and neck." (Mayo Clinic Staff)
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.conditionContainer}>
                <ThemedText type="subtitle">Benign Keratosis-like Lesions</ThemedText>
                <ThemedText style={styles.conditionQuestion}>How is it detected?</ThemedText>
                <ThemedText style={styles.conditionAnswer}>
                    "Seborrheic keratoses are usually round or oval and range in color from light tan to black. They can develop as a single growth or in clusters. Seborrheic keratoses are benign skin growths that resemble actinic keratoses." (Mayo Clinic Staff)
                </ThemedText>
                <ThemedText style={styles.conditionQuestion}>What are its effects?</ThemedText>
                <ThemedText style={styles.conditionAnswer}>
                    "Seborrheic keratoses are harmless and not contagious. They don't need treatment, but you may decide to have them removed if they become irritated by clothing or you don't like how they look." (Mayo Clinic Staff)
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.conditionContainer}>
                <ThemedText type="subtitle">Dermatofibroma</ThemedText>
                <ThemedText style={styles.conditionQuestion}>How is it detected?</ThemedText>
                <ThemedText style={styles.conditionAnswer}>
                    "Dermatofibromas are slow-growing lesions that can develop on any part of the body, although they commonly affect the extremities. Clinically, they present as firm, nontender cutaneous nodules with or without accompanying skin changes, such as tan-pink to reddish-brown discoloration, which may vary depending on the age of the lesion. Typically, dermatofibromas measure 1 cm or less in diameter, but larger lesions exceeding 3 cm in diameter have been documented." (Myers DJ, Fillman EP)
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.citationSection}>
                <ThemedText type="subtitle">Citations</ThemedText>

                <View style={styles.citationContainer}>
                    <ThemedText style={styles.citationText}>
                        Marques E, Chen TM. Actinic Keratosis. [Updated 2023 Aug 17]. In: StatPearls [Internet]. Treasure Island (FL): StatPearls Publishing; 2025 Jan-. Available from:
                    </ThemedText>
                    <TouchableOpacity onPress={() => openWebsite('https://www.mayoclinic.org/diseases-conditions/asthma/in-depth/asthma/art-20046857')}>
                        <ThemedText style={styles.link}>https://www.mayoclinic.org/diseases-conditions/asthma/in-depth/asthma/art-20046857</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.citationContainer}>
                    <ThemedText style={styles.citationText}>
                        Mayo Clinic Staff. "Basal cell carcinoma." Mayo Clinic, 
                    </ThemedText>
                    <TouchableOpacity onPress={() => openWebsite('https://www.mayoclinic.org/diseases-conditions/basal-cell-carcinoma/symptoms-causes/syc-20354187')}>
                        <ThemedText style={styles.link}>https://www.mayoclinic.org/diseases-conditions/basal-cell-carcinoma/symptoms-causes/syc-20354187, </ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={styles.citationText}>
                        12 Apr 2025. Accessed 22 May 2025.
                    </ThemedText>
                </View>

                <View style={styles.divider} />

                <View style={styles.citationContainer}>
                    <ThemedText style={styles.citationText}>
                        Mayo Clinic Staff. "Seborrheic keratosis." Mayo Clinic, 
                    </ThemedText>
                    <TouchableOpacity onPress={() => openWebsite('https://www.mayoclinic.org/diseases-conditions/seborrheic-keratosis/symptoms-causes/syc-20353878')}>
                        <ThemedText style={styles.link}>https://www.mayoclinic.org/diseases-conditions/seborrheic-keratosis/symptoms-causes/syc-20353878, </ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={styles.citationText}>
                        18 Jan 2022. Accessed 22 May 2025.
                    </ThemedText>
                </View>

                <View style={styles.divider} />

                <View style={styles.citationContainer}>
                    <ThemedText style={styles.citationText}>
                        Myers DJ, Fillman EP. Dermatofibroma. [Updated 2024 Feb 29]. In: StatPearls [Internet]. Treasure Island (FL): StatPearls Publishing; 2025 Jan-. Available from:
                    </ThemedText>
                    <TouchableOpacity onPress={() => openWebsite('https://www.ncbi.nlm.nih.gov/books/NBK470538/')}>
                        <ThemedText style={styles.link}>https://www.ncbi.nlm.nih.gov/books/NBK470538/, </ThemedText>
                    </TouchableOpacity>
                </View>
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
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    statItem: {
        alignItems: 'center',
        gap: 4,
    },
    conditionContainer: {
        gap: 4,
    },
    conditionQuestion: {
        fontWeight: 'bold',
        color: 'orange'
    },
    conditionAnswer: {
        fontStyle: 'italic',
        color: 'yellow'
    },
    citationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 4,
    },
    citationText: {
        flexShrink: 1,
    },
    link: {
        color: '#0066CC',
    },
    divider: {
        height: 5,
        backgroundColor: '#000000',
        marginVertical: 16,
        width: '100%',
    },
    disclaimerContainer: {
        gap: 4,
        marginBottom: 50,
    },
    disclaimerText: {
        fontStyle: 'italic',
        color: 'red'
    },
    citationSection: {
        marginTop: 50,
    }
}); 
