from database import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    is_email_verified = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        try:
            self.password_hash = generate_password_hash(password)
            return True
        except Exception as e:
            print("Error setting password in set_password / user_model.py:", e)
            return False

    def check_password(self, password):
        try:
            bool_val = check_password_hash(self.password_hash, password)
            return bool_val
        except Exception as e:
            print("Error checking password in check_password / user_model.py:", e)
            return False

    @classmethod
    def create(cls, first_name, last_name, email, password, is_admin=False):
        try:
            user = cls(first_name=first_name, last_name=last_name,
                       email=email, is_admin=is_admin, is_email_verified=False)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            return user
        except Exception as e:
            print("Error creating user in create / user_model.py:", e)
            return None

    @classmethod
    def get_by_id(cls, user_id):
        try:
            return cls.query.get(user_id)
        except Exception as e:
            print("Error getting user by id in get_by_id / user_model.py:", e)
            return None

    @classmethod
    def get_by_email(cls, email):
        try:
            return cls.query.filter_by(email=email).first()
        except Exception as e:
            print("Error getting user by email in get_by_email / user_model.py:", e)
            return None

    def update(self, updated_data):
        try:
            if "first_name" in updated_data:
                self.first_name = updated_data["first_name"]
            if "last_name" in updated_data:
                self.last_name = updated_data["last_name"]
            if "email" in updated_data:
                self.email = updated_data["email"]
            if "password" in updated_data:
                self.set_password(updated_data["password"])
            if "is_admin" in updated_data:
                self.is_admin = updated_data["is_admin"]
            if "is_email_verified" in updated_data:
                self.is_email_verified = updated_data["is_email_verified"]
            db.session.commit()
            return self
        except Exception as e:
            print("Error updating user in update / user_model.py:", e)
            return None

    def delete(self):
        try:
            db.session.delete(self)
            db.session.commit()
            return True
        except Exception as e:
            print("Error deleting user in delete / user_model.py:", e)
            return False

    def to_dict(self):
        try:
            return {
                "id": self.id,
                "first_name": self.first_name,
                "last_name": self.last_name,
                "email": self.email,
                "is_admin": self.is_admin,
                "is_email_verified": self.is_email_verified
            }
        except Exception as e:
            print("Error converting user to dict in to_dict / user_model.py:", e)
            return None
