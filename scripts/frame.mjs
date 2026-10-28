// Wraps a 390x844@2x phone screenshot in a device frame; output is a transparent PNG.
import { chromium } from 'playwright'
import { readFileSync } from 'fs'
const [,, input, output] = process.argv
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {})
const p = await b.newPage({ viewport: { width: 470, height: 990 }, deviceScaleFactor: 2 })
const src = 'data:image/png;base64,' + readFileSync(input).toString('base64')
await p.setContent(`<style>
  html, body { margin: 0; background: transparent; }
  .wrap { padding: 24px; display: inline-block; }
  .phone { position: relative; width: 390px; height: 898px; padding: 14px; background: #101113; border-radius: 58px;
           box-shadow: 0 0 0 2px #2c2f33, 0 24px 48px rgba(0,0,0,.35), inset 0 0 0 1px #35383c; box-sizing: content-box; }
  .screen { width: 390px; height: 898px; border-radius: 44px; overflow: hidden; background: #eef0f0; }
  .status { height: 54px; display: flex; align-items: flex-end; justify-content: space-between; padding: 0 30px 6px 34px;
            font: 600 15px/1 -apple-system, 'Barlow', system-ui, sans-serif; color: #1e1e1e; }
  .status .batt { width: 24px; height: 11px; border: 1.5px solid #1e1e1e; border-radius: 4px; padding: 1.5px; box-sizing: border-box; }
  .status .batt i { display: block; width: 100%; height: 100%; background: #1e1e1e; border-radius: 1.5px; }
  .screen img { display: block; width: 390px; height: 844px; }
  .island { position: absolute; top: 25px; left: 50%; width: 118px; height: 34px; transform: translateX(-50%);
            background: #101113; border-radius: 20px; }
  .btn { position: absolute; width: 3px; background: #2c2f33; border-radius: 2px; }
  .btn.l1 { left: -5px; top: 150px; height: 34px; } .btn.l2 { left: -5px; top: 210px; height: 64px; }
  .btn.l3 { left: -5px; top: 290px; height: 64px; } .btn.r { right: -5px; top: 230px; height: 96px; }
</style><div class="wrap"><div class="phone"><div class="screen"><div class="status"><span>9:41</span><span class="batt"><i></i></span></div><img src="${src}"></div><div class="island"></div>
<i class="btn l1"></i><i class="btn l2"></i><i class="btn l3"></i><i class="btn r"></i></div></div>`)
const el = await p.$('.wrap'); await el.screenshot({ path: output, omitBackground: true })
await b.close()
