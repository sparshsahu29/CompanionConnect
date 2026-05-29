from werkzeug.security import generate_password_hash, check_password_hash
from database import db, User


def authenticate_user(email, password):
    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        return user
    return None


def create_user(fullname, email, password):
    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        return None

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    new_user = User(
        fullname=fullname,
        email=email,
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return new_user