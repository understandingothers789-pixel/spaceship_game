const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'..'),localRequire=createRequire(path.join(root,'package.json'));
// Exercise the real inline audio/UI code with a deterministic Web Audio clock.
// Audio is mocked here: these checks do not claim audible device playback.
const contexts=[];
class Param{constructor(value=0){this.value=value;this.events=[];}setValueAtTime(value,time){this.add(value,time);return this;}linearRampToValueAtTime(value,time){this.add(value,time);return this;}exponentialRampToValueAtTime(value,time){if(value<=0)throw Error('invalid exponential target');this.add(value,time);return this;}setTargetAtTime(value,time,constant){if(!(constant>0))throw Error('invalid smoothing');this.add(value,time);return this;}cancelScheduledValues(time){this.events=this.events.filter(e=>e.time<time);return this;}add(value,time){if(!Number.isFinite(value)||!Number.isFinite(time)||time<0)throw Error('invalid audio automation');this.value=value;this.events.push({value,time});}}
class Node{constructor(){this.gain=new Param();this.frequency=new Param();this.pan=new Param();this.links=[];}connect(node){this.links.push(node);return node;}disconnect(){this.links=[];}}
class Source extends Node{constructor(context){super();this.context=context;context.sources.push(this);this.stopAt=Infinity;}start(time=0){if(time<this.context.currentTime-1e-8)throw Error('scheduled in the past');this.startAt=time;}stop(time){this.stopAt=time;}}
class FakeAudioContext{constructor(){this.currentTime=0;this.sampleRate=22050;this.state='running';this.destination=new Node();this.sources=[];contexts.push(this);}createGain(){return new Node();}createBiquadFilter(){return new Node();}createStereoPanner(){return new Node();}createOscillator(){return new Source(this);}createBufferSource(){return new Source(this);}createBuffer(channels,length){return{getChannelData:()=>new Float32Array(length)};}resume(){this.state='running';return Promise.resolve();}advance(seconds){this.currentTime+=seconds;for(const source of this.sources)if(!source.ended&&source.stopAt<=this.currentTime){source.ended=true;source.onended?.();}}}
let header=fs.readFileSync(path.join(__dirname,'qa.cjs'),'utf8').split("assert(t,'test hooks loaded')")[0];
header=header.replace('window.test={','window.test={updateMusic,stopMusic,toggleMusic,toggleSound,get musicVoices(){return musicVoices},get musicStep(){return musicStep},get musicNext(){return musicNext},get musicWorld(){return musicWorld},get musicVolume(){return musicVolume},get musicEnabled(){return musicEnabled},');
header=header.replace('beforeParse(w){','beforeParse(w){w.AudioContext=FakeAudioContext;');
const checks=`
assert.equal(contexts.length,0,'loading a page does not autoplay or create an audio context');
assert.equal(t.musicVolume,.22,'music defaults to a low volume');assert(t.musicEnabled);
assert.equal(w.document.querySelectorAll('[data-music-toggle]').length,2);
assert.equal(w.document.querySelectorAll('[data-music-volume]').length,2);
t.startRun(true);assert.equal(contexts.length,1);const audio=contexts[0];
assert(t.musicVoices.size>0,'Play schedules the score');assert.equal(t.musicWorld,1);
const firstNotes=[...t.musicVoices].map(v=>v.osc.frequency.value);assert(firstNotes.every(n=>n>0&&Number.isFinite(n)));
for(let i=0;i<2400;i++){audio.advance(.25);t.updateMusic();assert(t.musicVoices.size<=32,'score stays bounded');}
const before=t.musicStep;audio.advance(120);t.updateMusic();assert(t.musicStep-before<=4,'a delayed tab never bursts through missed notes');
t.pauseRun();assert.equal(t.musicWorld,0);const stopped=[...t.musicVoices].map(v=>v.osc.stopAt);audio.advance(.05);t.updateMusic();assert.deepEqual([...t.musicVoices].map(v=>v.osc.stopAt),stopped,'repeated inactive ticks do not postpone note cleanup');audio.advance(.2);assert.equal(t.musicVoices.size,0);
t.resumeRun();t.updateMusic();assert(t.musicVoices.size>0);
const slider=w.document.querySelector('[data-music-volume]');slider.value='9';slider.dispatchEvent(new w.Event('input',{bubbles:true}));
assert.equal(t.musicVolume,.09);assert.equal(w.localStorage.getItem('void-wake-music-volume-v1'),'0.09');
for(const input of w.document.querySelectorAll('[data-music-volume]'))assert.equal(input.value,'9');
slider.focus();const x=t.g.p.x;key('keydown','ArrowRight');t.update(.016);assert.equal(t.g.p.x,x,'range keyboard input never moves the ship');key('keyup','ArrowRight');
slider.value='0';slider.dispatchEvent(new w.Event('input'));audio.advance(.2);assert.equal(t.musicVoices.size,0,'zero volume releases voices');
slider.value='22';slider.dispatchEvent(new w.Event('input'));assert(t.musicVoices.size>0);
t.toggleMusic();assert(!t.musicEnabled);assert.equal(w.localStorage.getItem('void-wake-music-v1'),'off');audio.advance(.2);assert.equal(t.musicVoices.size,0);t.toggleMusic();assert(t.musicEnabled);assert(t.musicVoices.size>0);
t.toggleSound();audio.advance(.2);assert.equal(t.musicVoices.size,0,'M mutes the score too');t.toggleSound();assert(t.musicVoices.size>0);
t.g.p.xp=t.g.p.need;t.openUpgrade();assert.equal(t.state,'upgrade');assert.equal(t.musicWorld,1,'upgrade menu keeps a subdued score');t.unlockChoice();t.chooseUpgrade(0);
t.completeWorld1();audio.advance(.2);t.enterWorld2();t.updateMusic();assert.equal(t.musicWorld,2,'Chloris switches music');
const gardenNotes=[...t.musicVoices].filter(v=>!v.stopped).map(v=>v.osc.frequency.value);assert.notDeepEqual(gardenNotes,firstNotes,'worlds use different harmonies');
for(let i=0;i<12;i++){t.startRun(true,i%2+1);audio.advance(.3);t.updateMusic();assert(t.musicVoices.size<=32);}assert.equal(contexts.length,1,'restart reuses one audio graph');
t.gameOver();audio.advance(.2);assert.equal(t.musicVoices.size,0,'game over releases the score');t.mainMenu();assert.equal(t.musicWorld,0);
audio.state='suspended';t.startRun();assert.equal(contexts.length,1);audio.state='running';t.updateMusic();
Object.defineProperty(w,'localStorage',{get(){throw new Error('blocked storage');}});t.toggleMusic();t.toggleMusic();
assert.equal(errors.length,0);dom.window.close();console.log('Music checks passed: controls, storage, mute, pause, worlds, bounded scheduling, delayed clock, restart.');`;
new Function('require','__dirname','FakeAudioContext','contexts',header+checks)(localRequire,__dirname,FakeAudioContext,contexts);
