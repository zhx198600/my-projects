import { ref, onMounted } from 'vue'

const soundEnabled = ref(true)
let audioContext = null
let unlocked = false

const initAudioContext = () => {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    audioContext = new AudioContextClass()
  }
  return audioContext
}

const unlockAudio = () => {
  if (unlocked) return
  
  const ctx = initAudioContext()
  
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  
  const buffer = ctx.createBuffer(1, 1, 22050)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start(0)
  
  unlocked = true
  document.removeEventListener('click', unlockAudio, true)
  document.removeEventListener('touchend', unlockAudio, true)
}

const playTone = (frequency, duration, type = 'sine', volume = 0.3) => {
  if (!soundEnabled.value) return
  
  try {
    const ctx = initAudioContext()
    
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.type = type
    oscillator.frequency.value = frequency
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch (e) {
    console.warn('Audio playback failed:', e)
  }
}

export const useSound = () => {
  onMounted(() => {
    document.addEventListener('click', unlockAudio, true)
    document.addEventListener('touchend', unlockAudio, true)
  })
  
  const playClick = () => {
    playTone(800, 0.08, 'sine', 0.2)
  }
  
  const playSuccess = () => {
    playTone(523.25, 0.1, 'sine', 0.25)
    setTimeout(() => playTone(659.25, 0.1, 'sine', 0.25), 100)
    setTimeout(() => playTone(783.99, 0.15, 'sine', 0.25), 200)
  }
  
  const playComplete = () => {
    const notes = [523.25, 587.33, 659.25, 783.99, 1046.50]
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.3), i * 120)
    })
  }
  
  const playNext = () => {
    playTone(600, 0.06, 'sine', 0.15)
    setTimeout(() => playTone(900, 0.08, 'sine', 0.15), 80)
  }
  
  const playError = () => {
    playTone(200, 0.15, 'sawtooth', 0.2)
  }
  
  const toggleSound = () => {
    soundEnabled.value = !soundEnabled.value
    if (soundEnabled.value) {
      playClick()
    }
  }
  
  return {
    soundEnabled,
    toggleSound,
    playClick,
    playSuccess,
    playComplete,
    playNext,
    playError,
    unlockAudio
  }
}
