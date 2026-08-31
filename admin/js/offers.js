/**
 * Harvest Kitchen - Admin Flash Sales Controller
 */

const API_BASE = 'http://localhost:8080/api';
let offersList = [];

document.addEventListener('DOMContentLoaded', () => {
  loadOffers();
  setupOfferForm();
});

async function loadOffers() {
  const cardsGrid = document.getElementById('offersCardsGrid');
  const tbody = document.getElementById('offersTableBody');

  try {
    const res = await fetch(`${API_BASE}/offers`);
    if (!res.ok) throw new Error('Could not load flash offers from server');
    offersList = await res.json();

    updateOfferMetrics(offersList);
    renderOfferCards(offersList, cardsGrid);
    renderOfferTable(offersList, tbody);
  } catch (err) {
    console.error('Failed to load offers:', err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="color: #dc2626; text-align: center; padding: 20px;">Error: ${err.message}</td></tr>`;
    showToast('Failed to load flash offers: ' + err.message, true);
  }
}

function updateOfferMetrics(offers) {
  const totalEl = document.getElementById('statTotalOffers');
  const liveEl = document.getElementById('statLiveOffers');
  const maxEl = document.getElementById('statMaxOfferDiscount');
  const schedEl = document.getElementById('statScheduledOffers');

  if (totalEl) totalEl.textContent = offers.length;

  const liveCount = offers.filter(o => o.isCurrentlyActive).length;
  if (liveEl) liveEl.textContent = liveCount;

  let maxDisc = 0;
  offers.forEach(o => {
    if (o.discountPercent && o.discountPercent > maxDisc) maxDisc = o.discountPercent;
  });
  if (maxEl) maxEl.textContent = maxDisc > 0 ? `${maxDisc}% OFF` : '15% OFF';

  const scheduledCount = offers.filter(o => o.active && !o.isCurrentlyActive).length;
  if (schedEl) schedEl.textContent = scheduledCount;
}

function renderOfferCards(offers, container) {
  if (!container) return;

  if (offers.length === 0) {
    container.innerHTML = '<div style="grid-column: 1 / -1; padding: 30px; text-align: center; color: #64748b; background: #fff; border-radius: 12px; border: 1px dashed var(--border);">No flash sales created yet. Click "+ Create New Flash Sale" to start.</div>';
    return;
  }

  container.innerHTML = offers.map(o => {
    const isLive = Boolean(o.isCurrentlyActive);
    const timeFormatted = formatTimeWindow(o.startTime, o.endTime);
    const daysFormatted = formatDays(o.daysOfWeek);

    return `
      <div class="offer-card ${isLive ? 'live-card' : ''}">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <span class="offer-discount-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: -2px; margin-right: 2px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              ${o.discountPercent || 0}% OFF
            </span>
            ${isLive 
              ? '<span class="live-pulse-badge"><span class="live-pulse-dot"></span> LIVE NOW</span>' 
              : (o.active 
                  ? '<span class="badge" style="background: #eff6ff; color: #2563eb; font-weight: 800; font-size: 0.76rem; display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> SCHEDULED</span>'
                  : '<span class="badge" style="background: #fee2e2; color: #dc2626; font-weight: 800; font-size: 0.76rem; display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> DISABLED</span>'
                )
            }
          </div>

          <h3 style="font-size: 1.1rem; font-weight: 800; color: #181615; margin: 0 0 6px 0;">${escapeHtml(o.title)}</h3>
          <p style="font-size: 0.84rem; color: #64748b; margin-bottom: 14px; line-height: 1.4;">
            ${escapeHtml(o.description || 'Exclusive time-based dining discount')}
          </p>

          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.83rem; color: #475569; margin-bottom: 10px;">
            <div>
              <span class="time-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${timeFormatted}
              </span>
            </div>
            <div>
              <span class="day-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${daysFormatted}
              </span>
            </div>
          </div>
        </div>

        <div class="offer-card-footer">
          <button type="button" onclick="editOffer(${o.id})" class="btn btn-secondary btn-sm" style="padding: 5px 12px; font-size: 0.82rem;">
            Edit
          </button>
          <div style="display: flex; gap: 8px;">
            <button type="button" onclick="toggleOfferActive(${o.id})" class="btn btn-secondary btn-sm" style="padding: 5px 12px; font-size: 0.82rem;">
              ${o.active ? 'Disable' : 'Enable'}
            </button>
            <button type="button" onclick="deleteOffer(${o.id})" class="btn btn-danger btn-sm" style="padding: 5px 10px; font-size: 0.82rem;">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderOfferTable(offers, tbody) {
  if (!tbody) return;

  if (offers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No flash sales created yet.</td></tr>';
    return;
  }

  tbody.innerHTML = offers.map(o => {
    const isLive = Boolean(o.isCurrentlyActive);
    const timeFormatted = formatTimeWindow(o.startTime, o.endTime);
    const daysFormatted = formatDays(o.daysOfWeek);

    return `
      <tr>
        <td>
          <strong style="color: #181615; font-size: 0.95rem;">${escapeHtml(o.title)}</strong>
          <div style="font-size: 0.8rem; color: #64748b; margin-top: 3px;">${escapeHtml(o.description || '')}</div>
        </td>
        <td>
          <span style="background: #fef2f2; color: #df1f26; font-weight: 800; padding: 4px 8px; border-radius: 6px; border: 1px solid #fecaca; font-size: 0.92rem; display: inline-flex; align-items: center; gap: 4px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            ${o.discountPercent || 0}% OFF
          </span>
        </td>
        <td>
          <span class="time-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${timeFormatted}
          </span>
        </td>
        <td>
          <span class="day-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${daysFormatted}
          </span>
        </td>
        <td>
          ${isLive 
            ? '<span class="live-pulse-badge"><span class="live-pulse-dot"></span> LIVE NOW</span>' 
            : (o.active 
                ? '<span class="badge" style="background: #eff6ff; color: #2563eb; font-weight: 800; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> SCHEDULED</span>'
                : '<span class="badge" style="background: #fee2e2; color: #dc2626; font-weight: 800; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> DISABLED</span>'
              )
          }
        </td>
        <td style="text-align: right;">
          <div class="action-btn-group" style="justify-content: flex-end;">
            <button type="button" onclick="editOffer(${o.id})" class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 0.8rem;">
              Edit
            </button>
            <button type="button" onclick="toggleOfferActive(${o.id})" class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 0.8rem;">
              ${o.active ? 'Disable' : 'Enable'}
            </button>
            <button type="button" onclick="deleteOffer(${o.id})" class="btn btn-danger btn-sm" style="padding: 4px 8px; font-size: 0.8rem;">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function formatTimeWindow(start, end) {
  if (!start && !end) return 'All Day';
  return `${format12Hour(start)} – ${format12Hour(end)}`;
}

function format12Hour(timeStr) {
  if (!timeStr) return '';
  const parts = String(timeStr).split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const formattedHours = hours < 10 ? '0' + hours : hours;
  return `${formattedHours}:${minutes} ${ampm}`;
}

function formatDays(daysStr) {
  if (!daysStr || daysStr.toUpperCase() === 'ALL') return 'Daily (Mon – Sun)';
  if (daysStr === 'SAT,SUN') return 'Weekends (Sat, Sun)';
  if (daysStr === 'MON,TUE,WED,THU,FRI') return 'Weekdays (Mon – Fri)';
  return daysStr;
}

function applyDaysPreset() {
  const preset = document.getElementById('offerDaysPreset').value;
  const input = document.getElementById('offerDaysOfWeek');
  if (preset !== 'CUSTOM') {
    input.value = preset;
  }
}

function openOfferModal() {
  const form = document.getElementById('offerForm');
  if (form) form.reset();

  document.getElementById('offerId').value = '';
  document.getElementById('offerModalTitle').textContent = 'Create Flash Sale';
  document.getElementById('offerStartTime').value = '12:00';
  document.getElementById('offerEndTime').value = '15:00';
  document.getElementById('offerDaysPreset').value = 'ALL';
  document.getElementById('offerDaysOfWeek').value = 'ALL';
  document.getElementById('offerActive').checked = true;
  
  const modal = document.getElementById('offerModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
}

function closeOfferModal() {
  const modal = document.getElementById('offerModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

function editOffer(id) {
  const offer = offersList.find(o => o.id == id);
  if (!offer) {
    showToast('Could not find offer #' + id, true);
    return;
  }

  document.getElementById('offerId').value = offer.id;
  document.getElementById('offerTitle').value = offer.title || '';
  document.getElementById('offerDesc').value = offer.description || '';
  document.getElementById('offerDiscountPercent').value = offer.discountPercent || '';
  
  // Format times for HTML5 time inputs (HH:MM)
  if (offer.startTime) {
    document.getElementById('offerStartTime').value = String(offer.startTime).substring(0, 5);
  } else {
    document.getElementById('offerStartTime').value = '12:00';
  }

  if (offer.endTime) {
    document.getElementById('offerEndTime').value = String(offer.endTime).substring(0, 5);
  } else {
    document.getElementById('offerEndTime').value = '15:00';
  }

  const days = offer.daysOfWeek || 'ALL';
  document.getElementById('offerDaysOfWeek').value = days;
  const presetSel = document.getElementById('offerDaysPreset');
  if (['ALL', 'SAT,SUN', 'MON,TUE,WED,THU,FRI'].includes(days)) {
    presetSel.value = days;
  } else {
    presetSel.value = 'CUSTOM';
  }

  document.getElementById('offerActive').checked = Boolean(offer.active);
  document.getElementById('offerModalTitle').textContent = `Edit Flash Sale (${offer.title})`;
  
  const modal = document.getElementById('offerModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
}

function setupOfferForm() {
  const form = document.getElementById('offerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('offerId').value;
    const title = document.getElementById('offerTitle').value.trim();
    const description = document.getElementById('offerDesc').value.trim();
    const discountPercent = parseFloat(document.getElementById('offerDiscountPercent').value);
    
    let startTime = document.getElementById('offerStartTime').value || '00:00';
    let endTime = document.getElementById('offerEndTime').value || '23:59';
    
    // Ensure seconds format (HH:MM:SS) for Jackson LocalTime parsing
    if (startTime.length === 5) startTime += ':00';
    if (endTime.length === 5) endTime += ':00';

    const daysOfWeek = document.getElementById('offerDaysOfWeek').value.trim().toUpperCase() || 'ALL';
    const active = document.getElementById('offerActive').checked;

    if (!title) {
      showToast('Please enter an offer title', true);
      return;
    }

    if (isNaN(discountPercent) || discountPercent <= 0) {
      showToast('Please enter a valid discount percentage', true);
      return;
    }

    const payload = {
      title,
      description,
      discountPercent,
      startTime,
      endTime,
      daysOfWeek,
      active
    };

    try {
      let url = `${API_BASE}/offers`;
      let method = 'POST';

      if (id && String(id).trim() !== '') {
        url = `${API_BASE}/offers/${id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save flash sale offer');
      }

      closeOfferModal();
      showToast(id ? '✓ Flash sale updated successfully!' : '✓ New flash sale created & activated!');
      loadOffers();
    } catch (err) {
      showToast('Error: ' + err.message, true);
    }
  });
}

async function toggleOfferActive(offerId) {
  try {
    const res = await fetch(`${API_BASE}/offers/${offerId}/toggle`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to toggle offer status');
    showToast('✓ Flash sale status updated');
    loadOffers();
  } catch (err) {
    showToast('Error: ' + err.message, true);
  }
}

async function deleteOffer(offerId) {
  if (!confirm('Are you sure you want to delete this flash sale offer?')) return;
  try {
    const res = await fetch(`${API_BASE}/offers/${offerId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete flash sale offer');
    showToast('✓ Flash sale deleted');
    loadOffers();
  } catch (err) {
    showToast('Error: ' + err.message, true);
  }
}

function showToast(msg, isError = false) {
  let toast = document.getElementById('adminToast');
  let msgEl = document.getElementById('adminToastMsg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.background = '#181615';
    toast.style.color = '#fff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '999999';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    toast.style.fontWeight = '600';
    toast.style.fontSize = '0.9rem';
    document.body.appendChild(toast);
    msgEl = toast;
  }

  msgEl.textContent = msg;
  toast.style.background = isError ? '#dc2626' : '#181615';
  toast.style.display = 'flex';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Attach functions to window to ensure HTML onclick handlers always work reliably
window.openOfferModal = openOfferModal;
window.closeOfferModal = closeOfferModal;
window.editOffer = editOffer;
window.toggleOfferActive = toggleOfferActive;
window.deleteOffer = deleteOffer;
window.applyDaysPreset = applyDaysPreset;
window.showToast = showToast;
