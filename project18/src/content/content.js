(function() {
  let isScreenshotMode = false;
  let selectionMode = false;
  let isScrollCapturing = false;
  let startX = 0, startY = 0;
  let elements = {};

  let annotationState = {
    currentTool: 'brush',
    currentColor: '#000000',
    brushSize: 4,
    fontSize: 16,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    historyStack: [],
    historyIndex: -1,
    textInput: null
  };

  let bgCanvas, bgCtx, drawCanvas, drawCtx;

  function init() {
    chrome.runtime.onMessage.addListener(handleMessage);
  }

  function handleMessage(request, sender, sendResponse) {
    if (request.action === 'START_SCREENSHOT') {
      startScreenshotMode();
      sendResponse({ success: true });
    }
  }

  function startScreenshotMode() {
    if (isScreenshotMode) return;
    isScreenshotMode = true;
    createToolbar();
    document.addEventListener('keydown', handleKeydown);
  }

  function createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = 'screenshot-toolbar';
    toolbar.innerHTML = `
      <button id="btn-area">区域截图</button>
      <button id="btn-scroll">滚动截图</button>
      <button id="btn-cancel">取消</button>
    `;
    Object.assign(toolbar.style, {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '9999999',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '8px 12px',
      display: 'flex',
      gap: '8px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      pointerEvents: 'auto'
    });
    document.body.appendChild(toolbar);
    elements.toolbar = toolbar;

    const buttons = toolbar.querySelectorAll('button');
    buttons.forEach(btn => {
      Object.assign(btn.style, {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background 0.2s'
      });
    });

    const btnArea = toolbar.querySelector('#btn-area');
    btnArea.style.background = '#2563eb';
    btnArea.style.color = '#fff';
    btnArea.addEventListener('mouseenter', () => btnArea.style.background = '#1d4ed8');
    btnArea.addEventListener('mouseleave', () => btnArea.style.background = '#2563eb');
    btnArea.addEventListener('click', (e) => {
      e.stopPropagation();
      startSelection();
    });

    const btnScroll = toolbar.querySelector('#btn-scroll');
    btnScroll.style.background = '#f3f4f6';
    btnScroll.style.color = '#374151';
    btnScroll.addEventListener('mouseenter', () => btnScroll.style.background = '#e5e7eb');
    btnScroll.addEventListener('mouseleave', () => btnScroll.style.background = '#f3f4f6');
    btnScroll.addEventListener('click', startScrollScreenshot);

    const btnCancel = toolbar.querySelector('#btn-cancel');
    btnCancel.style.background = '#ef4444';
    btnCancel.style.color = '#fff';
    btnCancel.addEventListener('mouseenter', () => btnCancel.style.background = '#dc2626');
    btnCancel.addEventListener('mouseleave', () => btnCancel.style.background = '#ef4444');
    btnCancel.addEventListener('click', (e) => {
      e.stopPropagation();
      exitScreenshotMode();
    });
  }

  function startSelection() {
    selectionMode = true;
    elements.toolbar.style.display = 'none';

    const overlay = document.createElement('div');
    overlay.id = 'screenshot-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '9999998',
      cursor: 'crosshair',
      pointerEvents: 'auto'
    });
    document.body.appendChild(overlay);
    elements.overlay = overlay;

    const mask = document.createElement('div');
    mask.id = 'screenshot-mask';
    Object.assign(mask.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      pointerEvents: 'none'
    });
    overlay.appendChild(mask);
    elements.mask = mask;

    const selection = document.createElement('div');
    selection.id = 'screenshot-selection';
    Object.assign(selection.style, {
      position: 'absolute',
      border: '2px solid #2563eb',
      background: 'transparent',
      pointerEvents: 'none',
      display: 'none',
      boxSizing: 'border-box'
    });
    overlay.appendChild(selection);
    elements.selection = selection;

    const sizeLabel = document.createElement('div');
    sizeLabel.id = 'screenshot-size';
    Object.assign(sizeLabel.style, {
      position: 'absolute',
      background: 'rgba(0, 0, 0, 0.75)',
      color: '#fff',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      pointerEvents: 'none',
      display: 'none',
      zIndex: '10'
    });
    overlay.appendChild(sizeLabel);
    elements.sizeLabel = sizeLabel;

    overlay.addEventListener('mousedown', handleMouseDown);
  }

  function handleMouseDown(e) {
    if (!selectionMode) return;
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;

    elements.selection.style.display = 'block';
    elements.sizeLabel.style.display = 'block';

    updateSelection(startX, startY, 0, 0);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, { once: true });
  }

  function handleMouseMove(e) {
    e.preventDefault();
    const currentX = e.clientX;
    const currentY = e.clientY;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    updateSelection(left, top, width, height);
  }

  function updateSelection(left, top, width, height) {
    elements.selection.style.left = `${left}px`;
    elements.selection.style.top = `${top}px`;
    elements.selection.style.width = `${width}px`;
    elements.selection.style.height = `${height}px`;

    elements.mask.style.clipPath = `polygon(
      0% 0%, 0% 100%,
      ${left}px 100%, ${left}px ${top}px,
      ${left + width}px ${top}px, ${left + width}px ${top + height}px,
      ${left}px ${top + height}px, ${left}px 100%,
      100% 100%, 100% 0%
    )`;

    elements.sizeLabel.textContent = `${width} × ${height}`;
    const labelWidth = 60;
    const labelHeight = 26;
    let labelLeft = left + width + 8;
    let labelTop = top + height + 8;

    if (labelLeft + labelWidth > window.innerWidth) {
      labelLeft = left - labelWidth - 8;
    }
    if (labelTop + labelHeight > window.innerHeight) {
      labelTop = top - labelHeight - 8;
    }

    elements.sizeLabel.style.left = `${Math.max(8, labelLeft)}px`;
    elements.sizeLabel.style.top = `${Math.max(8, labelTop)}px`;
  }

  async function handleMouseUp(e) {
    document.removeEventListener('mousemove', handleMouseMove);
    const width = Math.abs(e.clientX - startX);
    const height = Math.abs(e.clientY - startY);

    if (width < 10 || height < 10) {
      return;
    }

    const left = Math.min(startX, e.clientX);
    const top = Math.min(startY, e.clientY);

    try {
      const response = await chrome.runtime.sendMessage({ action: 'CAPTURE_SCREENSHOT' });
      if (response && response.success) {
        cropAndEnterAnnotation(response.dataUrl, left, top, width, height);
      }
    } catch (e) {}
  }

  function cropAndEnterAnnotation(dataUrl, x, y, width, height) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = img.width / window.innerWidth;
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, x * scale, y * scale, width * scale, height * scale, 0, 0, width * scale, height * scale);
      
      exitScreenshotMode();
      enterAnnotationMode(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  }

  async function startScrollScreenshot(e) {
    e.stopPropagation();
    e.preventDefault();
    
    elements.toolbar.style.display = 'none';
    isScrollCapturing = true;
    
    const progressBar = document.createElement('div');
    Object.assign(progressBar.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '9999999',
      background: '#fff',
      borderRadius: '12px',
      padding: '24px 32px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      textAlign: 'center',
      pointerEvents: 'auto'
    });
    progressBar.innerHTML = `
      <div style="margin-bottom: 16px; font-weight: 600; color: #1f2937;">正在滚动截图...</div>
      <div style="width: 200px; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
        <div id="scroll-progress" style="height: 100%; background: #2563eb; width: 0%; transition: width 0.3s;"></div>
      </div>
      <div id="scroll-text" style="margin-top: 12px; font-size: 14px; color: #6b7280;">0%</div>
    `;
    document.body.appendChild(progressBar);
    elements.progressBar = progressBar;

    const scrollHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const overlap = 50;
    const captureHeight = viewportHeight - overlap;
    const totalScreens = Math.ceil((scrollHeight - overlap) / captureHeight);
    const capturedScreens = [];
    let currentScreen = 0;

    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);

    async function captureNext() {
      if (!isScrollCapturing) return;
      
      if (currentScreen >= totalScreens) {
        await finishScrollScreenshot(capturedScreens, originalScrollY, overlap);
        return;
      }

      const targetScroll = currentScreen * captureHeight;
      window.scrollTo(0, targetScroll);

      await new Promise(resolve => setTimeout(resolve, 200));

      if (!isScrollCapturing) return;

      elements.progressBar.style.visibility = 'hidden';
      await new Promise(resolve => setTimeout(resolve, 50));

      if (!isScrollCapturing) return;

      const response = await chrome.runtime.sendMessage({ action: 'CAPTURE_SCREENSHOT' });

      elements.progressBar.style.visibility = 'visible';

      if (response.success && isScrollCapturing) {
        capturedScreens.push({
          dataUrl: response.dataUrl,
          yOffset: targetScroll,
          captureHeight: captureHeight,
          isLast: currentScreen === totalScreens - 1
        });
      }

      currentScreen++;
      const progress = Math.round((currentScreen / totalScreens) * 100);
      const progressEl = document.getElementById('scroll-progress');
      const textEl = document.getElementById('scroll-text');
      if (progressEl) progressEl.style.width = `${progress}%`;
      if (textEl) textEl.textContent = `${progress}%`;

      if (isScrollCapturing) {
        setTimeout(captureNext, 50);
      }
    }

    setTimeout(captureNext, 300);
  }

  async function finishScrollScreenshot(capturedScreens, originalScrollY, overlap) {
    isScrollCapturing = false;
    window.scrollTo(0, originalScrollY);

    const fullHeight = document.documentElement.scrollHeight;
    const fullWidth = document.documentElement.clientWidth;
    const dpr = window.devicePixelRatio;

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = fullWidth * dpr;
    finalCanvas.height = fullHeight * dpr;
    const finalCtx = finalCanvas.getContext('2d');

    const loadImage = (dataUrl) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = dataUrl;
      });
    };

    for (const screen of capturedScreens) {
      const img = await loadImage(screen.dataUrl);
      const scale = img.width / window.innerWidth;
      const cropOverlap = screen.isLast ? 0 : overlap * scale;
      
      finalCtx.drawImage(
        img,
        0, 0,
        img.width, img.height - cropOverlap,
        0, screen.yOffset * scale,
        img.width, img.height - cropOverlap
      );
    }

    elements.progressBar.remove();
    exitScreenshotMode();
    enterAnnotationMode(finalCanvas.toDataURL('image/png'));
  }

  function enterAnnotationMode(imageDataUrl) {
    annotationState.historyStack = [];
    annotationState.historyIndex = -1;

    const overlay = document.createElement('div');
    overlay.id = 'annotation-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      background: '#000',
      zIndex: '9999998',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'auto',
      pointerEvents: 'auto'
    });
    document.body.appendChild(overlay);
    elements.annotationOverlay = overlay;

    createAnnotationToolbar(overlay);

    const canvasContainer = document.createElement('div');
    Object.assign(canvasContainer.style, {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px 20px',
      width: '100%',
      boxSizing: 'border-box'
    });
    overlay.appendChild(canvasContainer);

    const canvasWrapper = document.createElement('div');
    Object.assign(canvasWrapper.style, {
      position: 'relative',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    });
    canvasContainer.appendChild(canvasWrapper);

    const img = new Image();
    img.onload = () => {
      bgCanvas = document.createElement('canvas');
      bgCanvas.width = img.width;
      bgCanvas.height = img.height;
      bgCtx = bgCanvas.getContext('2d');
      bgCtx.drawImage(img, 0, 0);
      Object.assign(bgCanvas.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        maxWidth: '100%',
        height: 'auto'
      });
      canvasWrapper.appendChild(bgCanvas);

      drawCanvas = document.createElement('canvas');
      drawCanvas.width = img.width;
      drawCanvas.height = img.height;
      drawCtx = drawCanvas.getContext('2d');
      Object.assign(drawCanvas.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        maxWidth: '100%',
        height: 'auto',
        cursor: 'crosshair'
      });
      canvasWrapper.appendChild(drawCanvas);

      canvasWrapper.style.width = `${img.width}px`;
      canvasWrapper.style.height = `${img.height}px`;

      saveToHistory();
      setupDrawingEvents();
      updateCursor();
    };
    img.src = imageDataUrl;

    document.addEventListener('keydown', handleAnnotationKeydown);
  }

  function createAnnotationToolbar(overlay) {
    const toolbar = document.createElement('div');
    toolbar.id = 'annotation-toolbar';
    Object.assign(toolbar.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      height: '60px',
      background: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      zIndex: '10',
      padding: '0 16px',
      boxSizing: 'border-box',
      pointerEvents: 'auto'
    });

    const buttons = [
      { id: 'tool-brush', text: '画笔', active: true },
      { id: 'tool-text', text: '文字' },
      { id: 'tool-eraser', text: '橡皮擦' },
      { id: 'size-2', text: '细', size: 2 },
      { id: 'size-4', text: '中', size: 4, active: true },
      { id: 'size-8', text: '粗', size: 8 },
      { separator: true },
      { id: 'color-black', color: '#000000', active: true },
      { id: 'color-red', color: '#ef4444' },
      { id: 'color-blue', color: '#3b82f6' },
      { id: 'color-green', color: '#22c55e' },
      { id: 'color-yellow', color: '#eab308' },
      { separator: true },
      { id: 'action-undo', text: '撤销', disabled: true },
      { separator: true },
      { id: 'export-png', text: 'PNG' },
      { id: 'export-pdf', text: 'PDF' },
      { id: 'action-exit', text: '退出' }
    ];

    buttons.forEach(btn => {
      if (btn.separator) {
        const sep = document.createElement('div');
        Object.assign(sep.style, {
          width: '1px',
          height: '24px',
          background: '#374151',
          margin: '0 8px'
        });
        toolbar.appendChild(sep);
        return;
      }

      const el = document.createElement('button');
      el.id = btn.id;

      if (btn.color) {
        el.innerHTML = '';
        Object.assign(el.style, {
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: btn.active ? '3px solid #fff' : '2px solid transparent',
          background: btn.color,
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: btn.active ? '0 0 0 2px #3b82f6' : 'none'
        });
        el.dataset.color = btn.color;
        el.addEventListener('click', () => selectColor(btn.color, el));
      } else {
        el.textContent = btn.text;
        Object.assign(el.style, {
          padding: '8px 14px',
          borderRadius: '6px',
          border: 'none',
          background: btn.active ? '#3b82f6' : '#374151',
          color: btn.disabled ? '#6b7280' : '#fff',
          cursor: btn.disabled ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          fontWeight: '500',
          transition: 'background 0.2s'
        });
        el.disabled = btn.disabled;
      }

      toolbar.appendChild(el);
    });

    overlay.appendChild(toolbar);

    document.getElementById('tool-brush').addEventListener('click', () => selectTool('brush'));
    document.getElementById('tool-text').addEventListener('click', () => selectTool('text'));
    document.getElementById('tool-eraser').addEventListener('click', () => selectTool('eraser'));
    document.getElementById('size-2').addEventListener('click', () => selectSize(2));
    document.getElementById('size-4').addEventListener('click', () => selectSize(4));
    document.getElementById('size-8').addEventListener('click', () => selectSize(8));
    document.getElementById('action-undo').addEventListener('click', undo);
    document.getElementById('export-png').addEventListener('click', exportPNG);
    document.getElementById('export-pdf').addEventListener('click', exportPDF);
    document.getElementById('action-exit').addEventListener('click', exitAnnotationMode);
  }

  function selectTool(tool) {
    annotationState.currentTool = tool;
    
    document.getElementById('tool-brush').style.background = tool === 'brush' ? '#3b82f6' : '#374151';
    document.getElementById('tool-text').style.background = tool === 'text' ? '#3b82f6' : '#374151';
    document.getElementById('tool-eraser').style.background = tool === 'eraser' ? '#3b82f6' : '#374151';
    
    removeTextInput();
    updateCursor();
  }

  function selectSize(size) {
    annotationState.brushSize = size;
    
    [2, 4, 8].forEach(s => {
      const btn = document.getElementById(`size-${s}`);
      btn.style.background = s === size ? '#3b82f6' : '#374151';
    });
  }

  function selectColor(color, btnEl) {
    annotationState.currentColor = color;
    
    document.querySelectorAll('[data-color]').forEach(btn => {
      btn.style.border = '2px solid transparent';
      btn.style.boxShadow = 'none';
    });
    btnEl.style.border = '3px solid #fff';
    btnEl.style.boxShadow = '0 0 0 2px #3b82f6';
  }

  function updateCursor() {
    if (!drawCanvas) return;
    if (annotationState.currentTool === 'eraser') {
      drawCanvas.style.cursor = 'cell';
    } else if (annotationState.currentTool === 'text') {
      drawCanvas.style.cursor = 'text';
    } else {
      drawCanvas.style.cursor = 'crosshair';
    }
  }

  function setupDrawingEvents() {
    drawCanvas.addEventListener('mousedown', startDrawing);
    drawCanvas.addEventListener('mousemove', draw);
    drawCanvas.addEventListener('mouseup', stopDrawing);
    drawCanvas.addEventListener('mouseleave', stopDrawing);
  }

  function startDrawing(e) {
    if (annotationState.currentTool === 'text') {
      createTextInput(e);
      return;
    }
    annotationState.isDrawing = true;
    const rect = drawCanvas.getBoundingClientRect();
    const scale = drawCanvas.width / rect.width;
    annotationState.lastX = (e.clientX - rect.left) * scale;
    annotationState.lastY = (e.clientY - rect.top) * scale;
  }

  function createTextInput(e) {
    removeTextInput();
    
    const rect = drawCanvas.getBoundingClientRect();
    const scale = drawCanvas.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '输入文字...';
    Object.assign(input.style, {
      position: 'absolute',
      left: `${e.clientX - rect.left}px`,
      top: `${e.clientY - rect.top - 20}px`,
      background: 'rgba(255,255,255,0.95)',
      border: `2px solid ${annotationState.currentColor}`,
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: `${annotationState.brushSize * 4}px`,
      color: annotationState.currentColor,
      outline: 'none',
      zIndex: '100',
      minWidth: '100px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    });
    
    input.dataset.x = x;
    input.dataset.y = y;
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        drawText(input.value, x, y);
        removeTextInput();
      } else if (e.key === 'Escape') {
        removeTextInput();
      }
    });
    
    input.addEventListener('blur', () => {
      if (input.value.trim()) {
        drawText(input.value, x, y);
      }
      removeTextInput();
    });
    
    drawCanvas.parentElement.appendChild(input);
    annotationState.textInput = input;
    
    setTimeout(() => input.focus(), 10);
  }

  function removeTextInput() {
    if (annotationState.textInput) {
      try {
        annotationState.textInput.remove();
      } catch(e) {}
      annotationState.textInput = null;
    }
  }

  function drawText(text, x, y) {
    if (!text.trim()) return;
    
    const fontSize = annotationState.brushSize * 4;
    drawCtx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    drawCtx.fillStyle = annotationState.currentColor;
    drawCtx.textBaseline = 'bottom';
    drawCtx.fillText(text, x, y);
    
    saveToHistory();
    updateUndoButton();
  }

  function draw(e) {
    if (!annotationState.isDrawing) return;

    const rect = drawCanvas.getBoundingClientRect();
    const scale = drawCanvas.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    drawCtx.beginPath();
    drawCtx.moveTo(annotationState.lastX, annotationState.lastY);
    drawCtx.lineTo(x, y);
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    drawCtx.lineWidth = annotationState.brushSize * scale;

    if (annotationState.currentTool === 'eraser') {
      drawCtx.globalCompositeOperation = 'destination-out';
    } else {
      drawCtx.globalCompositeOperation = 'source-over';
      drawCtx.strokeStyle = annotationState.currentColor;
    }

    drawCtx.stroke();

    annotationState.lastX = x;
    annotationState.lastY = y;
  }

  function stopDrawing() {
    if (annotationState.isDrawing) {
      annotationState.isDrawing = false;
      saveToHistory();
      updateUndoButton();
    }
  }

  function saveToHistory() {
    if (!drawCanvas) return;
    
    annotationState.historyStack = annotationState.historyStack.slice(0, annotationState.historyIndex + 1);
    annotationState.historyStack.push(drawCanvas.toDataURL());
    annotationState.historyIndex++;
    updateUndoButton();
  }

  function undo() {
    removeTextInput();
    
    if (annotationState.historyIndex <= 0) return;

    annotationState.historyIndex--;
    const img = new Image();
    img.onload = () => {
      drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
      drawCtx.drawImage(img, 0, 0);
      updateUndoButton();
    };
    img.src = annotationState.historyStack[annotationState.historyIndex];
  }

  function updateUndoButton() {
    const undoBtn = document.getElementById('action-undo');
    const canUndo = annotationState.historyIndex > 0;
    undoBtn.disabled = !canUndo;
    undoBtn.style.background = canUndo ? '#374151' : '#374151';
    undoBtn.style.color = canUndo ? '#fff' : '#6b7280';
    undoBtn.style.cursor = canUndo ? 'pointer' : 'not-allowed';
  }

  function exportPNG() {
    removeTextInput();
    
    const mergedCanvas = document.createElement('canvas');
    mergedCanvas.width = bgCanvas.width;
    mergedCanvas.height = bgCanvas.height;
    const mergedCtx = mergedCanvas.getContext('2d');
    
    mergedCtx.drawImage(bgCanvas, 0, 0);
    mergedCtx.drawImage(drawCanvas, 0, 0);

    mergedCanvas.toBlob(async (blob) => {
      const url = URL.createObjectURL(blob);
      await chrome.runtime.sendMessage({
        action: 'DOWNLOAD_SCREENSHOT',
        dataUrl: url,
        filename: `screenshot-${Date.now()}.png`
      });
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  async function exportPDF() {
    try {
      removeTextInput();
      
      const mergedCanvas = document.createElement('canvas');
      mergedCanvas.width = bgCanvas.width;
      mergedCanvas.height = bgCanvas.height;
      const mergedCtx = mergedCanvas.getContext('2d');
      mergedCtx.drawImage(bgCanvas, 0, 0);
      mergedCtx.drawImage(drawCanvas, 0, 0);

      mergedCanvas.toBlob(async (blob) => {
        const url = URL.createObjectURL(blob);
        await chrome.runtime.sendMessage({
          action: 'DOWNLOAD_SCREENSHOT',
          dataUrl: url,
          filename: `screenshot-${Date.now()}.pdf`
        });
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (e) {}
  }

  function exitAnnotationMode() {
    document.removeEventListener('keydown', handleAnnotationKeydown);
    try {
      if (elements.annotationOverlay) {
        elements.annotationOverlay.remove();
        delete elements.annotationOverlay;
      }
    } catch(e) {}
    bgCanvas = null;
    bgCtx = null;
    drawCanvas = null;
    drawCtx = null;
  }

  function handleAnnotationKeydown(e) {
    if (e.key === 'Escape') {
      exitAnnotationMode();
    }
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      undo();
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      exitScreenshotMode();
    }
  }

  function exitScreenshotMode() {
    isScrollCapturing = false;
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('mousemove', handleMouseMove);

    Object.values(elements).forEach(el => {
      try { el?.remove(); } catch(e) {}
    });
    elements = {};

    isScreenshotMode = false;
    selectionMode = false;
  }

  init();
})();