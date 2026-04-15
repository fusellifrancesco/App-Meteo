// index.js

const readline = require("readline");

// Converte il weather_code di Open-Meteo in una descrizione leggibile
function getWeatherDescription(weatherCode) {
  const weatherMap = {
    0: "Cielo sereno",
    1: "Prevalentemente sereno",
    2: "Parzialmente nuvoloso",
    3: "Coperto",
    45: "Nebbia",
    48: "Nebbia con brina",
    51: "Pioviggine leggera",
    53: "Pioviggine moderata",
    55: "Pioviggine intensa",
    56: "Pioviggine gelata leggera",
    57: "Pioviggine gelata intensa",
    61: "Pioggia debole",
    63: "Pioggia moderata",
    65: "Pioggia forte",
    66: "Pioggia gelata leggera",
    67: "Pioggia gelata forte",
    71: "Neve debole",
    73: "Neve moderata",
    75: "Neve intensa",
    77: "Granelli di neve",
    80: "Rovesci di pioggia leggeri",
    81: "Rovesci di pioggia moderati",
    82: "Rovesci di pioggia violenti",
    85: "Rovesci di neve leggeri",
    86: "Rovesci di neve forti",
    95: "Temporale",
    96: "Temporale con grandine leggera",
    99: "Temporale con grandine forte"
  };

  return weatherMap[weatherCode] || "Descrizione non disponibile";
}

/**
 * Recupera il meteo corrente di una città usando le API di Open-Meteo.
 *
 * @async
 * @param {string} cityName
 * @returns {Promise<{
 *   city: string,
 *   temperatureC: number | string,
 *   weatherDescription: string,
 *   warnings: string[],
 *   partialError: boolean
 * } | {
 *   error: true,
 *   message: string,
 *   city?: string
 * }>}
 */
async function getCurrentWeatherByCity(cityName) {
  try {
    if (!cityName || typeof cityName !== "string" || cityName.trim() === "") {
      throw new Error("Inserisci un nome di città valido.");
    }

    const cleanCityName = cityName.trim();

    const geocodingUrl =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanCityName)}&count=1&language=it&format=json`;

    const geoResponse = await fetch(geocodingUrl);

    if (!geoResponse.ok) {
      throw new Error(`Errore Geocoding API: ${geoResponse.status} ${geoResponse.statusText}`);
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`Nessuna città trovata per "${cleanCityName}".`);
    }

    const location = geoData.results[0];
    const { name, latitude, longitude } = location;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return {
        city: name || cleanCityName,
        temperatureC: "Non disponibile",
        weatherDescription: "Non disponibile",
        warnings: ["Coordinate geografiche non valide."],
        partialError: true
      };
    }

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`;

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error(`Errore Weather API: ${weatherResponse.status} ${weatherResponse.statusText}`);
    }

    const weatherData = await weatherResponse.json();

    if (!weatherData.current) {
      throw new Error("I dati meteo correnti non sono disponibili.");
    }

    const warnings = [];
    let partialError = false;

    let temperature = weatherData.current.temperature_2m;
    if (typeof temperature !== "number") {
      temperature = "Temperatura non disponibile";
      warnings.push("Dato temperatura mancante dalla Weather API.");
      partialError = true;
    }

    let weatherCode = weatherData.current.weather_code;
    let weatherDescription;

    if (typeof weatherCode !== "number") {
      weatherDescription = "Condizioni meteo non disponibili";
      warnings.push("Weather code mancante dalla Weather API.");
      partialError = true;
    } else {
      weatherDescription = getWeatherDescription(weatherCode);
    }

    return {
      city: name,
      temperatureC: temperature,
      weatherDescription,
      warnings,
      partialError
    };
  } catch (error) {
    return {
      error: true,
      city: cityName?.trim() || "Sconosciuta",
      message: error.message || "Errore imprevisto"
    };
  }
}

// Recupera il meteo di più città in parallelo
async function getCurrentWeatherByCities(cityNames) {
  const promises = cityNames.map((city) => getCurrentWeatherByCity(city));
  return Promise.all(promises);
}

// Interfaccia terminale
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Trasforma rl.question in una Promise
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Parsing input: "Milano, Roma, Napoli"
function parseCitiesInput(input) {
  return input
    .split(",")
    .map((city) => city.trim())
    .filter((city) => city.length > 0);
}

// Stampa singolo risultato
function printWeatherResult(result) {
  if (result.error) {
    console.log("\n❌ Errore:");
    console.log(result.message);
    return;
  }

  console.log("\n📍 Risultato meteo");
  console.log(`Città: ${result.city}`);
  console.log(`Temperatura: ${result.temperatureC}°C`);
  console.log(`Condizioni: ${result.weatherDescription}`);

  if (result.partialError) {
    console.log("⚠️ Alcuni dati non erano completi.");
  }

  if (Array.isArray(result.warnings) && result.warnings.length > 0) {
    console.log("Warning:");
    result.warnings.forEach((warning) => {
      console.log(`- ${warning}`);
    });
  }
}

// Stampa risultati affiancati
function printWeatherResultsSideBySide(results) {
  const tableData = results.map((result) => {
    if (result.error) {
      return {
        Città: result.city || "Sconosciuta",
        Temperatura: "Errore",
        Condizioni: result.message,
        Stato: "❌"
      };
    }

    return {
      Città: result.city,
      Temperatura:
        typeof result.temperatureC === "number"
          ? `${result.temperatureC}°C`
          : result.temperatureC,
      Condizioni: result.weatherDescription,
      Stato: result.partialError ? "⚠️ Parziale" : "✅ OK"
    };
  });

  console.log("\n📊 Meteo attuale per le città inserite:\n");
  console.table(tableData);

  // Warning dettagliati sotto la tabella
  const resultsWithWarnings = results.filter(
    (result) => !result.error && Array.isArray(result.warnings) && result.warnings.length > 0
  );

  if (resultsWithWarnings.length > 0) {
    console.log("\n⚠️ Dettagli warning:");
    resultsWithWarnings.forEach((result) => {
      console.log(`\n${result.city}:`);
      result.warnings.forEach((warning) => {
        console.log(`- ${warning}`);
      });
    });
  }
}

// Loop del programma
async function startCLI() {
  console.log("=== App Meteo ===");
  console.log("Scrivi una o più città separate da virgola.");
  console.log("Esempio: Milano, Roma, Napoli");
  console.log("Scrivi 'exit' per uscire.\n");

  while (true) {
    const input = await askQuestion("Inserisci una o più città: ");

    if (input.trim().toLowerCase() === "exit") {
      console.log("\n👋 Programma terminato.");
      rl.close();
      break;
    }

    const cities = parseCitiesInput(input);

    if (cities.length === 0) {
      console.log("\n❌ Inserisci almeno una città valida.\n");
      continue;
    }

    if (cities.length === 1) {
      const result = await getCurrentWeatherByCity(cities[0]);
      printWeatherResult(result);
      console.log("");
      continue;
    }

    const results = await getCurrentWeatherByCities(cities);
    printWeatherResultsSideBySide(results);
    console.log("");
  }
}

// Avvio
if (require.main === module) {
  startCLI();
}

module.exports = {
  getWeatherDescription,
  getCurrentWeatherByCity,
  getCurrentWeatherByCities,
  parseCitiesInput,
  printWeatherResult,
  printWeatherResultsSideBySide,
  askQuestion,
  startCLI
};