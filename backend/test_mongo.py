import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv('MONGO_URI')
db_name = os.getenv('MONGO_DB_NAME')

print(f"Testing connection to: {uri}")
print(f"Certifi path: {certifi.where()}")

try:
    # Try with default options
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    print("Pinging...")
    client.admin.command('ping')
    print("SUCCESS: Connected to MongoDB Atlas!")
except Exception as e:
    print(f"FAILED with certifi: {e}")
    
    try:
        print("\nTrying with tlsAllowInvalidCertificates=True...")
        client = MongoClient(uri, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("SUCCESS: Connected with invalid certificates allowed!")
    except Exception as e2:
        print(f"FAILED even with invalid certs: {e2}")

    try:
        print("\nTrying without srv (direct shard if possible)...")
        # Just a check to see if it's a DNS thing, but we have srv.
        pass
    except:
        pass
