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
  initPhotoGallery();

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

// ESC 鍵關閉選單（沒有選單的頁面如 throwback.html 直接略過）
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('active')) toggleMenu();
  }
});

// ==================== 音樂控制 ====================
let isMusicPlaying = false;

// 切換音樂播放
function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  const musicIcon = document.getElementById('musicIcon');
  const musicToggle = document.getElementById('musicToggle');

  if (!audio) return;

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

// 頁面切到背景時暫停音樂，切回前景時恢復
document.addEventListener('visibilitychange', function () {
  const audio = document.getElementById('bgMusic');
  if (!audio) return;

  if (document.hidden && isMusicPlaying) {
    audio.pause();
  } else if (!document.hidden && isMusicPlaying) {
    audio.play().catch((err) => console.log('恢復播放失敗:', err));
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
let galleryEnabled = false; // 本頁是否有相簿輪播(throwback.html 沒有，需避免誤觸自動播放)
const autoPlayDelay = 5000; // 5秒自動切換

// 每張照片的載入狀態快取：'loading' | 'loaded' | 'error'，避免重複下載同一張圖
const photoLoadState = {};
// 已建立的 Image() 物件快取，載入完成後可直接從瀏覽器快取取得，不會重新發請求
const photoImageCache = {};

// 交叉淡化用的兩個 img 元素，輪流擔任「顯示中」與「下一張淡入」的角色
let activeImgEl = null;
let inactiveImgEl = null;

function initGallery() {
  // 沒有輪播容器的頁面（例如 throwback.html）直接略過，
  // 避免無謂地預載 album/ 底下的大圖
  if (!document.getElementById('slideshowImgA')) return;
  galleryEnabled = true;

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
  // 本頁沒有相簿輪播時不啟動計時器（例如 throwback.html 由 visibilitychange 觸發的情況）
  if (!galleryEnabled) return;
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

  // 兩顆浮動按鈕都不存在時就不必監聽捲動
  // （throwback.html 有選單按鈕但沒有音樂按鈕，下面每一處都已個別做 null 檢查）
  if (!menuToggle && !musicToggle) return;

  window.addEventListener('scroll', function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > 100) {
      if (menuToggle) menuToggle.classList.add('hidden-up');
      if (musicToggle) musicToggle.classList.add('hidden-down');
    } else {
      if (menuToggle) menuToggle.classList.remove('hidden-up');
      if (musicToggle) musicToggle.classList.remove('hidden-down');
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

  // 沒有婚禮倒數欄位的頁面（例如 throwback.html）不需要啟動計時器
  if (!days && !days_plus && !hours && !minutes && !seconds) return;

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
      if (sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    }
    AOS.refresh();
  }, 250);
});


// ==================== YouTube 封面替身（facade）====================
// 頁面載入時只放一張封面圖，使用者按下才建立 iframe。
document.addEventListener('DOMContentLoaded', function () {
  const facades = document.querySelectorAll('.tb-video-facade');
  if (!facades.length) return;

  facades.forEach(function (facade) {
    // 尚未填入 YouTube ID 的卡片：改成「準備中」外觀。
    // 不這樣處理的話，i.ytimg.com 會對 PENDING 這個假 ID 回 404，變成破圖。
    const pendingId = facade.dataset.youtubeId;
    if (!pendingId || pendingId === 'PENDING') {
      facade.classList.add('tb-video-pending');
      facade.disabled = true;
      facade.setAttribute('aria-label',
        (facade.dataset.videoTitle || '影片') + '：準備中');
      const ph = facade.querySelector('.tb-facade-thumb');
      if (ph) ph.remove();   // 移除會 404 的縮圖
      return;                // 不綁點擊事件
    }

    facade.addEventListener('click', function () {
      const videoId = facade.dataset.youtubeId;
      if (!videoId) return;

      const iframe = document.createElement('iframe');
      // autoplay=1 在此是安全的：建立 iframe 的動作源自使用者點擊，
      // 符合瀏覽器的自動播放政策，所以按一次就會直接開始播放
      iframe.src = 'https://www.youtube.com/embed/' +
        encodeURIComponent(videoId) + '?autoplay=1&rel=0';
      iframe.className = 'tb-video-embed';
      iframe.title = facade.dataset.videoTitle || '婚禮影片';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;

      facade.replaceWith(iframe);
    });
  });
});

// ==================== 相片區（throwback.html） ====================
// 設計重點：絕不預載大圖。
// 網格只載縮圖（約 12 KB），大圖（約 160 KB）只在使用者點開燈箱時抓那一張。
// 這是刻意不沿用上方相簿輪播 preloadAllPhotos() 的原因 —— 幾百張相片若全預載會吃掉大量流量。

const PHOTO_BATCH = 150; // 每次渲染的格數，避免一次塞進上千個 DOM 節點

// 燈箱狀態
let lbGroup = 0;
let lbIndex = 0;
let lbOpen = false;
let lbCancelled = 0;    // 開燈箱時取消掉幾個縮圖請求（診斷用）
let lbPreloadTimer = null;

// 網址帶 ?debug=1 才顯示診斷資訊（大圖耗時拆解 + 相片網格狀態）。
// 婚宴當天訪客看到的是乾淨頁面，不會有這些黑框。
const DEBUG_MODE = /[?&]debug=1(?:&|$)/.test(location.search);

// 讓 AOS 重新掃描 DOM。
// 相片區的分組是 JS 動態產生的，而 AOS.init() 在那之前就跑完了，
// 新元素不在它的清單裡。而 aos.css 的 [data-aos^=fade] 預設是 opacity:0，
// 要等 AOS 加上 .aos-animate 才顯示 —— 所以少了這一步，相片區會整塊隱形。
// refresh() 只重算既有元素的位置，必須用 refreshHard() 才會重新查詢 [data-aos]。
function refreshScrollAnimations() {
  if (typeof AOS !== 'undefined' && typeof AOS.refreshHard === 'function') {
    AOS.refreshHard();
  }
}

// 縮圖最多自動重試幾次
const THUMB_MAX_RETRY = 3;

// 離開畫面多遠才卸載縮圖。放寬一點可避免捲動時出現空白閃爍，
// 但放太寬就失去省記憶體的意義。1200px 約等於手機上下各一到兩個畫面。
// 數值單獨拉出來，因為預抓也要用到同一條邊界 —— 兩處各寫一次遲早會不同步。
const THUMB_KEEP_PX     = 1200;
const THUMB_KEEP_MARGIN = THUMB_KEEP_PX + 'px 0px';

// 卸載時用來頂替的 1×1 透明 GIF。
// 不能用 img.src = '' —— 空字串會被解析成頁面網址、當成載入失敗，
// 反而觸發下面的自動重試。換成合法的小圖才能安靜地釋放記憶體。
const BLANK_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// ==================== 載入中的視覺 ====================
//
// 主機卡在 HTTP/1.1 又強制 Connection: close，每張縮圖約 4 個 RTT，
// 一個 24 格的畫面最少要 0.9 秒才填滿。已確認無法調整主機設定、
// 也沒有 DNS 控制權改用 CDN，這個等待時間壓不下去。
//
// 既然消不掉等待，就讓等待「看起來是在等」而不是「壞掉了」：
// 還沒拿到縮圖的格子掛上 cell-loading，由 CSS 跑一道掠過的光澤。
//
// 刻意只加在「佇列中或正在下載」的格子上，不是全部 1,518 格 ——
// 同時有上千個元素在跑動畫會把手機的繪製能力吃掉，
// 反而加重我們一直在對付的那個問題。離開可視範圍被卸載的格子會摘掉這個 class，
// 回到單純的淡紫底色（反正使用者看不到）。
const CELL_LOADING = 'cell-loading';

function markCellLoading(cell) {
  if (cell) cell.classList.add(CELL_LOADING);
}

function unmarkCellLoading(cell) {
  if (cell) cell.classList.remove(CELL_LOADING);
}

// ==================== 縮圖載入排程 ====================
//
// 問題：站台是 HTTP/1.1，同一網域只有 6 條並行連線，而 IntersectionObserver
// 一次就替畫面上下 1200px 內約 45 格設上 src。瀏覽器照「請求產生的順序」
// 服務佇列，完全不管那一格現在是否還看得到 —— 於是畫面內的格子
// 得排在已經捲過去的格子後面等，這就是空白格子。
//
// 線上實測（模擬手機、740 KB/s、依實機量到的條件）：
//   最糟的一刻畫面內 24 格有 15 格空白，同時 45 個縮圖請求卡在佇列裡；
//   24 次取樣有 21 次畫面上看得到空白格子。
//   佇列深度和空白格數幾乎同步起落（45 個請求→15 格空白，29 個→0 格）。
//
// 作法：自己管佇列。同時最多只讓 THUMB_CONCURRENCY 個請求在跑，
// 每次空出位子就挑「離畫面中央最近」的那一格；捲出可視範圍的格子
// 直接請出佇列，不再去佔連線。總位元組數不變，但畫面內的格子永遠優先。

// 併發數刻意比 HTTP/1.1 的 6 條連線上限「多兩個」。
// 若剛好設 6，每當一張載完、要等 load 事件回到 JS、排程才指派下一個 src，
// 這段空檔連線是閒置的 —— 本機實測因此比舊行為多出 1% 的空白取樣。
// 設 8 的話瀏覽器自己的佇列裡永遠備著兩個，線路不會空等 JS，
// 而失序的範圍也只有 2 個（舊行為是 39 個），排序效果幾乎不打折。
const THUMB_CONCURRENCY = 8;

// ---------- 快速滑動時暫緩發新請求 ----------
//
// 問題不是伺服器被壓垮（壓測一路零失敗），而是「浪費」：
// 一個請求要約 215 毫秒才回來，但手指一甩，畫面在這段時間內已經翻過去好幾格。
// 那些請求佔著 8 個連線位子卻永遠不會被看到，
// 而使用者真正停下來要看的格子，只能排在它們後面等。
//
// 所以滑太快就先不發新請求，等慢下來再發。已經在路上的不取消 ——
// 那些連線成本已經付掉了，半途丟掉等於白花。
//
// 刻意用「速度」而不是「有沒有在滑動」來判斷。
// 若只看「最近有沒有 scroll 事件」，慢慢瀏覽相片的人會一直觸發條件，
// 結果整片網格永遠不載入 —— 那比現在糟得多。
const THUMB_FLING_SPEED   = 2.5;   // px/ms；超過這個速度才算「甩動」（約 2500 px/秒）
const THUMB_SCROLL_STALE  = 140;   // ms；這麼久沒有 scroll 事件就視為已經停下來
const THUMB_FLING_RECHECK = 120;   // ms；甩動期間每隔這麼久回頭確認一次

const thumbPending = new Set();   // 想載、但還沒輪到的格子
let thumbActive = 0;              // 目前佔著連線的數量

let scrollTracking = false;
let lastScrollY = 0;
let lastScrollT = 0;
let scrollSpeed = 0;              // px/ms，指數平滑後的值
let flingTimer = null;
let flingSkipped = 0;             // 因為甩動而延後的次數（診斷用）

function ensureScrollTracking() {
  if (scrollTracking) return;
  scrollTracking = true;

  lastScrollY = window.scrollY;
  lastScrollT = performance.now();

  window.addEventListener('scroll', function () {
    const now = performance.now();
    const y   = window.scrollY;
    const dt  = now - lastScrollT;

    if (dt > 0) {
      // 指數平滑：單一事件的抖動不該讓判斷在兩種狀態間跳動
      const v = Math.abs(y - lastScrollY) / dt;
      scrollSpeed = scrollSpeed * 0.6 + v * 0.4;
    }

    lastScrollY = y;
    lastScrollT = now;
  }, { passive: true });   // passive：絕對不要讓這個監聽器有機會卡住捲動
}

function isFlinging() {
  // 已經停下來了就不算甩動。
  // 這道檢查很重要：scrollSpeed 只在 scroll 事件裡更新，
  // 手指放開後不會再有事件，少了它速度值會一直停在高點、永遠不發請求。
  if (performance.now() - lastScrollT > THUMB_SCROLL_STALE) return false;
  return scrollSpeed > THUMB_FLING_SPEED;
}

function enqueueThumb(cell) {
  const img = cell.querySelector('img');
  if (!img || !img.dataset.baseSrc) return;
  if (img.dataset.suspended === '1') return;   // 燈箱開著，不要插隊
  if (img.dataset.queued === '1') return;      // 已經在佇列裡
  if (img.dataset.unloaded !== '1') return;    // 已經在載、或已載好

  img.dataset.queued = '1';
  thumbPending.add(cell);
  markCellLoading(cell);        // 排進佇列就開始顯示「正在載入」
  cancelPrefetch();             // 真正的工作來了，預抓讓位
  ensureScrollTracking();
  startThumbWatchdog();
  pumpThumbQueue();
}

function dequeueThumb(cell) {
  const img = cell.querySelector('img');
  if (img) delete img.dataset.queued;
  thumbPending.delete(cell);
}

// 挑離畫面中央最近的待載格子。
// 佇列最多幾十個，每次線性掃一遍的成本可忽略；而且用當下的
// getBoundingClientRect，永遠反映最新的捲動位置 —— 不必自己監聽 scroll。
function pickNearestPending() {
  const mid = window.innerHeight / 2;
  let best = null;
  let bestDist = Infinity;

  thumbPending.forEach(function (cell) {
    const r = cell.getBoundingClientRect();
    if (r.height === 0) return;        // 分組收合中，先跳過
    const d = Math.abs((r.top + r.bottom) / 2 - mid);
    if (d < bestDist) { bestDist = d; best = cell; }
  });

  return best;
}

function pumpThumbQueue() {
  // 甩動中：先不開新請求，隔一下回頭再看。
  // 甩動一定會結束（捲動是有限的），所以不會永久停住；
  // 加上下面的 watchdog 當第二道保險。
  if (thumbPending.size > 0 && isFlinging()) {
    flingSkipped++;
    if (!flingTimer) {
      flingTimer = setTimeout(function () {
        flingTimer = null;
        pumpThumbQueue();
      }, THUMB_FLING_RECHECK);
    }
    return;
  }

  while (thumbActive < THUMB_CONCURRENCY && thumbPending.size > 0) {
    const cell = pickNearestPending();
    if (!cell) break;

    dequeueThumb(cell);

    const img = cell.querySelector('img');
    if (!img || !img.dataset.baseSrc) continue;

    const attempt = parseInt(img.dataset.retry, 10) || 0;

    img.dataset.unloaded = '0';
    img.dataset.active   = '1';
    thumbActive++;

    // 重試時必須換網址，否則瀏覽器可能直接回放剛才那次失敗、不重新發請求
    let url = img.dataset.baseSrc;
    if (attempt > 0) {
      url += '&r=' + attempt;
    } else if (img.dataset.bust) {
      url += '&r=m' + img.dataset.bust;
      delete img.dataset.bust;
    }
    img.src = url;
  }

  // 眼前的工作做完、連線閒下來了，把它拿去預抓後面的格子
  if (thumbPending.size === 0 && thumbActive === 0) schedulePrefetch();
}

// 放掉連線位子。每個請求只能放一次，否則 thumbActive 會漂掉、
// 最後卡在「以為滿載、其實沒有請求在跑」而整片不再載入。
function releaseThumbSlot(img) {
  if (img.dataset.active !== '1') return;
  delete img.dataset.active;
  thumbActive--;
  if (thumbActive < 0) thumbActive = 0;
  pumpThumbQueue();
}

// 保險機制：萬一計數還是漂掉了，整個相片區會永久停止載入 ——
// 對一個婚宴頁面來說那是最糟的失敗方式（訪客只會看到一片空白格子）。
// 這裡每 5 秒用 DOM 上的 data-active 對帳一次，把潛在的死鎖
// 降級成最多 5 秒的停頓。只在「還有東西等著載」時才掃，平時完全不做事。
let thumbWatchdog = null;

// ==================== 閒置時預先抓取 ====================
//
// 已實測確認的兩件事（線上站台、全新網址）：
//   首次抓取一張縮圖        121 ms（走網路）
//   預抓過之後再顯示         10 ms（連請求都沒發，命中記憶體快取）
// 因為主機回 Cache-Control: immutable，所以「貴的只有第一次」。
//
// 現況是：連線把畫面附近的格子載完就閒置了，但使用者捲到下一個畫面時
// 又要重新付 24 格 ÷ 6 條連線 × 200 ms ≈ 800 ms。
// 把閒下來的連線拿去預抓後面的位元組，捲到時就是 10 ms 等級的快取命中。
//
// 三個保護措施，優先權一律低於使用者眼前真正需要的格子：
//   1. 只在佇列清空、沒有請求在跑、不在甩動、燈箱沒開時才動
//   2. 併發只有 2（真正的載入是 8），不去擠滿那 6 條連線
//   3. 真正的工作一出現就立刻中止預抓，把連線讓出來
// 深度取 150，剛好等於 PHOTO_BATCH —— 實際效果是「把目前這一批剩下的格子
// 全部預抓完」。使用者看照片停個幾秒，整批就都進快取了，之後怎麼捲都是瞬間。
// 按下「載入更多」產生下一批之後，下次閒置會再把那批抓起來。
const THUMB_PREFETCH_DEPTH    = 150;
const THUMB_PREFETCH_PARALLEL = 4;    // 真正的載入是 8；留 2 條連線給突發需求
const THUMB_PREFETCH_IDLE     = 400;  // 「停止動作後」要等多久才開始預抓（ms）

const prefetchInFlight = new Map();   // 臨時 Image -> 對應格子的 img
let prefetchTimer = null;
let prefetchDone  = 0;                // 累計預抓成功張數（診斷用）

function schedulePrefetch() {
  if (prefetchTimer) return;
  prefetchTimer = setTimeout(function () {
    prefetchTimer = null;
    runPrefetch();
  }, THUMB_PREFETCH_IDLE);
}

// 真正的工作來了：立刻中止預抓，把連線讓給使用者眼前的格子。
// 這一步不能省 —— 預抓若和真正的載入一起塞滿那 6 條連線，
// 就會重演我們先前修掉的「大圖排在縮圖後面」那種阻塞。
function cancelPrefetch() {
  clearTimeout(prefetchTimer);
  prefetchTimer = null;
  if (prefetchInFlight.size === 0) return;

  prefetchInFlight.forEach(function (img, pre) {
    pre.onload = pre.onerror = null;
    pre.src = BLANK_PIXEL;            // 指派新的 src 會中止前一個請求
    delete img.dataset.prefetched;    // 讓它日後還能再被預抓
  });
  prefetchInFlight.clear();
}

function runPrefetch() {
  // 任何一項不成立就不預抓
  if (thumbPending.size > 0 || thumbActive > 0) return;
  if (isFlinging() || lbOpen) return;
  if (prefetchInFlight.size >= THUMB_PREFETCH_PARALLEL) return;

  // 只看展開中的網格。收合的網格是 display:none，量到的位置全是 0，
  // 會破壞下面二分搜尋所依賴的「由上而下遞增」前提。
  const cells = document.querySelectorAll('.tb-photo-grid:not([hidden]) .tb-photo-cell');
  if (!cells.length) return;

  // 二分搜尋出第一個落在預載範圍之外（下方）的格子。
  // 逐一量上千個格子的位置太貴，二分搜尋只需約 11 次測量。
  const edge = window.innerHeight + THUMB_KEEP_PX;
  let lo = 0, hi = cells.length - 1, first = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cells[mid].getBoundingClientRect().top > edge) { first = mid; hi = mid - 1; }
    else lo = mid + 1;
  }
  if (first < 0) return;              // 已經到最底部，沒有東西可預抓

  const end = Math.min(cells.length, first + THUMB_PREFETCH_DEPTH);
  let started = 0;

  for (let i = first; i < end; i++) {
    if (prefetchInFlight.size >= THUMB_PREFETCH_PARALLEL) break;

    const img = cells[i].querySelector('img');
    if (!img || !img.dataset.baseSrc) continue;
    if (img.dataset.prefetched === '1') continue;
    if (img.classList.contains('loaded')) continue;

    prefetchOne(img);
    started++;
  }
}

function prefetchOne(img) {
  img.dataset.prefetched = '1';

  // 用臨時的 Image 把位元組抓進 HTTP 快取就好。
  // 關鍵是 onload 後立刻解除參照、而且絕不呼叫 decode() ——
  // 保留已解碼的點陣圖是每張 417 KB，48 張就 20 MB，
  // 會毀掉先前好不容易壓到約 34 MB 的記憶體成果。
  const pre = new Image();
  pre.setAttribute('fetchpriority', 'low');

  const finish = function () {
    pre.onload = pre.onerror = null;
    prefetchInFlight.delete(pre);
    prefetchDone++;

    // 空出位子就立刻補下一張，不要再等 THUMB_PREFETCH_IDLE。
    // 那個延遲的用意是「確認使用者真的停下來了」，只該用在開始之前；
    // 若每批之間都等 400 ms，速率就被計時器綁死（併發 4 也只有 10 張/秒），
    // 遠低於連線能跑的速度。runPrefetch 自己會重新檢查所有前提，
    // 所以直接呼叫是安全的 —— 使用者一有動作它就會自己停下。
    runPrefetch();
  };

  pre.onload  = finish;
  pre.onerror = finish;   // 預抓失敗無所謂，那一格之後照正常流程載入
  prefetchInFlight.set(pre, img);
  pre.src = img.dataset.baseSrc;
}

function startThumbWatchdog() {
  if (thumbWatchdog) return;

  thumbWatchdog = setInterval(function () {
    if (thumbPending.size === 0) return;

    const real = document.querySelectorAll('.tb-photo-cell img[data-active="1"]').length;
    if (real !== thumbActive) {
      console.warn('縮圖佇列計數對帳：' + thumbActive + ' -> ' + real);
      thumbActive = real;
      pumpThumbQueue();
      return;
    }

    // 計數正確、卻完全沒有請求在跑、也不是在甩動 —— 代表佇列卡住了
    // （例如甩動用的計時器因為某種意外沒有接上），推它一把。
    if (thumbActive === 0 && !isFlinging()) pumpThumbQueue();
  }, 5000);
}

let thumbObserver = null;

// 縮圖解碼後約佔 417 KB（400×267×4 bytes），是檔案大小的 22 倍。
// 整組 759 張全部解碼要 309 MB，手機記憶體撐不住，Chrome 會開始丟棄
// 已解碼的點陣圖，被丟掉的格子就變空白。
// 這裡主動把離開畫面很遠的縮圖換成透明像素，讓解碼記憶體維持在數十 MB。
//
// 進入可視範圍的格子不直接設 src，而是排進上面的佇列，由排程決定順序。
function getThumbObserver() {
  if (thumbObserver || !('IntersectionObserver' in window)) return thumbObserver;

  thumbObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      const cell = entry.target;
      const img  = cell.querySelector('img');
      if (!img || !img.dataset.baseSrc) return;

      if (entry.isIntersecting) {
        if (img.dataset.unloaded === '1') {
          img.dataset.retry = '0';   // 重新進場，給它新的重試額度
          enqueueThumb(cell);
        }
      } else {
        dequeueThumb(cell);          // 還沒開始的，就別再去佔連線

        // 捲離可視範圍：不再顯示載入動畫，省下繪製成本
        unmarkCellLoading(cell);

        if (img.dataset.unloaded !== '1') {
          img.dataset.unloaded = '1';
          img.classList.remove('loaded');
          cell.classList.remove('cell-retrying', 'cell-error');
          img.src = BLANK_PIXEL;     // 中止進行中的請求，同時釋放解碼記憶體
          releaseThumbSlot(img);
        }
      }
    });
  }, { rootMargin: THUMB_KEEP_MARGIN, threshold: 0 });

  return thumbObserver;
}

// 開燈箱時，把還在排隊或傳輸中的縮圖請求全部取消。
//
// 為什麼需要這一步：站台目前是 HTTP/1.1，同一個網域只有 6 條並行連線。
// 捲到相片區時 IntersectionObserver 會一次替數十張縮圖設上 src，
// 這些請求佔滿 6 個連線位子、其餘排隊等候。此時點開大圖，
// 大圖那個請求只能排在隊伍後面 —— 這正是轉圈要等上十秒的來源。
// 行動網路 RTT 高、頻寬小，隊伍清空得比桌機慢得多，所以只有手機明顯。
//
// 指派一個新的 src 會讓瀏覽器中止前一個尚未完成的請求，
// 換成透明像素即可立刻把連線讓給大圖。
// 單靠 fetchpriority 不夠：它只能插隊「還沒送出」的請求，
// 搶不回已經在傳輸中的那 6 條連線，兩者必須並用。
function suspendThumbLoads() {
  let n = 0;

  cancelPrefetch();   // 大圖優先，預抓一律讓位

  // 先把「還沒開始」的請出佇列。少了這一步，燈箱開著的時候
  // 佇列仍會一個接一個補上來搶連線，等於白取消。
  Array.from(thumbPending).forEach(function (cell) {
    const img = cell.querySelector('img');
    dequeueThumb(cell);
    if (img) { img.dataset.suspended = '1'; n++; }
  });

  // 再取消「已經在傳輸中」的
  document.querySelectorAll('.tb-photo-cell img').forEach(function (img) {
    if (!img.dataset.baseSrc) return;
    if (img.dataset.unloaded === '1') return;          // 已卸載，沒有進行中的請求
    if (img.classList.contains('loaded')) return;      // 已載完，取消它毫無意義

    img.dataset.suspended = '1';
    img.dataset.unloaded  = '1';   // 讓 load / error 監聽把接下來的事件視為卸載

    const cell = img.closest('.tb-photo-cell');
    if (cell) {
      cell.classList.remove('cell-retrying', 'cell-error');
      unmarkCellLoading(cell);     // 燈箱蓋住網格，動畫沒必要繼續跑
    }

    img.src = BLANK_PIXEL;
    releaseThumbSlot(img);
    n++;
  });

  return n;
}

// 關燈箱後，把剛才取消的縮圖接回來。
// IntersectionObserver 只在「交集狀態改變」時回呼，狀態沒變它不會再叫一次，
// 所以用 unobserve + observe 強迫它重新判定目前位置：
// 還在畫面附近的會重新載入，已經捲走的就維持卸載、不浪費流量。
function resumeThumbLoads() {
  const obs = getThumbObserver();

  document.querySelectorAll('.tb-photo-cell img[data-suspended="1"]').forEach(function (img) {
    delete img.dataset.suspended;

    const cell = img.closest('.tb-photo-cell');
    if (!cell) return;

    if (obs) {
      obs.unobserve(cell);
      obs.observe(cell);
    } else {
      img.dataset.unloaded = '0';
      img.src = img.dataset.baseSrc;
    }
  });
}

// 瀏覽器對載入失敗的 <img> 不會自己重試，伺服器瞬間過載時
// 一次失敗就會永久留下空格子。這裡補上自動重試。
//
// 兩個設計重點：
//   1. 指數退避 + 隨機抖動 —— 上百張同時失敗時若又同時重試，
//      會把剛喘過氣的伺服器再壓垮一次
//   2. 重試網址附上 &r=N —— 瀏覽器可能把剛才那次失敗結果短暫快取住，
//      不換網址的話會直接回放失敗，根本不會重新發請求
function attachThumbRetry(cell, img, baseUrl) {
  // 重試次數存在元素上而不是閉包裡，手動重試才能沿用同一組監聽、
  // 不會每次都疊加一組新的 error 處理器（那會造成多條重試鏈同時跑）
  img.dataset.baseSrc = baseUrl;
  img.dataset.retry   = '0';

  img.addEventListener('load', function () {
    // 卸載用的透明像素也會觸發 load，別把它當成縮圖載入成功
    if (img.dataset.unloaded === '1') return;

    // 以實際解碼尺寸為準，不只看旗標。
    // 透明像素是 1×1，縮圖是 400×267；還沒載好時是 0。
    // 這道檢查擋掉一種時序意外：格子剛被卸載又立刻捲回畫面時，
    // 透明像素那個較早排入的 load 事件可能晚到，
    // 若只看旗標就會誤判成新請求已完成 —— 連線位子被提早放掉，
    // 格子還會被標成 loaded 卻其實是透明的。
    if (img.naturalWidth <= 1) return;

    releaseThumbSlot(img);
    cell.classList.remove('cell-retrying', 'cell-error');
    unmarkCellLoading(cell);
    img.classList.add('loaded');
  });

  img.addEventListener('error', function () {
    // 已卸載或被燈箱暫停的格子不重試，
    // 否則捲動離開時會把剛釋放的圖又抓回來
    if (img.dataset.unloaded === '1') return;
    if (img.getAttribute('src') === BLANK_PIXEL) return;   // 透明像素的遲到事件

    // 先把連線還回去 —— 退避那一兩秒不該佔著位子不放
    releaseThumbSlot(img);

    let attempt = parseInt(img.dataset.retry, 10) || 0;

    if (attempt >= THUMB_MAX_RETRY) {
      // 重試用完：改成可手動重試的提示，停掉載入動畫
      cell.classList.remove('cell-retrying');
      unmarkCellLoading(cell);
      cell.classList.add('cell-error');
      return;
    }

    attempt++;
    img.dataset.retry    = String(attempt);
    img.dataset.unloaded = '1';     // 回到「未載入」，退避後才重新排隊
    cell.classList.add('cell-retrying');

    const delay = 500 * Math.pow(2, attempt - 1) + Math.random() * 400;
    setTimeout(function () {
      // 退避期間這格可能已經捲離畫面、或被燈箱暫停
      if (img.dataset.suspended === '1') return;
      if (img.dataset.unloaded !== '1') return;
      // 重試也走佇列，才不會搶走畫面內格子的連線
      enqueueThumb(cell);
    }, delay);
  });
}

// 手動重試：把次數歸零，重新排進佇列。
// 走佇列而不是直接設 src，這樣連點好幾格也不會一次把連線佔滿。
function retryThumb(cell) {
  const img = cell.querySelector('img');
  if (!img || !img.dataset.baseSrc) return;
  if (img.dataset.suspended === '1') return;

  img.dataset.retry    = '0';
  img.dataset.unloaded = '1';
  img.dataset.bust     = String(Date.now());   // 避開失敗結果的短暫快取
  cell.classList.remove('cell-error');
  cell.classList.add('cell-retrying');

  releaseThumbSlot(img);
  enqueueThumb(cell);
}

function photoThumbUrl(group, id) {
  return group.base + '/thumbs/' + id + '.webp?v=' + PHOTO_VERSION;
}

function photoFullUrl(group, id) {
  return group.base + '/full/' + id + '.webp?v=' + PHOTO_VERSION;
}

function initPhotoGallery() {
  const host = document.getElementById('galleryGroups');
  if (!host) return;

  // 還沒有相片時顯示整理中提示，而不是留一塊空白。
  // 必須逐組檢查 photos 長度 —— 只看 PHOTO_GROUPS.length 不夠，
  // 因為清單可能有分組但每組都是空的，那樣會兩邊都不顯示。
  const hasAnyPhoto = typeof PHOTO_GROUPS !== 'undefined' &&
    PHOTO_GROUPS.some(function (g) { return g && g.photos && g.photos.length; });

  if (!hasAnyPhoto) {
    host.innerHTML =
      '<div class="tb-gallery-empty" data-aos="fade-up" data-aos-duration="1000">' +
      '<div class="tb-gallery-empty-icon noto-emoji">📷</div>' +
      '<p>相片正在挑選與整理中<br>完成後會在「最新消息」公告</p>' +
      '</div>';
    refreshScrollAnimations();
    return;
  }

  PHOTO_GROUPS.forEach(function (group, gi) {
    const total = group.photos.length;
    if (!total) return;

    const wrap = document.createElement('div');
    wrap.className = 'tb-photo-group';
    // 進場動畫：與影片卡、佈告欄一致，分組之間錯開 100ms
    wrap.setAttribute('data-aos', 'fade-up');
    wrap.setAttribute('data-aos-duration', '1000');
    if (gi > 0) wrap.setAttribute('data-aos-delay', String(gi * 100));

    const gridId = 'photoGrid-' + group.id;

    // --- 分組標題（可折疊） ---
    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'tb-group-header';
    // 預設折疊：相片數量很多，全部展開會讓頁面極長且一次建立上百個節點
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('aria-controls', gridId);
    header.innerHTML =
      '<span class="tb-group-title">' + group.title + '</span>' +
      '<span class="tb-group-date">' + (group.date || '') + '</span>' +
      '<span class="tb-group-count">' + total + ' 張</span>' +
      '<span class="tb-group-caret material-symbols-outlined">expand_more</span>';

    // --- 縮圖網格（預設隱藏）---
    const grid = document.createElement('div');
    grid.className = 'tb-photo-grid';
    grid.id = gridId;
    grid.hidden = true;

    // --- 載入更多（預設隱藏）---
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'tb-load-more';
    more.hidden = true;

    let rendered = 0;

    function renderBatch() {
      const end = Math.min(rendered + PHOTO_BATCH, total);
      const frag = document.createDocumentFragment();

      for (let i = rendered; i < end; i++) {
        const id = group.photos[i][0];

        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'tb-photo-cell';
        cell.dataset.g = String(gi);
        cell.dataset.i = String(i);
        cell.setAttribute('aria-label', group.title + ' 第 ' + (i + 1) + ' 張，點擊放大');

        const img = document.createElement('img');
        img.alt = '';
        // 刻意不設 loading = 'lazy'。src 完全由上面的佇列排程控制，
        // 只有接近畫面時才指派，原生延後載入已經沒有作用；
        // 更糟的是它可能讓瀏覽器再延後一次 —— 排程以為那一格已經開始下載、
        // 佔著一個連線位子，實際上請求還沒發出，白白浪費併發額度。
        // 縮圖一律低優先。HTTP/1.1 只有 6 條連線，點開大圖時
        // 大圖標為 high 才能插到這些還沒送出的縮圖請求前面。
        img.setAttribute('fetchpriority', 'low');
        // 刻意不設 decoding = 'async'。它會把縮圖送進 Chrome 的延後解碼（checker-image）路徑，
        // 而該路徑有個合成器不重繪的已知缺陷：像素其實解好了，但畫面上那塊磚沒被重新光栅化，
        // 格子就一直是空的，要等捲動、點擊或附近有其他更新「喚醒」合成器才會一起補上。
        // 縮圖只有 400×267／19 KB，同步解碼的成本可以忽略，不值得為它冒這個風險。
        // 參考：https://issues.chromium.org/issues/515542787

        attachThumbRetry(cell, img, photoThumbUrl(group, id));
        cell.appendChild(img);

        // src 交給 IntersectionObserver 管：接近畫面才載入、離遠就卸載。
        // 這樣即使整組 759 張都展開，解碼記憶體也只會維持在畫面附近那些。
        if (DEBUG_MODE) {
          const dbg = getGridDebugObserver();
          if (dbg) dbg.observe(cell);
        }

        const obs = getThumbObserver();
        if (obs) {
          img.dataset.unloaded = '1';
          obs.observe(cell);
        } else {
          // 舊瀏覽器沒有 IntersectionObserver：退回原本行為，直接載入。
          // 這條路徑不經過佇列，所以要自己掛上載入動畫。
          img.dataset.unloaded = '0';
          markCellLoading(cell);
          img.src = img.dataset.baseSrc;
        }

        frag.appendChild(cell);
      }

      grid.appendChild(frag);
      rendered = end;

      // 文字無條件寫入，這樣即使日後樣式又把 hidden 蓋掉，也不會出現空白按鈕
      const remaining = total - rendered;
      more.textContent = '載入更多（還有 ' + remaining + ' 張）';
      more.hidden = (remaining <= 0);
    }

    more.addEventListener('click', renderBatch);

    header.addEventListener('click', function () {
      const willExpand = header.getAttribute('aria-expanded') !== 'true';
      header.setAttribute('aria-expanded', String(willExpand));

      // 先讓容器可見，再產生格子 —— 順序很重要：
      // 格子在 display:none 的容器裡被 observe 時，初始狀態會是「不可見」，
      // 得多等一次 observer 回呼才會開始載入。先顯示就能直接判定正確。
      grid.hidden = !willExpand;

      // 第一次展開時才產生縮圖。預設折疊的情況下，
      // 若在這裡之前就 renderBatch()，等於為沒人看的內容先建好上百個 DOM 節點。
      if (willExpand && rendered === 0) renderBatch();

      more.hidden = !willExpand || rendered >= total;
    });

    wrap.appendChild(header);
    wrap.appendChild(grid);
    wrap.appendChild(more);
    host.appendChild(wrap);
  });

  // 事件委派：不必為每一格各綁一個監聽
  host.addEventListener('click', function (e) {
    const cell = e.target.closest('.tb-photo-cell');
    if (!cell) return;

    // 縮圖載入失敗的格子：點擊改為重新載入，而不是開啟燈箱
    // （大圖多半也抓不到，開了只會看到載入失敗）
    if (cell.classList.contains('cell-error')) {
      retryThumb(cell);
      return;
    }

    openLightbox(parseInt(cell.dataset.g, 10), parseInt(cell.dataset.i, 10));
  });

  initLightbox();

  // 分組都加好之後才讓 AOS 重新掃描，否則新元素會卡在 opacity:0
  refreshScrollAnimations();

  startGridDebug();

  console.log('📷 相片區初始化完成');
}

// ==================== 燈箱 ====================
function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  lb.querySelectorAll('[data-lb-close]').forEach(function (el) {
    el.addEventListener('click', closeLightbox);
  });

  document.getElementById('lightboxPrev').addEventListener('click', function () { stepLightbox(-1); });
  document.getElementById('lightboxNext').addEventListener('click', function () { stepLightbox(1); });
  document.getElementById('lightboxDownload').addEventListener('click', downloadCurrentPhoto);

  document.addEventListener('keydown', function (e) {
    if (!lbOpen) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') stepLightbox(-1);
    else if (e.key === 'ArrowRight') stepLightbox(1);
  });

  // 手機滑動切換
  let touchX = 0;
  const stage = document.getElementById('lightboxStage');
  lb.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) stepLightbox(dx > 0 ? -1 : 1);
  }, { passive: true });
  if (stage) stage.style.touchAction = 'pan-y';
}

function openLightbox(gi, idx) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  lbGroup = gi;
  lbIndex = idx;
  lbOpen = true;

  // 鎖住頁面捲動，並補上捲軸寬度避免版面位移（與 toggleMenu 相同做法）
  const sbw = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.paddingRight = sbw + 'px';
  document.body.style.overflow = 'hidden';

  lb.hidden = false;
  requestAnimationFrame(function () { lb.classList.add('show'); });

  // 先清出連線，再發大圖請求 —— 順序很重要，反過來就沒有意義了
  lbCancelled = suspendThumbLoads();

  showLightboxPhoto();
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  lbOpen = false;
  lb.classList.remove('show');
  document.body.style.paddingRight = '';
  document.body.style.overflow = '';

  setTimeout(function () {
    // 這 250 毫秒內又重開了燈箱，就什麼都別動
    if (lbOpen) return;

    lb.hidden = true;

    const img = document.getElementById('lightboxImg');
    // 先拆掉處理器再換 src：BLANK_PIXEL 也會觸發 onload，
    // 不拆的話會誤判成「大圖載入完成」，連帶去預載前後張。
    img.onload  = null;
    img.onerror = null;
    img.src = BLANK_PIXEL;   // 釋放大圖記憶體（用 '' 會觸發 onerror）
    img.classList.remove('loaded');

    // 順序：先讓大圖請求中止、連線空出來，才把縮圖接回去。
    // 若在這之前就 resume，使用者關掉後還沒下載完的大圖
    // 會再和幾十張縮圖搶同樣那 6 條連線。
    resumeThumbLoads();
  }, 250);
}

function stepLightbox(delta) {
  const group = PHOTO_GROUPS[lbGroup];
  if (!group) return;
  const next = lbIndex + delta;
  if (next < 0 || next >= group.photos.length) return;
  lbIndex = next;
  showLightboxPhoto();
}

function showLightboxPhoto() {
  const group = PHOTO_GROUPS[lbGroup];
  if (!group) return;

  const entry = group.photos[lbIndex];
  const id = entry[0];
  const w = entry[1];
  const h = entry[2];

  const img     = document.getElementById('lightboxImg');
  const spinner = document.getElementById('lightboxSpinner');
  const errorEl = document.getElementById('lightboxError');
  const caption = document.getElementById('lightboxCaption');
  const stage   = document.getElementById('lightboxStage');

  caption.textContent = group.title + '　' + (lbIndex + 1) + ' / ' + group.photos.length;

  // 用縮圖的長寬比先把版面撐住，大圖載入時畫面才不會跳動
  if (w && h) stage.style.aspectRatio = w + ' / ' + h;

  img.classList.remove('loaded');
  errorEl.hidden = true;
  spinner.hidden = false;

  const shownIndex = lbIndex;

  img.onload = function () {
    spinner.hidden = true;
    img.classList.add('loaded');
    stage.style.aspectRatio = '';   // 載入完成後交給圖片自己的尺寸
    reportLightboxTiming(img.currentSrc || img.src);
    schedulePreload(group, shownIndex);
  };
  img.onerror = function () {
    spinner.hidden = true;
    errorEl.hidden = false;
  };

  // 使用者正在盯著的這一張，優先權最高
  img.setAttribute('fetchpriority', 'high');

  // debug 模式下先清空 Resource Timing 緩衝區。
  // 預設只保留 250 筆，上千張縮圖早就把它灌滿，大圖那筆會被丟掉量不到。
  if (DEBUG_MODE && window.performance && performance.clearResourceTimings) {
    performance.clearResourceTimings();
  }

  img.src = photoFullUrl(group, id);
  img.alt = group.title + ' 第 ' + (lbIndex + 1) + ' 張';

  document.getElementById('lightboxPrev').disabled = (lbIndex === 0);
  document.getElementById('lightboxNext').disabled = (lbIndex === group.photos.length - 1);
}

// 前後各一張的預載，延到主圖載完之後才做。
//
// 原本這兩個請求和主圖同時發出，三張大圖（約 240 KB × 3）互搶頻寬與連線位子，
// 等於讓使用者正在盯著的那一張變慢兩到三倍。改成載完才預載，
// 翻頁依然有快取可用，但不再拖慢當下這一張。
function schedulePreload(group, idx) {
  clearTimeout(lbPreloadTimer);

  lbPreloadTimer = setTimeout(function () {
    if (!lbOpen || lbIndex !== idx) return;   // 已關閉或又翻頁了，不必預載

    [idx - 1, idx + 1].forEach(function (i) {
      if (i < 0 || i >= group.photos.length) return;
      const pre = new Image();
      pre.setAttribute('fetchpriority', 'low');
      pre.src = photoFullUrl(group, group.photos[i][0]);
    });
  }, 300);
}

// 用 Resource Timing 把大圖那一次請求拆開，直接在手機畫面上顯示。
//
// 這是分辨「排隊等連線」和「下載本身慢」的唯一客觀依據：
//   排隊/連線 = requestStart - startTime
//       瀏覽器決定要抓，到請求真正送出之間的空窗。
//       同網域、連線可重用的情況下，這段幾乎等於純粹在等連線位子。
//       如果十秒大部分落在這裡，排隊阻塞就成立，該做的是開 HTTP/2。
//   等首位元組 = responseStart - requestStart   （伺服器處理 + 一趟 RTT）
//   下載       = responseEnd - responseStart    （純傳輸，受頻寬影響）
function reportLightboxTiming(url) {
  if (!DEBUG_MODE || !window.performance || !performance.getEntriesByType) return;

  let tries = 0;

  // Resource Timing 那筆紀錄偶爾會比 load 事件晚一點才進緩衝區，找不到就再等等
  (function look() {
    const hit = performance.getEntriesByType('resource').filter(function (e) {
      return e.name === url;
    }).pop();

    if (!hit) {
      if (tries++ < 5) setTimeout(look, 200);
      return;
    }

    const ms = function (v) { return Math.round(v) + ' ms'; };
    const kb = hit.encodedBodySize ? Math.round(hit.encodedBodySize / 1024) + ' KB' : '未提供';

    const lines = [
      '排隊/連線 ' + ms(hit.requestStart - hit.startTime),
      '等首位元組 ' + ms(hit.responseStart - hit.requestStart),
      '下載 ' + ms(hit.responseEnd - hit.responseStart),
      '總計 ' + ms(hit.responseEnd - hit.startTime) + '　大小 ' + kb,
      '開燈箱時取消了 ' + lbCancelled + ' 個縮圖請求'
    ];

    const box = lbDebugBox();
    if (box) box.textContent = lines.join('\n');
    console.log('🔍 大圖耗時\n' + lines.join('\n'), hit);
  })();
}

// ==================== 相片網格的即時診斷（?debug=1） ====================
//
// 為什麼需要這個：我在模擬手機環境試了三種量測設計，全部失敗 ——
// 本機太快量不到空白、連續捲動時供給速度跟不上導致兩種模式都飢餓、
// 停止捲動時畫面其實已經填滿。同一組設定重跑的變異量甚至大於模式差異。
// 唯一真正解決過問題的量測，是在實機上用 ?debug=1 讀到的數字。
// 所以這裡把網格狀態也搬到實機上直接讀。
//
// 捲動時沒人讀得到瞬間數字，因此同時顯示「當下」和「尖峰」：
// 捲一段、停下來，再看尖峰值。輕觸黑框可將尖峰歸零。

// 用一個 rootMargin 為 0 的獨立 observer 維護「真正在畫面內」的集合。
// 不逐格呼叫 getBoundingClientRect —— 上千格每秒掃好幾次，
// 量測本身就會造成卡頓與空白，反而汙染結果。
// 交集判定由瀏覽器負責，這裡只需讀集合大小，成本是 O(可見格數) 約 24。
let gridDebugVisible = new Set();
let gridDebugObserver = null;
let gridDebugTimer = null;
let gridPeakBlank = 0;
let gridPeakQueue = 0;

function getGridDebugObserver() {
  if (gridDebugObserver || !('IntersectionObserver' in window)) return gridDebugObserver;

  gridDebugObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) gridDebugVisible.add(e.target);
      else gridDebugVisible.delete(e.target);
    });
  }, { rootMargin: '0px', threshold: 0 });

  return gridDebugObserver;
}

function startGridDebug() {
  if (!DEBUG_MODE || gridDebugTimer) return;

  const box = document.createElement('div');
  box.id = 'gridDebug';
  box.style.cssText =
    'position:fixed;left:8px;right:8px;top:8px;z-index:99998;' +
    'font:12px/1.6 monospace;white-space:pre-wrap;color:#fff;' +
    'background:rgba(0,0,0,.82);padding:8px 10px;border-radius:8px;';
  box.addEventListener('click', function () {
    gridPeakBlank = 0;
    gridPeakQueue = 0;
  });
  document.body.appendChild(box);

  gridDebugTimer = setInterval(function () {
    // 燈箱開著時讓位給大圖耗時那個框，也別擋住關閉鈕
    box.style.display = lbOpen ? 'none' : '';
    if (lbOpen) return;

    // blank   ：縮圖還沒到的格子
    // showing ：其中有多少正在跑「載入中」動畫（理想狀況下兩者相等 ——
    //           代表每個還沒載好的格子都有在告訴使用者它在忙）
    let blank = 0;
    let showing = 0;

    gridDebugVisible.forEach(function (cell) {
      const img = cell.querySelector('img');
      if (img && img.classList.contains('loaded')) return;
      blank++;
      if (cell.classList.contains(CELL_LOADING) ||
          cell.classList.contains('cell-error')) showing++;
    });

    if (blank > gridPeakBlank) gridPeakBlank = blank;
    if (thumbPending.size > gridPeakQueue) gridPeakQueue = thumbPending.size;

    box.textContent =
      '可見 ' + gridDebugVisible.size + ' 格　空白 ' + blank
        + ' 格（尖峰 ' + gridPeakBlank + '）\n'
      + '其中有載入動畫 ' + showing + ' / ' + blank + '　← 兩數應相等\n'
      + '佇列 ' + thumbPending.size + '（尖峰 ' + gridPeakQueue + '）'
        + '　在跑 ' + thumbActive + '/' + THUMB_CONCURRENCY + '\n'
      + '捲動 ' + scrollSpeed.toFixed(1) + ' px/ms'
        + (isFlinging() ? '　甩動中：暫緩發送' : '')
        + '　已延後 ' + flingSkipped + ' 次\n'
      + '預抓 ' + prefetchDone + ' 張（進行中 ' + prefetchInFlight.size + '）\n'
      + '輕觸此框可將尖峰歸零';
  }, 250);
}

function lbDebugBox() {
  let el = document.getElementById('lbDebug');
  if (el) return el;

  const lb = document.getElementById('lightbox');
  if (!lb) return null;

  el = document.createElement('div');
  el.id = 'lbDebug';
  el.style.cssText =
    'position:absolute;left:8px;right:8px;bottom:8px;z-index:99;pointer-events:none;' +
    'font:12px/1.6 monospace;white-space:pre-wrap;color:#fff;' +
    'background:rgba(0,0,0,.8);padding:8px 10px;border-radius:8px;';
  lb.appendChild(el);
  return el;
}

// ==================== 下載 ====================
// 不需要在伺服器上多存一份檔案：
// webp 會轉換成 jpg
// 抓同一個原檔，在瀏覽器端用 Canvas 轉檔
// 網路傳輸量都只有那一張 WebP（約 160 KB）。

// 檔名用「畫面上的顯示位置」，不用內部編號。
//
// 內部編號（dg0007 的 0007）來自 tools/photo-ids.json，一旦指派就固定不變，
// 所以照片下架後編號會留下空缺 —— 但畫面上的「第 N 張」是用陣列位置算的，
// 會自動遞補。兩者從此對不上：畫面顯示「第 5 張」，檔名卻是 0007。
// 賓客看到的是位置，檔名就該跟著位置。
function photoFileName(group, index, ext) {
  const n = String(index + 1).padStart(4, '0');   // index 是 0 起算，顯示是 1 起算
  return '婚禮回顧_' + group.title + '_' + n + '.' + ext;
}

function saveBlob(blob, name) {
  const objUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objUrl;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // 延後釋放，避免部分瀏覽器還沒開始寫檔就被撤銷
  setTimeout(function () { URL.revokeObjectURL(objUrl); }, 10000);
}

// 把圖片轉成指定格式。必須在設定 src 之前先設 crossOrigin，
// 否則 canvas 會被標記為 tainted，toBlob 會丟 SecurityError。
function convertPhoto(url, mime, quality) {
  return new Promise(function (resolve, reject) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      try {
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        // JPG 沒有透明通道，先鋪白底，避免透明區域轉出來變黑
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob); else reject(new Error('toBlob 回傳空值'));
        }, mime, quality);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = function () { reject(new Error('圖片載入失敗（可能是 CORS 未開啟）')); };
    img.src = url;
  });
}

async function downloadCurrentPhoto() {
  const group = PHOTO_GROUPS[lbGroup];
  if (!group) return;

  const id  = group.photos[lbIndex][0];
  const url = photoFullUrl(group, id);
  const btn = document.getElementById('lightboxDownload');
  const label = btn.querySelector('span:last-child');
  const original = label.textContent;

  btn.disabled = true;
  label.textContent = '處理中…';

  try {
    // 統一轉存為 JPG：相容性最好，而且不必在伺服器上多存一份檔案
    const blob = await convertPhoto(url, 'image/jpeg', 0.92);
    saveBlob(blob, photoFileName(group, lbIndex, 'jpg'));
  } catch (err) {
    // 轉檔或網路失敗時退回開新視窗，使用者仍可長按另存
    console.log('下載失敗，改為開新視窗:', err);
    window.open(url, '_blank', 'noopener');
  } finally {
    label.textContent = original;
    btn.disabled = false;
  }
}

// ==================== 錯誤處理 ====================
window.addEventListener('error', function (e) {
  console.error('發生錯誤:', e.error);
});
