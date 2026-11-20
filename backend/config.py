import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Config:
    """Central Application Configuration loaded from Environment Variables."""
    SECRET_KEY = os.getenv("SECRET_KEY", "lasa_guard_secret_key_2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET", "lasa_super_secret_jwt_key_2026")
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours

    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/lasa_db")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP", "localhost:9092")

    BERT_MODEL = os.getenv("BERT_MODEL", "emilyalsentzer/Bio_ClinicalBERT")
    BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    MODEL_DIR = os.path.join(BASE_DIR, "models_saved")

    RISK_THRESHOLD = float(os.getenv("RISK_THRESHOLD", "0.7"))
    CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))

    DEBUG = os.getenv("FLASK_ENV") == "development"
