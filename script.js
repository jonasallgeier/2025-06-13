// script.js
const container = document.getElementById('svg-container');
const svg = document.getElementById('my-svg');

let scale = 1;
let originX = 0;
let originY = 0;
let isPanning = false;
let startX, startY;

container.addEventListener('wheel', (e) => {
  e.preventDefault();

  const zoomFactor = 0.1;
  const rect = svg.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const prevScale = scale;
  scale += e.deltaY > 0 ? -zoomFactor : zoomFactor;
  scale = Math.max(0.1, Math.min(scale, 10)); // Clamp scale

  // Adjust origin so zoom centers on mouse
  originX -= (mouseX / prevScale - mouseX / scale);
  originY -= (mouseY / prevScale - mouseY / scale);

  svg.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
});

container.addEventListener('mousedown', (e) => {
  isPanning = true;
  startX = e.clientX;
  startY = e.clientY;
  container.style.cursor = 'grabbing';
});

container.addEventListener('mouseup', () => {
  isPanning = false;
  container.style.cursor = 'grab';
});

container.addEventListener('mousemove', (e) => {
  if (!isPanning) return;
  originX += (e.clientX - startX) / scale;
  originY += (e.clientY - startY) / scale;
  startX = e.clientX;
  startY = e.clientY;
  svg.style.transform = `scale(${scale}) translate(${originX}px, ${originY}px)`;
});

let lastTouchDistance = null;
let lastTouchCenter = null;

function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getTouchCenter(touches) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2
  };
}

container.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    lastTouchDistance = getTouchDistance(e.touches);
    lastTouchCenter = getTouchCenter(e.touches);
  }
});

container.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();

    const newDistance = getTouchDistance(e.touches);
    const newCenter = getTouchCenter(e.touches);

    const zoomFactor = newDistance / lastTouchDistance;
    const newScale = Math.max(0.1, Math.min(scale * zoomFactor, 10));

    // Adjust origin to zoom toward center of pinch
    const rect = svg.getBoundingClientRect();
    const centerX = newCenter.x - rect.left;
    const centerY = newCenter.y - rect.top;

    originX -= (centerX / scale - centerX / newScale);
    originY -= (centerY / scale - centerY / newScale);

    scale = newScale;
    svg.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;

    lastTouchDistance = newDistance;
    lastTouchCenter = newCenter;
  }
});

container.addEventListener('touchend', (e) => {
  if (e.touches.length < 2) {
    lastTouchDistance = null;
    lastTouchCenter = null;
  }
});