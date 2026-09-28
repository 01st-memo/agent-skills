// interactive-deck の点検：node scripts/check.mjs <deck.html> [出力フォルダ]
// 1) #check の自己点検（操作・根拠パネル・36字・18px・はみ出し・重なり・折り返し・空白帯・文末・デモ台本）
// 2) 実操作の煙試験（各ページの data-op と data-drawer を押す・Esc・O・→）と JS エラーの有無
// 3) 自動デモ（D）を最後まで走らせ、一覧で終わるか
// 4) 各ページの最終状態（#static）と一覧のスクリーンショット
// playwright は consulting-pptx-skill に入れたものを使う（PLAYWRIGHT_MODULE_DIR で上書き可）
import { createRequire } from 'module';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { pathToFileURL, fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dirs = [process.env.PLAYWRIGHT_MODULE_DIR, path.join(here, '../../consulting-pptx-skill/node_modules'), path.join(os.homedir(), '.claude/skills/consulting-pptx-skill/node_modules')].filter(Boolean);
let chromium;
try { ({ chromium } = await import('playwright')); }
catch {
  for (const d of dirs) { try { ({ chromium } = createRequire(path.join(d, 'x.js'))('playwright')); break; } catch {} }
  if (!chromium) { console.error('playwright が見つからない。consulting-pptx-skill のフォルダで npm run setup するか、PLAYWRIGHT_MODULE_DIR で node_modules を指す'); process.exit(2); }
}

const file = process.argv[2];
if (!file) { console.error('使い方: node scripts/check.mjs <deck.html> [出力フォルダ]'); process.exit(2); }
const out = process.argv[3] || path.join(path.dirname(path.resolve(file)), 'check_out');
fs.mkdirSync(out, { recursive: true });
const url = pathToFileURL(path.resolve(file)).href;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const fails = [];
const wait = ms => new Promise(r => setTimeout(r, ms));

// 1) 自己点検
{
  const p = await ctx.newPage();
  await p.goto(url + '#check'); await p.waitForSelector('#selfcheck');
  const r = (await p.textContent('#selfcheck')).trim();
  if (r !== 'OK') fails.push(...r.split('\n').map(x => '自己点検: ' + x));
  await p.close();
}
// 2) 実操作
{
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await wait(400);
  const n = await p.$$eval('.pg', a => a.length);
  for (let i = 0; i < n; i++) {
    await p.keyboard.press(String(i + 1)); await wait(3200);
    const ops = await p.$$(`.pg.on [data-op]:not([data-op="zoom"])`);
    for (const o of ops.slice(0, 3)) {
      const tag = await o.evaluate(e => e.tagName);
      if (tag === 'INPUT') { await o.evaluate(e => { e.value = e.max; e.dispatchEvent(new Event('input')); }); }
      else { await o.click(); }
      await wait(700);
    }
    const d = await p.$('.pg.on [data-drawer]');
    if (d) {
      await d.click(); await wait(600);
      if (!await p.$eval('#stage', s => s.classList.contains('open'))) fails.push(`p.${i + 1}: 根拠パネルが開かない`);
      const tabs = await p.$$('#drawer .tabs button');
      if (tabs[1]) { await tabs[1].click(); await wait(200); }
      await p.keyboard.press('Escape'); await wait(500);
      if (await p.$eval('#stage', s => s.classList.contains('open'))) fails.push(`p.${i + 1}: Esc で根拠パネルが閉じない`);
    }
  }
  await p.keyboard.press('1'); await wait(2500);
  const on = () => p.evaluate(() => { const e = document.querySelector('.pg.on'); return e ? [...document.querySelectorAll('.pg')].indexOf(e) : -1; }).catch(() => -1);   // 資料の外へ出たら -1
  const z = await p.$('.pg.on [data-op="zoom"]');
  if (z) {
    await z.click(); await wait(900); if (await on() === 0) fails.push('p.1: ズームで他のページへ入れない');
    await p.click('#nav [data-nav="home"]'); await wait(900); if (await on() !== 0) fails.push('ナビ: ズームで入った後に「全体像」で p.1 へ戻れない');
  }
  // 常設ナビ：全ページで見えていて、出所の文字と重ならず、前へ・次へが効く
  if (!await p.$('#nav')) fails.push('常設ナビ（#nav）が無い');
  else {
    for (let i = 0; i < n; i++) {
      await p.keyboard.press(String(i + 1)); await wait(300);
      const hit = await p.evaluate(() => { const a = document.querySelector('#nav').getBoundingClientRect(), f = document.querySelector('.pg.on .foot span'); if (!f) return false; const b = f.getBoundingClientRect(); return a.width > 0 && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; });
      if (hit) fails.push(`p.${i + 1}: 常設ナビが出所の文字と重なる`);
      if (!await p.isVisible('#nav')) fails.push(`p.${i + 1}: 常設ナビが見えない`);
    }
    await p.keyboard.press('2'); await wait(300);
    await p.click('#nav [data-nav="next"]'); await wait(300); if (await on() !== 2) fails.push('ナビ: 次へが効かない');
    await p.click('#nav [data-nav="prev"]'); await wait(300); if (await on() !== 1) fails.push('ナビ: 前へが効かない');
    await p.keyboard.press('1'); await wait(300);
  }
  // ブラウザの戻る・進む
  try {
    await p.keyboard.press('1'); await wait(300);
    await p.click('#nav [data-nav="next"]'); await wait(300);
    await p.click('#nav [data-nav="next"]'); await wait(300);
    await p.goBack(); await wait(400); if (await on() !== 1) throw new Error('1つ前のページへ戻らない（資料の外へ出るか、別のページになる）');
    await p.goBack(); await wait(400); if (await on() !== 0) throw new Error('2つ前のページへ戻らない');
    await p.goForward(); await wait(400); if (await on() !== 1) fails.push('ブラウザの進む: 次のページへ進まない');
    await p.keyboard.press('o'); await wait(600);
    await p.goBack(); await wait(500);
    if (await p.$eval('#stage', s => s.classList.contains('ov')).catch(() => false)) fails.push('ブラウザの戻る: 一覧が閉じない');
    else if (await on() !== 1) fails.push('ブラウザの戻る: 一覧を閉じた後のページが違う');
  } catch (e) { fails.push('ブラウザの戻る・進む: ' + e.message.split(/\r?\n/)[0]); await p.goto(url); await wait(400); }
  await p.keyboard.press('o'); await wait(900);
  if (!await p.$eval('#stage', s => s.classList.contains('ov'))) fails.push('O で一覧に入らない');
  await p.screenshot({ path: path.join(out, 'overview.png') });
  await p.keyboard.press('Escape'); await wait(300);
  await p.keyboard.press('ArrowRight'); await wait(300);
  if (errs.length) fails.push(...errs.map(e => 'JSエラー: ' + e));
  await p.close();
}
// 3) 自動デモ
{
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(url); await wait(500);
  await p.keyboard.press('d');
  const t0 = Date.now();
  while (Date.now() - t0 < 120000) { await wait(1000); if (!await p.evaluate(() => typeof demoing !== 'undefined' && demoing)) break; }
  if (!await p.$eval('#stage', s => s.classList.contains('ov'))) fails.push('自動デモが一覧で終わらない（途中で止まったか台本の最後が o でない）');
  console.log(`自動デモ: ${Math.round((Date.now() - t0) / 1000)}秒`);
  if (errs.length) fails.push(...errs.map(e => 'デモ中のJSエラー: ' + e));
  await p.close();
}
// 4) 最終状態のスクリーンショット
{
  const p = await ctx.newPage();
  const n = await (await p.goto(url + '#static'), p.$$eval('.pg', a => a.length));
  for (let i = 1; i <= n; i++) { await p.goto(`${url}#static&p${i}`); await p.reload(); await wait(300); await p.screenshot({ path: path.join(out, `p${i}.png`) }); }
  await p.close();
}
await browser.close();
console.log(`スクリーンショット: ${out}`);
if (fails.length) { console.log('FAIL ' + fails.length + '\n' + fails.join('\n')); process.exit(1); }
console.log('OK（FAIL 0）。画像を全ページ目で見ること：棒が潰れていないか・下が空いていないか・判断が見えるか');
