"""
Script to create an admin user in the database.
Run this from the backend directory with: 
python scripts/create_admin.py email password first_name last_name
"""

import sys
import os

# Add the parent directory to the path so we can import from the application
sys.path.insert(0, os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..')))

# Import modules after adjusting the path
from app import create_app
from database import db
from models.user_model import User

def create_admin_user(email, password, first_name, last_name):
    """Create a new user with admin privileges or promote existing user"""
    app = create_app()

    with app.app_context():
        existing_user = User.get_by_email(email)
        
        if existing_user:
            print(f"User with email {email} already exists. Updating to admin...")
            updated_user = existing_user.update({
                "is_admin": True
            })
            if updated_user:
                print(f"User updated to admin: {existing_user.first_name} {existing_user.last_name} ({email})")
                return True
            else:
                print("Failed to update existing user to admin.")
                return False

        # Create new user with admin privileges
        user = User.create(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password,
            is_admin=True
        )

        if user:
            print(f"Admin user created: {first_name} {last_name} ({email})")
            return True
        else:
            print("Failed to create admin user.")
            return False

if __name__ == '__main__':
    if len(sys.argv) != 5:
        print("Usage: python scripts/create_admin.py email password first_name last_name")
        sys.exit(1)

    email = sys.argv[1]
    password = sys.argv[2]
    first_name = sys.argv[3]
    last_name = sys.argv[4]

    if create_admin_user(email, password, first_name, last_name):
        print("Success! Admin user created or updated.")
    else:
        print("Failed to create or update admin user.")
        sys.exit(1)
