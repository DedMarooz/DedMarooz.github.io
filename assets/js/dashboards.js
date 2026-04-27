// ── Theme constants ────────────────────────────────────────────────────────────
const C = {
  accent:  '#64ffda',
  blue:    '#4dc3ff',
  red:     '#ff6b6b',
  yellow:  '#ffd93d',
  slate:   '#8892b0',
  light:   '#ccd6f6',
  grid:    'rgba(204,214,246,.07)',
  font:    "'Inter', sans-serif",
  mono:    "'Fira Code', monospace"
};

const tooltip = {
  backgroundColor: '#0a192f',
  borderColor: C.accent,
  borderWidth: 1,
  titleColor: C.light,
  bodyColor: C.slate,
  padding: 10,
  cornerRadius: 6
};

const axes = (yCallback) => ({
  x: { grid: { color: C.grid }, ticks: { color: C.slate, font: { family: C.font, size: 11 } } },
  y: { grid: { color: C.grid }, ticks: { color: C.slate, font: { family: C.font, size: 11 }, callback: yCallback || (v => v) } }
});

// Chart registry — destroy before re-rendering
const registry = {};
function mk(id, config) {
  if (registry[id]) { registry[id].destroy(); }
  const ctx = document.getElementById(id);
  if (!ctx) return;
  registry[id] = new Chart(ctx, config);
}

// ── Modal system ───────────────────────────────────────────────────────────────
document.querySelectorAll('[data-modal]').forEach(btn =>
  btn.addEventListener('click', () => open(btn.dataset.modal))
);
document.querySelectorAll('[data-close]').forEach(el =>
  el.addEventListener('click', () => close(el.dataset.close))
);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape')
    document.querySelectorAll('.db-modal.open').forEach(m => close(m.id));
});

function open(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Render charts after modal is visible so canvas has dimensions
  requestAnimationFrame(() => render(id));
}
function close(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
}

function render(id) {
  if (id === 'modal-trader')    renderTrader();
  if (id === 'modal-market')    renderMarket();
  if (id === 'modal-commodity') renderCommodity();
  if (id === 'modal-ai')        renderAI();
}

// ── Dashboard 1: Trader Behavior ───────────────────────────────────────────────
function renderTrader() {
  // Bar: trades by hour
  const hours  = ['9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm'];
  const trades = [2840, 3920, 2640, 1820, 1650, 2100, 3710, 2950, 890, 650, 540, 480, 320];
  mk('ch-trader-hours', {
    type: 'bar',
    data: {
      labels: hours,
      datasets: [{
        label: 'Number of Trades',
        data: trades,
        backgroundColor: trades.map(v => v > 3000 ? C.accent : 'rgba(100,255,218,.3)'),
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip },
      scales: axes()
    }
  });

  // Doughnut: asset preference
  mk('ch-trader-assets', {
    type: 'doughnut',
    data: {
      labels: ['Crypto 42%', 'Stocks 38%', 'ETFs 20%'],
      datasets: [{
        data: [42, 38, 20],
        backgroundColor: [C.accent, C.blue, C.yellow],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { color: C.light, padding: 14, font: { family: C.font, size: 12 }, boxWidth: 12 } },
        tooltip
      }
    }
  });

  // Horizontal bar: win rate by asset
  mk('ch-trader-win', {
    type: 'bar',
    data: {
      labels: ['Crypto', 'Stocks', 'ETFs'],
      datasets: [{
        label: 'Win Rate %',
        data: [38.4, 44.1, 51.8],
        backgroundColor: [C.red, C.blue, C.accent],
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip },
      scales: {
        x: { grid: { color: C.grid }, ticks: { color: C.slate, callback: v => v + '%' } },
        y: { grid: { color: C.grid }, ticks: { color: C.light, font: { family: C.font, size: 12 } } }
      }
    }
  });
}

// ── Dashboard 2: Market Briefing ───────────────────────────────────────────────
function renderMarket() {
  // Line: futures vs fair value
  const times   = ['12am','1am','2am','3am','4am','5am','6am','7am','8am','8:30','9am','9:30am'];
  const futures  = [5820, 5815, 5812, 5808, 5811, 5819, 5828, 5835, 5841, 5845, 5843, 5847];
  const fairVal  = Array(12).fill(5830);
  mk('ch-market-futures', {
    type: 'line',
    data: {
      labels: times,
      datasets: [
        {
          label: 'S&P 500 Futures',
          data: futures,
          borderColor: C.accent,
          backgroundColor: 'rgba(100,255,218,.09)',
          fill: true, tension: 0.4,
          pointRadius: 3, pointBackgroundColor: C.accent
        },
        {
          label: 'Fair Value',
          data: fairVal,
          borderColor: C.yellow,
          borderDash: [6, 4],
          borderWidth: 1.5,
          pointRadius: 0, fill: false, tension: 0
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: C.light, font: { family: C.font } } }, tooltip },
      scales: axes()
    }
  });

  // Horizontal bar: top movers (gainers green, losers red)
  const tickers = ['NVDA +4.2%', 'META +3.1%', 'AMZN +2.8%', 'BA -2.4%', 'DIS -1.7%', 'CVS -1.3%'];
  const changes = [4.2, 3.1, 2.8, -2.4, -1.7, -1.3];
  mk('ch-market-movers', {
    type: 'bar',
    data: {
      labels: tickers,
      datasets: [{
        label: 'Pre-market Change %',
        data: changes,
        backgroundColor: changes.map(v => v >= 0 ? 'rgba(100,255,218,.75)' : 'rgba(255,107,107,.75)'),
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip },
      scales: {
        x: { grid: { color: C.grid }, ticks: { color: C.slate, callback: v => v + '%' } },
        y: { grid: { color: C.grid }, ticks: { color: C.light, font: { family: C.font, size: 11 } } }
      }
    }
  });

  // Bar: sector performance
  const sectors = ['Tech', 'Energy', 'Fins', 'Consumer', 'Health', 'Utilities', 'RE'];
  const sPerf   = [1.2, 0.8, 0.3, -0.2, -0.4, -0.6, -0.9];
  mk('ch-market-sectors', {
    type: 'bar',
    data: {
      labels: sectors,
      datasets: [{
        label: '% Change',
        data: sPerf,
        backgroundColor: sPerf.map(v => v >= 0 ? 'rgba(100,255,218,.7)' : 'rgba(255,107,107,.7)'),
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip },
      scales: {
        x: { grid: { color: C.grid }, ticks: { color: C.slate } },
        y: { grid: { color: C.grid }, ticks: { color: C.slate, callback: v => v + '%' } }
      }
    }
  });
}

// ── Dashboard 3: Commodity ─────────────────────────────────────────────────────
function renderCommodity() {
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date('2024-09-01');
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const natGas = [2.84,2.79,2.83,2.91,2.88,2.95,3.02,2.97,2.89,2.84,2.78,2.73,2.76,2.82,2.88,2.93,2.98,2.94,2.87,2.81,2.75,2.79,2.84,2.88,2.91,2.86,2.82,2.78,2.75,2.72];
  const wti    = [78.42,77.89,78.12,79.34,80.12,79.87,80.45,81.23,80.89,79.45,78.23,77.89,78.45,79.12,79.89,80.23,79.78,78.45,77.92,78.34,79.12,79.56,78.89,77.45,76.89,77.23,78.12,79.34,78.89,78.43];

  const lineOpts = (color, label) => ({
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label,
        data: color === C.blue ? natGas : wti,
        borderColor: color,
        backgroundColor: color === C.blue ? 'rgba(77,195,255,.08)' : 'rgba(255,217,61,.08)',
        fill: true, tension: 0.4,
        pointRadius: 0, pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip },
      scales: {
        x: { grid: { color: C.grid }, ticks: { color: C.slate, maxTicksLimit: 6 } },
        y: { grid: { color: C.grid }, ticks: { color: C.slate, callback: v => '$' + v } }
      }
    }
  });

  mk('ch-natgas', lineOpts(C.blue,   'NatGas $/MMBtu'));
  mk('ch-oil',    lineOpts(C.yellow, 'WTI $/bbl'));

  // Grouped bar: week-over-week change
  const weeks  = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const gasWow = [1.2, -2.1, 0.8, -3.1];
  const oilWow = [-0.8, 1.4, -0.3, -0.9];
  mk('ch-commodity-wow', {
    type: 'bar',
    data: {
      labels: weeks,
      datasets: [
        {
          label: 'Natural Gas',
          data: gasWow,
          backgroundColor: gasWow.map(v => v >= 0 ? 'rgba(77,195,255,.8)' : 'rgba(77,195,255,.3)'),
          borderRadius: 4, borderSkipped: false
        },
        {
          label: 'WTI Oil',
          data: oilWow,
          backgroundColor: oilWow.map(v => v >= 0 ? 'rgba(255,217,61,.8)' : 'rgba(255,217,61,.3)'),
          borderRadius: 4, borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: C.light, font: { family: C.font } } }, tooltip },
      scales: {
        x: { grid: { color: C.grid }, ticks: { color: C.slate } },
        y: { grid: { color: C.grid }, ticks: { color: C.slate, callback: v => v + '%' } }
      }
    }
  });
}

// ── Dashboard 4: AI Research Assistant ────────────────────────────────────────
function renderAI() {
  // Line: AAPL 90-day price
  const aaplDays = Array.from({ length: 90 }, (_, i) => {
    const d = new Date('2024-07-01');
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  const aapl = [182,183,181,184,186,185,183,182,184,187,189,188,186,185,184,186,188,190,189,187,186,188,191,193,192,190,189,191,193,195,194,192,191,190,192,194,196,195,193,192,191,190,188,187,186,188,190,189,188,186,185,184,183,182,184,186,188,187,186,185,184,186,188,190,191,190,188,187,188,190,191,192,191,190,189,188,189,190,191,193,192,191,190,189,188,189,190,191,192,189];
  mk('ch-ai-price', {
    type: 'line',
    data: {
      labels: aaplDays,
      datasets: [{
        label: 'AAPL ($)',
        data: aapl,
        borderColor: C.accent,
        backgroundColor: 'rgba(100,255,218,.07)',
        fill: true, tension: 0.3,
        pointRadius: 0, pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip },
      scales: {
        x: { grid: { color: C.grid }, ticks: { color: C.slate, maxTicksLimit: 8 } },
        y: { grid: { color: C.grid }, ticks: { color: C.slate, callback: v => '$' + v } }
      }
    }
  });

  // Bar: quarterly revenue
  mk('ch-ai-revenue', {
    type: 'bar',
    data: {
      labels: ['Q1 23', 'Q2 23', 'Q3 23', 'Q4 23', 'Q1 24', 'Q2 24'],
      datasets: [{
        label: 'Revenue ($B)',
        data: [117.2, 94.8, 81.8, 119.6, 90.8, 85.8],
        backgroundColor: [
          'rgba(100,255,218,.4)','rgba(100,255,218,.4)','rgba(100,255,218,.4)',
          'rgba(100,255,218,.4)','rgba(100,255,218,.9)','rgba(100,255,218,.9)'
        ],
        borderRadius: 5, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip },
      scales: {
        x: { grid: { color: C.grid }, ticks: { color: C.slate } },
        y: { grid: { color: C.grid }, ticks: { color: C.slate, callback: v => '$' + v + 'B' } }
      }
    }
  });
}
