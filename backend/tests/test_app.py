import unittest
import json
from app import app
from unittest.mock import patch, MagicMock

class TestApp(unittest.TestCase):
    def setUp(self):
        """Set up test client and other test variables"""
        self.app = app.test_client()
        self.app.testing = True

    def test_find_doctors_missing_data(self):
        """Test the find_doctors endpoint with missing data"""
        response = self.app.post('/api/find-doctors', 
                               data=json.dumps({}),
                               content_type='application/json')
        
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(data['error'], 'No data provided')

    def test_find_doctors_missing_location(self):
        """Test the find_doctors endpoint with missing location data"""
        response = self.app.post('/api/find-doctors', 
                               data=json.dumps({'some_other_field': 'value'}),
                               content_type='application/json')
        
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(data['error'], 'Either latitude/longitude or address is required')

    @patch('maps.geocode_address')
    def test_find_doctors_with_address(self, mock_geocode):
        """Test the find_doctors endpoint with an address"""
        # Mock the geocode function to return coordinates
        mock_geocode.return_value = (37.7749, -122.4194)
        
        # Mock the find_local_doctors function
        with patch('maps.find_local_doctors') as mock_find_doctors:
            mock_find_doctors.return_value = [
                {
                    'name': 'Test Doctor',
                    'address': '123 Test St',
                    'phone': '555-0123',
                    'rating': 4.5,
                    'total_ratings': 100,
                    'website': 'http://test.com',
                    'is_open': True,
                    'location': {'lat': 37.7749, 'lng': -122.4194}
                }
            ]
            
            response = self.app.post('/api/find-doctors', 
                                   data=json.dumps({'address': '123 Test St, San Francisco, CA'}),
                                   content_type='application/json')
            
            data = json.loads(response.data)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(data['doctors']), 1)
            self.assertEqual(data['doctors'][0]['name'], 'Test Doctor')

    def test_find_doctors_with_coordinates(self):
        """Test the find_doctors endpoint with coordinates"""
        with patch('maps.find_local_doctors') as mock_find_doctors:
            mock_find_doctors.return_value = [
                {
                    'name': 'Test Doctor',
                    'address': '123 Test St',
                    'phone': '555-0123',
                    'rating': 4.5,
                    'total_ratings': 100,
                    'website': 'http://test.com',
                    'is_open': True,
                    'location': {'lat': 37.7749, 'lng': -122.4194}
                }
            ]
            
            response = self.app.post('/api/find-doctors', 
                                   data=json.dumps({
                                       'latitude': 37.7749,
                                       'longitude': -122.4194
                                   }),
                                   content_type='application/json')
            
            data = json.loads(response.data)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(data['doctors']), 1)
            self.assertEqual(data['doctors'][0]['name'], 'Test Doctor')

    def test_find_doctors_with_custom_radius_and_limit(self):
        """Test the find_doctors endpoint with custom radius and limit"""
        with patch('maps.find_local_doctors') as mock_find_doctors:
            mock_find_doctors.return_value = [
                {
                    'name': 'Test Doctor',
                    'address': '123 Test St',
                    'phone': '555-0123',
                    'rating': 4.5,
                    'total_ratings': 100,
                    'website': 'http://test.com',
                    'is_open': True,
                    'location': {'lat': 37.7749, 'lng': -122.4194}
                }
            ]
            
            response = self.app.post('/api/find-doctors', 
                                   data=json.dumps({
                                       'latitude': 37.7749,
                                       'longitude': -122.4194,
                                       'radius': 10000,
                                       'limit': 5
                                   }),
                                   content_type='application/json')
            
            data = json.loads(response.data)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(data['doctors']), 1)
            # Verify that find_local_doctors was called with the correct parameters
            mock_find_doctors.assert_called_with(37.7749, -122.4194, 10000, 5)

if __name__ == '__main__':
    unittest.main() 