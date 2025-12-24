<template>
  <n-layout>
    <n-layout-header bordered>
      <n-page-header>
        <template #title>抽奖系统</template>
      </n-page-header>
    </n-layout-header>
    <n-layout-content class="gacha-content">
      <n-card :bordered="false">
        <div class="gacha-container">
          <div class="gacha-type-selector">
            <n-radio-group v-model:value="gachaType" name="gachaType">
              <n-radio-button value="all">综合池</n-radio-button>
              <n-radio-button value="equipment">装备池</n-radio-button>
              <n-radio-button value="pet">灵宠池</n-radio-button>
            </n-radio-group>
          </div>
          <div class="spirit-stones">
            <n-statistic label="灵石" :value="playerStore.spiritStones" />
          </div>
          <div class="gacha-item-container">
            <div
              class="gacha-item"
              :class="{
                shake: isShaking,
                open: isOpening
              }"
            >
              {{ types[gachaType] }}
            </div>
          </div>
          <div class="gacha-buttons">
            <n-space vertical>
              <n-space justify="center">
                <n-button
                  type="primary"
                  v-for="(item, index) in [1, 10, 50, 100]"
                  :key="index"
                  @click="performGacha(item)"
                  :disabled="
                    playerStore.spiritStones < (playerStore.wishlistEnabled ? item * 200 : item * 100) || isDrawing
                  "
                >
                  抽{{ item }}次 ({{ playerStore.wishlistEnabled ? item * 200 : item * 100 }}灵石)
                </n-button>
              </n-space>
              <n-space justify="center">
                <n-button quaternary circle size="small" @click="showProbabilityInfo = true">
                  <template #icon>
                    <n-icon>
                      <Help />
                    </n-icon>
                  </template>
                </n-button>
                <n-button quaternary circle size="small" @click="showWishlistSettings = true">
                  <template #icon>
                    <n-icon>
                      <HeartOutline />
                    </n-icon>
                  </template>
                </n-button>
                <n-button quaternary circle size="small" @click="showAutoSettings = true">
                  <template #icon>
                    <n-icon>
                      <SettingsOutline />
                    </n-icon>
                  </template>
                </n-button>
              </n-space>
            </n-space>
          </div>
          <!-- 抽卡结果弹窗 -->
          <n-modal
            v-model:show="showResult"
            preset="dialog"
            title="抽卡结果"
            :style="{ maxWidth: '90vw', width: '800px' }"
          >
            <n-card :bordered="false">
              <!-- 筛选区域 -->
              <div class="filter-section" v-if="gachaType !== 'all'">
                <n-space align="center" justify="center" :wrap="true" :size="16">
                  <n-select
                    v-model:value="selectedQuality"
                    placeholder="装备品质筛选"
                    clearable
                    :options="equipmentQualityOptions"
                    :style="{ width: '180px' }"
                    @update:value="currentPage = 1"
                    v-if="gachaType === 'equipment'"
                  ></n-select>
                  <n-select
                    v-model:value="selectedRarity"
                    placeholder="灵宠品质筛选"
                    clearable
                    :options="petRarityOptions"
                    :style="{ width: '180px' }"
                    @update:value="currentPage = 1"
                    v-if="gachaType === 'pet'"
                  ></n-select>
                </n-space>
              </div>
              <n-space justify="center">
                <n-button
                  type="primary"
                  @click="performGacha(gachaNumber)"
                  :disabled="
                    playerStore.spiritStones < (playerStore.wishlistEnabled ? gachaNumber * 200 : gachaNumber * 100) ||
                    isDrawing
                  "
                >
                  再抽{{ gachaNumber }}次 ({{
                    playerStore.wishlistEnabled ? gachaNumber * 200 : gachaNumber * 100
                  }}灵石)
                </n-button>
              </n-space>
              <div class="result-grid">
                <div
                  v-for="item in currentPageResults"
                  :key="item.id"
                  :class="[
                    'result-item',
                    {
                      'wish-bonus':
                        playerStore.wishlistEnabled &&
                        ((item.qualityInfo && playerStore.selectedWishEquipQuality === item.quality) ||
                          (item.type === 'pet' && playerStore.selectedWishPetRarity === item.rarity))
                    }
                  ]"
                  :style="{
                    borderColor: item.qualityInfo
                      ? item.qualityInfo.color
                      : petRarities[item.rarity]?.color || '#CCCCCC'
                  }"
                >
                  <h4>{{ item.name }}</h4>
                  <p>品质：{{ item.qualityInfo ? item.qualityInfo.name : petRarities[item.rarity]?.name || '未知' }}</p>
                  <p v-if="equipmentTypes2.includes(item.type)">类型：{{ equipmentTypes[item.equipType]?.name }}</p>
                  <p v-else-if="item.type === 'pet'">{{ item.description || '暂无描述' }}</p>
                </div>
              </div>
              <template #footer>
                <n-space justify="center">
                  <n-pagination
                    v-model:page="currentPage"
                    :page-slot="6"
                    :page-count="totalPages"
                    :page-size="pageSize"
                  />
                </n-space>
              </template>
            </n-card>
          </n-modal>
          <!-- 概率说明弹窗 -->
          <n-modal v-model:show="showProbabilityInfo" preset="dialog" title="抽卡概率说明">
            <n-tabs type="segment" animated>
              <!-- 综合池概率 -->
              <n-tab-pane name="all" tab="综合池">
                <n-card>
                  <n-space vertical>
                    <n-divider>综合概率</n-divider>
                    <div class="probability-bars">
                      <div class="prob-item">
                        <div class="prob-label">
                          <span>装备</span>
                        </div>
                        <!-- 总体分布 -->
                        <n-progress
                          type="line"
                          :percentage="50"
                          indicator-placement="inside"
                          color="#2080f0"
                          :height="20"
                          :border-radius="4"
                        />
                        <div class="prob-label">
                          <span>灵宠</span>
                        </div>
                        <n-progress
                          type="line"
                          :percentage="50"
                          indicator-placement="inside"
                          color="#f0a020"
                          :height="20"
                          :border-radius="4"
                        />
                      </div>
                    </div>
                    <!-- 装备概率详情 -->
                    <n-divider>装备品质概率</n-divider>
                    <div class="probability-bars">
                      <div
                        v-for="(probability, quality) in getAllPoolProbabilities(playerStore.level || 1).equipment"
                        :key="quality"
                        class="prob-item"
                      >
                        <div class="prob-label">
                          <span :style="{ color: equipmentQualities[quality].color }">
                            {{ equipmentQualities[quality].name }}
                          </span>
                        </div>
                        <n-progress
                          type="line"
                          :percentage="probability * 100"
                          indicator-placement="inside"
                          :color="equipmentQualities[quality].color"
                          :height="20"
                          :border-radius="4"
                          :show-indicator="true"
                        >
                          <template #indicator>{{ (probability * 100).toFixed(1) }}%</template>
                        </n-progress>
                      </div>
                    </div>
                    <!-- 灵宠概率详情 -->
                    <n-divider>灵宠品质概率</n-divider>
                    <div class="probability-bars">
                      <div
                        v-for="(probability, rarity) in getAllPoolProbabilities(playerStore.level || 1).pet"
                        :key="rarity"
                        class="prob-item"
                      >
                        <div class="prob-label">
                          <span :style="{ color: petRarities[rarity].color }">
                            {{ petRarities[rarity].name }}
                          </span>
                        </div>
                        <n-progress
                          type="line"
                          :percentage="probability * 100"
                          :indicator-placement="'inside'"
                          :color="petRarities[rarity].color"
                          :height="20"
                          :border-radius="4"
                          :show-indicator="true"
                        >
                          <template #indicator>{{ (probability * 100).toFixed(1) }}%</template>
                        </n-progress>
                      </div>
                    </div>
                  </n-space>
                </n-card>
              </n-tab-pane>
              <!-- 装备池概率 -->
              <n-tab-pane name="equipment" tab="装备池">
                <n-card>
                  <div class="probability-bars">
                    <div
                      v-for="(probability, quality) in getAdjustedEquipProbabilities()"
                      :key="quality"
                      class="prob-item"
                    >
                      <div class="prob-label">
                        <span :style="{ color: equipmentQualities[quality].color }">
                          {{ equipmentQualities[quality].name }}
                        </span>
                      </div>
                      <n-progress
                        type="line"
                        :percentage="probability * 100"
                        :indicator-placement="'inside'"
                        :color="equipmentQualities[quality].color"
                        :height="20"
                        :border-radius="4"
                        :class="{
                          'wish-bonus': playerStore.wishlistEnabled && playerStore.selectedWishEquipQuality === quality
                        }"
                        :show-indicator="true"
                      >
                        <template #indicator>{{ (probability * 100).toFixed(1) }}%</template>
                      </n-progress>
                    </div>
                  </div>
                </n-card>
              </n-tab-pane>
              <!-- 灵宠池概率 -->
              <n-tab-pane name="pet" tab="灵宠池">
                <n-card>
                  <div class="probability-bars">
                    <div v-for="(probability, rarity) in getAdjustedPetProbabilities()" :key="rarity" class="prob-item">
                      <div class="prob-label">
                        <span :style="{ color: petRarities[rarity].color }">
                          {{ petRarities[rarity].name }}
                        </span>
                      </div>
                      <n-progress
                        type="line"
                        :percentage="probability * 100"
                        :indicator-placement="'inside'"
                        :class="{
                          'wish-bonus': playerStore.wishlistEnabled && playerStore.selectedWishPetRarity === rarity
                        }"
                        :color="petRarities[rarity].color"
                        :height="20"
                        :border-radius="4"
                        :show-indicator="true"
                      >
                        <template #indicator>{{ (probability * 100).toFixed(1) }}%</template>
                      </n-progress>
                    </div>
                  </div>
                </n-card>
              </n-tab-pane>
            </n-tabs>
          </n-modal>
          <!-- 心愿单设置弹窗 -->
          <n-modal v-model:show="showWishlistSettings" preset="dialog" title="心愿单设置" style="width: 800px">
            <n-card :bordered="false">
              <n-space vertical>
                <n-switch v-model:value="playerStore.wishlistEnabled">
                  <template #checked>心愿单已启用</template>
                  <template #unchecked>心愿单已禁用</template>
                </n-switch>
                <n-divider>装备品质心愿</n-divider>
                <n-select
                  v-model:value="playerStore.selectedWishEquipQuality"
                  :options="equipmentQualityOptions"
                  clearable
                  placeholder="选择装备品质"
                  :disabled="!playerStore.wishlistEnabled"
                >
                  <template #option="{ option }">
                    <span :style="{ color: equipmentQualities[option.value].color }">
                      {{ equipmentQualities[option.value].name }}
                      <n-tag v-if="option.value === playerStore.selectedWishEquipQuality" type="success" size="small">
                        已选择
                      </n-tag>
                    </span>
                  </template>
                </n-select>
                <n-divider>灵宠品质心愿</n-divider>
                <n-select
                  v-model:value="playerStore.selectedWishPetRarity"
                  :options="petRarityOptions"
                  clearable
                  placeholder="选择灵宠品质"
                  :disabled="!playerStore.wishlistEnabled"
                >
                  <template #option="{ option }">
                    <span :style="{ color: petRarities[option.value].color }">
                      {{ petRarities[option.value].name }}
                      <n-tag v-if="option.value === playerStore.selectedWishPetRarity" type="success" size="small">
                        已选择
                      </n-tag>
                    </span>
                  </template>
                </n-select>
                <n-alert type="info" title="心愿单说明">
                  启用心愿单后，所需灵石会翻倍,
                  选中的品质将根据其基础概率获得不同程度的概率提升（基础概率越低，提升越高）。每次只能选择一个装备品质和一个灵宠品质作为心愿。
                </n-alert>
              </n-space>
            </n-card>
          </n-modal>
          <n-modal v-model:show="showAutoSettings" preset="dialog" title="自动处理设置" style="width: 800px">
            <n-card :bordered="false">
              <n-space vertical>
                <n-divider>装备自动出售</n-divider>
                <n-checkbox-group v-model:value="playerStore.autoSellQualities" @update:value="handleAutoSellChange">
                  <n-space wrap>
                    <n-checkbox
                      value="all"
                      :disabled="
                        !!playerStore.autoSellQualities?.length && !playerStore.autoSellQualities.includes('all')
                      "
                    >
                      全部品阶
                    </n-checkbox>
                    <n-checkbox
                      v-for="(quality, key) in equipmentQualities"
                      :key="key"
                      :value="key"
                      :disabled="playerStore.autoSellQualities?.includes('all')"
                    >
                      <span :style="{ color: quality.color }">{{ quality.name }}</span>
                    </n-checkbox>
                  </n-space>
                </n-checkbox-group>
                <n-divider>灵宠自动放生</n-divider>
                <n-checkbox-group
                  v-model:value="playerStore.autoReleaseRarities"
                  @update:value="handleAutoReleaseChange"
                >
                  <n-space wrap>
                    <n-checkbox
                      value="all"
                      :disabled="
                        !!playerStore.autoReleaseRarities?.length && !playerStore.autoReleaseRarities.includes('all')
                      "
                    >
                      全部品质
                    </n-checkbox>
                    <n-checkbox
                      v-for="(rarity, key) in petRarities"
                      :key="key"
                      :value="key"
                      :disabled="playerStore.autoReleaseRarities?.includes('all')"
                    >
                      <span :style="{ color: rarity.color }">{{ rarity.name }}</span>
                    </n-checkbox>
                  </n-space>
                </n-checkbox-group>
              </n-space>
            </n-card>
            <template #footer>
              <n-space justify="end">
                <n-button @click="showAutoSettings = false">关闭</n-button>
              </n-space>
            </template>
          </n-modal>
        </div>
      </n-card>
    </n-layout-content>
  </n-layout>
</template>

<script setup>
  import { usePlayerStore } from '../stores/player'
  import { ref } from 'vue'
  import { useMessage } from 'naive-ui'
  import { Help, HeartOutline, SettingsOutline } from '@vicons/ionicons5'
  import { 
    equipmentTypes, 
    generateEquipment 
  } from '../plugins/equipment'
  import { 
    petRarities, 
    petPool, 
    generatePet 
  } from '../plugins/pets'

  const playerStore = usePlayerStore()
  const message = useMessage()

  const equipmentTypes2 = Object.keys(equipmentTypes)

  // 抽卡类型
  const gachaType = ref('all') // 'equipment'、'pet' 或 'all'
  // 抽卡动画状态
  const isShaking = ref(false)
  const isOpening = ref(false)
  const showResult = ref(false)
  const gachaResult = ref(null)
  const showProbabilityInfo = ref(false)
  const isDrawing = ref(false)

  // 结果弹窗相关
  const currentPage = ref(1)
  const pageSize = ref(12)
  const selectedQuality = ref('all') // 选中的装备品质
  const selectedRarity = ref('all') // 选中的灵宠品质
  const autoReleasedCount = ref(0) // 自动放生灵宠次数
  const autoSoldIncome = ref(0) // 自动出售装备获得的强化石数量
  const autoSoldCount = ref(0) // 自动出售装备的数量
  const showAutoSettings = ref(false) // 自动设置开关
  const showWishlistSettings = ref(false) // 心愿单弹窗

  // 心愿单概率提升配置
  const wishlistBonus = {
    equipment: quality => Math.min(1.0, 0.2 / getEquipProbabilities[quality]),
    pet: rarity => Math.min(1.0, 0.2 / petRarities[rarity].probability)
  }




  // 根据境界调整装备品质概率
  const getEquipProbabilities = {
    common: 0.5, // 凡品 50%
    uncommon: 0.3, // 下品 30%
    rare: 0.12, // 中品 12%
    epic: 0.05, // 上品 5%
    legendary: 0.02, // 极品 2%
    mythic: 0.01 // 仙品 1%
  }

  // 根据心愿单调整装备概率
  const getAdjustedEquipProbabilities = () => {
    const baseProbs = { ...getEquipProbabilities }
    if (playerStore.wishlistEnabled && playerStore.selectedWishEquipQuality) {
      const quality = playerStore.selectedWishEquipQuality
      const bonus = wishlistBonus.equipment(quality)
      // 增加选中品质的概率
      baseProbs[quality] *= 1 + bonus
      // 按比例降低其他品质的概率
      const totalOtherProb = Object.entries(baseProbs)
        .filter(([q]) => q !== quality)
        .reduce((sum, [, prob]) => sum + prob, 0)
      const reductionFactor = (1 - baseProbs[quality]) / totalOtherProb
      Object.keys(baseProbs).forEach(q => {
        if (q !== quality) {
          baseProbs[q] *= reductionFactor
        }
      })
    }
    return baseProbs
  }

  // 根据心愿单调整灵宠概率
  const getAdjustedPetProbabilities = () => {
    const baseProbs = {}
    Object.entries(petRarities).forEach(([rarity, config]) => {
      baseProbs[rarity] = config.probability
    })

    if (playerStore.wishlistEnabled && playerStore.selectedWishPetRarity) {
      const rarity = playerStore.selectedWishPetRarity
      const bonus = wishlistBonus.pet(rarity)
      // 增加选中品质的概率
      baseProbs[rarity] *= 1 + bonus
      // 按比例降低其他品质的概率
      const totalOtherProb = Object.entries(baseProbs)
        .filter(([r]) => r !== rarity)
        .reduce((sum, [, prob]) => sum + prob, 0)
      const reductionFactor = (1 - baseProbs[rarity]) / totalOtherProb
      Object.keys(baseProbs).forEach(r => {
        if (r !== rarity) {
          baseProbs[r] *= reductionFactor
        }
      })
    }
    return baseProbs
  }

  // 修改抽取单个装备的函数
  const drawSingleEquip = () => {
    const random = Math.random()
    let accumulatedProb = 0
    const currentProbs = getAdjustedEquipProbabilities()
    for (const [quality, probability] of Object.entries(currentProbs)) {
      accumulatedProb += probability
      if (random <= accumulatedProb) {
        const types = Object.keys(equipmentTypes)
        const type = types[Math.floor(Math.random() * types.length)]
        return generateEquipment(playerStore.level || 1, type, quality)
      }
    }
    return generateEquipment(playerStore.level || 1, null, 'common')
  }

  // 抽取单品灵宠
  const drawSinglePet = () => {
    const probs = getAdjustedPetProbabilities()
    const random = Math.random()
    let accumulatedProb = 0
    for (const [rarity, probability] of Object.entries(probs)) {
      accumulatedProb += probability
      if (random <= accumulatedProb) {
        return generatePet(rarity)
      }
    }
    return generatePet('mortal')
  }

  // 综合池概率配置
  const getAllPoolProbabilities = () => {
    // 引用调整后的概率（已包含心愿单逻辑）
    const equipProbs = getAdjustedEquipProbabilities()
    const petProbs = getAdjustedPetProbabilities()
    
    const totalEquipProb = 0.5 // 装备占50%概率
    const totalPetProb = 0.5 // 灵宠占50%概率
    
    // 调整装备概率
    const adjustedEquipProbs = {}
    Object.entries(equipProbs).forEach(([quality, prob]) => {
      adjustedEquipProbs[quality] = prob * totalEquipProb
    })
    
    // 调整灵宠概率
    const adjustedPetProbs = {}
    Object.entries(petProbs).forEach(([rarity, prob]) => {
      adjustedPetProbs[rarity] = prob * totalPetProb
    })
    
    return {
      equipment: adjustedEquipProbs,
      pet: adjustedPetProbs
    }
  }

  // 从综合池抽取
  const drawFromAllPool = () => {
    const random = Math.random()
    const probs = getAllPoolProbabilities(playerStore.level || 1)
    // 先决定是抽装备还是灵宠
    if (random < 0.5) {
      // 抽装备
      let accumulatedProb = 0
      for (const [quality, probability] of Object.entries(probs.equipment)) {
        accumulatedProb += probability
        if (random * 2 <= accumulatedProb) {
          const types = Object.keys(equipmentTypes)
          const type = types[Math.floor(Math.random() * types.length)]
          return {
            ...generateEquipment(playerStore.level || 1, type, quality),
            type,
            equipType: type
          }
        }
      }
      // 如果没有命中任何概率，返回最低品质的装备
      const types = Object.keys(equipmentTypes)
      const type = types[Math.floor(Math.random() * types.length)]
      return {
        ...generateEquipment(playerStore.level || 1, type, 'common'),
        type,
        equipType: type
      }
    } else {
      // 抽灵宠
      let accumulatedProb = 0
      for (const [rarity, probability] of Object.entries(probs.pet)) {
        accumulatedProb += probability
        if ((random - 0.5) * 2 <= (accumulatedProb * 2)) {
          return generatePet(rarity)
        }
      }
      // 如果没有命中任何概率，返回最低品质的灵宠
      return generatePet('mortal')
    }
  }

  const gachaNumber = ref(1)

  // 执行抽卡
  const performGacha = async times => {
    gachaNumber.value = times
    showResult.value = false
    const cost = playerStore.wishlistEnabled ? times * 200 : times * 100
    if (playerStore.spiritStones < cost) {
      message.error('灵石不足！')
      return
    }
    if (gachaType.value != 'equipment' && playerStore.items.filter(item => item.type === 'pet').length >= 100) {
      message.error('灵宠背包已满，请先处理一些灵宠')
      return
    }
    if (isDrawing.value) return
    isDrawing.value = true
    // 扣除灵石
    playerStore.spiritStones -= cost
    // 开始抽卡动画
    isShaking.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    isShaking.value = false
    isOpening.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 生成抽卡结果
    const results = Array(times)
      .fill()
      .map(() => {
        if (gachaType.value === 'all') {
          return drawFromAllPool()
        } else {
          return gachaType.value === 'equipment' ? drawSingleEquip() : drawSinglePet()
        }
      })
    // 添加到背包
    results.forEach(item => {
      if (item.type === 'pet') {
        // 根据品质获得精华
        const rarityConfig = playerStore.petConfig.rarityMap[item.rarity]
        if (rarityConfig) {
          playerStore.petEssence += rarityConfig.essenceBonus
        }
        // 检查是否需要自动放生
        if (
          playerStore.autoReleaseRarities.length > 0 &&
          (playerStore.autoReleaseRarities.includes('all') || playerStore.autoReleaseRarities.includes(item.rarity))
        ) {
          autoReleasedCount.value++
          return // 不添加到背包
        }
      } else if (equipmentTypes2.includes(item.type)) {
        // 检查是否需要自动出售
        if (
          playerStore.autoSellQualities.length > 0 &&
          (playerStore.autoSellQualities.includes('all') || playerStore.autoSellQualities.includes(item.quality))
        ) {
          // 计算出售价格
          const qualityPrices = {
            mythic: 6,
            legendary: 5,
            epic: 4,
            rare: 3,
            uncommon: 2,
            common: 1
          }
          const basePrice = qualityPrices[item.quality] || 1
          playerStore.reinforceStones += basePrice
          autoSoldCount.value++
          autoSoldIncome.value += basePrice
          return // 不添加到背包
        }
      }
      playerStore.items.push({
        ...item,
        id: Date.now() + Math.random()
      })
    })
    // 显示自动处理结果通知
    if (autoSoldCount.value) {
      message.success(`自动出售了 ${autoSoldCount.value} 件装备，获得 ${autoSoldIncome.value} 强化石`)
    }
    if (autoReleasedCount.value) {
      message.success(`自动放生了 ${autoReleasedCount.value} 只灵宠`)
    }
    // 保存数据
    playerStore.saveData()
    // 显示结果
    gachaResult.value = results
    currentPage.value = 1
    selectedRarity.value = null
    selectedQuality.value = null
    isOpening.value = false
    showResult.value = true
    isDrawing.value = false
    // 清空自动处理计数器
    autoSoldCount.value = 0
    autoReleasedCount.value = 0
    autoSoldIncome.value = 0
  }

  // 定义品质排序权重（数值越大品质越好）
  const equipmentQualityOrder = {
    mythic: 6,      // 仙品
    legendary: 5,   // 极品
    epic: 4,        // 上品
    rare: 3,        // 中品
    uncommon: 2,    // 下品
    common: 1       // 凡品
  }

  const petRarityOrder = {
    divine: 5,      // 神品
    celestial: 4,   // 仙品
    mystic: 3,      // 玄品
    spiritual: 2,   // 灵品
    mortal: 1       // 凡品
  }

  // 筛选结果并按品质从好到差排序
  const filteredResults = computed(() => {
    if (!gachaResult.value) return []
    const filtered = gachaResult.value.filter(item => {
      if (item.type === 'pet') {
        return !selectedRarity.value || item.rarity === selectedRarity.value
      }
      // 装备筛选
      return !selectedQuality.value || item.quality === selectedQuality.value
    })
    
    // 按品质从好到差排序
    return filtered.sort((a, b) => {
      if (a.type === 'pet' && b.type === 'pet') {
        // 两个都是灵宠，按灵宠品质排序
        return petRarityOrder[b.rarity] - petRarityOrder[a.rarity]
      } else if (a.type !== 'pet' && b.type !== 'pet') {
        // 两个都是装备，按装备品质排序
        return equipmentQualityOrder[b.quality] - equipmentQualityOrder[a.quality]
      } else {
        // 一个是装备一个是灵宠，保持原顺序（或者可以设置装备优先/灵宠优先）
        return a.type === 'pet' ? 1 : -1
      }
    })
  })

  // 当筛选条件改变时重置页码
  watch([selectedQuality, selectedRarity], () => {
    currentPage.value = 1
  })

  // 计算当前页的结果
  const currentPageResults = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredResults.value.slice(start, end)
  })

  // 计算总页数
  const totalPages = computed(() => {
    return Math.ceil(filteredResults.value.length / pageSize.value)
  })

  const types = {
    equipment: '📦',
    pet: '🥚',
    all: '🎁'
  }

  const equipmentQualityOptions = computed(() => {
    return Object.entries(equipmentQualities).map(([key, value]) => ({
      label: value.name,
      value: key,
      style: { color: value.color }
    }))
  })

  const petRarityOptions = computed(() => {
    return Object.entries(petRarities).map(([key, value]) => ({
      label: value.name,
      value: key,
      style: { color: value.color }
    }))
  })

  const handleAutoSellChange = values => {
    if (values.includes('all')) {
      // 如果选中了"全部品阶"，则清空其他选项
      playerStore.autoSellQualities = ['all']
    } else if (values.length > 0) {
      // 如果选中了其他选项，确保移除"全部品阶"
      playerStore.autoSellQualities = values.filter(v => v !== 'all')
    }
  }

  const handleAutoReleaseChange = values => {
    if (values.includes('all')) {
      // 如果选中了"全部品质"，则清空其他选项
      playerStore.autoReleaseRarities = ['all']
    } else if (values.length > 0) {
      // 如果选中了其他选项，确保移除"全部品质"
      playerStore.autoReleaseRarities = values.filter(v => v !== 'all')
    }
  }
</script>

<style scoped>
  .gacha-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .gacha-type-selector {
    margin-bottom: 20px;
  }

  .spirit-stones {
    align-self: flex-end;
  }

  .gacha-item-container {
    position: relative;
    width: 200px;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .gacha-item {
    font-size: 100px;
    transition: transform 0.3s ease;
  }

  .gacha-item.shake {
    animation: shake 0.5s ease-in-out infinite;
  }

  .gacha-item.open {
    animation: open 1s ease-in-out;
  }

  @keyframes shake {
    0%,
    100% {
      transform: rotate(0deg);
    }

    25% {
      transform: rotate(-5deg);
    }

    75% {
      transform: rotate(5deg);
    }
  }

  @keyframes open {
    0% {
      transform: scale(1);
      opacity: 1;
    }

    50% {
      transform: scale(1.2);
      opacity: 0.5;
    }

    100% {
      transform: scale(0);
      opacity: 0;
    }
  }

  .filter-section {
    padding: 16px;
    margin-bottom: 16px;
    background-color: var(--n-card-color);
    border-radius: 8px;
    border: 1px solid var(--n-border-color);
  }

  .result-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin: 16px 0;
  }

  .result-item {
    background: var(--n-color);
    border: 2px solid;
    border-radius: 8px;
    padding: 12px;
    text-align: center;
  }

  .result-item h4 {
    margin: 0 0 8px 0;
  }

  .result-item p {
    margin: 4px 0;
    font-size: 0.9em;
  }

  .gacha-buttons {
    margin-top: 20px;
  }

  .probability-bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .prob-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .prob-label {
    min-width: 60px;
    text-align: right;
  }

  @media screen and (max-width: 768px) {
    .result-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  .wishlist-button {
    position: absolute;
    top: 20px;
    right: 20px;
  }

  .wishlist-info {
    margin-top: 16px;
    padding: 12px;
    background-color: #f5f5f5;
    border-radius: 4px;
  }

  .wishlist-info ul {
    margin: 8px 0 0 20px;
    padding: 0;
  }

  .wishlist-info li {
    margin: 4px 0;
    color: #666;
  }

  @keyframes rotate-stars {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .wish-bonus {
    position: relative;
    z-index: 1;
  }

  .wish-bonus::before {
    content: '★';
    position: absolute;
    top: -10px;
    right: -10px;
    color: white;
    font-size: 20px;
    text-shadow: 0 0 5px;
    animation: rotate-stars 3s linear infinite;
    transform-origin: center;
  }
</style>
