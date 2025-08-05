<!--
  状态栏组件 - 类似于Photoshop等图像编辑软件的底部状态栏
  
  功能说明:
  - 显示当前操作状态、工具信息、文件信息等实时状态信息
  - 固定在应用程序窗口的最底部
  - 水平条状布局，背景色与应用主题保持一致
  - 响应式地显示相关状态信息
-->

<template>
  <div class="status-bar">
    <div class="status-bar-content">
      <!-- 左侧状态信息 -->
      <div class="status-left">
        <!-- 当前模型 -->
        <div class="status-item">
          <span class="status-label">模型:</span>
          <span class="status-value" :class="{ 'loaded': isModelLoaded, 'loading': !isModelLoaded }">
            {{ currentModelDisplayName }}
          </span>
        </div>

        <!-- 动作数量 -->
        <div class="status-item">
          <span class="status-label">动作:</span>
          <span class="status-value">{{ motionCount }}</span>
        </div>

        <!-- 表情数量 -->
        <div class="status-item">
          <span class="status-label">表情:</span>
          <span class="status-value">{{ expressionCount }}</span>
        </div>

        <!-- 音频数量 -->
        <div class="status-item">
          <span class="status-label">音频:</span>
          <span class="status-value">{{ audioCount }}</span>
        </div>
      </div>

      <!-- 中间状态信息 -->
      <div class="status-center">
        <!-- 模型缩放 -->
        <div class="status-item">
          <span class="status-label">缩放:</span>
          <span class="status-value">{{ modelScale }}%</span>
        </div>

        <!-- 模型位置 -->
        <div class="status-item">
          <span class="status-label">位置:</span>
          <span class="status-value">{{ modelPosition }}</span>
        </div>
      </div>

      <!-- 右侧状态信息 -->
      <div class="status-right">
        <!-- 音频支持 -->
        <div class="status-item">
          <span class="status-label">音频支持:</span>
          <span class="status-value" :class="{ 'enabled': hasAudioSupport, 'disabled': !hasAudioSupport }">
            {{ hasAudioSupport ? '✅ 支持' : '❌ 不支持' }}
          </span>
        </div>

        <!-- 口型同步状态 -->
        <div class="status-item" v-if="hasAudioSupport">
          <span class="status-label">口型同步:</span>
          <span class="status-value" :class="{ 'speaking': isSpeaking, 'idle': !isSpeaking }">
            {{ isSpeaking ? '🎙️ 进行中' : '⏸️ 待机' }}
          </span>
        </div>

        <!-- 性能信息（开发模式） -->
        <div class="status-item" v-if="isDevelopmentMode && performanceStats">
          <span class="status-label">FPS:</span>
          <span class="status-value" :class="getFpsClass(performanceStats.fps)">
            {{ performanceStats.fps }}
          </span>
        </div>

        <!-- 内存使用（开发模式） -->
        <div class="status-item" v-if="isDevelopmentMode && performanceStats && performanceStats.memoryUsage">
          <span class="status-label">内存:</span>
          <span class="status-value">{{ performanceStats.memoryUsage }}MB</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// === Props ===
const props = defineProps({
  // 基本模型信息
  currentModelName: {
    type: String,
    default: 'idol'
  },
  isModelLoaded: {
    type: Boolean,
    default: false
  },
  modelConfigs: {
    type: Object,
    default: () => ({})
  },
  
  // 模型状态
  modelScale: {
    type: Number,
    default: 1.0
  },
  modelPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  
  // 音频相关
  hasAudioSupport: {
    type: Boolean,
    default: false
  },
  isSpeaking: {
    type: Boolean,
    default: false
  },
  
  // 性能监控
  performanceStats: {
    type: Object,
    default: null
  },
  isDevelopmentMode: {
    type: Boolean,
    default: false
  }
})

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
 * @param {number} fps - 帧率
 * @returns {string} CSS类名
 */
function getFpsClass(fps) {
  if (fps >= 55) return 'fps-excellent'
  if (fps >= 45) return 'fps-good'
  if (fps >= 30) return 'fps-fair'
  return 'fps-poor'
}
</script>

<style scoped>
.status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28px;
  background: linear-gradient(180deg, #2a2a2a 0%, #1e1e1e 100%);
  border-top: 1px solid #404040;
  z-index: 1000;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 12px;
  color: #e0e0e0;
  user-select: none;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
}

.status-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 12px;
  max-width: 100%;
  overflow: hidden;
}

.status-left,
.status-center,
.status-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.status-center {
  flex: 1;
  justify-content: center;
  min-width: 0;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  min-width: 0;
}

.status-label {
  color: #b0b0b0;
  font-weight: 500;
}

.status-value {
  color: #ffffff;
  font-weight: 600;
  transition: color 0.3s ease;
}

/* 状态指示颜色 */
.status-value.loaded {
  color: #4ade80;
}

.status-value.loading {
  color: #fbbf24;
  animation: pulse 1.5s ease-in-out infinite;
}

.status-value.enabled {
  color: #4ade80;
}

.status-value.disabled {
  color: #ef4444;
}

.status-value.speaking {
  color: #06b6d4;
  animation: pulse 1s ease-in-out infinite;
}

.status-value.idle {
  color: #9ca3af;
}

/* FPS状态颜色 */
.status-value.fps-excellent {
  color: #22c55e;
}

.status-value.fps-good {
  color: #84cc16;
}

.status-value.fps-fair {
  color: #eab308;
}

.status-value.fps-poor {
  color: #ef4444;
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-bar {
    font-size: 11px;
  }
  
  .status-bar-content {
    padding: 0 8px;
    gap: 8px;
  }
  
  .status-left,
  .status-center,
  .status-right {
    gap: 8px;
  }
  
  /* 在小屏幕上隐藏一些非关键信息 */
  .status-center {
    display: none;
  }
}

@media (max-width: 480px) {
  .status-bar {
    font-size: 10px;
  }
  
  .status-bar-content {
    padding: 0 6px;
    gap: 6px;
  }
  
  .status-left,
  .status-right {
    gap: 6px;
  }
  
  /* 在更小的屏幕上只显示最关键的信息 */
  .status-right .status-item:not(:first-child) {
    display: none;
  }
}

/* 桌面模型模式样式调整 */
.desktop-pet-mode .status-bar {
  background: rgba(30, 30, 30, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(64, 64, 64, 0.8);
}
</style>
