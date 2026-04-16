/**
 * Crop Yield Prediction Portal — Server
 * Express backend serving REST API + static frontend
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { geocodeCity, fetchCurrentWeather, fetchHistoricalWeather, fetchSeasonalAverages } = require('./services/weatherService');
const { predictYield } = require('./services/predictionEngine');
const { crops, soilTypes, seasons } = require('./data/crops');
const { cropPrices } = require('./data/prices');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ──────────────────────────────────────────────

/**
 * GET /api/crops
 * Returns list of all supported crops with metadata
 */
app.get('/api/crops', (req, res) => {
  res.json({
    success: true,
    data: {
      crops: crops.map(c => ({
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        baseYield: c.baseYield,
        optimalTempMin: c.optimalTempMin,
        optimalTempMax: c.optimalTempMax,
        waterNeedMin: c.waterNeedMin,
        waterNeedMax: c.waterNeedMax,
        preferredSeasons: c.preferredSeasons,
        compatibleSoils: c.compatibleSoils,
        growthDuration: c.growthDuration,
        description: c.description,
        cropCoefficient: c.cropCoefficient,
        irrigationMethod: c.irrigationMethod,
        diseases: c.diseases
      })),
      soilTypes,
      seasons
    }
  });
});

/**
 * GET /api/geocode?city=CityName
 * Geocodes a city name to lat/lon
 */
app.get('/api/geocode', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ success: false, error: 'City name is required.' });
    }

    const results = await geocodeCity(city);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/weather?lat=XX&lon=YY
 * Fetches current weather + 7-day forecast
 */
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, error: 'Latitude and longitude are required.' });
    }

    const weather = await fetchCurrentWeather(parseFloat(lat), parseFloat(lon));
    res.json({ success: true, data: weather });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/weather/historical?lat=XX&lon=YY&start=YYYY-MM-DD&end=YYYY-MM-DD
 * Fetches historical weather data
 */
app.get('/api/weather/historical', async (req, res) => {
  try {
    const { lat, lon, start, end } = req.query;
    if (!lat || !lon || !start || !end) {
      return res.status(400).json({
        success: false,
        error: 'Latitude, longitude, start date, and end date are required.'
      });
    }

    const historical = await fetchHistoricalWeather(
      parseFloat(lat), parseFloat(lon), start, end
    );
    res.json({ success: true, data: historical });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/predict
 * Runs the yield prediction algorithm
 * Body: { cropId, lat, lon, season, soilType, area }
 */
app.post('/api/predict', async (req, res) => {
  try {
    const { cropId, lat, lon, season, soilType, area } = req.body;

    // Validation
    if (!cropId || !lat || !lon || !season || !soilType || !area) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: cropId, lat, lon, season, soilType, area.'
      });
    }

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    // Fetch current weather and historical seasonal averages in parallel
    const [weather, seasonalData] = await Promise.all([
      fetchCurrentWeather(parsedLat, parsedLon),
      fetchSeasonalAverages(parsedLat, parsedLon, season, 10).catch(err => {
        console.warn('Historical data fetch failed, falling back to current weather:', err.message);
        return null;
      })
    ]);

    // Build weather data for the prediction engine
    // Prefer historical seasonal averages; fall back to current weather if unavailable
    const predictionWeather = {
      // Historical seasonal avg temp, fallback to current 7-day avg
      avgTemperature: seasonalData?.avgTemperature ?? weather.averages.avgTemperature,
      // Historical seasonal avg humidity, fallback to current 7-day avg
      avgHumidity: seasonalData?.avgHumidity ?? weather.averages.avgHumidity,
      // Historical seasonal total precipitation (real season total, not extrapolated!)
      totalSeasonalPrecipitation: seasonalData?.avgSeasonalPrecipitation ?? null,
      // Keep 7-day precipitation for reference/fallback
      totalPrecipitation7d: weather.averages.totalPrecipitation7d,
      // Data quality info
      yearsOfData: seasonalData?.yearsOfData ?? 0,
      dataSource: seasonalData ? 'historical' : 'forecast'
    };

    // Run prediction
    const result = predictYield({
      cropId,
      season,
      soilType,
      area: parseFloat(area),
      weatherData: predictionWeather,
      lat: parsedLat
    });

    res.json({
      success: true,
      data: {
        ...result,
        weather: {
          current: weather.current,
          daily: weather.daily
        },
        historicalData: seasonalData ? {
          yearsAnalyzed: seasonalData.yearsOfData,
          yearlyBreakdown: seasonalData.yearlyBreakdown
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/compare
 * Compares yield predictions for multiple crops at the same location
 * Body: { cropIds: [...], lat, lon, season, soilType, area }
 */
app.post('/api/compare', async (req, res) => {
  try {
    const { cropIds, lat, lon, season, soilType, area } = req.body;

    if (!cropIds || !Array.isArray(cropIds) || cropIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 cropIds are required for comparison.'
      });
    }

    if (!lat || !lon || !season || !soilType || !area) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: cropIds, lat, lon, season, soilType, area.'
      });
    }

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    // Fetch weather once (shared for all crops)
    const [weather, seasonalData] = await Promise.all([
      fetchCurrentWeather(parsedLat, parsedLon),
      fetchSeasonalAverages(parsedLat, parsedLon, season, 10).catch(() => null)
    ]);

    const predictionWeather = {
      avgTemperature: seasonalData?.avgTemperature ?? weather.averages.avgTemperature,
      avgHumidity: seasonalData?.avgHumidity ?? weather.averages.avgHumidity,
      totalSeasonalPrecipitation: seasonalData?.avgSeasonalPrecipitation ?? null,
      totalPrecipitation7d: weather.averages.totalPrecipitation7d,
      yearsOfData: seasonalData?.yearsOfData ?? 0,
      dataSource: seasonalData ? 'historical' : 'forecast'
    };

    // Run predictions for each crop
    const results = cropIds.map(cropId => {
      try {
        return predictYield({
          cropId,
          season,
          soilType,
          area: parseFloat(area),
          weatherData: predictionWeather,
          lat: parsedLat
        });
      } catch (err) {
        return { cropId, error: err.message };
      }
    });

    // Sort by yield per hectare (descending)
    results.sort((a, b) => {
      if (a.error) return 1;
      if (b.error) return -1;
      return b.prediction.yieldPerHectare - a.prediction.yieldPerHectare;
    });

    res.json({
      success: true,
      data: {
        results,
        weather: { current: weather.current }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/best-crop
 * Finds the best crops for given conditions (runs all 12 crops)
 * Body: { lat, lon, season, soilType, area }
 */
app.post('/api/best-crop', async (req, res) => {
  try {
    const { lat, lon, season, soilType, area } = req.body;

    if (!lat || !lon || !season || !soilType || !area) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: lat, lon, season, soilType, area.'
      });
    }

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    const [weather, seasonalData] = await Promise.all([
      fetchCurrentWeather(parsedLat, parsedLon),
      fetchSeasonalAverages(parsedLat, parsedLon, season, 10).catch(() => null)
    ]);

    const predictionWeather = {
      avgTemperature: seasonalData?.avgTemperature ?? weather.averages.avgTemperature,
      avgHumidity: seasonalData?.avgHumidity ?? weather.averages.avgHumidity,
      totalSeasonalPrecipitation: seasonalData?.avgSeasonalPrecipitation ?? null,
      totalPrecipitation7d: weather.averages.totalPrecipitation7d,
      yearsOfData: seasonalData?.yearsOfData ?? 0,
      dataSource: seasonalData ? 'historical' : 'forecast'
    };

    // Run prediction for ALL crops
    const allCropIds = crops.map(c => c.id);
    const results = allCropIds.map(cropId => {
      try {
        const result = predictYield({
          cropId,
          season,
          soilType,
          area: parseFloat(area),
          weatherData: predictionWeather,
          lat: parsedLat
        });
        // Add price data
        const price = cropPrices[cropId];
        if (price) {
          const yieldQuintals = result.prediction.totalYield * 10; // tons to quintals
          result.revenue = {
            msp: price.msp,
            marketAvg: price.marketAvg,
            grossRevenue: Math.round(yieldQuintals * (price.marketAvg || price.msp)),
            costOfCultivation: Math.round(price.costPerHa * parseFloat(area)),
            netProfit: Math.round(yieldQuintals * (price.marketAvg || price.msp) - price.costPerHa * parseFloat(area))
          };
        }
        return result;
      } catch (err) {
        return { crop: { id: cropId }, error: err.message };
      }
    });

    // Sort by composite score (best fit)
    results.sort((a, b) => {
      if (a.error) return 1;
      if (b.error) return -1;
      return b.prediction.compositeScore - a.prediction.compositeScore;
    });

    res.json({
      success: true,
      data: {
        results,
        weather: { current: weather.current },
        location: { lat: parsedLat, lon: parsedLon }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/prices
 * Returns crop market prices
 */
app.get('/api/prices', (req, res) => {
  res.json({
    success: true,
    data: cropPrices
  });
});

// ─── Catch-all: Serve frontend ──────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ───────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🌾 Crop Yield Prediction Portal`);
  console.log(`   Server running at http://localhost:${PORT}`);
  console.log(`   API endpoints:`);
  console.log(`     GET  /api/crops`);
  console.log(`     GET  /api/geocode?city=...`);
  console.log(`     GET  /api/weather?lat=...&lon=...`);
  console.log(`     GET  /api/weather/historical?lat=...&lon=...&start=...&end=...`);
  console.log(`     GET  /api/prices`);
  console.log(`     POST /api/predict`);
  console.log(`     POST /api/compare`);
  console.log(`     POST /api/best-crop`);
  console.log(`\n   Ready to predict! 🚀\n`);
});
