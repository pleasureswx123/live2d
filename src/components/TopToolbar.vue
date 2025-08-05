<!--
  顶部工具栏组件 - 类似于Photoshop等专业编辑软件的顶部工具栏
  
  功能说明:
  - 模型选择下拉框
  - 主要操作按钮（播放动作、表情等）
  - 面板切换按钮
  - 应用标题和图标
-->

<template>
  <div class="top-toolbar">
    <!-- 左侧：应用标题和主要控制 -->
    <div class="toolbar-left">
      <!-- 应用标题 -->
      <div class="app-title">
        <div class="app-icon">🎭</div>
        <span class="title-text">Live2D Studio</span>
      </div>

      <!-- 分隔线 -->
      <div class="toolbar-separator"></div>

      <!-- 模型选择 -->
      <div class="toolbar-group">
        <label class="toolbar-label">模型:</label>
        <select
          :value="currentModelName"
          @change="$emit('change-model', $event.target.value)"
          class="toolbar-select"
          :disabled="!isModelLoaded"
        >
          <option value="idol">{{ modelConfigs.idol?.name || '偶像' }}</option>
          <option value="lanhei">{{ modelConfigs.lanhei?.name || '蓝黑' }}</option>
          <option value="hibiki">{{ modelConfigs.hibiki?.name || 'Hibiki' }}</option>
          <option value="hiyori">{{ modelConfigs.hiyori?.name || 'Hiyori' }}</option>
          <option value="mark">{{ modelConfigs.mark?.name || 'Mark' }}</option>
          <option value="natori">{{ modelConfigs.natori?.name || 'Natori' }}</option>
          <option value="kei_basic">{{ modelConfigs.kei_basic?.name || 'Kei Basic' }}</option>
          <option value="kei_vowels">{{ modelConfigs.kei_vowels?.name || 'Kei Vowels Pro' }}</option>
          <option value="youyou">{{ modelConfigs.youyou?.name || '悠悠' }}</option>
        </select>
        <div class="model-status-indicator" :class="{ 'loaded': isModelLoaded, 'loading': !isModelLoaded }">
          <span v-if="isModelLoaded">✓</span>
          <span v-else class="loading-spinner">⟳</span>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="toolbar-separator"></div>

      <!-- 快速操作按钮 -->
      <div class="toolbar-group">
        <button
          @click="$emit('random-motion')"
          :disabled="!isModelLoaded"
          class="toolbar-btn"
          title="随机动作"
        >
          <span class="btn-icon">🎬</span>
          <span class="btn-text">动作</span>
        </button>
        
        <button
          @click="$emit('random-expression')"
          :disabled="!isModelLoaded"
          class="toolbar-btn"
          title="随机表情"
        >
          <span class="btn-icon">😊</span>
          <span class="btn-text">表情</span>
        </button>

        <button
          @click="$emit('toggle-speaking')"
          :disabled="!isModelLoaded"
          class="toolbar-btn"
          :class="{ 'active': isSpeaking }"
          title="口型同步测试"
        >
          <span class="btn-icon">{{ isSpeaking ? '🎙️' : '🗣️' }}</span>
          <span class="btn-text">{{ isSpeaking ? '停止' : '说话' }}</span>
        </button>

        <button
          @click="$emit('refit-model')"
          :disabled="!isModelLoaded"
          class="toolbar-btn"
          title="重新调整模型大小"
        >
          <span class="btn-icon">🔄</span>
          <span class="btn-text">调整</span>
        </button>
      </div>
    </div>

    <!-- 中央：工作区控制 -->
    <div class="toolbar-center">
      <!-- 视图控制 -->
      <div class="toolbar-group">
        <button
          @click="$emit('zoom-in')"
          class="toolbar-btn icon-only"
          title="放大"
        >
          <span class="btn-icon">🔍+</span>
        </button>
        
        <button
          @click="$emit('zoom-reset')"
          class="toolbar-btn icon-only"
          title="重置缩放"
        >
          <span class="btn-icon">⚪</span>
        </button>
        
        <button
          @click="$emit('zoom-out')"
          class="toolbar-btn icon-only"
          title="缩小"
        >
          <span class="btn-icon">🔍-</span>
        </button>
      </div>
    </div>

    <!-- 右侧：面板切换和设置 -->
    <div class="toolbar-right">
      <!-- 面板切换按钮 -->
      <div class="toolbar-group">
        <button
          @click="$emit('toggle-left-panel')"
          class="toolbar-btn icon-only"
          :class="{ 'active': showLeftPanel }"
          title="切换左侧面板"
        >
          <span class="btn-icon">📋</span>
        </button>
        
        <button
          @click="$emit('toggle-right-panel')"
          class="toolbar-btn icon-only"
          :class="{ 'active': showRightPanel }"
          title="切换右侧面板"
        >
          <span class="btn-icon">📊</span>
        </button>
      </div>

      <!-- 分隔线 -->
      <div class="toolbar-separator"></div>

      <!-- 设置和帮助 -->
      <div class="toolbar-group">
        <button
          @click="$emit('toggle-performance')"
          class="toolbar-btn icon-only"
          :class="{ 'active': showPerformance }"
          title="性能监控"
        >
          <span class="btn-icon">📈</span>
        </button>
        
        <button
          @click="$emit('show-help')"
          class="toolbar-btn icon-only"
          title="帮助"
        >
          <span class="btn-icon">❓</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// === Props ===
const props = defineProps({
  currentModelName: {
    type: String,
    required: true
  },
  isModelLoaded: {
    type: Boolean,
    default: false
  },
  isSpeaking: {
    type: Boolean,
    default: false
  },
  modelConfigs: {
    type: Object,
    default: () => ({})
  },
  showLeftPanel: {
    type: Boolean,
    default: true
  },
  showRightPanel: {
    type: Boolean,
    default: true
  },
  showPerformance: {
    type: Boolean,
    default: false
  }
})

// === Events ===
const emit = defineEmits([
  'change-model',
  'random-motion',
  'random-expression',
  'toggle-speaking',
  'refit-model',
  'zoom-in',
  'zoom-out',
  'zoom-reset',
  'toggle-left-panel',
  'toggle-right-panel',
  'toggle-performance',
  'show-help'
])
</script>

<style scoped>
.top-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  background: linear-gradient(180deg, #3a3a3a 0%, #2d2d2d 100%);
  border-bottom: 1px solid #1a1a1a;
  padding: 0 16px;
  color: #e0e0e0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 13px;
  user-select: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-left {
  flex: 1;
  justify-content: flex-start;
}

.toolbar-center {
  flex: 0;
  justify-content: center;
}

.toolbar-right {
  flex: 1;
  justify-content: flex-end;
}

/* 应用标题 */
.app-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
}

.app-icon {
  font-size: 20px;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

/* 工具栏组 */
.toolbar-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 工具栏标签 */
.toolbar-label {
  color: #b0b0b0;
  font-size: 12px;
  font-weight: 500;
  margin-right: 4px;
}

/* 工具栏选择框 */
.toolbar-select {
  background: #404040;
  border: 1px solid #555555;
  border-radius: 4px;
  color: #ffffff;
  padding: 4px 8px;
  font-size: 12px;
  min-width: 120px;
  transition: all 0.2s ease;
}

.toolbar-select:hover {
  border-color: #666666;
  background: #454545;
}

.toolbar-select:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.3);
}

.toolbar-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 模型状态指示器 */
.model-status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 12px;
  transition: all 0.3s ease;
}

.model-status-indicator.loaded {
  background: #22c55e;
  color: #ffffff;
}

.model-status-indicator.loading {
  background: #f59e0b;
  color: #ffffff;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 工具栏按钮 */
.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #e0e0e0;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.toolbar-btn.icon-only {
  padding: 6px 8px;
}

.toolbar-btn:hover {
  background: #404040;
  border-color: #555555;
}

.toolbar-btn:active {
  background: #353535;
}

.toolbar-btn.active {
  background: #0078d4;
  border-color: #106ebe;
  color: #ffffff;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: transparent;
  border-color: transparent;
}

.btn-icon {
  font-size: 14px;
}

.btn-text {
  font-size: 11px;
  font-weight: 500;
}

/* 分隔线 */
.toolbar-separator {
  width: 1px;
  height: 24px;
  background: #555555;
  margin: 0 8px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .toolbar-left .btn-text,
  .toolbar-center .btn-text,
  .toolbar-right .btn-text {
    display: none;
  }
  
  .toolbar-btn {
    padding: 6px 8px;
  }
}

@media (max-width: 768px) {
  .top-toolbar {
    padding: 0 8px;
    gap: 4px;
  }
  
  .toolbar-group {
    gap: 4px;
  }
  
  .toolbar-separator {
    margin: 0 4px;
  }
  
  .app-title .title-text {
    display: none;
  }
}
</style>
