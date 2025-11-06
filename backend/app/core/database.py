from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class Database:
    client: AsyncIOMotorClient = None
    db = None


db = Database()


async def connect_to_mongo():
    """Connect to MongoDB"""
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}")
        db.client = AsyncIOMotorClient(settings.MONGODB_URI)
        db.db = db.client[settings.DATABASE_NAME]

        # Test connection
        await db.client.admin.command("ping")
        logger.info("Successfully connected to MongoDB")

        # Create indexes for better performance and data integrity
        await create_indexes()

    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


async def create_indexes():
    """Create database indexes"""
    try:
        # Unique index on email for users collection
        await db.db.users.create_index("email", unique=True)
        logger.info("Created unique index on users.email")

        # Index on user_id for surveys (for filtering user's surveys)
        await db.db.surveys.create_index("user_id")
        logger.info("Created index on surveys.user_id")

        # Index on survey_id for analyses
        await db.db.analyses.create_index("survey_id")
        logger.info("Created index on analyses.survey_id")

    except Exception as e:
        logger.warning(f"Error creating indexes: {e}")


async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        logger.info("Closing MongoDB connection")
        db.client.close()


def get_database():
    """Get database instance"""
    return db.db
