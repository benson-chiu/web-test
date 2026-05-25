// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function () {
  AOS.init({
    duration: 1000,
    once: true,
    offset: 100,
    easing: 'ease-out-cubic',
  });

  initVantaBg();
  initLoader();
  initPetals();
  initGallery();
  initScrollEffects();
  initCountdownDisplay();
  initScrollAnimations();
  initScrollHint();

  console.log('💕 電子喜帖載入完成！');
});

// ==================== Vanta Fog 背景 ====================
function initVantaBg() {
  if (typeof VANTA === 'undefined' || typeof VANTA.FOG === 'undefined') return;

  const vantaEffect = VANTA.FOG({
    el: '#vanta-bg',
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    // 色系：以網頁的紫色、藍紫、玫瑰金為主
    highlightColor: 0xf0d6ff,   // 淡薰衣草紫（亮部）
    midtoneColor:   0xc5a4f8,   // 主紫色（中間調）
    lowlightColor:  0x8fa8d8,   // 藍紫（暗部）
    baseColor:      0xf5eeff,   // 極淡紫白（底色）
    blurFactor:     0.62,       // 霧感模糊程度
    speed:          1.2,        // 流動速度（慢一點更浪漫）
    zoom:           0.8,        // 縮放（稍微拉遠讓霧更大片）
  });

  // 保底：舊裝置不支援 lvh 時，監聽 resize 強制更新 canvas 尺寸
  // 使用 debounce 避免 resize 觸發過於頻繁
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (vantaEffect && typeof vantaEffect.resize === 'function') {
        vantaEffect.resize();
      }
    }, 150);
  });
}

// ==================== 載入畫面 ====================
function initLoader() {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    setTimeout(() => {
      loader.remove();
    }, 500);
  }, 2000);
}

// ==================== 花瓣飄落 ====================
function initPetals() {
  const container = document.getElementById('globalPetalsContainer');
  if (!container) return;

  const isMobile = window.innerWidth < 768;
  const maxPetals = isMobile ? 12 : 20;
  let petalCount = 0;

  const petalColors = [
    'radial-gradient(circle, #ffc1e3, #ff6b9d)',
    'radial-gradient(circle, #ffb3d9, #ff4081)',
    'radial-gradient(circle, #ffd4e8, #ff8fab)',
    'radial-gradient(circle, #ffe0f0, #ffa5c0)',
    'radial-gradient(circle, #fff0f7, #ffcce0)',
  ];

  function createPetal() {
    if (petalCount >= maxPetals) return;
    petalCount++;

    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.style.left = (Math.random() * 90 + 5) + '%';

    const size = Math.random() * 12 + 14;
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    petal.style.background = petalColors[Math.floor(Math.random() * petalColors.length)];

    container.appendChild(petal);

    const duration = (Math.random() * 8 + 12) * 1000;
    const driftX = (Math.random() - 0.5) * 100;

    const animation = petal.animate([
      { transform: 'translate3d(0, -50px, 0) rotate(0deg) scale(0)', opacity: 0 },
      { transform: `translate3d(${driftX * 0.3}px, 25vh, 0) rotate(180deg) scale(1.1)`, opacity: 0.7, offset: 0.25 },
      { transform: `translate3d(${driftX * 0.5}px, 50vh, 0) rotate(360deg) scale(0.9)`, opacity: 0.7, offset: 0.5 },
      { transform: `translate3d(${driftX * 0.8}px, 75vh, 0) rotate(540deg) scale(1.05)`, opacity: 0.7, offset: 0.75 },
      { transform: `translate3d(${driftX}px, calc(100vh + 50px), 0) rotate(720deg) scale(0.8)`, opacity: 0 },
    ], { duration, easing: 'linear', fill: 'forwards' });

    animation.onfinish = () => {
      petal.remove();
      petalCount--;
    };
  }

  setTimeout(() => {
    const initialCount = isMobile ? 2 : 4;
    for (let i = 0; i < initialCount; i++) {
      setTimeout(createPetal, i * 800);
    }
    setInterval(() => {
      if (Math.random() > 0.4) createPetal();
    }, isMobile ? 2500 : 1500);
  }, 1000);
}

// ==================== 側邊選單 ====================
function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const menuToggle = document.querySelector('.menu-toggle');

  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');

  const isOpen = sidebar.classList.contains('active');
  document.body.style.overflow = isOpen ? 'hidden' : 'auto';

  // 選單開啟時維持旋轉狀態，關閉後恢復
  if (isOpen) {
    menuToggle.classList.add('menu-open');
  } else {
    menuToggle.classList.remove('menu-open');
  }
}

// ESC 鍵關閉選單 / 模態框
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('active')) toggleMenu();

    const modal = document.querySelector('.image-modal');
    if (modal) closeImageModal(modal);
  }
});

// ==================== 音樂控制 ====================
let isMusicPlaying = false;

function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  const musicBtn = document.getElementById('musicToggle');
  if (!audio) return;

  if (isMusicPlaying) {
    audio.pause();
    musicBtn.textContent = '🔇';   // 靜音圖示，讓使用者知道目前靜音
    musicBtn.classList.remove('playing');
    isMusicPlaying = false;
  } else {
    audio.play()
      .then(() => {
        musicBtn.textContent = '🎶'; // 播放中圖示
        musicBtn.classList.add('playing');
        isMusicPlaying = true;
      })
      .catch((error) => console.log('音樂播放失敗:', error));
  }
}

document.addEventListener('visibilitychange', function () {
  const audio = document.getElementById('bgMusic');
  if (!audio) return;
  if (document.hidden && isMusicPlaying) {
    audio.pause();
  } else if (!document.hidden && isMusicPlaying) {
    audio.play();
  }
});

// ==================== Canva 圖片載入處理 ====================
document.addEventListener('DOMContentLoaded', function () {
  const canvaGif = document.querySelector('.canva-gif');
  const imageLoading = document.querySelector('.image-loading');
  const imageError = document.querySelector('.image-error');

  if (!canvaGif) return;

  canvaGif.addEventListener('load', function () {
    canvaGif.classList.add('loaded');
    if (imageLoading) imageLoading.style.display = 'none';
  });

  canvaGif.addEventListener('error', function () {
    if (imageLoading) imageLoading.style.display = 'none';
    if (imageError) imageError.style.display = 'flex';
  });

  if (canvaGif.complete) {
    if (canvaGif.naturalHeight !== 0) {
      canvaGif.classList.add('loaded');
      if (imageLoading) imageLoading.style.display = 'none';
    } else {
      if (imageLoading) imageLoading.style.display = 'none';
      if (imageError) imageError.style.display = 'flex';
    }
  }
});

function retryLoadImage() {
  const canvaGif = document.querySelector('.canva-gif');
  const imageError = document.querySelector('.image-error');
  const imageLoading = document.querySelector('.image-loading');

  if (canvaGif && imageError && imageLoading) {
    imageError.style.display = 'none';
    imageLoading.style.display = 'flex';
    const originalSrc = canvaGif.src.split('?')[0];
    canvaGif.src = originalSrc + '?t=' + new Date().getTime();
  }
}

// ==================== 相簿功能 ====================
function initGallery() {
  document.querySelectorAll('.gallery-card').forEach((item) => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const img = this.querySelector('img');
      if (img) openImageModal(img);
    });
  });
}

function openImageModal(img) {
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.95); display: flex; align-items: center;
    justify-content: center; z-index: 10000; cursor: pointer; padding: 20px;
  `;

  const imgContainer = document.createElement('div');
  imgContainer.style.cssText = `
    position: relative; max-width: 90%; max-height: 90%;
    animation: zoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  `;

  const modalImg = document.createElement('img');
  modalImg.src = img.src;
  modalImg.alt = img.alt;
  modalImg.style.cssText = `
    max-width: 100%; max-height: 90vh; object-fit: contain;
    border-radius: 15px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  `;

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = `
    position: fixed; top: 30px; right: 30px;
    background: rgba(255,255,255,0.2); border: none; color: white;
    font-size: 2.5rem; width: 60px; height: 60px; border-radius: 50%;
    cursor: pointer; transition: all 0.3s ease;
    display: flex; align-items: center; justify-content: center; z-index: 10001;
  `;
  closeBtn.addEventListener('mouseenter', function () {
    this.style.background = 'rgba(255,255,255,0.3)';
    this.style.transform = 'rotate(90deg) scale(1.1)';
  });
  closeBtn.addEventListener('mouseleave', function () {
    this.style.background = 'rgba(255,255,255,0.2)';
    this.style.transform = 'rotate(0deg) scale(1)';
  });

  if (img.alt) {
    const caption = document.createElement('div');
    caption.textContent = img.alt;
    caption.style.cssText = `
      position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
      color: white; font-size: 1.2rem; background: rgba(0,0,0,0.5);
      padding: 15px 30px; border-radius: 50px; max-width: 80%; text-align: center;
    `;
    modal.appendChild(caption);
  }

  imgContainer.appendChild(modalImg);
  modal.appendChild(imgContainer);
  modal.appendChild(closeBtn);
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  const closeModal = () => closeImageModal(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  closeBtn.addEventListener('click', closeModal);

  let touchStartY = 0, touchStartX = 0;
  modal.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
  });
  modal.addEventListener('touchend', (e) => {
    const diffY = touchStartY - e.changedTouches[0].clientY;
    const diffX = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diffY) > 100 || Math.abs(diffX) > 100) closeModal();
  });
}

function closeImageModal(modal) {
  modal.style.animation = 'fadeOut 0.3s ease';
  setTimeout(() => {
    modal.remove();
    document.body.style.overflow = 'auto';
  }, 300);
}

// ==================== 地圖功能 ====================
function openMap() {
  const address = '台北君悅大飯店';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  if (isMobile) {
    window.location.href = url;
  } else {
    window.open(url, '_blank');
  }
}

function openStreetView() {
  const lat = 25.0368759;
  const lng = 121.5656493;
  window.open(
    `https://www.google.com/maps/@${lat},${lng},3a,75y,90t/data=!3m6!1e1!3m4!1s${encodeURIComponent('街景ID')}!2e0!7i16384!8i8192`,
    '_blank'
  );
}

// ==================== 滾動效果 ====================
function initScrollEffects() {
  let lastScrollTop = 0;
  const menuToggle = document.querySelector('.menu-toggle');
  const musicToggle = document.querySelector('.music-toggle');

  window.addEventListener('scroll', function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > 100) {
      menuToggle.classList.add('hidden-up');
      musicToggle.classList.add('hidden-down');
    } else {
      menuToggle.classList.remove('hidden-up');
      musicToggle.classList.remove('hidden-down');
    }

    lastScrollTop = scrollTop;
  }, { passive: true });
}

// ==================== 倒數計時器 ====================
function initCountdownDisplay() {
  const weddingDate = new Date('2026-10-25T12:00:00').getTime();

  const days2 = document.getElementById('days2');
  const hours2 = document.getElementById('hours2');
  const minutes2 = document.getElementById('minutes2');
  const seconds2 = document.getElementById('seconds2');

  function updateCountdown() {
    const distance = weddingDate - new Date().getTime();

    if (distance < 0) {
      if (days2) days2.textContent = '000';
      if (hours2) hours2.textContent = '00';
      if (minutes2) minutes2.textContent = '00';
      if (seconds2) seconds2.textContent = '00';
      return;
    }

    if (days2) days2.textContent = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(3, '0');
    if (hours2) hours2.textContent = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
    if (minutes2) minutes2.textContent = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    if (seconds2) seconds2.textContent = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();
}

// ==================== 滾動動畫觸發 ====================
function initScrollAnimations() {
  // 檢測是否為 iOS Safari
  const isIOSSafari = /iPhone|iPad|iPod/.test(navigator.userAgent) && 
                      /Safari/.test(navigator.userAgent) && 
                      !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);

  // iOS Safari 使用更保守的設定
  const observerOptions = {
    threshold: isIOSSafari ? 0.05 : 0.1,
    rootMargin: isIOSSafari ? '0px 0px -50px 0px' : '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target;
        
        // 使用 requestAnimationFrame 確保渲染完成
        requestAnimationFrame(() => {
          // 添加動畫類
          target.classList.add('animate-in');
          
          // 動畫結束後清理 will-change
          target.addEventListener('animationend', function handleAnimationEnd() {
            target.classList.add('animation-complete');
            target.removeEventListener('animationend', handleAnimationEnd);
          }, { once: true });
        });
        
        // 停止觀察已觸發的元素
        observer.unobserve(target);
      }
    });
  }, observerOptions);

  // 觀察所有需要動畫的元素
  document.querySelectorAll('.schedule-item, .date-card, .location-card')
    .forEach((el) => {
      // 確保元素有初始狀態
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      observer.observe(el);
    });
}

// ==================== 滾動提示功能 ====================
function initScrollHint() {
  const overlay = document.getElementById('scrollHintOverlay');
  if (!overlay) return;

  let hasScrolled = false;
  let hintTimer = null;

  // 3秒後顯示提示
  function showHint() {
    if (!hasScrolled) {
      overlay.classList.add('show');
    }
  }

  // 隱藏提示
  function hideHint() {
    overlay.classList.remove('show');
    hasScrolled = true;
    
    // 清除計時器
    if (hintTimer) {
      clearTimeout(hintTimer);
      hintTimer = null;
    }
    
    // 移除滾動監聽
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('wheel', handleScroll);
    window.removeEventListener('touchmove', handleScroll);
  }

  // 處理滾動事件
  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // 只要滾動超過 50px 就視為已滾動
    if (scrollTop > 50) {
      hideHint();
    }
  }

  // 載入完成後等待 3 秒
  window.addEventListener('load', function() {
    // 確保載入畫面已經消失後才開始計時
    setTimeout(() => {
      hintTimer = setTimeout(showHint, 3000);
    }, 2500); // 配合載入畫面的 2 秒延遲
  });

  // 監聽滾動事件
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('wheel', handleScroll, { passive: true });
  window.addEventListener('touchmove', handleScroll, { passive: true });

  // 點擊遮罩也可以關閉（可選）
  overlay.addEventListener('click', hideHint);
}

// ==================== 動畫樣式注入 ====================
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
  @keyframes zoomIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .image-modal { animation: fadeIn 0.3s ease; }
  .image-modal img { animation: zoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
`;
document.head.appendChild(style);

// ==================== 視窗 resize 處理 ====================
let resizeTimer;
window.addEventListener('resize', function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {
    if (window.innerWidth > 768) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('overlay');
      if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    }
    AOS.refresh();
  }, 250);
});

// ==================== 圖片延遲載入 ====================
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '50px' });

  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    imageObserver.observe(img);
  });
}

// ==================== 錯誤處理 ====================
window.addEventListener('error', function (e) {
  console.error('發生錯誤:', e.error);
});
