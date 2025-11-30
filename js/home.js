// Tắt context menu (click chuột phải) cho toàn bộ trang
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
});

// Tắt text selection popup
document.addEventListener('selectstart', (e) => {
  e.preventDefault();
  return false;
});

// Tắt double-click để tra từ
document.addEventListener('dblclick', (e) => {
  e.preventDefault();
  return false;
});

// Tắt long press trên mobile
let touchStartTime = 0;
document.addEventListener('touchstart', (e) => {
  touchStartTime = Date.now();
});

document.addEventListener('touchend', (e) => {
  const touchDuration = Date.now() - touchStartTime;
  if (touchDuration > 500) {
    e.preventDefault();
    return false;
  }
});

