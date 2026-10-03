const fs=require('node:fs'),{createRequire}=require('node:module');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
// Reuse private DOM/Canvas setup; the delivered HTML never contains these hooks.
const localRequire=createRequire(root+'/package.json');
let header=fs.readFileSync(root+'/tests/qa.cjs','utf8').split("assert(t,'test hooks loaded')")[0];
header=header.replace("const original=fs.readFileSync('game.html','utf8');","const original=fs.readFileSync(process.argv[2]||'game.html','utf8');");
const experiment=`
const results=[];t.startRun();t.completeWorld1();t.mainMenu();
for(const world of [1,2])for(const mode of ['natural','build-bot','build-still'])for(const initialSeed of [17,83,211]){
 let seed=initialSeed;w.Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 let scheduled=null;w.setTimeout=fn=>{scheduled=fn;return 1;};
 t.startRun(mode!=='build-still',world);t.g.ready=0;
 if(mode!=='natural'){for(const u of t.activeUpgrades()){u.apply(t.g.p);t.g.ranks[u.id]=1;}t.g.upgradesComplete=true;t.g.p.level=30;t.g.p.need=t.xpNeeded(30);t.g.time=t.g.worldTime=180;}
 let count=0,damage=0,hp=t.g.p.hp,minHP=hp,maxEnemies=0,enemies=0;
 const startTime=t.g.time,limit=mode==='natural'?600:180;
 for(let step=0;step<60*limit&&t.state!=='over'&&t.state!=='worldclear';step++){
  if(t.state==='upgrade'){t.unlockChoice();scheduled();}
  if(mode!=='natural'){t.g.p.level=30;t.g.p.xp=0;}
  if(mode==='build-still'){const target=t.g.enemies.filter(e=>!e.dead&&e.phase!=='buried').sort((a,b)=>Math.hypot(a.x-t.g.p.x,a.y-t.g.p.y)-Math.hypot(b.x-t.g.p.x,b.y-t.g.p.y))[0];if(target)t.g.aim={x:target.x,y:target.y};}
  hp=t.g.p.hp;t.update(1/60);damage+=Math.max(0,hp-t.g.p.hp);minHP=Math.min(minHP,t.g.p.hp);maxEnemies=Math.max(maxEnemies,t.g.enemies.length);enemies+=t.g.enemies.length;count++;
 }
 results.push({world,mode,seed:initialSeed,time:+(t.g.time-startTime).toFixed(1),state:t.state,level:t.g.p.level,upgrades:Object.keys(t.g.ranks).length,won:t.g.won,hp:+t.g.p.hp.toFixed(1),damage:+damage.toFixed(1),minHP:+minHP.toFixed(1),kills:t.g.kills,avgEnemies:+(enemies/count).toFixed(1),maxEnemies});
}
console.log(JSON.stringify(results,null,2));dom.window.close();`;
new Function('require','__dirname',header+experiment)(localRequire,root+'/tests');
