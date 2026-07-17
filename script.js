"use strict";

const viewport = document.getElementById("viewport");
const world = document.getElementById("world");
const intro = document.getElementById("intro");
const introText = document.getElementById("introText");
const introInstruction = document.getElementById("introInstruction");
const originStar = document.getElementById("originStar");
const narrativeText = document.getElementById("narrativeText");
const deepStars = document.getElementById("deepStars");
const interactiveStars = document.getElementById("interactiveStars");
const cosmicDust = document.getElementById("cosmicDust");
const shootingStarsLayer = document.getElementById("shootingStars");
const driftingBodies = document.getElementById("driftingBodies");
const lightMessage = document.getElementById("lightMessage");
const lightMessageText = document.getElementById("lightMessageText");
const planetMoment = document.getElementById("planetMoment");
const planetMomentBackdrop = document.getElementById("planetMomentBackdrop");
const panelEyebrow = document.getElementById("panelEyebrow");
const panelTitle = document.getElementById("panelTitle");
const panelMessage = document.getElementById("panelMessage");
const closePanel = document.getElementById("closePanel");
const secretObject = document.getElementById("secretObject");
const moonOrbit = document.getElementById("moonOrbit");
const moonObject = document.getElementById("moonObject");
const openMoonMessage = document.getElementById("openMoonMessage");
const letterScene = document.getElementById("letterScene");
const letterBackdrop = document.getElementById("letterBackdrop");
const closeLetter = document.getElementById("closeLetter");
const epilogueScene = document.getElementById("epilogueScene");
const epilogueBackdrop = document.getElementById("epilogueBackdrop");
const closeEpilogue = document.getElementById("closeEpilogue");
const menuToggle = document.getElementById("menuToggle");
const menuPanel = document.getElementById("menuPanel");
const progressCount = document.getElementById("progressCount");
const starProgressCount = document.getElementById("starProgressCount");
const toggleAudio = document.getElementById("toggleAudio");
const nextTrackButton = document.getElementById("nextTrack");
const resetView = document.getElementById("resetView");
const findLight = document.getElementById("findLight");
const openLetterAgain = document.getElementById("openLetterAgain");
const openEpilogueButton = document.getElementById("openEpilogue");
const resetProgress = document.getElementById("resetProgress");
const soundtrack = document.getElementById("soundtrack");
const menuTrackTitle = document.getElementById("menuTrackTitle");
const menuTrackArtist = document.getElementById("menuTrackArtist");
const trackToast = document.getElementById("trackToast");
const toastTrackTitle = document.getElementById("toastTrackTitle");
const toastTrackArtist = document.getElementById("toastTrackArtist");
const returnToast = document.getElementById("returnToast");

const WORLD_WIDTH = 3600;
const WORLD_HEIGHT = 2600;
const MIN_SCALE = 0.42;
const MAX_SCALE = 2.3;
const DEFAULT_SCALE = window.innerWidth < 700 ? 0.48 : 0.62;
const STORAGE_KEY = "universoAxelProgressV1";
const MUSIC_KEY = "projectPolarisLastTrack";
const STAR_LAYOUT_SEED = 21042026;
const NORMAL_VOLUME = 0.68;
const DUCKED_VOLUME = 0.19;

const tracks = [
  { title: "My Universe", artist: "Coldplay x BTS", file: "my_universe.mp3", theme: "my-universe" },
  { title: "Say Yes To Heaven", artist: "Lana Del Rey", file: "say_yes_to_heaven.mp3", theme: "heaven" },
  { title: "UNDERSTAND", artist: "keshi", file: "understand.mp3", theme: "understand" },
  { title: "Silence", artist: "sunwoojunga", file: "silence.mp3", theme: "silence" },
  { title: "Halley's Comet", artist: "Billie Eilish", file: "halleys_comet.mp3", theme: "comet" },
  { title: "Like You Do", artist: "Joji", file: "like_you_do.mp3", theme: "like-you-do" },
  { title: "Star Shopping", artist: "Lil Peep", file: "star_shopping.mp3", theme: "star-shopping" },
];

let availableTracks = [tracks[1]];
let currentTrack = null;
let trackBag = [];
let audioTargetVolume = NORMAL_VOLUME;
let audioFadeFrame = null;
let audioContext = null;
let shootingStarTimer = null;
let revealFrame = null;
let inertiaFrame = null;
let toastTimer = null;
let returnToastTimer = null;
let lightMessageTimer = null;

const camera = { x: 0, y: 0, scale: DEFAULT_SCALE };
const state = {
  started: false,
  dragging: false,
  movedDuringPointer: false,
  pointerStartX: 0,
  pointerStartY: 0,
  lastPointerX: 0,
  lastPointerY: 0,
  lastPointerTime: 0,
  velocityX: 0,
  velocityY: 0,
  cameraStartX: 0,
  cameraStartY: 0,
  pinchDistance: null,
  pinchScale: DEFAULT_SCALE,
  visitedPlanets: new Set(),
  visitedStars: new Set(),
  audioEnabled: true,
  audioStarted: false,
  secretUnlocked: false,
  epilogueUnlocked: false,
  pendingPlanetCompletion: false,
  pendingEpilogue: false,
  finalLineShown: false,
};

const starMessages = [
  "Ojalá pudieras verte con los ojos con los que yo te miro.",
  "Admiro tu fuerza, incluso en los días en que tú no logras verla.",
  "Tu presencia tiene una forma silenciosa de ordenar mis pensamientos.",
  "Hay personas que hacen menos ruido y significan mucho más.",
  "Gracias por hacer que la distancia deje de parecer una frontera.",
  "No necesito que seas perfecto; me basta con que seas tú.",
  "Contigo incluso el silencio encuentra una forma de sentirse cerca.",
  "A veces una sola palabra tuya basta para cambiarme el día.",
  "Me gusta la persona que soy cuando estoy contigo.",
  "Hay algo en ti que siempre logra hacerme volver a la calma.",
  "Tu paciencia ha sido una manera muy bonita de cuidarme.",
  "Incluso tus días grises forman parte de la forma en que te quiero.",
  "Me alegra que, entre tantas posibilidades, nuestras historias se encontraran.",
  "Tu voz consigue llegar a lugares a los que casi nadie llega.",
  "Si alguna vez dudas de tu valor, vuelve a esta luz.",
  "Me haces sentir acompañada incluso cuando estamos en países distintos.",
  "Nunca pensé que alguien pudiera sentirse tan cerca desde tan lejos.",
  "Tu forma de seguir adelante es una de las cosas que más admiro de ti.",
  "No quiero cambiar tu caos; quiero que sepas que no me asusta.",
  "Desde que llegaste, sonreír dejó de parecer una tarea difícil.",
  "Tu cariño se siente real incluso cuando solo puedo alcanzarte a través de una pantalla.",
  "Eres ese lugar al que mi mente vuelve sin tener que pensarlo.",
  "Hay una calma extraña y hermosa en escucharte hablar.",
  "Me gusta que contigo no tenga que forzar ninguna conversación.",
  "Tu existencia hizo que mi mundo aprendiera otra forma de tener luz.",
  "Gracias por dejarme conocer las partes de ti que no todos ven.",
  "No admiro que nunca caigas; admiro que siempre encuentres cómo levantarte.",
  "Aun cuando no lo notas, tu presencia también sabe sanar.",
  "Tú convertiste la distancia en algo que podemos atravesar.",
  "Siempre habrá una parte de este universo que lleve tu nombre.",
  "Me gusta la forma en que vuelves sencillo aquello que antes me costaba.",
  "Nunca tengo que buscar demasiado las palabras cuando estoy contigo.",
  "Tu manera de escucharme hace que incluso mis silencios se sientan comprendidos.",
  "Hay días en los que tu voz es exactamente el lugar al que necesito llegar.",
  "No sé cómo lo haces, pero consigues que mi corazón te reconozca en segundos.",
  "Me haces sonreír con una facilidad que todavía me sorprende.",
  "A veces pienso en ti y el día cambia de temperatura.",
  "Tu ternura aparece en los detalles que quizá tú ni siquiera notas.",
  "Me gusta saber que existe alguien como tú en el mismo mundo que yo.",
  "Aunque no pueda tocarte, nunca siento que tu cariño sea menos real.",
  "Eres la prueba de que la cercanía no siempre se mide en kilómetros.",
  "Contigo aprendí que el hogar también puede tener una voz.",
  "Cuando todo se siente demasiado, hablar contigo vuelve a poner las cosas en su sitio.",
  "Me siento a salvo en la forma en que me tratas.",
  "Tu paciencia me da espacio para ser yo sin tener que explicarme demasiado.",
  "Gracias por no exigirme una versión de mí que no existe.",
  "Me gusta que sepas quedarte sin invadir y cuidar sin hacer ruido.",
  "En ti encontré una tranquilidad que no sabía que estaba buscando.",
  "No hay pantalla capaz de hacer que lo nuestro se sienta lejano.",
  "A veces cierro los ojos solo para escucharte mejor.",
  "Tu voz tiene la extraña capacidad de hacer desaparecer el resto del mundo.",
  "Me gusta conocer tus historias, incluso las que todavía duelen.",
  "Cada parte de ti que me confías hace que te admire un poco más.",
  "No veo debilidad en tus cicatrices; veo todo lo que sobreviviste.",
  "Tu fortaleza no está en no sentir, sino en seguir sintiendo y continuar.",
  "Incluso cuando te describes como un desastre, yo sigo viendo a alguien valioso.",
  "No tienes que esconder tus tormentas para que yo quiera quedarme.",
  "Tus partes vulnerables no te hacen menos fuerte; te hacen más real.",
  "Me gusta tu manera de existir sin necesitar hacer ruido para ser importante.",
  "Hay algo en tus silencios que también me habla de ti.",
  "Nunca quisiera que sintieras que tienes que fingir conmigo.",
  "Puedes venir tal como eres; no necesito una versión pulida de ti.",
  "Me conmueve la manera en que sigues intentando, incluso cuando estás cansado.",
  "A veces quisiera prestarte mis ojos para que entendieras todo lo que veo en ti.",
  "No eres difícil de querer; solo has tenido que aprender a protegerte.",
  "Tu forma de resistir no pasa desapercibida para mí.",
  "Admiro al hombre que eres y también al que sigues construyendo.",
  "Llegaste sin prometer nada y terminaste significándolo todo.",
  "Eres una de esas casualidades que parecen haber sido escritas con intención.",
  "Entre tantas historias posibles, me alegra profundamente que la mía te encontrara.",
  "Lo nuestro se siente natural de una forma que todavía me cuesta explicar.",
  "Hay una parte de mí que descansa cada vez que te escucha.",
  "Eres mi punto débil y, extrañamente, también una de mis mayores fortalezas.",
  "Me gusta que contigo la vulnerabilidad no se sienta como un riesgo.",
  "Tu cariño atraviesa la distancia y llega hasta mí con una claridad inesperada.",
  "No sé qué forma tendrá el futuro, pero me alegra que existas en mi presente.",
  "Si el mundo se vuelve demasiado pesado, aquí siempre habrá un lugar para ti.",
  "Gracias por llegar a mi vida sin intentar cambiarme y terminar cambiándolo todo.",
  "No podría haber imaginado a alguien como tú y, aun así, aquí estás.",
  "En medio de tanto ruido, tú sigues siendo la presencia que más paz me da."
];

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function wait(ms) { return new Promise(resolve => window.setTimeout(resolve, ms)); }

function applyCamera(animated = false) {
  world.classList.toggle("camera-animated", animated);
  world.style.transform = `translate(calc(-50% + ${camera.x}px), calc(-50% + ${camera.y}px)) scale(${camera.scale})`;
  scheduleRevealCheck();
  if (animated) window.setTimeout(() => world.classList.remove("camera-animated"), 1300);
}

function centerOnWorldPoint(x, y, scale = camera.scale, animated = true) {
  camera.scale = clamp(scale, MIN_SCALE, MAX_SCALE);
  camera.x = (WORLD_WIDTH / 2 - x) * camera.scale;
  camera.y = (WORLD_HEIGHT / 2 - y) * camera.scale;
  applyCamera(animated);
}

function resetCamera() { centerOnWorldPoint(1800, 1300, DEFAULT_SCALE, true); }

function createStars() {
  const random = seededRandom(STAR_LAYOUT_SEED);
  const exclusionZones = [
    {x:1800,y:1300,r:220},{x:1470,y:1110,r:95},{x:2140,y:1030,r:120},{x:1260,y:1540,r:130},
    {x:2400,y:1570,r:115},{x:920,y:720,r:190},{x:2820,y:830,r:220},{x:620,y:2050,r:165},
    {x:3080,y:2070,r:175},{x:1800,y:2350,r:130}
  ];
  const placed = [];
  for (let i=0;i<210;i+=1) {
    const star = document.createElement("span");
    star.className = "star deep-star";
    star.style.left = `${random()*100}%`;
    star.style.top = `${random()*100}%`;
    star.style.setProperty("--size", `${(random()*1.9+.55).toFixed(2)}px`);
    star.style.setProperty("--base-opacity", (random()*.28+.06).toFixed(2));
    star.style.setProperty("--twinkle", `${(random()*6+4).toFixed(1)}s`);
    deepStars.appendChild(star);
  }
  const valid = (x,y) => exclusionZones.every(z=>Math.hypot(x-z.x,y-z.y)>=z.r) && placed.every(p=>Math.hypot(x-p.x,y-p.y)>=48);
  for (let i=0;i<80;i+=1) {
    let x=0,y=0,tries=0;
    do { x=Math.round(120+random()*(WORLD_WIDTH-240)); y=Math.round(120+random()*(WORLD_HEIGHT-240)); tries+=1; } while(!valid(x,y)&&tries<1500);
    placed.push({x,y});
    const star=document.createElement("button");
    star.type="button"; star.className="star interactive-star dormant";
    star.dataset.starId=String(i); star.dataset.x=String(x); star.dataset.y=String(y); star.dataset.message=starMessages[i];
    star.style.left=`${x}px`; star.style.top=`${y}px`; star.style.setProperty("--size",`${(random()*3.4+2.1).toFixed(2)}px`); star.style.setProperty("--dormant-opacity",(random()*.1+.055).toFixed(2));
    star.setAttribute("aria-label",`Descubrir la luz ${i+1}`);
    star.addEventListener("pointerdown",e=>e.stopPropagation());
    star.addEventListener("click",e=>{e.stopPropagation();discoverStar(star);});
    interactiveStars.appendChild(star);
  }
}

function createAmbientSpace() {
  cosmicDust.replaceChildren();
  driftingBodies.replaceChildren();
  const random=seededRandom(88731); const moteCount=window.innerWidth<760?34:62; const bodyCount=window.innerWidth<760?4:8;
  for(let i=0;i<moteCount;i+=1){const m=document.createElement("span");m.className="cosmic-mote";m.style.left=`${random()*100}%`;m.style.top=`${random()*100}%`;m.style.setProperty("--mote-size",`${(random()*2.3+.7).toFixed(2)}px`);m.style.setProperty("--mote-opacity",(random()*.25+.08).toFixed(2));m.style.setProperty("--mote-duration",`${(random()*22+20).toFixed(1)}s`);m.style.setProperty("--mote-delay",`${(-random()*30).toFixed(1)}s`);m.style.setProperty("--mote-x",`${(random()*100-50).toFixed(0)}px`);m.style.setProperty("--mote-y",`${(random()*-90-20).toFixed(0)}px`);cosmicDust.appendChild(m)}
  for(let i=0;i<bodyCount;i+=1){const b=document.createElement("span");b.className="drifting-body";b.style.top=`${8+random()*78}%`;b.style.left=`${-20-random()*35}%`;b.style.setProperty("--body-size",`${(random()*8+3).toFixed(1)}px`);b.style.setProperty("--body-opacity",(random()*.16+.07).toFixed(2));b.style.setProperty("--body-blur",`${(random()*.8).toFixed(2)}px`);b.style.setProperty("--body-duration",`${(random()*38+42).toFixed(1)}s`);b.style.setProperty("--body-delay",`${(-random()*55).toFixed(1)}s`);b.style.setProperty("--body-wave",`${(random()*100-50).toFixed(0)}px`);driftingBodies.appendChild(b)}
}

function scheduleShootingStar(initial=false){clearTimeout(shootingStarTimer);shootingStarTimer=setTimeout(()=>{if(state.started&&!document.hidden&&!document.body.classList.contains("letter-open")){launchShootingStar()}scheduleShootingStar(false)},initial?4600:6000+Math.random()*14000)}
function launchShootingStar(){const s=document.createElement("span");s.className="shooting-star";s.style.left=`${72+Math.random()*30}%`;s.style.top=`${5+Math.random()*40}%`;s.style.setProperty("--shoot-angle",`${(-22-Math.random()*18).toFixed(1)}deg`);s.style.setProperty("--shoot-x",`${-(430+Math.random()*470).toFixed(0)}px`);s.style.setProperty("--shoot-y",`${(220+Math.random()*340).toFixed(0)}px`);s.style.setProperty("--shoot-duration",`${(1.05+Math.random()*.7).toFixed(2)}s`);s.style.setProperty("--shoot-length",`${(120+Math.random()*100).toFixed(0)}px`);shootingStarsLayer.appendChild(s);requestAnimationFrame(()=>s.classList.add("is-flying"));s.addEventListener("animationend",()=>s.remove(),{once:true})}

function saveProgress(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:2,visitedPlanets:[...state.visitedPlanets],visitedStars:[...state.visitedStars],epilogueUnlocked:state.epilogueUnlocked}))}catch(e){console.warn("No se pudo guardar el progreso",e)}}
function loadProgress(){try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return;const data=JSON.parse(raw);const validPlanets=new Set(["mercury","venus","earth","mars","jupiter","saturn","uranus","neptune"]);state.visitedPlanets=new Set((data.visitedPlanets||[]).filter(x=>validPlanets.has(x)));state.visitedStars=new Set((data.visitedStars||[]).map(String).filter(x=>Number(x)>=0&&Number(x)<80));state.epilogueUnlocked=state.visitedStars.size===80||Boolean(data.epilogueUnlocked);state.secretUnlocked=state.visitedPlanets.size===8}catch(e){console.warn("No se pudo recuperar el progreso",e)}}
function applySavedProgress(){document.querySelectorAll(".planet").forEach(p=>{if(state.visitedPlanets.has(p.dataset.planet)){p.classList.remove("dormant","awakened");p.classList.add("discovered")}});document.querySelectorAll(".interactive-star").forEach(s=>{if(state.visitedStars.has(s.dataset.starId)){s.classList.remove("dormant","awakened");s.classList.add("discovered")}});progressCount.textContent=state.visitedPlanets.size;starProgressCount.textContent=state.visitedStars.size;if(state.secretUnlocked){revealMoon(false)}if(state.epilogueUnlocked)openEpilogueButton.hidden=false}

function showReturnToast(){const parts=[];if(state.visitedPlanets.size)parts.push(`${state.visitedPlanets.size} capítulos`);if(state.visitedStars.size)parts.push(`${state.visitedStars.size} luces`);if(!parts.length)return;returnToast.textContent=`${parts.join(" y ")} siguen esperando por ti.`;returnToast.classList.add("is-visible");clearTimeout(returnToastTimer);returnToastTimer=setTimeout(()=>returnToast.classList.remove("is-visible"),4800)}

async function introSequence(){await wait(3000);if(state.started)return;introText.classList.add("is-changing");await wait(850);introText.textContent="La nuestra comenzó con una conversación.";introText.classList.remove("is-changing")}
function showNarrative(text,duration=3000){return new Promise(resolve=>{document.body.classList.add("narrative-active");narrativeText.textContent=text;narrativeText.classList.add("is-visible");setTimeout(()=>{narrativeText.classList.remove("is-visible");setTimeout(()=>{document.body.classList.remove("narrative-active");resolve()},900)},duration)})}

async function beginExperience(){if(state.started)return;state.started=true;initAudioContext();startSoundtrackFromGesture();originStar.disabled=true;introInstruction.style.opacity="0";introText.classList.add("is-changing");await wait(700);introText.textContent="Nunca imaginé que aquella conversación terminaría convirtiéndose en el lugar donde más paz encontraría.";introText.classList.remove("is-changing");await wait(2500);intro.classList.add("is-leaving");viewport.classList.remove("is-locked");viewport.classList.add("is-ready");resetCamera();scheduleShootingStar(true);await wait(1900);await showNarrative("Los planetas guardan capítulos. Las luces pequeñas guardan pensamientos.",3400);showReturnToast()}

function initAudioContext(){if(audioContext)return;const C=window.AudioContext||window.webkitAudioContext;if(C){audioContext=new C();if(audioContext.state==="suspended")audioContext.resume()}}
function tone(freq,start,duration,gain,type="sine"){if(!audioContext||!state.audioEnabled)return;const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(gain,start+.02);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g).connect(audioContext.destination);o.start(start);o.stop(start+duration+.05)}
function playStarSfx(){if(!audioContext)return;const t=audioContext.currentTime;tone(880,t,.65,.035);tone(1320,t+.08,.7,.02)}
function playPlanetSfx(){if(!audioContext)return;const t=audioContext.currentTime;tone(96,t,1.3,.035,"sine");tone(420,t+.18,.85,.018)}
function playUnlockSfx(){if(!audioContext)return;const t=audioContext.currentTime;[392,523,659,784].forEach((f,i)=>tone(f,t+i*.13,.95,.026))}

async function probeTracks(){if(location.protocol==="file:")return;const checks=await Promise.all(tracks.map(async track=>{try{const r=await fetch(track.file,{method:"HEAD",cache:"no-store"});return r.ok?track:null}catch{return null}}));const valid=checks.filter(Boolean);if(valid.length)availableTracks=valid}
function refillTrackBag(){const list=[...availableTracks];for(let i=list.length-1;i>0;i-=1){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}const lastFile=currentTrack?.file||localStorage.getItem(MUSIC_KEY);if(lastFile&&list.length>1&&list[0].file===lastFile){[list[0],list[1]]=[list[1],list[0]]}trackBag=list}
function getNextTrack(){if(!trackBag.length)refillTrackBag();return trackBag.shift()||tracks[1]}
function setTrack(track,autoplay=true){currentTrack=track;localStorage.setItem(MUSIC_KEY,track.file);soundtrack.src=track.file;soundtrack.load();menuTrackTitle.textContent=track.title;menuTrackArtist.textContent=track.artist;toastTrackTitle.textContent=track.title;toastTrackArtist.textContent=track.artist;document.body.dataset.soundTheme=track.theme;showTrackToast();if(autoplay){soundtrack.volume=0;const promise=soundtrack.play();if(promise)promise.then(()=>{state.audioStarted=true;state.audioEnabled=true;toggleAudio.textContent="Pausar sonido";fadeAudioTo(audioTargetVolume,2200)}).catch(()=>{state.audioStarted=false;toggleAudio.textContent="Activar sonido"})}}
function startSoundtrackFromGesture(){const preferred=getNextTrack();setTrack(preferred,true)}
function nextTrack(){if(!state.audioEnabled)state.audioEnabled=true;setTrack(getNextTrack(),true)}
function showTrackToast(){trackToast.classList.add("is-visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>trackToast.classList.remove("is-visible"),4700)}
function fadeAudioTo(target,duration=900){cancelAnimationFrame(audioFadeFrame);audioTargetVolume=target;if(soundtrack.paused)return;const start=soundtrack.volume;const startTime=performance.now();const step=now=>{const p=Math.min(1,(now-startTime)/duration);soundtrack.volume=clamp(start+(target-start)*(1-Math.pow(1-p,3)),0,1);if(p<1)audioFadeFrame=requestAnimationFrame(step)};audioFadeFrame=requestAnimationFrame(step)}
function duckAudio(){fadeAudioTo(DUCKED_VOLUME,800)}function restoreAudio(){fadeAudioTo(NORMAL_VOLUME,1100)}
function toggleSound(){initAudioContext();if(soundtrack.paused){state.audioEnabled=true;const p=soundtrack.play();if(p)p.then(()=>{toggleAudio.textContent="Pausar sonido";fadeAudioTo(audioTargetVolume,900)}).catch(()=>{toggleAudio.textContent="Toca otra vez"})}else{fadeAudioTo(0,450);setTimeout(()=>soundtrack.pause(),470);state.audioEnabled=false;toggleAudio.textContent="Activar sonido"}}

soundtrack.addEventListener("ended",nextTrack);soundtrack.addEventListener("error",()=>{if(state.started&&availableTracks.length>1)setTimeout(nextTrack,300)});

function openLightMessage(message){clearTimeout(lightMessageTimer);lightMessageText.textContent=message;lightMessage.classList.add("is-open");duckAudio();lightMessageTimer=setTimeout(closeLightMessage,7000)}
function closeLightMessage(){if(!lightMessage.classList.contains("is-open"))return;clearTimeout(lightMessageTimer);lightMessage.classList.remove("is-open");restoreAudio();if(state.pendingEpilogue){state.pendingEpilogue=false;setTimeout(openEpilogue,700)}}
function discoverStar(star){const id=star.dataset.starId;if(!state.visitedStars.has(id)){state.visitedStars.add(id);star.classList.remove("dormant","awakened");star.classList.add("discovered");starProgressCount.textContent=state.visitedStars.size;playStarSfx();if(state.visitedStars.size===80){state.epilogueUnlocked=true;state.pendingEpilogue=true;openEpilogueButton.hidden=false;playUnlockSfx()}saveProgress()}openLightMessage(star.dataset.message)}

function openPlanetMoment(object){panelEyebrow.textContent=object.dataset.kind==="sun"?"Origen":"Planeta descubierto";panelTitle.textContent=object.dataset.title;panelMessage.textContent=object.dataset.message;planetMoment.classList.add("is-open");planetMoment.setAttribute("aria-hidden","false");document.body.classList.add("moment-open");duckAudio()}
function closePlanetMoment(){if(!planetMoment.classList.contains("is-open"))return;planetMoment.classList.remove("is-open");planetMoment.setAttribute("aria-hidden","true");document.body.classList.remove("moment-open");restoreAudio();if(state.pendingPlanetCompletion){state.pendingPlanetCompletion=false;setTimeout(unlockSecretObject,800)}}
function discoverCelestial(object){if(state.movedDuringPointer)return;const x=Number(object.dataset.x),y=Number(object.dataset.y);centerOnWorldPoint(x,y,window.innerWidth<700?.78:.92,true);const name=object.dataset.planet;if(name&&!state.visitedPlanets.has(name)){state.visitedPlanets.add(name);object.classList.remove("dormant","awakened");object.classList.add("discovered");progressCount.textContent=state.visitedPlanets.size;playPlanetSfx();if(state.visitedPlanets.size===8)state.pendingPlanetCompletion=true;saveProgress()}setTimeout(()=>openPlanetMoment(object),760)}
function openMoonMoment(){
  openLightMessage("Has recorrido todos los mundos de este universo... Pero aún quedan pequeñas luces esperando ser encontradas. Cuando todas despierten, algo que permanecía oculto podrá encontrarte.");
}

function revealMoon(center=true){
  if(!moonOrbit)return;
  moonOrbit.classList.add("is-revealed");
  moonOrbit.setAttribute("aria-hidden","false");
  if(openMoonMessage)openMoonMessage.hidden=false;
  if(center)centerOnWorldPoint(1260,1540,window.innerWidth<700?.9:1.05,true);
}

async function unlockSecretObject(){
  if(state.secretUnlocked)return;
  state.secretUnlocked=true;
  saveProgress();
  playUnlockSfx();
  await showNarrative("Has recorrido todos los mundos de este universo...",2500);
  await showNarrative("Pero aún quedan pequeñas luces esperando ser encontradas.",2800);
  revealMoon(true);
  setTimeout(openMoonMoment,900);
}

function openLetter(){closeMenu();letterScene.classList.add("is-open");letterScene.setAttribute("aria-hidden","false");document.body.classList.add("letter-open");duckAudio()}
function closeLetterScene(){letterScene.classList.remove("is-open");letterScene.setAttribute("aria-hidden","true");document.body.classList.remove("letter-open");restoreAudio();if(!state.finalLineShown){state.finalLineShown=true;setTimeout(()=>showNarrative("Este universo siempre será tuyo.",3600),900)}}
function openEpilogue(){if(!state.epilogueUnlocked)return;closeMenu();epilogueScene.classList.add("is-open");epilogueScene.setAttribute("aria-hidden","false");document.body.classList.add("epilogue-open");duckAudio()}
function closeEpilogueScene(){epilogueScene.classList.remove("is-open");epilogueScene.setAttribute("aria-hidden","true");document.body.classList.remove("epilogue-open");restoreAudio()}

function toggleMenu(){const open=!menuPanel.classList.contains("is-open");menuPanel.classList.toggle("is-open",open);menuPanel.setAttribute("aria-hidden",String(!open));menuToggle.setAttribute("aria-expanded",String(open))}
function closeMenu(){menuPanel.classList.remove("is-open");menuPanel.setAttribute("aria-hidden","true");menuToggle.setAttribute("aria-expanded","false")}
function guideToLight(){const remaining=[...document.querySelectorAll(".interactive-star:not(.discovered)")];if(!remaining.length){openEpilogue();return}const star=remaining[Math.floor(Math.random()*remaining.length)];closeMenu();centerOnWorldPoint(Number(star.dataset.x),Number(star.dataset.y),Math.max(camera.scale,.88),true);star.classList.add("guided-light");setTimeout(()=>star.classList.remove("guided-light"),6000)}
function resetAllProgress(){if(!confirm("¿Reiniciar todos los planetas, luces y la carta?"))return;localStorage.removeItem(STORAGE_KEY);location.reload()}

function scheduleRevealCheck(){if(revealFrame)return;revealFrame=requestAnimationFrame(()=>{revealFrame=null;updateRevealStates()})}
function updateRevealStates(){if(!state.started)return;const cx=innerWidth/2,cy=innerHeight/2;const r=Math.min(innerWidth,innerHeight)*.66,pr=Math.min(innerWidth,innerHeight)*.86;document.querySelectorAll(".interactive-star:not(.discovered)").forEach(s=>{const b=s.getBoundingClientRect(),d=Math.hypot(b.left+b.width/2-cx,b.top+b.height/2-cy);s.classList.toggle("awakened",d<r);s.classList.toggle("dormant",d>=r)});document.querySelectorAll(".planet:not(.discovered)").forEach(p=>{const b=p.getBoundingClientRect(),d=Math.hypot(b.left+b.width/2-cx,b.top+b.height/2-cy);p.classList.toggle("awakened",d<pr);p.classList.toggle("dormant",d>=pr)})}

function stopInertia(){cancelAnimationFrame(inertiaFrame);inertiaFrame=null}
function startInertia(){stopInertia();let vx=state.velocityX,vy=state.velocityY;const step=()=>{vx*=.93;vy*=.93;if(Math.hypot(vx,vy)<.08)return;camera.x+=vx;camera.y+=vy;applyCamera(false);inertiaFrame=requestAnimationFrame(step)};inertiaFrame=requestAnimationFrame(step)}
function pointerDown(e){if(e.button!==undefined&&e.button!==0)return;if(e.target.closest("button,.menu-panel,.planet-sheet,.letter,.epilogue-card"))return;stopInertia();state.dragging=true;state.movedDuringPointer=false;state.pointerStartX=e.clientX;state.pointerStartY=e.clientY;state.cameraStartX=camera.x;state.cameraStartY=camera.y;state.lastPointerX=e.clientX;state.lastPointerY=e.clientY;state.lastPointerTime=performance.now();viewport.classList.add("is-dragging");viewport.setPointerCapture?.(e.pointerId)}
function pointerMove(e){if(!state.dragging)return;const dx=e.clientX-state.pointerStartX,dy=e.clientY-state.pointerStartY;if(Math.hypot(dx,dy)>5)state.movedDuringPointer=true;camera.x=state.cameraStartX+dx;camera.y=state.cameraStartY+dy;const now=performance.now(),dt=Math.max(8,now-state.lastPointerTime);state.velocityX=(e.clientX-state.lastPointerX)/(dt/16);state.velocityY=(e.clientY-state.lastPointerY)/(dt/16);state.lastPointerX=e.clientX;state.lastPointerY=e.clientY;state.lastPointerTime=now;applyCamera(false)}
function pointerUp(e){if(!state.dragging)return;state.dragging=false;viewport.classList.remove("is-dragging");viewport.releasePointerCapture?.(e.pointerId);if(state.movedDuringPointer)startInertia();setTimeout(()=>{state.movedDuringPointer=false},80)}
function wheelZoom(e){e.preventDefault();stopInertia();const rect=viewport.getBoundingClientRect();const px=e.clientX-rect.width/2,py=e.clientY-rect.height/2;const old=camera.scale;const next=clamp(old*(e.deltaY<0?1.1:.9),MIN_SCALE,MAX_SCALE);const ratio=next/old;camera.x=px-(px-camera.x)*ratio;camera.y=py-(py-camera.y)*ratio;camera.scale=next;applyCamera(false)}
function touchDistance(t){return Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)}
function touchStart(e){if(e.touches.length===2){state.pinchDistance=touchDistance(e.touches);state.pinchScale=camera.scale}}
function touchMove(e){if(e.touches.length!==2||!state.pinchDistance)return;e.preventDefault();camera.scale=clamp(state.pinchScale*(touchDistance(e.touches)/state.pinchDistance),MIN_SCALE,MAX_SCALE);applyCamera(false)}
function touchEnd(e){if(e.touches.length<2)state.pinchDistance=null}

originStar.addEventListener("click",beginExperience);
lightMessage.addEventListener("click",closeLightMessage);
closePanel.addEventListener("click",closePlanetMoment);planetMomentBackdrop.addEventListener("click",closePlanetMoment);
secretObject.addEventListener("click",openLetter);
if(moonObject)moonObject.addEventListener("click",e=>{e.stopPropagation();openMoonMoment()});
if(openMoonMessage)openMoonMessage.addEventListener("click",()=>{closeMenu();openMoonMoment()});closeLetter.addEventListener("click",closeLetterScene);letterBackdrop.addEventListener("click",closeLetterScene);
closeEpilogue.addEventListener("click",closeEpilogueScene);epilogueBackdrop.addEventListener("click",closeEpilogueScene);
menuToggle.addEventListener("click",e=>{e.stopPropagation();toggleMenu()});
toggleAudio.addEventListener("click",toggleSound);nextTrackButton.addEventListener("click",nextTrack);resetView.addEventListener("click",()=>{closeMenu();resetCamera()});findLight.addEventListener("click",guideToLight);openLetterAgain.addEventListener("click",openLetter);openEpilogueButton.addEventListener("click",openEpilogue);resetProgress.addEventListener("click",resetAllProgress);
viewport.addEventListener("pointerdown",pointerDown);viewport.addEventListener("pointermove",pointerMove);viewport.addEventListener("pointerup",pointerUp);viewport.addEventListener("pointercancel",pointerUp);viewport.addEventListener("wheel",wheelZoom,{passive:false});viewport.addEventListener("touchstart",touchStart,{passive:true});viewport.addEventListener("touchmove",touchMove,{passive:false});viewport.addEventListener("touchend",touchEnd,{passive:true});
document.addEventListener("click",e=>{if(menuPanel.classList.contains("is-open")&&!e.target.closest(".menu-panel,.menu-toggle"))closeMenu()});
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(letterScene.classList.contains("is-open"))closeLetterScene();else if(epilogueScene.classList.contains("is-open"))closeEpilogueScene();else if(planetMoment.classList.contains("is-open"))closePlanetMoment();else if(lightMessage.classList.contains("is-open"))closeLightMessage();else closeMenu()});
document.querySelectorAll(".celestial:not(#secretObject)").forEach(object=>{object.style.left=`${object.dataset.x}px`;object.style.top=`${object.dataset.y}px`;object.addEventListener("pointerdown",e=>e.stopPropagation());object.addEventListener("click",e=>{e.stopPropagation();discoverCelestial(object)})});
window.addEventListener("resize",()=>{scheduleRevealCheck();createAmbientSpace()});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&state.started)scheduleShootingStar(true)});

probeTracks();createStars();createAmbientSpace();loadProgress();applySavedProgress();applyCamera(false);introSequence();
