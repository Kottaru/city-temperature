const apiKeyWeather = "SUA_CHAVE_OPENWEATHER";
const apiKeyAir = "SUA_CHAVE_IQAIR";

const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("search");
const locateBtn = document.getElementById("locate");
const locationEl = document.getElementById("location");
const weatherEl = document.getElementById("weather");
const airEl = document.getElementById("air");
const tipEl = document.getElementById("tip");
const historyEl = document.getElementById("history");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchDataByCity(city);
});

locateBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    fetchDataByCoords(lat, lon);
  }, () => {
    locationEl.textContent = "Erro ao obter localização.";
  });
});

function fetchDataByCity(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKeyWeather}&lang=pt_br&units=metric`)
    .then(res => res.json())
    .then(data => {
      if (!data.coord) throw new Error("Cidade inválida");
      fetchDataByCoords(data.coord.lat, data.coord.lon, data.name, data.sys.country);
    })
    .catch(() => {
      locationEl.textContent = "Cidade não encontrada ou erro na API.";
      weatherEl.textContent = "";
      airEl.textContent = "";
      tipEl.textContent = "";
    });
}

function fetchDataByCoords(lat, lon, cityName = "", countryCode = "") {
  Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKeyWeather}&lang=pt_br&units=metric`).then(res => res.json()),
    fetch(`https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${apiKeyAir}`).then(res => res.json())
  ])
  .then(([weatherData, airData]) => {
    const name = cityName || weatherData.name;
    const country = countryCode || weatherData.sys.country;
    const temp = weatherData.main.temp;
    const desc = weatherData.weather[0].description;
    const aqi = airData.data.current.pollution.aqius;

    locationEl.textContent = `📍 ${name}, ${country}`;
    weatherEl.textContent = `🌡️ Clima: ${desc}, ${temp}°C`;
    airEl.textContent = `💨 Qualidade do ar (AQI): ${aqi}`;

    let tip = "";
    if (temp < 15) tip += "Está frio, leve um casaco. ";
    else if (temp > 30) tip += "Está quente, beba bastante água. ";
    if (aqi > 100) tip += "Evite exercícios ao ar livre.";
    else tip += "Boa qualidade do ar, aproveite para sair.";

    tipEl.textContent = `💡 Dica: ${tip}`;

    updateHistory(name);
  })
  .catch(() => {
    locationEl.textContent = "Erro ao buscar dados.";
    weatherEl.textContent = "";
    airEl.textContent = "";
    tipEl.textContent = "";
  });
}

function updateHistory(city) {
  let history = JSON.parse(localStorage.getItem("cityHistory")) || [];
  if (!history.includes(city)) {
    history.unshift(city);
    if (history.length > 5) history.pop();
    localStorage.setItem("cityHistory", JSON.stringify(history));
  }
  renderHistory();
}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("cityHistory")) || [];
  if (history.length > 0) {
    historyEl.innerHTML = "🔁 Últimas cidades: " + history.map(c => `<span>${c}</span>`).join(" • ");
  } else {
    historyEl.innerHTML = "";
  }
}

renderHistory();
