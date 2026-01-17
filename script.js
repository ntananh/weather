const API_KEY = 'API_KEY';
const CITY = 'Tampere';
const REFRESH_INTERVAL = 600000;

const elements = {
    cityName: document.getElementById('city-name'),
    currentTime: document.getElementById('current-time'),
    currentTemp: document.getElementById('current-temp'),
    description: document.getElementById('description'),
    weatherIcon: document.getElementById('weather-icon'),
    windSpeed: document.getElementById('wind-speed'),
    humidity: document.getElementById('humidity'),
    feelsLike: document.getElementById('feels-like'),
    hourlyContainer: document.getElementById('hourly-container'),
    lastUpdate: document.getElementById('last-update')
};

function updateTime() {
    const now = new Date();
    elements.currentTime.textContent = now.toLocaleTimeString('fi-FI', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTemp(temp) {
    return Math.round(temp);
}

async function fetchWeatherData() {
    try {
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${CITY}&hours=12&aqi=no`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        updateCurrentWeather(data);
        updateHourlyForecast(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        elements.description.textContent = 'Unable to load weather data';
    }
}

function updateCurrentWeather(data) {
    const current = data.current;
    const location = data.location;

    elements.cityName.textContent = location.name;
    elements.currentTemp.textContent = formatTemp(current.temp_c);
    elements.description.textContent = current.condition.text;
    elements.weatherIcon.src = `https:${current.condition.icon}`;
    elements.weatherIcon.alt = current.condition.text;
    elements.windSpeed.textContent = `${current.wind_kph.toFixed(1)} km/h`;
    elements.humidity.textContent = `${current.humidity}%`;
    elements.feelsLike.textContent = `${formatTemp(current.feelslike_c)}°C`;

    updateLastUpdate();
}

function updateHourlyForecast(data) {
    elements.hourlyContainer.innerHTML = '';

    const hourlyData = data.forecast.forecastday[0].hour;
    const currentHour = new Date().getHours();

    let hoursAdded = 0;
    for (let i = 0; i < hourlyData.length && hoursAdded < 6; i++) {
        const hour = new Date(hourlyData[i].time).getHours();

        if (hour <= currentHour && hoursAdded === 0) continue;

        const time = new Date(hourlyData[i].time);
        const hourString = time.toLocaleTimeString('fi-FI', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        hourlyItem.innerHTML = `
            <div class="hourly-time">${hourString}</div>
            <img src="https:${hourlyData[i].condition.icon}" 
                 alt="${hourlyData[i].condition.text}" 
                 class="hourly-icon">
            <div class="hourly-temp">${formatTemp(hourlyData[i].temp_c)}°C</div>
        `;

        elements.hourlyContainer.appendChild(hourlyItem);
        hoursAdded++;
    }
}

function updateLastUpdate() {
    const now = new Date();
    const updateString = now.toLocaleString('fi-FI', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    elements.lastUpdate.textContent = `Last updated: ${updateString}`;
}

async function fetchAllWeatherData() {
    await fetchWeatherData();
}

function init() {
    updateTime();
    setInterval(updateTime, 1000);

    fetchAllWeatherData();
    setInterval(fetchAllWeatherData, REFRESH_INTERVAL);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
