const apiKeyWeather = "SUA_CHAVE_OPENWEATHER"; // coloque sua chave da API OpenWeather
const apiKeyAir = "SUA_CHAVE_IQAIR"; // coloque sua chave da API IQAir

const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("search");
const locationEl = document.getElementById("location");
const weatherEl = document.getElementById("weather");
const airEl = document.getElementById("air");
const tipEl = document.getElementById("tip");

searchBtn.addEventListener("click", async () => {
  const city = cityInput.value;
  if (!city) return;

  try {
    // Clima
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKeyWeather}&lang=pt_br&units=metric`
    );
    const weatherData = await weatherRes.json();

    // Qualidade do ar (usando coordenadas do clima)
    const { lon, lat } = weatherData.coord;
    const airRes = await fetch(
      `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${apiKeyAir}`
    );
    const airData = await airRes.json();

    locationEl.textContent = `📍 ${weatherData.name}, ${weatherData.sys.country}`;
    weatherEl.textContent = `🌡️ Clima: ${weatherData.weather[0].description}, ${weatherData.main.temp}°C`;
    airEl.textContent = `💨 Qualidade do ar (AQI): ${airData.data.current.pollution.aqius}`;

    // Dicas rápidas
    const temp = weatherData.main.temp;
    const aqi = airData.data.current.pollution.aqius;
    let tip = "";

    if (temp < 15) tip += "Está frio, leve um casaco. ";
    else if (temp > 30) tip += "Está quente, beba bastante água. ";

    if (aqi > 100) tip += "Evite exercícios ao ar livre hoje.";
    else tip += "Boa qualidade do ar, aproveite para sair.";

    tipEl.textContent = `💡 Dica: ${tip}`;
  } catch (err) {
    locationEl.textContent = "Cidade não encontrada ou erro na API.";
    weatherEl.textContent = "";
    airEl.textContent = "";
    tipEl.textContent = "";
  }
});
