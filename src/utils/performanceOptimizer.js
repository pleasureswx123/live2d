/**
 * Live2D 性能优化工具
 * 提供模型加载、渲染和内存管理的优化功能
 */

/**
 * PIXI 应用性能配置
 */
export const PIXI_PERFORMANCE_CONFIG = {
  // 渲染器配置
  renderer: {
    powerPreference: 'high-performance', // 使用高性能GPU
    preserveDrawingBuffer: false, // 减少内存占用
    clearBeforeRender: true, // 确保每帧清理
    forceCanvas: false, // 优先使用WebGL
    antialias: true, // 抗锯齿
    resolution: window.devicePixelRatio || 1, // 设备像素比
  },
  
  // 应用配置
  application: {
    autoDensity: true, // 自动密度调整
    backgroundAlpha: 0, // 透明背景（桌面模式）
    sharedTicker: true, // 共享ticker
    sharedLoader: true, // 共享loader
  },
  
  // 纹理配置
  texture: {
    scaleMode: 'linear', // 纹理缩放模式
    mipmap: false, // 关闭mipmap以节省内存
    anisotropicLevel: 0, // 各向异性过滤级别
    alphaMode: 'premultiply-alpha-on-upload', // Alpha预乘
  }
}

/**
 * Live2D 模型性能配置
 */
export const LIVE2D_PERFORMANCE_CONFIG = {
  // 模型更新频率（FPS）
  updateFPS: 60,
  
  // 物理模拟配置
  physics: {
    enabled: true,
    fps: 30, // 物理模拟降低到30FPS
    gravity: 1.0,
    wind: 0.0
  },
  
  // 动作配置
  motion: {
    fadeInTime: 0.5, // 动作淡入时间
    fadeOutTime: 0.5, // 动作淡出时间
    priority: 'normal' // 动作优先级
  },
  
  // 表情配置
  expression: {
    fadeInTime: 0.3,
    fadeOutTime: 0.3
  },
  
  // 眨眼配置
  eyeBlink: {
    enabled: true,
    interval: 3000, // 眨眼间隔（毫秒）
    closingTime: 100, // 闭眼时间
    closedTime: 50, // 保持闭眼时间
    openingTime: 150 // 睁眼时间
  },
  
  // 呼吸效果配置
  breathing: {
    enabled: true,
    cycle: 3000, // 呼吸周期（毫秒）
    amplitude: 0.5 // 呼吸幅度
  }
}

/**
 * 内存管理配置
 */
export const MEMORY_MANAGEMENT_CONFIG = {
  // 缓存配置
  cache: {
    maxModelCache: 3, // 最大缓存模型数量
    maxTextureCache: 10, // 最大缓存纹理数量
    cacheTimeout: 300000, // 缓存超时时间（5分钟）
    autoCleanup: true // 自动清理
  },
  
  // 垃圾回收配置
  gc: {
    interval: 60000, // GC间隔（1分钟）
    forceGC: false, // 是否强制GC
    memoryThreshold: 100 // 内存阈值（MB）
  }
}

/**
 * 预加载策略配置
 */
export const PRELOAD_STRATEGY_CONFIG = {
  // 预加载模式
  mode: 'smart', // 'aggressive', 'smart', 'lazy'
  
  // 智能预加载配置
  smart: {
    maxConcurrent: 2, // 最大并发预加载数
    priorityModels: ['hibiki', 'hiyori', 'youyou'], // 优先预加载的模型
    delayAfterInit: 2000, // 初始化后延迟预加载时间
    backgroundOnly: true // 仅在后台预加载
  },
  
  // 激进预加载配置
  aggressive: {
    maxConcurrent: 4,
    preloadAll: true,
    delayAfterInit: 1000
  },
  
  // 懒加载配置
  lazy: {
    maxConcurrent: 1,
    onDemandOnly: true,
    cacheTimeout: 60000 // 1分钟后清理
  }
}

/**
 * 性能监控配置
 */
export const PERFORMANCE_MONITOR_CONFIG = {
  enabled: true,
  updateInterval: 1000, // 更新间隔（毫秒）
  
  // 监控指标
  metrics: {
    fps: true,
    memory: true,
    renderTime: true,
    drawCalls: true,
    textureMemory: true
  },
  
  // 性能警告阈值
  thresholds: {
    lowFPS: 30, // 低FPS警告
    highMemory: 200, // 高内存使用警告（MB）
    highRenderTime: 16.67 // 高渲染时间警告（毫秒）
  }
}

/**
 * 获取设备性能等级
 * @returns {string} 'high' | 'medium' | 'low'
 */
export function getDevicePerformanceLevel() {
  // 检查设备内存
  const memory = navigator.deviceMemory || 4 // 默认4GB
  
  // 检查CPU核心数
  const cores = navigator.hardwareConcurrency || 4 // 默认4核
  
  // 检查GPU信息（如果可用）
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  let gpuTier = 'medium'
  
  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      // 简单的GPU性能判断
      if (renderer.includes('RTX') || renderer.includes('GTX 1060') || renderer.includes('RX 580')) {
        gpuTier = 'high'
      } else if (renderer.includes('Intel') || renderer.includes('integrated')) {
        gpuTier = 'low'
      }
    }
  }
  
  // 综合判断性能等级
  if (memory >= 8 && cores >= 8 && gpuTier === 'high') {
    return 'high'
  } else if (memory >= 4 && cores >= 4 && gpuTier !== 'low') {
    return 'medium'
  } else {
    return 'low'
  }
}

/**
 * 根据设备性能调整配置
 * @param {string} performanceLevel - 性能等级
 * @returns {Object} 调整后的配置
 */
export function getOptimizedConfig(performanceLevel = null) {
  const level = performanceLevel || getDevicePerformanceLevel()
  
  const baseConfig = {
    ...LIVE2D_PERFORMANCE_CONFIG,
    ...MEMORY_MANAGEMENT_CONFIG,
    ...PRELOAD_STRATEGY_CONFIG
  }
  
  switch (level) {
    case 'high':
      return {
        ...baseConfig,
        updateFPS: 60,
        physics: { ...baseConfig.physics, fps: 60 },
        preload: { ...baseConfig.smart, maxConcurrent: 4 }
      }
      
    case 'medium':
      return {
        ...baseConfig,
        updateFPS: 45,
        physics: { ...baseConfig.physics, fps: 30 },
        preload: { ...baseConfig.smart, maxConcurrent: 2 }
      }
      
    case 'low':
      return {
        ...baseConfig,
        updateFPS: 30,
        physics: { ...baseConfig.physics, fps: 20, enabled: false },
        preload: { ...baseConfig.lazy, maxConcurrent: 1 },
        eyeBlink: { ...baseConfig.eyeBlink, enabled: false },
        breathing: { ...baseConfig.breathing, enabled: false }
      }
      
    default:
      return baseConfig
  }
}

/**
 * 性能优化建议
 */
export const PERFORMANCE_TIPS = {
  loading: [
    '使用预加载减少切换模型时的等待时间',
    '启用纹理缓存避免重复加载',
    '合理设置缓存大小平衡内存和性能',
    '使用WebGL渲染器获得更好的性能'
  ],
  
  runtime: [
    '降低物理模拟频率节省CPU资源',
    '关闭不必要的动画效果',
    '定期清理未使用的资源',
    '监控内存使用避免内存泄漏'
  ],
  
  memory: [
    '及时销毁不再使用的模型',
    '限制同时缓存的模型数量',
    '使用合适的纹理格式和大小',
    '启用自动垃圾回收'
  ]
}
