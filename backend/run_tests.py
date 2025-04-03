import unittest
import sys
import os

# Add the parent directory to the path so we can import our modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the test modules
from backend.tests.test_app import TestApp
from backend.tests.test_maps import TestMaps

def run_tests():
    """Run all the tests"""
    # Create a test suite
    test_suite = unittest.TestSuite()
    
    # Add the test cases
    test_suite.addTests(unittest.TestLoader().loadTestsFromTestCase(TestApp))
    test_suite.addTests(unittest.TestLoader().loadTestsFromTestCase(TestMaps))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Return 0 if tests passed, 1 if any failed
    return 0 if result.wasSuccessful() else 1

if __name__ == '__main__':
    sys.exit(run_tests()) 