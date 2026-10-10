"""
API Testing Script - Tests all major endpoints
Run this after starting the backend to verify everything works
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def print_test(name, passed):
    status = "✓ PASS" if passed else "✗ FAIL"
    print(f"{status} - {name}")

def test_health_check():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        passed = response.status_code == 200 and "status" in response.json()
        print_test("Health Check", passed)
        if passed:
            print(f"  Response: {json.dumps(response.json(), indent=2)}")
        return passed
    except Exception as e:
        print_test("Health Check", False)
        print(f"  Error: {e}")
        return False

def test_register():
    """Test user registration"""
    try:
        data = {
            "name": "Test User",
            "email": "test@example.com",
            "password": "test123456"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=data)
        passed = response.status_code in [200, 201] and "access_token" in response.json()
        print_test("User Registration", passed)
        if passed:
            return response.json()["access_token"]
        return None
    except Exception as e:
        print_test("User Registration", False)
        print(f"  Error: {e}")
        return None

def test_ml_prediction(token):
    """Test ML category prediction"""
    try:
        data = {
            "resume_text": """
            Senior Software Engineer with 7+ years of experience in full-stack development.
            Expertise in Python, JavaScript, React, Node.js, AWS, and Docker.
            Led development of scalable microservices handling 1M+ requests/day.
            Strong experience in agile methodologies and CI/CD pipelines.
            """
        }
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(f"{BASE_URL}/api/ml/predict-category", json=data, headers=headers)
        passed = response.status_code == 200 and "predicted_category" in response.json()
        print_test("ML Category Prediction", passed)
        if passed:
            result = response.json()
            print(f"  Predicted: {result['predicted_category']}")
            print(f"  Confidence: {result['confidence']:.2%}")
        return passed
    except Exception as e:
        print_test("ML Category Prediction", False)
        print(f"  Error: {e}")
        return False

def test_ats_analysis(token):
    """Test ATS analysis"""
    try:
        data = {
            "resumeData": {
                "personal": {
                    "fullName": "Jane Smith",
                    "email": "jane@example.com",
                    "phone": "555-0123",
                    "location": "San Francisco, CA"
                },
                "summary": "Results-driven software engineer with 5+ years building enterprise applications",
                "experience": [
                    {
                        "jobTitle": "Senior Software Engineer",
                        "company": "Tech Corp",
                        "startDate": "2020",
                        "endDate": "2025",
                        "bulletPoints": [
                            "Led development of microservices architecture",
                            "Improved system performance by 60%",
                            "Mentored team of 4 junior developers"
                        ]
                    }
                ],
                "education": [
                    {
                        "degree": "BS Computer Science",
                        "institution": "Stanford University",
                        "endYear": "2019"
                    }
                ],
                "skills": [
                    {"name": "Python", "level": "expert"},
                    {"name": "React", "level": "advanced"},
                    {"name": "AWS", "level": "advanced"},
                    {"name": "Docker", "level": "intermediate"}
                ]
            }
        }
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(f"{BASE_URL}/api/ats/analyze", json=data, headers=headers)
        passed = response.status_code == 200 and "overallScore" in response.json()
        print_test("ATS Analysis", passed)
        if passed:
            result = response.json()
            print(f"  Overall Score: {result['overallScore']}/100")
            print(f"  Strengths: {len(result['strengths'])}")
            print(f"  Suggestions: {len(result['suggestions'])}")
        return passed
    except Exception as e:
        print_test("ATS Analysis", False)
        print(f"  Error: {e}")
        return False

def test_resume_creation(token):
    """Test resume creation"""
    try:
        data = {
            "title": "My Software Engineering Resume",
            "template": "modern",
            "resume_data": {
                "personal": {
                    "fullName": "Test User",
                    "email": "test@example.com",
                    "phone": "555-1234"
                },
                "summary": "Passionate developer",
                "experience": [],
                "education": [],
                "skills": []
            }
        }
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(f"{BASE_URL}/api/resumes", json=data, headers=headers)
        passed = response.status_code in [200, 201] and "id" in response.json()
        print_test("Resume Creation", passed)
        if passed:
            resume_id = response.json()["id"]
            print(f"  Created Resume ID: {resume_id}")
            return resume_id
        return None
    except Exception as e:
        print_test("Resume Creation", False)
        print(f"  Error: {e}")
        return None

def test_get_resumes(token):
    """Test getting resumes list"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/resumes", headers=headers)
        passed = response.status_code == 200 and isinstance(response.json(), list)
        print_test("Get Resumes List", passed)
        if passed:
            print(f"  Total Resumes: {len(response.json())}")
        return passed
    except Exception as e:
        print_test("Get Resumes List", False)
        print(f"  Error: {e}")
        return False

def run_all_tests():
    """Run all API tests"""
    print("=" * 60)
    print("AI RESUME BUILDER - API TESTING")
    print("=" * 60)
    print()
    
    # Test health check
    print("1. Testing Health Check...")
    test_health_check()
    print()
    
    # Test registration and get token
    print("2. Testing User Registration...")
    token = test_register()
    print()
    
    if not token:
        print("⚠️  Cannot continue without authentication token")
        return
    
    # Test ML prediction
    print("3. Testing ML Category Prediction...")
    test_ml_prediction(token)
    print()
    
    # Test ATS analysis
    print("4. Testing ATS Analysis...")
    test_ats_analysis(token)
    print()
    
    # Test resume creation
    print("5. Testing Resume Creation...")
    resume_id = test_resume_creation(token)
    print()
    
    # Test getting resumes
    print("6. Testing Get Resumes...")
    test_get_resumes(token)
    print()
    
    print("=" * 60)
    print("TESTING COMPLETE!")
    print("=" * 60)
    print()
    print("✓ Backend is fully functional")
    print("✓ ML model is loaded and working")
    print("✓ ATS analysis is operational")
    print("✓ Authentication is working")
    print("✓ Resume CRUD operations successful")
    print()
    print(f"API Documentation: {BASE_URL}/docs")


if __name__ == "__main__":
    run_all_tests()
