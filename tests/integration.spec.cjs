const { test, expect } = require('@playwright/test');
const path = require('node:path');

async function sdk(page) {
  await page.route('**/config.local.js', route => route.fulfill({contentType:'text/javascript', body:'window.ROADNET_CONFIG = { ...window.ROADNET_CONFIG, amapKey: "test-key" };'}));
  await page.route('https://webapi.amap.com/maps?**', route => route.fulfill({path:path.join(__dirname,'fixtures/amap.js'),contentType:'text/javascript'}));
  await page.route('https://webapi.amap.com/loca?**', route => route.fulfill({contentType:'text/javascript',body:'window.Loca={Container:class{constructor(){this.animate={start(){}}}},GeoJSONSource:class{},ScatterLayer:class{setSource(){}setStyle(){}addAnimate(){}}};'}));
  await page.route('https://**/*', route => {
    if (/webapi.amap.com\/(maps|loca)\?/.test(route.request().url())) return route.fallback();
    return route.abort();
  });
}

test('homepage links all modules and shows real dataset counts without credentials', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'统一交通分析平台',exact:true})).toBeVisible();
  for (const name of ['风险态势','原始公交','优化线网','历史路网']) await expect(page.getByRole('link',{name,exact:true}).first()).toBeVisible();
  await expect(page.locator('#dataset-summary')).toContainText('346');
});

test('missing key explains recovery without a blank page', async ({page}) => {
  await page.goto('/risk.html');
  await expect(page.getByRole('alert')).toContainText('config.local.js');
  await expect(page.getByRole('link',{name:'首页',exact:true})).toBeVisible();
});

for (const [version,length] of [['v1',1234],['v2',1702]]) {
  test(`risk ${version}: select first and tenth events, reuse chart, handle available/missing animation`, async ({page}) => {
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await sdk(page); await page.goto(`/risk.html?dataset=${version}`);
    await expect(page.locator('#searchList li')).toHaveCount(346);
    await page.locator('#searchList li').first().click();
    await expect(page.locator('.windowFloat').first()).toBeVisible();
    await expect(page.locator('#radarChart canvas')).toHaveCount(1);
    await page.evaluate(()=>window.vm.drawImage());
    await expect(page.locator('#test-info')).toContainText('暂无');
    await page.locator('#searchList li').nth(9).click();
    await expect.poll(()=>page.evaluate(()=>window.vm.floatData.congestionLength)).toBe(length);
    await page.evaluate(()=>window.vm.drawImage());
    await expect(page.locator('#test-info img')).toHaveAttribute('src','assets/data/10.gif');
    await expect(page.locator('#radarChart canvas')).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}

test('road lookup rejects malformed and out of range IDs and accepts a real event', async ({page}) => {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await sdk(page);await page.goto('/roads.html');
  const input=page.locator('#tree_ind');await expect(input).toBeVisible();
  await page.waitForFunction(()=>window.ROADNET_READY);
  for (const value of ['', '0','99999','1x']) {
    await input.fill(value);await page.locator('input[type="submit"],button[type="submit"]').click();
    await expect(page.locator('#road-error')).not.toBeEmpty();
  }
  await input.fill('1');await page.locator('input[type="submit"],button[type="submit"]').click();
  await expect(page.locator('#road-error')).toBeEmpty();
  expect(errors).toEqual([]);
});

for(const module of ['transit','optimization']) {
  test(`${module}: search, choose route, render metrics and handle toggles`, async ({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await sdk(page);await page.goto(`/${module}.html`);
    await page.waitForFunction(()=>window.ROADNET_READY);
    if(module==='optimization') {await page.locator('#ysxw').check();await page.locator('#ysxw').uncheck();}
    const input=page.locator('#seachBox input');await input.focus();
    await expect(page.locator('#searchList li').first()).toBeVisible();
    await page.locator('#searchList li').first().click();
    await expect(page.locator('#radarChart canvas')).toHaveCount(1);
    if(module==='optimization') {
      await expect(page.locator('#firstPie canvas')).toHaveCount(1);
      await page.locator('#yhxw').uncheck();await page.locator('#yhxw').check();
    }
    await input.fill('不存在的线路');await input.press('z');
    await expect(page.locator('#searchList li')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('SDK transport failure shows recovery message', async ({page})=>{
  await page.route('**/config.local.js',r=>r.fulfill({body:'window.ROADNET_CONFIG.amapKey="test-key";',contentType:'text/javascript'}));
  await page.route('https://webapi.amap.com/**',r=>r.abort());
  await page.goto('/risk.html');
  await expect(page.getByRole('alert')).toContainText('地图服务加载失败');
});

test('built site works under a nested deployment path and changes risk datasets by navigation', async ({page})=>{
  const fs=require('node:fs');const os=require('node:os');const {createServer}=require('../scripts/serve.cjs');
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'roadnet-test-'));
  let server;
  try {
    fs.cpSync(path.resolve('dist'),path.join(root,'transport'),{recursive:true});
    server=createServer(root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const errors=[];const missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.push(r.url());});
    await sdk(page);await page.goto(`http://127.0.0.1:${server.address().port}/transport/index.html`);
    await page.getByRole('link',{name:'风险态势',exact:true}).first().click();
    await expect(page).toHaveURL(/\/transport\/risk.html$/);
    await expect(page.locator('#searchList li')).toHaveCount(346);
    await page.locator('#dataset-version').selectOption('v1');
    await expect(page).toHaveURL(/dataset=v1/);
    await expect(page.locator('#searchList li')).toHaveCount(346);
    await page.locator('#searchList li').nth(9).click();
    await expect.poll(()=>page.evaluate(()=>window.vm.floatData.congestionLength)).toBe(1234);
    expect(errors).toEqual([]);expect(missing).toEqual([]);
  } finally {
    if(server)await new Promise(resolve=>server.close(resolve));
    fs.rmSync(root,{recursive:true,force:true});
  }
});
