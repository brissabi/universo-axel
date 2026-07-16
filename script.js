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
const moonOrbit = document.getElementById("moonOrbit");
const moonObject = document.getElementById("moonObject");
const secretObject = document.getElementById("secretObject");
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
const openMoonMessageButton = document.getElementById("openMoonMessage");
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
const qualityStatus = document.getElementById("qualityStatus");
const qualityButtons = [...document.querySelectorAll("[data-quality]")];

const WORLD_WIDTH = 3600;
const WORLD_HEIGHT = 2600;
const MIN_SCALE = 0.42;
const MAX_SCALE = 2.3;
const DEFAULT_SCALE = window.innerWidth < 700 ? 0.48 : 0.62;
const STORAGE_KEY = "universoAxelProgressV1";
const MUSIC_KEY = "projectPolarisLastTrack";
const QUALITY_KEY = "projectPolarisQuality";
const STAR_LAYOUT_SEED = 21042026;
const WHEEL_ZOOM_SENSITIVITY = 0.00125;
const KEYBOARD_PAN_STEP = 92;
const KEYBOARD_ZOOM_FACTOR = 1.12;

const tracks = [
  { title: "Say Yes To Heaven", artist: "Lana Del Rey", file: "say_yes_to_heaven.mp3", theme: "heaven", volume: 0.14 },
  { title: "UNDERSTAND", artist: "keshi", file: "understand.mp3", theme: "understand", volume: 0.15 },
  { title: "Silence", artist: "sunwoojunga", file: "silence.mp3", theme: "silence", volume: 0.13 },
  { title: "Halley's Comet", artist: "Billie Eilish", file: "halleys_comet.mp3", theme: "comet", volume: 0.14 },
  { title: "Like You Do", artist: "Joji", file: "like_you_do.mp3", theme: "like-you-do", volume: 0.13 },
  { title: "Star Shopping", artist: "Lil Peep", file: "star_shopping.mp3", theme: "star-shopping", volume: 0.12 },
  { title: "Summer Eyes", artist: "OHYUL", file: "summer_eyes.mp3", theme: "summer-eyes", volume: 0.14 },
];

const QUALITY_PROFILES = {
  high: { deepStars: 270, motes: 78, bodies: 9, shootMin: 7000, shootMax: 16000 },
  balanced: { deepStars: 180, motes: 42, bodies: 5, shootMin: 13000, shootMax: 27000 },
  saver: { deepStars: 105, motes: 16, bodies: 1, shootMin: 27000, shootMax: 48000 },
};

let availableTracks = [...tracks];
let currentTrack = null;
let trackBag = [];
let audioTargetVolume = tracks[0].volume;
let audioFadeFrame = null;
let audioContext = null;
let shootingStarTimer = null;
let revealFrame = null;
let inertiaFrame = null;
let toastTimer = null;
let returnToastTimer = null;
let lightMessageTimer = null;
let activeReadingStar = null;
let currentMomentKind = "planet";
let selectedQuality = localStorage.getItem(QUALITY_KEY) || "auto";
let resolvedQuality = "balanced";

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
  moonUnlocked: false,
  finalLightUnlocked: false,
  letterOpened: false,
  epilogueUnlocked: false,
  pendingMoonUnlock: false,
  pendingFinalUnlock: false,
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function wait(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

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

function resetCamera() {
  centerOnWorldPoint(1800, 1300, DEFAULT_SCALE, true);
}

function resolveAutomaticQuality() {
  const mobile = window.matchMedia("(max-width: 760px)").matches || navigator.maxTouchPoints > 1;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const memory = Number(navigator.deviceMemory || 8);
  const cores = Number(navigator.hardwareConcurrency || 8);

  if (reducedMotion) return "saver";
  if (mobile && (memory <= 4 || cores <= 4)) return "saver";
  if (mobile || memory <= 4 || cores <= 4) return "balanced";
  return "high";
}

function qualityLabel(value) {
  return { high: "Alta", balanced: "Equilibrada", saver: "Ahorro" }[value] || "Equilibrada";
}

function applyQuality(mode, persist = true) {
  const valid = ["auto", "high", "balanced", "saver"];
  selectedQuality = valid.includes(mode) ? mode : "auto";
  resolvedQuality = selectedQuality === "auto" ? resolveAutomaticQuality() : selectedQuality;

  document.body.dataset.quality = resolvedQuality;
  document.body.dataset.qualityPreference = selectedQuality;
  qualityStatus.textContent = selectedQuality === "auto"
    ? `Automática · ${qualityLabel(resolvedQuality)}`
    : qualityLabel(resolvedQuality);

  qualityButtons.forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.quality === selectedQuality));
  });

  if (persist) localStorage.setItem(QUALITY_KEY, selectedQuality);
  createDeepStars();
  createAmbientSpace();
  if (state.started) scheduleShootingStar(false);
}

function createDeepStars() {
  deepStars.replaceChildren();
  const profile = QUALITY_PROFILES[resolvedQuality];
  const random = seededRandom(STAR_LAYOUT_SEED + profile.deepStars);
  const colors = ["#ffffff", "#dff7ff", "#cdd7ff", "#f4d7ff", "#ffd8f1"];

  for (let i = 0; i < profile.deepStars; i += 1) {
    const star = document.createElement("span");
    star.className = "star deep-star";
    star.style.left = `${random() * 100}%`;
    star.style.top = `${random() * 100}%`;
    star.style.setProperty("--size", `${(random() * 2 + 0.5).toFixed(2)}px`);
    star.style.setProperty("--base-opacity", (random() * 0.36 + 0.08).toFixed(2));
    star.style.setProperty("--twinkle", `${(random() * 7 + 4).toFixed(1)}s`);
    star.style.setProperty("--star-color", colors[Math.floor(random() * colors.length)]);
    deepStars.appendChild(star);
  }
}

function createInteractiveStars() {
  if (interactiveStars.childElementCount) return;

  const random = seededRandom(STAR_LAYOUT_SEED);
  const exclusionZones = [
    { x: 1800, y: 1300, r: 220 }, { x: 1470, y: 1110, r: 95 },
    { x: 2140, y: 1030, r: 120 }, { x: 1260, y: 1540, r: 190 },
    { x: 2400, y: 1570, r: 115 }, { x: 920, y: 720, r: 190 },
    { x: 2820, y: 830, r: 220 }, { x: 620, y: 2050, r: 165 },
    { x: 3080, y: 2070, r: 175 }, { x: 1800, y: 2350, r: 145 },
  ];
  const placed = [];
  const valid = (x, y) => exclusionZones.every(zone => Math.hypot(x - zone.x, y - zone.y) >= zone.r)
    && placed.every(point => Math.hypot(x - point.x, y - point.y) >= 48);

  for (let i = 0; i < 80; i += 1) {
    let x = 0;
    let y = 0;
    let tries = 0;
    do {
      x = Math.round(120 + random() * (WORLD_WIDTH - 240));
      y = Math.round(120 + random() * (WORLD_HEIGHT - 240));
      tries += 1;
    } while (!valid(x, y) && tries < 1500);

    placed.push({ x, y });
    const star = document.createElement("button");
    star.type = "button";
    star.className = "star interactive-star dormant";
    star.dataset.starId = String(i);
    star.dataset.x = String(x);
    star.dataset.y = String(y);
    star.dataset.message = starMessages[i];
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.setProperty("--size", `${(random() * 3.4 + 2.1).toFixed(2)}px`);
    star.style.setProperty("--dormant-opacity", (random() * 0.1 + 0.055).toFixed(2));
    star.setAttribute("aria-label", `Descubrir la luz ${i + 1}`);
    star.addEventListener("click", event => {
      event.stopPropagation();
      if (state.movedDuringPointer) return;
      discoverStar(star);
    });
    interactiveStars.appendChild(star);
  }
}

function createAmbientSpace() {
  cosmicDust.replaceChildren();
  driftingBodies.replaceChildren();
  const profile = QUALITY_PROFILES[resolvedQuality];
  const random = seededRandom(88731 + profile.motes);

  for (let i = 0; i < profile.motes; i += 1) {
    const mote = document.createElement("span");
    mote.className = "cosmic-mote";
    mote.style.left = `${random() * 100}%`;
    mote.style.top = `${random() * 100}%`;
    mote.style.setProperty("--mote-size", `${(random() * 2.4 + 0.7).toFixed(2)}px`);
    mote.style.setProperty("--mote-opacity", (random() * 0.28 + 0.08).toFixed(2));
    mote.style.setProperty("--mote-duration", `${(random() * 24 + 22).toFixed(1)}s`);
    mote.style.setProperty("--mote-delay", `${(-random() * 30).toFixed(1)}s`);
    mote.style.setProperty("--mote-x", `${(random() * 110 - 55).toFixed(0)}px`);
    mote.style.setProperty("--mote-y", `${(random() * -95 - 20).toFixed(0)}px`);
    cosmicDust.appendChild(mote);
  }

  for (let i = 0; i < profile.bodies; i += 1) {
    const body = document.createElement("span");
    body.className = "drifting-body";
    body.style.top = `${8 + random() * 78}%`;
    body.style.left = `${-20 - random() * 35}%`;
    body.style.setProperty("--body-size", `${(random() * 8 + 3).toFixed(1)}px`);
    body.style.setProperty("--body-opacity", (random() * 0.16 + 0.06).toFixed(2));
    body.style.setProperty("--body-blur", `${(random() * 0.8).toFixed(2)}px`);
    body.style.setProperty("--body-duration", `${(random() * 38 + 42).toFixed(1)}s`);
    body.style.setProperty("--body-delay", `${(-random() * 55).toFixed(1)}s`);
    body.style.setProperty("--body-wave", `${(random() * 100 - 50).toFixed(0)}px`);
    driftingBodies.appendChild(body);
  }
}

function scheduleShootingStar(initial = false) {
  clearTimeout(shootingStarTimer);
  const profile = QUALITY_PROFILES[resolvedQuality];
  const delay = initial ? 4600 : profile.shootMin + Math.random() * (profile.shootMax - profile.shootMin);
  shootingStarTimer = window.setTimeout(() => {
    if (state.started && !document.hidden && !document.body.classList.contains("letter-open")) {
      launchShootingStar();
    }
    scheduleShootingStar(false);
  }, delay);
}

function launchShootingStar() {
  const star = document.createElement("span");
  star.className = "shooting-star";
  star.style.left = `${72 + Math.random() * 30}%`;
  star.style.top = `${5 + Math.random() * 40}%`;
  star.style.setProperty("--shoot-angle", `${(-22 - Math.random() * 18).toFixed(1)}deg`);
  star.style.setProperty("--shoot-x", `${-(430 + Math.random() * 470).toFixed(0)}px`);
  star.style.setProperty("--shoot-y", `${(220 + Math.random() * 340).toFixed(0)}px`);
  star.style.setProperty("--shoot-duration", `${(1.05 + Math.random() * 0.7).toFixed(2)}s`);
  star.style.setProperty("--shoot-length", `${(120 + Math.random() * 100).toFixed(0)}px`);
  shootingStarsLayer.appendChild(star);
  requestAnimationFrame(() => star.classList.add("is-flying"));
  star.addEventListener("animationend", () => star.remove(), { once: true });
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 3,
      visitedPlanets: [...state.visitedPlanets],
      visitedStars: [...state.visitedStars],
      moonUnlocked: state.moonUnlocked,
      finalLightUnlocked: state.finalLightUnlocked,
      letterOpened: state.letterOpened,
      epilogueUnlocked: state.epilogueUnlocked,
    }));
  } catch (error) {
    console.warn("No se pudo guardar el progreso", error);
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    const validPlanets = new Set(["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"]);
    state.visitedPlanets = new Set((data.visitedPlanets || []).filter(value => validPlanets.has(value)));
    state.visitedStars = new Set((data.visitedStars || []).map(String).filter(value => Number(value) >= 0 && Number(value) < 80));

    state.moonUnlocked = state.visitedPlanets.size === 8;
    state.finalLightUnlocked = state.visitedPlanets.size === 8 && state.visitedStars.size === 80;
    state.letterOpened = Boolean(data.letterOpened);
    state.epilogueUnlocked = Boolean(data.epilogueUnlocked) || state.letterOpened;
  } catch (error) {
    console.warn("No se pudo recuperar el progreso", error);
  }
}

function revealMoon(immediate = false) {
  moonOrbit.classList.add("is-unlocked");
  moonOrbit.setAttribute("aria-hidden", "false");
  moonOrbit.classList.toggle("is-immediate", immediate);
  if (openMoonMessageButton) openMoonMessageButton.hidden = false;
}

function revealFinalLight(immediate = false) {
  secretObject.classList.remove("hidden-object");
  secretObject.classList.add("is-revealed");
  secretObject.classList.toggle("is-immediate", immediate);
  openLetterAgain.hidden = false;
}

function applySavedProgress() {
  document.querySelectorAll(".planet").forEach(planet => {
    if (state.visitedPlanets.has(planet.dataset.planet)) {
      planet.classList.remove("dormant", "awakened");
      planet.classList.add("discovered");
    }
  });

  document.querySelectorAll(".interactive-star").forEach(star => {
    if (state.visitedStars.has(star.dataset.starId)) {
      star.classList.remove("dormant", "awakened");
      star.classList.add("discovered");
    }
  });

  progressCount.textContent = state.visitedPlanets.size;
  starProgressCount.textContent = state.visitedStars.size;
  if (state.moonUnlocked) revealMoon(true);
  if (state.finalLightUnlocked) revealFinalLight(true);
  if (state.epilogueUnlocked) openEpilogueButton.hidden = false;
}

function showReturnToast() {
  const parts = [];
  if (state.visitedPlanets.size) parts.push(`${state.visitedPlanets.size} capítulos`);
  if (state.visitedStars.size) parts.push(`${state.visitedStars.size} luces`);
  if (!parts.length) return;
  returnToast.textContent = `${parts.join(" y ")} siguen esperando por ti.`;
  returnToast.classList.add("is-visible");
  clearTimeout(returnToastTimer);
  returnToastTimer = window.setTimeout(() => returnToast.classList.remove("is-visible"), 4800);
}

async function introSequence() {
  await wait(3000);
  if (state.started) return;
  introText.classList.add("is-changing");
  await wait(850);
  introText.textContent = "La nuestra comenzó con una conversación.";
  introText.classList.remove("is-changing");
}

function showNarrative(text, duration = 3000) {
  return new Promise(resolve => {
    document.body.classList.add("narrative-active");
    narrativeText.textContent = text;
    narrativeText.classList.add("is-visible");
    window.setTimeout(() => {
      narrativeText.classList.remove("is-visible");
      window.setTimeout(() => {
        document.body.classList.remove("narrative-active");
        resolve();
      }, 900);
    }, duration);
  });
}

async function beginExperience() {
  if (state.started) return;
  state.started = true;
  initAudioContext();
  startSoundtrackFromGesture();

  originStar.disabled = true;
  originStar.classList.add("is-consumed");
  introInstruction.classList.add("is-hidden");
  window.setTimeout(() => {
    originStar.hidden = true;
  }, 780);

  introText.classList.add("is-changing");
  await wait(700);
  introText.textContent = "Nunca imaginé que aquella conversación terminaría convirtiéndose en el lugar donde más paz encontraría.";
  introText.classList.remove("is-changing");
  await wait(2500);

  intro.classList.add("is-leaving");
  viewport.classList.remove("is-locked");
  viewport.classList.add("is-ready");
  resetCamera();
  scheduleShootingStar(true);
  await wait(1900);
  await showNarrative("Los planetas guardan capítulos. Las luces pequeñas guardan pensamientos.", 3400);
  showReturnToast();
}

function initAudioContext() {
  if (audioContext) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
}

function tone(freq, start, duration, gain, type = "sine") {
  if (!audioContext || !state.audioEnabled) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, start);
  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(gain, start + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gainNode).connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

function playStarSfx() {
  if (!audioContext) return;
  const time = audioContext.currentTime;
  tone(880, time, 0.65, 0.025);
  tone(1320, time + 0.08, 0.7, 0.014);
}

function playPlanetSfx() {
  if (!audioContext) return;
  const time = audioContext.currentTime;
  tone(96, time, 1.3, 0.026);
  tone(420, time + 0.18, 0.85, 0.013);
}

function playUnlockSfx() {
  if (!audioContext) return;
  const time = audioContext.currentTime;
  [392, 523, 659, 784].forEach((frequency, index) => tone(frequency, time + index * 0.13, 0.95, 0.018));
}

async function probeTracks() {
  if (location.protocol === "file:") return;
  const checks = await Promise.all(tracks.map(async track => {
    try {
      const response = await fetch(track.file, { method: "HEAD", cache: "no-store" });
      return response.ok ? track : null;
    } catch {
      return null;
    }
  }));
  const valid = checks.filter(Boolean);
  if (valid.length) availableTracks = valid;
}

function refillTrackBag() {
  const list = [...availableTracks];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[randomIndex]] = [list[randomIndex], list[index]];
  }
  const lastFile = currentTrack?.file || localStorage.getItem(MUSIC_KEY);
  if (lastFile && list.length > 1 && list[0].file === lastFile) {
    [list[0], list[1]] = [list[1], list[0]];
  }
  trackBag = list;
}

function getNextTrack() {
  if (!trackBag.length) refillTrackBag();
  return trackBag.shift() || tracks[0];
}

function setTrack(track, autoplay = true) {
  currentTrack = track;
  audioTargetVolume = track.volume;
  localStorage.setItem(MUSIC_KEY, track.file);
  soundtrack.src = track.file;
  soundtrack.load();
  menuTrackTitle.textContent = track.title;
  menuTrackArtist.textContent = track.artist;
  toastTrackTitle.textContent = track.title;
  toastTrackArtist.textContent = track.artist;
  document.body.dataset.soundTheme = track.theme;
  showTrackToast();

  if (!autoplay) return;
  soundtrack.volume = 0;
  const playPromise = soundtrack.play();
  if (!playPromise) return;
  playPromise.then(() => {
    state.audioStarted = true;
    state.audioEnabled = true;
    toggleAudio.textContent = "Pausar sonido";
    fadeAudioTo(track.volume, 3200);
  }).catch(() => {
    state.audioStarted = false;
    toggleAudio.textContent = "Activar sonido";
  });
}

function startSoundtrackFromGesture() {
  setTrack(getNextTrack(), true);
}

function nextTrack() {
  if (!state.audioEnabled) state.audioEnabled = true;
  setTrack(getNextTrack(), true);
}

function showTrackToast() {
  trackToast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => trackToast.classList.remove("is-visible"), 4700);
}

function fadeAudioTo(target, duration = 900) {
  cancelAnimationFrame(audioFadeFrame);
  audioTargetVolume = target;
  if (soundtrack.paused) return;
  const start = soundtrack.volume;
  const startTime = performance.now();
  const step = now => {
    const progress = Math.min(1, (now - startTime) / duration);
    soundtrack.volume = clamp(start + (target - start) * (1 - Math.pow(1 - progress, 3)), 0, 1);
    if (progress < 1) audioFadeFrame = requestAnimationFrame(step);
  };
  audioFadeFrame = requestAnimationFrame(step);
}

function toggleSound() {
  initAudioContext();
  if (soundtrack.paused) {
    state.audioEnabled = true;
    const playPromise = soundtrack.play();
    if (playPromise) {
      playPromise.then(() => {
        toggleAudio.textContent = "Pausar sonido";
        fadeAudioTo(currentTrack?.volume || tracks[0].volume, 900);
      }).catch(() => {
        toggleAudio.textContent = "Toca otra vez";
      });
    }
  } else {
    fadeAudioTo(0, 450);
    window.setTimeout(() => soundtrack.pause(), 470);
    state.audioEnabled = false;
    toggleAudio.textContent = "Activar sonido";
  }
}

soundtrack.addEventListener("ended", nextTrack);
soundtrack.addEventListener("error", () => {
  if (state.started && availableTracks.length > 1) window.setTimeout(nextTrack, 300);
});

function openLightMessage(message, star) {
  clearTimeout(lightMessageTimer);
  if (activeReadingStar && activeReadingStar !== star) activeReadingStar.classList.remove("is-reading");
  activeReadingStar = star;
  activeReadingStar?.classList.add("is-reading");
  lightMessageText.textContent = message;
  lightMessage.classList.add("is-open");
  lightMessageTimer = window.setTimeout(closeLightMessage, 7000);
}

function closeLightMessage() {
  if (!lightMessage.classList.contains("is-open")) return;
  clearTimeout(lightMessageTimer);
  lightMessage.classList.remove("is-open");
  activeReadingStar?.classList.remove("is-reading");
  activeReadingStar = null;

  if (state.pendingFinalUnlock) {
    state.pendingFinalUnlock = false;
    window.setTimeout(unlockFinalLight, 750);
  }
}

function discoverStar(star) {
  const id = star.dataset.starId;
  if (!state.visitedStars.has(id)) {
    state.visitedStars.add(id);
    star.classList.remove("dormant", "awakened");
    star.classList.add("discovered");
    starProgressCount.textContent = state.visitedStars.size;
    playStarSfx();
    saveProgress();
  }

  if (state.visitedStars.size === 80 && state.visitedPlanets.size === 8 && !state.finalLightUnlocked) {
    state.pendingFinalUnlock = true;
  }
  openLightMessage(star.dataset.message, star);
}

function openPlanetMoment(object) {
  currentMomentKind = "planet";
  panelEyebrow.textContent = object.dataset.kind === "sun" ? "Origen" : "Planeta descubierto";
  panelTitle.textContent = object.dataset.title;
  panelMessage.textContent = object.dataset.message;
  planetMoment.classList.add("is-open");
  planetMoment.setAttribute("aria-hidden", "false");
  document.body.classList.add("moment-open");
}

function openMoonMessage() {
  if (!state.moonUnlocked) return;
  closeMenu();
  currentMomentKind = "moon";
  panelEyebrow.textContent = "Una nueva presencia";
  panelTitle.textContent = "La luna — Lo que todavía espera";
  panelMessage.textContent = "Has recorrido todos los mundos de este universo. Cada uno guardaba una parte de lo que quería decirte. Pero aún quedan pequeñas luces esperando ser encontradas. Cuando todas despierten, algo que permanecía oculto podrá encontrarte.";
  planetMoment.classList.add("is-open");
  planetMoment.setAttribute("aria-hidden", "false");
  document.body.classList.add("moment-open");
}

function closePlanetMoment() {
  if (!planetMoment.classList.contains("is-open")) return;
  planetMoment.classList.remove("is-open");
  planetMoment.setAttribute("aria-hidden", "true");
  document.body.classList.remove("moment-open");

  if (state.pendingMoonUnlock) {
    state.pendingMoonUnlock = false;
    window.setTimeout(unlockMoon, 800);
    return;
  }

  if (currentMomentKind === "moon" && state.pendingFinalUnlock) {
    state.pendingFinalUnlock = false;
    window.setTimeout(unlockFinalLight, 800);
  }
}

function discoverCelestial(object) {
  if (state.movedDuringPointer) return;
  const x = Number(object.dataset.x);
  const y = Number(object.dataset.y);
  centerOnWorldPoint(x, y, window.innerWidth < 700 ? 0.78 : 0.92, true);
  const name = object.dataset.planet;

  if (name && !state.visitedPlanets.has(name)) {
    state.visitedPlanets.add(name);
    object.classList.remove("dormant", "awakened");
    object.classList.add("discovered");
    progressCount.textContent = state.visitedPlanets.size;
    playPlanetSfx();
    if (state.visitedPlanets.size === 8 && !state.moonUnlocked) state.pendingMoonUnlock = true;
    saveProgress();
  }

  window.setTimeout(() => openPlanetMoment(object), 760);
}

async function unlockMoon() {
  if (state.moonUnlocked) return;
  state.moonUnlocked = true;
  saveProgress();
  playUnlockSfx();
  await showNarrative("Has recorrido todos los mundos de este universo.", 2700);
  await showNarrative("Pero todavía quedan pequeñas luces esperando ser encontradas.", 3100);
  revealMoon(false);
  centerOnWorldPoint(1260, 1540, window.innerWidth < 700 ? 0.82 : 0.96, true);
  await wait(1350);
  if (state.visitedStars.size === 80 && !state.finalLightUnlocked) state.pendingFinalUnlock = true;
  openMoonMessage();
}

async function unlockFinalLight() {
  if (state.finalLightUnlocked) return;
  if (state.visitedPlanets.size !== 8 || state.visitedStars.size !== 80) return;

  state.finalLightUnlocked = true;
  saveProgress();
  playUnlockSfx();
  moonOrbit.classList.add("is-finalizing");
  await showNarrative("Ya no queda ninguna luz dormida.", 2500);
  await showNarrative("Has encontrado cada pensamiento que dejé escondido para ti.", 3300);
  await showNarrative("Ahora hay algo que este universo estuvo guardando desde el principio.", 3400);
  revealFinalLight(false);
  centerOnWorldPoint(1800, 2350, window.innerWidth < 700 ? 0.72 : 0.82, true);
  window.setTimeout(() => moonOrbit.classList.remove("is-finalizing"), 2200);
}

function openLetter() {
  if (!state.finalLightUnlocked) return;
  closeMenu();
  state.letterOpened = true;
  saveProgress();
  letterScene.classList.add("is-open");
  letterScene.setAttribute("aria-hidden", "false");
  document.body.classList.add("letter-open");
}

function closeLetterScene() {
  letterScene.classList.remove("is-open");
  letterScene.setAttribute("aria-hidden", "true");
  document.body.classList.remove("letter-open");
  state.epilogueUnlocked = true;
  openEpilogueButton.hidden = false;
  saveProgress();

  if (!state.finalLineShown) {
    state.finalLineShown = true;
    window.setTimeout(() => showNarrative("Este universo siempre será tuyo.", 3600), 900);
  }
}

function openEpilogue() {
  if (!state.epilogueUnlocked) return;
  closeMenu();
  epilogueScene.classList.add("is-open");
  epilogueScene.setAttribute("aria-hidden", "false");
  document.body.classList.add("epilogue-open");
}

function closeEpilogueScene() {
  epilogueScene.classList.remove("is-open");
  epilogueScene.setAttribute("aria-hidden", "true");
  document.body.classList.remove("epilogue-open");
}

function toggleMenu() {
  const open = !menuPanel.classList.contains("is-open");
  menuPanel.classList.toggle("is-open", open);
  menuPanel.setAttribute("aria-hidden", String(!open));
  menuToggle.setAttribute("aria-expanded", String(open));
}

function closeMenu() {
  menuPanel.classList.remove("is-open");
  menuPanel.setAttribute("aria-hidden", "true");
  menuToggle.setAttribute("aria-expanded", "false");
}

function guideToLight() {
  const remaining = [...document.querySelectorAll(".interactive-star:not(.discovered)")];
  if (!remaining.length) {
    if (state.finalLightUnlocked) {
      centerOnWorldPoint(1800, 2350, 0.82, true);
    } else {
      showNarrative("Todas las luces despertaron. Aún falta recorrer los planetas.", 3000);
    }
    closeMenu();
    return;
  }

  const star = remaining[Math.floor(Math.random() * remaining.length)];
  closeMenu();
  centerOnWorldPoint(Number(star.dataset.x), Number(star.dataset.y), Math.max(camera.scale, 0.88), true);
  star.classList.add("guided-light");
  window.setTimeout(() => star.classList.remove("guided-light"), 6000);
}

function resetAllProgress() {
  if (!confirm("¿Reiniciar todos los planetas, luces, la luna y la carta?")) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

function scheduleRevealCheck() {
  if (revealFrame) return;
  revealFrame = requestAnimationFrame(() => {
    revealFrame = null;
    updateRevealStates();
  });
}

function updateRevealStates() {
  if (!state.started) return;
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  const starRadius = Math.min(innerWidth, innerHeight) * 0.66;
  const planetRadius = Math.min(innerWidth, innerHeight) * 0.86;

  document.querySelectorAll(".interactive-star:not(.discovered)").forEach(star => {
    const bounds = star.getBoundingClientRect();
    const distance = Math.hypot(bounds.left + bounds.width / 2 - centerX, bounds.top + bounds.height / 2 - centerY);
    star.classList.toggle("awakened", distance < starRadius);
    star.classList.toggle("dormant", distance >= starRadius);
  });

  document.querySelectorAll(".planet:not(.discovered)").forEach(planet => {
    const bounds = planet.getBoundingClientRect();
    const distance = Math.hypot(bounds.left + bounds.width / 2 - centerX, bounds.top + bounds.height / 2 - centerY);
    planet.classList.toggle("awakened", distance < planetRadius);
    planet.classList.toggle("dormant", distance >= planetRadius);
  });
}

function stopInertia() {
  cancelAnimationFrame(inertiaFrame);
  inertiaFrame = null;
}

function startInertia() {
  stopInertia();
  let velocityX = state.velocityX;
  let velocityY = state.velocityY;
  const step = () => {
    velocityX *= 0.93;
    velocityY *= 0.93;
    if (Math.hypot(velocityX, velocityY) < 0.08) return;
    camera.x += velocityX;
    camera.y += velocityY;
    applyCamera(false);
    inertiaFrame = requestAnimationFrame(step);
  };
  inertiaFrame = requestAnimationFrame(step);
}

function pointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  if (event.target.closest("button,.menu-panel,.planet-sheet,.letter,.epilogue-card")) return;
  stopInertia();
  state.dragging = true;
  state.movedDuringPointer = false;
  state.pointerStartX = event.clientX;
  state.pointerStartY = event.clientY;
  state.cameraStartX = camera.x;
  state.cameraStartY = camera.y;
  state.lastPointerX = event.clientX;
  state.lastPointerY = event.clientY;
  state.lastPointerTime = performance.now();
  viewport.classList.add("is-dragging");
  viewport.setPointerCapture?.(event.pointerId);
}

function pointerMove(event) {
  if (!state.dragging) return;
  const deltaX = event.clientX - state.pointerStartX;
  const deltaY = event.clientY - state.pointerStartY;
  if (Math.hypot(deltaX, deltaY) > 5) state.movedDuringPointer = true;
  camera.x = state.cameraStartX + deltaX;
  camera.y = state.cameraStartY + deltaY;
  const now = performance.now();
  const elapsed = Math.max(8, now - state.lastPointerTime);
  state.velocityX = (event.clientX - state.lastPointerX) / (elapsed / 16);
  state.velocityY = (event.clientY - state.lastPointerY) / (elapsed / 16);
  state.lastPointerX = event.clientX;
  state.lastPointerY = event.clientY;
  state.lastPointerTime = now;
  applyCamera(false);
}

function pointerUp(event) {
  if (!state.dragging) return;
  state.dragging = false;
  viewport.classList.remove("is-dragging");
  viewport.releasePointerCapture?.(event.pointerId);
  if (state.movedDuringPointer) startInertia();
  window.setTimeout(() => { state.movedDuringPointer = false; }, 80);
}

function zoomAtPoint(nextScale, clientX = window.innerWidth / 2, clientY = window.innerHeight / 2) {
  const rect = viewport.getBoundingClientRect();
  const pointerX = clientX - rect.left - rect.width / 2;
  const pointerY = clientY - rect.top - rect.height / 2;
  const oldScale = camera.scale;
  const clampedScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
  const ratio = clampedScale / oldScale;
  camera.x = pointerX - (pointerX - camera.x) * ratio;
  camera.y = pointerY - (pointerY - camera.y) * ratio;
  camera.scale = clampedScale;
  applyCamera(false);
}

function wheelZoom(event) {
  event.preventDefault();
  stopInertia();
  // Exponential zoom keeps both mouse wheels and precision touchpads smooth.
  const factor = Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY);
  zoomAtPoint(camera.scale * clamp(factor, 0.78, 1.28), event.clientX, event.clientY);
}

function keyboardCameraControl(event) {
  if (!state.started || document.body.classList.contains("moment-open")) return;
  if (event.target.closest("input, textarea, button, .menu-panel, .letter, .planet-sheet")) return;

  const step = KEYBOARD_PAN_STEP * (event.shiftKey ? 1.8 : 1);
  let handled = true;
  switch (event.key.toLowerCase()) {
    case "arrowleft":
    case "a": camera.x += step; break;
    case "arrowright":
    case "d": camera.x -= step; break;
    case "arrowup":
    case "w": camera.y += step; break;
    case "arrowdown":
    case "s": camera.y -= step; break;
    case "+":
    case "=": zoomAtPoint(camera.scale * KEYBOARD_ZOOM_FACTOR); return event.preventDefault();
    case "-":
    case "_": zoomAtPoint(camera.scale / KEYBOARD_ZOOM_FACTOR); return event.preventDefault();
    case "0": resetCamera(); return event.preventDefault();
    default: handled = false;
  }
  if (handled) {
    event.preventDefault();
    stopInertia();
    applyCamera(false);
  }
}

function touchDistance(touches) {
  return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
}

function touchStart(event) {
  if (event.touches.length === 2) {
    state.pinchDistance = touchDistance(event.touches);
    state.pinchScale = camera.scale;
  }
}

function touchMove(event) {
  if (event.touches.length !== 2 || !state.pinchDistance) return;
  event.preventDefault();
  camera.scale = clamp(state.pinchScale * (touchDistance(event.touches) / state.pinchDistance), MIN_SCALE, MAX_SCALE);
  applyCamera(false);
}

function touchEnd(event) {
  if (event.touches.length < 2) state.pinchDistance = null;
}

originStar.addEventListener("click", beginExperience);
lightMessage.addEventListener("click", closeLightMessage);
closePanel.addEventListener("click", closePlanetMoment);
planetMomentBackdrop.addEventListener("click", closePlanetMoment);
moonObject.addEventListener("click", event => {
  event.stopPropagation();
  if (state.movedDuringPointer) return;
  openMoonMessage();
});
secretObject.addEventListener("click", event => {
  event.stopPropagation();
  if (state.movedDuringPointer) return;
  openLetter();
});
closeLetter.addEventListener("click", closeLetterScene);
letterBackdrop.addEventListener("click", closeLetterScene);
closeEpilogue.addEventListener("click", closeEpilogueScene);
epilogueBackdrop.addEventListener("click", closeEpilogueScene);
menuToggle.addEventListener("click", event => {
  event.stopPropagation();
  toggleMenu();
});
toggleAudio.addEventListener("click", toggleSound);
nextTrackButton.addEventListener("click", nextTrack);
resetView.addEventListener("click", () => {
  closeMenu();
  resetCamera();
});
findLight.addEventListener("click", guideToLight);
openMoonMessageButton?.addEventListener("click", openMoonMessage);
openLetterAgain.addEventListener("click", openLetter);
openEpilogueButton.addEventListener("click", openEpilogue);
resetProgress.addEventListener("click", resetAllProgress);
qualityButtons.forEach(button => {
  button.addEventListener("click", () => applyQuality(button.dataset.quality, true));
});

viewport.addEventListener("pointerdown", pointerDown);
viewport.addEventListener("pointermove", pointerMove);
viewport.addEventListener("pointerup", pointerUp);
viewport.addEventListener("pointercancel", pointerUp);
viewport.addEventListener("wheel", wheelZoom, { passive: false });
viewport.addEventListener("touchstart", touchStart, { passive: true });
viewport.addEventListener("touchmove", touchMove, { passive: false });
viewport.addEventListener("touchend", touchEnd, { passive: true });

// Evita el arrastre nativo del navegador (icono rojo de prohibido) sobre planetas, textos e imágenes.
document.addEventListener("dragstart", event => event.preventDefault());
document.addEventListener("keydown", keyboardCameraControl);

document.addEventListener("click", event => {
  if (menuPanel.classList.contains("is-open") && !event.target.closest(".menu-panel,.menu-toggle")) closeMenu();
});

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  if (letterScene.classList.contains("is-open")) closeLetterScene();
  else if (epilogueScene.classList.contains("is-open")) closeEpilogueScene();
  else if (planetMoment.classList.contains("is-open")) closePlanetMoment();
  else if (lightMessage.classList.contains("is-open")) closeLightMessage();
  else closeMenu();
});

document.querySelectorAll(".celestial:not(#secretObject)").forEach(object => {
  object.style.left = `${object.dataset.x}px`;
  object.style.top = `${object.dataset.y}px`;
  object.addEventListener("click", event => {
    event.stopPropagation();
    if (state.movedDuringPointer) return;
    discoverCelestial(object);
  });
  object.addEventListener("dblclick", event => {
    event.preventDefault();
    event.stopPropagation();
    const x = Number(object.dataset.x);
    const y = Number(object.dataset.y);
    centerOnWorldPoint(x, y, window.innerWidth < 700 ? 0.82 : 1.08, true);
    object.classList.add("camera-focus");
    window.setTimeout(() => object.classList.remove("camera-focus"), 900);
  });
});

moonOrbit.style.left = `${moonOrbit.dataset.x}px`;
moonOrbit.style.top = `${moonOrbit.dataset.y}px`;
secretObject.style.left = `${secretObject.dataset.x}px`;
secretObject.style.top = `${secretObject.dataset.y}px`;

window.addEventListener("resize", () => {
  if (selectedQuality === "auto") applyQuality("auto", false);
  else {
    scheduleRevealCheck();
    createAmbientSpace();
  }
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && state.started) scheduleShootingStar(true);
});

createInteractiveStars();
applyQuality(selectedQuality, false);
probeTracks();
loadProgress();
applySavedProgress();
applyCamera(false);
introSequence();
