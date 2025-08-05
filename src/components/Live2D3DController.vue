<template>
  <div class="three-d-controller">
    <h3 class="controller-title">🎮 Live2D 3D 效果控制器</h3>
    
    <!-- 主控制按钮 -->
    <div class="main-controls">
      <button 
        @click="$emit('toggle3D')" 
        :class="['control-btn', 'toggle-btn', { active: config.enabled }]"
      >
        {{ config.enabled ? '🔴 禁用 3D' : '🟢 启用 3D' }}
      </button>
      
      <button 
        @click="$emit('reset3D')" 
        :disabled="!config.enabled"
        class="control-btn reset-btn"
      >
        🔄 重置
      </button>
      
      <label class="auto-rotate-label">
        <input 
          type="checkbox" 
          :checked="config.autoRotate"
          @change="$emit('updateConfig', { autoRotate: $event.target.checked })"
          :disabled="!config.enabled"
        >
        <span>🔄 自动旋转</span>
      </label>
    </div>

    <!-- 详细控制面板 -->
    <div v-if="config.enabled" class="detailed-controls">
      <!-- 预设效果 -->
      <div class="preset-section">
        <h4>🎯 预设效果</h4>
        <div class="preset-buttons">
          <button @click="applyPreset('front')" class="preset-btn">正面</button>
          <button @click="applyPreset('left')" class="preset-btn">左侧</button>
          <button @click="applyPreset('right')" class="preset-btn">右侧</button>
          <button @click="applyPreset('top')" class="preset-btn">俯视</button>
          <button @click="applyPreset('perspective')" class="preset-btn">透视</button>
        </div>
      </div>

      <!-- 旋转控制 -->
      <div class="control-section">
        <h4>🔄 旋转控制</h4>
        <div class="control-grid">
          <div class="control-item">
            <label>X 轴 (上下): {{ config.rotationX }}°</label>
            <input 
              type="range" 
              min="-90" 
              max="90" 
              :value="config.rotationX"
              @input="updateRotation('rotationX', $event.target.value)"
              class="range-input"
            >
          </div>
          
          <div class="control-item">
            <label>Y 轴 (左右): {{ config.rotationY }}°</label>
            <input 
              type="range" 
              min="-180" 
              max="180" 
              :value="config.rotationY"
              @input="updateRotation('rotationY', $event.target.value)"
              class="range-input"
            >
          </div>
          
          <div class="control-item">
            <label>Z 轴 (倾斜): {{ config.rotationZ }}°</label>
            <input 
              type="range" 
              min="-180" 
              max="180" 
              :value="config.rotationZ"
              @input="updateRotation('rotationZ', $event.target.value)"
              class="range-input"
            >
          </div>
        </div>
      </div>

      <!-- 变换控制 -->
      <div class="control-section">
        <h4>📐 变换控制</h4>
        <div class="control-grid">
          <div class="control-item">
            <label>透视距离: {{ config.perspective }}px</label>
            <input 
              type="range" 
              min="500" 
              max="2000" 
              :value="config.perspective"
              @input="updateConfig('perspective', $event.target.value)"
              class="range-input"
            >
          </div>
          
          <div class="control-item">
            <label>Z 轴位移: {{ config.translateZ }}px</label>
            <input 
              type="range" 
              min="-500" 
              max="500" 
              :value="config.translateZ"
              @input="updateConfig('translateZ', $event.target.value)"
              class="range-input"
            >
          </div>
          
          <div class="control-item">
            <label>3D 缩放: {{ config.scale3D }}x</label>
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.1"
              :value="config.scale3D"
              @input="updateConfig('scale3D', $event.target.value)"
              class="range-input"
            >
          </div>
        </div>
      </div>

      <!-- 自动旋转设置 -->
      <div v-if="config.autoRotate" class="control-section">
        <h4>⚡ 自动旋转设置</h4>
        <div class="control-item">
          <label>旋转速度: {{ config.autoRotateSpeed }}°/帧</label>
          <input 
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1"
            :value="config.autoRotateSpeed"
            @input="updateConfig('autoRotateSpeed', $event.target.value)"
            class="range-input"
          >
        </div>
      </div>

      <!-- 使用提示 -->
      <div class="usage-tip">
        <div class="tip-icon">💡</div>
        <div class="tip-content">
          <strong>使用提示：</strong>
          <ul>
            <li>🖱️ 鼠标拖拽：旋转模型</li>
            <li>🎯 滚轮：缩放模型</li>
            <li>🎮 滑块：精确调节参数</li>
            <li>⚡ 预设：快速应用效果</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle3D', 'reset3D', 'updateConfig', 'applyTransform'])

// 更新旋转参数
function updateRotation(axis, value) {
  const numValue = parseFloat(value)
  emit('updateConfig', { [axis]: numValue })
  emit('applyTransform')
}

// 更新配置参数
function updateConfig(key, value) {
  const numValue = parseFloat(value)
  emit('updateConfig', { [key]: numValue })
  emit('applyTransform')
}

// 应用预设效果
function applyPreset(preset) {
  const presets = {
    front: { rotationX: 0, rotationY: 0, rotationZ: 0 },
    left: { rotationX: 0, rotationY: -45, rotationZ: 0 },
    right: { rotationX: 0, rotationY: 45, rotationZ: 0 },
    top: { rotationX: -30, rotationY: 0, rotationZ: 0 },
    perspective: { rotationX: -15, rotationY: 25, rotationZ: 5 }
  }
  
  if (presets[preset]) {
    emit('updateConfig', presets[preset])
    emit('applyTransform')
  }
}
</script>

<style scoped>
.three-d-controller {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.controller-title {
  margin: 0 0 20px 0;
  text-align: center;
  font-size: 1.2em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.main-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.control-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.toggle-btn {
  background: #28a745;
  color: white;
}

.toggle-btn.active {
  background: #dc3545;
}

.reset-btn {
  background: #6c757d;
  color: white;
}

.reset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auto-rotate-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  cursor: pointer;
}

.detailed-controls {
  space-y: 20px;
}

.preset-section,
.control-section {
  margin-bottom: 25px;
}

.preset-section h4,
.control-section h4 {
  margin: 0 0 15px 0;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  font-size: 1.1em;
}

.preset-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 8px 16px;
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.preset-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}

.control-grid {
  display: grid;
  gap: 15px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item label {
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  font-size: 14px;
}

.range-input {
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
  height: 8px;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}

.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

.usage-tip {
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.tip-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.tip-content {
  flex: 1;
}

.tip-content strong {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
}

.tip-content ul {
  margin: 0;
  padding-left: 20px;
  list-style-type: none;
}

.tip-content li {
  margin-bottom: 4px;
  font-size: 14px;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .main-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .preset-buttons {
    justify-content: center;
  }
  
  .control-grid {
    grid-template-columns: 1fr;
  }
}
</style>
