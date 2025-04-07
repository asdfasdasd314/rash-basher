import os
import googlemaps
from dotenv import load_dotenv, get_key

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

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
    if not GOOGLE_MAPS_API_KEY:
        raise ValueError("GOOGLE_MAPS_API_KEY environment variable not set")
        
    try:
        gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
        
        # Search for doctors and medical facilities
        places_result = gmaps.places_nearby(
            location=(latitude, longitude),
            radius=radius,
            keyword='doctor medical clinic hospital',
            type='health'
        )
        
        doctors = []
        for place in places_result.get('results', [])[:max_results]:
            # Get detailed place information
            place_details = gmaps.place(place['place_id'], fields=[
                'name', 'formatted_address', 'formatted_phone_number',
                'opening_hours', 'rating', 'user_ratings_total', 'website'
            ])['result']
            
            doctor_info = {
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
            doctors.append(doctor_info)
            
        return doctors
        
    except Exception as e:
        raise Exception(f"Error fetching doctors from Google Maps: {str(e)}")


def geocode_address(address):
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


def reverse_geocode_address(latitude, longitude):
    """
    Convert an address to latitude and longitude coordinates.

    Args:
        latitude (int): Latitude position
        longitude (int): Longitude position

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