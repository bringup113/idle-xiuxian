/**
 * 灵宠系统核心插件
 * 处理灵宠的生成、属性计算和配置
 */

// 灵宠品质配置
export const petRarities = {
    divine: {
        name: '神品',
        color: '#FF0000',
        probability: 0.002,
        essenceBonus: 50
    },
    celestial: {
        name: '仙品',
        color: '#FFD700',
        probability: 0.0581,
        essenceBonus: 30
    },
    mystic: {
        name: '玄品',
        color: '#9932CC',
        probability: 0.1601,
        essenceBonus: 20
    },
    spiritual: {
        name: '灵品',
        color: '#1E90FF',
        probability: 0.2801,
        essenceBonus: 10
    },
    mortal: {
        name: '凡品',
        color: '#32CD32',
        probability: 0.4997,
        essenceBonus: 5
    }
}

// 灵宠池配置
export const petPool = {
    divine: [
        { name: '玄武', description: '北方守护神兽' },
        { name: '白虎', description: '西方守护神兽' },
        { name: '朱雀', description: '南方守护神兽' },
        { name: '青龙', description: '东方守护神兽' },
        { name: '应龙', description: '上古神龙，掌控风雨' },
        { name: '麒麟', description: '祥瑞之兽，通晓万物' },
        { name: '饕餮', description: '贪婪之兽，吞噬万物，象征无尽的欲望' },
        { name: '穷奇', description: '邪恶之兽，背信弃义，象征混乱与背叛' },
        { name: '梼杌', description: '凶暴之兽，顽固不化，象征无法驯服的野性' },
        { name: '混沌', description: '无序之兽，无形无相，象征原始的混乱' }
    ],
    celestial: [
        { name: '囚牛', description: '龙之长子，喜好音乐，常立于琴头' },
        { name: '睚眦', description: '龙之次子，性格刚烈，嗜杀好斗，常刻于刀剑之上' },
        { name: '嘲风', description: '龙之三子，形似兽，喜好冒险，常立于殿角' },
        { name: '蒲牢', description: '龙之四子，形似龙而小，性好鸣，常铸于钟上' },
        { name: '狻犴', description: '龙之五子，形似狮子，喜静好坐，常立于香炉' },
        { name: '霸下', description: '龙之六子，形似龟，力大无穷，常背负石碑' },
        { name: '狴犴', description: '龙之七子，形似虎，明辨是非，常立于狱门' },
        { name: '负屃', description: '龙之八子，形似龙，雅好诗文，常盘于碑顶' },
        { name: '螭吻', description: '龙之九子，形似鱼，能吞火，常立于屋脊' }
    ],
    mystic: [
        { name: '火凤凰', description: '浴火重生的永恒之鸟' },
        { name: '雷鹰', description: '雷电的猛禽' },
        { name: '冰狼', description: '冰原霸主' },
        { name: '岩龟', description: '坚不可摧的守护者' }
    ],
    spiritual: [
        { name: '玄龟', description: '擅长防御的水系灵宠' },
        { name: '风隼', description: '速度极快的飞行灵宠' },
        { name: '地甲', description: '坚固的大地守护者' },
        { name: '云豹', description: '敏敏捷的猎手' }
    ],
    mortal: [
        { name: '灵猫', description: '敏捷的小型灵宠' },
        { name: '幻蝶', description: '美丽的蝴蝶灵宠' },
        { name: '火鼠', description: '活泼的啮齿类灵宠' },
        { name: '草兔', description: '温顺的兔类灵宠' }
    ]
}

// 灵宠倍率系数
export const getRarityMultiplier = rarity => {
    const multipliers = {
        divine: { base: 5, percent: 2, aptitude: { min: 8, max: 10 } },
        celestial: { base: 4, percent: 1.8, aptitude: { min: 6, max: 8 } },
        mystic: { base: 3, percent: 1.6, aptitude: { min: 4, max: 6 } },
        spiritual: { base: 2, percent: 1.4, aptitude: { min: 2, max: 4 } },
        mortal: { base: 1, percent: 1, aptitude: { min: 1, max: 2 } }
    }
    return multipliers[rarity] || multipliers.mortal
}

// 灵宠属性配置
export const petStatConfig = {
    // 基础属性
    attack: { min: 10, max: 15, useBase: true },
    health: { min: 100, max: 120, useBase: true },
    defense: { min: 5, max: 8, useBase: true },
    speed: { min: 10, max: 15, useBase: true, multiplier: 0.6 },
    // 战斗属性
    critRate: { min: 0.05, max: 0.1, isPercentage: true },
    comboRate: { min: 0.05, max: 0.1, isPercentage: true },
    counterRate: { min: 0.05, max: 0.1, isPercentage: true },
    stunRate: { min: 0.05, max: 0.1, isPercentage: true },
    dodgeRate: { min: 0.05, max: 0.1, isPercentage: true },
    vampireRate: { min: 0.05, max: 0.1, isPercentage: true },
    // 抗性
    critResist: { min: 0.05, max: 0.1, isPercentage: true },
    comboResist: { min: 0.05, max: 0.1, isPercentage: true },
    counterResist: { min: 0.05, max: 0.1, isPercentage: true },
    stunResist: { min: 0.05, max: 0.1, isPercentage: true },
    dodgeResist: { min: 0.05, max: 0.1, isPercentage: true },
    vampireResist: { min: 0.05, max: 0.1, isPercentage: true },
    // 特殊
    healBoost: { min: 0.05, max: 0.1, isPercentage: true },
    critDamageBoost: { min: 0.05, max: 0.1, isPercentage: true },
    critDamageReduce: { min: 0.05, max: 0.1, isPercentage: true },
    finalDamageBoost: { min: 0.05, max: 0.1, isPercentage: true },
    finalDamageReduce: { min: 0.05, max: 0.1, isPercentage: true },
    combatBoost: { min: 0.05, max: 0.1, isPercentage: true },
    resistanceBoost: { min: 0.05, max: 0.1, isPercentage: true }
}

// 灵宠属性成长配置
export const petGrowthConfig = {
    levelFactor: 0.01, // 每级属性提升基础倍率
    starFactor: 0.05,  // 每星资质和基础属性提升倍率
    rarityMultipliers: {
        divine: 2.0,
        celestial: 1.8,
        mystic: 1.6,
        spiritual: 1.4,
        mortal: 1.2
    }
}

/**
 * 生成随机数值
 */
const generateValue = (min, max, isMax, isPercentage) => {
    const value = isMax ? max : (min + Math.random() * (max - min))
    return isPercentage ? Math.min(1, Math.round(value * 100) / 100) : Math.round(value)
}

/**
 * 核心灵宠生成函数
 * @param {string} rarity 品质
 * @param {boolean} isMaxStat 是否生成满属性
 * @returns {object} 灵宠对象
 */
export const generatePet = (rarity, isMaxStat = false) => {
    const multiplier = getRarityMultiplier(rarity)
    const pool = petPool[rarity]
    const petBase = pool[Math.floor(Math.random() * pool.length)]

    // 1. 计算资质 (力量, 敏捷, 智力, 体质)
    const aptConfig = multiplier.aptitude
    const quality = {
        strength: generateValue(aptConfig.min, aptConfig.max, isMaxStat, false),
        agility: generateValue(aptConfig.min, aptConfig.max, isMaxStat, false),
        intelligence: generateValue(aptConfig.min, aptConfig.max, isMaxStat, false),
        constitution: generateValue(aptConfig.min, aptConfig.max, isMaxStat, false)
    }

    // 2. 计算战斗属性
    const combatAttributes = {}
    Object.entries(petStatConfig).forEach(([key, config]) => {
        if (config.isPercentage) {
            combatAttributes[key] = generateValue(config.min * multiplier.percent, config.max * multiplier.percent, isMaxStat, true)
        } else {
            const baseMultiplier = config.useBase ? multiplier.base : multiplier.percent
            const finalMultiplier = config.multiplier ? baseMultiplier * config.multiplier : baseMultiplier
            combatAttributes[key] = generateValue(config.min * finalMultiplier, config.max * finalMultiplier, isMaxStat, false)
        }
    })

    const upgradeItemCount = {
        divine: 5,
        celestial: 4,
        mystic: 3,
        spiritual: 2,
        mortal: 1
    }

    return {
        ...petBase,
        id: Date.now() + Math.random(),
        rarity,
        type: 'pet',
        quality, // 资质
        power: 0,
        experience: 0,
        maxExperience: 100,
        level: 1,
        star: 0,
        upgradeItems: upgradeItemCount[rarity] || 1,
        combatAttributes
    }
}
