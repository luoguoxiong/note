import { ref } from 'vue'
import { AudioStatus } from '@order-public-sub-public/constants'

const showAudio = ref(false) //语音识别的面板
const audioTimer = ref<null | number>(null) //语音识别的到时柄
const audioCountdown = ref(60) //录音最大时间
const audioStatus = ref(AudioStatus.未开始)

export const useAudio = () => {
  const resetAudio = () => {
    audioCountdown.value = 60
    audioStatus.value = AudioStatus.未开始
    if (audioTimer.value) {
      clearInterval(audioTimer.value)
    }
  }
  const setAudioTimer = (timer: number) => {
    audioTimer.value = timer
  }
  const setShowAudio = (show: boolean) => {
    showAudio.value = show
  }
  const setAudioCountdown = (countdown: number) => {
    audioCountdown.value = countdown
  }
  const setAudioStatus = (status: AudioStatus) => {
    audioStatus.value = status
  }
  return {
    resetAudio,
    setAudioTimer,
    setShowAudio,
    setAudioCountdown,
    setAudioStatus,
    showAudio,
    audioTimer,
    audioCountdown,
    audioStatus,
  }
}
