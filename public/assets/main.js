/* CandyGame Studio — Standalone Static Script */
(function () {
  const STORAGE_KEY = 'candygame_cms_store_v2';
  const ADMIN_AUTH_KEY = 'candygame_admin_auth';

  function showToast(message) {
    let toast = document.getElementById('cg-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cg-toast';
      toast.className = 'cg-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(window.__cgToastTimer);
    window.__cgToastTimer = window.setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  function readStore() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeStore(next) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota issues
    }
  }

  async function initAdminAuthGate() {
    const adminShell = document.querySelector('.cg-admin-shell');
    if (!adminShell) return;

    const signOutBtn = document.querySelector('[data-cg-admin-signout]');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', async () => {
        try {
          await window.fetch('/api/admin/logout', {
            method: 'POST',
            credentials: 'same-origin',
          });
        } catch {
          // Ignore network errors
        }
        window.location.reload();
      });
    }

    try {
      const sessionRes = await window.fetch('/api/admin/session', {
        credentials: 'same-origin',
      });
      if (sessionRes.ok) {
        return;
      }
    } catch {
      // Show sign-in gate
    }

    adminShell.style.display = 'none';

    const gate = document.createElement('div');
    gate.className = 'cg-auth-gate';
    gate.innerHTML = `
      <div class="cg-glass-card cg-auth-card" style="display:flex;flex-direction:column;gap:1.5rem;">
        <div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:0.75rem;">
          <a href="./home.html" class="cg-brand">
            <img src="./assets/aistudio/Candy_Team_Game_Studio_Logo_c7b30204.webp" alt="CandyGame" />
            <span>CandyGame</span>
          </a>
          <span class="cg-badge">Protected Admin Area</span>
          <h1 style="font-size:1.5rem;color:#fff;">Admin Panel Sign In</h1>
          <p style="font-size:0.875rem;color:var(--cg-on-surface-variant);line-height:1.5;">
            Enter your studio administrator username and password to access CandyGame management tools.
          </p>
        </div>
        <form id="cg-admin-login-form" style="display:flex;flex-direction:column;gap:1rem;">
          <div class="cg-field">
            <label class="cg-label" for="cg-login-user">Username</label>
            <input id="cg-login-user" name="username" class="cg-input" placeholder="Enter username" autocomplete="username" required />
          </div>
          <div class="cg-field">
            <label class="cg-label" for="cg-login-pass">Password</label>
            <input id="cg-login-pass" name="password" type="password" class="cg-input" placeholder="Enter password" autocomplete="current-password" required />
          </div>
          <p id="cg-login-error" style="font-size:0.875rem;color:#ffb4ab;display:none;"></p>
          <button type="submit" class="cg-btn cg-btn-primary cg-btn-lg" style="width:100%;">Sign In to Admin Panel</button>
        </form>
        <div style="padding-top:1rem;border-top:1px solid rgba(255,255,255,0.1);text-align:center;">
          <a href="./home.html" style="font-size:0.875rem;color:var(--cg-primary);">&larr; Return to CandyGame Website</a>
        </div>
      </div>
    `;
    document.body.appendChild(gate);

    const loginForm = document.getElementById('cg-admin-login-form');
    const errorEl = document.getElementById('cg-login-error');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errorEl) errorEl.style.display = 'none';
        const u = (document.getElementById('cg-login-user')?.value || '').trim();
        const p = document.getElementById('cg-login-pass')?.value || '';
        try {
          const res = await window.fetch('/api/admin/login', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p, useCookie: true }),
          });
          if (res.ok) {
            gate.remove();
            adminShell.style.display = '';
            return;
          }
          const payload = await res.json().catch(() => ({}));
          if (errorEl) {
            errorEl.textContent =
              payload.error || 'Invalid username or password. Please try again.';
            errorEl.style.display = 'block';
          }
        } catch {
          if (errorEl) {
            errorEl.textContent = 'Unable to reach server. Please try again.';
            errorEl.style.display = 'block';
          }
        }
      });
    }
  }

  function initMobileMenu() {
    const toggleBtn = document.querySelector('[data-cg-menu-toggle]');
    const drawer = document.querySelector('[data-cg-mobile-drawer]');
    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = drawer.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
      });
    }

    const adminToggle = document.querySelector('[data-cg-admin-menu-toggle]');
    const adminSidebar = document.querySelector('[data-cg-admin-sidebar]');
    if (adminToggle && adminSidebar) {
      adminToggle.addEventListener('click', () => {
        adminSidebar.classList.toggle('open');
      });
    }
  }

  function initGamesCatalogFilter() {
    const searchInput = document.getElementById('cg-games-search');
    const filterButtons = document.querySelectorAll('[data-cg-filter]');
    const cards = document.querySelectorAll('[data-cg-game-card]');
    if (!cards.length) return;

    let activeCategory = 'all';

    function applyFilter() {
      const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
      cards.forEach((card) => {
        const cat = card.getAttribute('data-category') || '';
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const catOk = activeCategory === 'all' || cat === activeCategory;
        const searchOk = !q || text.includes(q);
        card.style.display = catOk && searchOk ? '' : 'none';
      });
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-cg-filter') || 'all';
        filterButtons.forEach((b) => {
          b.classList.toggle('cg-btn-primary', b === btn);
          b.classList.toggle('cg-btn-secondary', b !== btn);
        });
        applyFilter();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }
  }

  function initContactForm() {
    const form = document.getElementById('cg-contact-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]')?.value.trim() || '';
      const email = form.querySelector('[name="email"]')?.value.trim() || '';
      const subject = form.querySelector('[name="subject"]')?.value.trim() || 'General Inquiry';
      const message = form.querySelector('[name="message"]')?.value.trim() || '';
      const statusEl = document.getElementById('cg-contact-status');

      if (!name || !email || !message) {
        if (statusEl) {
          statusEl.textContent = 'Please complete your name, email, and message.';
          statusEl.style.color = '#ffb4ab';
        }
        return;
      }

      try {
        const res = await window.fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          if (statusEl) {
            statusEl.textContent = payload.error || 'Unable to send message.';
            statusEl.style.color = '#ffb4ab';
          }
          return;
        }
      } catch {
        if (statusEl) {
          statusEl.textContent = 'Network error while sending message.';
          statusEl.style.color = '#ffb4ab';
        }
        return;
      }

      const store = readStore();
      if (store) {
        store.contactSubmissions = store.contactSubmissions || [];
        store.contactSubmissions.unshift({
          id: 'msg-' + Date.now(),
          name,
          email,
          to: 'support@candygame.bond',
          subject,
          message,
          source: 'contact-form',
          submittedAt: new Date().toISOString(),
          status: 'new',
        });
        writeStore(store);
      }

      form.reset();
      if (statusEl) {
        statusEl.textContent = 'Message sent to CandyGame (support@candygame.bond)! Thank you for contacting us.';
        statusEl.style.color = '#6ee7b7';
      }
      showToast('Message submitted successfully.');
    });
  }

  function initAdminForms() {
    document.querySelectorAll('[data-cg-save-form]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const label = form.getAttribute('data-cg-save-form') || 'Changes';
        showToast(label + ' saved.');
      });
    });

    const resetBtn = document.getElementById('cg-reset-storage-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        window.localStorage.removeItem(STORAGE_KEY);
        showToast('Local studio data reset to defaults.');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    void initAdminAuthGate();
    initMobileMenu();
    initGamesCatalogFilter();
    initContactForm();
    initAdminForms();
  });
})();
