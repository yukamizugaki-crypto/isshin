/* ============================================================
   焼肉 一心 – script.js
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. ヘッダー スクロール時シャドウ
  ---------------------------------------------------------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------------------------
     2. ハンバーガーメニュー
  ---------------------------------------------------------- */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const spNav        = document.getElementById('sp-nav');

  if (hamburgerBtn && spNav && header) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = hamburgerBtn.classList.toggle('open');
      spNav.classList.toggle('open', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
      spNav.setAttribute('aria-hidden', String(!isOpen));
    });

    // リンクをタップしたら閉じる
    spNav.querySelectorAll('.sp-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('open');
        spNav.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        spNav.setAttribute('aria-hidden', 'true');
      });
    });

    // 外側タップで閉じる
    document.addEventListener('click', (e) => {
      if (spNav.classList.contains('open')) {
        if (!header.contains(e.target) && !spNav.contains(e.target)) {
          hamburgerBtn.classList.remove('open');
          spNav.classList.remove('open');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          spNav.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }

  /* ----------------------------------------------------------
     3. メニュースライダー
  ---------------------------------------------------------- */
  const track     = document.getElementById('slider-track');
  const prevBtn   = document.getElementById('slider-prev');
  const nextBtn   = document.getElementById('slider-next');
  const currentEl = document.getElementById('slide-current');
  const totalEl   = document.getElementById('slide-total');
  const dotsWrap  = document.getElementById('slider-dots');

  if (!track) return; // スライダーが存在しない場合は終了

  // 実際に表示されているスライド要素のみカウント
  const slides = Array.from(track.querySelectorAll('.slide')).filter(
    s => s.style.display !== 'none'
  );
  const total = slides.length;

  let current = 0;
  let startX  = 0;
  let isDragging = false;

  // 総数を表示
  if (totalEl) totalEl.textContent = total;

  // ドット生成
  if (dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `${i + 1}枚目`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  function updateSlider() {
    track.style.transform = `translateX(-${current * 100}%)`;
    if (currentEl) currentEl.textContent = current + 1;

    // ドット更新
    if (dotsWrap) {
      dotsWrap.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }

    // 矢印の disabled
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === total - 1;
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, total - 1));
    updateSlider();
  }

  function goNext() { goTo(current + 1); }
  function goPrev() { goTo(current - 1); }

  if (prevBtn) prevBtn.addEventListener('click', goPrev);
  if (nextBtn) nextBtn.addEventListener('click', goNext);

  // キーボード操作
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  goPrev();
    if (e.key === 'ArrowRight') goNext();
  });

  // タッチ / ドラッグ
  const sliderWrapper = document.getElementById('menu-slider-wrapper');

  function getClientX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  if (sliderWrapper) {
    sliderWrapper.addEventListener('touchstart', (e) => {
      startX    = getClientX(e);
      isDragging = true;
    }, { passive: true });

    sliderWrapper.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      const diff = startX - getClientX(e.changedTouches ? e.changedTouches : e);
      if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
      isDragging = false;
    }, { passive: true });

    sliderWrapper.addEventListener('mousedown', (e) => {
      startX     = getClientX(e);
      isDragging = true;
      e.preventDefault();
    });

    sliderWrapper.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      const diff = startX - getClientX(e);
      if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
      isDragging = false;
    });

    sliderWrapper.addEventListener('mouseleave', () => {
      isDragging = false;
    });
  }

  // 画像読み込みエラー時にスライド数を再計算
  slides.forEach((slide, i) => {
    const img = slide.querySelector('img');
    if (img) {
      img.addEventListener('error', () => {
        slide.style.display = 'none';
        // ドットも非表示
        const dots = dotsWrap ? dotsWrap.querySelectorAll('.dot') : [];
        if (dots[i]) dots[i].style.display = 'none';
      });
    }
  });

  // ヒーロー自動スライドショー（5秒間隔）
  const heroSlides = document.querySelectorAll('.hero-slide');
  if (heroSlides.length > 0) {
    let currentHeroSlide = 0;
    setInterval(() => {
      heroSlides[currentHeroSlide].classList.remove('active');
      currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
      heroSlides[currentHeroSlide].classList.add('active');
    }, 5000);
  }

  // 初期化
  updateSlider();

})();
