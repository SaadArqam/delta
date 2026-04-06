import requests

def get_weather(lat, lon):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
    
    res = requests.get(url).json()
    
    weather = res.get("current_weather", {})

    return {
        "temperature": weather.get("temperature"),
        "wind_speed": weather.get("windspeed"),
    }