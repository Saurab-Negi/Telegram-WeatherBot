require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const app = express();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Handle Telegram bot commands
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome! Send me a city name to get weather updates.");
});

// Function to fetch weather data for a given city
async function getWeather(city) {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}`);
        const data = response.data;
        const weatherDescription = data.weather[0].description;
        const temp = (data.main.temp - 273.15).toFixed(2); // Convert from Kelvin to Celsius
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        
        return `Current weather in ${city}: ${weatherDescription}, Temperature: ${temp}°C, Humidity: ${humidity}%, Wind Speed: ${windSpeed} m/s`;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return `Could not fetch weather data for ${city}. Please check the city name and try again.`;
    }
}

// Handle messages containing city names
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const city = msg.text.trim();

    if (!city.startsWith('/')) { // To avoid handling bot commands as city names
        const weatherUpdate = await getWeather(city);
        bot.sendMessage(chatId, weatherUpdate);
    }
});

// Express server for any additional routes or health checks
app.get('/', (req, res) => {
    res.send('Telegram Weather Bot is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
