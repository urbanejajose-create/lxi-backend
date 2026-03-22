"""
Unit tests for LXI E-commerce API
Run with: pytest test_server.py -v
"""

import pytest
from fastapi.testclient import TestClient
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import asyncio
from datetime import datetime, timezone
import uuid

# Note: These tests require a test database configured in .env
# MONGO_URL_TEST and DB_NAME_TEST

load_dotenv()


def _has_real_db_config():
    mongo_url = os.getenv("MONGO_URL_TEST") or os.getenv("MONGO_URL") or ""
    db_name = os.getenv("DB_NAME_TEST") or os.getenv("DB_NAME") or ""
    blocked_tokens = (
        "ROTATE_AND_SET",
        "REEMPLAZA",
        "YOUR_",
        "USERNAME:PASSWORD",
        "mongodb+srv://username:password",
    )
    has_placeholder = any(token in mongo_url.upper() for token in blocked_tokens)
    return bool(mongo_url and db_name and not has_placeholder)


DB_CONFIGURED = _has_real_db_config()
requires_db = pytest.mark.skipif(
    not DB_CONFIGURED,
    reason="Requires real MongoDB test configuration in .env",
)

# Mock client for testing
@pytest.fixture
def client():
    """Create test client"""
    from server_v2 import app
    return TestClient(app)

class TestHealth:
    """Health check tests"""
    
    def test_root(self, client):
        response = client.get("/api/")
        assert response.status_code == 200
        assert "message" in response.json()
    
    def test_health_check(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

@requires_db
class TestAuth:
    """Authentication tests"""
    
    def test_register_valid_user(self, client):
        """Test user registration with valid data"""
        response = client.post("/api/auth/register", json={
            "email": f"test_{uuid.uuid4()}@example.com",
            "password": "SecurePass123",
            "first_name": "Test",
            "last_name": "User"
        })
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert "user" in response.json()
    
    def test_register_weak_password(self, client):
        """Test registration with weak password"""
        response = client.post("/api/auth/register", json={
            "email": "test@example.com",
            "password": "weak",
            "first_name": "Test",
            "last_name": "User"
        })
        assert response.status_code == 422  # Validation error
    
    def test_register_invalid_email(self, client):
        """Test registration with invalid email"""
        response = client.post("/api/auth/register", json={
            "email": "invalid-email",
            "password": "SecurePass123",
            "first_name": "Test",
            "last_name": "User"
        })
        assert response.status_code == 422
    
    def test_login_valid_credentials(self, client):
        """Test login with valid credentials"""
        email = f"login_test_{uuid.uuid4()}@example.com"
        password = "SecurePass123"
        
        # Register user first
        client.post("/api/auth/register", json={
            "email": email,
            "password": password,
            "first_name": "Test",
            "last_name": "User"
        })
        
        # Login
        response = client.post("/api/auth/login", json={
            "email": email,
            "password": password
        })
        assert response.status_code == 200
        assert "access_token" in response.json()
    
    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        response = client.post("/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "WrongPassword123"
        })
        assert response.status_code == 401

@requires_db
class TestProducts:
    """Product tests"""
    
    def test_get_products(self, client):
        """Test getting all products"""
        response = client.get("/api/products")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert "count" in data
    
    def test_get_products_with_search(self, client):
        """Test product search"""
        response = client.get("/api/products?search=tee")
        assert response.status_code == 200
    
    def test_get_products_with_category_filter(self, client):
        """Test product category filtering"""
        response = client.get("/api/products?category=TOPS")
        assert response.status_code == 200
    
    def test_get_products_pagination(self, client):
        """Test product pagination"""
        response = client.get("/api/products?skip=0&limit=10")
        assert response.status_code == 200
        data = response.json()
        assert data["skip"] == 0
        assert data["limit"] == 10

@requires_db
class TestNewsletter:
    """Newsletter tests"""
    
    def test_subscribe_newsletter_valid_email(self, client):
        """Test newsletter subscription"""
        email = f"newsletter_{uuid.uuid4()}@example.com"
        response = client.post("/api/newsletter/subscribe", json={
            "email": email
        })
        assert response.status_code == 200
        assert "Successfully subscribed" in response.json()["message"]
    
    def test_subscribe_newsletter_duplicate(self, client):
        """Test duplicate newsletter subscription"""
        email = f"duplicate_{uuid.uuid4()}@example.com"
        
        # Subscribe first time
        client.post("/api/newsletter/subscribe", json={"email": email})
        
        # Try subscribe again
        response = client.post("/api/newsletter/subscribe", json={"email": email})
        assert response.status_code == 400
        assert "already subscribed" in response.json()["detail"]

class TestWishlist:
    """Wishlist tests"""
    
    def test_get_wishlist_unauthorized(self, client):
        """Test getting wishlist without auth"""
        response = client.get("/api/wishlist")
        assert response.status_code == 401
    
    def test_add_to_wishlist_unauthorized(self, client):
        """Test adding to wishlist without auth"""
        response = client.post("/api/wishlist/product-123")
        assert response.status_code == 401

class TestOrders:
    """Order tests"""
    
    def test_get_orders_unauthorized(self, client):
        """Test getting orders without auth"""
        response = client.get("/api/orders")
        assert response.status_code == 401

# Integration tests
@requires_db
class TestIntegration:
    """Integration tests"""
    
    def test_user_registration_and_profile(self, client):
        """Test complete registration and profile flow"""
        email = f"integration_{uuid.uuid4()}@example.com"
        
        # Register
        register_response = client.post("/api/auth/register", json={
            "email": email,
            "password": "SecurePass123",
            "first_name": "Integration",
            "last_name": "Test"
        })
        assert register_response.status_code == 200
        token = register_response.json()["access_token"]
        
        # Get profile
        headers = {"Authorization": f"Bearer {token}"}
        profile_response = client.get("/api/auth/me", headers=headers)
        assert profile_response.status_code == 200
        assert profile_response.json()["email"] == email

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
