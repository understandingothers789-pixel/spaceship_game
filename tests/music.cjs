const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'..'),localRequire=createRequire(path.join(root,'package.json'));
// Exercise the real inline audio/UI code with a deterministic Web Audio clock.
// Audio is mocked here: these checks do not claim audible device playback.
const contexts=[];
class Param{constructor(value=0){this.value=value;this.events=[];}setValueAtTime(value,time){this.add(value,time);return this;}linearRampToValueAtTime(value,time){this.add(value,time);return this;}exponentialRampToValueAtTime(value,time){if(value<=0)throw Error('invalid exponential target');this.add(value,time);return this;}setTargetAtTime(value,time,constant){if(!(constant>0))throw Error('invalid smoothing');this.add(value,time);return this;}cancelScheduledValues(time){this.events=this.events.filter(e=>e.time<time);return this;}add(value,time){if(!Number.isFinite(value)||!Number.isFinite(time)||time<0)throw Error('invalid audio automation');this.value=value;this.events.push({value,time});}}
class Node{constructor(){this.gain=new Param();this.frequency=new Param();this.pan=new Param();this.detune=new Param();this.links=[];}connect(node){this.links.push(node);return node;}disconnect(){this.links=[];}}
class Source extends Node{constructor(context){super();this.context=context;context.sources.push(this);this.stopAt=Infinity;}setPeriodicWave(wave){this.wave=wave;}start(time=0){if(time<this.context.currentTime-1e-8)throw Error('scheduled in the past');this.startAt=time;}stop(time){this.stopAt=time;}}
class FakeAudioContext{constructor(){this.currentTime=0;this.sampleRate=22050;this.state='running';this.destination=new Node();this.sources=[];contexts.push(this);}createPeriodicWave(real,imag){if(real.length!==imag.length)throw Error('invalid harmonics');return{real,imag};}createConvolver(){return new Node();}createGain(){return new Node();}createBiquadFilter(){return new Node();}createStereoPanner(){return new Node();}createOscillator(){return new Source(this);}createBufferSource(){return new Source(this);}createBuffer(channels,length){const data=Array.from({length:channels},()=>new Float32Array(length));return{length,numberOfChannels:channels,getChannelData:i=>data[i]};}resume(){this.state='running';return Promise.resolve();}advance(seconds){this.currentTime+=seconds;for(const source of this.sources)if(!source.ended&&source.stopAt<=this.currentTime){source.ended=true;source.onended?.();}}}
let header=fs.readFileSync(path.join(__dirname,'qa.cjs'),'utf8').split("assert(t,'test hooks loaded')")[0];
header=header.replace('window.test={','window.test={tone,crunch,musicArrangement,get musicScene(){return musicScene},get musicWaves(){return musicWaves},get musicReverb(){return musicReverb},get musicOutput(){return musicOutput},get overallVolume(){return overallVolume},get overallGain(){return overallGain},updateMusic,stopMusic,toggleMusic,toggleSound,get effectsGain(){return master},get effectsEnabled(){return sound},get musicVoices(){return musicVoices},get musicStep(){return musicStep},get musicNext(){return musicNext},get musicWorld(){return musicWorld},get musicEnabled(){return musicEnabled},get mixRatio(){return mixRatio},get musicBus(){return musicBus},');
header=header.replace('beforeParse(w){','beforeParse(w){w.AudioContext=FakeAudioContext;');
const checks=`
assert.equal(contexts.length,0,'loading a page does not autoplay or create an audio context');
assert.equal(t.overallVolume,1,'overall volume defaults to full');assert(t.musicEnabled);
assert.equal(w.document.querySelectorAll('[data-music-toggle]').length,2);
assert.equal(w.document.querySelectorAll('[data-overall-volume]').length,2,'one overall volume slider is shown on both panels');assert.equal(w.document.querySelectorAll('[data-effects-volume],[data-music-volume]').length,0,'there are no separate per-channel volume sliders');assert.equal(w.document.querySelectorAll('[data-overall-output]').length,2);
assert.equal(w.document.querySelectorAll('[data-mix-ratio]').length,2,'mix slider appears on both start and pause panels');assert(w.document.querySelector('#start').querySelector('.mix-control').compareDocumentPosition(w.document.querySelector('#start').querySelector('.instructions'))&w.Node.DOCUMENT_POSITION_FOLLOWING,'mix control appears near the top of the start panel');assert.equal(w.document.querySelector('[data-mix-output]').textContent,'SFX 50% · MUSIC 50%');
t.startRun(true);assert.equal(contexts.length,1);const audio=contexts[0];
assert(t.musicVoices.size>0,'Play schedules the score');assert.equal(t.musicWorld,1);
const firstNotes=[...t.musicVoices].filter(v=>!v.osc.buffer).map(v=>v.osc.frequency.value);assert(firstNotes.every(n=>n>0&&Number.isFinite(n)));
for(let i=0;i<2400;i++){audio.advance(.25);t.updateMusic();assert(t.musicVoices.size<=32,'score stays bounded');}
assert.equal(Object.keys(t.musicWaves).length,3,'three cached orchestral timbres');assert(t.musicReverb.buffer.numberOfChannels===2,'stereo hall impulse');assert.notDeepEqual(t.musicReverb.buffer.getChannelData(0),t.musicReverb.buffer.getChannelData(1),'hall channels differ');assert([...t.musicVoices].some(v=>v.osc.wave),'score uses harmonic orchestral waves');
const overallSlider=w.document.querySelector('[data-overall-volume]');assert.equal(t.overallGain.links[0],audio.destination);assert.equal(t.effectsGain.links[0],t.overallGain);assert.equal(t.musicOutput.links[0],t.overallGain,'effects and music share one final volume control');
overallSlider.value='56';overallSlider.dispatchEvent(new w.Event('input'));assert.equal(t.overallVolume,.56);assert.equal(t.overallGain.gain.value,.56);assert.equal(w.localStorage.getItem('void-wake-overall-volume-v1'),'0.56');for(const input of w.document.querySelectorAll('[data-overall-volume]'))assert.equal(input.value,'56');for(const output of w.document.querySelectorAll('[data-overall-output]'))assert.equal(output.textContent,'56%');assert.equal(t.effectsGain.gain.value,.12,'master volume does not change the SFX/music balance');
overallSlider.value='0';overallSlider.dispatchEvent(new w.Event('input'));assert.equal(t.overallGain.gain.value,0,'zero overall volume mutes all audio');const sourceCount=audio.sources.length;t.tone(440,440,.1);t.crunch();assert.equal(audio.sources.length,sourceCount,'zero master volume avoids creating inaudible effects voices');audio.advance(.2);t.updateMusic();assert.equal(t.musicVoices.size,0,'zero overall volume releases music voices');assert.equal(t.musicOutput.gain.value,0,'music mute gates reverb before the master output');
overallSlider.value='100';overallSlider.dispatchEvent(new w.Event('input'));assert.equal(t.overallGain.gain.value,1);assert(t.musicVoices.size>0,'raising master volume resumes enabled music');
const mixSlider=w.document.querySelector('[data-mix-ratio]');mixSlider.value='100';mixSlider.dispatchEvent(new w.Event('input'));assert.equal(t.mixRatio,100);assert.equal(t.effectsGain.gain.value,0,'music-heavy extreme fades effects out');assert(Math.abs(t.musicBus.gain.value-.22*.14*Math.sqrt(2))<1e-9,'music-heavy extreme raises relative music gain');assert(w.localStorage.getItem('void-wake-mix-ratio-v1')==='100');for(const input of w.document.querySelectorAll('[data-mix-ratio]'))assert.equal(input.value,'100');assert(w.document.querySelectorAll('[data-mix-output]')[1].textContent.includes('MUSIC 100%'));mixSlider.value='0';mixSlider.dispatchEvent(new w.Event('input'));assert.equal(t.effectsGain.gain.value,.12*Math.sqrt(2),'SFX-heavy extreme raises relative effects gain');assert.equal(t.musicBus.gain.value,0,'SFX-heavy extreme stops music');mixSlider.value='50';mixSlider.dispatchEvent(new w.Event('input'));assert.equal(t.effectsGain.gain.value,.12,'center mix preserves baseline effects gain');
overallSlider.focus();const x=t.g.p.x;key('keydown','ArrowRight');t.update(.016);assert.equal(t.g.p.x,x,'overall range keyboard input never moves the ship');key('keyup','ArrowRight');overallSlider.value='100';overallSlider.dispatchEvent(new w.Event('input'));
const before=t.musicStep;audio.advance(120);t.updateMusic();assert(t.musicStep-before<=4,'a delayed tab never bursts through missed notes');
t.pauseRun();assert.equal(t.musicWorld,0);const stopped=[...t.musicVoices].map(v=>v.osc.stopAt);audio.advance(.05);t.updateMusic();assert.deepEqual([...t.musicVoices].map(v=>v.osc.stopAt),stopped,'repeated inactive ticks do not postpone note cleanup');audio.advance(.2);assert.equal(t.musicVoices.size,0);
t.resumeRun();t.updateMusic();assert(t.musicVoices.size>0);
t.toggleMusic();assert(!t.musicEnabled);assert.equal(w.localStorage.getItem('void-wake-music-v1'),'off');audio.advance(.2);assert.equal(t.musicVoices.size,0);t.toggleMusic();assert(t.musicEnabled);assert(t.musicVoices.size>0);
const musicPosition=t.musicStep;t.toggleSound();audio.advance(.2);t.updateMusic();assert(!t.effectsEnabled);assert.equal(t.effectsGain.gain.value,0);assert(t.musicVoices.size>0,'effects off leaves music playing');assert(t.musicStep>=musicPosition,'effects toggle does not restart music');
for(const button of w.document.querySelectorAll('[data-effects-toggle]')){assert.equal(button.textContent,'SFX: OFF');assert.equal(button.getAttribute('aria-pressed'),'false');}
assert.equal(w.localStorage.getItem('void-wake-sound-v1'),'off');
t.toggleMusic();audio.advance(.2);assert.equal(t.musicVoices.size,0,'both channels can be muted');t.toggleMusic();assert(t.musicVoices.size>0,'music starts while effects remain muted');assert.equal(t.effectsGain.gain.value,0);
t.toggleSound();assert.equal(t.effectsGain.gain.value,.12);t.toggleMusic();audio.advance(.2);assert.equal(t.musicVoices.size,0,'music off leaves effects enabled');assert(t.effectsEnabled);assert.equal(t.effectsGain.gain.value,.12);t.toggleMusic();assert(t.musicVoices.size>0);
w.document.querySelector('[data-effects-toggle]').click();assert(!t.effectsEnabled);w.document.querySelectorAll('[data-effects-toggle]')[1].click();assert(t.effectsEnabled);
canvas.focus();key('keydown','KeyM');key('keyup','KeyM');assert(!t.effectsEnabled);assert(t.musicVoices.size>0,'M affects effects only');t.toggleSound();
t.g.p.xp=t.g.p.need;t.openUpgrade();assert.equal(t.state,'upgrade');assert.equal(t.musicWorld,1,'upgrade menu keeps a subdued score');t.unlockChoice();t.chooseUpgrade(0);
t.completeWorld1();audio.advance(.2);t.enterWorld2();t.updateMusic();assert.equal(t.musicWorld,2,'Chloris switches music');
const gardenNotes=[...t.musicVoices].filter(v=>!v.stopped).map(v=>v.osc.frequency.value);assert.notDeepEqual(gardenNotes,firstNotes,'worlds use different harmonies');
for(let i=0;i<12;i++){t.startRun(true,i%2+1);audio.advance(.3);t.updateMusic();assert(t.musicVoices.size<=32);}assert.equal(contexts.length,1,'restart reuses one audio graph');assert.equal(t.musicOutput.gain.value,1,'music output returns after mute and restart');

// Exercise adaptive arrangements through the real scheduler in both campaigns.
const pump=seconds=>{for(let i=0;i<Math.ceil(seconds*10);i++){audio.advance(.1);t.updateMusic();assert(t.musicVoices.size<=32,'every arrangement respects the music voice budget');}};
t.startRun(true,1);pump(1);
const spaceNames=[];for(const level of [1,11,21,31,41]){t.g.p.level=level;const arrangement=t.musicArrangement();spaceNames.push(arrangement.name);assert(arrangement.bpm>=80&&arrangement.bpm<=160);assert(arrangement.chords.every(c=>c.length===4&&c.every(Number.isFinite)));pump(7);assert.equal(t.musicScene.key,arrangement.key,'region arrangement enters within a bar');assert([...t.musicVoices].some(v=>!v.stopped),'each region keeps producing notes');}
assert.equal(new Set(spaceNames).size,5,'five distinct space arrangements');
t.g.p.level=1;pump(7);while(t.musicStep%16===0)pump(.1);const continuous=t.musicStep,oldKey=t.musicScene.key;t.g.p.level=11;t.updateMusic();assert.equal(t.musicStep,continuous,'level change never restarts the sequence');assert.equal(t.musicScene.key,oldKey,'new region waits for the next bar');pump(7);assert.equal(t.musicScene.name,'Belt Runner');
t.g.enemies=[{type:'warden',hp:100,maxHp:100}];const encounter=t.musicArrangement();assert(encounter.drive>1&&encounter.bpm>106,'boss raises intensity');pump(7);assert.equal(t.musicScene.key,encounter.key);
t.g.p.level=50;t.g.finalRound={clearing:false};pump(7);assert.equal(t.musicScene.name,'Twenty Against the Void');assert.equal(t.musicScene.bpm,148);
t.startRun(true,2);const gardenNames=[];for(let season=0;season<4;season++){t.g.season=season;gardenNames.push(t.musicArrangement().name);pump(7);assert.equal(t.musicScene.name,gardenNames[season]);}assert.equal(new Set(gardenNames).size,4,'four distinct garden-season arrangements');
t.g.season=0;t.g.p.level=1;const early=t.musicArrangement();t.g.p.level=45;const late=t.musicArrangement();assert(late.drive>early.drive&&late.bpm>early.bpm,'garden levels increase musical pressure');
t.g.p.level=50;t.g.finalRound={clearing:false};pump(7);assert.equal(t.musicScene.name,'Crown Siege');
const phaseTempos=[];for(const hp of [100,50,20]){t.g.enemies=[{type:'heart',hp,maxHp:100}];pump(7);assert.equal(t.musicScene.name,'Heart of Chloris');phaseTempos.push(t.musicScene.bpm);}assert(phaseTempos[0]<phaseTempos[1]&&phaseTempos[1]<phaseTempos[2],'Heart phases escalate the battle cue');
const snapshot=JSON.stringify({level:t.g.p.level,hp:t.g.p.hp,score:t.g.score,worldTime:t.g.worldTime});pump(30);assert.equal(JSON.stringify({level:t.g.p.level,hp:t.g.p.hp,score:t.g.score,worldTime:t.g.worldTime}),snapshot,'music scheduling cannot advance or alter gameplay');
console.log('Adaptive music passed: all regions/seasons, late-level pressure, boss/finale/Heart cues, bar-line changes, bounded voices, gameplay isolation.');

t.gameOver();audio.advance(.2);assert.equal(t.musicVoices.size,0,'game over releases the score');t.mainMenu();assert.equal(t.musicWorld,0);
audio.state='suspended';t.startRun();assert.equal(contexts.length,1);audio.state='running';t.updateMusic();
Object.defineProperty(w,'localStorage',{get(){throw new Error('blocked storage');}});t.toggleMusic();t.toggleMusic();
assert.equal(errors.length,0);dom.window.close();console.log('Music checks passed: controls, master volume, channel toggles, pause, worlds, bounded scheduling, delayed clock, restart.');`;
new Function('require','__dirname','FakeAudioContext','contexts',header+checks)(localRequire,__dirname,FakeAudioContext,contexts);

// Fresh-page combinations catch audio initialization bugs hidden by live toggles.
for(const effects of [false,true])for(const music of [false,true]){
 const coldHeader=header.replace('w.AudioContext=FakeAudioContext;',`w.AudioContext=FakeAudioContext;w.localStorage.setItem('void-wake-sound-v1','${effects?'on':'off'}');w.localStorage.setItem('void-wake-music-v1','${music?'on':'off'}');`);
 const coldChecks=`
 const previous=contexts.length;t.startRun(true);
 assert.equal(contexts.length-previous,${effects||music?1:0},'only enabled channels initialize audio');
 assert.equal(t.effectsEnabled,${effects});assert.equal(t.musicEnabled,${music});
 assert.equal(t.musicVoices.size>0,${music},'saved music preference is independent of effects');
 assert.equal(t.overallVolume,1);if(t.effectsGain)assert.equal(t.effectsGain.gain.value,${effects?.12:0},'saved effects preference sets the effects gain');
 assert.equal(errors.length,0);dom.window.close();`;
 new Function('require','__dirname','FakeAudioContext','contexts',coldHeader+coldChecks)(localRequire,__dirname,FakeAudioContext,contexts);
}
console.log('All four saved audio combinations passed on fresh pages.');

const mixedHeader=header.replace('w.AudioContext=FakeAudioContext;',"w.AudioContext=FakeAudioContext;w.localStorage.setItem('void-wake-music-volume-v1','0.6');w.localStorage.setItem('void-wake-mix-ratio-v1','40');");
new Function('require','__dirname','FakeAudioContext','contexts',mixedHeader+`
 t.startRun(true);assert.equal(t.overallVolume,.6);assert.equal(t.overallGain.gain.value,.6);assert.equal(t.mixRatio,40);assert(Math.abs(t.effectsGain.gain.value-.12*Math.sqrt(1.2))<1e-9);assert.equal(w.document.querySelector('[data-mix-ratio]').value,'40');assert.equal(w.document.querySelectorAll('[data-mix-output]')[1].textContent,'SFX 60% · MUSIC 40%');
 for(const input of w.document.querySelectorAll('[data-overall-volume]'))assert.equal(input.value,'60');
 t.toggleSound();assert.equal(t.effectsGain.gain.value,0);t.toggleSound();assert(Math.abs(t.effectsGain.gain.value-.12*Math.sqrt(1.2))<1e-9,'unmuting restores the chosen mix');
 const room=t.musicReverb;t.startRun(true);assert.equal(t.musicReverb,room,'restart reuses the hall effect');dom.window.close();
 console.log('Saved master volume and audio balance, zero-volume mute, orchestral timbres and reverb gating passed.');
`)(localRequire,__dirname,FakeAudioContext,contexts);
