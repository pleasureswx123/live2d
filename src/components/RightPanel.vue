<!--
  右侧面板组件 - 类似于Photoshop等专业编辑软件的右侧属性面板
  
  功能说明:
  - 模型状态信息
  - 性能监控信息
  - 音频控制
  - 高级设置
-->

<template>
  <div class="right-panel" :class="{ 'collapsed': !visible }">
    <!-- 面板头部 -->
    <div class="panel-header">
      <h3 class="panel-title">属性面板</h3>
      <button @click="$emit('toggle')" class="panel-toggle-btn" title="折叠面板">
        <span class="toggle-icon">{{ visible ? '▶' : '◀' }}</span>
      </button>
    </div>

    <!-- 面板内容 -->
    <div class="panel-content" v-show="visible">
      <!-- 模型信息区域 -->
      <div class="panel-section">
        <div class="section-header">
          <h4 class="section-title">模型信息</h4>
        </div>
        <div class="section-content">
          <div class="info-row">
            <span class="info-label">当前模型:</span>
            <span class="info-value" :class="{ 'loaded': isModelLoaded }">
              {{ currentModelDisplayName }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">动作数量:</span>
            <span class="info-value">{{ motionCount }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">表情数量:</span>
            <span class="info-value">{{ expressionCount }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">音频数量:</span>
            <span class="info-value">{{ audioCount }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">模型缩放:</span>
            <span class="info-value">{{ modelScale }}%</span>
          </div>
          <div class="info-row">
            <span class="info-label">模型位置:</span>
            <span class="info-value">{{ modelPosition }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">音频支持:</span>
            <span class="info-value" :class="{ 'enabled': hasAudioSupport, 'disabled': !hasAudioSupport }">
              {{ hasAudioSupport ? '✅ 支持' : '❌ 不支持' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 性能监控区域 -->
      <div class="panel-section" v-if="isDevelopmentMode">
        <div class="section-header">
          <h4 class="section-title">性能监控</h4>
        </div>
        <div class="section-content">
          <div class="info-row" v-if="performanceStats">
            <span class="info-label">FPS:</span>
            <span class="info-value" :class="getFpsClass(performanceStats.fps)">
              {{ performanceStats.fps }}
            </span>
          </div>
          <div class="info-row" v-if="performanceStats && performanceStats.memoryUsage">
            <span class="info-label">内存使用:</span>
            <span class="info-value">{{ performanceStats.memoryUsage }}MB</span>
          </div>
          <div class="info-row" v-if="performanceStats && performanceStats.drawCalls">
            <span class="info-label">绘制调用:</span>
            <span class="info-value">{{ performanceStats.drawCalls }}</span>
          </div>
          <div class="info-row" v-if="performanceStats && performanceStats.triangles">
            <span class="info-label">三角形数:</span>
            <span class="info-value">{{ performanceStats.triangles }}</span>
          </div>
        </div>
      </div>

      <!-- 音频控制区域 -->
      <div class="panel-section" v-if="hasAudioSupport">
        <div class="section-header">
          <h4 class="section-title">音频控制</h4>
        </div>
        <div class="section-content">
          <!-- 音量控制 -->
          <div class="control-group">
            <label class="control-label">音量: {{ Math.round(audioVolume * 100) }}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              :value="audioVolume"
              @input="$emit('volume-change', $event.target.value)"
              class="control-slider"
            />
          </div>

          <!-- 播放状态 -->
          <div class="info-row">
            <span class="info-label">播放状态:</span>
            <span class="info-value" :class="getAudioStatusClass()">
              {{ getAudioStatusText() }}
            </span>
          </div>

          <!-- 口型同步状态 -->
          <div class="info-row">
            <span class="info-label">口型同步:</span>
            <span class="info-value" :class="{ 'speaking': isSpeaking, 'idle': !isSpeaking }">
              {{ isSpeaking ? '🎙️ 进行中' : '⏸️ 待机' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 视图控制区域 -->
      <div class="panel-section">
        <div class="section-header">
          <h4 class="section-title">视图控制</h4>
        </div>
        <div class="section-content">
          <div class="button-group">
            <button @click="$emit('zoom-in')" class="panel-btn small">
              <span class="btn-icon">🔍+</span>
              <span class="btn-text">放大</span>
            </button>
            <button @click="$emit('zoom-out')" class="panel-btn small">
              <span class="btn-icon">🔍-</span>
              <span class="btn-text">缩小</span>
            </button>
          </div>
          <div class="button-group">
            <button @click="$emit('zoom-reset')" class="panel-btn small">
              <span class="btn-icon">⚪</span>
              <span class="btn-text">重置</span>
            </button>
            <button @click="$emit('center-model')" class="panel-btn small">
              <span class="btn-icon">🎯</span>
              <span class="btn-text">居中</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 快速操作区域 -->
      <div class="panel-section">
        <div class="section-header">
          <h4 class="section-title">快速操作</h4>
        </div>
        <div class="section-content">
          <div class="button-group vertical">
            <button 
              @click="$emit('random-motion')" 
              :disabled="!isModelLoaded"
              class="panel-btn"
            >
              <span class="btn-icon">🎬</span>
              <span class="btn-text">随机动作</span>
            </button>
            <button 
              @click="$emit('random-expression')" 
              :disabled="!isModelLoaded"
              class="panel-btn"
            >
              <span class="btn-icon">😊</span>
              <span class="btn-text">随机表情</span>
            </button>
            <button 
              @click="$emit('reset-expression')" 
              :disabled="!isModelLoaded"
              class="panel-btn"
            >
              <span class="btn-icon">🔄</span>
              <span class="btn-text">重置表情</span>
            </button>
            <button 
              @click="$emit('refit-model')" 
              :disabled="!isModelLoaded"
              class="panel-btn"
            >
              <span class="btn-icon">📐</span>
              <span class="btn-text">重新调整</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// === Props ===
const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  },
  currentModelName: {
    type: String,
    required: true
  },
  isModelLoaded: {
    type: Boolean,
    default: false
  },
  modelConfigs: {
    type: Object,
    default: () => ({})
  },
  modelScale: {
    type: Number,
    default: 1.0
  },
  modelPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  hasAudioSupport: {
    type: Boolean,
    default: false
  },
  isSpeaking: {
    type: Boolean,
    default: false
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  audioVolume: {
    type: Number,
    default: 1.0
  },
  performanceStats: {
    type: Object,
    default: null
  },
  isDevelopmentMode: {
    type: Boolean,
    default: false
  }
})

// === Events ===
const emit = defineEmits([
  'toggle',
  'volume-change',
  'zoom-in',
  'zoom-out',
  'zoom-reset',
  'center-model',
  'random-motion',
  'random-expression',
  'reset-expression',
  'refit-model'
])

// === 计算属性 ===

/**
 * 当前模型的显示名称
 */
const currentModelDisplayName = computed(() => {
  const config = props.modelConfigs[props.currentModelName]
  return config ? config.name : props.currentModelName
})

/**
 * 动作数量
 */
const motionCount = computed(() => {
  const config = props.modelConfigs[props.currentModelName]
  return config && config.motions ? config.motions.length : 0
})

/**
 * 表情数量
 */
const expressionCount = computed(() => {
  const config = props.modelConfigs[props.currentModelName]
  return config && config.expressions ? config.expressions.length : 0
})

/**
 * 音频数量
 */
const audioCount = computed(() => {
  const config = props.modelConfigs[props.currentModelName]
  return config && config.sounds ? config.sounds.length : 0
})

/**
 * 格式化的模型缩放百分比
 */
const modelScale = computed(() => {
  return Math.round(props.modelScale * 100)
})

/**
 * 格式化的模型位置
 */
const modelPosition = computed(() => {
  const x = Math.round(props.modelPosition.x || 0)
  const y = Math.round(props.modelPosition.y || 0)
  return `(${x}, ${y})`
})

// === 方法 ===

/**
 * 根据FPS值获取对应的CSS类
 */
function getFpsClass(fps) {
  if (fps >= 55) return 'fps-excellent'
  if (fps >= 45) return 'fps-good'
  if (fps >= 30) return 'fps-fair'
  return 'fps-poor'
}

/**
 * 获取音频状态CSS类
 */
function getAudioStatusClass() {
  if (props.isPlaying) return 'status-playing'
  if (props.isPaused) return 'status-paused'
  return 'status-stopped'
}

/**
 * 获取音频状态文本
 */
function getAudioStatusText() {
  if (props.isPlaying) return '🎵 播放中'
  if (props.isPaused) return '⏸️ 已暂停'
  return '⏹️ 已停止'
}
</script>

<style scoped>
.right-panel {
  width: 280px;
  min-width: 280px;
  background: #2d2d2d;
  border-left: 1px solid #404040;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;
}

.right-panel.collapsed {
  width: 40px;
  min-width: 40px;
}

/* 面板头部 */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #3a3a3a;
  border-bottom: 1px solid #404040;
  min-height: 48px;
}

.panel-title {
  margin: 0;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}

.panel-toggle-btn {
  background: transparent;
  border: none;
  color: #b0b0b0;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.panel-toggle-btn:hover {
  background: #404040;
  color: #ffffff;
}

.toggle-icon {
  font-size: 12px;
  display: block;
  transform: rotate(0deg);
  transition: transform 0.3s ease;
}

.collapsed .toggle-icon {
  transform: rotate(180deg);
}

/* 面板内容 */
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* 面板区域 */
.panel-section {
  border-bottom: 1px solid #404040;
}

.section-header {
  padding: 12px 16px 8px;
  background: #353535;
}

.section-title {
  margin: 0;
  color: #e0e0e0;
  font-size: 13px;
  font-weight: 600;
}

.section-content {
  padding: 12px 16px 16px;
}

/* 信息行 */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #b0b0b0;
  font-weight: 500;
}

.info-value {
  color: #ffffff;
  font-weight: 600;
  text-align: right;
}

/* 状态颜色 */
.info-value.loaded {
  color: #4ade80;
}

.info-value.enabled {
  color: #4ade80;
}

.info-value.disabled {
  color: #ef4444;
}

.info-value.speaking {
  color: #06b6d4;
}

.info-value.idle {
  color: #9ca3af;
}

.info-value.status-playing {
  color: #22c55e;
}

.info-value.status-paused {
  color: #f59e0b;
}

.info-value.status-stopped {
  color: #6b7280;
}

/* FPS状态颜色 */
.info-value.fps-excellent {
  color: #22c55e;
}

.info-value.fps-good {
  color: #84cc16;
}

.info-value.fps-fair {
  color: #eab308;
}

.info-value.fps-poor {
  color: #ef4444;
}

/* 控制组 */
.control-group {
  margin-bottom: 12px;
}

.control-label {
  display: block;
  color: #b0b0b0;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 6px;
}

.control-slider {
  width: 100%;
  height: 4px;
  background: #404040;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.control-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #0078d4;
  border-radius: 50%;
  cursor: pointer;
}

.control-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #0078d4;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

/* 按钮组 */
.button-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.button-group.vertical {
  flex-direction: column;
}

/* 面板按钮 */
.panel-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #404040;
  border: 1px solid #555555;
  border-radius: 4px;
  color: #e0e0e0;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
}

.panel-btn.small {
  padding: 6px 8px;
  font-size: 11px;
}

.panel-btn:hover {
  background: #4a4a4a;
  border-color: #666666;
}

.panel-btn:active {
  background: #353535;
}

.panel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #353535;
  border-color: #404040;
}

.btn-icon {
  font-size: 14px;
}

.btn-text {
  font-weight: 500;
}

/* 滚动条样式 */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #555555;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #666666;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .right-panel {
    width: 240px;
    min-width: 240px;
  }
  
  .right-panel.collapsed {
    width: 36px;
    min-width: 36px;
  }
}
</style>
