/* Hestern newsletter sign-up: slides up once when a visitor reaches the bottom of the page. */
(function(){
  'use strict';
  // --- Configuration ---------------------------------------------------------
  var FORM_URL = 'https://docs.google.com/forms/d/1ByZfHxPhG-I8BXgWEmDo8ZT7Ec9nNxWlXTU7X0h5jGM/viewform';
  // To collect emails right inside the popup, fill these two in from the Google Form's
  // "Get pre-filled link" URL: POST_URL = .../forms/d/e/<FORM_ID>/formResponse, ENTRY = 'entry.123456789'
  var POST_URL = '';
  var ENTRY = '';
  var KEY = 'hestern_signup_popup', HIDE_DAYS = 30;
  // ---------------------------------------------------------------------------
  function get(){ try{ return JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){ return null; } }
  function set(v){ try{ localStorage.setItem(KEY, JSON.stringify(v)); }catch(e){} }
  var st = get();
  if (st && st.until && st.until > Date.now()) return;
  if (window.matchMedia && window.location.search.indexOf('nopopup') > -1) return;

  var css = '.hsp{position:fixed;right:24px;bottom:24px;z-index:900;width:min(380px,calc(100vw - 32px));background:#f7f2e7;color:#211b13;border:1px solid rgba(33,27,19,.18);border-radius:10px;box-shadow:0 18px 48px rgba(23,19,15,.28);padding:26px 26px 24px;transform:translateY(24px);opacity:0;visibility:hidden;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .35s ease,visibility 0s linear .45s;font-family:"Public Sans",system-ui,sans-serif}'
    + '.hsp.on{transform:none;opacity:1;visibility:visible;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .35s ease}'
    + '.hsp h2{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:1.3rem;line-height:1.2;margin:0 28px 8px 0}'
    + '.hsp p{margin:0 0 16px;font-size:.92rem;line-height:1.55;opacity:.78}'
    + '.hsp input{width:100%;box-sizing:border-box;padding:13px 14px;font:inherit;font-size:1rem;border:1px solid rgba(33,27,19,.28);border-radius:6px;background:#fff;color:#211b13;margin-bottom:10px}'
    + '.hsp input:focus{outline:2px solid #dd7a2e;outline-offset:1px}'
    + '.hsp .hsp-btn{display:block;width:100%;box-sizing:border-box;text-align:center;text-decoration:none;cursor:pointer;border:0;border-radius:6px;padding:14px 16px;font:inherit;font-weight:700;font-size:.95rem;background:#dd7a2e;color:#17130f;transition:transform .15s ease,box-shadow .15s ease}'
    + '.hsp .hsp-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(198,110,42,.3)}'
    + '.hsp .hsp-x{position:absolute;top:10px;right:10px;width:34px;height:34px;border:0;background:transparent;border-radius:50%;cursor:pointer;font-size:22px;line-height:1;color:#211b13;opacity:.6}'
    + '.hsp .hsp-x:hover{opacity:1;background:rgba(33,27,19,.07)}'
    + '.hsp .hsp-msg{font-size:.85rem;margin:8px 0 0;min-height:1em;opacity:1}'
    + '@media (max-width:560px){.hsp{right:16px;left:16px;bottom:16px;width:auto}}'
    + '@media (prefers-reduced-motion:reduce){.hsp,.hsp.on{transition:none}}';
  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  var inline = !!(POST_URL && ENTRY);
  var box = document.createElement('div');
  box.className = 'hsp'; box.setAttribute('role','dialog'); box.setAttribute('aria-labelledby','hspT'); box.setAttribute('aria-hidden','true');
  box.innerHTML = '<button class="hsp-x" type="button" aria-label="Close">&times;</button>'
    + '<h2 id="hspT">Get the Hestern newsletter</h2>'
    + '<p>One email a month with upcoming auctions and stories from the estates we handle. Free to join.</p>'
    + (inline
      ? '<form novalidate><input type="email" name="email" autocomplete="email" placeholder="Your email address" aria-label="Email address" required><button class="hsp-btn" type="submit">Sign Me Up</button><div class="hsp-msg" role="status" aria-live="polite"></div></form>'
      : '<a class="hsp-btn" href="'+FORM_URL+'" target="_blank" rel="noopener">Join the mailing list</a>');
  document.body.appendChild(box);

  var shown = false, closed = false;
  function open(){ if(shown||closed) return; shown = true; box.setAttribute('aria-hidden','false'); box.classList.add('on'); }
  function close(days){ closed = true; box.classList.remove('on'); box.setAttribute('aria-hidden','true'); set({until: Date.now() + (days||HIDE_DAYS)*864e5}); }
  box.querySelector('.hsp-x').addEventListener('click', function(){ close(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && shown && !closed) close(); });
  if(!inline){ box.querySelector('.hsp-btn').addEventListener('click', function(){ setTimeout(function(){ close(365); }, 300); }); }
  else {
    var f = box.querySelector('form'), msg = box.querySelector('.hsp-msg'), inp = f.querySelector('input');
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var v = (inp.value||'').trim();
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)){ msg.textContent = 'Please enter a valid email address.'; inp.focus(); return; }
      var fd = new FormData(); fd.append(ENTRY, v);
      msg.textContent = 'Signing you up…';
      fetch(POST_URL, {method:'POST', mode:'no-cors', body: fd}).then(function(){
        msg.textContent = "You're on the list. Thank you!"; f.querySelector('.hsp-btn').disabled = true; inp.disabled = true;
        set({until: Date.now() + 365*864e5}); setTimeout(function(){ box.classList.remove('on'); closed = true; }, 2600);
      }).catch(function(){ msg.innerHTML = 'Something went wrong. <a href="'+FORM_URL+'" target="_blank" rel="noopener">Sign up here instead</a>.'; });
    });
  }
  var ticking = false;
  function check(){
    ticking = false;
    var doc = document.documentElement;
    if (window.scrollY > 200 && (window.innerHeight + window.scrollY) >= doc.scrollHeight - 160) open();
  }
  window.addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(check); } }, {passive:true});
})();
