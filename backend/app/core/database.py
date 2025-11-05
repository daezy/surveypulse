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

    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        logger.info("Closing MongoDB connection")
        db.client.close()


def get_database():
    """Get database instance"""
    return db.db
