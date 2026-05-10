// ── Theme constants ────────────────────────────────────────────────────────────
const C = {
  accent:  '#60A5FA',
  blue:    '#93C5FD',
  red:     '#F87171',
  yellow:  '#FBBF24',
  slate:   '#64748B',
  light:   '#CBD5E1',
  grid:    'rgba(148,163,184,.1)',
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

// ── Dashboard 1: Finance & Trading Reconciliation ─────────────────────────────
function renderTrader() {
  const months  = ['Oct 23', 'Nov 23', 'Dec 23', 'Jan 24', 'Feb 24', 'Mar 24'];
  const finance = [695, 720, 675, 705, 730, 693];
  const trading = [624, 642, 616, 643, 699, 622];

  // Grouped bar: Finance vs Trading monthly revenue
  mk('ch-trader-hours', {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Finance Dept ($K)',
          data: finance,
          backgroundColor: 'rgba(96,165,250,.85)',
          borderRadius: 5,
          borderSkipped: false
        },
        {
          label: 'Trading Dept ($K)',
          data: trading,
          backgroundColor: 'rgba(251,191,36,.75)',
          borderRadius: 5,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: C.light, font: { family: C.font }, boxWidth: 14 } },
        tooltip: { ...tooltip, callbacks: { label: ctx => ` ${ctx.dataset.label}: $${ctx.parsed.y}K` } }
      },
      scales: {
        x: { grid: { color: C.grid }, ticks: { color: C.slate } },
        y: { grid: { color: C.grid }, ticks: { color: C.slate, callback: v => '$' + v + 'K' } }
      }
    }
  });

  // Horizontal bar: gap by root cause
  const causes = [
    ['Settlement Timing', '(T vs T+2)'],
    'Fee Classification',
    'FX Rate Snapshots',
    'Refund Treatment'
  ];
  const gaps = [142, 98, 76, 54];
  mk('ch-trader-assets', {
    type: 'bar',
    data: {
      labels: causes,
      datasets: [{
        label: 'Gap ($K)',
        data: gaps,
        backgroundColor: ['rgba(248,113,113,.85)', 'rgba(251,191,36,.8)', 'rgba(96,165,250,.7)', 'rgba(148,163,184,.55)'],
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: ctx => ` $${ctx.parsed.x}K` } } },
      scales: {
        x: { grid: { color: C.grid }, ticks: { color: C.slate, callback: v => '$' + v + 'K' } },
        y: { grid: { color: C.grid }, ticks: { color: C.light, font: { family: C.font, size: 11 } } }
      }
    }
  });

  // Line: gap % trend from discovery to resolution
  const trendMonths = ['Aug 23', 'Sep 23', 'Oct 23', 'Nov 23', 'Dec 23', 'Jan 24', 'Feb 24', 'Mar 24'];
  const gapPct      = [10.3, 10.8, 10.2, 9.8, 8.1, 5.7, 2.8, 1.1];
  mk('ch-trader-win', {
    type: 'line',
    data: {
      labels: trendMonths,
      datasets: [
        {
          label: 'Revenue Gap %',
          data: gapPct,
          borderColor: C.red,
          backgroundColor: 'rgba(248,113,113,.12)',
          fill: true, tension: 0.4,
          pointRadius: 4, pointBackgroundColor: gapPct.map((v, i) => i >= 5 ? '#34D399' : C.red),
          pointBorderColor: 'transparent'
        },
        {
          label: 'Target (0%)',
          data: Array(8).fill(0),
          borderColor: 'rgba(52,211,153,.35)',
          borderDash: [6, 4],
          borderWidth: 1.5,
          pointRadius: 0, fill: false, tension: 0
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: C.light, font: { family: C.font }, boxWidth: 14 } },
        tooltip: { ...tooltip, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` } }
      },
      scales: {
        x: { grid: { color: C.grid }, ticks: { color: C.slate } },
        y: {
          grid: { color: C.grid },
          ticks: { color: C.slate, callback: v => v + '%' },
          min: 0, suggestedMax: 12
        }
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

// ── Dashboard 4: Genie AI Chat ─────────────────────────────────────────────────
const genieResponses = {
  'top-stocks': {
    q: 'What were the top 10 stocks by trade volume yesterday?',
    html: `<p>Here are yesterday's top 10 most traded instruments on the platform:</p>
      <table>
        <thead><tr><th>#</th><th>Ticker</th><th>Trades</th><th>Share</th><th>1d Change</th></tr></thead>
        <tbody>
          <tr><td>1</td><td class="hl">NVDA</td><td>284,124</td><td>8.3%</td><td class="pos">+4.2%</td></tr>
          <tr><td>2</td><td class="hl">AAPL</td><td>231,870</td><td>6.8%</td><td class="pos">+1.1%</td></tr>
          <tr><td>3</td><td class="hl">TSLA</td><td>198,441</td><td>5.8%</td><td class="neg">−2.3%</td></tr>
          <tr><td>4</td><td class="hl">META</td><td>176,320</td><td>5.2%</td><td class="pos">+3.1%</td></tr>
          <tr><td>5</td><td class="hl">AMZN</td><td>154,890</td><td>4.5%</td><td class="pos">+0.8%</td></tr>
          <tr><td>6</td><td class="hl">MSFT</td><td>142,100</td><td>4.2%</td><td class="pos">+0.5%</td></tr>
          <tr><td>7</td><td class="hl">GOOGL</td><td>128,340</td><td>3.8%</td><td class="neg">−0.4%</td></tr>
          <tr><td>8</td><td class="hl">AMD</td><td>119,200</td><td>3.5%</td><td class="pos">+2.7%</td></tr>
          <tr><td>9</td><td class="hl">BTC/USD</td><td>108,760</td><td>3.2%</td><td class="pos">+1.9%</td></tr>
          <tr><td>10</td><td class="hl">SPY</td><td>97,430</td><td>2.9%</td><td class="pos">+0.3%</td></tr>
        </tbody>
      </table>
      <p style="margin-top:.55rem;font-size:.79rem;color:#64748B">Total platform trades yesterday: 3,415,824</p>`
  },
  'fees': {
    q: 'Where did we earn the most fees this week?',
    html: `<p>This week's fee revenue breakdown by asset class:</p>
      <div class="genie-kv">
        <div class="genie-kv-item"><div class="genie-kv-label">Crypto</div><div class="genie-kv-value pos">$184,320</div></div>
        <div class="genie-kv-item"><div class="genie-kv-label">Stocks</div><div class="genie-kv-value">$142,870</div></div>
        <div class="genie-kv-item"><div class="genie-kv-label">ETFs</div><div class="genie-kv-value">$67,410</div></div>
        <div class="genie-kv-item"><div class="genie-kv-label">Commodities</div><div class="genie-kv-value warn">$38,920</div></div>
      </div>
      <p style="margin-top:.65rem"><strong>Top earner:</strong> BTC/USD spread — $52,140 (28% of crypto fees). Volumes spiked Mon–Tue on ETF news, driving an extra <strong>$31K</strong> vs the prior week.</p>`
  },
  'latency': {
    q: 'What was average order execution latency yesterday?',
    html: `<p>Yesterday's order execution latency report:</p>
      <div class="genie-kv">
        <div class="genie-kv-item"><div class="genie-kv-label">Avg Latency</div><div class="genie-kv-value pos">38ms</div></div>
        <div class="genie-kv-item"><div class="genie-kv-label">P99 Latency</div><div class="genie-kv-value warn">142ms</div></div>
        <div class="genie-kv-item"><div class="genie-kv-label">Peak Hour</div><div class="genie-kv-value">9:30am EST</div></div>
        <div class="genie-kv-item"><div class="genie-kv-label">vs Prior Day</div><div class="genie-kv-value pos">−4ms</div></div>
      </div>
      <p style="margin-top:.65rem">Spike to <strong style="color:#FBBF24">214ms</strong> at 9:31am EST — market open surge (47K concurrent orders). Resolved in 90s. All executions completed within SLA.</p>`
  },
  'risk': {
    q: 'Show me clients with large withdrawals in the last 5 days',
    html: `<p>5-day risk scan — clients flagged for large withdrawals after negative P&amp;L:</p>
      <table>
        <thead><tr><th>Client ID</th><th>5d P&amp;L</th><th>Withdrawal</th><th>Signal</th></tr></thead>
        <tbody>
          <tr><td class="hl">USR-8841</td><td class="neg">−$18,420</td><td>$22,000</td><td class="neg">⚠ High</td></tr>
          <tr><td class="hl">USR-3392</td><td class="neg">−$9,870</td><td>$15,000</td><td class="neg">⚠ High</td></tr>
          <tr><td class="hl">USR-6107</td><td class="neg">−$4,210</td><td>$8,500</td><td style="color:#FBBF24">~ Medium</td></tr>
          <tr><td class="hl">USR-2954</td><td class="neg">−$2,100</td><td>$5,000</td><td style="color:#FBBF24">~ Medium</td></tr>
          <tr><td class="hl">USR-9013</td><td class="neg">−$1,450</td><td>$3,200</td><td>Monitor</td></tr>
        </tbody>
      </table>
      <p style="margin-top:.55rem;font-size:.79rem;color:#64748B">Recommendation: flag USR-8841 and USR-3392 for retention team outreach.</p>`
  },
  'hours': {
    q: 'Compare pre-market vs regular hours fee rates',
    html: `<p>Fee rate structure by trading session (dealing room config):</p>
      <table>
        <thead><tr><th>Session</th><th>Hours (EST)</th><th>Spread</th><th>Volume %</th><th>Revenue %</th></tr></thead>
        <tbody>
          <tr><td class="hl">Pre-market</td><td>4:00 – 9:30</td><td style="color:#FBBF24">1.5×</td><td>12%</td><td class="pos">21%</td></tr>
          <tr><td class="hl">Regular</td><td>9:30 – 16:00</td><td class="pos">1.0×</td><td>71%</td><td>64%</td></tr>
          <tr><td class="hl">After-hours</td><td>16:00 – 20:00</td><td style="color:#FBBF24">1.5×</td><td>17%</td><td class="pos">15%</td></tr>
        </tbody>
      </table>
      <p style="margin-top:.65rem">Pre/after-market carry a <strong>1.5× spread multiplier</strong> for lower liquidity. Despite 29% of volume, extended sessions generate <strong>36% of spread revenue</strong>.</p>`
  }
};

function renderAI() {
  const chat = document.getElementById('genie-chat');
  if (!chat) return;

  chat.innerHTML = `
    <div class="genie-msg genie-ai">
      <div class="genie-avatar">G</div>
      <div class="genie-bubble">
        <p>Hi! I'm <strong>Genie</strong>, the AI business analyst trained on eToro's trading data. I know the table structures, fee rules, KPI definitions, and business logic of the dealing room.</p>
        <p>Click a question below to see how management used me every day.</p>
      </div>
    </div>`;

  document.querySelectorAll('.genie-btn').forEach(btn => {
    btn.disabled = false;
    btn.addEventListener('click', () => askGenie(btn.dataset.q));
  });
}

function askGenie(qKey) {
  const resp = genieResponses[qKey];
  if (!resp) return;
  const chat = document.getElementById('genie-chat');
  if (!chat) return;

  document.querySelectorAll('.genie-btn').forEach(b => b.disabled = true);

  chat.insertAdjacentHTML('beforeend', `
    <div class="genie-msg genie-user">
      <div class="genie-avatar user-av">Me</div>
      <div class="genie-bubble">${resp.q}</div>
    </div>`);

  const thinkId = 'gt' + Date.now();
  chat.insertAdjacentHTML('beforeend', `
    <div class="genie-msg genie-ai" id="${thinkId}">
      <div class="genie-avatar">G</div>
      <div class="genie-thinking">
        <div class="genie-dot"></div><div class="genie-dot"></div><div class="genie-dot"></div>
      </div>
    </div>`);
  chat.scrollTop = chat.scrollHeight;

  setTimeout(() => {
    const el = document.getElementById(thinkId);
    if (el) el.remove();
    chat.insertAdjacentHTML('beforeend', `
      <div class="genie-msg genie-ai">
        <div class="genie-avatar">G</div>
        <div class="genie-bubble">${resp.html}</div>
      </div>`);
    chat.scrollTop = chat.scrollHeight;
    document.querySelectorAll('.genie-btn').forEach(b => b.disabled = false);
  }, 1500);
}
