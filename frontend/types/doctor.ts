export type Doctor = {
    name: string;
    address: string;
    phone: string;
    rating: string;
    total_ratings: number;
    website: string;
    is_open: boolean;
    location: {
        lat: number;
        lng: number;
    };
}