import { useState, useEffect, useRef, useCallback } from 'react';

function CanvasEditor({
  imageUrl,
  initialMaskData,
  tool = 'brush',
  brushSize = 20,
  onMaskChange,
  scale = 1,
  onScaleChange,
  offset = { x: 0, y: 0 },
  onOffsetChange,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);
  const [displayMode, setDisplayMode] = useState('overlay');

  const canvasWidth = 800;
  const canvasHeight = 600;

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = getContext();
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(newHistory.length - 1);
    }
    
    setHistory(newHistory);
  }, [history, historyIndex, getContext]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      
      const ctx = getContext();
      if (ctx && history[newIndex]) {
        ctx.putImageData(history[newIndex], 0, 0);
        if (onMaskChange) {
          const canvas = canvasRef.current;
          onMaskChange(canvas.toDataURL());
        }
      }
    }
  }, [historyIndex, history, getContext, onMaskChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      
      const ctx = getContext();
      if (ctx && history[newIndex]) {
        ctx.putImageData(history[newIndex], 0, 0);
        if (onMaskChange) {
          const canvas = canvasRef.current;
          onMaskChange(canvas.toDataURL());
        }
      }
    }
  }, [historyIndex, history, getContext, onMaskChange]);

  const initializeCanvas = useCallback((width, height) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width || canvasWidth;
    canvas.height = height || canvasHeight;

    const ctx = getContext();
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      saveToHistory();
    }
  }, [getContext, saveToHistory]);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const maxWidth = 800;
      const maxHeight = 600;
      
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }
      
      setImageSize({ width: Math.round(width), height: Math.round(height) });
      initializeCanvas(Math.round(width), Math.round(height));
      setImageLoaded(true);
    };
    
    img.onerror = () => {
      setImageLoaded(false);
    };
    
    img.src = imageUrl;
  }, [imageUrl, initializeCanvas]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !spacePressed) {
        e.preventDefault();
        setSpacePressed(true);
      }
      if (e.ctrlKey && e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey && e.shiftKey && e.code === 'KeyZ') || (e.ctrlKey && e.code === 'KeyY')) {
        e.preventDefault();
        redo();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [spacePressed, undo, redo]);

  const getCanvasPosition = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const draw = useCallback((pos) => {
    const ctx = getContext();
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
    
    if (tool === 'brush') {
      ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.fillStyle = 'rgba(255, 0, 0, 1)';
      ctx.globalCompositeOperation = 'destination-out';
    }
    
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }, [getContext, tool, brushSize]);

  const handleMouseDown = (e) => {
    if (spacePressed || e.button === 1) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }

    setIsDrawing(true);
    const pos = getCanvasPosition(e);
    draw(pos);
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setLastMousePos({ x: e.clientX, y: e.clientY });
      if (onOffsetChange) {
        onOffsetChange({
          x: offset.x + dx,
          y: offset.y + dy,
        });
      }
      return;
    }

    if (!isDrawing) return;
    const pos = getCanvasPosition(e);
    draw(pos);
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
      
      if (onMaskChange) {
        const canvas = canvasRef.current;
        if (canvas) {
          onMaskChange(canvas.toDataURL());
        }
      }
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.1, Math.min(5, scale + delta));
    if (onScaleChange) {
      onScaleChange(newScale);
    }
  };

  const resetView = () => {
    if (onScaleChange) onScaleChange(1);
    if (onOffsetChange) onOffsetChange({ x: 0, y: 0 });
  };

  const clearMask = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
    
    if (onMaskChange) {
      onMaskChange(canvas.toDataURL());
    }
  };

  const getMaskDataUrl = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL();
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="canvas-editor-container w-full h-full flex flex-col">
      <div className="editor-toolbar flex flex-wrap items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">模式:</span>
          <select
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <option value="overlay">叠加显示</option>
            <option value="mask">仅蒙版</option>
            <option value="original">仅原图</option>
          </select>
        </div>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-gray-200"
          >
            撤销 (Ctrl+Z)
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-gray-200"
          >
            重做 (Ctrl+Y)
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">缩放:</span>
          <button
            onClick={() => onScaleChange && onScaleChange(Math.max(0.1, scale - 0.1))}
            className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
          >
            -
          </button>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 min-w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => onScaleChange && onScaleChange(Math.min(5, scale + 0.1))}
            className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
          >
            +
          </button>
          <button
            onClick={resetView}
            className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
          >
            重置
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

        <button
          onClick={clearMask}
          className="px-3 py-1 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400"
        >
          清除蒙版
        </button>
      </div>

      <div
        ref={containerRef}
        className="editor-canvas-container flex-1 relative overflow-hidden bg-gray-200 dark:bg-gray-900 rounded-b-lg"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
        onWheel={handleWheel}
      >
        {!imageLoaded && imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        )}

        {imageLoaded && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              cursor: isPanning ? 'grabbing' : spacePressed ? 'grab' : 'crosshair',
            }}
          >
            <div className="relative">
              {displayMode !== 'mask' && imageUrl && (
                <img
                  src={imageUrl}
                  alt="Original"
                  className="absolute top-0 left-0 max-w-none"
                  style={{
                    width: imageSize.width,
                    height: imageSize.height,
                    opacity: displayMode === 'original' ? 1 : 0.7,
                  }}
                />
              )}
              
              <canvas
                ref={canvasRef}
                width={imageSize.width || canvasWidth}
                height={imageSize.height || canvasHeight}
                className="relative"
                style={{
                  width: imageSize.width || canvasWidth,
                  height: imageSize.height || canvasHeight,
                  opacity: displayMode === 'original' ? 0 : 1,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          </div>
        )}

        {spacePressed && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 text-white text-sm rounded">
            按住拖动平移 | 滚轮缩放 | Ctrl+Z 撤销 | Ctrl+Y 重做
          </div>
        )}
      </div>

      <div className="editor-status-bar flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <span>
          画布: {imageSize.width} × {imageSize.height} px
        </span>
        <span>
          缩放: {Math.round(scale * 100)}% | 
          历史: {historyIndex + 1}/{history.length}
        </span>
      </div>
    </div>
  );
}

export default CanvasEditor;
