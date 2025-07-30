<script setup>
import * as PIXI from 'pixi.js'
import { Live2DModel, SoundManager, MotionPriority } from 'pixi-live2d-display'
import { ref, onMounted, onUnmounted, computed } from 'vue'

window.PIXI = PIXI

import testAudioUrl from '@/assets/test.wav'
const audioFile = ref(testAudioUrl);

const canvas = ref(null)
const isModelLoaded = ref(false)
const currentModelName = ref('idol')

let app
let model
let audioContext

// 模型配置
const modelConfigs = {
  idol: {
    name: '偶像',
    path: '/models/idol/ldol.model3.json',
    motions: [
      { name: '姿势1', file: '1.motion3.json' }
    ],
    expressions: [
      { name: '问号', file: '1.exp3.json', index: 0 },
      { name: '生气', file: '2.exp3.json', index: 1 },
      { name: '黑脸', file: '3.exp3.json', index: 2 },
      { name: '表情4', file: '4.exp3.json', index: 3 },
      { name: '表情5', file: '5.exp3.json', index: 4 },
      { name: '表情6', file: '6.exp3.json', index: 5 },
      { name: '表情7', file: '7.exp3.json', index: 6 },
      { name: '表情8', file: '8.exp3.json', index: 7 }
    ],
    sounds: []
  },
  lanhei: {
    name: '蓝黑',
    path: '/models/lanhei/lanhei.model3.json',
    motions: [
      { name: '场景1', file: 'Scene1.motion3.json' }
    ],
    expressions: [
      { name: '棒棒糖', file: 'bangbangtang.exp3.json', index: 0 },
      { name: '唱歌', file: 'changge.exp3.json', index: 1 },
      { name: '打游戏', file: 'dayouxi.exp3.json', index: 2 },
      { name: '黑脸', file: 'heilian.exp3.json', index: 3 },
      { name: '黑衣', file: 'heiyi.exp3.json', index: 4 },
      { name: '哭', file: 'ku.exp3.json', index: 5 },
      { name: '脸红', file: 'lianhong.exp3.json', index: 6 },
      { name: '圈圈', file: 'quanquan.exp3.json', index: 7 },
      { name: '生气', file: 'shengqi.exp3.json', index: 8 },
      { name: '手表', file: 'shoubiao.exp3.json', index: 9 },
      { name: '星星', file: 'xingxing.exp3.json', index: 10 }
    ],
    sounds: []
  },
  hibiki: {
    name: 'Hibiki',
    path: '/models/hibiki/hibiki.model3.json',
    motions: [
      { name: '动作1', file: 'hibiki_01.motion3.json', sound: 'sounds/hibiki_01.wav' },
      { name: '动作2', file: 'hibiki_02.motion3.json', sound: 'sounds/hibiki_02.wav' },
      { name: '动作3', file: 'hibiki_03.motion3.json', sound: 'sounds/hibiki_03.wav' },
      { name: '动作4', file: 'hibiki_04.motion3.json', sound: 'sounds/hibiki_04.wav' },
      { name: '动作5', file: 'hibiki_05.motion3.json', sound: 'sounds/hibiki_05.wav' }
    ],
    expressions: [
      { name: '普通', file: 'Normal.exp3.json', index: 0 },
      { name: '生气', file: 'Angry.exp3.json', index: 1 },
      { name: '脸红', file: 'Blushing.exp3.json', index: 2 },
      { name: '悲伤', file: 'Sad.exp3.json', index: 3 },
      { name: '惊讶', file: 'Surprised.exp3.json', index: 4 },
      { name: '特殊', file: 'f01.exp3.json', index: 5 }
    ],
    sounds: [
      { name: '动作1音频', file: 'sounds/hibiki_01.wav' },
      { name: '动作2音频', file: 'sounds/hibiki_02.wav' },
      { name: '动作3音频', file: 'sounds/hibiki_03.wav' },
      { name: '动作4音频', file: 'sounds/hibiki_04.wav' },
      { name: '动作5音频', file: 'sounds/hibiki_05.wav' }
    ]
  },
  hiyori: {
    name: 'Hiyori',
    path: '/models/hiyori/hiyori_free_t08.model3.json',
    motions: [
      { name: '动作1', file: 'hiyori_m01.motion3.json' },
      { name: '动作2', file: 'hiyori_m02.motion3.json' },
      { name: '动作3', file: 'hiyori_m03.motion3.json' },
      { name: '动作4', file: 'hiyori_m04.motion3.json' },
      { name: '动作5', file: 'hiyori_m05.motion3.json' },
      { name: '动作6', file: 'hiyori_m06.motion3.json' },
      { name: '动作7', file: 'hiyori_m07.motion3.json' },
      { name: '动作8', file: 'hiyori_m08.motion3.json' }
    ],
    expressions: [],
    sounds: []
  },
  mark: {
    name: 'Mark',
    path: '/models/mark/mark_free_t04.model3.json',
    motions: [
      { name: '动作1', file: 'mark_m01.motion3.json' },
      { name: '动作2', file: 'mark_m02.motion3.json' },
      { name: '动作3', file: 'mark_m03.motion3.json' },
      { name: '动作4', file: 'mark_m04.motion3.json' },
      { name: '动作5', file: 'mark_m05.motion3.json' },
      { name: '动作6', file: 'mark_m06.motion3.json' }
    ],
    expressions: [],
    sounds: []
  },
  natori: {
    name: 'Natori',
    path: '/models/natori/natori_pro_t06.model3.json',
    motions: [
      { name: '动作0', file: 'mtn_00.motion3.json' },
      { name: '动作1', file: 'mtn_01.motion3.json' },
      { name: '动作2', file: 'mtn_02.motion3.json' },
      { name: '动作3', file: 'mtn_03.motion3.json' },
      { name: '动作4', file: 'mtn_04.motion3.json' },
      { name: '动作5', file: 'mtn_05.motion3.json' },
      { name: '动作6', file: 'mtn_06.motion3.json' },
      { name: '动作7', file: 'mtn_07.motion3.json' }
    ],
    expressions: [
      { name: '普通', file: 'Normal.exp3.json', index: 0 },
      { name: '生气', file: 'Angry.exp3.json', index: 1 },
      { name: '脸红', file: 'Blushing.exp3.json', index: 2 },
      { name: '悲伤', file: 'Sad.exp3.json', index: 3 },
      { name: '微笑', file: 'Smile.exp3.json', index: 4 },
      { name: '惊讶', file: 'Surprised.exp3.json', index: 5 },
      { name: '表情1', file: 'exp_01.exp3.json', index: 6 },
      { name: '表情2', file: 'exp_02.exp3.json', index: 7 },
      { name: '表情3', file: 'exp_03.exp3.json', index: 8 },
      { name: '表情4', file: 'exp_04.exp3.json', index: 9 },
      { name: '表情5', file: 'exp_05.exp3.json', index: 10 }
    ],
    sounds: []
  },
  kei_basic: {
    name: 'Kei Basic',
    path: '/models/kei_basic/kei_basic_free.model3.json',
    motions: [
      { name: '英语', file: '01_kei_en.motion3.json', sound: 'sounds/01_kei_en.wav' },
      { name: '日语', file: '01_kei_jp.motion3.json', sound: 'sounds/01_kei_jp.wav' },
      { name: '韩语', file: '01_kei_ko.motion3.json', sound: 'sounds/01_kei_ko.wav' },
      { name: '中文', file: '01_kei_zh.motion3.json', sound: 'sounds/01_kei_zh.wav' }
    ],
    expressions: [],
    sounds: [
      { name: '英语音频', file: 'sounds/01_kei_en.wav' },
      { name: '日语音频', file: 'sounds/01_kei_jp.wav' },
      { name: '韩语音频', file: 'sounds/01_kei_ko.wav' },
      { name: '中文音频', file: 'sounds/01_kei_zh.wav' }
    ]
  },
  kei_vowels: {
    name: 'Kei Vowels Pro',
    path: '/models/kei_vowels/kei_vowels_pro.model3.json',
    motions: [
      { name: '英语', file: '01_kei_en.motion3.json', sound: 'sounds/01_kei_en.wav' },
      { name: '日语', file: '01_kei_jp.motion3.json', sound: 'sounds/01_kei_jp.wav' },
      { name: '韩语', file: '01_kei_ko.motion3.json', sound: 'sounds/01_kei_ko.wav' },
      { name: '中文', file: '01_kei_zh.motion3.json', sound: 'sounds/01_kei_zh.wav' }
    ],
    expressions: [],
    sounds: [
      { name: '英语音频', file: 'sounds/01_kei_en.wav' },
      { name: '日语音频', file: 'sounds/01_kei_jp.wav' },
      { name: '韩语音频', file: 'sounds/01_kei_ko.wav' },
      { name: '中文音频', file: 'sounds/01_kei_zh.wav' }
    ]
  }
}

// 当前模型配置
const currentConfig = computed(() => modelConfigs[currentModelName.value])

// 选中的动作和表情
const selectedMotion = ref('')
const selectedExpression = ref('')

// 音频相关状态
const selectedSound = ref('')
const currentAudio = ref(null)
const isPlaying = ref(false)
const isPaused = ref(false)
const audioVolume = ref(0.7)
const audioProgress = ref(0)
const audioDuration = ref(0)
const audioCurrentTime = ref(0)

// 计算属性：当前模型是否支持音频
const hasAudioSupport = computed(() => {
  return currentConfig.value.sounds && currentConfig.value.sounds.length > 0
})

const speaking = async () => {
  const response = await fetch(audioFile);
  const audioData = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(audioData);
  const source = audioContext.createBufferSource();
  const analyser = audioContext.createAnalyser();
  source.buffer = audioBuffer;
  analyser.connect(audioContext.destination)
  source.connect(analyser)
  source.start();
  
  const updateMouth = () => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const mouthOpen = Math.min(1, volume / 50);
    model.internalModel.coreModel.setParamFloat('PARAM_MOUTH_OPEN_Y', mouthOpen);
    if ( audioContext.state !== 'close') {
      requestAnimationFrame(updateMouth)
    }
  }
  updateMouth();
}

onMounted(async () => {
  try {
    audioContext = new AudioContext();
    
    app = new PIXI.Application({
      view: canvas.value,
      width: 600,
      height: 600,
      backgroundColor: 0x000000,
      autoDensity: true,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    })

    // 配置 SoundManager
    SoundManager.volume = audioVolume.value

    // 添加模型更新循环
    app.ticker.add(() => {
      if (model) {
        model.update(app.ticker.deltaMS)
      }
    })

    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize)

    // 加载默认模型
    await loadModel(currentModelName.value)
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
})

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('resize', handleResize)

  // 清理模型和应用
  if (model) {
    model.destroy()
  }
  if (app) {
    app.destroy(true)
  }
})

// 获取 Canvas 的逻辑尺寸（CSS 尺寸，不受 devicePixelRatio 影响）
function getCanvasLogicalSize() {
  const canvas = app.view
  const rect = canvas.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height
  }
}

// 处理窗口大小变化
function handleResize() {
  if (!model || !isModelLoaded.value || !app) return

  // 防抖处理，避免频繁调整
  clearTimeout(handleResize.timeoutId)
  handleResize.timeoutId = setTimeout(() => {
    console.log('窗口大小变化，重新调整模型')
    const { width: canvasWidth, height: canvasHeight } = getCanvasLogicalSize()
    console.log(`Canvas 逻辑尺寸: ${canvasWidth} x ${canvasHeight}, 设备像素比: ${window.devicePixelRatio}`)
    autoFitModel(model, canvasWidth, canvasHeight)
  }, 300)
}

// 加载模型函数
// 自动计算模型缩放比例
function calculateAutoScale(model, canvasWidth, canvasHeight) {
  try {
    // 先设置一个基础缩放来获取准确的边界框
    model.scale.set(1.0)

    // 获取模型的边界框
    const bounds = model.getBounds()
    console.log('模型边界框:', bounds)

    if (!bounds || bounds.width === 0 || bounds.height === 0) {
      console.warn('无法获取模型边界框，使用默认缩放')
      return getDefaultScale(currentModelName.value)
    }

    // 计算模型原始尺寸
    const modelWidth = bounds.width
    const modelHeight = bounds.height

    // 设置目标尺寸（留出边距）
    const targetWidth = canvasWidth * 1  // 使用 canvas 75% 的宽度
    const targetHeight = canvasHeight * 1 // 使用 canvas 85% 的高度

    // 计算缩放比例（取较小值以确保模型完全显示）
    const scaleX = targetWidth / modelWidth
    const scaleY = targetHeight / modelHeight
    const scale = Math.min(scaleX, scaleY)

    console.log(`模型尺寸: ${modelWidth.toFixed(2)} x ${modelHeight.toFixed(2)}`)
    console.log(`目标尺寸: ${targetWidth.toFixed(2)} x ${targetHeight.toFixed(2)}`)
    console.log(`计算缩放: scaleX=${scaleX.toFixed(4)}, scaleY=${scaleY.toFixed(4)}, 最终=${scale.toFixed(4)}`)

    // 限制缩放范围，避免过大或过小
    const finalScale = Math.max(0.01, Math.min(1.5, scale))

    // 如果计算出的缩放过小，使用默认值
    if (finalScale < 0.02) {
      console.warn('计算出的缩放过小，使用默认缩放')
      return getDefaultScale(currentModelName.value)
    }

    return finalScale
  } catch (error) {
    console.error('计算自动缩放失败:', error)
    return getDefaultScale(currentModelName.value)
  }
}

// 获取模型的默认缩放值
function getDefaultScale(modelName) {
  const defaultScales = {
    'idol': 0.08,
    'lanhei': 0.12,
    'hibiki': 0.15,
    'hiyori': 0.18,
    'mark': 0.16,
    'natori': 0.14,
    'kei_basic': 0.20,
    'kei_vowels': 0.20
  }
  return defaultScales[modelName] || 0.1
}

// 自动调整模型位置和缩放
function autoFitModel(model, canvasWidth, canvasHeight) {
  try {
    // 计算自动缩放
    const autoScale = calculateAutoScale(model, canvasWidth, canvasHeight)
    model.scale.set(autoScale)

    // 等待一帧以确保缩放生效
    requestAnimationFrame(() => {
      try {
        // 重新获取缩放后的边界框
        const scaledBounds = model.getBounds()

        // 计算居中位置
        const centerX = canvasWidth / 2
        const centerY = canvasHeight / 2

        // 设置模型位置
        model.position.set(
          centerX - scaledBounds.width / 2,
          centerY - scaledBounds.height / 2
        )

        console.log(`模型自动调整完成: scale=${autoScale.toFixed(4)}, position=(${model.position.x.toFixed(2)}, ${model.position.y.toFixed(2)})`)
        console.log(`缩放后边界框: width=${scaledBounds.width.toFixed(2)}, height=${scaledBounds.height.toFixed(2)}`)
      } catch (error) {
        console.error('设置模型位置失败:', error)
        // 使用简单的居中方案
        model.position.set(canvasWidth / 2, canvasHeight / 2)
      }
    })
  } catch (error) {
    console.error('自动调整模型失败:', error)
    // 使用备用方案
    const defaultScale = getDefaultScale(currentModelName.value)
    model.scale.set(defaultScale)
    model.position.set(canvasWidth / 2, canvasHeight / 2)
  }
}

async function loadModel(modelName) {
  try {
    isModelLoaded.value = false

    // 移除旧模型
    if (model) {
      app.stage.removeChild(model)
      model.destroy()
    }

    console.log(`开始加载模型: ${modelName}`)
    const config = modelConfigs[modelName]
    model = await Live2DModel.from(config.path)
    console.log('模型加载成功:', model)

    // 添加动作开始事件监听器，用于音频同步
    model.internalModel.motionManager.on('motionStart', (group, index, audio) => {
      console.log(`动作开始: 组=${group}, 索引=${index}`)
      if (audio) {
        console.log('动作包含音频，已自动播放')
        // 这里可以添加字幕显示等功能
      }
    })

    // 添加动作结束事件监听器
    model.internalModel.motionManager.on('motionFinish', (group, index) => {
      console.log(`动作结束: 组=${group}, 索引=${index}`)
    })

    app.stage.addChild(model)

    // 等待一帧以确保模型完全渲染
    await new Promise(resolve => requestAnimationFrame(resolve))

    // 自动调整模型缩放和位置
    const { width: canvasWidth, height: canvasHeight } = getCanvasLogicalSize()
    console.log(`模型加载完成，Canvas 逻辑尺寸: ${canvasWidth} x ${canvasHeight}`)
    autoFitModel(model, canvasWidth, canvasHeight)

    // 重置选择
    selectedMotion.value = ''
    selectedExpression.value = ''
    selectedSound.value = ''

    // 停止当前音频
    stopAudio()

    isModelLoaded.value = true
    console.log(`模型 ${config.name} 设置完成`)
  } catch (error) {
    console.error('模型加载失败:', error)
    isModelLoaded.value = false
  }
}

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 切换模型
async function changeModel() {
  await loadModel(currentModelName.value)
}

// 播放指定动作
async function playMotion() {
  if (!model || !isModelLoaded.value || !selectedMotion.value) {
    console.warn('模型未加载或未选择动作')
    return
  }

  try {
    console.log(`播放动作: ${selectedMotion.value}`)

    // 停止当前所有动作
    model.internalModel.motionManager.stopAllMotions()

    // 检查模型是否有预定义的动作组
    const hasPreDefinedMotions = model.internalModel.settings.motions &&
                                Object.keys(model.internalModel.settings.motions).length > 0

    if (hasPreDefinedMotions) {
      // 对于有预定义动作组的模型（如 hibiki, hiyori）
      // 查找动作在哪个组中
      const motions = model.internalModel.settings.motions
      let foundGroup = null
      let foundIndex = -1

      for (const [groupName, motionList] of Object.entries(motions)) {
        const index = motionList.findIndex(motion => motion.File === selectedMotion.value)
        if (index !== -1) {
          foundGroup = groupName
          foundIndex = index
          break
        }
      }

      if (foundGroup !== null) {
        console.log(`使用预定义动作组: ${foundGroup}, 索引: ${foundIndex}`)
        await model.motion(foundGroup, foundIndex, MotionPriority.NORMAL)
      } else {
        console.warn('在预定义动作组中未找到指定动作')
      }
    } else {
      // 对于只有独立动作文件的模型（如 idol, lanhei）
      // 需要动态加载动作文件
      const motionPath = `/models/${currentModelName.value}/${selectedMotion.value}`
      console.log(`加载独立动作文件: ${motionPath}`)

      try {
        const response = await fetch(motionPath)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const motionData = await response.json()

        // 使用 motionManager 直接播放动作
        await model.internalModel.motionManager.startMotion(
          'custom', // 自定义组名
          0, // 索引
          MotionPriority.NORMAL,
          null, // onFinish callback
          motionData // 直接传入动作数据
        )

        console.log('独立动作文件播放成功')
      } catch (fetchError) {
        console.error('加载动作文件失败:', fetchError)
        return
      }
    }

    // 如果动作有对应的音频，自动播放
    const motions = currentConfig.value.motions
    const selectedMotionData = motions.find(motion => motion.file === selectedMotion.value)
    if (selectedMotionData && selectedMotionData.sound) {
      playAudioFile(selectedMotionData.sound)
    }

    console.log('动作播放成功')
  } catch (error) {
    console.error('播放动作失败:', error)
  }
}

// 播放随机动作
async function playRandomMotion() {
  if (!model || !isModelLoaded.value) {
    console.warn('模型还未加载完成')
    return
  }

  const motions = currentConfig.value.motions
  if (motions.length === 0) return

  const randomMotion = motions[randomInt(0, motions.length - 1)]
  selectedMotion.value = randomMotion.file

  // 调用修复后的 playMotion 函数
  await playMotion()
}

// 重置所有表情参数到默认值
async function resetAllExpressionParameters() {
  if (!model || !isModelLoaded.value) return

  try {
    const coreModel = model.internalModel.coreModel

    // 获取所有表情文件中涉及的参数ID
    const allExpressionParams = new Set()

    // 遍历当前模型的所有表情文件
    const expressions = currentConfig.value.expressions
    for (const exp of expressions) {
      if (exp.file) {
        try {
          const expressionPath = `/models/${currentModelName.value}/${exp.file}`
          const response = await fetch(expressionPath)
          if (response.ok) {
            const data = await response.json()
            if (data.Parameters) {
              data.Parameters.forEach(param => allExpressionParams.add(param.Id))
            }
          }
        } catch (error) {
          console.warn(`加载表情文件 ${exp.file} 失败:`, error.message)
        }
      }
    }

    console.log(`找到 ${allExpressionParams.size} 个表情参数需要重置`)

    // 将所有表情参数重置为默认值
    allExpressionParams.forEach(paramId => {
      try {
        let paramIndex = -1

        // 尝试不同的获取参数索引的方法
        if (typeof coreModel.getParameterIndexById === 'function') {
          paramIndex = coreModel.getParameterIndexById(paramId)
        } else if (typeof coreModel.getParameterIndex === 'function') {
          paramIndex = coreModel.getParameterIndex(paramId)
        }

        if (paramIndex >= 0) {
          // 获取默认值
          let defaultValue = 0
          if (typeof coreModel.getParameterDefaultValueByIndex === 'function') {
            defaultValue = coreModel.getParameterDefaultValueByIndex(paramIndex)
          } else if (typeof coreModel.getParameterDefaultValue === 'function') {
            defaultValue = coreModel.getParameterDefaultValue(paramIndex)
          }

          // 设置为默认值
          if (typeof coreModel.setParameterValueByIndex === 'function') {
            coreModel.setParameterValueByIndex(paramIndex, defaultValue)
            console.log(`重置参数 ${paramId} (索引${paramIndex}) = ${defaultValue}`)
          } else if (typeof coreModel.setParameterValue === 'function') {
            coreModel.setParameterValue(paramIndex, defaultValue)
            console.log(`重置参数 ${paramId} (索引${paramIndex}) = ${defaultValue}`)
          } else {
            // 备用方法：使用 setParameterValueById
            coreModel.setParameterValueById(paramId, defaultValue)
            console.log(`重置参数 ${paramId} = ${defaultValue} (使用ID方法)`)
          }
        } else {
          console.warn(`未找到参数索引: ${paramId}`)
        }
      } catch (error) {
        console.warn(`重置参数 ${paramId} 失败:`, error.message)
      }
    })

    console.log('表情参数已重置到默认值')
  } catch (error) {
    console.error('重置表情参数失败:', error)
  }
}

// 从文件应用表情
async function applyExpressionFromFile(expressionFile) {
  try {
    const expressionPath = `/models/${currentModelName.value}/${expressionFile}`
    console.log(`加载表情文件: ${expressionPath}`)

    const response = await fetch(expressionPath)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const expressionData = await response.json()

    if (expressionData.Type !== 'Live2D Expression' || !expressionData.Parameters) {
      throw new Error('无效的表情文件格式')
    }

    // 应用表情参数
    const coreModel = model.internalModel.coreModel

    for (const param of expressionData.Parameters) {
      try {
        let newValue = param.Value

        // 处理不同的混合模式
        if (param.Blend === 'Add') {
          const currentValue = coreModel.getParameterValueById(param.Id)
          newValue = currentValue + param.Value
        } else if (param.Blend === 'Multiply') {
          const currentValue = coreModel.getParameterValueById(param.Id)
          newValue = currentValue * param.Value
        }
        // 默认是 'Overwrite' 模式，直接设置值

        coreModel.setParameterValueById(param.Id, newValue)
        console.log(`设置参数 ${param.Id} = ${newValue} (模式: ${param.Blend || 'Overwrite'})`)
      } catch (error) {
        console.warn(`设置参数失败 ${param.Id}:`, error)
      }
    }

    console.log('表情文件应用成功')
  } catch (error) {
    console.error('应用表情文件失败:', error)
    throw error
  }
}

// 播放指定表情
async function playExpression() {
  if (!model || !isModelLoaded.value || !selectedExpression.value) {
    console.warn('模型未加载或未选择表情')
    return
  }

  const expressions = currentConfig.value.expressions
  const selectedExp = expressions.find(exp => exp.file === selectedExpression.value)

  if (!selectedExp) {
    console.warn('未找到选中的表情')
    return
  }

  try {
    console.log(`播放表情: ${selectedExp.name} (${selectedExp.file})`)
    
    // 检查模型是否有预定义的表情
    const hasPreDefinedExpressions = model.internalModel.settings.expressions &&
                                   model.internalModel.settings.expressions.length > 0

    if (hasPreDefinedExpressions) {
      // 对于预定义表情，不需要重置参数，直接应用表情
      // 对于有预定义表情的模型（如 hibiki, natori）
      const expressions = model.internalModel.settings.expressions
      const foundExpression = expressions.find(exp => exp.File === selectedExpression.value)

      if (foundExpression) {
        console.log(`使用预定义表情: ${foundExpression.Name}`)

        // 尝试不同的表情应用方法
        try {
          // 方法1: 直接使用表情管理器
          const expressionManager = model.internalModel.motionManager.expressionManager
          if (expressionManager && typeof expressionManager.setExpression === 'function') {
            expressionManager.setExpression(foundExpression.Name)
            console.log(`通过表情管理器设置表情: ${foundExpression.Name}`)
          } else {
            // 方法2: 使用模型的表情方法
            const result = model.expression(foundExpression.Name)
            if (result && typeof result.play === 'function') {
              result.play()
              console.log(`通过 expression().play() 设置表情: ${foundExpression.Name}`)
            } else {
              console.log(`通过 expression() 设置表情: ${foundExpression.Name}`)
            }
          }
        } catch (error) {
          console.error('设置预定义表情失败:', error)
          // 备用方法：尝试使用索引
          if (selectedExp.index !== undefined) {
            model.expression(selectedExp.index)
          }
        }
      } else {
        // 尝试使用索引
        if (selectedExp.index !== undefined) {
          model.expression(selectedExp.index)
        } else {
          console.warn('在预定义表情中未找到指定表情')
        }
      }
    } else {
      // 对于只有独立表情文件的模型（如 idol, lanhei）
      console.log('使用独立表情文件')

      // 第一步：重置所有表情参数
      await resetAllExpressionParameters()

      // 第二步：应用新的表情
      await applyExpressionFromFile(selectedExpression.value)
    }

    console.log('表情切换成功')
  } catch (error) {
    console.error('表情切换失败:', error)
  }
}

// 播放随机表情
async function playRandomExpression() {
  if (!model || !isModelLoaded.value) {
    console.warn('模型还未加载完成')
    return
  }

  const expressions = currentConfig.value.expressions
  if (expressions.length === 0) return

  const randomExp = expressions[randomInt(0, expressions.length - 1)]
  selectedExpression.value = randomExp.file

  // 调用修复后的 playExpression 函数
  await playExpression()
}

// 重置表情到默认状态
async function resetExpression() {
  if (!model || !isModelLoaded.value) {
    console.warn('模型还未加载完成')
    return
  }

  try {
    console.log('重置表情到默认状态')

    // 检查模型是否有预定义的表情
    const hasPreDefinedExpressions = model.internalModel.settings.expressions &&
                                   model.internalModel.settings.expressions.length > 0

    if (hasPreDefinedExpressions) {
      // 对于有预定义表情的模型，使用表情管理器重置
      try {
        model.internalModel.motionManager.expressionManager.setExpression(null)
        console.log('使用表情管理器重置成功')
      } catch (error) {
        // 备用方法：设置第一个表情或随机表情
        model.expression(0)
        console.log('使用备用方法重置表情')
      }
    } else {
      // 对于只有独立表情文件的模型，重置所有参数到默认值
      await resetAllExpressionParameters()
      console.log('重置独立表情参数成功')
    }

    // 清除选中的表情
    selectedExpression.value = ''

    console.log('表情重置成功')
  } catch (error) {
    console.error('表情重置失败:', error)
  }
}

// 手动重新调整模型大小和位置
function refitModel() {
  if (!model || !isModelLoaded.value || !app) {
    console.warn('模型未加载或应用未初始化')
    return
  }

  try {
    console.log('手动重新调整模型')
    const { width: canvasWidth, height: canvasHeight } = getCanvasLogicalSize()
    console.log(`手动调整 Canvas 逻辑尺寸: ${canvasWidth} x ${canvasHeight}`)
    autoFitModel(model, canvasWidth, canvasHeight)
    console.log('模型重新调整完成')
  } catch (error) {
    console.error('重新调整模型失败:', error)
  }
}

// ==================== 音频控制函数 ====================

// 播放指定音频文件
function playAudioFile(soundPath) {
  try {
    // 停止当前音频
    stopAudio()

    // 创建新的音频对象
    const audioPath = `/models/${currentModelName.value}/${soundPath}`
    console.log(`播放音频: ${audioPath}`)

    currentAudio.value = new Audio(audioPath)
    currentAudio.value.volume = audioVolume.value

    // 设置音频事件监听器
    setupAudioEventListeners()

    // 播放音频
    currentAudio.value.play()
    isPlaying.value = true
    isPaused.value = false

    console.log('音频播放成功')
  } catch (error) {
    console.error('播放音频失败:', error)
  }
}

// 播放选中的音频
function playSelectedAudio() {
  if (!selectedSound.value) {
    console.warn('未选择音频文件')
    return
  }

  playAudioFile(selectedSound.value)
}

// 暂停音频
function pauseAudio() {
  if (currentAudio.value && isPlaying.value) {
    currentAudio.value.pause()
    isPlaying.value = false
    isPaused.value = true
    console.log('音频已暂停')
  }
}

// 恢复播放音频
function resumeAudio() {
  if (currentAudio.value && isPaused.value) {
    currentAudio.value.play()
    isPlaying.value = true
    isPaused.value = false
    console.log('音频已恢复播放')
  }
}

// 停止音频
function stopAudio() {
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value.currentTime = 0
    isPlaying.value = false
    isPaused.value = false
    audioProgress.value = 0
    audioCurrentTime.value = 0
    console.log('音频已停止')
  }
}

// 设置音频音量
function setVolume(volume) {
  audioVolume.value = volume

  // 同时设置 SoundManager 的全局音量
  SoundManager.volume = volume

  if (currentAudio.value) {
    currentAudio.value.volume = volume
  }
}

// 设置音频播放位置
function seekAudio(progress) {
  if (currentAudio.value && audioDuration.value > 0) {
    const newTime = (progress / 100) * audioDuration.value
    currentAudio.value.currentTime = newTime
    audioProgress.value = progress
    audioCurrentTime.value = newTime
  }
}

// 设置音频事件监听器
function setupAudioEventListeners() {
  if (!currentAudio.value) return

  // 音频加载完成
  currentAudio.value.addEventListener('loadedmetadata', () => {
    audioDuration.value = currentAudio.value.duration
  })

  // 音频播放进度更新
  currentAudio.value.addEventListener('timeupdate', () => {
    if (currentAudio.value) {
      audioCurrentTime.value = currentAudio.value.currentTime
      if (audioDuration.value > 0) {
        audioProgress.value = (currentAudio.value.currentTime / audioDuration.value) * 100
      }
    }
  })

  // 音频播放结束
  currentAudio.value.addEventListener('ended', () => {
    isPlaying.value = false
    isPaused.value = false
    audioProgress.value = 0
    audioCurrentTime.value = 0
    console.log('音频播放完成')
  })

  // 音频播放错误
  currentAudio.value.addEventListener('error', (e) => {
    console.error('音频播放错误:', e)
    isPlaying.value = false
    isPaused.value = false
  })
}

// 格式化时间显示
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <div style="padding: 20px; font-family: Arial, sans-serif;">
    <!-- 模型选择区域 -->
    <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h3 style="margin: 0 0 10px 0; color: #333;">模型选择</h3>
      <div style="display: flex; align-items: center; gap: 10px;">
        <label for="modelSelect" style="font-weight: bold;">选择模型:</label>
        <select
          id="modelSelect"
          v-model="currentModelName"
          @change="changeModel"
          style="padding: 5px 10px; border: 1px solid #ccc; border-radius: 4px;"
        >
          <option value="idol">{{ modelConfigs.idol.name }}</option>
          <option value="lanhei">{{ modelConfigs.lanhei.name }}</option>
          <option value="hibiki">{{ modelConfigs.hibiki.name }}</option>
          <option value="hiyori">{{ modelConfigs.hiyori.name }}</option>
          <option value="mark">{{ modelConfigs.mark.name }}</option>
          <option value="natori">{{ modelConfigs.natori.name }}</option>
          <option value="kei_basic">{{ modelConfigs.kei_basic.name }}</option>
          <option value="kei_vowels">{{ modelConfigs.kei_vowels.name }}</option>
        </select>
        <span v-if="!isModelLoaded" style="color: #666; font-size: 14px;">加载中...</span>
        <span v-else style="color: #28a745; font-size: 14px;">✓ 已加载</span>
      </div>
    </div>

    <!-- Live2D 画布 -->
    <div style="text-align: center; margin-bottom: 20px;">
      <canvas
        style="border: 2px solid #333; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"
        ref="canvas"
        width="600"
        height="600"
      ></canvas>
    </div>

    <!-- 控制面板 -->
    <div class="control-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
      <!-- 动作控制 -->
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h4 style="margin: 0 0 15px 0; color: #333;">动作控制</h4>

        <div style="margin-bottom: 10px;">
          <label for="motionSelect" style="display: block; margin-bottom: 5px; font-weight: bold;">选择动作:</label>
          <select
            id="motionSelect"
            v-model="selectedMotion"
            :disabled="!isModelLoaded"
            style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
          >
            <option value="">-- 请选择动作 --</option>
            <option
              v-for="motion in currentConfig.motions"
              :key="motion.file"
              :value="motion.file"
            >
              {{ motion.name }}
            </option>
          </select>
        </div>

        <div style="display: flex; gap: 10px;">
          <button
            @click="playMotion"
            :disabled="!isModelLoaded || !selectedMotion"
            style="flex: 1; padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
            :style="{ opacity: (!isModelLoaded || !selectedMotion) ? 0.5 : 1 }"
          >
            播放动作
          </button>
          <button
            @click="playRandomMotion"
            :disabled="!isModelLoaded"
            style="flex: 1; padding: 8px 16px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
            :style="{ opacity: !isModelLoaded ? 0.5 : 1 }"
          >
            随机动作
          </button>
        </div>
      </div>

      <!-- 表情控制 -->
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h4 style="margin: 0 0 15px 0; color: #333;">表情控制</h4>

        <div style="margin-bottom: 10px;">
          <label for="expressionSelect" style="display: block; margin-bottom: 5px; font-weight: bold;">选择表情:</label>
          <select
            id="expressionSelect"
            v-model="selectedExpression"
            :disabled="!isModelLoaded"
            style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
          >
            <option value="">-- 请选择表情 --</option>
            <option
              v-for="expression in currentConfig.expressions"
              :key="expression.file"
              :value="expression.file"
            >
              {{ expression.name }}
            </option>
          </select>
        </div>

        <div style="display: flex; gap: 10px;">
          <button
            @click="playExpression"
            :disabled="!isModelLoaded || !selectedExpression"
            style="flex: 1; padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
            :style="{ opacity: (!isModelLoaded || !selectedExpression) ? 0.5 : 1 }"
          >
            播放表情
          </button>
          <button
            @click="playRandomExpression"
            :disabled="!isModelLoaded"
            style="flex: 1; padding: 8px 16px; background-color: #ffc107; color: #212529; border: none; border-radius: 4px; cursor: pointer;"
            :style="{ opacity: !isModelLoaded ? 0.5 : 1 }"
          >
            随机表情
          </button>
          <button
            @click="resetExpression"
            :disabled="!isModelLoaded"
            style="flex: 1; padding: 8px 16px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
            :style="{ opacity: !isModelLoaded ? 0.5 : 1 }"
          >
            重置表情
          </button>
        </div>
      </div>

      <!-- 音频控制 -->
      <div v-if="hasAudioSupport" style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h4 style="margin: 0 0 15px 0; color: #333;">音频控制</h4>

        <div style="margin-bottom: 15px;">
          <label for="soundSelect" style="display: block; margin-bottom: 5px; font-weight: bold;">选择音频:</label>
          <select
            id="soundSelect"
            v-model="selectedSound"
            :disabled="!isModelLoaded"
            style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
          >
            <option value="">-- 请选择音频 --</option>
            <option
              v-for="sound in currentConfig.sounds"
              :key="sound.file"
              :value="sound.file"
            >
              {{ sound.name }}
            </option>
          </select>
        </div>

        <!-- 播放控制按钮 -->
        <div style="display: flex; gap: 8px; margin-bottom: 15px;">
          <button
            @click="playSelectedAudio"
            :disabled="!isModelLoaded || !selectedSound"
            style="flex: 1; padding: 6px 12px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
            :style="{ opacity: (!isModelLoaded || !selectedSound) ? 0.5 : 1 }"
          >
            ▶️ 播放
          </button>
          <button
            @click="isPaused ? resumeAudio() : pauseAudio()"
            :disabled="!isModelLoaded || !currentAudio"
            style="flex: 1; padding: 6px 12px; background-color: #ffc107; color: #212529; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
            :style="{ opacity: (!isModelLoaded || !currentAudio) ? 0.5 : 1 }"
          >
            {{ isPaused ? '▶️ 继续' : '⏸️ 暂停' }}
          </button>
          <button
            @click="stopAudio"
            :disabled="!isModelLoaded || !currentAudio"
            style="flex: 1; padding: 6px 12px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
            :style="{ opacity: (!isModelLoaded || !currentAudio) ? 0.5 : 1 }"
          >
            ⏹️ 停止
          </button>
        </div>

        <!-- 音量控制 -->
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 12px;">
            音量: {{ Math.round(audioVolume * 100) }}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            v-model="audioVolume"
            @input="setVolume(audioVolume)"
            style="width: 100%;"
          />
        </div>

        <!-- 播放进度 -->
        <div v-if="currentAudio" style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 12px;">
            进度: {{ formatTime(audioCurrentTime) }} / {{ formatTime(audioDuration) }}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            v-model="audioProgress"
            @input="seekAudio(audioProgress)"
            style="width: 100%;"
          />
        </div>

        <!-- 播放状态 -->
        <div style="text-align: center; font-size: 12px; color: #666;">
          <span v-if="isPlaying" style="color: #28a745;">🎵 正在播放</span>
          <span v-else-if="isPaused" style="color: #ffc107;">⏸️ 已暂停</span>
          <span v-else style="color: #6c757d;">⏹️ 已停止</span>
        </div>
      </div>

      <!-- 无音频支持时的占位 -->
      <div v-else style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f8f9fa; opacity: 0.6;">
        <h4 style="margin: 0 0 15px 0; color: #6c757d;">音频控制</h4>
        <p style="margin: 0; color: #6c757d; font-size: 14px; text-align: center;">
          当前模型不支持音频功能
        </p>
      </div>
    </div>

    <!-- 额外控制按钮 -->
    <div v-if="isModelLoaded" style="margin-top: 20px; text-align: center;">
      <button
        @click="refitModel"
        style="padding: 8px 16px; background-color: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;"
      >
        🔄 重新调整模型大小
      </button>
      <span style="font-size: 12px; color: #666;">
        如果模型显示异常，点击此按钮重新调整
      </span>
    </div>

    <!-- 状态信息 -->
    <div v-if="isModelLoaded" style="margin-top: 20px; padding: 10px; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; color: #155724;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 14px;">
        <div><strong>当前模型:</strong> {{ currentConfig.name }}</div>
        <div><strong>动作数量:</strong> {{ currentConfig.motions.length }}</div>
        <div><strong>表情数量:</strong> {{ currentConfig.expressions.length }}</div>
        <div><strong>音频数量:</strong> {{ currentConfig.sounds.length }}</div>
        <div><strong>Canvas尺寸:</strong> 640x480</div>
        <div v-if="model"><strong>模型缩放:</strong> {{ model.scale.x.toFixed(4) }}</div>
        <div v-if="model"><strong>模型位置:</strong> ({{ model.position.x.toFixed(0) }}, {{ model.position.y.toFixed(0) }})</div>
        <div><strong>音频支持:</strong> {{ hasAudioSupport ? '✅ 是' : '❌ 否' }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 按钮悬停效果 */
button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
}

button:active:not(:disabled) {
  transform: translateY(0);
}

/* 选择框样式 */
select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .control-grid {
    grid-template-columns: 1fr 1fr !important;
  }
}

@media (max-width: 768px) {
  .control-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
