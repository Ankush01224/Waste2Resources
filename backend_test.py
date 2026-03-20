import requests
import sys
import json
from datetime import datetime

class EcoMarketplaceAPITester:
    def __init__(self):
        # Use the public endpoint from frontend .env
        self.base_url = "https://recycle-market-7.preview.emergentagent.com/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_listing_id = None

    def log_test(self, name, status, message=""):
        """Log test results"""
        self.tests_run += 1
        if status:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED {message}")
        else:
            print(f"❌ {name}: FAILED {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method.upper() == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)
            else:
                self.log_test(name, False, f"Unsupported method: {method}")
                return False, {}

            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json() if response.text else {}
            except json.JSONDecodeError:
                pass
            
            if success:
                self.log_test(name, True, f"Status: {response.status_code}")
                return True, response_data
            else:
                error_detail = response_data.get('detail', response.text[:100]) if response_data else response.text[:100]
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Error: {error_detail}")
                return False, response_data

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Network error: {str(e)}")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Unexpected error: {str(e)}")
            return False, {}

    def test_auth_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "email": f"test_user_{timestamp}@ecomarket.com",
            "password": "TestPassword123!",
            "name": f"Test User {timestamp}",
            "role": "industry",
            "company_name": "Test Company",
            "location": "Test City"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_auth_login(self):
        """Test user login with existing credentials"""
        if not self.token:
            return False
            
        # Test login with same credentials used for registration
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "email": f"test_user_{timestamp}@ecomarket.com",
            "password": "TestPassword123!"
        }
        
        success, response = self.run_test(
            "User Login", 
            "POST",
            "auth/login",
            200,
            data=test_data
        )
        
        return success and 'token' in response

    def test_auth_me(self):
        """Test get current user info"""
        if not self.token:
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        return success and 'id' in response

    def test_create_listing(self):
        """Test creating a waste listing"""
        if not self.token:
            return False
            
        test_data = {
            "title": "Test Industrial Plastic Waste",
            "description": "High-quality HDPE plastic containers from manufacturing process",
            "waste_type": "plastic",
            "quantity": 500.0,
            "unit": "kg",
            "price": 250.00,
            "location": "Test Industrial Zone",
            "images": []
        }
        
        success, response = self.run_test(
            "Create Listing",
            "POST",
            "listings",
            200,
            data=test_data
        )
        
        if success and 'id' in response:
            self.created_listing_id = response['id']
            return True
        return False

    def test_get_listings(self):
        """Test fetching all listings"""
        success, response = self.run_test(
            "Get All Listings",
            "GET", 
            "listings",
            200
        )
        
        return success and isinstance(response, list)

    def test_get_my_listings(self):
        """Test fetching user's own listings"""
        if not self.token:
            return False
            
        success, response = self.run_test(
            "Get My Listings",
            "GET",
            "listings/my", 
            200
        )
        
        return success and isinstance(response, list)

    def test_get_listing_detail(self):
        """Test fetching a specific listing"""
        if not self.created_listing_id:
            return False
            
        success, response = self.run_test(
            "Get Listing Detail",
            "GET",
            f"listings/{self.created_listing_id}",
            200
        )
        
        return success and 'id' in response

    def test_ai_classification(self):
        """Test AI-based waste classification"""
        if not self.token or not self.created_listing_id:
            return False
            
        success, response = self.run_test(
            "AI Classification",
            "POST",
            f"listings/{self.created_listing_id}/classify",
            200
        )
        
        return success and 'classification' in response

    def test_environmental_impact(self):
        """Test environmental impact statistics"""
        success, response = self.run_test(
            "Environmental Impact",
            "GET",
            "impact",
            200
        )
        
        return success and 'co2_saved_kg' in response

    def test_search_functionality(self):
        """Test search functionality in listings"""
        success, response = self.run_test(
            "Search Listings",
            "GET",
            "listings?search=plastic",
            200
        )
        
        return success and isinstance(response, list)

    def test_filter_functionality(self):
        """Test filter functionality in listings"""
        success, response = self.run_test(
            "Filter Listings by Type",
            "GET", 
            "listings?waste_type=plastic",
            200
        )
        
        return success and isinstance(response, list)

    def cleanup_created_data(self):
        """Clean up test data"""
        if self.token and self.created_listing_id:
            self.run_test(
                "Cleanup - Delete Test Listing",
                "DELETE",
                f"listings/{self.created_listing_id}",
                200
            )

def main():
    """Main test execution"""
    print("🚀 Starting EcoMarketplace API Testing...")
    print("=" * 60)
    
    tester = EcoMarketplaceAPITester()
    
    # Test sequence - order matters for dependencies
    test_sequence = [
        ("Auth Registration", tester.test_auth_registration),
        ("Auth Login", tester.test_auth_login), 
        ("Get Current User", tester.test_auth_me),
        ("Create Listing", tester.test_create_listing),
        ("Get All Listings", tester.test_get_listings),
        ("Get My Listings", tester.test_get_my_listings),
        ("Get Listing Detail", tester.test_get_listing_detail),
        ("AI Classification", tester.test_ai_classification),
        ("Environmental Impact", tester.test_environmental_impact),
        ("Search Functionality", tester.test_search_functionality),
        ("Filter Functionality", tester.test_filter_functionality)
    ]
    
    # Execute tests
    for test_name, test_func in test_sequence:
        print(f"\n🔍 Running: {test_name}")
        try:
            test_func()
        except Exception as e:
            tester.log_test(test_name, False, f"Exception: {str(e)}")
    
    # Cleanup
    print(f"\n🧹 Cleanup")
    try:
        tester.cleanup_created_data()
    except Exception as e:
        print(f"⚠️ Cleanup warning: {str(e)}")
    
    # Results summary
    print(f"\n" + "=" * 60)
    print(f"📊 TEST RESULTS")
    print(f"Total Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"Success Rate: {success_rate:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 ALL TESTS PASSED!")
        return 0
    else:
        print("❌ SOME TESTS FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(main())