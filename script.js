
let memory = 0;

function insert(value) {
    document.getElementById('result').value += value;
}

function clearScreen() {
    document.getElementById('result').value = '';
}

function backspace() {
    let value = document.getElementById('result').value;
    document.getElementById('result').value = value.substr(0, value.length - 1);
}

function calculate() {
    let expression = document.getElementById('result').value;
    try {
        expression = expression.replace(/sin/g, 'Math.sin');
        expression = expression.replace(/cos/g, 'Math.cos');
        expression = expression.replace(/tan/g, 'Math.tan');
        expression = expression.replace(/log/g, 'Math.log10');
        expression = expression.replace(/ln/g, 'Math.log');
        expression = expression.replace(/sqrt/g, 'Math.sqrt');
        expression = expression.replace(/\^/g, '**');
        expression = expression.replace(/π/g, 'Math.PI');
        expression = expression.replace(/e/g, 'Math.E');
        let result = eval(expression);
        document.getElementById('result').value = result;
    } catch (error) {
        document.getElementById('result').value = 'Error';
    }
}

function memoryClear() {
    memory = 0;
}

function memoryRecall() {
    document.getElementById('result').value += memory;
}

function memoryAdd() {
    let value = parseFloat(document.getElementById('result').value);
    if (!isNaN(value)) {
        memory += value;
    }
}

function memorySubtract() {
    let value = parseFloat(document.getElementById('result').value);
    if (!isNaN(value)) {
        memory -= value;
    }
}

let currentUnit = 'C';
const unitToggle = document.querySelector('.unit-toggle');
let lastLat, lastLon;
unitToggle.addEventListener('click', () => {
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    if(lastLat && lastLon) {
        weather(lastLat, lastLon);
    }
});
const searchWeather = async () => {
    const city = document.getElementById('city').value;
    if (city) {
        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const lat = data.results[0].latitude;
                const lon = data.results[0].longitude;
                lastLat = lat;
                lastLon = lon;
                weather(lat, lon);
            } else {
                alert('City not found');
            }
        } catch (error) {
            alert('Error searching for city');
        }
    }
};

// Weather
const weather = (lat, lon) => {
    lastLat = lat;
    lastLon = lon;
    const weatherIcon = document.querySelector('.weather-icon');
    const temperature = document.querySelector('.temperature');
    const condition = document.querySelector('.condition');
    const forecast = document.querySelector('.weather-forecast');
    forecast.innerHTML = '';

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Current weather
            let temp = data.current_weather.temperature;
            if (currentUnit === 'F') {
                temp = (temp * 9/5) + 32;
            }
            temperature.textContent = `${Math.round(temp)}°${currentUnit}`;
            condition.textContent = getWeatherCondition(data.current_weather.weathercode);
            weatherIcon.innerHTML = getWeatherIcon(data.current_weather.weathercode);

            // 5-day forecast
            for (let i = 0; i < 5; i++) {
                const forecastItem = document.createElement('div');
                forecastItem.classList.add('forecast-item');

                const day = new Date(data.daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' });
                const icon = getWeatherIcon(data.daily.weathercode[i]);
                let maxTemp = data.daily.temperature_2m_max[i];
                let minTemp = data.daily.temperature_2m_min[i];

                if (currentUnit === 'F') {
                    maxTemp = (maxTemp * 9/5) + 32;
                    minTemp = (minTemp * 9/5) + 32;
                }

                forecastItem.innerHTML = `
                    <div class="forecast-day">${day}</div>
                    <div class="forecast-icon">${icon}</div>
                    <div class="forecast-temperature">${Math.round(maxTemp)}° / ${Math.round(minTemp)}°</div>
                `;
                forecast.appendChild(forecastItem);
            }
        })
        .catch(error => {
            temperature.textContent = '';
            condition.textContent = 'Error fetching weather';
            weatherIcon.innerHTML = '❓';
        });
};

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            weather(lat, lon);
        },
        error => {
            // Geolocation failed, user can search manually
        }
    );
}

const getWeatherCondition = (code) => {
    switch (code) {
        case 0: return 'Clear sky';
        case 1:
        case 2:
        case 3: return 'Partly cloudy';
        case 45:
        case 48: return 'Fog';
        case 51:
        case 53:
        case 55: return 'Drizzle';
        case 61:
        case 63:
        case 65: return 'Rain';
        case 66:
        case 67: return 'Freezing rain';
        case 71:
        case 73:
        case 75: return 'Snowfall';
        case 77: return 'Snow grains';
        case 80:
        case 81:
        case 82: return 'Rain showers';
        case 85:
        case 86: return 'Snow showers';
        case 95: return 'Thunderstorm';
        case 96:
        case 99: return 'Thunderstorm with hail';
        default: return 'Unknown';
    }
};

const getWeatherIcon = (code) => {
    switch (code) {
        case 0: return '☀️';
        case 1:
        case 2:
        case 3: return '☁️';
        case 45:
        case 48: return '🌫️';
        case 51:
        case 53:
        case 55: return '🌦️';
        case 61:
        case 63:
        case 65: return '🌧️';
        case 66:
        case 67: return '🌨️';
        case 71:
        case 73:
        case 75: return '❄️';
        case 77: return '🌨️';
        case 80:
        case 81:
        case 82: return '🌦️';
        case 85:
        case 86: return '🌨️';
        case 95: return '⛈️';
        case 96:
        case 99: return '⛈️';
        default: return '❓';
    }
};
