/**
 * Live2D 桌面模型 - Electron 预加载脚本
 *
 * 功能说明:
 * - 在渲染进程中安全地暴露 Electron API
 * - 提供主进程与渲染进程之间的通信桥梁
 * - 实现桌面模型特有的功能接口
 */

const { contextBridge, ipcRenderer } = require('electron')

/**
 * 桌面模型 API
 * 通过 contextBridge 安全地暴露给渲染进程
 */
const desktopPetAPI = {
  // === 窗口控制 API ===

  /**
   * 获取窗口配置
   * @returns {Promise<Object>} 窗口配置对象
   */
  getWindowConfig: () => ipcRenderer.invoke('get-window-config'),

  /**
   * 保存窗口配置
   * @param {Object} config - 配置对象
   * @returns {Promise<boolean>} 保存是否成功
   */
  saveWindowConfig: (config) => ipcRenderer.invoke('save-window-config', config),

  /**
   * 切换始终置顶状态
   * @returns {Promise<boolean>} 新的置顶状态
   */
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),

  // === 新增的模型控制 API ===

  /**
   * 获取应用状态
   * @returns {Promise<Object>} 应用状态对象
   */
  getAppState: () => ipcRenderer.invoke('get-app-state'),

  /**
   * 获取模型配置
   * @returns {Promise<Object>} 模型配置对象
   */
  getModelConfigs: () => ipcRenderer.invoke('get-model-configs'),

  /**
   * 通知模型加载完成
   * @param {string} modelName - 模型名称
   * @returns {Promise<boolean>} 是否成功
   */
  notifyModelLoaded: (modelName) => ipcRenderer.invoke('model-loaded', modelName),

  /**
   * 通知口型同步状态变化
   * @param {boolean} isSpeaking - 是否正在说话
   * @returns {Promise<boolean>} 是否成功
   */
  notifySpeakingStateChanged: (isSpeaking) => ipcRenderer.invoke('speaking-state-changed', isSpeaking),

  /**
   * 通知表情播放完成
   * @param {string} expressionFile - 表情文件名
   * @returns {Promise<boolean>} 是否成功
   */
  notifyExpressionPlayed: (expressionFile) => ipcRenderer.invoke('expression-played', expressionFile),

  /**
   * 通知动作播放完成
   * @param {string} motionFile - 动作文件名
   * @returns {Promise<boolean>} 是否成功
   */
  notifyMotionPlayed: (motionFile) => ipcRenderer.invoke('motion-played', motionFile),

  /**
   * 通知模型缩放变化
   * @param {number} scale - 缩放比例
   * @returns {Promise<boolean>} 是否成功
   */
  notifyModelScaleChanged: (scale) => ipcRenderer.invoke('model-scale-changed', scale),

  /**
   * 通知透明度变化
   * @param {number} opacity - 透明度
   * @returns {Promise<boolean>} 是否成功
   */
  notifyOpacityChanged: (opacity) => ipcRenderer.invoke('opacity-changed', opacity),

  /**
   * 通知位置锁定状态变化
   * @param {boolean} isLocked - 是否锁定
   * @returns {Promise<boolean>} 是否成功
   */
  notifyPositionLockChanged: (isLocked) => ipcRenderer.invoke('position-lock-changed', isLocked),

  /**
   * 通知口型同步敏感度变化
   * @param {number} sensitivity - 敏感度
   * @returns {Promise<boolean>} 是否成功
   */
  notifyLipSyncSensitivityChanged: (sensitivity) => ipcRenderer.invoke('lip-sync-sensitivity-changed', sensitivity),

  // === 事件监听 API ===

  /**
   * 监听位置锁定状态变化
   * @param {Function} callback - 回调函数
   */
  onPositionLockChanged: (callback) => {
    ipcRenderer.on('position-lock-changed', (event, isLocked) => {
      callback(isLocked)
    })
  },

  /**
   * 移除位置锁定监听器
   * @param {Function} callback - 要移除的回调函数
   */
  removePositionLockListener: (callback) => {
    ipcRenderer.removeListener('position-lock-changed', callback)
  },

  // === 新增的事件监听 API ===

  /**
   * 监听模型切换命令
   * @param {Function} callback - 回调函数，参数为模型名称
   */
  onChangeModel: (callback) => {
    ipcRenderer.on('change-model', (event, modelName) => {
      callback(modelName)
    })
  },

  /**
   * 监听表情播放命令
   * @param {Function} callback - 回调函数，参数为表情文件名
   */
  onPlayExpression: (callback) => {
    ipcRenderer.on('play-expression', (event, expressionFile) => {
      callback(expressionFile)
    })
  },

  /**
   * 监听动作播放命令
   * @param {Function} callback - 回调函数，参数为动作文件名
   */
  onPlayMotion: (callback) => {
    ipcRenderer.on('play-motion', (event, motionFile) => {
      callback(motionFile)
    })
  },

  /**
   * 监听开始说话命令
   * @param {Function} callback - 回调函数
   */
  onStartSpeaking: (callback) => {
    ipcRenderer.on('start-speaking', (event) => {
      callback()
    })
  },

  /**
   * 监听停止说话命令
   * @param {Function} callback - 回调函数
   */
  onStopSpeaking: (callback) => {
    ipcRenderer.on('stop-speaking', (event) => {
      callback()
    })
  },

  /**
   * 监听口型同步敏感度设置命令
   * @param {Function} callback - 回调函数，参数为敏感度值
   */
  onSetLipSyncSensitivity: (callback) => {
    ipcRenderer.on('set-lip-sync-sensitivity', (event, sensitivity) => {
      callback(sensitivity)
    })
  },

  /**
   * 监听模型缩放设置命令
   * @param {Function} callback - 回调函数，参数为缩放比例
   */
  onSetModelScale: (callback) => {
    ipcRenderer.on('set-model-scale', (event, scale) => {
      callback(scale)
    })
  },

  /**
   * 监听透明度设置命令
   * @param {Function} callback - 回调函数，参数为透明度值
   */
  onSetOpacity: (callback) => {
    ipcRenderer.on('set-opacity', (event, opacity) => {
      callback(opacity)
    })
  },

  /**
   * 监听重新调整模型大小命令
   * @param {Function} callback - 回调函数
   */
  onRefitModel: (callback) => {
    ipcRenderer.on('refit-model', (event) => {
      callback()
    })
  },

  // === 系统信息 API ===

  /**
   * 获取平台信息
   * @returns {string} 平台名称
   */
  getPlatform: () => process.platform,

  /**
   * 检查是否为开发模式
   * @returns {boolean} 是否为开发模式
   */
  isDevelopment: () => process.env.NODE_ENV === 'development',

  // === 拖拽支持 API ===

  /**
   * 启用窗口拖拽
   * 通过设置 CSS 属性实现全窗口拖拽
   */
  enableWindowDrag: () => {
    // 设置整个 body 为可拖拽区域
    document.body.style.webkitAppRegion = 'drag'

    // 为需要交互的元素设置 no-drag
    const interactiveElements = document.querySelectorAll('button, input, select, textarea, .interactive')
    interactiveElements.forEach(element => {
      element.style.webkitAppRegion = 'no-drag'
    })
  },

  /**
   * 禁用窗口拖拽
   */
  disableWindowDrag: () => {
    document.body.style.webkitAppRegion = 'no-drag'
  },

  /**
   * 为指定元素设置拖拽属性
   * @param {string} selector - CSS 选择器
   * @param {boolean} draggable - 是否可拖拽
   */
  setElementDraggable: (selector, draggable = true) => {
    const elements = document.querySelectorAll(selector)
    elements.forEach(element => {
      element.style.webkitAppRegion = draggable ? 'drag' : 'no-drag'
    })
  },

  // === 工具函数 API ===

  /**
   * 显示原生通知
   * @param {string} title - 通知标题
   * @param {string} body - 通知内容
   * @param {string} icon - 图标路径（可选）
   */
  showNotification: (title, body, icon = null) => {
    if ('Notification' in window) {
      const options = { body }
      if (icon) options.icon = icon

      new Notification(title, options)
    }
  },

  /**
   * 复制文本到剪贴板
   * @param {string} text - 要复制的文本
   * @returns {Promise<boolean>} 复制是否成功
   */
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('复制到剪贴板失败:', error)
      return false
    }
  },

  // === 调试和日志 API ===

  /**
   * 向主进程发送日志
   * @param {string} level - 日志级别 (info, warn, error)
   * @param {string} message - 日志消息
   * @param {any} data - 附加数据（可选）
   */
  log: (level, message, data = null) => {
    const logData = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      source: 'renderer'
    }

    // 发送到主进程（如果需要）
    // ipcRenderer.send('log', logData)

    // 同时在渲染进程中输出
    console[level](`[Desktop Pet] ${message}`, data || '')
  }
}

/**
 * 桌面模型增强功能
 * 提供额外的便利功能
 */
const desktopPetEnhanced = {
  // === 窗口状态管理 ===

  /**
   * 窗口状态管理器
   */
  windowState: {
    _isLocked: false,
    _callbacks: new Set(),

    /**
     * 获取锁定状态
     */
    get isLocked() {
      return this._isLocked
    },

    /**
     * 设置锁定状态
     */
    set isLocked(value) {
      if (this._isLocked !== value) {
        this._isLocked = value
        this._callbacks.forEach(callback => callback(value))
      }
    },

    /**
     * 监听锁定状态变化
     */
    onLockChanged(callback) {
      this._callbacks.add(callback)
      return () => this._callbacks.delete(callback)
    }
  },

  // === 性能监控 ===

  /**
   * 性能监控器
   */
  performance: {
    /**
     * 获取内存使用情况
     */
    getMemoryUsage() {
      if (performance.memory) {
        return {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        }
      }
      return null
    },

    /**
     * 获取 FPS
     */
    getFPS() {
      let fps = 0
      let lastTime = performance.now()
      let frames = 0

      function countFPS() {
        frames++
        const currentTime = performance.now()
        if (currentTime >= lastTime + 1000) {
          fps = Math.round((frames * 1000) / (currentTime - lastTime))
          frames = 0
          lastTime = currentTime
        }
        requestAnimationFrame(countFPS)
      }

      requestAnimationFrame(countFPS)
      return () => fps
    }
  },

  // === 主题和样式 ===

  /**
   * 主题管理器
   */
  theme: {
    /**
     * 检测系统主题
     */
    getSystemTheme() {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    },

    /**
     * 监听系统主题变化
     */
    onSystemThemeChange(callback) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e) => callback(e.matches ? 'dark' : 'light')
      mediaQuery.addListener(handler)
      return () => mediaQuery.removeListener(handler)
    }
  }
}

// === 暴露 API 到渲染进程 ===

try {
  // 主要 API
  contextBridge.exposeInMainWorld('desktopPet', desktopPetAPI)

  // 增强功能 API
  contextBridge.exposeInMainWorld('desktopPetEnhanced', desktopPetEnhanced)

  // 兼容性 API（为了向后兼容）
  contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    isDev: process.env.NODE_ENV === 'development'
  })

  console.log('桌面模型 API 已成功暴露到渲染进程')

} catch (error) {
  console.error('暴露桌面模型 API 失败:', error)
}

// === 初始化处理 ===

// DOM 加载完成后的初始化
window.addEventListener('DOMContentLoaded', () => {
  console.log('桌面模型预加载脚本初始化完成')

  // 自动启用窗口拖拽（如果需要）
  // desktopPetAPI.enableWindowDrag()

  // 监听位置锁定状态变化
  desktopPetAPI.onPositionLockChanged((isLocked) => {
    desktopPetEnhanced.windowState.isLocked = isLocked
    console.log('位置锁定状态变化:', isLocked)
  })
})

// 页面卸载前的清理
window.addEventListener('beforeunload', () => {
  console.log('桌面模型页面即将卸载')
  // 执行必要的清理工作
})
