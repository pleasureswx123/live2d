<!--
  高级设置面板组件
  提供详细的个性化配置选项
-->

<template>
  <div class="advanced-settings" v-if="visible">
    <div class="settings-overlay" @click="$emit('close')"></div>
    <div class="settings-panel">
      <!-- 标题栏 -->
      <div class="panel-header">
        <h3>🔧 高级设置</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>

      <!-- 设置内容 -->
      <div class="panel-content">
        <!-- 主题设置 -->
        <div class="setting-section">
          <h4>🎨 主题外观</h4>
          <div class="setting-item">
            <label>主题选择:</label>
            <select v-model="settings.theme" @change="onThemeChange">
              <option value="auto">🔄 跟随系统</option>
              <option value="light">☀️ 明亮主题</option>
              <option value="dark">🌙 深色主题</option>
              <option value="neon">⚡ 霓虹主题</option>
              <option value="sakura">🌸 樱花主题</option>
            </select>
          </div>
          <div class="setting-item">
            <label>界面透明度:</label>
            <input 
              type="range" 
              min="0.3" 
              max="1" 
              step="0.1" 
              v-model="settings.uiOpacity"
              @input="onUIOpacityChange"
            >
            <span class="value">{{ Math.round(settings.uiOpacity * 100) }}%</span>
          </div>
        </div>

        <!-- 性能设置 -->
        <div class="setting-section">
          <h4>⚡ 性能优化</h4>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                v-model="settings.enableVSync"
                @change="onVSyncChange"
              >
              启用垂直同步 (VSync)
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                v-model="settings.enableGPUAcceleration"
                @change="onGPUAccelerationChange"
              >
              启用GPU硬件加速
            </label>
          </div>
          <div class="setting-item">
            <label>目标帧率:</label>
            <select v-model="settings.targetFPS" @change="onFPSChange">
              <option value="30">30 FPS (省电)</option>
              <option value="60">60 FPS (平衡)</option>
              <option value="120">120 FPS (高性能)</option>
              <option value="144">144 FPS (极致)</option>
            </select>
          </div>
        </div>

        <!-- 行为设置 -->
        <div class="setting-section">
          <h4>🎭 行为设置</h4>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                v-model="settings.autoPlayMotions"
                @change="onAutoPlayChange"
              >
              自动播放随机动作
            </label>
          </div>
          <div class="setting-item" v-if="settings.autoPlayMotions">
            <label>动作间隔:</label>
            <input 
              type="range" 
              min="5" 
              max="60" 
              v-model="settings.motionInterval"
              @input="onMotionIntervalChange"
            >
            <span class="value">{{ settings.motionInterval }}秒</span>
          </div>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                v-model="settings.enableInteraction"
                @change="onInteractionChange"
              >
              启用鼠标交互
            </label>
          </div>
        </div>

        <!-- 音频设置 -->
        <div class="setting-section">
          <h4>🔊 音频设置</h4>
          <div class="setting-item">
            <label>主音量:</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              v-model="settings.masterVolume"
              @input="onVolumeChange"
            >
            <span class="value">{{ Math.round(settings.masterVolume * 100) }}%</span>
          </div>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                v-model="settings.enableSpatialAudio"
                @change="onSpatialAudioChange"
              >
              启用空间音频
            </label>
          </div>
        </div>

        <!-- 高级选项 -->
        <div class="setting-section">
          <h4>🔬 高级选项</h4>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                v-model="settings.enableDebugMode"
                @change="onDebugModeChange"
              >
              启用调试模式
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                v-model="settings.enablePerformanceMonitor"
                @change="onPerformanceMonitorChange"
              >
              显示性能监控
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                v-model="settings.enableAutoUpdate"
                @change="onAutoUpdateChange"
              >
              自动检查更新
            </label>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="panel-footer">
        <button @click="resetToDefaults" class="btn btn-secondary">
          🔄 恢复默认
        </button>
        <button @click="exportSettings" class="btn btn-info">
          📤 导出设置
        </button>
        <button @click="importSettings" class="btn btn-warning">
          📥 导入设置
        </button>
        <button @click="$emit('close')" class="btn btn-primary">
          ✅ 完成
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { themeManager } from '../utils/themeManager.js'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'settingsChanged'])

// 设置数据
const settings = reactive({
  // 主题设置
  theme: 'auto',
  uiOpacity: 0.9,
  
  // 性能设置
  enableVSync: true,
  enableGPUAcceleration: true,
  targetFPS: 60,
  
  // 行为设置
  autoPlayMotions: false,
  motionInterval: 15,
  enableInteraction: true,
  
  // 音频设置
  masterVolume: 0.7,
  enableSpatialAudio: false,
  
  // 高级选项
  enableDebugMode: false,
  enablePerformanceMonitor: false,
  enableAutoUpdate: true
})

// 加载设置
function loadSettings() {
  const saved = localStorage.getItem('desktop-pet-advanced-settings')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      Object.assign(settings, parsed)
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }
}

// 保存设置
function saveSettings() {
  localStorage.setItem('desktop-pet-advanced-settings', JSON.stringify(settings))
  emit('settingsChanged', { ...settings })
}

// 事件处理函数
function onThemeChange() {
  themeManager.setTheme(settings.theme)
  saveSettings()
}

function onUIOpacityChange() {
  document.documentElement.style.setProperty('--ui-opacity', settings.uiOpacity)
  saveSettings()
}

function onVSyncChange() {
  // 这里可以添加VSync控制逻辑
  saveSettings()
}

function onGPUAccelerationChange() {
  // 这里可以添加GPU加速控制逻辑
  saveSettings()
}

function onFPSChange() {
  // 这里可以添加FPS控制逻辑
  saveSettings()
}

function onAutoPlayChange() {
  saveSettings()
}

function onMotionIntervalChange() {
  saveSettings()
}

function onInteractionChange() {
  saveSettings()
}

function onVolumeChange() {
  saveSettings()
}

function onSpatialAudioChange() {
  saveSettings()
}

function onDebugModeChange() {
  saveSettings()
}

function onPerformanceMonitorChange() {
  saveSettings()
}

function onAutoUpdateChange() {
  saveSettings()
}

// 重置为默认设置
function resetToDefaults() {
  if (confirm('确定要恢复所有设置为默认值吗？')) {
    Object.assign(settings, {
      theme: 'auto',
      uiOpacity: 0.9,
      enableVSync: true,
      enableGPUAcceleration: true,
      targetFPS: 60,
      autoPlayMotions: false,
      motionInterval: 15,
      enableInteraction: true,
      masterVolume: 0.7,
      enableSpatialAudio: false,
      enableDebugMode: false,
      enablePerformanceMonitor: false,
      enableAutoUpdate: true
    })
    saveSettings()
  }
}

// 导出设置
function exportSettings() {
  const dataStr = JSON.stringify(settings, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'live2d-pet-settings.json'
  link.click()
  URL.revokeObjectURL(url)
}

// 导入设置
function importSettings() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result)
          Object.assign(settings, imported)
          saveSettings()
          alert('设置导入成功！')
        } catch (error) {
          alert('设置文件格式错误！')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
/* 设置面板样式将在下一个文件中添加 */
</style>
