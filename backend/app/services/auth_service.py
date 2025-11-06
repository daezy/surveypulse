from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from bson import ObjectId
from app.core.config import settings
from app.core.database import db
from app.models.user import UserInDB, UserCreate, User

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Token settings
REFRESH_TOKEN_EXPIRE_DAYS = 7


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    # Bcrypt has a 72 byte limit, truncate if necessary
    if len(plain_password.encode("utf-8")) > 72:
        plain_password = plain_password.encode("utf-8")[:72].decode(
            "utf-8", errors="ignore"
        )
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash

    Note: Bcrypt has a maximum password length of 72 bytes.
    We truncate passwords to 72 bytes to avoid errors.
    """
    # Bcrypt has a 72 byte limit, truncate if necessary
    if len(password.encode("utf-8")) > 72:
        password = password.encode("utf-8")[:72].decode("utf-8", errors="ignore")
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None


async def get_user_by_email(email: str) -> Optional[UserInDB]:
    """Get user by email"""
    user_data = await db.db.users.find_one({"email": email})
    if user_data:
        user_data["id"] = str(user_data["_id"])
        return UserInDB(**user_data)
    return None


async def get_user_by_id(user_id: str) -> Optional[User]:
    """Get user by ID"""
    try:
        user_data = await db.db.users.find_one({"_id": ObjectId(user_id)})
        if user_data:
            user_data["id"] = str(user_data["_id"])
            return User(**user_data)
        return None
    except:
        return None


async def authenticate_user(email: str, password: str) -> Optional[UserInDB]:
    """Authenticate user with email and password

    Security: Uses constant-time comparison to prevent timing attacks
    """
    user = await get_user_by_email(email)
    if not user:
        # Run password verification even if user doesn't exist to prevent timing attacks
        pwd_context.verify(password, pwd_context.hash("dummy"))
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def create_user(user_create: UserCreate) -> User:
    """Create a new user"""
    # Check if user already exists
    existing_user = await get_user_by_email(user_create.email)
    if existing_user:
        raise ValueError("User with this email already exists")

    # Create user document
    now = datetime.utcnow()
    user_dict = {
        "email": user_create.email,
        "full_name": user_create.full_name,
        "hashed_password": get_password_hash(user_create.password),
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }

    # Insert into database
    result = await db.db.users.insert_one(user_dict)

    # Return created user
    user_dict["id"] = str(result.inserted_id)
    return User(**user_dict)


async def update_user_password(user_id: str, new_password: str) -> bool:
    """Update user password"""
    hashed_password = get_password_hash(new_password)
    result = await db.db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"hashed_password": hashed_password, "updated_at": datetime.utcnow()}},
    )
    return result.modified_count > 0
