import os
import requests
from dotenv import load_dotenv

load_dotenv()

BETTERDOCTOR_API_KEY = os.getenv('BETTERDOCTOR_API_KEY')
BETTERDOCTOR_BASE_URL = 'https://api.betterdoctor.com/2016-03-01'

def find_doctors(location, limit=10):
    """
    Find doctors near a given location using the BetterDoctor API.
    
    Args:
        location (str): Location in format "city,state" or "zip"
        limit (int): Maximum number of doctors to return
        
    Returns:
        list: List of doctor information dictionaries
    """
    if not BETTERDOCTOR_API_KEY:
        raise ValueError("BETTERDOCTOR_API_KEY environment variable not set")
        
    params = {
        'user_key': BETTERDOCTOR_API_KEY,
        'location': location,
        'limit': limit,
        'sort': 'rating-desc'
    }
    
    try:
        response = requests.get(f'{BETTERDOCTOR_BASE_URL}/doctors', params=params)
        response.raise_for_status()
        data = response.json()
        
        doctors = []
        for doctor in data.get('data', []):
            doctor_info = {
                'name': f"{doctor.get('profile', {}).get('first_name', '')} {doctor.get('profile', {}).get('last_name', '')}",
                'specialty': doctor.get('specialties', [{}])[0].get('name', ''),
                'rating': doctor.get('ratings', [{}])[0].get('rating', 'N/A'),
                'address': doctor.get('practices', [{}])[0].get('visit_address', {}),
                'phone': doctor.get('practices', [{}])[0].get('phones', [{}])[0].get('number', 'N/A'),
                'accepting_new_patients': doctor.get('practices', [{}])[0].get('accepts_new_patients', False)
            }
            doctors.append(doctor_info)
            
        return doctors
        
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error fetching doctors: {str(e)}") 