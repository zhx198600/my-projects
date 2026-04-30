const App = {
    state: {
        imageLoaded: false,
        currentMode: null,
        hasTransparency: false,
        backgroundImage: null,
        backgroundColor: null,
        originalImageData: null,
        currentAngle: 0,
    },
    
    elements: {},
    
    history: {
        undoStack: [],
        redoStack: [],
        maxHistory: 50,
    },
    
    crop: {
        active: false,
        ratio: null,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        isDragging: false,
        isResizing: false,
        resizeHandle: null,
        startX: 0,
        startY: 0,
        startCropX: 0,
        startCropY: 0,
        startCropWidth: 0,
        startCropHeight: 0,
    },
    
    LABELS: {
        UNKNOWN: 0,
        FG_SEED: 1,
        BG_SEED: 2,
        FOREGROUND: 3,
        BACKGROUND: 4,
    },
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateUI();
    },
    
    cacheElements() {
        this.elements = {
            btnUpload: document.getElementById('btnUpload'),
            btnUploadMain: document.getElementById('btnUploadMain'),
            fileInput: document.getElementById('fileInput'),
            uploadArea: document.getElementById('uploadArea'),
            canvasContainer: document.getElementById('canvasContainer'),
            mainCanvas: document.getElementById('mainCanvas'),
            overlayCanvas: document.getElementById('overlayCanvas'),
            imageInfo: document.getElementById('imageInfo'),
            fileName: document.getElementById('fileName'),
            imageDimensions: document.getElementById('imageDimensions'),
            fileSize: document.getElementById('fileSize'),
            statusMessage: document.getElementById('statusMessage'),
            btnUndo: document.getElementById('btnUndo'),
            btnRedo: document.getElementById('btnRedo'),
            btnReset: document.getElementById('btnReset'),
            btnDownload: document.getElementById('btnDownload'),
            btnCrop: document.getElementById('btnCrop'),
            btnRotate: document.getElementById('btnRotate'),
            btnRemoveBg: document.getElementById('btnRemoveBg'),
            bgReplaceSection: document.getElementById('bgReplaceSection'),
            btnUploadBg: document.getElementById('btnUploadBg'),
            bgFileInput: document.getElementById('bgFileInput'),
            cropControls: document.getElementById('cropControls'),
            rotateControls: document.getElementById('rotateControls'),
            btnCancelCrop: document.getElementById('btnCancelCrop'),
            btnApplyCrop: document.getElementById('btnApplyCrop'),
            btnCancelRotate: document.getElementById('btnCancelRotate'),
            btnApplyRotate: document.getElementById('btnApplyRotate'),
            btnRotateLeft: document.getElementById('btnRotateLeft'),
            btnRotateRight: document.getElementById('btnRotateRight'),
            btnRotate180: document.getElementById('btnRotate180'),
            angleSlider: document.getElementById('angleSlider'),
            angleValue: document.getElementById('angleValue'),
            modal: document.getElementById('modal'),
            modalBody: document.getElementById('modalBody'),
            toastContainer: document.getElementById('toastContainer'),
        };
        
        this.elements.mainCtx = this.elements.mainCanvas.getContext('2d');
        this.elements.overlayCtx = this.elements.overlayCanvas.getContext('2d');
    },
    
    bindEvents() {
        this.elements.btnUpload.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.btnUploadMain.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        const uploadPlaceholder = this.elements.uploadArea.querySelector('.upload-placeholder');
        uploadPlaceholder.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadPlaceholder.classList.add('drag-over');
        });
        uploadPlaceholder.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadPlaceholder.classList.remove('drag-over');
        });
        uploadPlaceholder.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadPlaceholder.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.loadImageFile(files[0]);
            }
        });
        
        this.elements.btnUndo.addEventListener('click', () => this.undo());
        this.elements.btnRedo.addEventListener('click', () => this.redo());
        this.elements.btnReset.addEventListener('click', () => this.reset());
        this.elements.btnDownload.addEventListener('click', () => this.showDownloadModal());
        
        this.elements.btnCrop.addEventListener('click', () => this.enterCropMode());
        this.elements.btnRotate.addEventListener('click', () => this.enterRotateMode());
        this.elements.btnRemoveBg.addEventListener('click', () => this.removeBackground());
        
        this.elements.btnUploadBg.addEventListener('click', () => this.elements.bgFileInput.click());
        this.elements.bgFileInput.addEventListener('change', (e) => this.handleBgFileSelect(e));
        
        document.querySelectorAll('.bg-color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setBgColor(e.target.dataset.color));
        });
        
        this.elements.btnCancelCrop.addEventListener('click', () => this.exitCropMode(false));
        this.elements.btnApplyCrop.addEventListener('click', () => this.applyCrop());
        
        document.querySelectorAll('.ratio-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setCropRatio(e.target.dataset.ratio);
            });
        });
        
        this.elements.btnCancelRotate.addEventListener('click', () => this.exitRotateMode(false));
        this.elements.btnApplyRotate.addEventListener('click', () => this.applyRotation());
        this.elements.btnRotateLeft.addEventListener('click', () => this.rotateByAngle(-90));
        this.elements.btnRotateRight.addEventListener('click', () => this.rotateByAngle(90));
        this.elements.btnRotate180.addEventListener('click', () => this.rotateByAngle(180));
        this.elements.angleSlider.addEventListener('input', (e) => {
            const angle = parseInt(e.target.value);
            this.elements.angleValue.textContent = angle;
            this.previewRotation(angle);
        });
        
        this.elements.overlayCanvas.addEventListener('mousedown', (e) => this.handleCropMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleCropMouseMove(e));
        document.addEventListener('mouseup', () => this.handleCropMouseUp());
        
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                } else if (e.key === 'y') {
                    e.preventDefault();
                    this.redo();
                }
            }
            if (e.key === 'Escape') {
                if (this.state.currentMode === 'crop') {
                    this.exitCropMode(false);
                } else if (this.state.currentMode === 'rotate') {
                    this.exitRotateMode(false);
                }
            }
        });
    },
    
    updateUI() {
        const hasImage = this.state.imageLoaded;
        const canUndo = this.history.undoStack.length > 0;
        const canRedo = this.history.redoStack.length > 0;
        const hasBg = this.state.hasTransparency;
        
        this.elements.btnCrop.disabled = !hasImage;
        this.elements.btnRotate.disabled = !hasImage;
        this.elements.btnRemoveBg.disabled = !hasImage;
        this.elements.btnUndo.disabled = !canUndo;
        this.elements.btnRedo.disabled = !canRedo;
        this.elements.btnReset.disabled = !canUndo;
        this.elements.btnDownload.disabled = !hasImage;
        
        this.elements.btnCrop.classList.toggle('active', this.state.currentMode === 'crop');
        this.elements.btnRotate.classList.toggle('active', this.state.currentMode === 'rotate');
        
        if (hasBg) {
            this.elements.bgReplaceSection.style.display = 'block';
        }
    },
    
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadImageFile(file);
        }
        e.target.value = '';
    },
    
    loadImageFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('请选择图片文件', 'error');
            return;
        }
        
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showToast('文件过大，请选择小于 10MB 的图片', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.initCanvas(img);
                this.state.imageLoaded = true;
                this.state.hasTransparency = false;
                this.state.backgroundImage = null;
                this.state.backgroundColor = null;
                this.state.currentMode = null;
                
                this.elements.fileName.textContent = file.name;
                this.elements.imageDimensions.textContent = `${img.width} × ${img.height}`;
                this.elements.fileSize.textContent = this.formatFileSize(file.size);
                this.elements.imageInfo.style.display = 'flex';
                
                this.elements.uploadArea.style.display = 'none';
                this.elements.canvasContainer.style.display = 'flex';
                this.elements.bgReplaceSection.style.display = 'none';
                this.elements.statusMessage.textContent = '图片已加载，可开始编辑';
                
                this.clearHistory();
                this.saveState();
                this.updateUI();
                this.showToast('图片加载成功', 'success');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },
    
    initCanvas(img) {
        const canvas = this.elements.mainCanvas;
        const overlay = this.elements.overlayCanvas;
        
        canvas.width = img.width;
        canvas.height = img.height;
        overlay.width = img.width;
        overlay.height = img.height;
        
        this.elements.mainCtx.drawImage(img, 0, 0);
        
        this.state.originalImageData = this.elements.mainCtx.getImageData(0, 0, canvas.width, canvas.height);
    },
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    saveState() {
        const canvas = this.elements.mainCanvas;
        const imageData = this.elements.mainCtx.getImageData(0, 0, canvas.width, canvas.height);
        
        this.history.undoStack.push({
            imageData: imageData,
            width: canvas.width,
            height: canvas.height,
            hasTransparency: this.state.hasTransparency,
            backgroundColor: this.state.backgroundColor,
            backgroundImage: this.state.backgroundImage ? 
                this.elements.mainCanvas.toDataURL() : null,
        });
        
        if (this.history.undoStack.length > this.history.maxHistory) {
            this.history.undoStack.shift();
        }
        
        this.history.redoStack = [];
        this.updateUI();
    },
    
    undo() {
        if (this.history.undoStack.length <= 1) return;
        
        const current = this.history.undoStack.pop();
        this.history.redoStack.push(current);
        
        const prev = this.history.undoStack[this.history.undoStack.length - 1];
        this.restoreState(prev);
        this.showToast('已撤销', 'success');
    },
    
    redo() {
        if (this.history.redoStack.length === 0) return;
        
        const next = this.history.redoStack.pop();
        this.history.undoStack.push(next);
        this.restoreState(next);
        this.showToast('已重做', 'success');
    },
    
    restoreState(state) {
        const canvas = this.elements.mainCanvas;
        canvas.width = state.width;
        canvas.height = state.height;
        this.elements.overlayCanvas.width = state.width;
        this.elements.overlayCanvas.height = state.height;
        
        this.elements.mainCtx.putImageData(state.imageData, 0, 0);
        this.state.hasTransparency = state.hasTransparency;
        this.state.backgroundColor = state.backgroundColor;
        this.state.backgroundImage = state.backgroundImage;
        
        this.elements.imageDimensions.textContent = `${state.width} × ${state.height}`;
        
        if (this.state.hasTransparency) {
            this.elements.bgReplaceSection.style.display = 'block';
        }
        
        this.updateUI();
        this.render();
    },
    
    reset() {
        if (this.history.undoStack.length === 0) return;
        
        const first = this.history.undoStack[0];
        this.restoreState(first);
        
        this.history.undoStack = [first];
        this.history.redoStack = [];
        
        this.updateUI();
        this.showToast('已重置', 'success');
    },
    
    clearHistory() {
        this.history.undoStack = [];
        this.history.redoStack = [];
    },
    
    enterCropMode() {
        if (!this.state.imageLoaded) return;
        if (this.state.currentMode === 'crop') return;
        
        this.state.currentMode = 'crop';
        this.crop.active = true;
        
        const canvas = this.elements.mainCanvas;
        const margin = Math.min(canvas.width, canvas.height) * 0.1;
        this.crop.x = margin;
        this.crop.y = margin;
        this.crop.width = canvas.width - margin * 2;
        this.crop.height = canvas.height - margin * 2;
        this.crop.ratio = null;
        
        document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.ratio-btn[data-ratio="free"]').classList.add('active');
        
        this.elements.cropControls.style.display = 'block';
        this.elements.overlayCanvas.style.pointerEvents = 'auto';
        
        this.drawCropOverlay();
        this.updateUI();
    },
    
    exitCropMode(applyChanges) {
        this.state.currentMode = null;
        this.crop.active = false;
        
        this.elements.cropControls.style.display = 'none';
        this.elements.overlayCanvas.style.pointerEvents = 'none';
        
        this.clearOverlay();
        this.updateUI();
    },
    
    setCropRatio(ratio) {
        if (ratio === 'free') {
            this.crop.ratio = null;
        } else {
            const [w, h] = ratio.split(':').map(Number);
            this.crop.ratio = w / h;
            this.adjustCropBoxToRatio();
        }
        this.drawCropOverlay();
    },
    
    adjustCropBoxToRatio() {
        if (!this.crop.ratio) return;
        
        const canvas = this.elements.mainCanvas;
        const maxWidth = canvas.width - this.crop.x * 2;
        const maxHeight = canvas.height - this.crop.y * 2;
        
        let newWidth, newHeight;
        const canvasRatio = canvas.width / canvas.height;
        
        if (this.crop.ratio > canvasRatio) {
            newWidth = canvas.width * 0.8;
            newHeight = newWidth / this.crop.ratio;
        } else {
            newHeight = canvas.height * 0.8;
            newWidth = newHeight * this.crop.ratio;
        }
        
        this.crop.width = Math.min(newWidth, maxWidth);
        this.crop.height = Math.min(newHeight, maxHeight);
        this.crop.x = (canvas.width - this.crop.width) / 2;
        this.crop.y = (canvas.height - this.crop.height) / 2;
    },
    
    drawCropOverlay() {
        const ctx = this.elements.overlayCtx;
        const canvas = this.elements.overlayCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.clearRect(this.crop.x, this.crop.y, this.crop.width, this.crop.height);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        const cx = this.crop.x + this.crop.width / 3;
        const cx2 = this.crop.x + this.crop.width * 2 / 3;
        const cy = this.crop.y + this.crop.height / 3;
        const cy2 = this.crop.y + this.crop.height * 2 / 3;
        
        ctx.beginPath();
        ctx.moveTo(cx, this.crop.y);
        ctx.lineTo(cx, this.crop.y + this.crop.height);
        ctx.moveTo(cx2, this.crop.y);
        ctx.lineTo(cx2, this.crop.y + this.crop.height);
        ctx.moveTo(this.crop.x, cy);
        ctx.lineTo(this.crop.x + this.crop.width, cy);
        ctx.moveTo(this.crop.x, cy2);
        ctx.lineTo(this.crop.x + this.crop.width, cy2);
        ctx.stroke();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.crop.x, this.crop.y, this.crop.width, this.crop.height);
        
        const handleSize = 10;
        const handles = [
            { x: this.crop.x, y: this.crop.y, cursor: 'nw-resize', name: 'tl' },
            { x: this.crop.x + this.crop.width / 2, y: this.crop.y, cursor: 'n-resize', name: 't' },
            { x: this.crop.x + this.crop.width, y: this.crop.y, cursor: 'ne-resize', name: 'tr' },
            { x: this.crop.x + this.crop.width, y: this.crop.y + this.crop.height / 2, cursor: 'e-resize', name: 'r' },
            { x: this.crop.x + this.crop.width, y: this.crop.y + this.crop.height, cursor: 'se-resize', name: 'br' },
            { x: this.crop.x + this.crop.width / 2, y: this.crop.y + this.crop.height, cursor: 's-resize', name: 'b' },
            { x: this.crop.x, y: this.crop.y + this.crop.height, cursor: 'sw-resize', name: 'bl' },
            { x: this.crop.x, y: this.crop.y + this.crop.height / 2, cursor: 'w-resize', name: 'l' },
        ];
        
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        
        handles.forEach(h => {
            ctx.beginPath();
            ctx.rect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
            ctx.fill();
            ctx.stroke();
        });
    },
    
    handleCropMouseDown(e) {
        if (!this.crop.active) return;
        
        const rect = this.elements.overlayCanvas.getBoundingClientRect();
        const scaleX = this.elements.overlayCanvas.width / rect.width;
        const scaleY = this.elements.overlayCanvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const handleSize = 15;
        const handles = [
            { x: this.crop.x, y: this.crop.y, name: 'tl' },
            { x: this.crop.x + this.crop.width, y: this.crop.y, name: 'tr' },
            { x: this.crop.x, y: this.crop.y + this.crop.height, name: 'bl' },
            { x: this.crop.x + this.crop.width, y: this.crop.y + this.crop.height, name: 'br' },
            { x: this.crop.x + this.crop.width / 2, y: this.crop.y, name: 't' },
            { x: this.crop.x + this.crop.width / 2, y: this.crop.y + this.crop.height, name: 'b' },
            { x: this.crop.x, y: this.crop.y + this.crop.height / 2, name: 'l' },
            { x: this.crop.x + this.crop.width, y: this.crop.y + this.crop.height / 2, name: 'r' },
        ];
        
        for (const h of handles) {
            if (Math.abs(x - h.x) < handleSize && Math.abs(y - h.y) < handleSize) {
                this.crop.isResizing = true;
                this.crop.resizeHandle = h.name;
                this.crop.startX = x;
                this.crop.startY = y;
                this.crop.startCropX = this.crop.x;
                this.crop.startCropY = this.crop.y;
                this.crop.startCropWidth = this.crop.width;
                this.crop.startCropHeight = this.crop.height;
                return;
            }
        }
        
        if (x >= this.crop.x && x <= this.crop.x + this.crop.width &&
            y >= this.crop.y && y <= this.crop.y + this.crop.height) {
            this.crop.isDragging = true;
            this.crop.startX = x;
            this.crop.startY = y;
            this.crop.startCropX = this.crop.x;
            this.crop.startCropY = this.crop.y;
        }
    },
    
    handleCropMouseMove(e) {
        if (!this.crop.active) return;
        if (!this.crop.isDragging && !this.crop.isResizing) return;
        
        const rect = this.elements.overlayCanvas.getBoundingClientRect();
        const scaleX = this.elements.overlayCanvas.width / rect.width;
        const scaleY = this.elements.overlayCanvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const canvas = this.elements.overlayCanvas;
        const minSize = 20;
        
        if (this.crop.isDragging) {
            const dx = x - this.crop.startX;
            const dy = y - this.crop.startY;
            
            this.crop.x = Math.max(0, Math.min(canvas.width - this.crop.width, this.crop.startCropX + dx));
            this.crop.y = Math.max(0, Math.min(canvas.height - this.crop.height, this.crop.startCropY + dy));
        }
        
        if (this.crop.isResizing) {
            const dx = x - this.crop.startX;
            const dy = y - this.crop.startY;
            
            let newX = this.crop.startCropX;
            let newY = this.crop.startCropY;
            let newWidth = this.crop.startCropWidth;
            let newHeight = this.crop.startCropHeight;
            
            switch (this.crop.resizeHandle) {
                case 'tl':
                    newX = Math.min(this.crop.startCropX + this.crop.startCropWidth - minSize, this.crop.startCropX + dx);
                    newY = Math.min(this.crop.startCropY + this.crop.startCropHeight - minSize, this.crop.startCropY + dy);
                    newWidth = this.crop.startCropX + this.crop.startCropWidth - newX;
                    newHeight = this.crop.startCropY + this.crop.startCropHeight - newY;
                    break;
                case 'tr':
                    newY = Math.min(this.crop.startCropY + this.crop.startCropHeight - minSize, this.crop.startCropY + dy);
                    newWidth = Math.max(minSize, Math.min(canvas.width - this.crop.startCropX, this.crop.startCropWidth + dx));
                    newHeight = this.crop.startCropY + this.crop.startCropHeight - newY;
                    break;
                case 'bl':
                    newX = Math.min(this.crop.startCropX + this.crop.startCropWidth - minSize, this.crop.startCropX + dx);
                    newWidth = this.crop.startCropX + this.crop.startCropWidth - newX;
                    newHeight = Math.max(minSize, Math.min(canvas.height - this.crop.startCropY, this.crop.startCropHeight + dy));
                    break;
                case 'br':
                    newWidth = Math.max(minSize, Math.min(canvas.width - this.crop.startCropX, this.crop.startCropWidth + dx));
                    newHeight = Math.max(minSize, Math.min(canvas.height - this.crop.startCropY, this.crop.startCropHeight + dy));
                    break;
                case 't':
                    newY = Math.min(this.crop.startCropY + this.crop.startCropHeight - minSize, this.crop.startCropY + dy);
                    newHeight = this.crop.startCropY + this.crop.startCropHeight - newY;
                    break;
                case 'b':
                    newHeight = Math.max(minSize, Math.min(canvas.height - this.crop.startCropY, this.crop.startCropHeight + dy));
                    break;
                case 'l':
                    newX = Math.min(this.crop.startCropX + this.crop.startCropWidth - minSize, this.crop.startCropX + dx);
                    newWidth = this.crop.startCropX + this.crop.startCropWidth - newX;
                    break;
                case 'r':
                    newWidth = Math.max(minSize, Math.min(canvas.width - this.crop.startCropX, this.crop.startCropWidth + dx));
                    break;
            }
            
            if (this.crop.ratio) {
                if (['tl', 'tr', 'bl', 'br'].includes(this.crop.resizeHandle)) {
                    const aspectHeight = newWidth / this.crop.ratio;
                    const aspectWidth = newHeight * this.crop.ratio;
                    
                    if (Math.abs(newWidth - this.crop.startCropWidth) > Math.abs(newHeight - this.crop.startCropHeight)) {
                        newHeight = aspectHeight;
                    } else {
                        newWidth = aspectWidth;
                    }
                    
                    if (this.crop.resizeHandle === 'tl') {
                        newX = this.crop.startCropX + this.crop.startCropWidth - newWidth;
                        newY = this.crop.startCropY + this.crop.startCropHeight - newHeight;
                    } else if (this.crop.resizeHandle === 'tr') {
                        newY = this.crop.startCropY + this.crop.startCropHeight - newHeight;
                    } else if (this.crop.resizeHandle === 'bl') {
                        newX = this.crop.startCropX + this.crop.startCropWidth - newWidth;
                    }
                }
            }
            
            newX = Math.max(0, newX);
            newY = Math.max(0, newY);
            newWidth = Math.min(newWidth, canvas.width - newX);
            newHeight = Math.min(newHeight, canvas.height - newY);
            
            this.crop.x = newX;
            this.crop.y = newY;
            this.crop.width = newWidth;
            this.crop.height = newHeight;
        }
        
        this.drawCropOverlay();
    },
    
    handleCropMouseUp() {
        this.crop.isDragging = false;
        this.crop.isResizing = false;
        this.crop.resizeHandle = null;
    },
    
    applyCrop() {
        if (!this.crop.active) return;
        
        const canvas = this.elements.mainCanvas;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        const x = Math.round(this.crop.x);
        const y = Math.round(this.crop.y);
        const width = Math.round(this.crop.width);
        const height = Math.round(this.crop.height);
        
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        const imageData = this.elements.mainCtx.getImageData(x, y, width, height);
        tempCtx.putImageData(imageData, 0, 0);
        
        canvas.width = width;
        canvas.height = height;
        this.elements.overlayCanvas.width = width;
        this.elements.overlayCanvas.height = height;
        
        this.elements.mainCtx.drawImage(tempCanvas, 0, 0);
        
        this.elements.imageDimensions.textContent = `${width} × ${height}`;
        
        this.exitCropMode(true);
        this.saveState();
        this.showToast('裁剪已应用', 'success');
    },
    
    enterRotateMode() {
        if (!this.state.imageLoaded) return;
        if (this.state.currentMode === 'rotate') return;
        
        this.state.currentMode = 'rotate';
        this.state.currentAngle = 0;
        
        this.elements.angleSlider.value = 0;
        this.elements.angleValue.textContent = '0';
        
        this.elements.rotateControls.style.display = 'block';
        this.updateUI();
    },
    
    exitRotateMode(applyChanges) {
        if (!applyChanges && this.state.currentAngle !== 0) {
            this.previewRotation(0);
        }
        
        this.state.currentMode = null;
        this.state.currentAngle = 0;
        
        this.elements.rotateControls.style.display = 'none';
        this.updateUI();
    },
    
    rotateByAngle(angle) {
        const currentAngle = parseInt(this.elements.angleSlider.value);
        const newAngle = (currentAngle + angle + 360) % 360;
        this.elements.angleSlider.value = newAngle;
        this.elements.angleValue.textContent = newAngle;
        this.previewRotation(newAngle);
    },
    
    previewRotation(angle) {
        if (!this.state.imageLoaded) return;
        
        const canvas = this.elements.mainCanvas;
        const ctx = this.elements.mainCtx;
        
        const currentState = this.history.undoStack[this.history.undoStack.length - 1];
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = currentState.width;
        tempCanvas.height = currentState.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(currentState.imageData, 0, 0);
        
        const radians = (angle * Math.PI) / 180;
        const cos = Math.abs(Math.cos(radians));
        const sin = Math.abs(Math.sin(radians));
        
        const newWidth = Math.round(currentState.width * cos + currentState.height * sin);
        const newHeight = Math.round(currentState.width * sin + currentState.height * cos);
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        this.elements.overlayCanvas.width = newWidth;
        this.elements.overlayCanvas.height = newHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(radians);
        ctx.drawImage(tempCanvas, -currentState.width / 2, -currentState.height / 2);
        ctx.restore();
        
        this.render();
    },
    
    applyRotation() {
        if (this.state.currentAngle === 0) {
            this.exitRotateMode(false);
            return;
        }
        
        this.elements.imageDimensions.textContent = `${this.elements.mainCanvas.width} × ${this.elements.mainCanvas.height}`;
        
        this.exitRotateMode(true);
        this.saveState();
        this.showToast('旋转已应用', 'success');
    },
    
    removeBackground() {
        if (!this.state.imageLoaded) return;
        
        this.showLoadingModal('AI 抠图中...', '正在分析图片，请稍候');
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 95) {
                progress = 95;
            }
            this.updateProgress(progress);
        }, 200);
        
        setTimeout(() => {
            clearInterval(progressInterval);
            this.updateProgress(100);
            
            setTimeout(() => {
                this.hideModal();
                this.applySimulatedRemoveBg();
            }, 300);
        }, 2500);
    },
    
    applySimulatedRemoveBg() {
        const canvas = this.elements.mainCanvas;
        const ctx = this.elements.mainCtx;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        const L = this.LABELS;
        const labels = new Int8Array(width * height);
        
        this.initializeSeeds(labels, width, height, data);
        
        const fgModel = this.buildColorModel(data, width, height, labels, L.FG_SEED);
        const bgModel = this.buildColorModel(data, width, height, labels, L.BG_SEED);
        
        this.growRegions(data, labels, width, height, fgModel, bgModel);
        
        this.fillHoles(labels, width, height);
        
        this.removeSmallIslands(labels, width, height);
        
        const alphaMask = this.createAlphaMaskFromLabels(labels, width, height);
        
        this.applyEdgeBlending(alphaMask, width, height, 8);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const maskIdx = y * width + x;
                data[idx + 3] = Math.round(data[idx + 3] * alphaMask[maskIdx]);
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        this.state.hasTransparency = true;
        this.elements.bgReplaceSection.style.display = 'block';
        
        this.render();
        this.saveState();
        this.showToast('AI 抠图完成（模拟效果）', 'success');
    },
    
    initializeSeeds(labels, width, height, data) {
        const L = this.LABELS;
        const centerX = width / 2;
        const centerY = height * 0.38;
        
        const fgRadiusX = Math.min(width, height) * 0.28;
        const fgRadiusY = Math.min(width, height) * 0.35;
        
        const edgeWidth = Math.max(1, Math.floor(Math.min(width, height) * 0.06));
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                
                const isEdge = x < edgeWidth || x >= width - edgeWidth || 
                              y < edgeWidth || y >= height - edgeWidth;
                
                if (isEdge) {
                    labels[idx] = L.BG_SEED;
                } else {
                    const dx = (x - centerX) / fgRadiusX;
                    const dy = (y - centerY) / fgRadiusY;
                    const distFromCenter = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distFromCenter <= 1.0) {
                        labels[idx] = L.FG_SEED;
                    } else {
                        labels[idx] = L.UNKNOWN;
                    }
                }
            }
        }
        
        this.expandFgSeedsBySkinColor(labels, width, height, data);
    },
    
    expandFgSeedsBySkinColor(labels, width, height, data) {
        const L = this.LABELS;
        const tempLabels = new Int8Array(labels);
        
        for (let iter = 0; iter < 3; iter++) {
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = y * width + x;
                    
                    if (tempLabels[idx] === L.FG_SEED) {
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                if (dx === 0 && dy === 0) continue;
                                const nx = x + dx;
                                const ny = y + dy;
                                const nidx = ny * width + nx;
                                
                                if (labels[nidx] === L.UNKNOWN) {
                                    const pixIdx = nidx * 4;
                                    const skinScore = this.skinLikelihood(
                                        data[pixIdx], data[pixIdx + 1], data[pixIdx + 2]
                                    );
                                    if (skinScore > 0.2) {
                                        labels[nidx] = L.FG_SEED;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    
    buildColorModel(data, width, height, labels, targetLabel) {
        let sumR = 0, sumG = 0, sumB = 0;
        let sumR2 = 0, sumG2 = 0, sumB2 = 0;
        let count = 0;
        
        const colors = [];
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                if (labels[idx] === targetLabel) {
                    const pixIdx = idx * 4;
                    const r = data[pixIdx];
                    const g = data[pixIdx + 1];
                    const b = data[pixIdx + 2];
                    
                    sumR += r; sumG += g; sumB += b;
                    sumR2 += r * r; sumG2 += g * g; sumB2 += b * b;
                    count++;
                    
                    colors.push({ r, g, b });
                }
            }
        }
        
        if (count === 0) {
            return {
                mean: { r: 128, g: 128, b: 128 },
                std: { r: 50, g: 50, b: 50 },
                clusters: [{ r: 128, g: 128, b: 128 }]
            };
        }
        
        const mean = {
            r: sumR / count,
            g: sumG / count,
            b: sumB / count
        };
        
        const std = {
            r: Math.sqrt(sumR2 / count - mean.r * mean.r),
            g: Math.sqrt(sumG2 / count - mean.g * mean.g),
            b: Math.sqrt(sumB2 / count - mean.b * mean.b)
        };
        
        const clusters = this.clusterColors(colors, Math.min(5, Math.floor(count / 100) + 1));
        
        return { mean, std, clusters, count };
    },
    
    growRegions(data, labels, width, height, fgModel, bgModel) {
        const L = this.LABELS;
        const queue = [];
        const inQueue = new Int8Array(width * height);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                
                if (labels[idx] === L.UNKNOWN) {
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                const nidx = ny * width + nx;
                                if (labels[nidx] !== L.UNKNOWN) {
                                    if (inQueue[idx] === 0) {
                                        queue.push({ x, y, idx });
                                        inQueue[idx] = 1;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        while (queue.length > 0) {
            const current = queue.shift();
            const { x, y, idx } = current;
            inQueue[idx] = 0;
            
            if (labels[idx] !== L.UNKNOWN) continue;
            
            const pixIdx = idx * 4;
            const r = data[pixIdx];
            const g = data[pixIdx + 1];
            const b = data[pixIdx + 2];
            const color = { r, g, b };
            
            const fgDist = this.minDistanceToClusters(color, fgModel.clusters);
            const bgDist = this.minDistanceToClusters(color, bgModel.clusters);
            
            let hasFgNeighbor = false;
            let hasBgNeighbor = false;
            let fgNeighborCount = 0;
            let bgNeighborCount = 0;
            
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const nidx = ny * width + nx;
                        const nlabel = labels[nidx];
                        
                        if (nlabel === L.FG_SEED || nlabel === L.FOREGROUND) {
                            hasFgNeighbor = true;
                            fgNeighborCount++;
                        } else if (nlabel === L.BG_SEED || nlabel === L.BACKGROUND) {
                            hasBgNeighbor = true;
                            bgNeighborCount++;
                        }
                    }
                }
            }
            
            let newLabel = L.UNKNOWN;
            
            const distRatio = fgDist / (bgDist + 1);
            
            if (hasFgNeighbor && !hasBgNeighbor) {
                if (distRatio < 3.0 || fgDist < 50) {
                    newLabel = L.FOREGROUND;
                }
            } else if (hasBgNeighbor && !hasFgNeighbor) {
                if (distRatio > 0.33 || bgDist < 50) {
                    newLabel = L.BACKGROUND;
                }
            } else {
                if (fgDist < bgDist * 0.7) {
                    newLabel = L.FOREGROUND;
                } else if (bgDist < fgDist * 0.7) {
                    newLabel = L.BACKGROUND;
                } else if (fgNeighborCount > bgNeighborCount) {
                    newLabel = L.FOREGROUND;
                } else if (bgNeighborCount > fgNeighborCount) {
                    newLabel = L.BACKGROUND;
                }
            }
            
            if (newLabel !== L.UNKNOWN) {
                labels[idx] = newLabel;
                
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const nidx = ny * width + nx;
                            if (labels[nidx] === L.UNKNOWN && inQueue[nidx] === 0) {
                                queue.push({ x: nx, y: ny, idx: nidx });
                                inQueue[nidx] = 1;
                            }
                        }
                    }
                }
            }
        }
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                if (labels[idx] === L.UNKNOWN) {
                    const pixIdx = idx * 4;
                    const color = { r: data[pixIdx], g: data[pixIdx + 1], b: data[pixIdx + 2] };
                    
                    const fgDist = this.minDistanceToClusters(color, fgModel.clusters);
                    const bgDist = this.minDistanceToClusters(color, bgModel.clusters);
                    
                    labels[idx] = fgDist < bgDist ? L.FOREGROUND : L.BACKGROUND;
                }
            }
        }
    },
    
    minDistanceToClusters(color, clusters) {
        let minDist = Infinity;
        for (const cluster of clusters) {
            const dist = this.colorDistance(color, cluster);
            if (dist < minDist) {
                minDist = dist;
            }
        }
        return minDist;
    },
    
    fillHoles(labels, width, height) {
        const L = this.LABELS;
        const temp = new Int8Array(labels);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                if (labels[idx] === L.BACKGROUND || labels[idx] === L.BG_SEED) {
                    temp[idx] = L.BACKGROUND;
                } else {
                    temp[idx] = L.FOREGROUND;
                }
            }
        }
        
        const queue = [];
        const visited = new Int8Array(width * height);
        
        for (let y = 0; y < height; y++) {
            if (temp[y * width] === L.BACKGROUND && visited[y * width] === 0) {
                queue.push({ x: 0, y });
                visited[y * width] = 1;
            }
            if (temp[y * width + width - 1] === L.BACKGROUND && visited[y * width + width - 1] === 0) {
                queue.push({ x: width - 1, y });
                visited[y * width + width - 1] = 1;
            }
        }
        for (let x = 1; x < width - 1; x++) {
            if (temp[x] === L.BACKGROUND && visited[x] === 0) {
                queue.push({ x, y: 0 });
                visited[x] = 1;
            }
            if (temp[(height - 1) * width + x] === L.BACKGROUND && visited[(height - 1) * width + x] === 0) {
                queue.push({ x, y: height - 1 });
                visited[(height - 1) * width + x] = 1;
            }
        }
        
        while (queue.length > 0) {
            const { x, y } = queue.shift();
            
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (Math.abs(dx) + Math.abs(dy) !== 1) continue;
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const nidx = ny * width + nx;
                        if (temp[nidx] === L.BACKGROUND && visited[nidx] === 0) {
                            visited[nidx] = 1;
                            queue.push({ x: nx, y: ny });
                        }
                    }
                }
            }
        }
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                if (temp[idx] === L.BACKGROUND && visited[idx] === 0) {
                    labels[idx] = L.FOREGROUND;
                }
            }
        }
    },
    
    removeSmallIslands(labels, width, height) {
        const L = this.LABELS;
        const visited = new Int8Array(width * height);
        const minIslandSize = Math.max(50, Math.floor(width * height * 0.001));
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                
                const isFg = labels[idx] === L.FOREGROUND || labels[idx] === L.FG_SEED;
                const isBg = labels[idx] === L.BACKGROUND || labels[idx] === L.BG_SEED;
                
                if (visited[idx] === 0 && (isFg || isBg)) {
                    const queue = [{ x, y }];
                    visited[idx] = 1;
                    const component = [{ x, y, idx }];
                    
                    while (queue.length > 0) {
                        const current = queue.shift();
                        
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                if (Math.abs(dx) + Math.abs(dy) !== 1) continue;
                                const nx = current.x + dx;
                                const ny = current.y + dy;
                                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                    const nidx = ny * width + nx;
                                    
                                    const nIsFg = labels[nidx] === L.FOREGROUND || labels[nidx] === L.FG_SEED;
                                    const nIsBg = labels[nidx] === L.BACKGROUND || labels[nidx] === L.BG_SEED;
                                    
                                    if (visited[nidx] === 0 && 
                                        ((isFg && nIsFg) || (isBg && nIsBg))) {
                                        visited[nidx] = 1;
                                        queue.push({ x: nx, y: ny });
                                        component.push({ x: nx, y: ny, idx: nidx });
                                    }
                                }
                            }
                        }
                    }
                    
                    if (component.length < minIslandSize) {
                        for (const p of component) {
                            if (isFg) {
                                labels[p.idx] = L.BACKGROUND;
                            } else {
                                labels[p.idx] = L.FOREGROUND;
                            }
                        }
                    }
                }
            }
        }
    },
    
    createAlphaMaskFromLabels(labels, width, height) {
        const L = this.LABELS;
        const alphaMask = new Float32Array(width * height);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                const label = labels[idx];
                
                if (label === L.FOREGROUND || label === L.FG_SEED) {
                    alphaMask[idx] = 1.0;
                } else {
                    alphaMask[idx] = 0.0;
                }
            }
        }
        
        return alphaMask;
    },
    
    clusterColors(colors, k) {
        if (colors.length === 0) return [{ r: 255, g: 255, b: 255 }];
        
        const centroids = [];
        const step = Math.max(1, Math.floor(colors.length / k));
        for (let i = 0; i < k && i * step < colors.length; i++) {
            centroids.push({ ...colors[i * step] });
        }
        
        for (let iter = 0; iter < 10; iter++) {
            const clusters = Array.from({ length: centroids.length }, () => []);
            
            for (const color of colors) {
                let minDist = Infinity;
                let bestCluster = 0;
                for (let i = 0; i < centroids.length; i++) {
                    const dist = this.colorDistance(color, centroids[i]);
                    if (dist < minDist) {
                        minDist = dist;
                        bestCluster = i;
                    }
                }
                clusters[bestCluster].push(color);
            }
            
            for (let i = 0; i < centroids.length; i++) {
                if (clusters[i].length > 0) {
                    let sumR = 0, sumG = 0, sumB = 0;
                    for (const c of clusters[i]) {
                        sumR += c.r;
                        sumG += c.g;
                        sumB += c.b;
                    }
                    centroids[i] = {
                        r: sumR / clusters[i].length,
                        g: sumG / clusters[i].length,
                        b: sumB / clusters[i].length
                    };
                }
            }
        }
        
        return centroids;
    },
    
    skinLikelihood(r, g, b) {
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        const cr = r - y;
        const cb = b - y;
        
        const crInRange = cr >= 133 && cr <= 173;
        const cbInRange = cb >= 77 && cb <= 127;
        const yInRange = y >= 80 && y <= 220;
        
        if (crInRange && cbInRange && yInRange) {
            const crDist = Math.abs(cr - 153) / 20;
            const cbDist = Math.abs(cb - 102) / 25;
            return Math.max(0, 1 - (crDist + cbDist) / 4);
        }
        
        return 0;
    },
    
    colorDistance(c1, c2) {
        const rmean = (c1.r + c2.r) / 2;
        const r = c1.r - c2.r;
        const g = c1.g - c2.g;
        const b = c1.b - c2.b;
        
        return Math.sqrt(
            (2 + rmean / 256) * r * r +
            4 * g * g +
            (2 + (255 - rmean) / 256) * b * b
        );
    },
    
    applyEdgeBlending(alphaMask, width, height, blendRadius) {
        const temp = new Float32Array(alphaMask.length);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                const currentAlpha = alphaMask[idx];
                
                let hasDifferentNeighbor = false;
                for (let dy = -1; dy <= 1 && !hasDifferentNeighbor; dy++) {
                    for (let dx = -1; dx <= 1 && !hasDifferentNeighbor; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const neighborAlpha = alphaMask[ny * width + nx];
                            if (Math.abs(currentAlpha - neighborAlpha) > 0.3) {
                                hasDifferentNeighbor = true;
                            }
                        }
                    }
                }
                
                if (hasDifferentNeighbor) {
                    let sum = 0;
                    let weightSum = 0;
                    
                    for (let dy = -blendRadius; dy <= blendRadius; dy++) {
                        const ny = y + dy;
                        if (ny >= 0 && ny < height) {
                            for (let dx = -blendRadius; dx <= blendRadius; dx++) {
                                const nx = x + dx;
                                if (nx >= 0 && nx < width) {
                                    const dist = Math.sqrt(dx * dx + dy * dy);
                                    const weight = Math.max(0, 1 - dist / blendRadius);
                                    sum += alphaMask[ny * width + nx] * weight;
                                    weightSum += weight;
                                }
                            }
                        }
                    }
                    
                    temp[idx] = weightSum > 0 ? sum / weightSum : currentAlpha;
                } else {
                    temp[idx] = currentAlpha;
                }
            }
        }
        
        for (let i = 0; i < alphaMask.length; i++) {
            alphaMask[i] = temp[i];
        }
    },
    
    setBgColor(color) {
        if (!this.state.hasTransparency) return;
        
        this.state.backgroundColor = color;
        this.state.backgroundImage = null;
        
        document.querySelectorAll('.bg-color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === color);
        });
        
        this.render();
        this.saveState();
        this.showToast('背景已更换', 'success');
    },
    
    handleBgFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadBackgroundImage(file);
        }
        e.target.value = '';
    },
    
    loadBackgroundImage(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('请选择图片文件', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.state.backgroundImage = img;
                this.state.backgroundColor = null;
                
                document.querySelectorAll('.bg-color-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                this.render();
                this.saveState();
                this.showToast('背景图已更换', 'success');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },
    
    render() {
        if (!this.state.imageLoaded) return;
        
        const canvas = this.elements.mainCanvas;
        const ctx = this.elements.mainCtx;
        
        if (this.state.hasTransparency) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            if (this.state.backgroundColor) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                
                tempCtx.fillStyle = this.state.backgroundColor;
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                tempCtx.drawImage(canvas, 0, 0);
                
                ctx.drawImage(tempCanvas, 0, 0);
            } else if (this.state.backgroundImage) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                
                const img = this.state.backgroundImage;
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                const drawWidth = img.width * scale;
                const drawHeight = img.height * scale;
                const drawX = (canvas.width - drawWidth) / 2;
                const drawY = (canvas.height - drawHeight) / 2;
                
                tempCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                tempCtx.drawImage(canvas, 0, 0);
                
                ctx.drawImage(tempCanvas, 0, 0);
            }
        }
    },
    
    showDownloadModal() {
        if (!this.state.imageLoaded) return;
        
        const html = `
            <div class="download-modal">
                <h3>下载图片</h3>
                <div class="download-form">
                    <div class="form-group">
                        <label>格式</label>
                        <select id="downloadFormat">
                            <option value="png">PNG (保留透明)</option>
                            <option value="jpeg">JPEG</option>
                            <option value="webp">WebP</option>
                        </select>
                    </div>
                    <div class="form-group" id="qualityGroup">
                        <label>质量</label>
                        <div class="quality-row">
                            <input type="range" id="downloadQuality" min="10" max="100" value="90">
                            <span class="quality-value" id="qualityValue">90%</span>
                        </div>
                    </div>
                </div>
                <div class="download-actions">
                    <button id="cancelDownload" class="secondary-btn">取消</button>
                    <button id="confirmDownload" class="primary-btn">下载</button>
                </div>
            </div>
        `;
        
        this.elements.modalBody.innerHTML = html;
        this.elements.modal.style.display = 'flex';
        
        const formatSelect = document.getElementById('downloadFormat');
        const qualityGroup = document.getElementById('qualityGroup');
        const qualitySlider = document.getElementById('downloadQuality');
        const qualityValue = document.getElementById('qualityValue');
        
        formatSelect.addEventListener('change', (e) => {
            qualityGroup.style.display = e.target.value === 'png' ? 'none' : 'block';
        });
        
        qualitySlider.addEventListener('input', (e) => {
            qualityValue.textContent = e.target.value + '%';
        });
        
        document.getElementById('cancelDownload').addEventListener('click', () => {
            this.hideModal();
        });
        
        document.getElementById('confirmDownload').addEventListener('click', () => {
            const format = formatSelect.value;
            const quality = parseInt(qualitySlider.value) / 100;
            this.downloadImage(format, quality);
            this.hideModal();
        });
        
        this.elements.modal.querySelector('.modal-overlay').addEventListener('click', () => {
            this.hideModal();
        });
    },
    
    downloadImage(format, quality) {
        const canvas = this.elements.mainCanvas;
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 
                          format === 'webp' ? 'image/webp' : 'image/png';
        
        let dataUrl;
        if (format === 'png') {
            dataUrl = canvas.toDataURL('image/png');
        } else {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(canvas, 0, 0);
            
            dataUrl = tempCanvas.toDataURL(mimeType, quality);
        }
        
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        link.download = `image_processed_${timestamp}.${format}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('下载已开始', 'success');
    },
    
    showLoadingModal(title, message) {
        const html = `
            <div class="loading-modal">
                <div class="loading-spinner"></div>
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                </div>
            </div>
        `;
        
        this.elements.modalBody.innerHTML = html;
        this.elements.modal.style.display = 'flex';
    },
    
    updateProgress(percent) {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = percent + '%';
        }
    },
    
    hideModal() {
        this.elements.modal.style.display = 'none';
    },
    
    clearOverlay() {
        this.elements.overlayCtx.clearRect(
            0, 0, 
            this.elements.overlayCanvas.width, 
            this.elements.overlayCanvas.height
        );
    },
    
    showToast(message, type = 'success') {
        const icons = {
            success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>`,
            error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>`,
            warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>`,
        };
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            ${icons[type]}
            <span class="toast-message">${message}</span>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    },
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
