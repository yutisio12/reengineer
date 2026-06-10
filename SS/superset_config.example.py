import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Ganti SECRET_KEY dengan nilai tetap untuk production
SECRET_KEY = os.urandom(32).hex()
SQLALCHEMY_DATABASE_URI = "postgresql://postgres:postgres@localhost:5432/engineering_tracker"
SUPERSET_HOME = BASE_DIR
UPLOAD_FOLDER = os.path.join(BASE_DIR, "data")
ROW_LIMIT = 5000
SQLALCHEMY_TRACK_MODIFICATIONS = True
