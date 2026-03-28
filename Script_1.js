// ─────────────────────────────────────────
//  CART STATE
//  Unified schema: { id, name, price, image, qty }
// ─────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// ─────────────────────────────────────────
//  SIDEBAR
// ─────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggle-sidebar');
const overlay = document.getElementById('overlay');
const layoutContainer = document.querySelector('.layout-container');

function openSidebar() {
  sidebar.classList.add('show');
  overlay.classList.add('active');
  document.body.classList.add('sidebar-open');
  layoutContainer.classList.add('sidebar-open');
  toggleBtn.textContent = 'Close Cart';
}

function closeSidebar() {
  sidebar.classList.remove('show');
  overlay.classList.remove('active');
  document.body.classList.remove('sidebar-open');
  layoutContainer.classList.remove('sidebar-open');
  toggleBtn.textContent = 'Open Cart';
}

toggleBtn.addEventListener('click', () => {
  if (sidebar.classList.contains('show')) {
    closeSidebar();
  } else {
    openSidebar();
  }
});

overlay.addEventListener('click', () => {
  closeSidebar();
});

// ─────────────────────────────────────────
//  CART DISPLAY  (unified: uses item.qty)
// ─────────────────────────────────────────
function updateCartDisplay() {
  const container = document.getElementById('cart');
  if (!container) return;
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p style="color:#ccc;">Your cart is empty.</p>';
    return;
  }

  cart.forEach(item => {
    const div = document.createElement('div');
    div.innerHTML = `
      <span>
        <strong>${item.name}</strong><br/>
        Qty: ${item.qty}<br/>
        $${(item.price * item.qty).toFixed(2)}
      </span>
      <button class="remove-btn" data-id="${item.id}">Remove</button>`;
    container.appendChild(div);
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const index = cart.findIndex(i => i.id === id);
      if (index !== -1) {
        cart.splice(index, 1);
        saveCart();
        updateCartDisplay();
      }
    });
  });
}

// ─────────────────────────────────────────
//  ADD TO CART  (unified: uses item.qty)
// ─────────────────────────────────────────
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    const id = btn.dataset.id;
    addToCart(btn, name, price, id);
  });
});

/* Central addToCart — grabs image from product card if present */
function addToCart(btn, name, price, id) {
  if (typeof price === 'string') price = parseFloat(price.replace(/,/g, ''));
  price = isNaN(price) ? 0 : price;

  let image = null;
  const card = btn.closest('.product-card');
  if (card) {
    const imgEl = card.querySelector('.product-image img');
    if (imgEl) image = imgEl.src;
  }

  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, image, qty: 1 });
  }

  saveCart();
  updateCartDisplay();
  updateCartDrawer();
  showToast(`${name} added to your cart`);
  bumpCount();

  const orig = btn.textContent;
  btn.textContent = '✓ Added';
  btn.classList.add('added');
  setTimeout(() => { btn.textContent = orig; btn.classList.remove('added'); }, 1800);
}

// ─────────────────────────────────────────
//  CART DRAWER
// ─────────────────────────────────────────
function updateCartDrawer() {
  const countEl = document.getElementById('cartCount');
  const totalEl = document.getElementById('cartTotal');
  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  if (!itemsEl) return;

  const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (countEl) countEl.textContent = totalQty;
  if (totalEl) totalEl.textContent = '₱' + totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  document.querySelectorAll('.cart-item').forEach(el => el.remove());

  if (cart.length === 0) {
    if (emptyEl) emptyEl.style.display = 'flex';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  cart.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'cart-item';

    const imgHTML = item.image
      ? `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:contain;padding:4px;">`
      : `<span style="font-size:26px;">🍷</span>`;

    el.innerHTML = `
      <div class="cart-item-img" style="overflow:hidden;">${imgHTML}</div>
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₱${item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })} per bottle</div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty(${idx},-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${idx},1)">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="removeItem(${idx})">×</button>
    `;
    itemsEl.appendChild(el);
  });
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  updateCartDrawer();
}

function removeItem(idx) {
  cart.splice(idx, 1);
  saveCart();
  updateCartDrawer();
}

function toggleCart() {
  const cartOverlay = document.getElementById('cartOverlay');
  const drawer      = document.getElementById('cartDrawer');
  if (!cartOverlay || !drawer) return;
  cartOverlay.classList.toggle('open');
  drawer.classList.toggle('open');
  document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
}

function bumpCount() {
  const el = document.getElementById('cartCount');
  if (!el) return;
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 300);
}

// ─────────────────────────────────────────
//  ORDER SECTION
// ─────────────────────────────────────────
function createOrderSection() {
  if (document.getElementById('order-section')) return;

  const orderSection = document.createElement('div');
  orderSection.id = 'order-section';
  orderSection.style.marginTop = '30px';
  orderSection.innerHTML = `
    <h3>Your Order</h3>
    <div id="cart-items"></div>
    <button id="confirm-order" style="margin-top:20px;padding:10px 20px;border:none;border-radius:8px;background-color:#28a745;color:#fff;cursor:pointer;">Confirm Order</button>
  `;
  document.body.appendChild(orderSection);

  updateCartDisplay();

  document.getElementById('confirm-order').addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    alert('Thank you for your order! We will contact you shortly.');
    cart = [];
    saveCart();
    updateCartDisplay();
    updateCartDrawer();
  });
}

createOrderSection();

// ─────────────────────────────────────────
//  SIGN-UP OVERLAY
//  FIX 1: corrected getElementByById → getElementById
//  FIX 3: password is no longer saved to localStorage
// ─────────────────────────────────────────
const overlaySignUp        = document.getElementById('signUpOverlay');
const startBtn             = document.getElementById('startBtn');
const closeOverlayBtn      = document.getElementById('closeSignUp');
const nextBtn              = document.getElementById('overlayNextBtn'); // was: getElementByById (typo)
const overlayStepNumberSpan = document.getElementById('overlayStepNumber');
const overlayStepLabel     = document.getElementById('overlayStepLabel');
const overlayInput         = document.getElementById('overlayInput');

const stepsOverlay = [
  { label: "First Name",    key: "firstName",  placeholder: "First name" },
  { label: "Last Name",     key: "lastName",   placeholder: "Last name" },
  { label: "Email Address", key: "email",      placeholder: "you@example.com", validate: v => /\S+@\S+\.\S+/.test(v) || "Invalid email" },
  { label: "Username",      key: "username",   placeholder: "Username" },
  { label: "Password",      key: "password",   placeholder: "Password" },
  { label: "Your Age",      key: "age",        placeholder: "18", validate: v => (!isNaN(v) && Number(v) > 0) || "Invalid age" },
  { label: "Gender",        key: "gender",     placeholder: "Gender" },
  { label: "Country",       key: "country",    placeholder: "Country" },
  { label: "Occupation",    key: "occupation", placeholder: "Occupation" },
  { label: "Phone Number",  key: "phone",      placeholder: "Phone" }
];

let currentOverlayStep = 0;
let userDataOverlay = {};

function showOverlay() {
  overlaySignUp.classList.add('active');
  overlaySignUp.setAttribute('aria-hidden', 'false');
  currentOverlayStep = 0;
  userDataOverlay = {};
  updateOverlayStep();
  overlayInput.focus();
}

function hideOverlay() {
  overlaySignUp.classList.remove('active');
  overlaySignUp.setAttribute('aria-hidden', 'true');
}

function updateOverlayStep() {
  const step = stepsOverlay[currentOverlayStep];
  overlayStepNumberSpan.innerText = currentOverlayStep + 1;
  overlayStepLabel.innerText = step.label;
  overlayInput.value = userDataOverlay[step.key] || '';
  overlayInput.type = (step.key === 'password') ? 'password' : 'text';
  overlayInput.placeholder = step.placeholder || '';
  overlayInput.focus();
}

function validateInput(value) {
  const step = stepsOverlay[currentOverlayStep];
  if (step.validate) {
    const result = step.validate(value);
    if (result === true) return { ok: true };
    return { ok: false, msg: result || 'Invalid' };
  }
  if (value.trim() === '') return { ok: false, msg: 'Field cannot be empty' };
  return { ok: true };
}

function handleNext() {
  const value = overlayInput.value || '';
  const validation = validateInput(value);
  if (!validation.ok) {
    alert(validation.msg);
    return;
  }

  userDataOverlay[stepsOverlay[currentOverlayStep].key] = value.trim();

  if (currentOverlayStep < stepsOverlay.length - 1) {
    currentOverlayStep++;
    updateOverlayStep();
  } else {
    // FIX 3: strip password before persisting — never store plain-text passwords
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const safeUser = Object.assign({}, userDataOverlay);
    delete safeUser.password;
    existingUsers.push(safeUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    alert('Registration complete! Welcome aboard.');
    hideOverlay();
  }
}

if (startBtn)        startBtn.addEventListener('click', showOverlay);
if (closeOverlayBtn) closeOverlayBtn.addEventListener('click', hideOverlay);
if (nextBtn)         nextBtn.addEventListener('click', handleNext);
if (overlaySignUp) {
  overlaySignUp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleNext();
  });
}

// ─────────────────────────────────────────
//  FAQ
// ─────────────────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => {
    const answer = item.querySelector('p');
    const image  = item.querySelector('.faq-image');
    const isOpen = answer.style.display === 'block';
    answer.style.display = isOpen ? 'none' : 'block';
    if (image) image.style.display = isOpen ? 'none' : 'block';
  });
});

const toggleAllBtn = document.getElementById('toggleAllAnswers');
if (toggleAllBtn) {
  toggleAllBtn.addEventListener('click', () => {
    const answers = document.querySelectorAll('.faq-item p');
    const images  = document.querySelectorAll('.faq-item .faq-image');
    const areAllVisible = Array.from(answers).every(a => a.style.display === 'block');
    answers.forEach((a, index) => {
      a.style.display = areAllVisible ? 'none' : 'block';
      if (images[index]) images[index].style.display = areAllVisible ? 'none' : 'block';
    });
  });
}

// ─────────────────────────────────────────
//  CHECKOUT MODAL
// ─────────────────────────────────────────
function proceedToCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartDrawer').classList.remove('open');
  document.body.style.overflow = '';
  openCheckoutModal();
}

function openCheckoutModal() {
  let overlay = document.getElementById('checkoutOverlay');
  if (!overlay) {
    overlay = buildCheckoutModal();
    document.body.appendChild(overlay);
  }
  renderOrderSummary();
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  const overlay = document.getElementById('checkoutOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function buildCheckoutModal() {
  const overlay = document.createElement('div');
  overlay.id = 'checkoutOverlay';
  overlay.className = 'modal-overlay';
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeCheckout();
  });

  overlay.innerHTML = `
    <div class="modal checkout-modal" style="max-width:560px;">
      <button class="modal-close" onclick="closeCheckout()">✕</button>

      <div id="checkoutForm">
        <div class="modal-top">
          <div class="modal-logo">AMOUR ÉLIXE</div>
          <div class="checkout-step-label">Delivery Details</div>
        </div>
        <div class="modal-body">
          <div class="co-summary" id="coSummary"></div>
          <div style="height:1px;background:var(--border);margin:20px 0;"></div>
          <div class="modal-subtitle" style="margin-bottom:18px;">Where should we deliver?</div>

          <div class="field-row">
            <div class="field">
              <label>First Name</label>
              <input type="text" id="co-first" placeholder="Enter your first name">
              <div class="field-error" id="co-err-first">Required</div>
            </div>
            <div class="field">
              <label>Last Name</label>
              <input type="text" id="co-last" placeholder="Enter your last name">
              <div class="field-error" id="co-err-last">Required</div>
            </div>
          </div>

          <div class="field">
            <label>Contact Number</label>
            <input type="tel" id="co-phone" placeholder="+63 912 345 6789">
            <div class="field-error" id="co-err-phone">Enter a valid phone number</div>
          </div>

          <div class="field">
            <label>Complete Address</label>
            <input type="text" id="co-address" placeholder="Unit / House No., Street">
            <div class="field-error" id="co-err-address">Required</div>
          </div>

          <div class="field-row">
            <div class="field">
              <label>City / Municipality</label>
              <input type="text" id="co-city" placeholder="Enter City">
              <div class="field-error" id="co-err-city">Required</div>
            </div>
            <div class="field">
              <label>Province / Region</label>
              <input type="text" id="co-province" placeholder="Enter Province">
              <div class="field-error" id="co-err-province">Required</div>
            </div>
          </div>

          <div class="field">
            <label>Delivery Notes <span style="color:var(--muted);font-size:8px;letter-spacing:0;">(optional)</span></label>
            <input type="text" id="co-notes" placeholder="Gate code, landmark, preferred time…">
          </div>

          <div style="height:1px;background:var(--border);margin:20px 0;"></div>
          <div class="modal-subtitle" style="margin-bottom:14px;">Payment Method</div>

          <div class="co-payment-grid">
            <label class="co-pay-option">
              <input type="radio" name="payment" value="cod" checked>
              <span class="co-pay-label"><span>Cash on Delivery</span></span>
            </label>
            <label class="co-pay-option">
              <input type="radio" name="payment" value="gcash">
              <span class="co-pay-label"><span>GCash</span></span>
            </label>
            <label class="co-pay-option">
              <input type="radio" name="payment" value="card">
              <span class="co-pay-label"><span>Credit / Debit Card</span></span>
            </label>
            <label class="co-pay-option">
              <input type="radio" name="payment" value="bank">
              <span class="co-pay-label"><span>Bank Transfer</span></span>
            </label>
          </div>

          <div style="height:1px;background:var(--border);margin:20px 0;"></div>

          <div class="co-total-row">
            <span class="co-total-label">Order Total</span>
            <span class="co-total-value" id="coTotalValue">₱0</span>
          </div>
          <div style="font-size:9px;color:var(--muted);letter-spacing:0.05em;margin-bottom:20px;">
            Includes temperature-controlled shipping · 18+ only
          </div>

          <button class="modal-submit" onclick="submitCheckout()">Place Order →</button>
        </div>
      </div>

      <div id="checkoutSuccess" style="display:none;padding:48px 36px;text-align:center;">
        <div class="success-title">Order Placed!</div>
        <p class="success-msg" id="coSuccessMsg"></p>
        <div class="co-order-box" id="coOrderBox"></div>
        <button class="modal-submit" style="margin-top:24px;" onclick="closeCheckout()">Done</button>
      </div>
    </div>
  `;

  if (!document.getElementById('checkoutStyles')) {
    const style = document.createElement('style');
    style.id = 'checkoutStyles';
    style.textContent = `
      .checkout-modal { max-height: 90vh; overflow-y: auto; }
      .checkout-step-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 24px; }
      .co-summary { background: var(--surface); border: 1px solid var(--border); padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
      .co-summary-item { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
      .co-summary-name { font-size: 11px; color: var(--pale); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .co-summary-qty { font-size: 9px; color: var(--muted); letter-spacing: 0.06em; flex-shrink: 0; }
      .co-summary-price { font-size: 11px; color: var(--cream); flex-shrink: 0; }
      .co-total-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
      .co-total-label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
      .co-total-value { font-family: 'Cormorant Garamond', 'Playfair Display', serif; font-size: 30px; font-weight: 300; color: var(--cream); }
      .co-payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 4px; }
      .co-pay-option { cursor: pointer; }
      .co-pay-option input { display: none; }
      .co-pay-label { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); padding: 11px 14px; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.06em; color: var(--muted); transition: all 0.2s; }
      .co-pay-option input:checked + .co-pay-label { border-color: var(--wine); color: var(--cream); background: rgba(155,44,80,0.12); }
      .co-pay-label:hover { border-color: var(--gold); color: var(--gold); }
      .co-order-box { background: var(--surface); border: 1px solid var(--border); padding: 16px 20px; text-align: left; margin-top: 16px; font-size: 10px; color: var(--muted); line-height: 2; letter-spacing: 0.05em; }
      .co-order-box strong { color: var(--cream); }
    `;
    document.head.appendChild(style);
  }

  return overlay;
}

function renderOrderSummary() {
  const summaryEl = document.getElementById('coSummary');
  const totalEl   = document.getElementById('coTotalValue');
  if (!summaryEl) return;

  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
  summaryEl.innerHTML = cart.map(item => `
    <div class="co-summary-item">
      <span class="co-summary-name">
        ${item.image ? `<img src="${item.image}" alt="" style="width:20px;height:26px;object-fit:contain;vertical-align:middle;margin-right:6px;">` : ''}
        ${item.name}
      </span>
      <span class="co-summary-qty">× ${item.qty}</span>
      <span class="co-summary-price">₱${(item.price * item.qty).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
    </div>
  `).join('');

  if (totalEl) totalEl.textContent = '₱' + totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

function clearCheckoutErrors() {
  ['co-err-first','co-err-last','co-err-phone','co-err-address','co-err-city','co-err-province']
    .forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('show'); });
}

function showCheckoutError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

function submitCheckout() {
  clearCheckoutErrors();

  const first    = document.getElementById('co-first').value.trim();
  const last     = document.getElementById('co-last').value.trim();
  const phone    = document.getElementById('co-phone').value.trim();
  const address  = document.getElementById('co-address').value.trim();
  const city     = document.getElementById('co-city').value.trim();
  const province = document.getElementById('co-province').value.trim();
  const notes    = document.getElementById('co-notes').value.trim();
  const payment  = document.querySelector('input[name="payment"]:checked')?.value || 'cod';

  const paymentLabels = {
    cod: 'Cash on Delivery', gcash: 'GCash',
    card: 'Credit / Debit Card', bank: 'Bank Transfer'
  };

  let valid = true;
  if (!first)   { showCheckoutError('co-err-first');   valid = false; }
  if (!last)    { showCheckoutError('co-err-last');    valid = false; }
  if (!phone || phone.length < 7) { showCheckoutError('co-err-phone'); valid = false; }
  if (!address) { showCheckoutError('co-err-address'); valid = false; }
  if (!city)    { showCheckoutError('co-err-city');    valid = false; }
  if (!province){ showCheckoutError('co-err-province');valid = false; }
  if (!valid) return;

  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  document.getElementById('checkoutForm').style.display = 'none';
  const successEl = document.getElementById('checkoutSuccess');
  successEl.style.display = 'block';

  document.getElementById('coSuccessMsg').innerHTML =
    `Thank you, <strong style="color:var(--gold)">${first}</strong>! Your order is confirmed and on its way.`;

  document.getElementById('coOrderBox').innerHTML = `
    <div><strong>Name</strong> · ${first} ${last}</div>
    <div><strong>Contact</strong> · ${phone}</div>
    <div><strong>Deliver to</strong> · ${address}, ${city}, ${province}${notes ? '<br><strong>Note</strong> · ' + notes : ''}</div>
    <div><strong>Payment</strong> · ${paymentLabels[payment]}</div>
    <div><strong>Total</strong> · ₱${totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
  `;

  cart = [];
  saveCart();
  updateCartDrawer();
}

// ─────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

// ─────────────────────────────────────────
//  FILTER
// ─────────────────────────────────────────
function filterProducts(category, btn) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  let visible = 0;
  document.querySelectorAll('.product-card').forEach(card => {
    const match = category === 'all' || card.dataset.category.toLowerCase() === category.toLowerCase();
    card.classList.toggle('hidden', !match);
    if (match) visible++;
  });
  const countEl = document.getElementById('productCount');
  if (countEl) countEl.textContent = `${visible} bottle${visible !== 1 ? 's' : ''}`;
}

// ─────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────
let currentUser = JSON.parse(sessionStorage.getItem('amourUser') || 'null');

function initAuth() {
  const btn = document.getElementById('authBtn');
  if (!btn) return;
  if (currentUser) {
    btn.textContent = `👤 ${currentUser.first}`;
    btn.classList.add('signed-in');
    btn.addEventListener('click', () => openModal('login'));
  } else {
    btn.addEventListener('click', () => openModal('signup'));
  }
}

function openModal(tab) {
  switchTab(tab || 'signup');
  const success = document.getElementById('modalSuccess');
  const forms   = document.getElementById('modalForms');
  if (success) success.classList.remove('active');
  if (forms)   forms.style.display = '';
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

function switchTab(tab) {
  const cap = tab.charAt(0).toUpperCase() + tab.slice(1);
  ['tabSignup','tabLogin'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', id === `tab${cap}`);
  });
  ['panelSignup','panelLogin'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', id === `panel${cap}`);
  });
  clearErrors();
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('show'));
}

function showError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

function submitSignup() {
  clearErrors();
  const first   = document.getElementById('su-first').value.trim();
  const last    = document.getElementById('su-last').value.trim();
  const email   = document.getElementById('su-email').value.trim();
  const pass    = document.getElementById('su-pass').value;
  const country = document.getElementById('su-country').value;
  const age     = document.getElementById('su-age').checked;

  let valid = true;
  if (!first)  { showError('err-first');   valid = false; }
  if (!last)   { showError('err-last');    valid = false; }
  if (!email || !email.includes('@')) { showError('err-email'); valid = false; }
  if (pass.length < 8) { showError('err-pass'); valid = false; }
  if (!country) { showError('err-country'); valid = false; }
  if (!age)    { showError('err-age');     valid = false; }
  if (!valid) return;

  currentUser = { first, last, email };
  sessionStorage.setItem('amourUser', JSON.stringify(currentUser));

  document.getElementById('successName').textContent = first;
  document.getElementById('modalForms').style.display = 'none';
  document.getElementById('modalSuccess').classList.add('active');

  const btn = document.getElementById('authBtn');
  if (btn) { btn.textContent = `👤 ${first}`; btn.classList.add('signed-in'); }
}

function submitLogin() {
  clearErrors();
  const email = document.getElementById('li-email').value.trim();
  const pass  = document.getElementById('li-pass').value;
  let valid = true;
  if (!email || !email.includes('@')) { showError('err-li-email'); valid = false; }
  if (!pass) { showError('err-li-pass'); valid = false; }
  if (!valid) return;

  const name = email.split('@')[0];
  currentUser = { first: name, email };
  sessionStorage.setItem('amourUser', JSON.stringify(currentUser));

  closeModal();
  const btn = document.getElementById('authBtn');
  if (btn) { btn.textContent = `👤 ${name}`; btn.classList.add('signed-in'); }
  showToast(`Welcome back, ${name}!`);
}

function initCartCount() {
  const countEl = document.getElementById('cartCount');
  if (!countEl) return;
  countEl.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

// ─────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initCartCount();
  updateCartDrawer();

  const checkoutBtn = document.querySelector('.checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', proceedToCheckout);
  }
});