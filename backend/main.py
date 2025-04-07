from app import app
from maps import reverse_geocode_address

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)