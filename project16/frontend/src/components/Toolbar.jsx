function Toolbar({
  tool,
  onToolChange,
  brushSize,
  onBrushSizeChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onSave,
  onGenerate3D,
  isSaving = false,
}) {
  return (
    <div className="toolbar-container bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            工具选择
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onToolChange('brush')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                tool === 'brush'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              🖌️ 画笔
            </button>
            <button
              onClick={() => onToolChange('eraser')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                tool === 'eraser'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              🧹 橡皮擦
            </button>
          </div>
        </div>

        <div className="h-12 w-px bg-gray-300 dark:bg-gray-600 hidden md:block"></div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            画笔大小: {brushSize}px
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="100"
              value={brushSize}
              onChange={(e) => onBrushSizeChange(Number(e.target.value))}
              className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <span className="text-sm font-mono text-gray-600 dark:text-gray-400 min-w-12">
              {brushSize}px
            </span>
          </div>
        </div>

        <div className="h-12 w-px bg-gray-300 dark:bg-gray-600 hidden md:block"></div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            操作
          </label>
          <div className="flex gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="px-3 py-2 rounded-lg font-medium transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↩️ 撤销
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="px-3 py-2 rounded-lg font-medium transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↪️ 重做
            </button>
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="flex gap-3">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg font-medium transition-all bg-green-600 hover:bg-green-700 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                保存中...
              </span>
            ) : (
              '💾 保存编辑'
            )}
          </button>
          <button
            onClick={onGenerate3D}
            className="px-5 py-2 rounded-lg font-medium transition-all bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            🚀 生成3D模型
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 快捷键: <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+Z</kbd> 撤销 | 
          <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-1">Ctrl+Y</kbd> 重做 | 
          <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-1">空格+拖动</kbd> 平移 | 
          <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-1">滚轮</kbd> 缩放
        </p>
      </div>
    </div>
  );
}

export default Toolbar;
