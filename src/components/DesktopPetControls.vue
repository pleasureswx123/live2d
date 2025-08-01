<!--
  桌面宠物控制组件 - 使用 Iconify 图标系统

  功能说明:
  - 提供隐藏式的控制界面，使用精美的 Iconify 图标
  - 支持悬浮图标、右键菜单等交互方式
  - 集成所有现有的Live2D功能
  - 适配桌面宠物的使用场景
  - 统一的视觉风格和更好的用户体验
-->

<template>
  <div class="desktop-pet-controls">
    <!-- 悬浮控制按钮 -->
    <div
      class="floating-controls"
      :class="{ 'visible': showControls, 'expanded': showControls }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- 主控制按钮 -->
      <div class="main-control-btn no-drag" @click="toggleMainPanel">
        <Icon
          :icon="showMainPanel ? settingsFilled : settingsRegular"
          class="icon"
          :class="{ 'rotating': showMainPanel }"
        />
        <span class="tooltip">设置</span>
      </div>

      <!-- 快速控制按钮组 -->
      <div
        class="quick-controls no-drag"
        v-show="showControls"
        @mouseenter="handleMouseEnter"
      >
        <button
          class="control-btn no-drag"
          @click="toggleExpressionsPanel"
          title="表情控制"
        >
          <Icon class="icon" :icon="emojiRegular" />
        </button>
        <button
          class="control-btn no-drag"
          @click="toggleMotionsPanel"
          title="动作控制"
        >
          <Icon :icon="playRegular" />
        </button>
        <button
          class="control-btn no-drag"
          @click="toggleAudioPanel"
          title="音频控制"
        >
          <Icon :icon="speakerRegular" />
        </button>
        <button
          class="control-btn no-drag"
          @click="toggleLipSyncPanel"
          title="口型同步"
        >
          <Icon :icon="micRegular" />
        </button>
        <button
          class="control-btn no-drag"
          @click="toggleAlwaysOnTop"
          :class="{ 'active': isAlwaysOnTop }"
          title="始终置顶"
        >
          <Icon :icon="isAlwaysOnTop ? pinFilled : pinRegular" />
        </button>
        <button
          class="control-btn no-drag"
          @click="minimizeToTray"
          title="最小化到托盘"
        >
          <Icon :icon="minimizeRegular" />
        </button>
      </div>
    </div>

    <!-- 主设置面板 -->
    <div
      class="main-panel"
      v-show="showMainPanel"
      :style="panelStyle"
    >
      <div class="panel-header">
        <h3>🐾 桌面宠物设置</h3>
        <button class="close-btn" @click="showMainPanel = false">❌</button>
      </div>
      
      <div class="panel-content">
        <!-- 模型选择 -->
        <div class="setting-group">
          <label>模型选择:</label>
          <select v-model="selectedModel" @change="handleModelChange">
            <option value="idol">偶像</option>
            <option value="lanhei">蓝黑</option>
            <option value="hibiki">Hibiki</option>
            <option value="hiyori">Hiyori</option>
            <option value="mark">Mark</option>
            <option value="natori">Natori</option>
            <option value="kei_basic">Kei Basic</option>
            <option value="kei_vowels">Kei Vowels Pro</option>
            <option value="youyou">悠悠</option>
          </select>
        </div>

        <!-- 模型缩放 -->
        <div class="setting-group">
          <label>模型大小: {{ modelScale }}%</label>
          <input
            type="range"
            min="50"
            max="200"
            step="10"
            v-model="modelScale"
            @input="$emit('scale-change', modelScale / 100)"
          >
        </div>

        <!-- 透明度控制 -->
        <div class="setting-group">
          <label>透明度: {{ opacity }}%</label>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            v-model="opacity"
            @input="updateOpacity"
          >
        </div>

        <!-- 位置锁定 -->
        <div class="setting-group">
          <label>
            <input
              type="checkbox"
              v-model="isPositionLocked"
              @change="togglePositionLock"
            >
            锁定位置
          </label>
        </div>

        <!-- 模型调整 -->
        <div class="setting-group">
          <button @click="refitModel" class="refit-btn">
            🔄 重新调整模型大小
          </button>
        </div>

        <!-- 状态信息 -->
        <div class="setting-group">
          <button @click="toggleStatusPanel" class="status-btn">
            📊 状态信息
          </button>
        </div>

        <!-- 帮助信息 -->
        <div class="setting-group">
          <button @click="toggleHelpPanel" class="help-btn">
            ❓ 帮助
          </button>
        </div>
      </div>
    </div>

    <!-- 表情控制面板 -->
    <div
      class="expressions-panel panel"
      v-show="showExpressionsPanel"
      :style="panelStyle"
    >
      <div class="panel-header">
        <h3>🎭 表情控制</h3>
        <button class="close-btn" @click="showExpressionsPanel = false">❌</button>
      </div>
      <div class="panel-content">
        <slot name="expressions-content"></slot>
      </div>
    </div>

    <!-- 动作控制面板 -->
    <div
      class="motions-panel panel"
      v-show="showMotionsPanel"
      :style="panelStyle"
    >
      <div class="panel-header">
        <h3>🎬 动作控制</h3>
        <button class="close-btn" @click="showMotionsPanel = false">❌</button>
      </div>
      <div class="panel-content">
        <slot name="motions-content"></slot>
      </div>
    </div>

    <!-- 音频控制面板 -->
    <div
      class="audio-panel panel"
      v-show="showAudioPanel"
      :style="panelStyle"
    >
      <div class="panel-header">
        <h3>🔊 音频控制</h3>
        <button class="close-btn" @click="showAudioPanel = false">❌</button>
      </div>
      <div class="panel-content">
        <slot name="audio-content"></slot>
      </div>
    </div>

    <!-- 口型同步面板 -->
    <div
      class="lipsync-panel panel"
      v-show="showLipSyncPanel"
      :style="panelStyle"
    >
      <div class="panel-header">
        <h3>🗣️ 口型同步</h3>
        <button class="close-btn" @click="showLipSyncPanel = false">❌</button>
      </div>
      <div class="panel-content">
        <slot name="lipsync-content"></slot>
      </div>
    </div>

    <!-- 状态信息面板 -->
    <div
      v-if="showStatusPanel"
      class="status-panel panel"
      :style="panelStyle"
    >
      <div class="panel-header">
        <h4>📊 状态信息</h4>
        <button @click="showStatusPanel = false" class="close-btn">×</button>
      </div>
      <div class="panel-content">
        <slot name="status-content">
          <div class="status-info">
            <div class="status-item">
              <span class="label">当前模型:</span>
              <span class="value">{{ selectedModel }}</span>
            </div>
            <div class="status-item">
              <span class="label">模型状态:</span>
              <span class="value" :class="{ 'loaded': isModelLoaded, 'loading': !isModelLoaded }">
                {{ isModelLoaded ? '✅ 已加载' : '⏳ 加载中' }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">缩放比例:</span>
              <span class="value">{{ modelScale }}%</span>
            </div>
            <div class="status-item">
              <span class="label">透明度:</span>
              <span class="value">{{ opacity }}%</span>
            </div>
            <div class="status-item">
              <span class="label">位置锁定:</span>
              <span class="value">{{ isPositionLocked ? '🔒 已锁定' : '🔓 未锁定' }}</span>
            </div>
            <div class="status-item">
              <span class="label">始终置顶:</span>
              <span class="value">{{ isAlwaysOnTop ? '📌 已启用' : '📌 已禁用' }}</span>
            </div>
          </div>
        </slot>
      </div>
    </div>

    <!-- 帮助信息面板 -->
    <div
      v-if="showHelpPanel"
      class="help-panel panel"
      :style="panelStyle"
    >
      <div class="panel-header">
        <h4>❓ 帮助信息</h4>
        <button @click="showHelpPanel = false" class="close-btn">×</button>
      </div>
      <div class="panel-content">
        <div class="help-content">
          <h5>🎮 控制说明</h5>
          <ul>
            <li><strong>鼠标悬停</strong>：显示控制按钮</li>
            <li><strong>右键点击</strong>：显示快捷菜单</li>
            <li><strong>拖拽</strong>：移动桌面宠物位置</li>
          </ul>

          <h5>⌨️ 快捷键</h5>
          <ul>
            <li><strong>Ctrl/Cmd + T</strong>：切换置顶状态</li>
            <li><strong>Ctrl/Cmd + L</strong>：切换位置锁定</li>
            <li><strong>ESC</strong>：隐藏所有面板</li>
          </ul>

          <h5>🎭 功能说明</h5>
          <ul>
            <li><strong>表情控制</strong>：播放和管理模型表情</li>
            <li><strong>动作控制</strong>：播放和管理模型动作</li>
            <li><strong>音频控制</strong>：播放音频文件</li>
            <li><strong>口型同步</strong>：实时口型同步功能</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div
      class="context-menu no-drag"
      v-show="showContextMenu"
      :style="contextMenuStyle"
      @click.stop
    >
      <div class="menu-item no-drag" @click="toggleExpressionsPanel">🎭 表情控制</div>
      <div class="menu-item no-drag" @click="toggleMotionsPanel">🎬 动作控制</div>
      <div class="menu-item no-drag" @click="toggleAudioPanel">🔊 音频控制</div>
      <div class="menu-item no-drag" @click="toggleLipSyncPanel">🗣️ 口型同步</div>
      <div class="menu-separator"></div>
      <div class="menu-item no-drag" @click="toggleAlwaysOnTop">
        📌 始终置顶 {{ isAlwaysOnTop ? '✓' : '' }}
      </div>
      <div class="menu-item no-drag" @click="togglePositionLock">
        🔒 锁定位置 {{ isPositionLocked ? '✓' : '' }}
      </div>
      <div class="menu-separator"></div>
      <div class="menu-item" @click="resetPosition">🏠 重置位置</div>
      <div class="menu-item" @click="minimizeToTray">➖ 最小化</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'

// 导入离线图标
import settingsRegular from '@iconify-icons/fluent/settings-24-regular'
import settingsFilled from '@iconify-icons/fluent/settings-24-filled'
import emojiRegular from '@iconify-icons/fluent/emoji-24-regular'
import playRegular from '@iconify-icons/fluent/play-24-regular'
import speakerRegular from '@iconify-icons/fluent/speaker-2-24-regular'
import micRegular from '@iconify-icons/fluent/mic-24-regular'
import pinRegular from '@iconify-icons/fluent/pin-24-regular'
import pinFilled from '@iconify-icons/fluent/pin-24-filled'
import minimizeRegular from '@iconify-icons/fluent/minimize-24-regular'

// === Props 和 Emits ===
const props = defineProps({
  selectedModel: {
    type: String,
    default: 'idol'
  },
  isModelLoaded: {
    type: Boolean,
    default: false
  }
})

// 调试：检查图标是否正确导入
console.log('🎨 图标导入检查:', {
  settingsRegular: !!settingsRegular,
  emojiRegular: !!emojiRegular,
  playRegular: !!playRegular,
  speakerRegular: !!speakerRegular,
  micRegular: !!micRegular,
  pinRegular: !!pinRegular,
  minimizeRegular: !!minimizeRegular
})

const emit = defineEmits([
  'model-change',
  'scale-change',
  'opacity-change',
  'position-lock-change',
  'always-on-top-change',
  'refit-model'
])

// === 响应式数据 ===
const showControls = ref(false)
const showMainPanel = ref(false)
const showExpressionsPanel = ref(false)
const showMotionsPanel = ref(false)
const showAudioPanel = ref(false)
const showLipSyncPanel = ref(false)
const showStatusPanel = ref(false)
const showHelpPanel = ref(false)
const showContextMenu = ref(false)

const selectedModel = ref(props.selectedModel)

// 监听props变化，同步更新本地状态
watch(() => props.selectedModel, (newValue) => {
  selectedModel.value = newValue
})
const modelScale = ref(100)
const opacity = ref(100)
const isAlwaysOnTop = ref(true)
const isPositionLocked = ref(false)

const contextMenuPosition = ref({ x: 0, y: 0 })
const controlsHideTimer = ref(null)
const isMouseOverControls = ref(false)

// === 计算属性 ===
const panelStyle = computed(() => ({
  position: 'fixed',
  top: '50px',
  right: '10px',
  zIndex: 1000
}))

const contextMenuStyle = computed(() => ({
  position: 'fixed',
  left: `${contextMenuPosition.value.x}px`,
  top: `${contextMenuPosition.value.y}px`,
  zIndex: 1001
}))

// === 方法 ===

/**
 * 切换主面板显示
 */
function toggleMainPanel() {
  showMainPanel.value = !showMainPanel.value
  hideOtherPanels('main')
}

/**
 * 切换表情面板
 */
function toggleExpressionsPanel() {
  showExpressionsPanel.value = !showExpressionsPanel.value
  hideOtherPanels('expressions')
  hideContextMenu()
}

/**
 * 切换动作面板
 */
function toggleMotionsPanel() {
  showMotionsPanel.value = !showMotionsPanel.value
  hideOtherPanels('motions')
  hideContextMenu()
}

/**
 * 切换音频面板
 */
function toggleAudioPanel() {
  showAudioPanel.value = !showAudioPanel.value
  hideOtherPanels('audio')
  hideContextMenu()
}

/**
 * 切换口型同步面板
 */
function toggleLipSyncPanel() {
  showLipSyncPanel.value = !showLipSyncPanel.value
  hideOtherPanels('lipsync')
  hideContextMenu()
}

/**
 * 切换状态信息面板
 */
function toggleStatusPanel() {
  showStatusPanel.value = !showStatusPanel.value
  hideOtherPanels('status')
  hideContextMenu()
}

/**
 * 切换帮助信息面板
 */
function toggleHelpPanel() {
  showHelpPanel.value = !showHelpPanel.value
  hideOtherPanels('help')
  hideContextMenu()
}

/**
 * 隐藏其他面板
 */
function hideOtherPanels(except) {
  if (except !== 'main') showMainPanel.value = false
  if (except !== 'expressions') showExpressionsPanel.value = false
  if (except !== 'motions') showMotionsPanel.value = false
  if (except !== 'audio') showAudioPanel.value = false
  if (except !== 'lipsync') showLipSyncPanel.value = false
  if (except !== 'status') showStatusPanel.value = false
  if (except !== 'help') showHelpPanel.value = false
}

/**
 * 处理鼠标进入控制区域
 */
function handleMouseEnter() {
  isMouseOverControls.value = true

  // 清除隐藏计时器
  if (controlsHideTimer.value) {
    clearTimeout(controlsHideTimer.value)
    controlsHideTimer.value = null
  }

  // 显示控制按钮
  showControls.value = true
}

/**
 * 处理鼠标离开控制区域
 */
function handleMouseLeave(event) {
  isMouseOverControls.value = false

  // 检查鼠标是否移动到子元素
  const relatedTarget = event.relatedTarget
  const currentTarget = event.currentTarget

  // 如果鼠标移动到当前元素的子元素，不隐藏控制面板
  if (relatedTarget && currentTarget && currentTarget.contains(relatedTarget)) {
    return
  }

  // 清除之前的计时器（如果存在）
  if (controlsHideTimer.value) {
    clearTimeout(controlsHideTimer.value)
  }

  // 使用较短的延迟，但检查鼠标状态
  controlsHideTimer.value = setTimeout(() => {
    // 再次检查鼠标是否还在控制区域内
    if (!isMouseOverControls.value) {
      showControls.value = false
    }
    controlsHideTimer.value = null
  }, 300) // 300ms延迟，更快响应
}

/**
 * 处理模型切换
 */
function handleModelChange() {
  console.log('桌面宠物控制：模型切换到', selectedModel.value)
  emit('model-change', selectedModel.value)
}

/**
 * 重新调整模型大小
 */
function refitModel() {
  console.log('桌面宠物控制：重新调整模型大小')
  emit('refit-model')
}

/**
 * 更新透明度
 */
function updateOpacity() {
  document.body.style.opacity = opacity.value / 100
  emit('opacity-change', opacity.value / 100)
}

/**
 * 切换始终置顶
 */
async function toggleAlwaysOnTop() {
  if (window.desktopPet) {
    try {
      const newState = await window.desktopPet.toggleAlwaysOnTop()
      isAlwaysOnTop.value = newState
      emit('always-on-top-change', newState)
    } catch (error) {
      console.error('切换置顶状态失败:', error)
    }
  }
  hideContextMenu()
}

/**
 * 切换位置锁定
 */
function togglePositionLock() {
  isPositionLocked.value = !isPositionLocked.value
  
  if (window.desktopPet) {
    if (isPositionLocked.value) {
      window.desktopPet.disableWindowDrag()
    } else {
      window.desktopPet.enableWindowDrag()
    }
  }
  
  emit('position-lock-change', isPositionLocked.value)
  hideContextMenu()
}

/**
 * 重置位置
 */
function resetPosition() {
  if (window.desktopPet) {
    try {
      window.desktopPet.resetPosition()
      showNotification('位置已重置')
    } catch (error) {
      console.error('重置位置失败:', error)
      showNotification('重置位置失败', 'error')
    }
  } else {
    console.log('重置位置到默认位置')
  }
  hideContextMenu()
}

/**
 * 最小化到托盘
 */
function minimizeToTray() {
  if (window.desktopPet) {
    try {
      // 隐藏窗口（Electron 会自动处理托盘显示）
      window.close()
      showNotification('已最小化到托盘')
    } catch (error) {
      console.error('最小化失败:', error)
      showNotification('最小化失败', 'error')
    }
  } else {
    // 在模拟器模式下，隐藏窗口
    document.body.style.display = 'none'
    showNotification('模拟器模式：窗口已隐藏')
  }
  hideContextMenu()
}

/**
 * 显示右键菜单
 */
function showContextMenuAt(x, y) {
  contextMenuPosition.value = { x, y }
  showContextMenu.value = true
}

/**
 * 隐藏右键菜单
 */
function hideContextMenu() {
  showContextMenu.value = false
}

/**
 * 显示通知消息
 */
function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`)

  // 可以在这里添加更复杂的通知系统
  if (window.desktopPet && typeof window.desktopPet.showNotification === 'function') {
    window.desktopPet.showNotification(message, type)
  } else {
    // 简单的浏览器通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Live2D 桌面宠物', {
        body: message,
        icon: '/favicon.ico'
      })
    }
  }
}

/**
 * 处理右键点击
 */
function handleContextMenu(event) {
  event.preventDefault()
  showContextMenuAt(event.clientX, event.clientY)
}

/**
 * 处理点击其他区域隐藏菜单
 */
function handleClickOutside() {
  hideContextMenu()
}

// === 生命周期 ===
onMounted(() => {
  // 启用窗口拖拽
  if (window.desktopPet) {
    window.desktopPet.enableWindowDrag()
    
    // 监听位置锁定状态变化
    window.desktopPet.onPositionLockChanged((locked) => {
      isPositionLocked.value = locked
    })
  }
  
  // 添加右键菜单监听
  document.addEventListener('contextmenu', handleContextMenu)
  document.addEventListener('click', handleClickOutside)
  
  // 设置初始透明度
  updateOpacity()
})

onUnmounted(() => {
  // 清理事件监听
  document.removeEventListener('contextmenu', handleContextMenu)
  document.removeEventListener('click', handleClickOutside)
  
  if (controlsHideTimer.value) {
    clearTimeout(controlsHideTimer.value)
  }
})

// 暴露方法给父组件
defineExpose({
  showContextMenuAt,
  hideContextMenu,
  toggleMainPanel
})
</script>

<style scoped>
/* === 桌面宠物控制样式 === */

.desktop-pet-controls {
  position: relative;
  pointer-events: none; /* 默认不阻止鼠标事件 */
}

/* 禁用拖拽区域 */
.no-drag {
  -webkit-app-region: no-drag;
  app-region: no-drag;
}

/* === 悬浮控制按钮 === */
.floating-controls {
  position: fixed;
  bottom: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  pointer-events: auto;
  z-index: 999;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.floating-controls:hover {
  opacity: 1;
}

.floating-controls.visible .quick-controls {
  animation: slideIn 0.3s ease;
}

.main-control-btn {
  position: relative;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.main-control-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.main-control-btn .icon {
  font-size: 18px;
}

.main-control-btn .tooltip {
  position: absolute;
  right: 50px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.main-control-btn:hover .tooltip {
  opacity: 1;
}

.quick-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-btn {
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.control-btn.active {
  background: rgba(52, 152, 219, 0.8);
  border-color: rgba(52, 152, 219, 1);
}

/* === 面板通用样式 === */
.panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 280px;
  max-width: 400px;
  max-height: 500px;
  overflow: hidden;
  pointer-events: auto;
  animation: panelSlideIn 0.3s ease;
}

.main-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 300px;
  max-width: 400px;
  max-height: 600px;
  overflow: hidden;
  pointer-events: auto;
  animation: panelSlideIn 0.3s ease;
}

.panel-header {
  background: rgba(0, 0, 0, 0.1);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 0, 0, 0.1);
}

.panel-content {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

/* === 设置组样式 === */
.setting-group {
  margin-bottom: 16px;
}

.setting-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.setting-group select,
.setting-group input[type="range"] {
  width: 100%;
  padding: 6px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
}

.setting-group input[type="checkbox"] {
  margin-right: 8px;
}

/* === 右键菜单样式 === */
.context-menu {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 180px;
  overflow: hidden;
  pointer-events: auto;
  animation: contextMenuSlideIn 0.2s ease;
}

.menu-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-item:hover {
  background: rgba(0, 0, 0, 0.1);
}

.menu-separator {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 4px 0;
}

/* === 动画效果 === */
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

@keyframes panelSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes contextMenuSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* === 响应式设计 === */
@media (max-width: 480px) {
  .panel,
  .main-panel {
    min-width: 250px;
    max-width: 90vw;
  }

  .floating-controls {
    bottom: 20px;
    right: 20px;
  }
}

/* === 滚动条样式 === */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

/* === 新增按钮样式 === */
.refit-btn,
.status-btn,
.help-btn {
  width: 100%;
  padding: 6px 8px;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.refit-btn {
  background-color: #17a2b8;
}

.refit-btn:hover {
  background-color: #138496;
}

.status-btn {
  background-color: #6f42c1;
}

.status-btn:hover {
  background-color: #5a32a3;
}

.help-btn {
  background-color: #fd7e14;
}

.help-btn:hover {
  background-color: #e8650e;
}

.refit-btn:hover,
.status-btn:hover,
.help-btn:hover {
  transform: translateY(-1px);
}

/* === 状态信息面板样式 === */
.status-info {
  font-size: 11px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #eee;
}

.status-item:last-child {
  border-bottom: none;
}

.status-item .label {
  font-weight: 500;
  color: #666;
}

.status-item .value {
  color: #333;
}

.status-item .value.loaded {
  color: #28a745;
}

.status-item .value.loading {
  color: #ffc107;
}

/* === 帮助信息面板样式 === */
.help-content {
  font-size: 11px;
  line-height: 1.4;
}

.help-content h5 {
  margin: 8px 0 4px 0;
  color: #333;
  font-size: 12px;
}

.help-content ul {
  margin: 0 0 8px 0;
  padding-left: 16px;
}

.help-content li {
  margin-bottom: 2px;
}

.help-content strong {
  color: #007bff;
}

/* === Iconify 图标样式增强 === */

/* 主控制按钮图标动画 */
.main-control-btn .icon {
  transition: transform 0.3s ease;
  font-size: 18px;
}

.main-control-btn .icon.rotating {
  transform: rotate(90deg);
}

/* 控制按钮图标样式 */
.control-btn svg {
  width: 18px !important;
  height: 18px !important;
  transition: all 0.2s ease;
  display: block;
  color: #ffffff !important;
  fill: currentColor;
}

/* 主控制按钮图标样式 */
.main-control-btn svg {
  width: 20px !important;
  height: 20px !important;
  display: block;
  color: #ffffff !important;
  fill: currentColor;
}

.control-btn:hover svg {
  transform: scale(1.1);
  color: #007bff !important;
}

.control-btn.active svg {
  color: #007bff !important;
}

.main-control-btn:hover svg {
  color: #007bff !important;
}

/* 悬浮控制面板展开动画 */
.floating-controls {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.floating-controls.expanded {
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 12px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transform: scale(1.02);
}

/* 按钮悬停效果增强 */
.control-btn {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.control-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
  z-index: 0;
}

.control-btn:hover::before {
  width: 100%;
  height: 100%;
}

.control-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 快速控制按钮组动画 */
.quick-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  /* 确保鼠标事件正常工作 */
  pointer-events: auto;
}

.quick-controls .control-btn {
  opacity: 0;
  transform: translateX(-10px);
  animation: slideInLeft 0.3s ease forwards;
}

.quick-controls .control-btn:nth-child(1) { animation-delay: 0.1s; }
.quick-controls .control-btn:nth-child(2) { animation-delay: 0.15s; }
.quick-controls .control-btn:nth-child(3) { animation-delay: 0.2s; }
.quick-controls .control-btn:nth-child(4) { animation-delay: 0.25s; }
.quick-controls .control-btn:nth-child(5) { animation-delay: 0.3s; }
.quick-controls .control-btn:nth-child(6) { animation-delay: 0.35s; }

@keyframes slideInLeft {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 图标颜色主题 */
.control-btn svg {
  color: #6c757d;
}

.control-btn:hover svg,
.control-btn.active svg {
  color: #007bff;
}

/* 特殊状态图标颜色 */
.control-btn[title="始终置顶"].active svg {
  color: #28a745;
}

.control-btn[title="音频控制"]:hover svg {
  color: #17a2b8;
}

.control-btn[title="表情控制"]:hover svg {
  color: #ffc107;
}

.control-btn[title="动作控制"]:hover svg {
  color: #fd7e14;
}

.control-btn[title="口型同步"]:hover svg {
  color: #e83e8c;
}
</style>
