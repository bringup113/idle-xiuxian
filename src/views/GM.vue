<template>
  <n-layout>
    <n-layout-content class="gm-content">
      <n-tabs type="segment" animated>
        <!-- 基础属性与资源 -->
        <n-tab-pane name="basic" tab="基础与资源">
          <n-card :bordered="false">
            <n-form label-placement="left" label-width="120">
              <n-grid :cols="2" :x-gap="12">
                <n-form-item-gi label="道号">
                  <n-input v-model:value="baseAttributes.name" />
                </n-form-item-gi>
                <n-form-item-gi label="境界等级">
                  <n-input-number v-model:value="baseAttributes.level" :min="1" />
                </n-form-item-gi>
                <n-form-item-gi label="境界名称">
                  <n-input v-model:value="baseAttributes.realm" />
                </n-form-item-gi>
                <n-form-item-gi label="当前修为">
                  <n-input-number v-model:value="baseAttributes.cultivation" :min="0" />
                </n-form-item-gi>
                <n-form-item-gi label="最大修为">
                  <n-input-number v-model:value="baseAttributes.maxCultivation" :min="1" />
                </n-form-item-gi>
                <n-form-item-gi label="灵力">
                  <n-input-number v-model:value="baseAttributes.spirit" :min="0" />
                </n-form-item-gi>
                <n-form-item-gi label="灵力获取倍率">
                  <n-input-number v-model:value="baseAttributes.spiritRate" :min="0" :step="0.1" />
                </n-form-item-gi>
                <n-form-item-gi label="幸运值">
                  <n-input-number v-model:value="baseAttributes.luck" :min="0" :step="0.1" />
                </n-form-item-gi>
                <n-form-item-gi label="修炼速率">
                  <n-input-number v-model:value="baseAttributes.cultivationRate" :min="0" :step="0.1" />
                </n-form-item-gi>
                <n-form-item-gi label="灵草获取倍率">
                  <n-input-number v-model:value="baseAttributes.herbRate" :min="0" :step="0.1" />
                </n-form-item-gi>
                <n-form-item-gi label="炼丹成功率加成">
                  <n-input-number v-model:value="baseAttributes.alchemyRate" :min="0" :step="0.1" />
                </n-form-item-gi>
                <n-form-item-gi label="灵石">
                  <n-input-number v-model:value="baseAttributes.spiritStones" :min="0" />
                </n-form-item-gi>
                <n-form-item-gi label="强化石">
                  <n-input-number v-model:value="baseAttributes.reinforceStones" :min="0" />
                </n-form-item-gi>
                <n-form-item-gi label="洗练石">
                  <n-input-number v-model:value="baseAttributes.refinementStones" :min="0" />
                </n-form-item-gi>
                <n-form-item-gi label="灵宠精华">
                  <n-input-number v-model:value="baseAttributes.petEssence" :min="0" />
                </n-form-item-gi>
              </n-grid>
            </n-form>
          </n-card>
        </n-tab-pane>

        <!-- 战斗属性 -->
        <n-tab-pane name="combat" tab="战斗属性">
          <n-card :bordered="false">
            <n-divider title-placement="left">基础战斗属性</n-divider>
            <n-form label-placement="left" label-width="100">
              <n-grid :cols="2" :x-gap="12">
                <n-form-item-gi v-for="(val, key) in playerStore.baseAttributes" :key="key" :label="statNameMapping[key] || key">
                  <n-input-number v-model:value="combatStats.baseAttributes[key]" :min="0" />
                </n-form-item-gi>
              </n-grid>
            </n-form>

            <n-divider title-placement="left">战斗机率属性 (单位: %)</n-divider>
            <n-form label-placement="left" label-width="100">
              <n-grid :cols="3" :x-gap="12">
                <n-form-item-gi v-for="(val, key) in playerStore.combatAttributes" :key="key" :label="statNameMapping[key] || key">
                  <n-input-number v-model:value="combatStats.combatAttributes[key]" :min="0" :step="1" :precision="1">
                    <template #suffix>%</template>
                  </n-input-number>
                </n-form-item-gi>
              </n-grid>
            </n-form>

            <n-divider title-placement="left">战斗抗性 (单位: %)</n-divider>
            <n-form label-placement="left" label-width="100">
              <n-grid :cols="3" :x-gap="12">
                <n-form-item-gi v-for="(val, key) in playerStore.combatResistance" :key="key" :label="statNameMapping[key] || key">
                  <n-input-number v-model:value="combatStats.combatResistance[key]" :min="0" :step="1" :precision="1">
                    <template #suffix>%</template>
                  </n-input-number>
                </n-form-item-gi>
              </n-grid>
            </n-form>

            <n-divider title-placement="left">特殊属性 (单位: %)</n-divider>
            <n-form label-placement="left" label-width="100">
              <n-grid :cols="3" :x-gap="12">
                <n-form-item-gi v-for="(val, key) in playerStore.specialAttributes" :key="key" :label="statNameMapping[key] || key">
                  <n-input-number v-model:value="combatStats.specialAttributes[key]" :min="0" :step="1" :precision="1">
                    <template #suffix>%</template>
                  </n-input-number>
                </n-form-item-gi>
              </n-grid>
            </n-form>
          </n-card>
        </n-tab-pane>

        <!-- 快捷操作 -->
        <n-tab-pane name="actions" tab="快捷操作">
          <n-card :bordered="false">
            <n-space vertical>
              <n-divider title-placement="left">资源获取</n-divider>
              <n-space>
                <n-button type="primary" @click="quickAction('spiritStones', 1000000)">+100万灵石</n-button>
                <n-button type="primary" @click="quickAction('reinforceStones', 10000)">+1万强化石</n-button>
                <n-button type="primary" @click="quickAction('refinementStones', 10000)">+1万洗练石</n-button>
                <n-button type="primary" @click="quickAction('petEssence', 10000)">+1万灵宠精华</n-button>
              </n-space>

              <n-divider title-placement="left">境界与修为</n-divider>
              <n-space>
                <n-button type="warning" @click="maxLevel">直接满级 (100级)</n-button>
                <n-button type="warning" @click="fullCultivation">修为全满</n-button>
                <n-button type="warning" @click="unlockAllRealms">解锁所有境界名称</n-button>
              </n-space>

              <n-divider title-placement="left">属性增强</n-divider>
              <n-space>
                <n-button type="error" @click="superStats">超级属性 (全属性+500% / 基础属性10万)</n-button>
              </n-space>
            </n-space>
          </n-card>
        </n-tab-pane>

        <!-- 物品与资源 -->
        <n-tab-pane name="items" tab="物品与资源">
          <n-card :bordered="false">
            <n-space vertical>
              <n-divider title-placement="left">灵草获取</n-divider>
              <n-form inline label-placement="left">
                <n-form-item label="选择灵草">
                  <n-select v-model:value="selectedHerbId" :options="herbOptions" style="width: 200px" />
                </n-form-item>
                <n-form-item label="品质">
                  <n-select v-model:value="selectedHerbQuality" :options="herbQualityOptions" style="width: 120px" />
                </n-form-item>
                <n-form-item label="数量">
                  <n-input-number v-model:value="herbCount" :min="1" style="width: 120px" />
                </n-form-item>
                <n-button type="primary" @click="addHerb">获取灵草</n-button>
              </n-form>

              <n-divider title-placement="left">丹药获取</n-divider>
              <n-form inline label-placement="left">
                <n-form-item label="选择丹药">
                  <n-select v-model:value="selectedPillId" :options="pillOptions" style="width: 200px" />
                </n-form-item>
                <n-form-item label="数量">
                  <n-input-number v-model:value="pillCount" :min="1" style="width: 120px" />
                </n-form-item>
                <n-button type="primary" @click="addPill">获取丹药</n-button>
              </n-form>

              <n-divider title-placement="left">丹方残页 & 功法</n-divider>
              <n-space>
                <n-button type="info" @click="addAllPillFragments">所有丹方残页各+99</n-button>
                <n-button type="info" @click="unlockAllPillRecipes">解锁所有丹方</n-button>
              </n-space>

              <n-divider title-placement="left">快捷生成 (高品质)</n-divider>
              <n-space>
                <n-button type="error" @click="addMythicGear">获取随机仙品装备</n-button>
                <n-button type="error" @click="addPerfectGear">获取随机顶级仙品</n-button>
                <n-button type="error" @click="addDivinePet">获取随机神品灵宠</n-button>
                <n-button type="error" @click="addPerfectPet">获取顶级神品灵宠</n-button>
              </n-space>
            </n-space>
          </n-card>
        </n-tab-pane>
      </n-tabs>

      <div class="gm-footer">
        <n-space justify="end">
          <n-button type="info" @click="resetPlayerData">重置数据</n-button>
          <n-button type="primary" size="large" @click="updateAttributes">保存所有修改</n-button>
        </n-space>
      </div>
    </n-layout-content>
  </n-layout>
</template>

<script setup>
  import { usePlayerStore } from '../stores/player'
  import { ref, reactive, computed } from 'vue'
  import { useMessage } from 'naive-ui'
  import { statNameMapping } from '../plugins/stats'
  import { getRealmName, getRealmLength } from '../plugins/realm'
  import { herbs, herbQualities, getHerbValue } from '../plugins/herbs'
  import { pillRecipes, calculatePillEffect } from '../plugins/pills'
  import { generateEquipment } from '../plugins/equipment'
  import { generatePet } from '../plugins/pets'

  const playerStore = usePlayerStore()
  const message = useMessage()

  // 基础属性编辑
  const baseAttributes = ref({
    name: playerStore.name,
    level: playerStore.level,
    realm: playerStore.realm,
    cultivation: playerStore.cultivation,
    maxCultivation: playerStore.maxCultivation,
    spirit: playerStore.spirit,
    spiritRate: playerStore.spiritRate,
    luck: playerStore.luck,
    cultivationRate: playerStore.cultivationRate,
    herbRate: playerStore.herbRate,
    alchemyRate: playerStore.alchemyRate,
    spiritStones: playerStore.spiritStones,
    reinforceStones: playerStore.reinforceStones,
    refinementStones: playerStore.refinementStones,
    petEssence: playerStore.petEssence
  })

  // 战斗属性编辑 (存入时进行单位转换：1.0 到 100.0)
  const combatStats = reactive({
    baseAttributes: { ...playerStore.baseAttributes },
    combatAttributes: Object.fromEntries(
      Object.entries(playerStore.combatAttributes).map(([k, v]) => [k, Number((v * 100).toFixed(1))])
    ),
    combatResistance: Object.fromEntries(
      Object.entries(playerStore.combatResistance).map(([k, v]) => [k, Number((v * 100).toFixed(1))])
    ),
    specialAttributes: Object.fromEntries(
      Object.entries(playerStore.specialAttributes).map(([k, v]) => [k, Number((v * 100).toFixed(1))])
    )
  })

  // 物品获取相关状态
  const selectedHerbId = ref(herbs[0].id)
  const selectedHerbQuality = ref('common')
  const herbCount = ref(1)
  const selectedPillId = ref(pillRecipes[0].id)
  const pillCount = ref(1)

  const herbOptions = herbs.map(h => ({ label: h.name, value: h.id }))
  const herbQualityOptions = Object.entries(herbQualities).map(([key, val]) => ({
    label: val.name,
    value: key
  }))
  const pillOptions = pillRecipes.map(p => ({ label: p.name, value: p.id }))

  // 更新玩家属性
  const updateAttributes = () => {
    try {
      // 更新基础属性
      Object.entries(baseAttributes.value).forEach(([key, value]) => {
        playerStore[key] = value
      })

      // 更新战斗相关属性 (保存时转换回比例：100.0 到 1.0)
      playerStore.baseAttributes = { ...combatStats.baseAttributes }
      
      const toRatio = obj => Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, Number((v / 100).toFixed(4))])
      )
      
      playerStore.combatAttributes = toRatio(combatStats.combatAttributes)
      playerStore.combatResistance = toRatio(combatStats.combatResistance)
      playerStore.specialAttributes = toRatio(combatStats.specialAttributes)

      // 保存数据
      playerStore.saveData()
      message.success('属性更新成功')
    } catch (error) {
      message.error('更新失败：' + error.message)
    }
  }

  // 物品获取逻辑
  const addHerb = () => {
    const herbTemplate = herbs.find(h => h.id === selectedHerbId.value)
    if (herbTemplate) {
      for (let i = 0; i < herbCount.value; i++) {
        playerStore.herbs.push({
          ...herbTemplate,
          quality: selectedHerbQuality.value,
          value: getHerbValue(herbTemplate, selectedHerbQuality.value),
          id: Date.now() + Math.random()
        })
      }
      playerStore.saveData()
      message.success(`已获得 ${herbCount.value} 个${herbQualities[selectedHerbQuality.value].name}${herbTemplate.name}`)
    }
  }

  const addPill = () => {
    const recipe = pillRecipes.find(p => p.id === selectedPillId.value)
    if (recipe) {
      const effect = calculatePillEffect(recipe, playerStore.level)
      for (let i = 0; i < pillCount.value; i++) {
        playerStore.items.push({
          id: `${recipe.id}_${Date.now()}_${Math.random()}`,
          name: recipe.name,
          description: recipe.description,
          type: 'pill',
          effect
        })
      }
      playerStore.saveData()
      message.success(`已获得 ${pillCount.value} 个${recipe.name}`)
    }
  }

  const addAllPillFragments = () => {
    pillRecipes.forEach(recipe => {
      playerStore.pillFragments[recipe.id] = (playerStore.pillFragments[recipe.id] || 0) + 99
    })
    playerStore.saveData()
    message.success('所有丹方残页已增加')
  }

  const unlockAllPillRecipes = () => {
    pillRecipes.forEach(recipe => {
      if (!playerStore.pillRecipes.includes(recipe.id)) {
        playerStore.pillRecipes.push(recipe.id)
      }
    })
    playerStore.saveData()
    message.success('所有丹方已解锁')
  }

  // 模拟抽奖中的高品质逻辑
  const addMythicGear = () => {
    // 使用统一的装备生成函数，确保名字和属性正规
    const gear = generateEquipment(playerStore.level, null, 'mythic')
    
    playerStore.items.push(gear)
    playerStore.saveData()
    message.success('已获得正规格式的仙品装备')
  }

  const addPerfectGear = () => {
    // 生成满属性装备
    const gear = generateEquipment(playerStore.level, null, 'mythic', true)
    
    playerStore.items.push(gear)
    playerStore.saveData()
    message.success('已获得满属性顶级仙品装备')
  }

  const addDivinePet = () => {
    // 使用统一生成逻辑
    const pet = generatePet('divine')
    playerStore.items.push(pet)
    playerStore.saveData()
    message.success('已获得神品灵宠')
  }

  const addPerfectPet = () => {
    // 生成满属性灵宠
    const pet = generatePet('divine', true)
    playerStore.items.push(pet)
    playerStore.saveData()
    message.success('已获得满属性顶级神品灵宠')
  }

  // 快捷操作
  const quickAction = (key, amount) => {
    playerStore[key] += amount
    baseAttributes.value[key] = playerStore[key]
    playerStore.saveData()
    message.success(`已增加 ${amount}`)
  }

  const maxLevel = () => {
    const maxLvl = getRealmLength()
    playerStore.level = maxLvl
    const realmInfo = getRealmName(maxLvl)
    playerStore.realm = realmInfo.name
    playerStore.maxCultivation = realmInfo.maxCultivation
    
    baseAttributes.value.level = playerStore.level
    baseAttributes.value.realm = playerStore.realm
    baseAttributes.value.maxCultivation = playerStore.maxCultivation
    
    playerStore.saveData()
    message.success('已提升至最高境界')
  }

  const fullCultivation = () => {
    playerStore.cultivation = playerStore.maxCultivation
    baseAttributes.value.cultivation = playerStore.cultivation
    playerStore.saveData()
    message.success('修为已满')
  }

  const unlockAllRealms = () => {
    const length = getRealmLength()
    for (let i = 1; i <= length; i++) {
      const name = getRealmName(i).name
      if (!playerStore.unlockedRealms.includes(name)) {
        playerStore.unlockedRealms.push(name)
      }
    }
    playerStore.saveData()
    message.success('已解锁所有境界名称')
  }

  const superStats = () => {
    // 基础属性
    Object.keys(playerStore.baseAttributes).forEach(key => {
      playerStore.baseAttributes[key] = 100000
      combatStats.baseAttributes[key] = 100000
    })
    // 概率属性 (设为 500%)
    Object.keys(playerStore.combatAttributes).forEach(key => {
      playerStore.combatAttributes[key] = 5.0
      combatStats.combatAttributes[key] = 500.0
    })
    // 抗性属性
    Object.keys(playerStore.combatResistance).forEach(key => {
      playerStore.combatResistance[key] = 5.0
      combatStats.combatResistance[key] = 500.0
    })
    // 特殊属性
    Object.keys(playerStore.specialAttributes).forEach(key => {
      playerStore.specialAttributes[key] = 5.0
      combatStats.specialAttributes[key] = 500.0
    })
    
    playerStore.saveData()
    message.success('超级属性已激活 (500%)')
  }

  // 重置玩家数据
  const resetPlayerData = async () => {
    try {
      playerStore.$reset()
      await playerStore.initializePlayer()
      message.success('数据重置成功')
      
      // 刷新显示的数据
      Object.assign(baseAttributes.value, {
        name: playerStore.name,
        level: playerStore.level,
        realm: playerStore.realm,
        cultivation: playerStore.cultivation,
        maxCultivation: playerStore.maxCultivation,
        spirit: playerStore.spirit,
        spiritRate: playerStore.spiritRate,
        luck: playerStore.luck,
        cultivationRate: playerStore.cultivationRate,
        herbRate: playerStore.herbRate,
        alchemyRate: playerStore.alchemyRate,
        spiritStones: playerStore.spiritStones,
        reinforceStones: playerStore.reinforceStones,
        refinementStones: playerStore.refinementStones,
        petEssence: playerStore.petEssence
      })
      
      const toPercent = obj => Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, Number((v * 100).toFixed(1))])
      )

      Object.assign(combatStats, {
        baseAttributes: { ...playerStore.baseAttributes },
        combatAttributes: toPercent(playerStore.combatAttributes),
        combatResistance: toPercent(playerStore.combatResistance),
        specialAttributes: toPercent(playerStore.specialAttributes)
      })
    } catch (error) {
      message.error('重置失败：' + error.message)
    }
  }
</script>

<style scoped>
  .gm-content {
    padding: 16px;
  }
  .gm-footer {
    margin-top: 24px;
    padding: 16px;
    border-top: 1px solid var(--n-border-color);
  }
  .option-card {
    cursor: pointer;
  }
</style>
