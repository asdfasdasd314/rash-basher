import unittest
from unittest.mock import patch, MagicMock
import os
from maps import find_local_doctors, geocode_address

class TestMaps(unittest.TestCase):
    def setUp(self):
        """Set up test variables"""
        # Mock environment variable
        self.patcher = patch.dict('os.environ', {'GOOGLE_MAPS_API_KEY': 'test_api_key'})
        self.patcher.start()
        
        # Sample test data
        self.test_lat = 37.7749
        self.test_lng = -122.4194
        self.test_address = "123 Test St, San Francisco, CA"
        
        # Sample doctor data
        self.sample_doctor = {
            'name': 'Test Doctor',
            'address': '123 Test St',
            'phone': '555-0123',
            'rating': 4.5,
            'total_ratings': 100,
            'website': 'http://test.com',
            'is_open': True,
            'location': {'lat': 37.7749, 'lng': -122.4194}
        }

    def tearDown(self):
        """Clean up after tests"""
        self.patcher.stop()

    @patch('googlemaps.Client')
    def test_find_local_doctors(self, mock_client):
        """Test the find_local_doctors function"""
        # Mock the Google Maps client
        mock_instance = mock_client.return_value
        
        # Mock the places_nearby method
        mock_instance.places_nearby.return_value = {
            'results': [
                {
                    'place_id': 'test_place_id',
                    'geometry': {
                        'location': {
                            'lat': self.test_lat,
                            'lng': self.test_lng
                        }
                    }
                }
            ]
        }
        
        # Mock the place method
        mock_instance.place.return_value = {
            'result': {
                'name': self.sample_doctor['name'],
                'formatted_address': self.sample_doctor['address'],
                'formatted_phone_number': self.sample_doctor['phone'],
                'rating': self.sample_doctor['rating'],
                'user_ratings_total': self.sample_doctor['total_ratings'],
                'website': self.sample_doctor['website'],
                'opening_hours': {'open_now': self.sample_doctor['is_open']}
            }
        }
        
        # Call the function
        result = find_local_doctors(self.test_lat, self.test_lng)
        
        # Verify the result
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['name'], self.sample_doctor['name'])
        self.assertEqual(result[0]['address'], self.sample_doctor['address'])
        
        # Verify the client was called correctly
        mock_instance.places_nearby.assert_called_once()
        mock_instance.place.assert_called_once()

    @patch('googlemaps.Client')
    def test_geocode_address(self, mock_client):
        """Test the geocode_address function"""
        # Mock the Google Maps client
        mock_instance = mock_client.return_value
        
        # Mock the geocode method
        mock_instance.geocode.return_value = [
            {
                'geometry': {
                    'location': {
                        'lat': self.test_lat,
                        'lng': self.test_lng
                    }
                }
            }
        ]
        
        # Call the function
        lat, lng = geocode_address(self.test_address)
        
        # Verify the result
        self.assertEqual(lat, self.test_lat)
        self.assertEqual(lng, self.test_lng)
        
        # Verify the client was called correctly
        mock_instance.geocode.assert_called_once_with(self.test_address)

    def test_find_local_doctors_missing_api_key(self):
        """Test find_local_doctors with missing API key"""
        # Remove the API key
        with patch.dict('os.environ', {}, clear=True):
            with self.assertRaises(ValueError) as context:
                find_local_doctors(self.test_lat, self.test_lng)
            
            self.assertIn("GOOGLE_MAPS_API_KEY environment variable not set", str(context.exception))

    def test_geocode_address_missing_api_key(self):
        """Test geocode_address with missing API key"""
        # Remove the API key
        with patch.dict('os.environ', {}, clear=True):
            with self.assertRaises(ValueError) as context:
                geocode_address(self.test_address)
            
            self.assertIn("GOOGLE_MAPS_API_KEY environment variable not set", str(context.exception))

    @patch('googlemaps.Client')
    def test_geocode_address_not_found(self, mock_client):
        """Test geocode_address with an address that can't be found"""
        # Mock the Google Maps client
        mock_instance = mock_client.return_value
        
        # Mock the geocode method to return empty results
        mock_instance.geocode.return_value = []
        
        # Call the function and expect an error
        with self.assertRaises(ValueError) as context:
            geocode_address(self.test_address)
        
        self.assertIn("Could not geocode address", str(context.exception))

if __name__ == '__main__':
    unittest.main() 