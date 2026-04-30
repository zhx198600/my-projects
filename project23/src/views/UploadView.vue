<script setup>
import { ref, nextTick, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useSound } from '../composables/useSound'

const router = useRouter()

const uploadedImage = ref(null)
provide('uploadedImage', uploadedImage)
const { playClick, playSuccess, playError } = useSound()

const selectedImage = ref(null)
const originalImage = ref(null)
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')
const showCropper = ref(false)
const cropCanvas = ref(null)
const imageInfo = ref({ size: 0, compressed: false })

const cropState = ref({
  startX: 0,
  startY: 0,
  x: 50,
  y: 50,
  width: 200,
  height: 200,
  isDragging: false,
  isResizing: false
})

const MAX_FILE_SIZE = 2 * 1024 * 1024

const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve) => {
    if (file.size <= MAX_FILE_SIZE) {
      resolve({ file, compressed: false })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve({ file: compressedFile, compressed: true })
        }, 'image/jpeg', quality)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

const correctImageOrientation = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const view = new DataView(e.target.result)
      if (view.getUint16(0, false) !== 0xFFD8) {
        resolve(file)
        return
      }
      
      let offset = 2
      let orientation = 1
      
      while (offset < view.byteLength) {
        const marker = view.getUint16(offset, false)
        offset += 2
        
        if (marker === 0xFFE1) {
          if (view.getUint32(offset + 2, false) !== 0x45786966) {
            break
          }
          
          const little = view.getUint16(offset + 8, false) === 0x4949
          offset += 10
          
          const tags = view.getUint16(offset, little)
          offset += 2
          
          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + (i * 12), little) === 0x0112) {
              orientation = view.getUint16(offset + (i * 12) + 8, little)
              break
            }
          }
          break
        } else if ((marker & 0xFF00) !== 0xFF00) {
          break
        } else {
          offset += view.getUint16(offset, false)
        }
      }
      
      if (orientation === 1) {
        resolve(file)
        return
      }
      
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (orientation > 4) {
          canvas.width = img.height
          canvas.height = img.width
        } else {
          canvas.width = img.width
          canvas.height = img.height
        }
        
        switch (orientation) {
          case 2: ctx.transform(-1, 0, 0, 1, img.width, 0); break
          case 3: ctx.transform(-1, 0, 0, -1, img.width, img.height); break
          case 4: ctx.transform(1, 0, 0, -1, 0, img.height); break
          case 5: ctx.transform(0, 1, 1, 0, 0, 0); break
          case 6: ctx.transform(0, 1, -1, 0, img.height, 0); break
          case 7: ctx.transform(0, -1, -1, 0, img.height, img.width); break
          case 8: ctx.transform(0, -1, 1, 0, 0, img.width); break
        }
        
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: file.type }))
        }, file.type, 0.95)
      }
      img.src = URL.createObjectURL(file)
    }
    reader.readAsArrayBuffer(file)
  })
}

const processFile = async (file) => {
  if (!file || !file.type.startsWith('image/')) {
    showError('请选择有效的图片文件')
    return
  }

  errorMessage.value = ''
  
  try {
    const orientedFile = await correctImageOrientation(file)
    const { file: compressedFile, compressed } = await compressImage(orientedFile)
    
    imageInfo.value = {
      size: (compressedFile.size / 1024).toFixed(2),
      compressed
    }
    
    const reader = new FileReader()
    reader.onload = (event) => {
      originalImage.value = event.target.result
      selectedImage.value = event.target.result
    }
    reader.readAsDataURL(compressedFile)
  } catch (error) {
    showError('图片处理失败，请重试')
  }
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    processFile(file)
  }
  e.target.value = ''
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

const openCropper = async () => {
  showCropper.value = true
  await nextTick()
  initCropArea()
}

const initCropArea = () => {
  const canvas = cropCanvas.value
  if (!canvas) return
  
  const img = new Image()
  img.onload = () => {
    canvas.width = Math.min(img.width, 600)
    canvas.height = (img.height * canvas.width) / img.width
    
    cropState.value.width = Math.min(200, canvas.width * 0.6)
    cropState.value.height = Math.min(200, canvas.height * 0.6)
    cropState.value.x = (canvas.width - cropState.value.width) / 2
    cropState.value.y = (canvas.height - cropState.value.height) / 2
    
    drawCropCanvas()
  }
  img.src = originalImage.value
}

const drawCropCanvas = () => {
  const canvas = cropCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.clearRect(
      cropState.value.x,
      cropState.value.y,
      cropState.value.width,
      cropState.value.height
    )
    
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.strokeRect(
      cropState.value.x,
      cropState.value.y,
      cropState.value.width,
      cropState.value.height
    )
    
    const cornerSize = 10
    ctx.fillStyle = '#fff'
    const corners = [
      [cropState.value.x, cropState.value.y],
      [cropState.value.x + cropState.value.width - cornerSize, cropState.value.y],
      [cropState.value.x, cropState.value.y + cropState.value.height - cornerSize],
      [cropState.value.x + cropState.value.width - cornerSize, cropState.value.y + cropState.value.height - cornerSize]
    ]
    corners.forEach(([x, y]) => {
      ctx.fillRect(x, y, cornerSize, cornerSize)
    })
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.beginPath()
    ctx.moveTo(cropState.value.x + cropState.value.width / 3, cropState.value.y)
    ctx.lineTo(cropState.value.x + cropState.value.width / 3, cropState.value.y + cropState.value.height)
    ctx.moveTo(cropState.value.x + cropState.value.width * 2 / 3, cropState.value.y)
    ctx.lineTo(cropState.value.x + cropState.value.width * 2 / 3, cropState.value.y + cropState.value.height)
    ctx.moveTo(cropState.value.x, cropState.value.y + cropState.value.height / 3)
    ctx.lineTo(cropState.value.x + cropState.value.width, cropState.value.y + cropState.value.height / 3)
    ctx.moveTo(cropState.value.x, cropState.value.y + cropState.value.height * 2 / 3)
    ctx.lineTo(cropState.value.x + cropState.value.width, cropState.value.y + cropState.value.height * 2 / 3)
    ctx.stroke()
  }
  img.src = originalImage.value
}

const getCanvasCoords = (e) => {
  const canvas = cropCanvas.value
  const rect = canvas.getBoundingClientRect()
  const touch = e.touches ? e.touches[0] : e
  return {
    x: (touch.clientX - rect.left) * (canvas.width / rect.width),
    y: (touch.clientY - rect.top) * (canvas.height / rect.height)
  }
}

const isOnCorner = (x, y) => {
  const cornerSize = 20
  const corners = [
    [cropState.value.x + cropState.value.width, cropState.value.y + cropState.value.height]
  ]
  return corners.some(([cx, cy]) => 
    Math.abs(x - cx) < cornerSize && Math.abs(y - cy) < cornerSize
  )
}

const isInCropArea = (x, y) => {
  return x >= cropState.value.x && x <= cropState.value.x + cropState.value.width &&
         y >= cropState.value.y && y <= cropState.value.y + cropState.value.height
}

const onCropMouseDown = (e) => {
  e.preventDefault()
  const { x, y } = getCanvasCoords(e)
  
  if (isOnCorner(x, y)) {
    cropState.value.isResizing = true
  } else if (isInCropArea(x, y)) {
    cropState.value.isDragging = true
    cropState.value.startX = x - cropState.value.x
    cropState.value.startY = y - cropState.value.y
  }
}

const onCropMouseMove = (e) => {
  if (!cropState.value.isDragging && !cropState.value.isResizing) return
  
  e.preventDefault()
  const { x, y } = getCanvasCoords(e)
  const canvas = cropCanvas.value
  
  if (cropState.value.isDragging) {
    cropState.value.x = Math.max(0, Math.min(canvas.width - cropState.value.width, x - cropState.value.startX))
    cropState.value.y = Math.max(0, Math.min(canvas.height - cropState.value.height, y - cropState.value.startY))
  } else if (cropState.value.isResizing) {
    cropState.value.width = Math.max(50, Math.min(canvas.width - cropState.value.x, x - cropState.value.x))
    cropState.value.height = Math.max(50, Math.min(canvas.height - cropState.value.y, y - cropState.value.y))
  }
  
  drawCropCanvas()
}

const onCropMouseUp = () => {
  cropState.value.isDragging = false
  cropState.value.isResizing = false
}

const applyCrop = () => {
  playClick()
  const canvas = cropCanvas.value
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')
  
  const img = new Image()
  img.onload = () => {
    const scaleX = img.width / canvas.width
    const scaleY = img.height / canvas.height
    
    tempCanvas.width = cropState.value.width * scaleX
    tempCanvas.height = cropState.value.height * scaleY
    
    tempCtx.drawImage(
      img,
      cropState.value.x * scaleX,
      cropState.value.y * scaleY,
      cropState.value.width * scaleX,
      cropState.value.height * scaleY,
      0,
      0,
      tempCanvas.width,
      tempCanvas.height
    )
    
    selectedImage.value = tempCanvas.toDataURL('image/jpeg', 0.9)
    showCropper.value = false
  }
  img.src = originalImage.value
}

const cancelCrop = () => {
  playClick()
  showCropper.value = false
}

const simulateUpload = () => {
  isUploading.value = true
  uploadProgress.value = 0
  
  const interval = setInterval(() => {
    uploadProgress.value += Math.random() * 20
    if (uploadProgress.value >= 100) {
      uploadProgress.value = 100
      clearInterval(interval)
      setTimeout(() => {
        playSuccess()
        isUploading.value = false
        uploadedImage.value = selectedImage.value
        router.push('/question-select')
      }, 500)
    }
  }, 200)
}

const handleUpload = () => {
  if (!selectedImage.value) {
    showError('请先选择图片')
    return
  }
  playClick()
  simulateUpload()
}

const showError = (msg) => {
  playError()
  errorMessage.value = msg
  setTimeout(() => {
    errorMessage.value = ''
  }, 3000)
}

const clearImage = () => {
  playClick()
  selectedImage.value = null
  originalImage.value = null
  imageInfo.value = { size: 0, compressed: false }
  errorMessage.value = ''
}
</script>

<template>
  <div class="p-4 sm:p-5 md:p-6 lg:p-8 max-w-2xl mx-auto">
    <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-6">上传题目照片</h2>

    <div v-if="errorMessage" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
      <span class="mr-2">⚠️</span>
      {{ errorMessage }}
    </div>

    <div
      class="border-2 border-dashed rounded-xl p-8 text-center transition-colors"
      :class="[
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
        selectedImage ? 'p-4' : ''
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop="handleDrop"
    >
      <div v-if="selectedImage && !showCropper" class="relative">
        <img :src="selectedImage" alt="预览" class="max-h-72 mx-auto rounded-lg shadow-md" />
        <button
          @click="clearImage"
          class="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
        >
          ✕
        </button>
        
        <div class="mt-3 text-xs text-gray-500">
          文件大小: {{ imageInfo.size }} KB
          <span v-if="imageInfo.compressed" class="text-green-600 ml-2">(已压缩)</span>
        </div>
        
        <button
          @click="openCropper"
          class="mt-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          ✂️ 裁剪图片
        </button>
      </div>

      <div v-if="showCropper" class="overflow-auto">
        <p class="text-sm text-gray-600 mb-3">拖动选框选择裁剪区域，拖动右下角调整大小</p>
        <canvas
          ref="cropCanvas"
          class="mx-auto rounded-lg cursor-crosshair touch-none"
          @mousedown="onCropMouseDown"
          @mousemove="onCropMouseMove"
          @mouseup="onCropMouseUp"
          @mouseleave="onCropMouseUp"
          @touchstart="onCropMouseDown"
          @touchmove="onCropMouseMove"
          @touchend="onCropMouseUp"
        ></canvas>
        <div class="mt-4 space-x-3">
          <button
            @click="applyCrop"
            class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            ✓ 确认裁剪
          </button>
          <button
            @click="cancelCrop"
            class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            取消
          </button>
        </div>
      </div>

      <div v-if="!selectedImage" class="space-y-4">
        <div class="text-5xl sm:text-6xl mb-4">📸</div>
        <p class="text-gray-600 text-sm sm:text-base md:text-lg">拖拽图片到这里，或选择以下方式</p>
        
        <div class="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          <label class="inline-flex items-center justify-center bg-blue-500 text-white px-5 py-3 rounded-xl cursor-pointer hover:bg-blue-600 transition-colors shadow-md">
            <span class="mr-2">📷</span>
            拍照
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              class="hidden" 
              @change="handleFileSelect"
            />
          </label>
          
          <label class="inline-flex items-center justify-center bg-green-500 text-white px-5 py-3 rounded-xl cursor-pointer hover:bg-green-600 transition-colors shadow-md">
            <span class="mr-2">🖼️</span>
            相册选择
            <input 
              type="file" 
              accept="image/*" 
              class="hidden" 
              @change="handleFileSelect"
            />
          </label>
        </div>
      </div>
    </div>

    <div v-if="isUploading" class="mt-6">
      <div class="flex justify-between text-sm text-gray-600 mb-2">
        <span>正在上传...</span>
        <span>{{ Math.min(100, Math.round(uploadProgress)) }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          class="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
          :style="{ width: Math.min(100, uploadProgress) + '%' }"
        ></div>
      </div>
    </div>

    <button
      v-if="selectedImage && !isUploading && !showCropper"
      @click="handleUpload"
      class="w-full mt-6 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors text-sm sm:text-base md:text-lg shadow-md"
    >
      开始识别
    </button>

    <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
      <h3 class="font-semibold text-yellow-800 mb-2 text-sm sm:text-base">💡 拍照提示</h3>
      <ul class="text-xs sm:text-sm text-yellow-700 space-y-1">
        <li>• 保持题目清晰、光线充足</li>
        <li>• 尽量拍摄单道题目</li>
        <li>• 支持手写和印刷体</li>
        <li>• 大于2MB的图片将自动压缩</li>
      </ul>
    </div>
  </div>
</template>
