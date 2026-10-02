const fs=require('fs'),assert=require('assert'),{performance}=require('perf_hooks');
const {JSDOM}=require('jsdom');
const {createCanvas}=require('@napi-rs/canvas');
const path=require('path');
const projectRoot=path.resolve(__dirname,'..');
process.chdir(projectRoot);
const artifactDir=path.join(projectRoot,'tests','artifacts');
fs.mkdirSync(artifactDir,{recursive:true});
const writeImage=(name,bytes)=>fs.writeFileSync(path.join(artifactDir,name),bytes);
const original=fs.readFileSync('game.html','utf8');
const hooks='window.test={get spaceRegions(){return SPACE_REGIONS},updateSpace,spaceRegion,spaceMotion,emergencyWarp,get world2Unlocked(){return world2Unlocked},get gardenUpgrades(){return gardenUpgrades},activeUpgrades,updateGarden,damageEnemy,plantField,areaDamage,chainLightning,addBolt,shoot,dash,completeWorld1,enterWorld2,latePressure,beginFinalRound,spawnWave,gameOver,startRun,resumeRun,pauseRun,openUpgrade,chooseUpgrade,hurt,kill,spawnEnemy,edgeSpawn,buildGrid,updateBullets,updateEnemies,update,render,resize,mainMenu,particles,hostileShot,frame,get g(){return g},get state(){return state},get keys(){return keys},get blocked(){return blocked},get held(){return held},get W(){return W},get H(){return H},get best(){return best},get choices(){return choices},get upgradeList(){return upgradeList},xpNeeded,get allUpgradesMaxed(){return allUpgradesMaxed()},get botEnabled(){return botEnabled},setBotEnabled,thinkBot,unlockChoice(){choiceReady=0}};';
const html=original.replace('})();\n</script>',hooks+'})();\n</script>');
const errors=[],backgroundTimers=[];
const dom=new JSDOM(html,{url:'https://voidwake.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.setInterval=(fn,ms)=>{backgroundTimers.push({fn,ms});return 1;};w.innerWidth=1280;w.innerHeight=720;w.matchMedia=()=>({matches:false});w.requestAnimationFrame=()=>0;
  w.addEventListener('error',e=>errors.push(e.message));
  const proto=w.HTMLCanvasElement.prototype;
  for(const dimension of ['width','height']){const descriptor=Object.getOwnPropertyDescriptor(proto,dimension);Object.defineProperty(proto,dimension,{...descriptor,set(value){descriptor.set.call(this,value);if(this.native)this.native[dimension]=value;}});}
  proto.getContext=function(){if(!this.native)this.native=createCanvas(this.width,this.height);if(!this.proxy){const target=this.native.getContext('2d');this.proxy=new Proxy(target,{get(t,key){if(key==='drawImage')return (...args)=>{args[0]=args[0].native||args[0];return t.drawImage(...args);};const v=t[key];return typeof v==='function'?v.bind(t):v;},set(t,k,v){t[k]=v;return true;}});}return this.proxy;};
  proto.setPointerCapture=()=>{};proto.releasePointerCapture=()=>{};
}});
const w=dom.window,t=w.test,canvas=w.document.getElementById('space');
const key=(type,code,repeat=false)=>w.document.dispatchEvent(new w.KeyboardEvent(type,{code,repeat,bubbles:true,cancelable:true}));
const step=n=>{for(let i=0;i<n;i++)t.update(1/60);};
assert(t,'test hooks loaded');assert.equal(t.xpNeeded(1),70);assert.equal(t.xpNeeded(2),95);assert.equal(t.xpNeeded(5),156);assert(t.xpNeeded(10)>230&&t.xpNeeded(10)<250,'early costs grow smoothly');for(let level=2;level<=100;level++){assert(t.xpNeeded(level)>=t.xpNeeded(level-1),'XP costs never decrease');assert(t.xpNeeded(level)-t.xpNeeded(level-1)<=25,'XP growth has no sudden jumps');}assert.equal(t.xpNeeded(100),1000,'XP threshold is capped at 1000');assert.equal(t.state,'start');assert.equal(errors.length,0);t.render();
t.startRun();assert.equal(t.state,'playing');assert.equal(t.g.enemies.length,0);assert.equal(t.g.score,0);assert.equal(t.g.p.hp,120);assert(t.g.p.invuln>=2);
step(40);key('keydown','KeyD');const beforeX=t.g.p.x;step(20);assert(t.g.p.x>beforeX,'WASD moves ship');
const oldAim={...t.g.aim};t.g.p.xp=t.g.p.need;t.openUpgrade();assert.equal(t.state,'upgrade');assert.equal(t.keys.size,0);assert(t.blocked.has('KeyD'));assert.equal(w.document.querySelectorAll('.upgrade-card').length,3);const frozen=t.g.time;step(100);assert.equal(t.g.time,frozen);assert.equal(t.g.aim.x,oldAim.x);
t.unlockChoice();w.document.querySelector('.upgrade-card').click();assert.equal(t.state,'playing');assert(t.g.ready>0);assert(t.g.p.invuln>=1.2);step(31);assert.equal(t.g.time,frozen,'resume guard freezes world');const stopped=t.g.p.x;key('keydown','KeyD',true);step(20);assert.equal(t.g.p.x,stopped,'held key cannot leak through upgrade');key('keyup','KeyD');key('keydown','KeyD');step(10);assert(t.g.p.x>stopped);key('keyup','KeyD');
t.pauseRun();const paused=t.g.time;step(60);assert.equal(t.g.time,paused);key('keydown','KeyP');assert.equal(t.state,'playing');key('keyup','KeyP');w.dispatchEvent(new w.Event('blur'));assert.equal(t.state,'playing','blurring does not pause the run');
t.startRun();t.g.ready=0;t.g.spawn=999;t.g.p.invuln=0;const initialHp=t.g.p.hp;t.hurt(18,0,0);t.hurt(18,0,0);assert.equal(t.g.p.hp,initialHp-18);step(60);t.hurt(18,0,0);assert.equal(t.g.p.hp,initialHp-18);step(24);t.hurt(18,0,0);assert.equal(t.g.p.hp,initialHp-36);
for(const [x,y] of [[24,125],[1256,125],[24,650],[1256,650],[640,360]]){t.g.p.x=x;t.g.p.y=y;for(let i=0;i<100;i++){t.g.enemies=[];t.edgeSpawn('stalker');const e=t.g.enemies[0];assert(Math.hypot(e.x-x,e.y-y)>300,'edge spawn safely separated');assert(e.x<0||e.x>t.W||e.y<0||e.y>t.H);}}
for(const level of [1,2,3,4,5,10,40]){t.startRun();t.g.ready=0;t.g.spawn=999;t.g.p.level=level;t.g.p.need=t.xpNeeded(level);t.g.p.xp=t.g.p.need;t.g.time=.5;t.update(.01);assert.equal(t.state,'upgrade','every level upgrades from XP with no time gate');assert.equal(t.g.p.level,level+1);}t.startRun();t.g.ready=0;t.g.spawn=999;t.g.time=200;t.update(.01);assert.equal(t.state,'playing','time alone never grants upgrades');t.g.p.xp=t.g.p.need-1;t.g.drops.push({x:t.g.p.x,y:t.g.p.y,vx:0,vy:0,value:10,heal:false,life:40,r:6});t.update(.01);assert.equal(t.state,'upgrade');assert.equal(t.g.p.xp,9,'all surplus core XP carries forward');assert.equal(t.g.score,0,'XP no longer converts to score');t.unlockChoice();t.chooseUpgrade(0);t.g.ready=0;step(120);assert.equal(t.state,'playing','one core cannot chain early upgrades');assert(!w.document.getElementById('xp-label').textContent.includes('UPGRADE IN'));
t.startRun();t.g.ready=0;t.g.spawn=999;t.g.enemies=[];t.spawnEnemy('lancer',800,360);const lancer=t.g.enemies[0];lancer.cool=0;lancer.age=2;t.updateEnemies(.01);assert.equal(lancer.phase,'windup');t.updateEnemies(.8);assert.equal(lancer.phase,'charge');
t.g.enemies=[];t.spawnEnemy('oracle',890,360);const oracle=t.g.enemies[0];oracle.cool=0;oracle.age=2;t.updateEnemies(.01);assert.equal(oracle.phase,'windup');t.updateEnemies(.9);assert(t.g.hostile.length>0,'ranged enemy fires');
t.g.enemies=[];t.spawnEnemy('brute',800,360);const brute=t.g.enemies[0];t.kill(brute);assert.equal(t.g.enemies.filter(e=>e.type==='shard').length,2);assert(t.g.enemies.filter(e=>e.type==='shard').every(e=>e.grace>.5));
t.g.enemies=[];t.g.bullets=[];for(let i=0;i<3;i++)t.spawnEnemy('stalker',450+i*70,300);t.buildGrid();t.g.bullets.push({x:300,y:300,vx:12000,vy:0,r:4,damage:100,left:3,hits:[],life:1,dead:false});t.updateBullets(.04);assert(t.g.enemies.every(e=>e.dead),'swept piercing shots hit all targets');
t.startRun();assert.equal(t.g.p.need,70,'new runs use the balanced starting requirement');t.g.ready=0;t.g.spawn=999;t.g.p.xp=t.g.p.need-1;t.g.time=100;t.update(.01);assert.equal(t.state,'playing');t.g.p.xp++;t.g.time=.01;t.update(.01);assert.equal(t.state,'upgrade','reaching the XP threshold is the only upgrade trigger');
t.startRun();t.g.ready=0;t.g.spawn=999;t.g.p.xp=t.g.p.need;for(const u of t.upgradeList)t.g.ranks[u.id]=u.max;t.g.ranks[t.upgradeList.at(-1).id]=t.upgradeList.at(-1).max-1;t.openUpgrade();assert.equal(t.choices.length,1,'only one non-maxed upgrade remains');assert(t.choices.every(u=>!t.upgradeList.some(base=>base.id===u.id&&(t.g.ranks[u.id]||0)>=base.max)),'maxed upgrades stay out of the menu');const finalIndex=t.choices.findIndex(u=>u.id===t.upgradeList.at(-1).id);t.unlockChoice();t.chooseUpgrade(finalIndex);assert(t.allUpgradesMaxed,'all primary upgrades are maxed');assert.equal(t.g.upgradesComplete,true);assert.equal(w.document.getElementById('toast').textContent,'ALL UPGRADES ACHIEVED');assert.equal(w.document.getElementById('xp-label').textContent,'ALL UPGRADES ACHIEVED');const savedXp=t.g.p.xp;t.g.time+=30;t.g.p.xp=t.g.p.need;t.update(.1);assert.equal(t.state,'playing','completion never opens an empty or repeatable menu');assert.equal(w.document.getElementById('xp-label').textContent,'ALL UPGRADES ACHIEVED');t.g.p.xp=savedXp;
t.startRun();t.g.ready=0;t.g.spawn=999;t.g.score=12345;t.g.p.invuln=0;t.hurt(200,0,0);assert.equal(t.state,'over');assert.equal(t.best,12345);assert.equal(w.localStorage.getItem('void-wake-best-v1'),'12345');assert.equal(w.document.getElementById('final-score').textContent,'12,345');w.document.getElementById('restart-button').click();assert.equal(t.state,'playing');assert.equal(t.g.time,0);assert.equal(t.g.score,0);assert.equal(t.g.p.level,1);assert.equal(t.g.p.damage,20);assert.equal(t.g.p.hp,120);assert.equal(t.g.enemies.length,0);assert.equal(t.g.bullets.length,0);assert.equal(t.g.hostile.length,0);assert.equal(Object.keys(t.g.ranks).length,0);
for(let i=0;i<1000;i++)t.spawnEnemy('stalker',900,300);assert.equal(t.g.enemies.length,150);for(let i=0;i<1000;i++)t.hostileShot(t.g.enemies[0],0);assert.equal(t.g.hostile.length,200);t.particles(500,500,'red',10000);assert.equal(t.g.particles.length,520);
t.startRun();t.g.ready=0;t.g.p.invuln=99999;let maxEnemies=0,maxBullets=0,maxDrops=0,upgrades=0;const start=performance.now();
for(let i=0;i<60*240;i++){
  if(t.state==='upgrade'){upgrades++;t.unlockChoice();t.chooseUpgrade(Math.floor(Math.random()*3));t.g.ready=0;t.g.p.invuln=99999;}
  const g=t.g;g.p.x=640+Math.cos(g.time*.42)*260;g.p.y=360+Math.sin(g.time*.42)*180;
  const target=g.enemies.filter(e=>!e.dead).sort((a,b)=>Math.hypot(a.x-g.p.x,a.y-g.p.y)-Math.hypot(b.x-g.p.x,b.y-g.p.y))[0];if(target)g.aim={x:target.x,y:target.y};
  t.update(1/60);maxEnemies=Math.max(maxEnemies,g.enemies.length);maxBullets=Math.max(maxBullets,g.bullets.length);maxDrops=Math.max(maxDrops,g.drops.length);
}
const elapsed=performance.now()-start;t.render();writeImage('arena-qa.png',canvas.native.toBuffer('image/png'));
assert.equal(t.state,'playing');assert(t.g.time>235);assert(upgrades>=3);assert(maxEnemies<=150&&maxBullets<=340&&maxDrops<=220);assert.equal(errors.length,0);
w.innerWidth=390;w.innerHeight=844;t.resize();t.render();writeImage('arena-mobile-qa.png',canvas.native.toBuffer('image/png'));assert(Number.isFinite(t.g.p.x)&&Number.isFinite(t.g.p.y));assert(t.g.p.x>0&&t.g.p.x<t.W);assert(t.g.p.y>0&&t.g.p.y<t.H);
for(const e of [...t.g.enemies,...t.g.bullets,...t.g.hostile,...t.g.drops])assert(Number.isFinite(e.x)&&Number.isFinite(e.y));
t.mainMenu();w.document.getElementById('bot-play-button').click();assert.equal(t.state,'playing');assert.equal(t.botEnabled,true,'Watch Bot starts an automated run');assert.equal(w.document.getElementById('bot-toggle').textContent,'BOT: ON');t.g.ready=0;t.g.spawn=999;t.g.p.invuln=999;t.g.p.x=640;t.g.p.y=360;t.g.enemies=[];for(const [time,quadrant] of [[0,0],[4.19,0],[4.2,1],[8.4,2],[12.6,3],[16.8,0]]){t.g.time=time;t.thinkBot();assert.equal(t.g.bot.quadrant,quadrant,'bot advances through route quadrants every 4.2 seconds');assert(Math.hypot(t.g.bot.move.x,t.g.bot.move.y)>.99,'bot never remains still, even while shooting');}t.g.time=0;t.g.bot.quadrantSince=0;for(let i=0;i<7;i++)t.spawnEnemy('stalker',750+(i%3)*40,300+Math.floor(i/3)*35);const botStart={x:t.g.p.x,y:t.g.p.y};for(let i=0;i<600;i++)t.update(1/60);assert(t.g.score>0,'bot aims and fires at enemies');assert(Math.hypot(t.g.p.x-botStart.x,t.g.p.y-botStart.y)>5,'bot moves to avoid threats');let scheduled=null;const nativeTimeout=w.setTimeout;w.setTimeout=(fn,ms)=>{assert.equal(ms,700,'bot briefly displays each upgrade choice');scheduled=fn;return 1;};t.g.p.level=5;t.g.p.need=t.xpNeeded(5);t.g.p.xp=t.g.p.need;t.g.updateNever=0;t.update(.02);assert.equal(t.state,'upgrade','bot run pauses at an upgrade');assert.equal(typeof scheduled,'function');t.unlockChoice();scheduled();assert.equal(t.state,'playing','bot selects upgrades automatically');assert(Object.values(t.g.ranks).some(rank=>rank>0));w.setTimeout=nativeTimeout;key('keydown','KeyB');assert.equal(t.botEnabled,false,'B returns control to the player');key('keyup','KeyB');w.document.getElementById('bot-toggle').click();assert.equal(t.botEnabled,true,'HUD toggle re-enables the bot');assert.equal(w.document.getElementById('bot-toggle').getAttribute('aria-pressed'),'true');w.document.getElementById('bot-toggle').click();assert.equal(t.botEnabled,false);assert.equal(errors.length,0);

// Space systems are one-time upgrades, and completed builds still reach level 50.
w.innerWidth=1280;w.innerHeight=720;t.resize();t.startRun(false);assert.equal(t.upgradeList.length,20);assert(t.upgradeList.every(u=>u.max===1));for(let i=0;i<20;i++){t.g.p.xp=t.g.p.need;t.openUpgrade();assert(t.choices.every(u=>!t.g.ranks[u.id]));t.unlockChoice();t.chooseUpgrade(0);}assert.equal(t.g.p.level,21);assert.equal(t.g.upgradesComplete,true);assert.equal(Object.keys(t.g.ranks).length,20);assert(t.g.p.rail&&t.g.p.missiles&&t.g.p.defense&&t.g.p.tesla&&t.g.p.ionTrail&&t.g.p.fusion&&t.g.p.overdrive&&t.g.p.emergencyWarp);t.g.ready=0;t.g.p.invuln=99999;t.g.spawn=999;t.g.p.xp=t.g.p.need;t.update(.02);assert.equal(t.g.p.level,22);assert.equal(t.state,'playing');
// Regions are driven by progression and render different space locations.
for(const [level,region] of [[1,0],[11,1],[21,2],[31,3],[41,4]]){t.g.p.level=level;t.updateSpace(.01);assert.equal(t.g.space.region,region);t.render();writeImage('space-region-'+region+'-qa.png',canvas.native.toBuffer('image/png'));}
t.g.p.level=31;t.updateSpace(.01);t.g.space.eventTimer=0;t.updateSpace(.01);assert(t.g.fields.some(f=>f.kind==='rift'));
t.g.p.level=21;t.updateSpace(.01);t.g.fields=[];t.g.space.eventTimer=0;t.updateSpace(.01);assert(t.g.fields.some(f=>f.kind==='flare'&&f.warn>=2.2));const flare=t.g.fields[0];t.g.p.x=flare.x;t.g.p.y=flare.y;t.g.p.invuln=0;t.g.p.emergencyWarp=false;const preFlareHP=t.g.p.hp;t.updateSpace(.5);assert.equal(t.g.p.hp,preFlareHP,'solar flare warns before hitting');t.updateSpace(1.8);assert.equal(t.g.p.hp,preFlareHP-26);
t.g.fields=[];t.g.p.level=11;t.updateSpace(.01);t.g.space.eventTimer=0;t.updateSpace(.01);assert(t.g.enemies.some(e=>e.type==='asteroid'&&e.grace>=2));
// Snipers aim before firing and carriers release safely separated escorts.
t.startRun();t.g.ready=0;t.g.spawn=999;t.g.p.invuln=99999;t.spawnEnemy('sniper',950,350);const sniper=t.g.enemies[0];sniper.cool=0;sniper.age=2;t.updateEnemies(.01);assert.equal(sniper.phase,'windup');t.updateEnemies(1.5);assert(t.g.hostile.some(b=>Math.hypot(b.vx,b.vy)>470));t.g.enemies=[];t.spawnEnemy('carrier',900,300);const carrier=t.g.enemies[0];carrier.age=2;carrier.cool=0;t.updateEnemies(.01);for(let i=0;i<80;i++)t.updateEnemies(1/60);assert(t.g.enemies.filter(e=>e.type==='interceptor').length>=2);assert(t.g.enemies.filter(e=>e.type==='interceptor').every(e=>e.x<0||e.x>t.W||e.y<0||e.y>t.H));
t.g.enemies=[];t.spawnEnemy('specter',950,350);const ghost=t.g.enemies[0];ghost.age=6.1;t.updateEnemies(.01);assert.equal(ghost.cloaked,true);const ghostHP=ghost.hp;t.damageEnemy(ghost,20);assert.equal(ghostHP-ghost.hp,5);
// Rail slugs retain speed despite guidance. Emergency warp triggers once.
t.startRun();t.g.ready=0;t.g.spawn=999;t.g.p.rail=true;t.g.p.homing=4.5;for(let i=0;i<7;i++)t.shoot();const rail=t.g.bullets.find(b=>b.kind==='rail');assert(rail&&rail.left===8);t.buildGrid();t.updateBullets(.01);assert(Math.hypot(rail.vx,rail.vy)>3000);
t.g.p.emergencyWarp=true;t.g.p.hp=5;t.g.p.invuln=0;t.hurt(20,0,0);assert.equal(t.state,'playing');assert.equal(t.g.p.warpUsed,true);assert.equal(t.g.p.hp,Math.ceil(t.g.p.maxHp*.45));assert(t.g.p.invuln>=3);t.g.p.invuln=0;t.g.ready=0;t.hurt(999,0,0);assert.equal(t.state,'over','emergency warp is spent after one rescue');
// Full space build exercises its weapons, effects, hazards, and collection loop.
t.startRun(true);for(const u of t.upgradeList){u.apply(t.g.p);t.g.ranks[u.id]=1;}t.g.upgradesComplete=true;t.g.p.level=31;t.g.p.need=1000;t.g.p.invuln=99999;t.g.ready=0;t.g.p.xp=0;let spaceMaxEnemies=0,spaceMaxBullets=0,spaceMaxFields=0,spaceMaxFX=0;const spaceStart=performance.now();for(let i=0;i<60*120;i++){t.update(1/60);spaceMaxEnemies=Math.max(spaceMaxEnemies,t.g.enemies.length);spaceMaxBullets=Math.max(spaceMaxBullets,t.g.bullets.length);spaceMaxFields=Math.max(spaceMaxFields,t.g.fields.length);spaceMaxFX=Math.max(spaceMaxFX,t.g.fx.length);}const spaceElapsed=performance.now()-spaceStart;assert.equal(t.state,'playing');assert(spaceMaxEnemies<=150&&spaceMaxBullets<=340&&spaceMaxFields<=32&&spaceMaxFX<=80);assert(t.g.p.level>=32,'space build keeps collecting XP after all systems are installed');for(const e of [...t.g.enemies,...t.g.bullets,...t.g.hostile,...t.g.fields])assert(Number.isFinite(e.x)&&Number.isFinite(e.y));t.render();writeImage('space-rebuild-qa.png',canvas.native.toBuffer('image/png'));w.innerWidth=390;w.innerHeight=844;t.resize();t.render();writeImage('space-rebuild-mobile-qa.png',canvas.native.toBuffer('image/png'));w.innerWidth=1280;w.innerHeight=720;t.resize();
// The bot reaches corner cores instead of only orbiting the center.
w.innerWidth=1280;w.innerHeight=720;t.resize();t.startRun(true);t.g.ready=0;t.g.spawn=999;t.g.p.invuln=99999;t.g.p.x=260;t.g.p.y=200;t.g.drops.push({x:80,y:130,vx:0,vy:0,value:10,heal:false,life:40,r:6});let closestCorner=Infinity;for(let i=0;i<180;i++){t.update(1/60);closestCorner=Math.min(closestCorner,Math.hypot(t.g.p.x-80,t.g.p.y-130));}assert(t.g.p.xp>=10,'corner XP is collected by the bot');assert(closestCorner<85,'bot travels toward the corner');assert(Math.hypot(t.g.bot.move.x,t.g.bot.move.y)>.99);
// A late-World-2 bot must route around warning circles instead of hovering at an edge.
t.completeWorld1();
for(const [width,height] of [[1280,720],[390,844]])for(const bottom of [false,true])for(const kind of ['root','spore']){
  w.innerWidth=width;w.innerHeight=height;t.resize();t.startRun(true,2);
  for(const u of t.gardenUpgrades){u.apply(t.g.p);t.g.ranks[u.id]=1;}t.g.upgradesComplete=true;
  const p=t.g.p,scale=Math.min(width,height)/720,y=bottom?t.H-45/scale-38:90/scale+38;
  p.x=t.W*.5;p.y=y;p.level=48;p.need=t.xpNeeded(48);p.invuln=999;p.dashCd=999;
  t.g.ready=0;t.g.spawn=999;t.g.time=70;t.g.worldTime=70;t.g.season=2;
  t.g.bot.quadrant=bottom?3:1;t.g.bot.quadrantSince=70;
  t.plantField(p.x+(bottom?-40:40),y,70,{kind,warn:1.9,duration:3});
  const field=t.g.fields[0];let checkpoint=null;
  for(let i=0;i<108;i++){
    const quadrant=t.g.bot.quadrant,before={x:p.x,y:p.y};t.update(1/60);
    if(t.g.bot.quadrant!==quadrant){
      const left=Math.min(80,t.W*.12),route=[{x:left,y:90/scale+38},{x:t.W-left,y:90/scale+38},{x:t.W-left,y:t.H-45/scale-38},{x:left,y:t.H-45/scale-38}];
      assert(Math.hypot(before.x-route[quadrant].x,before.y-route[quadrant].y)<65,'corner target changes only upon arrival during this short detour');
    }
    if(i===59)checkpoint={x:p.x,y:p.y};
  }
  assert(field.age<field.warn,'circle is still in its warning phase');
  assert(Math.hypot(p.x-checkpoint.x,p.y-checkpoint.y)>70,`${width}x${height} ${kind}: bot keeps traveling during warning`);
  assert(Math.hypot(p.x-field.x,p.y-field.y)>field.r+p.r,'bot clears the warning circle before activation');
}
w.innerWidth=1280;w.innerHeight=720;t.resize();
// Starting at the center also has an escape direction; friendly circles do not repel.
for(const kind of ['root','spore']){
  t.startRun(true,2);t.g.ready=0;t.g.spawn=999;t.g.p.level=48;t.g.p.invuln=999;t.g.p.dashCd=999;
  t.g.time=70;t.g.worldTime=70;t.g.season=2;t.g.bot.quadrantSince=70;
  t.plantField(t.g.p.x,t.g.p.y,70,{kind,warn:1.9,duration:3});const field=t.g.fields[0];
  step(60);assert(Math.hypot(t.g.p.x-field.x,t.g.p.y-field.y)>field.r+t.g.p.r,'bot escapes from the center before activation');
}
t.startRun(true,2);t.g.ready=0;t.thinkBot();const friendlyMove={...t.g.bot.move};
t.plantField(t.g.p.x,t.g.p.y,95,{friendly:true,kind:'ice'});t.thinkBot();
assert.equal(t.g.bot.move.x,friendlyMove.x);assert.equal(t.g.bot.move.y,friendlyMove.y);
// A shot on either side must push the bot away from its projected path.
for(const world of [1,2])for(const [vx,vy,offsetX,offsetY,quadrant] of [[225,0,0,30,0],[225,0,0,-30,2],[0,225,30,0,0],[0,225,-30,0,2]]){
  t.startRun(true,world);t.g.ready=0;t.g.p.level=48;t.g.time=70;t.g.bot.quadrantSince=70;
  t.g.bot.quadrant=quadrant;t.g.p.dashCd=999;t.thinkBot();
  const before={...t.g.bot.move};
  t.g.hostile=[{x:t.g.p.x-vx*.5-offsetX,y:t.g.p.y-vy*.5-offsetY,vx,vy,r:5,life:8,damage:20,dead:false}];
  t.thinkBot();const after=t.g.bot.move;
  assert((after.x-before.x)*offsetX+(after.y-before.y)*offsetY>0,'dodge turns away from the shot path');
}
// Later levels raise the chance and strength of warden spawns.
t.startRun();t.g.ready=0;t.g.spawn=999;t.g.time=300;t.g.p.level=40;assert.equal(t.latePressure(),0);t.g.p.level=41;assert(t.latePressure()>0);t.g.p.level=49;assert(t.latePressure()>=.9);t.g.p.level=50;assert.equal(t.latePressure(),1);
// Existing enemies are cleared before the twenty final wardens arrive.
t.startRun();t.g.ready=0;t.g.spawn=999;t.g.p.invuln=99999;t.spawnEnemy('warden',900,300);t.g.p.level=50;t.update(.01);assert.equal(t.g.finalRound.clearing,true);t.spawnWave();assert.equal(t.g.finalRound.spawned,0);t.kill(t.g.enemies[0]);t.update(.01);assert.equal(t.g.finalRound.clearing,false);assert.equal(t.g.finalRound.defeated,0,'earlier wardens do not count as final wardens');
t.startRun();t.g.ready=0;t.g.spawn=999;t.g.time=300;t.g.p.level=50;
// The finale is finite, warden-only, and cannot finish before all arrivals.
t.g.p.invuln=99999;t.g.nextBoss=0;t.update(.01);assert(t.g.finalRound);assert.equal(t.g.finalRound.total,20);t.g.enemies=[];t.g.spawn=999;t.update(.01);assert.equal(t.state,'playing','empty field before final arrivals does not win');
for(let i=0;i<25;i++)t.spawnWave();assert.equal(t.g.finalRound.spawned,20);assert.equal(t.g.enemies.length,20);assert(t.g.enemies.every(e=>e.type==='warden'&&e.finalWarden));t.spawnEnemy('brute',600,300);assert.equal(t.g.enemies.length,20,'final round rejects non-warden spawns');for(const e of [...t.g.enemies])t.kill(e);assert.equal(t.g.finalRound.defeated,20);t.g.spawn=0;t.update(.01);assert.equal(t.state,'worldclear');assert.equal(t.world2Unlocked,true);assert.equal(w.localStorage.getItem('void-wake-world2-v2'),'yes');assert.equal(w.document.getElementById('world2-button').disabled,false);const clearTime=t.g.time,clearScore=t.g.score;step(30);assert.equal(t.g.time,clearTime,'world transition freezes simulation');w.document.getElementById('enter-world2').click();assert.equal(t.state,'playing');assert.equal(t.g.world,2);assert.equal(t.g.time,clearTime);assert.equal(t.g.score,clearScore);assert.equal(t.g.worldTime,0);assert.equal(t.g.p.level,1);assert.equal(t.g.p.hp,180);assert.equal(t.g.p.projectiles,2);assert.equal(t.g.enemies.length,0);assert(t.g.ready>=1);assert(t.g.p.invuln>=3);assert(w.document.body.classList.contains('world-theme'));assert.equal(t.activeUpgrades().length,24);assert(t.activeUpgrades().every(u=>u.max===1));t.render();writeImage('chloris-entry-qa.png',canvas.native.toBuffer('image/png'));
// Enemy mechanics: aimed thorn fans, telegraphed burrowing, timed armor, and hive fields.
t.g.ready=0;t.g.spawn=999;t.g.p.invuln=99999;t.spawnEnemy('thorn',950,350);const thorn=t.g.enemies[0];thorn.cool=0;thorn.age=2;t.updateEnemies(.01);assert.equal(thorn.phase,'windup');t.updateEnemies(1);assert(t.g.hostile.length>=3);
t.g.enemies=[];t.spawnEnemy('burrower',930,300);const worm=t.g.enemies[0];worm.cool=0;worm.age=2;t.updateEnemies(.01);assert.equal(worm.phase,'buried');t.updateEnemies(.7);assert.equal(worm.phase,'emerge');const emergeHP=t.g.p.hp;t.updateEnemies(.2);assert.equal(t.g.p.hp,emergeHP,'telegraphed ambusher cannot immediately hit');t.updateEnemies(1.3);assert.equal(worm.phase,'charge');
t.g.enemies=[];t.spawnEnemy('shell',920,320);const shell=t.g.enemies[0];const shellHP=shell.hp;t.damageEnemy(shell,10);assert(Math.abs(shellHP-shell.hp-3.2)<.001);shell.age=3;const openHP=shell.hp;t.damageEnemy(shell,10);assert.equal(openHP-shell.hp,10,'shell exposes armor on a timer');
t.g.enemies=[];t.spawnEnemy('hive',900,300);const hive=t.g.enemies[0];hive.age=2;hive.cool=0;t.updateEnemies(.01);t.updateEnemies(1.2);assert(t.g.fields.some(f=>f.kind==='spore'&&f.warn>=1.8));
// Warning fields do no damage before activation and respect invulnerability.
t.startRun(false,2);t.g.ready=0;t.g.spawn=999;t.g.p.invuln=0;t.plantField(t.g.p.x,t.g.p.y,70,{warn:1.9,duration:3});const beforeFieldHP=t.g.p.hp;t.updateGarden(.7);assert.equal(t.g.p.hp,beforeFieldHP);t.updateGarden(1.3);assert.equal(t.g.p.hp,beforeFieldHP-20);t.updateGarden(.3);assert.equal(t.g.p.hp,beforeFieldHP-20);
// Every adaptation is unique; completing the tree still allows XP levels up to 50.
t.startRun(false,2);for(let i=0;i<24;i++){t.g.p.xp=t.g.p.need;t.openUpgrade();assert.equal(t.state,'upgrade');assert(t.choices.every(u=>!t.g.ranks[u.id]));t.unlockChoice();t.chooseUpgrade(0);}assert.equal(Object.keys(t.g.ranks).length,24);assert(t.allUpgradesMaxed);assert.equal(t.g.upgradesComplete,true);assert.equal(t.g.p.level,25);assert(t.g.p.orbit&&t.g.p.chain&&t.g.p.nova&&t.g.p.frost&&t.g.p.guard&&t.g.p.drones&&t.g.p.ricochet);t.g.ready=0;t.g.spawn=999;t.g.p.invuln=99999;t.g.p.xp=t.g.p.need;t.update(.02);assert.equal(t.g.p.level,26);assert.equal(t.state,'playing','maxed tree never opens repeatable choices');
// Shield blocks once, then regrows. Bolts ricochet. Dash plants a friendly field.
t.g.p.invuln=0;t.g.p.shield=true;const shieldHP=t.g.p.hp;t.hurt(20,0,0);assert.equal(t.g.p.hp,shieldHP);assert.equal(t.g.p.shield,false);assert(t.g.p.invuln>0);t.updateGarden(12.1);assert.equal(t.g.p.shield,true);t.g.fields=[];t.g.p.dashCd=0;t.dash({x:1,y:0});assert(t.g.fields.some(f=>f.friendly));t.g.bullets=[];t.g.enemies=[];t.addBolt(t.W-5,300,0,10);t.buildGrid();t.updateBullets(.05);assert(t.g.bullets[0].vx<0);assert.equal(t.g.bullets[0].bounces,1);
// Stress the new world with every power active through all four seasons.
t.g.p.invuln=99999;t.g.p.dash=0;t.g.p.level=26;t.g.p.need=1000;t.g.p.xp=0;t.g.spawn=.1;t.setBotEnabled(true);let gardenMaxEnemies=0,gardenMaxBullets=0,gardenMaxFields=0,gardenMaxFX=0;const gardenStart=performance.now();for(let i=0;i<60*180;i++){if(t.state==='upgrade'){t.unlockChoice();t.chooseUpgrade(0);t.g.ready=0;}t.update(1/60);gardenMaxEnemies=Math.max(gardenMaxEnemies,t.g.enemies.length);gardenMaxBullets=Math.max(gardenMaxBullets,t.g.bullets.length);gardenMaxFields=Math.max(gardenMaxFields,t.g.fields.length);gardenMaxFX=Math.max(gardenMaxFX,t.g.fx.length);}const gardenElapsed=performance.now()-gardenStart;assert.equal(t.state,'playing');assert(t.g.worldTime>=179);assert(gardenMaxEnemies<=150&&gardenMaxBullets<=340&&gardenMaxFields<=32&&gardenMaxFX<=80);for(const e of [...t.g.enemies,...t.g.bullets,...t.g.hostile,...t.g.drops,...t.g.fields])assert(Number.isFinite(e.x)&&Number.isFinite(e.y));t.render();writeImage('chloris-qa.png',canvas.native.toBuffer('image/png'));
w.innerWidth=390;w.innerHeight=844;t.resize();t.render();writeImage('chloris-mobile-qa.png',canvas.native.toBuffer('image/png'));w.innerWidth=1280;w.innerHeight=720;t.resize();
// The final siege is three Dreadblooms, then one Heart, with an actual ending.
t.startRun(false,2);t.g.ready=0;t.g.spawn=999;t.g.p.invuln=99999;t.g.p.level=50;t.update(.01);assert.equal(t.g.finalRound.total,4);for(let i=0;i<12;i++)t.spawnWave();assert.equal(t.g.finalRound.spawned,3);assert(t.g.enemies.every(e=>e.type==='dreadbloom'));for(const e of [...t.g.enemies])t.kill(e);t.g.enemies=t.g.enemies.filter(e=>!e.dead);t.spawnWave();assert.equal(t.g.finalRound.spawned,4);assert.equal(t.g.enemies[0].type,'heart');const heart=t.g.enemies[0];heart.cool=0;heart.age=3;heart.hp=heart.maxHp*.25;t.updateEnemies(.01);t.updateEnemies(1.5);assert(t.g.hostile.length>10);assert(t.g.fields.length>=3);t.render();writeImage('chloris-heart-qa.png',canvas.native.toBuffer('image/png'));t.kill(heart);t.g.spawn=0;t.update(.01);assert.equal(t.state,'over');assert.equal(t.g.won,true);assert(w.document.getElementById('over-title').textContent.includes('You win'));const victoryTime=t.g.time;step(30);assert.equal(t.g.time,victoryTime);w.document.getElementById('restart-button').click();assert.equal(t.g.world,2);assert.equal(t.g.finalRound,null);assert.equal(t.g.p.level,1);assert.equal(Object.keys(t.g.ranks).length,0);assert.equal(t.g.fields.length,0);assert.equal(t.g.won,false);
t.mainMenu();assert(!w.document.body.classList.contains('world-theme'));assert.equal(w.document.getElementById('world2-button').disabled,false);w.document.getElementById('world2-bot-button').click();assert.equal(t.g.world,2);assert.equal(t.botEnabled,true);
// Auto-pilot transitions to World 2 without needing a click.
t.startRun(true);let transition=null;w.setTimeout=(fn,ms)=>{assert.equal(ms,2000);transition=fn;return 1;};t.completeWorld1();assert.equal(t.state,'worldclear');assert.equal(typeof transition,'function');transition();assert.equal(t.state,'playing');assert.equal(t.g.world,2);assert.equal(t.botEnabled,true);w.setTimeout=nativeTimeout;
t.startRun(true);t.g.ready=0;t.g.spawn=999;t.g.p.invuln=99999;t.frame(1000);t.frame(2000);assert(t.g.time>=.98,'simulation catches up after a one-second background frame');w.dispatchEvent(new w.Event('blur'));assert.equal(t.state,'playing','losing focus no longer pauses the run');t.frame(62000);assert(t.g.time>=4.9,'long background gaps advance the game instead of freezing');Object.defineProperty(w.document,'hidden',{configurable:true,value:true});w.document.dispatchEvent(new w.Event('visibilitychange'));assert.equal(t.state,'playing','hiding the tab does not pause the game');assert(backgroundTimers.some(x=>x.ms===200),'offline background timer is installed when workers are unavailable');const oldNow=w.performance.now;w.performance.now=()=>63000;const backgroundTime=t.g.time;backgroundTimers.find(x=>x.ms===200).fn();assert(t.g.time>backgroundTime+.9,'hidden-tab timer advances simulation without animation frames');w.performance.now=oldNow;
// Completing either one-time tree keeps banked XP and spends it on later levels.
for(const world of [1,2]){
  t.startRun(false,world);t.g.ready=0;t.g.spawn=999;
  const tree=t.activeUpgrades(),p=t.g.p,last=tree.at(-1);
  for(const u of tree.slice(0,-1))t.g.ranks[u.id]=1;
  p.level=tree.length;p.need=t.xpNeeded(p.level);
  const surplus=t.xpNeeded(p.level+1)*2+37;
  p.xp=p.need+surplus;t.update(.01);
  assert.equal(t.state,'upgrade');assert.equal(t.choices.length,1);assert.equal(t.choices[0].id,last.id);
  t.unlockChoice();t.chooseUpgrade(0);
  assert.equal(p.xp,surplus,`World ${world}: final purchase must preserve all surplus XP`);
  assert.equal(t.g.upgradesComplete,true);assert.equal(t.state,'playing');
  t.openUpgrade();assert.equal(p.xp,surplus,`World ${world}: completed-tree guard must preserve XP`);
  assert.equal(t.state,'playing');assert.equal(t.choices.length,0);
  t.g.ready=0;const level=p.level,cost=p.need,score=t.g.score;t.update(.01);
  assert.equal(p.level,level+1);assert.equal(p.xp,surplus-cost);assert.equal(t.state,'playing');
  const nextCost=p.need;t.update(.01);
  assert.equal(p.level,level+2);assert.equal(p.xp,surplus-cost-nextCost);
  assert.equal(t.g.score,score,'banked XP never converts to score');assert.equal(t.choices.length,0);
}
Object.defineProperty(w,'localStorage',{get(){throw new Error('blocked storage');}});t.startRun();t.g.ready=0;t.g.p.invuln=0;t.hurt(999,0,0);assert.equal(t.state,'over');assert.equal(errors.length,0);
assert(!/lastUpgrade|UPGRADE IN|20-second upgrade wait|BONUS SCORE/.test(original),'old timer and overflow features are completely removed');
assert(!/<script[^>]*src=|<link[^>]*href=|https?:\/\//i.test(original),'no external resources');
console.log(JSON.stringify({passed:true,simulationSeconds:t.g.time,stressSimulationSeconds:240,simulationMs:Math.round(elapsed),msPerStep:+(elapsed/14400).toFixed(3),maxEnemies,maxBullets,maxDrops,upgrades,spaceSimulationSeconds:120,spaceSimulationMs:Math.round(spaceElapsed),spaceMaxEnemies,spaceMaxBullets,spaceMaxFields,spaceMaxFX,gardenSimulationSeconds:180,gardenSimulationMs:Math.round(gardenElapsed),gardenMaxEnemies,gardenMaxBullets,gardenMaxFields,gardenMaxFX,errors},null,2));
dom.window.close();
