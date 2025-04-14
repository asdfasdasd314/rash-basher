import os
import googlemaps
from dotenv import load_dotenv, get_key

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

def query_places_from_maps(latitude: float, longitude: float, search: str, radius=5000, max_results=10) -> list:
    if not GOOGLE_MAPS_API_KEY:
        raise ValueError("GOOGLE_MAPS_API_KEY environment variable not set")
        
    try:
        gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
        
        # Search for doctors and medical facilities
        places_result = gmaps.places_nearby(
            location=(latitude, longitude),
            radius=radius,
            keyword=search,
            type='health'
        )
        
        places = []
        for place in places_result.get('results', [])[:max_results]:
            # Get detailed place information
            place_details = gmaps.place(place['place_id'], fields=[
                'name', 'formatted_address', 'formatted_phone_number',
                'opening_hours', 'rating', 'user_ratings_total', 'website'
            ])['result']
            
            place_info = {
                'name': place_details.get('name', ''),
                'address': place_details.get('formatted_address', ''),
                'phone': place_details.get('formatted_phone_number', 'N/A'),
                'rating': place_details.get('rating', 'N/A'),
                'total_ratings': place_details.get('user_ratings_total', 0),
                'website': place_details.get('website', 'N/A'),
                'is_open': place_details.get('opening_hours', {}).get('open_now', False),
                'location': {
                    'lat': place['geometry']['location']['lat'],
                    'lng': place['geometry']['location']['lng']
                }
            }
            places.append(place_info)
            
        return places
        
    except Exception as e:
        raise Exception(f"Error fetching data from Google Maps: {str(e)}")

def find_local_dermatologists(latitude: float, longitude: float, radius=5000, max_results=10):
    """
    Find dermatoligists, as that is what our app is mostly for

    Args:
        latitude (float): Latitude of the location
        longitude (float): Longitude of the location
        radius (int): Search radius in meters (default: 5000m = 5km)
        max_results (int): Maximum number of results to return
        
    Returns:
        list: List of dermatologist information dictionaries
    """
    return query_places_from_maps(latitude, longitude, 'dermatologist medical clinic', radius, max_results)


def find_local_doctors(latitude, longitude, radius=5000, max_results=10):
    """
    Find doctors near a given location using the Google Maps Places API.
    
    Args:
        latitude (float): Latitude of the location
        longitude (float): Longitude of the location
        radius (int): Search radius in meters (default: 5000m = 5km)
        max_results (int): Maximum number of results to return
        
    Returns:
        list: List of doctor information dictionaries
    """
    return query_places_from_maps(latitude, longitude, "doctor medical clinic hospital", radius, max_results)


def geocode_address(address: str):
    """
    Convert an address to latitude and longitude coordinates.
    
    Args:
        address (str): Address to geocode
        
    Returns:
        tuple: (latitude, longitude) coordinates
    """
    if not GOOGLE_MAPS_API_KEY:
        raise ValueError("GOOGLE_MAPS_API_KEY environment variable not set")
        
    try:
        gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
        geocode_result = gmaps.geocode(address)
        
        if not geocode_result:
            raise ValueError(f"Could not geocode address: {address}")
            
        location = geocode_result[0]['geometry']['location']
        return location['lat'], location['lng']
        
    except Exception as e:
        raise Exception(f"Error geocoding address: {str(e)}") 


def reverse_geocode_address(latitude: float, longitude: float):
    """
    Convert an address to latitude and longitude coordinates.

    Args:
        latitude (float): Latitude position
        longitude (float): Longitude position

    Returns:
        address (str): Address to geocode (reverse of geocode_address function)
    """

    if not GOOGLE_MAPS_API_KEY:
        raise ValueError("GOOGLE_MAPS_API_KEY environment variable not set")
    
    try:
        gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
        address_result = gmaps.reverse_geocode((latitude, longitude))

        if not address_result:
            raise ValueError(f"Could not reverse geocode location: {(latitude, longitude)}")
        
        location = address_result[0]['formatted_address']
        return location

    except Exception as e:
        raise Exception(f"Error geocoding address: {str(e)}")