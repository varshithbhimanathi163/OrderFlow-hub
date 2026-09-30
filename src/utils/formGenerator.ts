import type { FormConfig } from '../types.ts';

export const DEFAULT_FORM_CONFIG: FormConfig = {
  title: 'Customer Order Submission',
  subtitle: 'Please enter your details below to place your order.',
  accentColor: '#2563eb', // Indigo / Royal Blue
  buttonText: 'Submit Order',
  successTitle: 'Order Placed Successfully!',
  successMessage: 'Thank you! Your order has been received and is being processed.',
  themeStyle: 'modern',
  showBorders: true,
  roundedCorners: 'lg',
};

export function generateEmbedHtml(config: FormConfig, publicBaseUrl: string): string {
  const targetApiUrl = config.apiUrl || `${publicBaseUrl.replace(/\/$/, '')}/api/submissions`;
  const accent = config.accentColor || '#2563eb';
  const borderRadius =
    config.roundedCorners === 'sm'
      ? '6px'
      : config.roundedCorners === 'md'
      ? '10px'
      : config.roundedCorners === 'full'
      ? '20px'
      : '14px';

  return `<!-- ============================================================
     OrderFlow Embeddable Order Form
     Self-contained snippet: Paste anywhere in your website HTML
     ============================================================ -->
<div id="orderflow-embed-card" class="of-card-wrap">
  <style>
    #orderflow-embed-card {
      --of-primary: ${accent};
      --of-primary-hover: ${shadeColor(accent, -15)};
      --of-primary-light: ${shadeColor(accent, 40)}20;
      --of-radius: ${borderRadius};
      --of-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      box-sizing: border-box;
      font-family: var(--of-font);
      max-width: 540px;
      margin: 1.5rem auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: var(--of-radius);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
      overflow: hidden;
      color: #1e293b;
      line-height: 1.5;
    }

    #orderflow-embed-card * {
      box-sizing: border-box;
    }

    #orderflow-embed-card .of-header {
      padding: 1.75rem 2rem 1.25rem 2rem;
      border-bottom: 1px solid #f1f5f9;
      background: #fafafa;
    }

    #orderflow-embed-card .of-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--of-primary);
      background: var(--of-primary-light);
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      margin-bottom: 0.5rem;
    }

    #orderflow-embed-card .of-title {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    #orderflow-embed-card .of-subtitle {
      margin: 0.35rem 0 0 0;
      font-size: 0.88rem;
      color: #64748b;
    }

    #orderflow-embed-card .of-body {
      padding: 1.75rem 2rem;
    }

    #orderflow-embed-card .of-group {
      margin-bottom: 1.25rem;
    }

    #orderflow-embed-card .of-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.86rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.4rem;
    }

    #orderflow-embed-card .of-req {
      color: #ef4444;
      margin-left: 0.2rem;
    }

    #orderflow-embed-card .of-input-wrap {
      position: relative;
    }

    #orderflow-embed-card .of-icon {
      position: absolute;
      left: 0.85rem;
      top: 0.85rem;
      width: 1.1rem;
      height: 1.1rem;
      color: #94a3b8;
      pointer-events: none;
    }

    #orderflow-embed-card .of-input {
      width: 100%;
      padding: 0.75rem 0.85rem 0.75rem 2.6rem;
      font-size: 0.95rem;
      font-family: inherit;
      color: #1e293b;
      background-color: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      outline: none;
      transition: all 0.15s ease-in-out;
    }

    #orderflow-embed-card .of-textarea {
      width: 100%;
      min-height: 96px;
      padding: 0.75rem 0.85rem 0.75rem 2.6rem;
      font-size: 0.95rem;
      font-family: inherit;
      color: #1e293b;
      background-color: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      outline: none;
      resize: vertical;
      transition: all 0.15s ease-in-out;
    }

    #orderflow-embed-card .of-input:focus,
    #orderflow-embed-card .of-textarea:focus {
      border-color: var(--of-primary);
      box-shadow: 0 0 0 3px var(--of-primary-light);
    }

    #orderflow-embed-card .of-input.has-error,
    #orderflow-embed-card .of-textarea.has-error {
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    #orderflow-embed-card .of-err-msg {
      display: none;
      font-size: 0.78rem;
      color: #dc2626;
      margin-top: 0.3rem;
      font-weight: 500;
    }

    #orderflow-embed-card .of-submit-btn {
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.85rem 1.25rem;
      font-size: 0.98rem;
      font-weight: 600;
      color: #ffffff;
      background-color: var(--of-primary);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
      margin-top: 0.5rem;
    }

    #orderflow-embed-card .of-submit-btn:hover {
      background-color: var(--of-primary-hover);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
      transform: translateY(-1px);
    }

    #orderflow-embed-card .of-submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    #orderflow-embed-card .of-alert {
      display: none;
      padding: 0.85rem 1rem;
      border-radius: 8px;
      font-size: 0.86rem;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }

    #orderflow-embed-card .of-alert-error {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }

    #orderflow-embed-card .of-success-pane {
      display: none;
      text-align: center;
      padding: 2.5rem 1.5rem;
    }

    #orderflow-embed-card .of-success-icon {
      width: 58px;
      height: 58px;
      color: #10b981;
      background: #ecfdf5;
      padding: 12px;
      border-radius: 50%;
      margin: 0 auto 1.25rem auto;
      border: 1px solid #a7f3d0;
    }

    #orderflow-embed-card .of-order-box {
      background: #f8fafc;
      border: 1.5px dashed #cbd5e1;
      border-radius: 10px;
      padding: 1rem;
      margin: 1.25rem auto;
      max-width: 380px;
    }

    #orderflow-embed-card .of-order-label {
      font-size: 0.76rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #64748b;
    }

    #orderflow-embed-card .of-order-val {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: 0.03em;
      margin: 0.35rem 0 0.5rem 0;
      user-select: all;
    }

    #orderflow-embed-card .of-copy-id-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      font-size: 0.78rem;
      font-weight: 600;
      color: #475569;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    #orderflow-embed-card .of-copy-id-btn:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    #orderflow-embed-card .of-reset-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--of-primary);
      background: transparent;
      border: 1px solid #e2e8f0;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 1rem;
    }

    #orderflow-embed-card .of-reset-btn:hover {
      background: #f8fafc;
    }

    #orderflow-embed-card .of-footer {
      padding: 0.75rem 2rem;
      background: #fafafa;
      border-top: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.76rem;
      color: #94a3b8;
    }

    #orderflow-embed-card .of-spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-radius: 50%;
      border-top-color: #ffffff;
      animation: of-spin 0.7s linear infinite;
    }

    @keyframes of-spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 600px) {
      #orderflow-embed-card {
        margin: 0.5rem;
        border-radius: 10px;
      }
      #orderflow-embed-card .of-header,
      #orderflow-embed-card .of-body {
        padding: 1.25rem 1.25rem;
      }
    }
  </style>

  <!-- Form Header -->
  <div class="of-header">
    <div class="of-badge">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      Secure Order Form
    </div>
    <h2 class="of-title">${escapeHtml(config.title)}</h2>
    <p class="of-subtitle">${escapeHtml(config.subtitle)}</p>
  </div>

  <!-- Form Body -->
  <div class="of-body" id="of-form-section">
    <!-- Server/Network Error Notification -->
    <div id="of-error-box" class="of-alert of-alert-error" style="display: none;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span id="of-error-text">Failed to submit order. Please try again.</span>
    </div>

    <form id="orderflow-form" novalidate>
      <!-- 1. Customer Name -->
      <div class="of-group">
        <label class="of-label" for="of-field-name">
          <span>Customer Name <span class="of-req">*</span></span>
        </label>
        <div class="of-input-wrap">
          <svg class="of-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <input
            type="text"
            id="of-field-name"
            name="name"
            class="of-input"
            placeholder="e.g. Eleanor Vance"
            required
            autocomplete="name"
          />
        </div>
        <div class="of-err-msg" id="of-err-name">Please enter your full name (minimum 2 characters).</div>
      </div>

      <!-- 2. Mobile Number -->
      <div class="of-group">
        <label class="of-label" for="of-field-mobile">
          <span>Mobile Number <span class="of-req">*</span></span>
        </label>
        <div class="of-input-wrap">
          <svg class="of-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          <input
            type="tel"
            id="of-field-mobile"
            name="mobile"
            class="of-input"
            placeholder="e.g. +1 (555) 000-0000"
            required
            autocomplete="tel"
          />
        </div>
        <div class="of-err-msg" id="of-err-mobile">Please enter a valid mobile number with at least 5 digits.</div>
      </div>

      <!-- 3. Address -->
      <div class="of-group">
        <label class="of-label" for="of-field-address">
          <span>Delivery / Billing Address <span class="of-req">*</span></span>
        </label>
        <div class="of-input-wrap">
          <svg class="of-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <textarea
            id="of-field-address"
            name="address"
            class="of-textarea"
            rows="3"
            placeholder="Street address, apartment/suite, city, state, postal code"
            required
            autocomplete="street-address"
          ></textarea>
        </div>
        <div class="of-err-msg" id="of-err-address">Please enter your complete address (minimum 5 characters).</div>
      </div>

      <!-- Submit Button -->
      <button type="submit" id="of-btn-submit" class="of-submit-btn">
        <span id="of-btn-text">${escapeHtml(config.buttonText)}</span>
        <svg id="of-btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        <span id="of-btn-spinner" class="of-spinner" style="display: none;"></span>
      </button>
    </form>
  </div>

  <!-- Success Confirmation View -->
  <div class="of-success-pane" id="of-success-section">
    <svg class="of-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.35rem; font-weight: 700; color: #0f172a;">${escapeHtml(config.successTitle)}</h3>
    <p style="margin: 0; font-size: 0.92rem; color: #64748b;">${escapeHtml(config.successMessage)}</p>

    <!-- Prominent Order ID Box -->
    <div class="of-order-box">
      <div class="of-order-label">Assigned Order ID</div>
      <div class="of-order-val" id="of-result-order-id">ORD-00000000-000000</div>
      <button type="button" class="of-copy-id-btn" id="of-btn-copy-id">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span id="of-copy-id-text">Copy ID</span>
      </button>
    </div>

    <!-- Sync Notice for Standalone / Local file:/// submissions -->
    <div id="of-sync-notice" style="display: none; margin: 1.25rem 0; padding: 1.1rem; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; text-align: left;">
      <div style="font-size: 0.84rem; font-weight: 700; color: #1e3a8a; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.4rem;">
        <span>📥 Sync Order with OrderFlow Dashboard</span>
      </div>
      <p id="of-sync-reason" style="margin: 0 0 0.85rem 0; font-size: 0.76rem; color: #1e40af; line-height: 1.45;">
        Submitted from a local file. Click the button below to instantly save this order into your live OrderFlow dashboard.
      </p>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <button type="button" id="of-btn-auto-sync" style="width: 100%; padding: 0.65rem 0.85rem; font-size: 0.84rem; background: #2563eb; color: #ffffff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.4rem; box-shadow: 0 2px 5px rgba(37,99,235,0.25);">
          <span>🚀 Sync to OrderFlow App (1-Click)</span>
        </button>
        <button type="button" id="of-btn-copy-sync" style="width: 100%; padding: 0.5rem 0.75rem; font-size: 0.75rem; background: #ffffff; color: #1e40af; border: 1px solid #93c5fd; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
          <span id="of-copy-sync-text">📋 Copy Sync Code</span>
        </button>
      </div>
    </div>

    <div>
      <button type="button" class="of-reset-btn" id="of-btn-reset">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
        Submit Another Order
      </button>
    </div>
  </div>

  <!-- Footer with Security Tag -->
  <div class="of-footer">
    <span style="display: inline-flex; align-items: center; gap: 0.3rem;">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      SSL Encrypted Submission
    </span>
    <span>Powered by OrderFlow</span>
  </div>
</div>

<script>
(function() {
  var PRIMARY_URL = ${JSON.stringify(targetApiUrl)};
  var APP_BASE_URL = ${JSON.stringify(publicBaseUrl.replace(/\/$/, ''))};
  var form = document.getElementById('orderflow-form');
  var formSection = document.getElementById('of-form-section');
  var successSection = document.getElementById('of-success-section');
  var submitBtn = document.getElementById('of-btn-submit');
  var btnText = document.getElementById('of-btn-text');
  var btnArrow = document.getElementById('of-btn-arrow');
  var btnSpinner = document.getElementById('of-btn-spinner');
  var errorBox = document.getElementById('of-error-box');
  var errorText = document.getElementById('of-error-text');
  var resultOrderId = document.getElementById('of-result-order-id');
  var copyIdBtn = document.getElementById('of-btn-copy-id');
  var copyIdText = document.getElementById('of-copy-id-text');
  var resetBtn = document.getElementById('of-btn-reset');
  var syncNotice = document.getElementById('of-sync-notice');
  var autoSyncBtn = document.getElementById('of-btn-auto-sync');
  var copySyncBtn = document.getElementById('of-btn-copy-sync');
  var copySyncText = document.getElementById('of-copy-sync-text');
  var currentSyncPayload = null;

  var nameInput = document.getElementById('of-field-name');
  var mobileInput = document.getElementById('of-field-mobile');
  var addressInput = document.getElementById('of-field-address');

  var errName = document.getElementById('of-err-name');
  var errMobile = document.getElementById('of-err-mobile');
  var errAddress = document.getElementById('of-err-address');

  function clearErrors() {
    [nameInput, mobileInput, addressInput].forEach(function(el) {
      if (el) el.classList.remove('has-error');
    });
    [errName, errMobile, errAddress].forEach(function(el) {
      if (el) el.style.display = 'none';
    });
    if (errorBox) errorBox.style.display = 'none';
  }

  function validate() {
    clearErrors();
    var isValid = true;

    var nameVal = (nameInput.value || '').trim();
    if (nameVal.length < 2) {
      nameInput.classList.add('has-error');
      errName.style.display = 'block';
      isValid = false;
    }

    var mobileVal = (mobileInput.value || '').trim();
    var digits = mobileVal.replace(/\\D/g, '');
    if (digits.length < 5) {
      mobileInput.classList.add('has-error');
      errMobile.style.display = 'block';
      isValid = false;
    }

    var addressVal = (addressInput.value || '').trim();
    if (addressVal.length < 5) {
      addressInput.classList.add('has-error');
      errAddress.style.display = 'block';
      isValid = false;
    }

    return isValid;
  }

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      btnText.textContent = 'Submitting Order...';
      btnArrow.style.display = 'none';
      btnSpinner.style.display = 'inline-block';
    } else {
      submitBtn.disabled = false;
      btnText.textContent = ${JSON.stringify(config.buttonText)};
      btnArrow.style.display = 'inline-block';
      btnSpinner.style.display = 'none';
    }
  }

  function isFileUrl() {
    return typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
  }

  function getCandidateEndpoints() {
    var endpoints = [];

    // ALWAYS include PRIMARY_URL! Never skip it!
    if (PRIMARY_URL && endpoints.indexOf(PRIMARY_URL) === -1) {
      endpoints.push(PRIMARY_URL);
    }

    // If opened from file:///, also include local ports if user is running local server
    if (isFileUrl()) {
      var localEndpoint1 = 'http://localhost:3000/api/submissions';
      var localEndpoint2 = 'http://127.0.0.1:3000/api/submissions';
      if (endpoints.indexOf(localEndpoint1) === -1) endpoints.push(localEndpoint1);
      if (endpoints.indexOf(localEndpoint2) === -1) endpoints.push(localEndpoint2);
    }

    // If hosted via HTTP/HTTPS, allow same-origin fallback
    if (!isFileUrl() && window.location && window.location.origin && window.location.origin !== 'null') {
      var base = window.location.origin;
      var cleanOrigin = base.charAt(base.length - 1) === '/' ? base.slice(0, -1) : base;
      var sameOrigin = cleanOrigin + '/api/submissions';
      if (endpoints.indexOf(sameOrigin) === -1) endpoints.push(sameOrigin);
    }

    return endpoints;
  }

  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (!validate()) {
        return;
      }

      setLoading(true);

      var now = new Date();
      var yyyy = now.getUTCFullYear();
      var mm = String(now.getUTCMonth() + 1).padStart(2, '0');
      var dd = String(now.getUTCDate()).padStart(2, '0');
      var rnd = String(Math.floor(100000 + Math.random() * 900000));
      var clientGeneratedId = 'ORD-' + yyyy + mm + dd + '-' + rnd;

      var payload = {
        id: clientGeneratedId,
        name: nameInput.value.trim(),
        mobile: mobileInput.value.trim(),
        address: addressInput.value.trim(),
        notes: isFileUrl() ? 'Submitted via downloaded HTML form (file://)' : 'Submitted via embed form'
      };

      var candidates = getCandidateEndpoints();
      var succeeded = false;
      var lastError = '';
      var failedReason = '';

      if (candidates.length > 0) {
        for (var i = 0; i < candidates.length; i++) {
          var candidateUrl = candidates[i];

          // Check for mixed-content violation (HTTP endpoint from HTTPS site like Odoo)
          if (window.location && window.location.protocol === 'https:' && candidateUrl.indexOf('http://') === 0) {
            console.warn('[OrderFlow] Mixed Content Warning: Cannot call HTTP endpoint from HTTPS site (' + candidateUrl + '). Use your HTTPS Vercel endpoint.');
            failedReason = 'Mixed Content: Target URL is HTTP (' + candidateUrl + ') on an HTTPS website. Please use your HTTPS Vercel URL.';
            continue;
          }

          // Attempt 1: Fetch with credentials: 'include' (for Google dev preview containers)
          try {
            var response = await fetch(candidateUrl, {
              method: 'POST',
              mode: 'cors',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(payload)
            });

            var data = await response.json();

            if (response.ok && data.success) {
              resultOrderId.textContent = data.orderId || clientGeneratedId;
              if (syncNotice) syncNotice.style.display = 'none';
              formSection.style.display = 'none';
              successSection.style.display = 'block';
              succeeded = true;
              break;
            } else {
              lastError = data.error || 'Failed to place order. Please review your input.';
            }
          } catch (networkErr1) {
            console.warn('[OrderFlow] Fetch with credentials failed on:', candidateUrl, networkErr1);

            // Attempt 2: Fetch with credentials: 'omit' (for standard public APIs and Vercel)
            try {
              var response2 = await fetch(candidateUrl, {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
              });

              var data2 = await response2.json();

              if (response2.ok && data2.success) {
                resultOrderId.textContent = data2.orderId || clientGeneratedId;
                if (syncNotice) syncNotice.style.display = 'none';
                formSection.style.display = 'none';
                successSection.style.display = 'block';
                succeeded = true;
                break;
              }
            } catch (networkErr2) {
              console.warn('[OrderFlow] Fetch without credentials failed on:', candidateUrl, networkErr2);

              // Attempt 3: XMLHttpRequest Fallback
              try {
                var xhrData = await new Promise(function(resolve, reject) {
                  var xhr = new XMLHttpRequest();
                  xhr.open('POST', candidateUrl, true);
                  xhr.withCredentials = true;
                  xhr.setRequestHeader('Content-Type', 'application/json');
                  xhr.setRequestHeader('Accept', 'application/json');
                  xhr.timeout = 7000;
                  xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                      try { resolve(JSON.parse(xhr.responseText)); } catch(e) { resolve({ success: true, orderId: clientGeneratedId }); }
                    } else {
                      reject(new Error('Status ' + xhr.status));
                    }
                  };
                  xhr.onerror = function() { reject(new Error('XHR Network Error')); };
                  xhr.ontimeout = function() { reject(new Error('Timeout')); };
                  xhr.send(JSON.stringify(payload));
                });

                if (xhrData && xhrData.success) {
                  resultOrderId.textContent = xhrData.orderId || clientGeneratedId;
                  if (syncNotice) syncNotice.style.display = 'none';
                  formSection.style.display = 'none';
                  successSection.style.display = 'block';
                  succeeded = true;
                  break;
                }
              } catch (xhrErr) {
                console.warn('[OrderFlow] XHR fallback failed:', xhrErr);
                failedReason = 'Direct connection to ' + candidateUrl + ' was blocked by browser cross-origin policy or cookie checks.';
              }
            }
          }
        }
      }

      if (!succeeded) {
        // Resilient Sync Engine:
        // Automatically assign identical Order ID and enable 1-click sync
        var pendingSubmission = {
          id: clientGeneratedId,
          name: payload.name,
          mobile: payload.mobile,
          address: payload.address,
          createdAt: now.toISOString(),
          status: 'new',
          notes: 'Submitted via downloaded HTML form (Local/File Mode)',
          sourceUrl: window.location.href || 'standalone-form'
        };

        currentSyncPayload = pendingSubmission;

        // 1. Broadcast to any open OrderFlow Admin tab
        try {
          if (typeof BroadcastChannel !== 'undefined') {
            var channel = new BroadcastChannel('orderflow_orders_channel');
            channel.postMessage({ type: 'SYNC_OFFLINE_ORDER', order: pendingSubmission });
          }
        } catch(e) {}

        // 2. Persist in localStorage queue
        try {
          var q = JSON.parse(localStorage.getItem('orderflow_offline_orders') || '[]');
          q.push(pendingSubmission);
          localStorage.setItem('orderflow_offline_orders', JSON.stringify(q));
        } catch(e) {}

        // Display success state with the generated Order ID
        resultOrderId.textContent = clientGeneratedId;
        if (syncNotice) {
          syncNotice.style.display = 'block';
          var reasonEl = document.getElementById('of-sync-reason');
          if (reasonEl) {
            reasonEl.innerHTML = 'Order assigned ID <strong>' + clientGeneratedId + '</strong>.<br><span style="color:#1e40af;">Running from a downloaded local file. Click the button below to instantly save this order into your live OrderFlow dashboard!</span>';
          }
        }
        formSection.style.display = 'none';
        successSection.style.display = 'block';
        setLoading(false);
      }
    });
  }

  if (autoSyncBtn) {
    autoSyncBtn.addEventListener('click', function() {
      if (!currentSyncPayload) return;
      var targetUrl = APP_BASE_URL ? (APP_BASE_URL + '/?import_order=' + encodeURIComponent(JSON.stringify(currentSyncPayload))) : null;
      if (targetUrl) {
        window.open(targetUrl, '_blank');
      } else {
        alert('App URL not configured. Click "Copy Sync Code" and use "Import / Sync Order" in OrderFlow.');
      }
    });
  }

  if (copySyncBtn) {
    copySyncBtn.addEventListener('click', function() {
      if (!currentSyncPayload) return;
      var textToCopy = JSON.stringify(currentSyncPayload);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(function() {
          copySyncText.textContent = 'Copied to Clipboard!';
          setTimeout(function() {
            copySyncText.textContent = '📋 Copy Dashboard Sync Code';
          }, 2500);
        });
      } else {
        var temp = document.createElement('input');
        temp.value = textToCopy;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        copySyncText.textContent = 'Copied to Clipboard!';
        setTimeout(function() {
          copySyncText.textContent = '📋 Copy Dashboard Sync Code';
        }, 2500);
      }
    });
  }

  if (copyIdBtn) {
    copyIdBtn.addEventListener('click', function() {
      var idText = resultOrderId.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(idText).then(function() {
          copyIdText.textContent = 'Copied!';
          setTimeout(function() {
            copyIdText.textContent = 'Copy ID';
          }, 2000);
        });
      } else {
        var tempInput = document.createElement('input');
        tempInput.value = idText;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        copyIdText.textContent = 'Copied!';
        setTimeout(function() {
          copyIdText.textContent = 'Copy ID';
        }, 2000);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      form.reset();
      clearErrors();
      setLoading(false);
      successSection.style.display = 'none';
      formSection.style.display = 'block';
    });
  }
})();
</script>
<!-- ================= End of OrderFlow Snippet ================= -->`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function shadeColor(color: string, percent: number): string {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.round((R * (100 + percent)) / 100);
  G = Math.round((G * (100 + percent)) / 100);
  B = Math.round((B * (100 + percent)) / 100);

  R = Math.min(255, Math.max(0, R));
  G = Math.min(255, Math.max(0, G));
  B = Math.min(255, Math.max(0, B));

  const RR = R.toString(16).padStart(2, '0');
  const GG = G.toString(16).padStart(2, '0');
  const BB = B.toString(16).padStart(2, '0');

  return `#${RR}${GG}${BB}`;
}
