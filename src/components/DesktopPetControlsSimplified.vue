<!--
  简化的桌面模型控制组件
  
  功能说明:
  - 大部分控制功能已迁移到主进程的托盘菜单
  - 此组件仅保留必要的状态显示和基本交互
  - 主要通过托盘菜单进行控制
-->

<template>
  <div class="desktop-pet-controls-simplified">
    <!-- 状态指示器 -->
    <div class="status-indicator" v-if="showStatus">
      <div class="status-item">
        <span class="label">模型:</span>
        <span class="value">{{ currentModelName }}</span>
      </div>
      <div class="status-item">
        <span class="label">状态:</span>
        <span class="value" :class="{ 'loaded': isModelLoaded, 'loading': !isModelLoaded }">
          {{ isModelLoaded ? '✅ 已加载' : '⏳ 加载中' }}
        </span>
      </div>
      <div class="status-item" v-if="isSpeaking">
        <span class="label">口型同步:</span>
        <span class="value speaking">🎙️ 正在说话</span>
      </div>
    </div>

    <!-- 快速操作按钮（可选） -->
    <div class="quick-actions" v-if="showQuickActions">
      <button
        class="quick-btn"
        @click="toggleStatus"
        title="显示/隐藏状态"
      >
        📊
      </button>
      <button
        class="quick-btn"
        @click="openTrayMenu"
        title="右键托盘图标查看更多选项"
      >
        ⚙️
      </button>
    </div>

    <!-- 提示信息 -->
    <div class="hint" v-if="showHint">
      <p>💡 右键点击系统托盘图标可以访问完整的控制菜单</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// === Props ===
const props = defineProps({
  currentModelName: {
    type: String,
    default: 'idol'
  },
  isModelLoaded: {
    type: Boolean,
    default: false
  },
  isSpeaking: {
    type: Boolean,
    default: false
  }
})

// === 响应式数据 ===
const showStatus = ref(true)
const showQuickActions = ref(true)
const showHint = ref(true)

// === 方法 ===

/**
 * 切换状态显示
 */
function toggleStatus() {
  showStatus.value = !showStatus.value
}

/**
 * 提示用户打开托盘菜单
 */
function openTrayMenu() {
  if (window.desktopPet) {
    window.desktopPet.showNotification(
      '桌面模型控制',
      '请右键点击系统托盘中的桌面模型图标来访问完整的控制菜单'
    )
  } else {
    alert('请右键点击系统托盘中的桌面模型图标来访问完整的控制菜单')
  }
}

/**
 * 自动隐藏提示
 */
function autoHideHint() {
  setTimeout(() => {
    showHint.value = false
  }, 10000) // 10秒后自动隐藏提示
}

// === 生命周期 ===
onMounted(() => {
  console.log('简化的桌面模型控制组件已挂载')
  
  // 自动隐藏提示
  autoHideHint()
  
  // 监听双击事件来切换状态显示
  document.addEventListener('dblclick', toggleStatus)
})

onUnmounted(() => {
  document.removeEventListener('dblclick', toggleStatus)
})

// 暴露方法给父组件
defineExpose({
  toggleStatus,
  openTrayMenu
})
</script>

<style scoped>
.desktop-pet-controls-simplified {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 999;
  pointer-events: none;
}

.status-indicator {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
  backdrop-filter: blur(10px);
  pointer-events: auto;
  margin-bottom: 8px;
  min-width: 120px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.label {
  opacity: 0.8;
}

.value {
  font-weight: bold;
}

.value.loaded {
  color: #4CAF50;
}

.value.loading {
  color: #FF9800;
}

.value.speaking {
  color: #2196F3;
  animation: pulse 1.5s infinite;
}

.quick-actions {
  display: flex;
  gap: 4px;
  pointer-events: auto;
  margin-bottom: 8px;
}

.quick-btn {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.quick-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.hint {
  background: rgba(33, 150, 243, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.3;
  max-width: 200px;
  pointer-events: auto;
  backdrop-filter: blur(10px);
  animation: slideIn 0.3s ease;
}

.hint p {
  margin: 0;
}

/* 动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .desktop-pet-controls-simplified {
    top: 5px;
    right: 5px;
  }
  
  .status-indicator,
  .hint {
    font-size: 10px;
    padding: 6px 8px;
  }
  
  .quick-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

/* 禁用拖拽 */
.desktop-pet-controls-simplified * {
  -webkit-app-region: no-drag;
  app-region: no-drag;
}
</style>
