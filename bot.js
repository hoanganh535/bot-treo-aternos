const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const http = require('http');

// --- 1. TAO WEB AO DE TREO FREE (KHONG BI TAT) ---
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot dang hoat dong 24/7!\n');
});
server.listen(process.env.PORT || 8080, () => {
  console.log('--- Web Server da kich hoat de chong ngu ---');
});

const HOST = 'HoangAnh67.aternos.me'
const PORT = 22175

function startBot() {
  console.log('--- Dang ket noi (Ban Sieu AFK + Anti-Sleep 1.21.6) ---')

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: 'Anh_AFK_' + Math.floor(Math.random() * 1000), 
    version: false, // Tu dong do phien ban server
    checkTimeoutInterval: 90000
  })

  bot.loadPlugin(pathfinder)
  let homePos = null

  // --- 2. HAM TU DONG MAC DO & CAM KIEM ---
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
    console.log('==> DA VAO SERVER! Dang chay che do AFK 24/7...');
    
    setTimeout(() => {
      homePos = bot.entity.position.clone()
      equipBestGear()
    }, 2000)

    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    bot.pathfinder.setMovements(defaultMove)

    // 3. DI DAO NGAU NHIEN & NHAT DO (Moi 10-20s)
    const randomAction = () => {
      if (!bot.entity || !homePos) return
      
      // Tim do roi gan do de nhat
      const drop = Object.values(bot.entities).find(e => 
        e.name === 'item' && bot.entity.position.distanceTo(e.position) < 5
      )
      
      if (drop) {
        bot.pathfinder.setGoal(new goals.GoalBlock(drop.position.x, drop.position.y, drop.position.z))
      } else {
        // Neu khong co do thi di loanh quanh
        const rx = homePos.x + (Math.random() - 0.5) * 6
        const rz = homePos.z + (Math.random() - 0.5) * 6
        bot.pathfinder.setGoal(new goals.GoalNear(rx, homePos.y, rz, 1))
      }
      
      bot.swingArm('right') // Vung tay gia nguoi that
      equipBestGear() // Kiem tra do de mac
      
      setTimeout(randomAction, Math.floor(Math.random() * 15000) + 10000)
    }
    randomAction()

    // 4. KHANG GAY DAY (Anti-Knockback)
    setInterval(() => {
      if (homePos && bot.entity.position.distanceTo(homePos) > 4) {
        bot.pathfinder.setGoal(new goals.GoalBlock(homePos.x, homePos.y, homePos.z))
      }
    }, 5000)
  })

  // 5. TU VE KHI GAP QUAI
  bot.on('entityAttack', (entity) => {
    if (entity.type === 'mob') {
      bot.lookAt(entity.position.offset(0, 1.6, 0))
      bot.attack(entity)
    }
  })

  bot.on('end', (reason) => {
    console.log(`--- Mat ket noi (${reason}). Vao lai sau 15s ---`)
    setTimeout(startBot, 15000)
  })

  bot.on('error', err => {
    console.log('LOI KET NOI: Dang cho server Online...')
    setTimeout(startBot, 20000)
  })
}

startBot()