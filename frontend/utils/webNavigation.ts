import { Linking } from 'react-native';

export const openWebsite = async (url: string) => {
    if (url !== 'N/A') {
        await Linking.openURL(url);
    }
};