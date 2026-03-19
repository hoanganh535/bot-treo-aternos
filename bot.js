const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

const HOST = 'HoangAnh67.aternos.me'
const PORT = 22175

function startBot() {
  console.log('--- Dang thu ket noi lai (Tu dong do Version) ---')

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: 'Anh_Pro_' + Math.floor(Math.random() * 1000), 
    version: false, // TU DONG DO VERSION DE KHONG BI RESET KET NOI
    hideErrors: true
  })

  bot.loadPlugin(pathfinder)
  let homePos = null

  async function equipBestGear() {
    if (!bot.inventory) return
    const items = bot.inventory.items()
    const gearMap = {
      helmet: ['netherite_helmet', 'diamond_helmet', 'iron_helmet'],
      chestplate: ['netherite_chestplate', 'diamond_chestplate', 'iron_chestplate'],
      leggings: ['netherite_leggings', 'diamond_leggings', 'iron_leggings'],
      boots: ['netherite_boots', 'diamond_boots', 'iron_boots'],
      hand: ['netherite_sword', 'diamond_sword', 'netherite_axe', 'iron_sword']
    }
    for (const [slot, priorityList] of Object.entries(gearMap)) {
      const bestItem = items.find(item => priorityList.includes(item.name))
      if (bestItem) try { await bot.equip(bestItem, slot) } catch (err) {}
    }
  }

  bot.once('spawn', () => {
    console.log('==> DA VAO DUOC ROI! Dang treo may day...');
    homePos = bot.entity.position.clone()

    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    bot.pathfinder.setMovements(defaultMove)

    // 1. NHAT DO & MAC DO (Moi 8s)
    setInterval(() => {
      const drop = Object.values(bot.entities).find(e => 
        e.name === 'item' && bot.entity.position.distanceTo(e.position) < 5
      )
      if (drop) bot.pathfinder.setGoal(new goals.GoalBlock(drop.position.x, drop.position.y, drop.position.z))
      equipBestGear()
    }, 8000)

    // 2. DI BO NGAU NHIEN
    const randomWalk = () => {
      if (!bot.entity || !homePos) return
      const rx = homePos.x + (Math.random() - 0.5) * 6
      const rz = homePos.z + (Math.random() - 0.5) * 6
      bot.pathfinder.setGoal(new goals.GoalNear(rx, homePos.y, rz, 1))
      setTimeout(randomWalk, Math.floor(Math.random() * 20000) + 15000)
    }
    randomWalk()

    // 3. KHANG GAY DAY
    setInterval(() => {
      if (homePos && bot.entity.position.distanceTo(homePos) > 3) {
        bot.pathfinder.setGoal(new goals.GoalBlock(homePos.x, homePos.y, homePos.z))
      }
    }, 5000)
  })

  // TU DONG RECONNECT KHI BI KICK
  bot.on('end', (reason) => {
    console.log(`--- Mat ket noi (${reason}). Dang vao lai... ---`)
    setTimeout(startBot, 5000) // Vao lai nhanh hon (5 giay)
  })

  bot.on('error', err => {
    console.log('DANG DOI SERVER ONLINE...')
    setTimeout(startBot, 10000)
  })
}

startBot()