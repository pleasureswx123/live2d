<template>
  <div v-if="showMonitor" class="performance-monitor">
    <div class="monitor-header">
      <h4>性能监控</h4>
      <button @click="toggleMonitor" class="close-btn">×</button>
    </div>
    
    <div class="monitor-content">
      <!-- 基础性能指标 -->
      <div class="metric-group">
        <h5>基础指标</h5>
        <div class="metric-item">
          <span class="metric-label">FPS:</span>
          <span class="metric-value" :class="getFPSClass(performanceStats.fps)">
            {{ performanceStats.fps }}
          </span>
        </div>
        <div class="metric-item">
          <span class="metric-label">内存:</span>
          <span class="metric-value" :class="getMemoryClass(performanceStats.memoryUsage)">
            {{ performanceStats.memoryUsage }}MB
          </span>
        </div>
        <div class="metric-item">
          <span class="metric-label">渲染时间:</span>
          <span class="metric-value">{{ performanceStats.renderTime.toFixed(2) }}ms</span>
        </div>
      </div>
      
      <!-- 缓存信息 -->
      <div class="metric-group">
        <h5>缓存状态</h5>
        <div class="metric-item">
          <span class="metric-label">模型缓存:</span>
          <span class="metric-value">{{ cacheStats.modelCache.size }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">纹理缓存:</span>
          <span class="metric-value">{{ cacheStats.textureCache.size }}</span>
        </div>
        <div v-if="cacheStats.memoryUsage" class="metric-item">
          <span class="metric-label">JS堆内存:</span>
          <span class="metric-value">
            {{ cacheStats.memoryUsage.used }}/{{ cacheStats.memoryUsage.total }}MB
          </span>
        </div>
      </div>
      
      <!-- 设备信息 -->
      <div class="metric-group">
        <h5>设备信息</h5>
        <div class="metric-item">
          <span class="metric-label">性能等级:</span>
          <span class="metric-value" :class="getPerformanceClass(devicePerformance)">
            {{ devicePerformance.toUpperCase() }}
          </span>
        </div>
        <div class="metric-item">
          <span class="metric-label">渲染器:</span>
          <span class="metric-value">{{ rendererType }}</span>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="monitor-actions">
        <button @click="clearCache" class="action-btn warning">
          清理缓存
        </button>
        <button @click="forceGC" class="action-btn info">
          强制GC
        </button>
        <button @click="showTips" class="action-btn primary">
          优化建议
        </button>
      </div>
    </div>
    
    <!-- 优化建议弹窗 -->
    <div v-if="showTipsModal" class="tips-modal" @click="showTipsModal = false">
      <div class="tips-content" @click.stop>
        <h4>性能优化建议</h4>
        <div class="tips-section">
          <h5>加载优化</h5>
          <ul>
            <li v-for="tip in PERFORMANCE_TIPS.loading" :key="tip">{{ tip }}</li>
          </ul>
        </div>
        <div class="tips-section">
          <h5>运行时优化</h5>
          <ul>
            <li v-for="tip in PERFORMANCE_TIPS.runtime" :key="tip">{{ tip }}</li>
          </ul>
        </div>
        <div class="tips-section">
          <h5>内存优化</h5>
          <ul>
            <li v-for="tip in PERFORMANCE_TIPS.memory" :key="tip">{{ tip }}</li>
          </ul>
        </div>
        <button @click="showTipsModal = false" class="close-tips-btn">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { PERFORMANCE_TIPS } from '../utils/performanceOptimizer.js'

// 注入数据
const performanceStats = inject('performanceStats')
const cacheStats = inject('cacheStats')
const devicePerformance = inject('devicePerformance')
const rendererType = inject('rendererType')

// 注入方法
const clearModelCache = inject('clearModelCache')
const getCacheStats = inject('getCacheStats')

// 组件状态
const showMonitor = ref(false)
const showTipsModal = ref(false)

// 方法
const toggleMonitor = () => {
  showMonitor.value = !showMonitor.value
}

const clearCache = () => {
  clearModelCache(false)
  // 更新缓存统计
  Object.assign(cacheStats.value, getCacheStats())
}

const forceGC = () => {
  if (window.gc && typeof window.gc === 'function') {
    window.gc()
    console.log('已触发强制垃圾回收')
  } else {
    console.warn('当前环境不支持强制垃圾回收')
  }
}

const showTips = () => {
  showTipsModal.value = true
}

// 样式类计算
const getFPSClass = (fps) => {
  if (fps >= 50) return 'good'
  if (fps >= 30) return 'warning'
  return 'bad'
}

const getMemoryClass = (memory) => {
  if (memory < 100) return 'good'
  if (memory < 200) return 'warning'
  return 'bad'
}

const getPerformanceClass = (level) => {
  switch (level) {
    case 'high': return 'good'
    case 'medium': return 'warning'
    case 'low': return 'bad'
    default: return ''
  }
}

// 暴露切换方法给父组件
defineExpose({
  toggleMonitor
})
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  font-size: 12px;
  backdrop-filter: blur(10px);
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.monitor-header h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.monitor-content {
  padding: 16px;
}

.metric-group {
  margin-bottom: 16px;
}

.metric-group h5 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
  font-weight: 600;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.metric-label {
  color: #666;
}

.metric-value {
  font-weight: 600;
}

.metric-value.good {
  color: #28a745;
}

.metric-value.warning {
  color: #ffc107;
}

.metric-value.bad {
  color: #dc3545;
}

.monitor-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.warning {
  background: #ffc107;
  color: #212529;
}

.action-btn.info {
  background: #17a2b8;
  color: white;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* 优化建议弹窗 */
.tips-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.tips-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  margin: 20px;
}

.tips-content h4 {
  margin: 0 0 16px 0;
  color: #333;
}

.tips-section {
  margin-bottom: 16px;
}

.tips-section h5 {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.tips-section ul {
  margin: 0;
  padding-left: 20px;
}

.tips-section li {
  margin-bottom: 4px;
  font-size: 13px;
  line-height: 1.4;
}

.close-tips-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .performance-monitor {
    width: calc(100vw - 40px);
    right: 20px;
  }
  
  .tips-content {
    margin: 10px;
    padding: 16px;
  }
}
</style>
