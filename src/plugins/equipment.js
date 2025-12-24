// 装备强化和洗练相关配置
import { percentageStats } from './stats'

// 强化等级配置
const enhanceConfig = {
  maxLevel: 100, // 最大强化等级
  baseSuccessRate: 1, // 基础成功率
  costPerLevel: 10, // 每级消耗的强化石数量
  statIncrease: 0.1 // 每级属性提升比例（10%）
}

// 洗练配置
const reforgeConfig = {
  costPerAttempt: 10, // 每次洗练消耗的洗练石数量
  minVariation: -0.3, // 最小属性变化（-30%）
  maxVariation: 0.3, // 最大属性变化（+30%）
  newStatChance: 0.3 // 更换属性的概率（30%）
}

// 可洗练的属性池
const reforgeableStats = {
  weapon: ['attack', 'critRate', 'critDamageBoost'],
  head: ['defense', 'health', 'stunResist'],
  body: ['defense', 'health', 'finalDamageReduce'],
  legs: ['defense', 'speed', 'dodgeRate'],
  feet: ['defense', 'speed', 'dodgeRate'],
  shoulder: ['defense', 'health', 'counterRate'],
  hands: ['attack', 'critRate', 'comboRate'],
  wrist: ['defense', 'counterRate', 'vampireRate'],
  necklace: ['health', 'healBoost', 'spiritRate'],
  ring1: ['attack', 'critDamageBoost', 'finalDamageBoost'],
  ring2: ['defense', 'critDamageReduce', 'resistanceBoost'],
  belt: ['health', 'defense', 'combatBoost'],
  artifact: ['attack', 'critRate', 'comboRate']
}

// 强化装备
function enhanceEquipment(equipment, playerReinforceStones) {
  if (!equipment || !equipment.stats) {
    return { success: false, message: '无效的装备' }
  }
  const currentLevel = equipment.enhanceLevel || 0
  if (currentLevel >= enhanceConfig.maxLevel) {
    return { success: false, message: '装备已达到最大强化等级' }
  }
  const cost = enhanceConfig.costPerLevel * (currentLevel + 1)
  if (playerReinforceStones < cost) {
    return { success: false, message: '强化石不足' }
  }
  // 计算成功率
  const successRate = enhanceConfig.baseSuccessRate - currentLevel * 0.05
  const isSuccess = Math.random() < successRate
  if (!isSuccess) {
    return {
      success: false,
      message: '强化失败',
      cost,
      oldStats: { ...equipment.stats },
      newStats: { ...equipment.stats }
    }
  }
  // 保存旧属性用于对比
  const oldStats = { ...equipment.stats }
  // 提升装备属性
  Object.keys(equipment.stats).forEach(stat => {
    if (typeof equipment.stats[stat] === 'number') {
      equipment.stats[stat] *= 1 + enhanceConfig.statIncrease
      // 对百分比属性进行特殊处理
      if (percentageStats.includes(stat)) {
        equipment.stats[stat] = Number(equipment.stats[stat].toFixed(4))
      } else {
        equipment.stats[stat] = Math.round(equipment.stats[stat])
      }
    }
  })
  // 更新强化等级
  equipment.enhanceLevel = (equipment.enhanceLevel || 0) + 1
  return {
    success: true,
    message: '强化成功',
    cost,
    oldStats,
    newStats: equipment.stats,
    newLevel: equipment.enhanceLevel
  }
}

function reforgeEquipment(equipment, playerSpiritStones, confirmNewStats = true) {
  if (!equipment || !equipment.stats || !equipment.type) {
    return { success: false, message: '无效的装备' }
  }
  if (playerSpiritStones < reforgeConfig.costPerAttempt) {
    return { success: false, message: '洗练石不足' }
  }
  const oldStats = { ...equipment.stats }
  const availableStats = reforgeableStats[equipment.type]
  const tempStats = { ...equipment.stats }
  const originStats = Object.keys(tempStats)
  // 生成要处理的属性索引（1-3个随机）
  const modifyIndexes = [
    ...new Set(
      Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => Math.floor(Math.random() * originStats.length))
    )
  ].slice(0, 3) // 确保最多处理3个属性
  modifyIndexes.forEach(index => {
    const originStat = originStats[index]
    let currentStat = originStat
    const baseValue = tempStats[originStat]
    // Step 1: 尝试替换属性
    if (Math.random() < reforgeConfig.newStatChance) {
      // 过滤可用属性（不包含现有属性）
      const availableNew = availableStats.filter(s => !originStats.includes(s) && s !== originStat)
      if (availableNew.length > 0) {
        const newStat = availableNew[Math.floor(Math.random() * availableNew.length)]
        // 替换属性名但保留当前数值（会在步骤2中调整）
        delete tempStats[originStat]
        currentStat = newStat
      }
    }
    // Step 2：强制数值调整（基于原始值±30%）
    const delta = Math.random() * 0.6 - 0.3 // [-0.3, 0.3]
    const newValue = baseValue * (1 + delta)
    // 根据属性类型处理数值精度
    if (percentageStats.includes(currentStat)) {
      tempStats[currentStat] = Number(Math.min(Math.max(newValue, baseValue * 0.7), baseValue * 1.3).toFixed(4))
    } else {
      tempStats[currentStat] = Math.min(
        Math.max(Math.round(newValue), Math.round(baseValue * 0.7)),
        Math.round(baseValue * 1.3)
      )
    }
  })
  // 强制属性数量校验
  if (Object.keys(tempStats).length !== originStats.length) {
    console.error('属性数量异常', { old: originStats, new: tempStats })
    return {
      success: false,
      message: '洗练过程出现异常',
      cost: 0,
      oldStats,
      newStats: oldStats
    }
  }
  if (confirmNewStats) {
    equipment.stats = { ...tempStats }
  }
  return {
    success: true,
    message: confirmNewStats ? '洗练成功' : '保留原有属性',
    cost: reforgeConfig.costPerAttempt,
    oldStats,
    newStats: tempStats,
    confirmed: confirmNewStats
  }
}

// 装备品质配置
const equipmentQualities = {
  common: { name: '凡品', color: '#9e9e9e', statMod: 1.0, maxStatMod: 1.5 },
  uncommon: { name: '下品', color: '#4caf50', statMod: 1.2, maxStatMod: 2.0 },
  rare: { name: '中品', color: '#2196f3', statMod: 1.5, maxStatMod: 2.5 },
  epic: { name: '上品', color: '#9c27b0', statMod: 2.0, maxStatMod: 3.0 },
  legendary: { name: '极品', color: '#ff9800', statMod: 2.5, maxStatMod: 3.5 },
  mythic: { name: '仙品', color: '#e91e63', statMod: 3.0, maxStatMod: 4.0 }
}

// 装备类型配置
const equipmentTypes = {
  weapon: {
    name: '武器',
    slot: 'weapon',
    prefixes: ['九天', '太虚', '混沌', '玄天', '紫霄', '青冥', '赤炎', '幽冥']
  },
  head: { name: '头部', slot: 'head', prefixes: ['天灵', '玄冥', '紫金', '青玉', '赤霞', '幽月', '星辰', '云霄'] },
  body: { name: '衣服', slot: 'body', prefixes: ['九霄', '太素', '混元', '玄阳', '紫薇', '青龙', '赤凤', '幽冥'] },
  legs: { name: '裤子', slot: 'legs', prefixes: ['天罡', '玄武', '紫电', '青云', '赤阳', '幽灵', '星光', '云雾'] },
  feet: { name: '鞋子', slot: 'feet', prefixes: ['天行', '玄风', '紫霞', '青莲', '赤焰', '幽影', '星步', '云踪'] },
  shoulder: {
    name: '肩甲',
    slot: 'shoulder',
    prefixes: ['天护', '玄甲', '紫雷', '青锋', '赤羽', '幽岚', '星芒', '云甲']
  },
  hands: { name: '手套', slot: 'hands', prefixes: ['天罗', '玄玉', '紫晶', '青钢', '赤金', '幽银', '星铁', '云纹'] },
  wrist: { name: '护腕', slot: 'wrist', prefixes: ['天绝', '玄铁', '紫玉', '青石', '赤铜', '幽钢', '星晶', '云纱'] },
  necklace: {
    name: '项链',
    slot: 'necklace',
    prefixes: ['天珠', '玄圣', '紫灵', '青魂', '赤心', '幽魄', '星魂', '云珠']
  },
  ring1: { name: '戒指1', slot: 'ring1', prefixes: ['天命', '玄命', '紫命', '青命', '赤命', '幽命', '星命', '云命'] },
  ring2: { name: '戒指2', slot: 'ring2', prefixes: ['天道', '玄道', '紫道', '青道', '赤道', '幽道', '星道', '云道'] },
  belt: { name: '腰带', slot: 'belt', prefixes: ['天系', '玄系', '紫系', '青系', '赤系', '幽系', '星系', '云系'] },
  artifact: {
    name: '法宝',
    slot: 'artifact',
    prefixes: ['天宝', '玄宝', '紫宝', '青宝', '赤宝', '幽宝', '星宝', '云宝']
  }
}

// 装备基础属性配置
const equipmentBaseStats = {
  weapon: {
    attack: { name: '攻击', min: 10, max: 20 },
    critRate: { name: '暴击率', min: 0.05, max: 0.1 },
    critDamageBoost: { name: '暴击伤害', min: 0.1, max: 0.3 }
  },
  head: {
    defense: { name: '防御', min: 5, max: 10 },
    health: { name: '生命', min: 50, max: 100 },
    stunResist: { name: '抗眩晕', min: 0.05, max: 0.1 }
  },
  body: {
    defense: { name: '防御', min: 8, max: 15 },
    health: { name: '生命', min: 80, max: 150 },
    finalDamageReduce: { name: '最终减伤', min: 0.05, max: 0.1 }
  },
  legs: {
    defense: { name: '防御', min: 6, max: 12 },
    speed: { name: '速度', min: 5, max: 10 },
    dodgeRate: { name: '闪避率', min: 0.05, max: 0.1 }
  },
  feet: {
    defense: { name: '防御', min: 4, max: 8 },
    speed: { name: '速度', min: 8, max: 15 },
    dodgeRate: { name: '闪避率', min: 0.05, max: 0.1 }
  },
  shoulder: {
    defense: { name: '防御', min: 5, max: 10 },
    health: { name: '生命', min: 40, max: 80 },
    counterRate: { name: '反击率', min: 0.05, max: 0.1 }
  },
  hands: {
    attack: { name: '攻击', min: 5, max: 10 },
    critRate: { name: '暴击率', min: 0.03, max: 0.08 },
    comboRate: { name: '连击率', min: 0.05, max: 0.1 }
  },
  wrist: {
    defense: { name: '防御', min: 3, max: 8 },
    counterRate: { name: '反击率', min: 0.05, max: 0.1 },
    vampireRate: { name: '吸血率', min: 0.05, max: 0.1 }
  },
  necklace: {
    health: { name: '生命', min: 60, max: 120 },
    healBoost: { name: '强化治疗', min: 0.1, max: 0.2 },
    spiritRate: { name: '灵力获取', min: 0.1, max: 0.2 }
  },
  ring1: {
    attack: { name: '攻击', min: 5, max: 10 },
    critDamageBoost: { name: '暴击伤害', min: 0.1, max: 0.2 },
    finalDamageBoost: { name: '最终增伤', min: 0.05, max: 0.1 }
  },
  ring2: {
    defense: { name: '防御', min: 5, max: 10 },
    critDamageReduce: { name: '爆伤减免', min: 0.1, max: 0.2 },
    resistanceBoost: { name: '抗性提升', min: 0.05, max: 0.1 }
  },
  belt: {
    health: { name: '生命', min: 40, max: 80 },
    defense: { name: '防御', min: 4, max: 8 },
    combatBoost: { name: '战斗属性', min: 0.05, max: 0.1 }
  },
  artifact: {
    attack: { name: '攻击力', min: 0.1, max: 0.3 },
    critRate: { name: '暴击率', min: 0.1, max: 0.3 },
    comboRate: { name: '连击率', min: 0.1, max: 0.3 }
  }
}

/**
 * 生成装备名称
 * @param {string} type 装备类型
 * @param {string} quality 装备品质
 * @returns {string} 装备名称
 */
function generateEquipmentName(type, quality) {
  const typeInfo = equipmentTypes[type]
  const prefix = typeInfo.prefixes[Math.floor(Math.random() * typeInfo.prefixes.length)]
  const suffixes = ['', '·真', '·极', '·道', '·天', '·仙', '·圣', '·神']
  const suffix =
    quality === 'mythic'
      ? suffixes[7]
      : quality === 'legendary'
        ? suffixes[6]
        : quality === 'epic'
          ? suffixes[5]
          : quality === 'rare'
            ? suffixes[4]
            : quality === 'uncommon'
              ? suffixes[3]
              : suffixes[0]
  return `${prefix}${typeInfo.name}${suffix}`
}

/**
 * 生成随机装备
 * @param {number} level 玩家等级
 * @param {string} type 装备类型 (可选)
 * @param {string} quality 装备品质 (可选)
 * @param {boolean} isMax 是否产出满属性 (可选)
 * @returns {object} 装备对象
 */
function generateEquipment(level, type = null, quality = null, isMax = false) {
  // 随机选择装备类型
  if (!type) {
    const types = Object.keys(equipmentTypes)
    type = types[Math.floor(Math.random() * types.length)]
  }
  // 随机选择品质，使用固定概率
  if (!quality) {
    const roll = Math.random()
    if (roll < 0.35) quality = 'common'
    else if (roll < 0.65) quality = 'uncommon'
    else if (roll < 0.82) quality = 'rare'
    else if (roll < 0.93) quality = 'epic'
    else if (roll < 0.98) quality = 'legendary'
    else quality = 'mythic'
  }
  // 随机生成装备等级（1到玩家当前等级之间），如果是满属性则直接使用当前等级
  const randomLevel = isMax ? level : (Math.floor(Math.random() * level) + 1)
  // 基础属性计算
  const baseStats = {}
  const qualityMod = equipmentQualities[quality].statMod
  const levelMod = 1 + randomLevel * 0.1
  Object.entries(equipmentBaseStats[type]).forEach(([stat, config]) => {
    const base = isMax ? config.max : (config.min + Math.random() * (config.max - config.min))
    const value = base * qualityMod * levelMod
    // 对百分比属性进行特殊处理
    if (percentageStats.includes(stat)) {
      baseStats[stat] = Number(value.toFixed(4))
    } else {
      baseStats[stat] = Math.round(value)
    }
  })
  return {
    id: Date.now() + Math.random(),
    name: generateEquipmentName(type, quality),
    type,
    slot: type, // 添加slot属性，用于装备系统
    quality,
    level: randomLevel,
    requiredRealm: randomLevel,
    stats: baseStats,
    equipType: type,
    qualityInfo: equipmentQualities[quality]
  }
}

export {
  enhanceConfig,
  reforgeConfig,
  reforgeableStats,
  enhanceEquipment,
  reforgeEquipment,
  equipmentQualities,
  equipmentTypes,
  equipmentBaseStats,
  generateEquipmentName,
  generateEquipment
}
