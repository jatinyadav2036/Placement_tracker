from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings
import logging
import certifi

logger = logging.getLogger(__name__)

client = None
database = None


async def connect_to_mongo():
    global client, database

    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            tls=True,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=30000,
        )

        # Test connection
        await client.admin.command("ping")

        database = client[settings.DATABASE_NAME]

        logger.info(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")

    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        raise e


async def close_mongo_connection():
    global client

    if client:
        client.close()
        logger.info("MongoDB connection closed")


def get_database():
    return database


def get_collection(name: str):
    return database[name]