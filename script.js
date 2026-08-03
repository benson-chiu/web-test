// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function () {
  AOS.init({
    duration: 1000,
    once: true,
    offset: 100,
    easing: 'ease-out-cubic',
  });

  initLoader();
  initPetals();
  initGallery();
  initScrollEffects();
  initCountdownDisplay();
  initScrollAnimations();
  initScrollHint();

  console.log('💕 電子喜帖載入完成！');
});

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
  const maxPetals = isMobile ? 15 : 20;
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

  const isOpening = !sidebar.classList.contains('active');

  if (isOpening) {
    // 🔒 開啟選單前先鎖定頁面寬度
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = scrollbarWidth + 'px';
    document.body.style.overflow = 'hidden';
    
    // 同時鎖定固定定位元素,避免它們偏移
    menuToggle.style.marginRight = scrollbarWidth + 'px';
    const musicToggle = document.querySelector('.music-toggle');
    if (musicToggle) {
      musicToggle.style.marginRight = scrollbarWidth + 'px';
    }
  } else {
    // 🔓 關閉選單時恢復
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';
    menuToggle.style.marginRight = '';
    const musicToggle = document.querySelector('.music-toggle');
    if (musicToggle) {
      musicToggle.style.marginRight = '';
    }
  }

  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');

  // 選單開啟時維持旋轉狀態,關閉後恢復
  if (isOpening) {
    menuToggle.classList.add('menu-open');
  } else {
    menuToggle.classList.remove('menu-open');
  }
}

// ESC 鍵關閉選單
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('active')) toggleMenu();
  }
});

// ==================== 音樂控制 ====================
let isMusicPlaying = false;

function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  const musicIcon = document.getElementById('musicIcon');
  if (!audio) return;

  if (isMusicPlaying) {
    audio.pause();
    if (musicIcon) musicIcon.textContent = '🔈';
    document.getElementById('musicToggle').classList.remove('playing');
    isMusicPlaying = false;
  } else {
    audio.play()
      .then(() => {
        if (musicIcon) musicIcon.textContent = '🔊';
        document.getElementById('musicToggle').classList.add('playing');
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

// 切換音樂播放
function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  const musicIcon = document.getElementById('musicIcon');
  const musicToggle = document.getElementById('musicToggle');
  
  if (!audio) return;

  // 標記使用者已互動
  hasUserInteracted = true;

  if (isMusicPlaying) {
    // 暫停音樂
    audio.pause();
    if (musicIcon) musicIcon.textContent = '🔈';
    if (musicToggle) musicToggle.classList.remove('playing');
    isMusicPlaying = false;
  } else {
    // 播放音樂
    audio.play()
      .then(() => {
        if (musicIcon) musicIcon.textContent = '🔊';
        if (musicToggle) musicToggle.classList.add('playing');
        isMusicPlaying = true;
      })
      .catch((error) => console.log('音樂播放失敗:', error));
  }
}

// 頁面可見性變化時的處理
document.addEventListener('visibilitychange', function () {
  const audio = document.getElementById('bgMusic');
  if (!audio) return;
  
  if (document.hidden && isMusicPlaying) {
    audio.pause();
  } else if (!document.hidden && isMusicPlaying) {
    audio.play().catch(err => console.log('恢復播放失敗:', err));
  }
});

// ==================== Canva 影片載入處理 ====================
document.addEventListener('DOMContentLoaded', function () {
  const video = document.getElementById('canvaVideo');
  const videoLoading = document.getElementById('videoLoading');
  const videoError = document.getElementById('videoError');

  if (!video) return;

  // 可以開始播放時隱藏載入提示
  video.addEventListener('canplay', function () {
    if (videoLoading) videoLoading.style.display = 'none';
  });

  // <source> 載入失敗
  video.addEventListener('error', function () {
    if (videoLoading) videoLoading.style.display = 'none';
    if (videoError) videoError.style.display = 'flex';
  });

  // 若瀏覽器已快取，readyState >= 3 代表可以播放
  if (video.readyState >= 3) {
    if (videoLoading) videoLoading.style.display = 'none';
  }
});

function retryLoadImage() {
  const video = document.getElementById('canvaVideo');
  const videoError = document.getElementById('videoError');
  const videoLoading = document.getElementById('videoLoading');

  if (!video) return;

  videoError.style.display = 'none';
  videoLoading.style.display = 'flex';

  // 加時間戳強制重新請求
  const source = video.querySelector('source');
  if (source) {
    const originalSrc = source.src.split('?')[0];
    source.src = originalSrc + '?t=' + Date.now();
  }
  video.load(); // 重新載入影片

  video.addEventListener('canplay', function onCanPlay() {
    if (videoLoading) videoLoading.style.display = 'none';
    video.removeEventListener('canplay', onCanPlay);
  });

  video.addEventListener('error', function onError() {
    if (videoLoading) videoLoading.style.display = 'none';
    if (videoError) videoError.style.display = 'flex';
    video.removeEventListener('error', onError);
  });
}

// ==================== 關於我們照片載入處理 ====================
document.addEventListener('DOMContentLoaded', function () {
  const personPhotos = document.querySelectorAll('.person-photo');

  personPhotos.forEach(photo => {
    const photoFrame = photo.closest('.photo-frame');
    const loadingEl = photoFrame.querySelector('.photo-loading');
    const errorEl = photoFrame.querySelector('.photo-error');

    // 照片載入成功
    photo.addEventListener('load', function () {
      if (loadingEl) loadingEl.style.display = 'none';
      photo.classList.add('loaded');
    });

    // 照片載入失敗
    photo.addEventListener('error', function () {
      if (loadingEl) loadingEl.style.display = 'none';
      if (errorEl) errorEl.style.display = 'flex';
      photo.style.display = 'none';
    });

    // 若照片已快取，直接隱藏載入提示
    if (photo.complete) {
      if (loadingEl) loadingEl.style.display = 'none';
      photo.classList.add('loaded');
    }
  });
});

// ==================== 字卡圖片載入處理 ====================
document.addEventListener('DOMContentLoaded', function () {
  const messageCardImg = document.querySelector('.message-card-image');
  
  if (!messageCardImg) return;

  const container = messageCardImg.closest('.message-card-container');
  const loadingEl = container.querySelector('.message-card-loading');
  const errorEl = container.querySelector('.message-card-error');

  // 字卡載入成功
  messageCardImg.addEventListener('load', function () {
    if (loadingEl) loadingEl.style.display = 'none';
    messageCardImg.classList.add('loaded');
  });

  // 字卡載入失敗
  messageCardImg.addEventListener('error', function () {
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'flex';
    messageCardImg.style.display = 'none';
  });

  // 若字卡已快取，直接隱藏載入提示
  if (messageCardImg.complete) {
    if (loadingEl) loadingEl.style.display = 'none';
    messageCardImg.classList.add('loaded');
  }
});

// 字卡重新載入
function retryMessageCard() {
  const messageCardImg = document.querySelector('.message-card-image');
  const container = messageCardImg.closest('.message-card-container');
  const loadingEl = container.querySelector('.message-card-loading');
  const errorEl = container.querySelector('.message-card-error');

  if (!messageCardImg) return;

  // 清除錯誤狀態
  if (errorEl) errorEl.style.display = 'none';
  if (loadingEl) loadingEl.style.display = 'flex';
  messageCardImg.style.display = '';

  // 加上時間戳強制重新請求
  const originalSrc = messageCardImg.src.split('?')[0];
  messageCardImg.src = originalSrc + '?t=' + Date.now();

  // 重新綁定事件
  messageCardImg.onload = function () {
    if (loadingEl) loadingEl.style.display = 'none';
    messageCardImg.classList.add('loaded');
    messageCardImg.onload = null;
  };

  messageCardImg.onerror = function () {
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'flex';
    messageCardImg.style.display = 'none';
  };
}

// ==================== 相簿功能 ====================
// url: 原始解析度大圖 (album/，已由使用者手動壓縮至約2MB，維持原有畫質)
// thumb: 縮圖用的小圖 (album/thumbs/，約300x210)，用於底部縮圖列表
let photos = [
  { url: 'album/photo1.jpg',  thumb: 'album/thumbs/photo1.jpg',  alt: '照片 1'  },
  { url: 'album/photo2.jpg',  thumb: 'album/thumbs/photo2.jpg',  alt: '照片 2'  },
  { url: 'album/photo3.jpg',  thumb: 'album/thumbs/photo3.jpg',  alt: '照片 3'  },
  { url: 'album/photo4.jpg',  thumb: 'album/thumbs/photo4.jpg',  alt: '照片 4'  },
  { url: 'album/photo5.jpg',  thumb: 'album/thumbs/photo5.jpg',  alt: '照片 5'  },
  { url: 'album/photo6.jpg',  thumb: 'album/thumbs/photo6.jpg',  alt: '照片 6'  },
  { url: 'album/photo7.jpg',  thumb: 'album/thumbs/photo7.jpg',  alt: '照片 7'  },
  { url: 'album/photo8.jpg',  thumb: 'album/thumbs/photo8.jpg',  alt: '照片 8'  },
  { url: 'album/photo9.jpg',  thumb: 'album/thumbs/photo9.jpg',  alt: '照片 9'  },
  { url: 'album/photo10.jpg', thumb: 'album/thumbs/photo10.jpg', alt: '照片 10' },
  { url: 'album/photo11.jpg', thumb: 'album/thumbs/photo11.jpg', alt: '照片 11' },
  { url: 'album/photo12.jpg', thumb: 'album/thumbs/photo12.jpg', alt: '照片 12' },
  { url: 'album/photo13.jpg', thumb: 'album/thumbs/photo13.jpg', alt: '照片 13' },
  { url: 'album/photo14.jpg', thumb: 'album/thumbs/photo14.jpg', alt: '照片 14' },
  { url: 'album/photo15.jpg', thumb: 'album/thumbs/photo15.jpg', alt: '照片 15' },
  { url: 'album/photo16.jpg', thumb: 'album/thumbs/photo16.jpg', alt: '照片 16' },
  { url: 'album/photo17.jpg', thumb: 'album/thumbs/photo17.jpg', alt: '照片 17' },
  { url: 'album/photo18.jpg', thumb: 'album/thumbs/photo18.jpg', alt: '照片 18' },
  { url: 'album/photo19.jpg', thumb: 'album/thumbs/photo19.jpg', alt: '照片 19' },
  { url: 'album/photo20.jpg', thumb: 'album/thumbs/photo20.jpg', alt: '照片 20' },
];

let currentSlide = 0;
let autoPlayInterval = null;
let isAutoPlaying = true;
let galleryStarted = false; // 相簿是否已開始載入(避免尚未捲動到相簿區塊就先下載大圖)
const autoPlayDelay = 5000; // 5秒自動切換

// 每張照片的載入狀態快取：'loading' | 'loaded' | 'error'，避免重複下載同一張圖
const photoLoadState = {};
// 已建立的 Image() 物件快取，載入完成後可直接從瀏覽器快取取得，不會重新發請求
const photoImageCache = {};

// 交叉淡化用的兩個 img 元素，輪流擔任「顯示中」與「下一張淡入」的角色
let activeImgEl = null;
let inactiveImgEl = null;

function initGallery() {
  generateThumbnails();
  setupKeyboardControls();

  activeImgEl = document.getElementById('slideshowImgA');
  inactiveImgEl = document.getElementById('slideshowImgB');

  const gallerySection = document.getElementById('gallery');

  // 使用 IntersectionObserver：捲動到相簿區塊附近才開始載入大圖與自動播放，
  // 避免頁面剛載入就搶頻寬下載本區的大圖，減少裝置資源占用
  if (gallerySection && 'IntersectionObserver' in window) {
    const galleryObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!galleryStarted) {
            galleryStarted = true;
            showSlide(0);
            preloadAllPhotos(); // 進入相簿區後，背景依序預載全部大圖
            console.log('📸 相簿輪播初始化完成');
          }
          if (isAutoPlaying) startAutoPlay();
        } else {
          stopAutoPlay();
        }
      });
    }, { rootMargin: '300px 0px 300px 0px', threshold: 0.01 });

    galleryObserver.observe(gallerySection);
  } else {
    // 不支援 IntersectionObserver 的舊瀏覽器：維持原本行為
    galleryStarted = true;
    showSlide(0);
    startAutoPlay();
    preloadAllPhotos();
    console.log('📸 相簿輪播初始化完成');
  }
}

// 取得(或建立)某張照片的預載 Image 物件，並回傳其載入狀態
function loadPhoto(index) {
  const photo = photos[index];
  if (!photo) return null;

  if (!photoImageCache[index]) {
    const imageObj = new Image();
    photoLoadState[index] = 'loading';

    imageObj.onload = function () {
      photoLoadState[index] = 'loaded';
    };
    imageObj.onerror = function () {
      photoLoadState[index] = 'error';
    };

    imageObj.src = photo.url;
    photoImageCache[index] = imageObj;
  }

  return photoImageCache[index];
}

// 背景依序（低優先序、限制併發）預載全部照片，讓切換時大多能直接命中快取
function preloadAllPhotos() {
  const concurrency = 3; // 同時最多3張，避免瞬間塞爆頻寬
  let nextIndex = 0;

  function loadNext() {
    if (nextIndex >= photos.length) return;
    const index = nextIndex++;
    const imageObj = loadPhoto(index);

    if (!imageObj) { loadNext(); return; }

    if (photoLoadState[index] === 'loaded' || photoLoadState[index] === 'error') {
      loadNext();
      return;
    }

    imageObj.addEventListener('load', loadNext, { once: true });
    imageObj.addEventListener('error', loadNext, { once: true });
  }

  for (let i = 0; i < concurrency; i++) {
    loadNext();
  }
}

// 顯示指定照片（不滾動頁面）：雙層 img 交叉淡化，全程保持清晰畫面
function showSlide(index) {
  // 確保索引在有效範圍內
  if (index >= photos.length) {
    currentSlide = 0;
  } else if (index < 0) {
    currentSlide = photos.length - 1;
  } else {
    currentSlide = index;
  }

  const targetIndex = currentSlide;
  const photo = photos[targetIndex];
  const slideshowMain = activeImgEl ? activeImgEl.closest('.slideshow-main') : null;
  const errorEl = document.getElementById('slideshowError');
  const loadingIndicator = document.getElementById('slideLoadingIndicator');
  const counter = document.getElementById('slideshowCounter');

  if (activeImgEl && inactiveImgEl && photo) {
    // 切換前先清除錯誤狀態
    if (slideshowMain) slideshowMain.classList.remove('has-error');
    if (errorEl) errorEl.style.display = 'none';

    const imageObj = loadPhoto(targetIndex);
    const state = photoLoadState[targetIndex];

    // 顯示 loading 提示的計時器：只有載入超過 200ms 才顯示，避免快取命中時的閃爍
    let loadingTimer = null;
    if (loadingIndicator) {
      loadingTimer = setTimeout(() => {
        loadingIndicator.classList.add('show');
      }, 200);
    }

    function swapToInactive() {
      inactiveImgEl.src = photo.url;
      inactiveImgEl.alt = photo.alt;

      // 下一輪畫面更新時才切換 class，確保瀏覽器已完成新圖的繪製再開始淡入淡出
      requestAnimationFrame(() => {
        inactiveImgEl.classList.add('active');
        activeImgEl.classList.remove('active');
        // 交換兩者角色，下一次切換時對調
        const temp = activeImgEl;
        activeImgEl = inactiveImgEl;
        inactiveImgEl = temp;
      });

      if (loadingTimer) clearTimeout(loadingTimer);
      if (loadingIndicator) loadingIndicator.classList.remove('show');

      // 大圖成功後，若對應縮圖仍顯示錯誤圖示，同步修復
      syncThumbOnSuccess(targetIndex, photo.url);
    }

    if (state === 'loaded') {
      // 已經預載完成（多數情況）：幾乎瞬間交叉淡化
      swapToInactive();
    } else if (state === 'error') {
      if (loadingTimer) clearTimeout(loadingTimer);
      if (loadingIndicator) loadingIndicator.classList.remove('show');
      if (slideshowMain) slideshowMain.classList.add('has-error');
      if (errorEl) errorEl.style.display = 'flex';
    } else {
      // 尚未載入完成：等待載入完成後才交叉淡化，全程不出現半清晰的過渡畫面
      imageObj.addEventListener('load', function onLoad() {
        if (currentSlide === targetIndex) swapToInactive();
        imageObj.removeEventListener('load', onLoad);
      });
      imageObj.addEventListener('error', function onError() {
        if (currentSlide === targetIndex) {
          if (loadingTimer) clearTimeout(loadingTimer);
          if (loadingIndicator) loadingIndicator.classList.remove('show');
          if (slideshowMain) slideshowMain.classList.add('has-error');
          if (errorEl) errorEl.style.display = 'flex';
        }
        imageObj.removeEventListener('error', onError);
      });
    }
  }

  if (counter) {
    counter.textContent = `${currentSlide + 1} / ${photos.length}`;
  }

  // 更新縮圖狀態（不滾動頁面）
  updateThumbnails();

  // 重置進度條
  resetProgressBar();

  // 確保下一張與上一張也已預載，切換時能立即命中快取
  loadPhoto((currentSlide + 1) % photos.length);
  loadPhoto((currentSlide - 1 + photos.length) % photos.length);
}

// 大圖成功後同步修復對應縮圖（若之前縮圖載入失敗顯示了錯誤圖示）
function syncThumbOnSuccess(index, src) {
  const thumbs = document.querySelectorAll('.thumbnail-item');
  const thumb = thumbs[index];
  if (!thumb || !thumb.classList.contains('thumb-error')) return;

  thumb.classList.remove('thumb-error');
  const errorIcon = thumb.querySelector('.thumb-error-icon');
  if (errorIcon) errorIcon.remove();

  const thumbImg = thumb.querySelector('img');
  if (thumbImg) {
    thumbImg.src = src;
    thumbImg.style.display = '';
    thumbImg.onerror = function () { setThumbError(thumb, thumbImg); };
  }
}

// 相簿圖片重新載入（大圖載入失敗時的手動重試）
function retrySlideshowImage() {
  const slideshowMain = activeImgEl ? activeImgEl.closest('.slideshow-main') : null;
  const errorEl = document.getElementById('slideshowError');

  if (!activeImgEl) return;

  const photo = photos[currentSlide];

  // 清除大圖錯誤狀態
  if (slideshowMain) slideshowMain.classList.remove('has-error');
  if (errorEl) errorEl.style.display = 'none';

  // 加上時間戳強制重新請求，並清除快取狀態
  const originalSrc = photo.url.split('?')[0];
  const newSrc = originalSrc + '?t=' + Date.now();

  const retryImg = new Image();
  retryImg.onload = function () {
    photoLoadState[currentSlide] = 'loaded';
    photoImageCache[currentSlide] = retryImg;
    activeImgEl.src = newSrc;
    activeImgEl.alt = photo.alt;
    activeImgEl.classList.add('active');
    syncThumbOnSuccess(currentSlide, newSrc);
  };
  retryImg.onerror = function () {
    photoLoadState[currentSlide] = 'error';
    if (slideshowMain) slideshowMain.classList.add('has-error');
    if (errorEl) errorEl.style.display = 'flex';
  };
  retryImg.src = newSrc;
}

// 切換照片
function changeSlide(direction) {
  showSlide(currentSlide + direction);
  
  // 手動切換時重啟自動播放
  if (isAutoPlaying) {
    restartAutoPlay();
  }
}

// 跳到指定照片
function jumpToSlide(index) {
  showSlide(index);
  
  // 手動切換時重啟自動播放
  if (isAutoPlaying) {
    restartAutoPlay();
  }
}

// 設定縮圖錯誤狀態
function setThumbError(thumb, img) {
  img.style.display = 'none';
  thumb.classList.add('thumb-error');
  const icon = document.createElement('span');
  icon.className = 'thumb-error-icon';
  icon.textContent = '⚠️';
  thumb.appendChild(icon);
}

// 生成縮圖
function generateThumbnails() {
  const container = document.getElementById('slideshowThumbnails');
  if (!container) return;

  container.innerHTML = '';

  photos.forEach((photo, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'thumbnail-item';
    thumb.onclick = () => jumpToSlide(index);

    const img = document.createElement('img');
    img.src = photo.thumb;
    img.alt = photo.alt;
    img.loading = 'lazy';
    img.decoding = 'async';

    // 縮圖載入失敗時，改試大圖(photo.url)，仍失敗才顯示錯誤圖示
    img.onerror = function () {
      if (img.src.indexOf(photo.url) === -1) {
        img.onerror = function () { setThumbError(thumb, img); };
        img.src = photo.url;
        return;
      }
      setThumbError(thumb, img);
    };

    thumb.appendChild(img);
    container.appendChild(thumb);
  });
}

// 更新縮圖狀態（不滾動頁面，只滾動縮圖容器）
function updateThumbnails() {
  const thumbnails = document.querySelectorAll('.thumbnail-item');
  thumbnails.forEach((thumb, index) => {
    thumb.classList.toggle('active', index === currentSlide);
  });

  // 只滾動縮圖容器，不滾動整個頁面
  const container = document.getElementById('slideshowThumbnails');
  const activeThumb = thumbnails[currentSlide];
  if (container && activeThumb) {
    const scrollLeft = activeThumb.offsetLeft - (container.offsetWidth / 2) + (activeThumb.offsetWidth / 2);
    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  }
}

// 開始自動播放
function startAutoPlay() {
  if (autoPlayInterval) return;

  autoPlayInterval = setInterval(() => {
    changeSlide(1);
  }, autoPlayDelay);

  animateProgressBar();
}

// 停止自動播放
function stopAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
  resetProgressBar();
}

// 重啟自動播放
function restartAutoPlay() {
  stopAutoPlay();
  startAutoPlay();
}

// 切換自動播放
function toggleAutoPlay() {
  const playIcon = document.getElementById('playIcon');
  
  if (isAutoPlaying) {
    stopAutoPlay();
    isAutoPlaying = false;
    if (playIcon) playIcon.textContent = 'play_arrow';
  } else {
    startAutoPlay();
    isAutoPlaying = true;
    if (playIcon) playIcon.textContent = 'pause';
  }
}

// 進度條動畫
function animateProgressBar() {
  const progressBar = document.getElementById('progressBar');
  if (!progressBar) return;

  progressBar.style.transition = 'none';
  progressBar.style.width = '0%';

  setTimeout(() => {
    progressBar.style.transition = `width ${autoPlayDelay}ms linear`;
    progressBar.style.width = '100%';
  }, 50);
}

// 重置進度條
function resetProgressBar() {
  const progressBar = document.getElementById('progressBar');
  if (!progressBar) return;

  progressBar.style.transition = 'none';
  progressBar.style.width = '0%';
}

// 鍵盤控制
function setupKeyboardControls() {
  document.addEventListener('keydown', (e) => {
    // 只在相簿區域可見時才響應
    const gallerySection = document.getElementById('gallery');
    if (!gallerySection) return;

    const rect = gallerySection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (!isVisible) return;

    if (e.key === 'ArrowLeft') {
      changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
      changeSlide(1);
    } else if (e.key === ' ') {
      e.preventDefault();
      toggleAutoPlay();
    }
  });
}

// 頁面離開時停止自動播放
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoPlay();
  } else if (isAutoPlaying) {
    startAutoPlay();
  }
});

// ==================== 地圖功能 ====================
function openDonggangMap() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const url = `https://maps.app.goo.gl/Wa4EyWELkW3rkMAs9`;
  if (isMobile) {
    window.location.href = url;
  } else {
    window.open(url, '_blank');
  }
}

function openDonggangStreetView() {
  window.open(
    `https://www.google.com/maps/place/%E7%A6%8F%E7%81%A3%E8%8E%8A%E5%9C%92/@22.4584235,120.4828357,3a,75y,242.24h,93.29t/data=!3m8!1e1!3m6!1sCIHM0ogKEICAgICE4Mma9wE!2e10!3e11!6shttps:%2F%2Flh3.googleusercontent.com%2Fgpms-cs-s%2FABJJf51Qa3a9eGvO0ni4EyKCZjq4qbeLuE4b4P6Oa224j2FlPeKFdcKJoGkf40vOzqAtPZBUAwGtmsPsJJDvtcesMmAMklH-8cecZF5FXAljoafXpcR60Nz78WO0jEQ3-UneiBp4Db5-%3Dw900-h600-k-no-pi-3.2905667757587196-ya225.49568830577712-ro0-fo100!7i13312!8i6656!4m9!3m8!1s0x3471e052a123561d:0x64d700659bdb2a19!5m2!4m1!1i2!8m2!3d22.4578971!4d120.4825316!16s%2Fg%2F1vs1pm2f?entry=tts&g_ep=EgoyMDI2MDUyNi4wIPu8ASoASAFQAw%3D%3D`,
    '_blank'
  );
}

function openTainanMap() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const url = `https://maps.app.goo.gl/auiasnxLaj9V6eUq9`;
  if (isMobile) {
    window.location.href = url;
  } else {
    window.open(url, '_blank');
  }
}

function openTainanStreetView() {
  window.open(
    `https://www.google.com/maps/@22.9968344,120.214481,3a,90y,186.15h,107.44t/data=!3m7!1e1!3m5!1sfsEHFm8nVM5AWKC18_l6_Q!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-17.438390237761013%26panoid%3DfsEHFm8nVM5AWKC18_l6_Q%26yaw%3D186.14575567139212!7i16384!8i8192?entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D`,
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

  const days = document.getElementById('days');
  const days_plus = document.getElementById('days_plus');

  const hours = document.getElementById('hours');
  const minutes = document.getElementById('minutes');
  const seconds = document.getElementById('seconds');

  function updateCountdown() {
    const distance = weddingDate - new Date().getTime();

    if (distance < 0) {
      if (days) days.textContent = '00';
      if (days_plus) days.textContent = '00';
      if (hours) hours.textContent = '00';
      if (minutes) minutes.textContent = '00';
      if (seconds) seconds.textContent = '00';
      return;
    }

    if (days) days.textContent = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
    if (days_plus) days_plus.textContent = String(Math.floor(distance / (1000 * 60 * 60 * 24)) + 1).padStart(2, '0');
    if (hours) hours.textContent = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
    if (minutes) minutes.textContent = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    if (seconds) seconds.textContent = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
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

  // 5秒後顯示提示
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

  // 載入完成後等待 5 秒
  window.addEventListener('load', function() {
    // 確保載入畫面已經消失後才開始計時
    setTimeout(() => {
      hintTimer = setTimeout(showHint, 5000);
    }, 2500); // 配合載入畫面的 2 秒延遲
  });

  // 監聽滾動事件
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('wheel', handleScroll, { passive: true });
  window.addEventListener('touchmove', handleScroll, { passive: true });

  // 點擊遮罩也可以關閉（可選）
  overlay.addEventListener('click', hideHint);
}

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

// ==================== 錯誤處理 ====================
window.addEventListener('error', function (e) {
  console.error('發生錯誤:', e.error);
});
