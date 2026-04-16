/**
 * CropSense — Frontend Application v2
 * Full-featured agricultural intelligence portal.
 *
 * Modules:
 *  - Core UI (nav, particles, counters)
 *  - City Search & GPS Location
 *  - Prediction Form & Results
 *  - Weather Dashboard
 *  - Crop Comparison Tool
 *  - Best-Fit Crop Analyzer
 *  - Revenue Estimator
 *  - Irrigation Calculator
 *  - Disease Risk Predictor
 *  - Prediction History (localStorage)
 *  - Export (PDF, CSV, JSON)
 *  - Toast Notifications
 *  - Mobile Menu
 */

// ─── State ──────────────────────────────────────
const state = {
  selectedLocation: null,
  cropsData: null,
  soilTypes: null,
  seasons: null,
  predictionResult: null,
  dashboardWeather: null,
  dashboardLocation: null,
  prices: null,
  charts: {}
};

// ─── DOM Helpers ────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  navbar: $('#navbar'),
  cityInput: $('#city-input'),
  searchCityBtn: $('#search-city-btn'),
  gpsBtn: $('#gps-btn'),
  cityResults: $('#city-results'),
  selectedLocation: $('#selected-location'),
  cropSelect: $('#crop-select'),
  cropInfo: $('#crop-info'),
  seasonSelect: $('#season-select'),
  soilSelect: $('#soil-select'),
  areaInput: $('#area-input'),
  predictBtn: $('#predict-btn'),
  bestCropBtn: $('#best-crop-btn'),
  predictionForm: $('#prediction-form'),
  loadingOverlay: $('#loading-overlay'),
  loadingText: $('#loading-text'),
  loadingSubtext: $('#loading-subtext'),
  resultsSection: $('#results'),
  navResultsLink: $('#nav-results-link'),
  newPredictionBtn: $('#new-prediction-btn'),
  particles: $('#particles'),
  // Dashboard
  dashCityInput: $('#dashboard-city-input'),
  dashSearchBtn: $('#dashboard-search-btn'),
  dashGpsBtn: $('#dashboard-gps-btn'),
  dashCityResults: $('#dashboard-city-results'),
  dashContent: $('#dashboard-content'),
  dashLocationBar: $('#dashboard-location-bar'),
  // Compare
  compareCropGrid: $('#compare-crop-grid'),
  compareBtn: $('#compare-btn'),
  compareResults: $('#compare-results'),
  compareInfoText: $('#compare-info-text'),
  // Best fit
  bestfitSection: $('#bestfit-section'),
  bestfitGrid: $('#bestfit-grid'),
  bestfitSubtitle: $('#bestfit-subtitle'),
  // History
  historyGrid: $('#history-grid'),
  historyEmpty: $('#history-empty'),
  clearHistoryBtn: $('#clear-history-btn'),
  // Export
  exportPdfBtn: $('#export-pdf-btn'),
  exportCsvBtn: $('#export-csv-btn'),
  exportJsonBtn: $('#export-json-btn'),
  savePredictionBtn: $('#save-prediction-btn'),
  // Mobile menu
  hamburgerBtn: $('#hamburger-btn'),
  mobileMenuOverlay: $('#mobile-menu-overlay')
};

// ─── Init ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNavScroll();
  initStatCounters();
  loadCropsData();
  loadPrices();
  bindEvents();
  loadHistory();
  lucide.createIcons();
});

// ─── Particles ──────────────────────────────────
function initParticles() {
  const container = els.particles;
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (8 + Math.random() * 12) + 's';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.width = (2 + Math.random() * 3) + 'px';
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}

// ─── Navbar scroll effect ───────────────────────
function initNavScroll() {
  window.addEventListener('scroll', () => {
    els.navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ─── Stat counters ──────────────────────────────
function initStatCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('.stat-number');
        counters.forEach(counter => animateCounter(counter));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsContainer = document.querySelector('.hero-stats');
  if (statsContainer) observer.observe(statsContainer);
}

function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

// ─── Load crops data ────────────────────────────
async function loadCropsData() {
  try {
    const res = await fetch('/api/crops');
    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    state.cropsData = json.data.crops;
    state.soilTypes = json.data.soilTypes;
    state.seasons = json.data.seasons;

    // Populate crop select
    state.cropsData.forEach(crop => {
      const option = document.createElement('option');
      option.value = crop.id;
      option.textContent = `${crop.emoji} ${crop.name}`;
      els.cropSelect.appendChild(option);
    });

    // Populate season select
    state.seasons.forEach(season => {
      const option = document.createElement('option');
      option.value = season.id;
      option.textContent = season.name;
      els.seasonSelect.appendChild(option);
    });

    // Populate soil select
    state.soilTypes.forEach(soil => {
      const option = document.createElement('option');
      option.value = soil;
      option.textContent = soil;
      els.soilSelect.appendChild(option);
    });

    // Populate comparison crop checkboxes
    populateComparisonGrid();

  } catch (err) {
    console.error('Failed to load crops data:', err);
    showToast('Failed to load crop data. Please refresh.', 'error');
  }
}

async function loadPrices() {
  try {
    const res = await fetch('/api/prices');
    const json = await res.json();
    if (json.success) state.prices = json.data;
  } catch (err) {
    console.warn('Failed to load prices:', err);
  }
}

// ─── Event Bindings ─────────────────────────────
function bindEvents() {
  // City search
  els.searchCityBtn.addEventListener('click', searchCity);
  els.cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); searchCity(); }
  });

  // GPS
  els.gpsBtn.addEventListener('click', () => getGPSLocation('predict'));
  els.dashGpsBtn.addEventListener('click', () => getGPSLocation('dashboard'));

  // Crop select change
  els.cropSelect.addEventListener('change', () => {
    showCropInfo(els.cropSelect.value);
    validateForm();
  });

  // Other form changes
  els.seasonSelect.addEventListener('change', validateForm);
  els.soilSelect.addEventListener('change', validateForm);
  els.areaInput.addEventListener('input', validateForm);

  // Form submit
  els.predictionForm.addEventListener('submit', handlePredict);

  // Best crop
  els.bestCropBtn.addEventListener('click', handleBestCrop);

  // New prediction
  els.newPredictionBtn.addEventListener('click', () => {
    els.resultsSection.classList.add('hidden');
    els.navResultsLink.classList.add('hidden');
    document.querySelector('#predict').scrollIntoView({ behavior: 'smooth' });
  });

  // Dashboard search
  els.dashSearchBtn.addEventListener('click', searchDashboardCity);
  els.dashCityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); searchDashboardCity(); }
  });

  // Compare
  els.compareBtn.addEventListener('click', handleCompare);

  // Export
  els.exportPdfBtn.addEventListener('click', exportPDF);
  els.exportCsvBtn.addEventListener('click', exportCSV);
  els.exportJsonBtn.addEventListener('click', exportJSON);
  els.savePredictionBtn.addEventListener('click', savePrediction);

  // History
  els.clearHistoryBtn.addEventListener('click', clearHistory);

  // Mobile menu
  els.hamburgerBtn.addEventListener('click', toggleMobileMenu);
  els.mobileMenuOverlay.addEventListener('click', (e) => {
    if (e.target === els.mobileMenuOverlay) closeMobileMenu();
  });
  $$('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
}

// ════════════════════════════════════════════════
//  TOAST NOTIFICATIONS
// ════════════════════════════════════════════════
function showToast(message, type = 'info', duration = 4000) {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-show'));

  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ════════════════════════════════════════════════
//  MOBILE MENU
// ════════════════════════════════════════════════
function toggleMobileMenu() {
  els.hamburgerBtn.classList.toggle('active');
  els.mobileMenuOverlay.classList.toggle('hidden');
  document.body.style.overflow = els.mobileMenuOverlay.classList.contains('hidden') ? '' : 'hidden';
}

function closeMobileMenu() {
  els.hamburgerBtn.classList.remove('active');
  els.mobileMenuOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

// ════════════════════════════════════════════════
//  GPS LOCATION
// ════════════════════════════════════════════════
function getGPSLocation(target) {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.', 'error');
    return;
  }

  const btn = target === 'dashboard' ? els.dashGpsBtn : els.gpsBtn;
  btn.disabled = true;
  btn.classList.add('gps-pulsing');

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Reverse geocode to get city name
        const res = await fetch(`/api/geocode?city=${latitude.toFixed(2)},${longitude.toFixed(2)}`);
        const json = await res.json();

        const location = {
          name: json.success && json.data.length > 0 ? json.data[0].name : 'My Location',
          latitude,
          longitude,
          country: json.success && json.data.length > 0 ? json.data[0].country : '',
          state: json.success && json.data.length > 0 ? json.data[0].state : ''
        };

        if (target === 'dashboard') {
          state.dashboardLocation = location;
          els.dashCityInput.value = location.name;
          loadDashboardWeather(latitude, longitude, location);
        } else {
          selectLocation(location);
          els.cityInput.value = location.name;
        }
        showToast(`Location detected: ${location.name}`, 'success');
      } catch (err) {
        showToast('Could not determine your city name.', 'warning');
        // Still use coordinates
        const location = { name: 'My Location', latitude, longitude, country: '', state: '' };
        if (target === 'dashboard') {
          state.dashboardLocation = location;
          loadDashboardWeather(latitude, longitude, location);
        } else {
          selectLocation(location);
        }
      } finally {
        btn.disabled = false;
        btn.classList.remove('gps-pulsing');
      }
    },
    (error) => {
      btn.disabled = false;
      btn.classList.remove('gps-pulsing');
      const messages = {
        1: 'Location access was denied. Please enable it in your browser settings.',
        2: 'Location information is unavailable.',
        3: 'Location request timed out.'
      };
      showToast(messages[error.code] || 'Could not get your location.', 'error');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ════════════════════════════════════════════════
//  CITY SEARCH (PREDICT FORM)
// ════════════════════════════════════════════════
async function searchCity() {
  const city = els.cityInput.value.trim();
  if (!city) return;

  els.searchCityBtn.disabled = true;
  els.searchCityBtn.innerHTML = '<i data-lucide="loader"></i>';
  lucide.createIcons();

  try {
    const res = await fetch(`/api/geocode?city=${encodeURIComponent(city)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    const results = json.data;
    els.cityResults.classList.remove('hidden');
    els.cityResults.innerHTML = results.map((r, i) => `
      <div class="city-result-item" data-index="${i}">
        <i data-lucide="map-pin" style="width:14px;height:14px;color:var(--accent-primary)"></i>
        <span class="city-name">${r.name}</span>
        <span class="city-meta">${r.state ? r.state + ', ' : ''}${r.country} (${r.latitude.toFixed(2)}, ${r.longitude.toFixed(2)})</span>
      </div>
    `).join('');
    lucide.createIcons();

    els.cityResults.querySelectorAll('.city-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        selectLocation(results[idx]);
      });
    });
  } catch (err) {
    els.cityResults.classList.remove('hidden');
    els.cityResults.innerHTML = `<div class="city-result-item" style="color:var(--red)">${err.message}</div>`;
  } finally {
    els.searchCityBtn.disabled = false;
    els.searchCityBtn.innerHTML = '<i data-lucide="search"></i> Search';
    lucide.createIcons();
  }
}

function selectLocation(location) {
  state.selectedLocation = location;
  els.cityResults.classList.add('hidden');
  els.selectedLocation.classList.remove('hidden');
  els.selectedLocation.innerHTML = `
    <i data-lucide="check-circle"></i>
    <span>${location.name}${location.state ? ', ' + location.state : ''}, ${location.country} — (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})</span>
  `;
  lucide.createIcons();
  validateForm();
  updateCompareAvailability();
}

// ─── Crop Info ──────────────────────────────────
function showCropInfo(cropId) {
  if (!cropId) { els.cropInfo.classList.add('hidden'); return; }
  const crop = state.cropsData.find(c => c.id === cropId);
  if (!crop) return;

  els.cropInfo.classList.remove('hidden');
  els.cropInfo.innerHTML = `
    <div class="crop-info-row"><span class="crop-info-label">Temp Range</span><span class="crop-info-value">${crop.optimalTempMin}°C – ${crop.optimalTempMax}°C</span></div>
    <div class="crop-info-row"><span class="crop-info-label">Water Need</span><span class="crop-info-value">${crop.waterNeedMin} – ${crop.waterNeedMax} mm</span></div>
    <div class="crop-info-row"><span class="crop-info-label">Duration</span><span class="crop-info-value">${crop.growthDuration} days</span></div>
    <div class="crop-info-row"><span class="crop-info-label">Base Yield</span><span class="crop-info-value">${crop.baseYield} tons/ha</span></div>
    <div class="crop-info-row"><span class="crop-info-label">Best Season</span><span class="crop-info-value">${crop.preferredSeasons.join(', ')}</span></div>
    <div class="crop-info-row"><span class="crop-info-label">Irrigation</span><span class="crop-info-value">${crop.irrigationMethod}</span></div>
  `;
}

// ─── Form Validation ────────────────────────────
function validateForm() {
  const isValid = (
    state.selectedLocation &&
    els.cropSelect.value &&
    els.seasonSelect.value &&
    els.soilSelect.value &&
    els.areaInput.value && parseFloat(els.areaInput.value) > 0
  );
  els.predictBtn.disabled = !isValid;

  // Best crop needs location + season + soil + area (no crop needed)
  const bestCropValid = (
    state.selectedLocation &&
    els.seasonSelect.value &&
    els.soilSelect.value &&
    els.areaInput.value && parseFloat(els.areaInput.value) > 0
  );
  els.bestCropBtn.disabled = !bestCropValid;
}

// ════════════════════════════════════════════════
//  PREDICTION
// ════════════════════════════════════════════════
async function handlePredict(e) {
  e.preventDefault();
  if (els.predictBtn.disabled) return;

  showLoading();
  try {
    await updateLoadingStep('step-weather', 'Fetching Weather Data...', 'Connecting to Open-Meteo API');
    await delay(500);
    await updateLoadingStep('step-analysis', 'Analyzing Conditions...', 'Running multi-factor prediction algorithm');
    await delay(300);

    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cropId: els.cropSelect.value,
        lat: state.selectedLocation.latitude,
        lon: state.selectedLocation.longitude,
        season: els.seasonSelect.value,
        soilType: els.soilSelect.value,
        area: parseFloat(els.areaInput.value)
      })
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    await updateLoadingStep('step-prediction', 'Generating Report...', 'Preparing yield prediction report');
    await delay(400);

    state.predictionResult = json.data;
    renderResults(json.data);
    showToast('Prediction completed successfully!', 'success');
  } catch (err) {
    showToast('Prediction failed: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
}

// ─── Loading helpers ────────────────────────────
function showLoading() {
  els.loadingOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  $$('.loading-step').forEach(s => { s.classList.remove('active', 'done'); });
}

function hideLoading() {
  els.loadingOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

async function updateLoadingStep(stepId, text, subtext) {
  const steps = ['step-weather', 'step-analysis', 'step-prediction'];
  const currentIdx = steps.indexOf(stepId);
  steps.forEach((s, i) => {
    const el = $(`#${s}`);
    if (i < currentIdx) { el.classList.remove('active'); el.classList.add('done'); }
    else if (i === currentIdx) { el.classList.add('active'); el.classList.remove('done'); }
  });
  els.loadingText.textContent = text;
  els.loadingSubtext.textContent = subtext;
  lucide.createIcons();
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ════════════════════════════════════════════════
//  RENDER RESULTS
// ════════════════════════════════════════════════
function renderResults(data) {
  const { crop, prediction, scores, input, recommendations, weather } = data;

  els.resultsSection.classList.remove('hidden');
  els.navResultsLink.classList.remove('hidden');

  // Subtitle
  $('#results-subtitle').textContent =
    `${crop.emoji} ${crop.name} yield prediction for ${state.selectedLocation.name}, ${state.selectedLocation.country} — ${input.season} season on ${input.soilType} soil`;

  // Hero cards
  $('#result-total-yield').textContent = `${prediction.totalYield.toFixed(1)} tons`;
  $('#result-per-hectare').textContent = `${prediction.yieldPerHectare.toFixed(2)} tons/hectare × ${prediction.area} ha`;
  $('#result-confidence').textContent = `${prediction.confidence.toFixed(0)}%`;
  $('#result-rating').textContent = `Rating: ${prediction.yieldRating}`;
  $('#result-temp').textContent = `${weather.current.temperature}°C`;
  $('#result-weather-desc').textContent = weather.current.weatherDescription;
  $('#result-rain').textContent = `${input.totalSeasonalPrecipitation || input.totalPrecipitation7d} mm${input.dataSource === 'historical' ? ' (seasonal avg)' : ''}`;
  $('#result-humidity').textContent = `Humidity: ${input.avgHumidity}%`;

  // Factor details
  renderFactorDetails(scores);

  // Charts
  renderFactorsChart(scores);
  renderScoresChart(scores);
  renderForecastChart(weather.daily);

  // Revenue
  renderRevenuePanel(crop, prediction);

  // Irrigation
  renderIrrigationPanel(crop, input, weather);

  // Disease Risk
  renderDiseasePanel(crop, input);

  // Recommendations
  renderRecommendations(recommendations);

  // Scroll to results
  lucide.createIcons();
  setTimeout(() => {
    els.resultsSection.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// ─── Factor Details Cards ───────────────────────
function renderFactorDetails(scores) {
  const grid = $('#factor-details-grid');
  grid.innerHTML = '';

  Object.entries(scores).forEach(([key, s], i) => {
    const percent = Math.round(s.value * 100);
    let colorClass = 'score-excellent';
    if (percent < 50) colorClass = 'score-poor';
    else if (percent < 65) colorClass = 'score-average';
    else if (percent < 85) colorClass = 'score-good';

    const card = document.createElement('div');
    card.className = 'factor-detail-card';
    card.style.animationDelay = `${0.1 + i * 0.08}s`;
    card.innerHTML = `
      <div class="factor-score ${colorClass}">${percent}%</div>
      <div class="factor-label">${s.label}</div>
      <div class="factor-bar">
        <div class="factor-bar-fill" style="width: 0%"></div>
      </div>
    `;
    grid.appendChild(card);

    setTimeout(() => {
      card.querySelector('.factor-bar-fill').style.width = percent + '%';
    }, 300 + i * 100);
  });
}

// ─── Charts ─────────────────────────────────────
function renderFactorsChart(scores) {
  if (state.charts.factors) state.charts.factors.destroy();
  const ctx = $('#factors-chart').getContext('2d');
  const labels = Object.values(scores).map(s => s.label);
  const values = Object.values(scores).map(s => s.weight * 100);
  const colors = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6'];

  state.charts.factors = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors, borderColor: 'rgba(6, 13, 26, 0.8)', borderWidth: 3, hoverOffset: 8 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, padding: 16, usePointStyle: true, pointStyleWidth: 12 } },
        tooltip: { backgroundColor: '#111d33', titleColor: '#e8edf5', bodyColor: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.1)', borderWidth: 1, cornerRadius: 8, callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}% weight` } }
      }
    }
  });
}

function renderScoresChart(scores) {
  if (state.charts.scores) state.charts.scores.destroy();
  const ctx = $('#scores-chart').getContext('2d');
  const labels = Object.values(scores).map(s => s.label);
  const values = Object.values(scores).map(s => Math.round(s.value * 100));
  const colors = values.map(v => { if (v >= 85) return '#10b981'; if (v >= 65) return '#14b8a6'; if (v >= 50) return '#f59e0b'; return '#ef4444'; });

  state.charts.scores = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Score (%)', data: values, backgroundColor: colors.map(c => c + '30'), borderColor: colors, borderWidth: 2, borderRadius: 8, borderSkipped: false }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { color: '#64748b', font: { family: 'Inter', size: 11 }, callback: v => v + '%' }, grid: { color: 'rgba(148, 163, 184, 0.06)' } },
        x: { ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }, grid: { display: false } }
      },
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111d33', titleColor: '#e8edf5', bodyColor: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.1)', borderWidth: 1, cornerRadius: 8, callbacks: { label: (ctx) => ` Score: ${ctx.raw}%` } } }
    }
  });
}

function renderForecastChart(daily, canvasId = 'forecast-chart') {
  const chartKey = canvasId === 'forecast-chart' ? 'forecast' : 'dashForecast';
  if (state.charts[chartKey]) state.charts[chartKey].destroy();

  const ctx = $(`#${canvasId}`).getContext('2d');
  const labels = daily.map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  });

  state.charts[chartKey] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Max Temp (°C)', data: daily.map(d => d.tempMax), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 2.5, tension: 0.4, fill: false, pointBackgroundColor: '#ef4444', pointRadius: 4, pointHoverRadius: 6, yAxisID: 'y' },
        { label: 'Min Temp (°C)', data: daily.map(d => d.tempMin), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', borderWidth: 2.5, tension: 0.4, fill: false, pointBackgroundColor: '#3b82f6', pointRadius: 4, pointHoverRadius: 6, yAxisID: 'y' },
        { label: 'Precipitation (mm)', data: daily.map(d => d.precipitation), borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.15)', borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: '#06b6d4', pointRadius: 4, pointHoverRadius: 6, yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      scales: {
        y: { type: 'linear', position: 'left', title: { display: true, text: 'Temperature (°C)', color: '#64748b', font: { family: 'Inter', size: 11 } }, ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(148, 163, 184, 0.06)' } },
        y1: { type: 'linear', position: 'right', title: { display: true, text: 'Precipitation (mm)', color: '#64748b', font: { family: 'Inter', size: 11 } }, ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } }, grid: { drawOnChartArea: false }, beginAtZero: true },
        x: { ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }, grid: { display: false } }
      },
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, usePointStyle: true, pointStyleWidth: 12, padding: 16 } },
        tooltip: { backgroundColor: '#111d33', titleColor: '#e8edf5', bodyColor: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.1)', borderWidth: 1, cornerRadius: 8 }
      }
    }
  });
}

// ─── Recommendations ────────────────────────────
function renderRecommendations(recs) {
  const grid = $('#recommendations-grid');
  grid.innerHTML = recs.map((rec, i) => `
    <div class="rec-card rec-${rec.type}" style="animation-delay: ${0.1 + i * 0.08}s">
      <div class="rec-icon">${rec.icon}</div>
      <div class="rec-content">
        <h4>${rec.title}</h4>
        <p>${rec.text}</p>
      </div>
    </div>
  `).join('');
}

// ════════════════════════════════════════════════
//  REVENUE ESTIMATOR
// ════════════════════════════════════════════════
function renderRevenuePanel(crop, prediction) {
  const panel = $('#revenue-panel');
  const grid = $('#revenue-grid');

  if (!state.prices || !state.prices[crop.id]) {
    panel.style.display = 'none';
    return;
  }
  panel.style.display = '';

  const price = state.prices[crop.id];
  const yieldQuintals = prediction.totalYield * 10; // tons → quintals (100 kg)
  const grossMSP = price.msp ? Math.round(yieldQuintals * price.msp) : null;
  const grossMarket = Math.round(yieldQuintals * price.marketAvg);
  const cost = Math.round(price.costPerHa * prediction.area);
  const netMarket = grossMarket - cost;

  const formatINR = (val) => '₹' + val.toLocaleString('en-IN');

  grid.innerHTML = `
    <div class="revenue-card rc-yield">
      <span class="rc-label">Total Yield</span>
      <span class="rc-value">${yieldQuintals.toFixed(1)} quintals</span>
      <span class="rc-sub">${prediction.totalYield.toFixed(1)} tons</span>
    </div>
    ${price.msp ? `
    <div class="revenue-card rc-msp">
      <span class="rc-label">MSP Revenue</span>
      <span class="rc-value">${formatINR(grossMSP)}</span>
      <span class="rc-sub">@ ${formatINR(price.msp)}/quintal</span>
    </div>` : ''}
    <div class="revenue-card rc-market">
      <span class="rc-label">Market Revenue</span>
      <span class="rc-value">${formatINR(grossMarket)}</span>
      <span class="rc-sub">@ ${formatINR(price.marketAvg)}/quintal avg</span>
    </div>
    <div class="revenue-card rc-cost">
      <span class="rc-label">Est. Cultivation Cost</span>
      <span class="rc-value">${formatINR(cost)}</span>
      <span class="rc-sub">@ ${formatINR(price.costPerHa)}/hectare</span>
    </div>
    <div class="revenue-card ${netMarket >= 0 ? 'rc-profit' : 'rc-loss'}">
      <span class="rc-label">Est. Net Profit</span>
      <span class="rc-value">${formatINR(Math.abs(netMarket))}</span>
      <span class="rc-sub">${netMarket >= 0 ? 'Profit' : 'Loss'} at market price</span>
    </div>
  `;
}

// ════════════════════════════════════════════════
//  IRRIGATION CALCULATOR
// ════════════════════════════════════════════════
function renderIrrigationPanel(crop, input, weather) {
  const grid = $('#irrigation-grid');
  const kc = crop.cropCoefficient || 0.85;

  // Simplified ET₀ using Blaney-Criddle method: ET₀ = p × (0.46T + 8.13) mm/day
  // p ~ 0.27 for tropical latitudes
  const avgTemp = input.avgTemperature;
  const p = 0.27;
  const et0 = p * (0.46 * avgTemp + 8.13); // mm/day
  const etc = et0 * kc; // crop water need mm/day
  const totalWaterNeed = etc * crop.growthDuration; // mm over season
  const rainfall = input.totalSeasonalPrecipitation || input.totalPrecipitation7d;
  const deficit = Math.max(0, totalWaterNeed - rainfall);
  const irrigationDays = crop.growthDuration;
  const dailyIrr = deficit > 0 ? (deficit / irrigationDays).toFixed(1) : 0;
  const litersPerHa = deficit * 10000; // 1mm over 1ha = 10,000 liters

  const formatNum = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  grid.innerHTML = `
    <div class="irr-card">
      <span class="irr-label">Reference ET₀</span>
      <span class="irr-value">${et0.toFixed(1)} mm/day</span>
    </div>
    <div class="irr-card">
      <span class="irr-label">Crop ET (Kc=${kc})</span>
      <span class="irr-value">${etc.toFixed(1)} mm/day</span>
    </div>
    <div class="irr-card">
      <span class="irr-label">Season Water Need</span>
      <span class="irr-value">${formatNum(totalWaterNeed)} mm</span>
    </div>
    <div class="irr-card">
      <span class="irr-label">Expected Rainfall</span>
      <span class="irr-value">${formatNum(rainfall)} mm</span>
    </div>
    <div class="irr-card ${deficit > 0 ? 'irr-deficit' : 'irr-surplus'}">
      <span class="irr-label">${deficit > 0 ? 'Water Deficit' : 'Sufficient Water'}</span>
      <span class="irr-value">${deficit > 0 ? formatNum(deficit) + ' mm' : '✓ No deficit'}</span>
    </div>
    <div class="irr-card">
      <span class="irr-label">Daily Irrigation Need</span>
      <span class="irr-value">${dailyIrr} mm/day</span>
    </div>
    <div class="irr-card">
      <span class="irr-label">Total Water Volume</span>
      <span class="irr-value">${formatNum(litersPerHa)} L/ha</span>
    </div>
    <div class="irr-card">
      <span class="irr-label">Recommended Method</span>
      <span class="irr-value">${crop.irrigationMethod}</span>
    </div>
  `;
}

// ════════════════════════════════════════════════
//  DISEASE RISK PREDICTOR
// ════════════════════════════════════════════════
function renderDiseasePanel(crop, input) {
  const grid = $('#disease-grid');
  if (!crop.diseases || crop.diseases.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted)">No disease data available for this crop.</p>';
    return;
  }

  const avgTemp = input.avgTemperature;
  const avgHumidity = input.avgHumidity;

  grid.innerHTML = crop.diseases.map(disease => {
    // Calculate risk level based on current weather
    const tempInRange = avgTemp >= disease.tempMin && avgTemp <= disease.tempMax;
    const humidityHigh = avgHumidity >= disease.humidityMin;

    let riskLevel = 'low';
    let riskColor = 'risk-low';
    let riskPercent = 20;

    if (tempInRange && humidityHigh) {
      riskLevel = 'high';
      riskColor = 'risk-high';
      riskPercent = 75 + Math.min(25, (avgHumidity - disease.humidityMin) * 1.5);
    } else if (tempInRange || humidityHigh) {
      riskLevel = 'moderate';
      riskColor = 'risk-moderate';
      riskPercent = 40 + Math.random() * 20;
    }

    riskPercent = Math.min(95, Math.round(riskPercent));

    return `
      <div class="disease-card ${riskColor}">
        <div class="disease-header">
          <span class="disease-name">${disease.name}</span>
          <span class="disease-risk-badge ${riskColor}">${riskLevel.toUpperCase()}</span>
        </div>
        <div class="disease-bar">
          <div class="disease-bar-fill" style="width:${riskPercent}%"></div>
        </div>
        <div class="disease-conditions">
          <span>Risk when: Humidity ≥ ${disease.humidityMin}%, Temp ${disease.tempMin}–${disease.tempMax}°C</span>
        </div>
      </div>
    `;
  }).join('');
}

// ════════════════════════════════════════════════
//  WEATHER DASHBOARD
// ════════════════════════════════════════════════
async function searchDashboardCity() {
  const city = els.dashCityInput.value.trim();
  if (!city) return;

  els.dashSearchBtn.disabled = true;
  try {
    const res = await fetch(`/api/geocode?city=${encodeURIComponent(city)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    const results = json.data;
    els.dashCityResults.classList.remove('hidden');
    els.dashCityResults.innerHTML = results.map((r, i) => `
      <div class="city-result-item" data-index="${i}">
        <i data-lucide="map-pin" style="width:14px;height:14px;color:var(--accent-primary)"></i>
        <span class="city-name">${r.name}</span>
        <span class="city-meta">${r.state ? r.state + ', ' : ''}${r.country}</span>
      </div>
    `).join('');
    lucide.createIcons();

    els.dashCityResults.querySelectorAll('.city-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        const loc = results[idx];
        state.dashboardLocation = loc;
        els.dashCityResults.classList.add('hidden');
        els.dashCityInput.value = loc.name;
        loadDashboardWeather(loc.latitude, loc.longitude, loc);
      });
    });
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    els.dashSearchBtn.disabled = false;
  }
}

async function loadDashboardWeather(lat, lon, location) {
  try {
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    state.dashboardWeather = json.data;
    els.dashContent.classList.remove('hidden');

    // Location bar
    els.dashLocationBar.innerHTML = `<i data-lucide="map-pin"></i> <strong>${location.name}</strong>${location.state ? ', ' + location.state : ''}, ${location.country} — ${json.data.current.weatherDescription}`;

    // Stats
    const c = json.data.current;
    $('#dash-temp').textContent = `${c.temperature}°C`;
    $('#dash-feels').textContent = `${c.apparentTemp}°C`;
    $('#dash-humidity').textContent = `${c.humidity}%`;
    $('#dash-wind').textContent = `${c.windSpeed} km/h`;
    $('#dash-pressure').textContent = `${c.pressure} hPa`;
    $('#dash-precip').textContent = `${c.precipitation} mm`;

    // Forecast cards
    renderForecastCards(json.data.daily);

    // Forecast chart
    renderForecastChart(json.data.daily, 'dashboard-forecast-chart');

    lucide.createIcons();
    showToast(`Weather loaded for ${location.name}`, 'success');
  } catch (err) {
    showToast('Failed to load weather: ' + err.message, 'error');
  }
}

function renderForecastCards(daily) {
  const row = $('#forecast-cards-row');
  row.innerHTML = daily.map(d => {
    const date = new Date(d.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `
      <div class="forecast-day-card">
        <span class="fdc-day">${dayName}</span>
        <span class="fdc-date">${dateStr}</span>
        <span class="fdc-desc">${d.weatherDescription}</span>
        <div class="fdc-temps">
          <span class="fdc-max">${d.tempMax}°</span>
          <span class="fdc-min">${d.tempMin}°</span>
        </div>
        <span class="fdc-rain"><i data-lucide="droplets" style="width:12px;height:12px"></i> ${d.precipitation} mm</span>
      </div>
    `;
  }).join('');
}

// ════════════════════════════════════════════════
//  CROP COMPARISON
// ════════════════════════════════════════════════
function populateComparisonGrid() {
  if (!state.cropsData) return;
  els.compareCropGrid.innerHTML = state.cropsData.map(crop => `
    <label class="crop-checkbox-label">
      <input type="checkbox" value="${crop.id}" class="compare-crop-cb">
      <span class="crop-cb-visual">
        <span class="crop-cb-emoji">${crop.emoji}</span>
        <span class="crop-cb-name">${crop.name}</span>
      </span>
    </label>
  `).join('');

  // Bind checkbox events
  $$('.compare-crop-cb').forEach(cb => {
    cb.addEventListener('change', updateCompareAvailability);
  });
}

function updateCompareAvailability() {
  const checked = $$('.compare-crop-cb:checked').length;
  const hasLocation = !!state.selectedLocation;
  const hasSeason = !!els.seasonSelect.value;
  const hasSoil = !!els.soilSelect.value;
  const hasArea = !!els.areaInput.value && parseFloat(els.areaInput.value) > 0;

  els.compareBtn.disabled = !(checked >= 2 && checked <= 6 && hasLocation && hasSeason && hasSoil && hasArea);

  if (hasLocation && hasSeason && hasSoil && hasArea) {
    els.compareInfoText.innerHTML = `<i data-lucide="check-circle"></i> <span>Ready! Select 2–6 crops to compare. (${checked} selected)</span>`;
    els.compareInfoText.className = 'compare-info-text info-ready';
  } else {
    els.compareInfoText.innerHTML = `<i data-lucide="info"></i> <span>First set your location, season, soil, and area in the Predict section above.</span>`;
    els.compareInfoText.className = 'compare-info-text';
  }
  lucide.createIcons();
}

async function handleCompare() {
  const cropIds = Array.from($$('.compare-crop-cb:checked')).map(cb => cb.value);
  if (cropIds.length < 2) return;

  showLoading();
  try {
    await updateLoadingStep('step-weather', 'Fetching Weather Data...', 'Loading shared weather data for comparison');
    await delay(400);
    await updateLoadingStep('step-analysis', 'Comparing Crops...', `Analyzing ${cropIds.length} crops simultaneously`);

    const res = await fetch('/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cropIds,
        lat: state.selectedLocation.latitude,
        lon: state.selectedLocation.longitude,
        season: els.seasonSelect.value,
        soilType: els.soilSelect.value,
        area: parseFloat(els.areaInput.value)
      })
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    await updateLoadingStep('step-prediction', 'Building Report...', 'Generating comparison charts');
    await delay(300);

    renderCompareResults(json.data.results);
    showToast(`Compared ${cropIds.length} crops successfully!`, 'success');
  } catch (err) {
    showToast('Comparison failed: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
}

function renderCompareResults(results) {
  els.compareResults.classList.remove('hidden');

  // Table
  const table = $('#compare-table');
  const validResults = results.filter(r => !r.error);

  table.querySelector('thead').innerHTML = `
    <tr>
      <th>Rank</th>
      <th>Crop</th>
      <th>Yield/ha</th>
      <th>Total Yield</th>
      <th>Score</th>
      <th>Rating</th>
      <th>Confidence</th>
    </tr>
  `;

  table.querySelector('tbody').innerHTML = validResults.map((r, i) => {
    const medals = ['🥇', '🥈', '🥉'];
    return `
      <tr class="${i === 0 ? 'compare-winner' : ''}">
        <td>${medals[i] || (i + 1)}</td>
        <td>${r.crop.emoji} ${r.crop.name}</td>
        <td>${r.prediction.yieldPerHectare.toFixed(2)} t/ha</td>
        <td>${r.prediction.totalYield.toFixed(1)} tons</td>
        <td>${(r.prediction.compositeScore * 100).toFixed(0)}%</td>
        <td><span class="rating-badge rating-${r.prediction.yieldRating.toLowerCase().replace(' ', '-')}">${r.prediction.yieldRating}</span></td>
        <td>${r.prediction.confidence.toFixed(0)}%</td>
      </tr>
    `;
  }).join('');

  // Chart
  renderCompareChart(validResults);

  setTimeout(() => {
    els.compareResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function renderCompareChart(results) {
  if (state.charts.compare) state.charts.compare.destroy();
  const ctx = $('#compare-chart').getContext('2d');

  const labels = results.map(r => r.crop.emoji + ' ' + r.crop.name);
  const yields = results.map(r => r.prediction.yieldPerHectare);
  const scores = results.map(r => r.prediction.compositeScore * 100);
  const colors = results.map((_, i) => {
    const hue = 150 + i * 30;
    return `hsl(${hue}, 70%, 55%)`;
  });

  state.charts.compare = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Yield (tons/ha)', data: yields, backgroundColor: colors.map(c => c.replace('55%)', '55%, 0.3)')), borderColor: colors, borderWidth: 2, borderRadius: 8, yAxisID: 'y' },
        { label: 'Score (%)', data: scores, type: 'line', borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 2.5, tension: 0.4, pointBackgroundColor: '#f59e0b', pointRadius: 5, yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Yield (tons/ha)', color: '#64748b' }, ticks: { color: '#64748b' }, grid: { color: 'rgba(148, 163, 184, 0.06)' } },
        y1: { position: 'right', beginAtZero: true, max: 100, title: { display: true, text: 'Score (%)', color: '#64748b' }, ticks: { color: '#64748b' }, grid: { drawOnChartArea: false } },
        x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
      },
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { family: 'Inter' }, usePointStyle: true } },
        tooltip: { backgroundColor: '#111d33', titleColor: '#e8edf5', bodyColor: '#94a3b8', cornerRadius: 8 }
      }
    }
  });
}

// ════════════════════════════════════════════════
//  BEST-FIT CROP ANALYZER
// ════════════════════════════════════════════════
async function handleBestCrop() {
  if (els.bestCropBtn.disabled) return;
  showLoading();

  try {
    await updateLoadingStep('step-weather', 'Fetching Weather...', 'Loading weather for all crop analysis');
    await delay(400);
    await updateLoadingStep('step-analysis', 'Analyzing All 12 Crops...', 'Finding the best fit for your conditions');

    const res = await fetch('/api/best-crop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: state.selectedLocation.latitude,
        lon: state.selectedLocation.longitude,
        season: els.seasonSelect.value,
        soilType: els.soilSelect.value,
        area: parseFloat(els.areaInput.value)
      })
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    await updateLoadingStep('step-prediction', 'Ranking Results...', 'Building crop recommendation report');
    await delay(300);

    renderBestFitResults(json.data.results);
    showToast('Best-fit analysis complete!', 'success');
  } catch (err) {
    showToast('Analysis failed: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
}

function renderBestFitResults(results) {
  els.bestfitSection.classList.remove('hidden');
  els.bestfitSubtitle.textContent = `Ranked predictions for ${state.selectedLocation.name} — ${els.seasonSelect.value} season on ${els.soilSelect.value} soil (${els.areaInput.value} ha)`;

  const validResults = results.filter(r => !r.error);
  const medals = ['🥇', '🥈', '🥉'];
  const formatINR = (val) => '₹' + val.toLocaleString('en-IN');

  els.bestfitGrid.innerHTML = validResults.map((r, i) => {
    const scorePercent = (r.prediction.compositeScore * 100).toFixed(0);
    const hasRevenue = r.revenue && r.revenue.netProfit;

    return `
      <div class="bestfit-card ${i < 3 ? 'bestfit-top' : ''}" style="animation-delay:${i * 0.06}s">
        <div class="bf-rank">${medals[i] || '#' + (i + 1)}</div>
        <div class="bf-header">
          <span class="bf-emoji">${r.crop.emoji}</span>
          <div>
            <h4 class="bf-name">${r.crop.name}</h4>
            <span class="bf-rating rating-badge rating-${r.prediction.yieldRating.toLowerCase().replace(' ', '-')}">${r.prediction.yieldRating}</span>
          </div>
        </div>
        <div class="bf-stats">
          <div class="bf-stat">
            <span class="bf-stat-label">Yield</span>
            <span class="bf-stat-value">${r.prediction.yieldPerHectare.toFixed(2)} t/ha</span>
          </div>
          <div class="bf-stat">
            <span class="bf-stat-label">Score</span>
            <span class="bf-stat-value">${scorePercent}%</span>
          </div>
          <div class="bf-stat">
            <span class="bf-stat-label">Total</span>
            <span class="bf-stat-value">${r.prediction.totalYield.toFixed(1)} tons</span>
          </div>
          ${hasRevenue ? `
          <div class="bf-stat">
            <span class="bf-stat-label">Net Profit</span>
            <span class="bf-stat-value ${r.revenue.netProfit >= 0 ? 'profit' : 'loss'}">${formatINR(r.revenue.netProfit)}</span>
          </div>` : ''}
        </div>
        <div class="bf-score-bar">
          <div class="bf-score-fill" style="width:${scorePercent}%"></div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
  setTimeout(() => {
    els.bestfitSection.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// ════════════════════════════════════════════════
//  PREDICTION HISTORY (localStorage)
// ════════════════════════════════════════════════
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('cropsense_history') || '[]');
  } catch { return []; }
}

function saveHistory(history) {
  localStorage.setItem('cropsense_history', JSON.stringify(history));
}

function savePrediction() {
  if (!state.predictionResult) return;

  const history = getHistory();
  const entry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    location: { ...state.selectedLocation },
    cropId: state.predictionResult.crop.id,
    cropName: state.predictionResult.crop.name,
    cropEmoji: state.predictionResult.crop.emoji,
    season: state.predictionResult.input.season,
    soilType: state.predictionResult.input.soilType,
    area: state.predictionResult.prediction.area,
    yieldPerHectare: state.predictionResult.prediction.yieldPerHectare,
    totalYield: state.predictionResult.prediction.totalYield,
    compositeScore: state.predictionResult.prediction.compositeScore,
    confidence: state.predictionResult.prediction.confidence,
    yieldRating: state.predictionResult.prediction.yieldRating
  };

  history.unshift(entry);
  if (history.length > 50) history.pop(); // Keep max 50
  saveHistory(history);
  loadHistory();
  showToast('Prediction saved to history!', 'success');
}

function loadHistory() {
  const history = getHistory();

  if (history.length === 0) {
    els.historyEmpty.style.display = '';
    els.historyGrid.innerHTML = '';
    els.clearHistoryBtn.classList.add('hidden');
    return;
  }

  els.historyEmpty.style.display = 'none';
  els.clearHistoryBtn.classList.remove('hidden');

  els.historyGrid.innerHTML = history.map(h => {
    const date = new Date(h.timestamp);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="history-card">
        <div class="hc-header">
          <span class="hc-crop">${h.cropEmoji} ${h.cropName}</span>
          <button class="hc-delete" onclick="deleteHistoryItem(${h.id})" title="Delete">×</button>
        </div>
        <div class="hc-location"><i data-lucide="map-pin" style="width:12px;height:12px"></i> ${h.location.name}, ${h.location.country}</div>
        <div class="hc-details">
          <span>${h.season} • ${h.soilType} • ${h.area} ha</span>
        </div>
        <div class="hc-results">
          <div class="hc-stat">
            <span class="hc-stat-value">${h.yieldPerHectare.toFixed(2)} t/ha</span>
            <span class="hc-stat-label">Yield</span>
          </div>
          <div class="hc-stat">
            <span class="hc-stat-value">${h.totalYield.toFixed(1)} tons</span>
            <span class="hc-stat-label">Total</span>
          </div>
          <div class="hc-stat">
            <span class="hc-stat-value rating-badge rating-${h.yieldRating.toLowerCase().replace(' ', '-')}">${h.yieldRating}</span>
            <span class="hc-stat-label">Rating</span>
          </div>
        </div>
        <div class="hc-footer">
          <span class="hc-date">${dateStr} at ${timeStr}</span>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

// Global function for inline onclick
window.deleteHistoryItem = function(id) {
  const history = getHistory().filter(h => h.id !== id);
  saveHistory(history);
  loadHistory();
  showToast('Prediction removed from history.', 'info');
};

function clearHistory() {
  if (!confirm('Delete all prediction history?')) return;
  localStorage.removeItem('cropsense_history');
  loadHistory();
  showToast('History cleared.', 'info');
}

// ════════════════════════════════════════════════
//  EXPORT: PDF
// ════════════════════════════════════════════════
function exportPDF() {
  if (!state.predictionResult) return;
  window.print();
  showToast('Print dialog opened. Save as PDF to export.', 'info');
}

// ════════════════════════════════════════════════
//  EXPORT: CSV
// ════════════════════════════════════════════════
function exportCSV() {
  if (!state.predictionResult) return;
  const d = state.predictionResult;
  const rows = [
    ['Field', 'Value'],
    ['Crop', d.crop.name],
    ['Location', state.selectedLocation.name],
    ['Season', d.input.season],
    ['Soil Type', d.input.soilType],
    ['Area (ha)', d.prediction.area],
    ['Yield per Hectare (tons)', d.prediction.yieldPerHectare],
    ['Total Yield (tons)', d.prediction.totalYield],
    ['Composite Score', d.prediction.compositeScore],
    ['Confidence (%)', d.prediction.confidence],
    ['Rating', d.prediction.yieldRating],
    ['Avg Temperature (°C)', d.input.avgTemperature],
    ['Avg Humidity (%)', d.input.avgHumidity],
    ['Seasonal Precipitation (mm)', d.input.totalSeasonalPrecipitation],
    ['Data Source', d.input.dataSource],
    ...Object.entries(d.scores).map(([k, v]) => [`Score: ${v.label}`, v.value])
  ];

  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  downloadFile(csv, `cropsense_${d.crop.id}_${Date.now()}.csv`, 'text/csv');
  showToast('CSV downloaded!', 'success');
}

// ════════════════════════════════════════════════
//  EXPORT: JSON
// ════════════════════════════════════════════════
function exportJSON() {
  if (!state.predictionResult) return;
  const d = state.predictionResult;
  const json = JSON.stringify({
    exportDate: new Date().toISOString(),
    location: state.selectedLocation,
    crop: d.crop,
    prediction: d.prediction,
    scores: d.scores,
    input: d.input,
    recommendations: d.recommendations
  }, null, 2);

  downloadFile(json, `cropsense_${d.crop.id}_${Date.now()}.json`, 'application/json');
  showToast('JSON downloaded!', 'success');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
