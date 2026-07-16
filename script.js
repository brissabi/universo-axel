"use strict";

const viewport = document.getElementById("viewport");
const world = document.getElementById("world");
const intro = document.getElementById("intro");
const introLine = document.getElementById("introLine");
const originStar = document.getElementById("originStar");
const narrativeText = document.getElementById("narrativeText");
const interactiveStars = document.getElementById("interactiveStars");
const deepStars = document.getElementById("deepStars");
const discoveryPanel = document.getElementById("discoveryPanel");
const panelTitle = document.getElementById("panelTitle");
const panelMessage = document.getElementById("panelMessage");
const closePanel = document.getElementById("closePanel");
const progressCount = document.getElementById("progressCount");
const starProgressCount = document.getElementById("starProgressCount");
const findLight = document.getElementById("findLight");
const navigationHint = document.getElementById("navigationHint");
const resetView = document.getElementById("resetView");
const toggleAudio = document.getElementById("toggleAudio");
const secretObject = document.getElementById("secretObject");
const letterScene = document.getElementById("letterScene");
const closeLetter = document.getElementById("closeLetter");
const epilogueScene = document.getElementById("epilogueScene");
const closeEpilogue = document.getElementById("closeEpilogue");
const openEpilogueButton = document.getElementById("openEpilogue");
const openLetterAgain = document.getElementById("openLetterAgain");
const finalMenu = document.getElementById("finalMenu");
const finalMenuToggle = document.getElementById("finalMenuToggle");
const finalMenuPopover = document.getElementById("finalMenuPopover");
const resetProgress = document.getElementById("resetProgress");
const music = document.getElementById("bgMusic");

const WORLD_WIDTH = 3600;
const WORLD_HEIGHT = 2600;
const MIN_SCALE = 0.42;
const MAX_SCALE = 2.25;
const DEFAULT_SCALE = window.innerWidth < 700 ? 0.48 : 0.62;
const STORAGE_KEY = "universoAxelProgressV1";
const STAR_LAYOUT_SEED = 21042026;

const camera = {
  x: 0,
  y: 0,
  scale: DEFAULT_SCALE,
};

const state = {
  started: false,
  dragging: false,
  movedDuringPointer: false,
  pointerStartX: 0,
  pointerStartY: 0,
  cameraStartX: 0,
  cameraStartY: 0,
  visitedPlanets: new Set(),
  visitedStars: new Set(),
  audioEnabled: true,
  audioStarted: false,
  secretUnlocked: false,
  epilogueUnlocked: false,
  epilogueShown: false,
  pinchDistance: null,
  pinchScale: DEFAULT_SCALE,
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

function createSeededRandom(seed) {
  let value = seed >>> 0;

  return function random() {
    value += 0x6D2B79F5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function saveProgress() {
  const payload = {
    version: 1,
    visitedPlanets: [...state.visitedPlanets],
    visitedStars: [...state.visitedStars],
    epilogueUnlocked: state.epilogueUnlocked,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("No se pudo guardar el progreso.", error);
  }
}

function readSavedProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return null;
    return parsed;
  } catch (error) {
    console.warn("No se pudo recuperar el progreso guardado.", error);
    return null;
  }
}

function revealSecretImmediately() {
  state.secretUnlocked = true;
  secretObject.classList.remove("hidden-object");
  secretObject.classList.add("is-revealed");
  finalMenu.hidden = false;
}

function applySavedProgress() {
  const saved = readSavedProgress();
  if (!saved) return;

  const validPlanets = new Set(
    Array.isArray(saved.visitedPlanets)
      ? saved.visitedPlanets.filter((name) => document.querySelector(`[data-planet="${name}"]`))
      : []
  );
  const validStars = new Set(
    Array.isArray(saved.visitedStars)
      ? saved.visitedStars.filter((id) => document.querySelector(`.interactive-star[data-star-id="${id}"]`))
      : []
  );

  state.visitedPlanets = validPlanets;
  state.visitedStars = validStars;
  state.epilogueUnlocked = validStars.size === 80 || Boolean(saved.epilogueUnlocked);

  document.querySelectorAll(".planet[data-planet]").forEach((planet) => {
    const isVisited = state.visitedPlanets.has(planet.dataset.planet);
    planet.classList.toggle("discovered", isVisited);
    planet.classList.toggle("dormant", !isVisited);
    planet.classList.remove("awakened");
  });

  document.querySelectorAll(".interactive-star").forEach((star) => {
    const isVisited = state.visitedStars.has(star.dataset.starId);
    star.classList.toggle("discovered", isVisited);
    star.classList.toggle("dormant", !isVisited);
    star.classList.remove("awakened", "guided-light");
  });

  progressCount.textContent = String(state.visitedPlanets.size);
  starProgressCount.textContent = String(state.visitedStars.size);

  if (state.visitedPlanets.size === 8) {
    revealSecretImmediately();
    finalMenu.hidden = false;
  }

  if (state.epilogueUnlocked) {
    openEpilogueButton.hidden = false;
  }

  if (state.visitedPlanets.size || state.visitedStars.size) {
    introLine.textContent = "Este universo te estaba esperando.";
  }
}

function resetSavedProgress() {
  const confirmed = window.confirm(
    "¿Quieres borrar todos los planetas y luces descubiertos? Esta acción no se puede deshacer."
  );
  if (!confirmed) return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("No se pudo borrar el progreso guardado.", error);
  }

  state.visitedPlanets.clear();
  state.visitedStars.clear();
  state.secretUnlocked = false;
  state.epilogueUnlocked = false;
  state.epilogueShown = false;

  document.querySelectorAll(".planet[data-planet]").forEach((planet) => {
    planet.classList.remove("discovered", "awakened");
    planet.classList.add("dormant");
  });

  document.querySelectorAll(".interactive-star").forEach((star) => {
    star.classList.remove("discovered", "awakened", "guided-light");
    star.classList.add("dormant");
  });

  secretObject.classList.remove("is-revealed");
  secretObject.classList.add("hidden-object");
  openEpilogueButton.hidden = true;
  finalMenu.hidden = true;
  finalMenuPopover.hidden = true;
  finalMenuToggle.setAttribute("aria-expanded", "false");
  progressCount.textContent = "0";
  starProgressCount.textContent = "0";

  closeDiscoveryPanel();
  closeLetterScene();
  closeEpilogueScene();
  resetCamera();
  showNarrative("El recorrido ha comenzado de nuevo.", 2300);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setWorldTransform(animated = false) {
  world.classList.toggle("camera-animated", animated);
  world.style.transform = `translate(-50%, -50%) translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})`;

  if (animated) {
    window.setTimeout(() => world.classList.remove("camera-animated"), 950);
  }

  scheduleRevealCheck();
}

function centerOnWorldPoint(x, y, scale = camera.scale, animated = true) {
  camera.scale = clamp(scale, MIN_SCALE, MAX_SCALE);
  camera.x = -(x - WORLD_WIDTH / 2) * camera.scale;
  camera.y = -(y - WORLD_HEIGHT / 2) * camera.scale;
  constrainCamera();
  setWorldTransform(animated);
}

function constrainCamera() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scaledWidth = WORLD_WIDTH * camera.scale;
  const scaledHeight = WORLD_HEIGHT * camera.scale;

  const maxX = Math.max(0, (scaledWidth - vw) / 2 + vw * 0.28);
  const maxY = Math.max(0, (scaledHeight - vh) / 2 + vh * 0.28);

  camera.x = clamp(camera.x, -maxX, maxX);
  camera.y = clamp(camera.y, -maxY, maxY);
}

function fadeAudioIn() {
  if (!state.audioEnabled || state.audioStarted) return;

  state.audioStarted = true;
  music.volume = 0;

  const playPromise = music.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      state.audioStarted = false;
      toggleAudio.textContent = "Sonido: disponible";
      toggleAudio.setAttribute("aria-pressed", "false");
    });
  }

  let volume = 0;
  const timer = window.setInterval(() => {
    if (!state.audioEnabled) {
      window.clearInterval(timer);
      return;
    }

    volume = Math.min(0.72, volume + 0.025);
    music.volume = volume;

    if (volume >= 0.72) {
      window.clearInterval(timer);
    }
  }, 90);
}

function changeIntroLine(text) {
  introLine.classList.add("is-changing");
  window.setTimeout(() => {
    introLine.textContent = text;
    introLine.classList.remove("is-changing");
  }, 560);
}

function showNarrative(text, duration = 2600) {
  return new Promise((resolve) => {
    narrativeText.textContent = text;
    narrativeText.classList.add("is-visible");

    window.setTimeout(() => {
      narrativeText.classList.remove("is-visible");
      window.setTimeout(resolve, 1150);
    }, duration);
  });
}

async function beginExperience() {
  if (state.started) return;
  state.started = true;

  fadeAudioIn();
  originStar.disabled = true;
  changeIntroLine("La nuestra comenzó con una conversación.");

  window.setTimeout(() => {
    intro.classList.add("is-leaving");
    viewport.classList.remove("is-locked");
  }, 1700);

  window.setTimeout(async () => {
    viewport.classList.add("is-ready");
    centerOnWorldPoint(1800, 1300, DEFAULT_SCALE, true);

    await showNarrative("Dicen que el universo comenzó en la oscuridad.", 2300);
    await showNarrative("El mío comenzó cuando llegaste a mi vida.", 2900);
    await showNarrative("Los planetas guardan capítulos. Las luces pequeñas guardan pensamientos.", 3400);
    navigationHint.classList.add("is-emphasized");
    window.setTimeout(() => navigationHint.classList.remove("is-emphasized"), 6500);
  }, 2600);
}

function createStars() {
  const deepCount = 145;
  const interactiveCount = 80;
  const random = createSeededRandom(STAR_LAYOUT_SEED);
  const placedStars = [];
  const exclusionZones = [
    { x: 1800, y: 1300, radius: 210 },
    { x: 1470, y: 1110, radius: 90 },
    { x: 2140, y: 1030, radius: 115 },
    { x: 1260, y: 1540, radius: 125 },
    { x: 2400, y: 1570, radius: 110 },
    { x: 920, y: 720, radius: 180 },
    { x: 2820, y: 830, radius: 210 },
    { x: 620, y: 2050, radius: 155 },
    { x: 3080, y: 2070, radius: 165 },
    { x: 1800, y: 2350, radius: 120 },
  ];

  for (let i = 0; i < deepCount; i += 1) {
    const star = document.createElement("span");
    star.className = "star deep-star";
    star.style.left = `${random() * 100}%`;
    star.style.top = `${random() * 100}%`;
    star.style.setProperty("--size", `${(random() * 1.8 + 0.65).toFixed(2)}px`);
    star.style.setProperty("--base-opacity", (random() * 0.23 + 0.08).toFixed(2));
    deepStars.appendChild(star);
  }

  function isValidStarPosition(x, y) {
    const clearOfCelestialObjects = exclusionZones.every((zone) => {
      return Math.hypot(x - zone.x, y - zone.y) >= zone.radius;
    });

    const clearOfOtherLights = placedStars.every((position) => {
      return Math.hypot(x - position.x, y - position.y) >= 46;
    });

    return clearOfCelestialObjects && clearOfOtherLights;
  }

  for (let i = 0; i < interactiveCount; i += 1) {
    let x = 0;
    let y = 0;
    let attempts = 0;

    do {
      x = Math.round(120 + random() * (WORLD_WIDTH - 240));
      y = Math.round(120 + random() * (WORLD_HEIGHT - 240));
      attempts += 1;
    } while (!isValidStarPosition(x, y) && attempts < 1200);

    placedStars.push({ x, y });

    const star = document.createElement("button");
    star.type = "button";
    star.className = "star interactive-star dormant";
    star.dataset.starId = String(i);
    star.dataset.x = String(x);
    star.dataset.y = String(y);
    star.dataset.message = starMessages[i];
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.setProperty("--size", `${(random() * 3.2 + 2.2).toFixed(2)}px`);
    star.style.setProperty("--dormant-opacity", (random() * 0.1 + 0.06).toFixed(2));
    star.setAttribute("aria-label", `Descubrir la luz ${i + 1}`);

    star.addEventListener("pointerdown", (event) => event.stopPropagation());
    star.addEventListener("click", (event) => {
      event.stopPropagation();
      discoverStar(star);
    });

    interactiveStars.appendChild(star);
  }
}

function openPanel(title, message, eyebrow = "Descubrimiento") {
  document.getElementById("panelEyebrow").textContent = eyebrow;
  panelTitle.textContent = title;
  panelMessage.textContent = message;
  discoveryPanel.classList.add("is-open");
  discoveryPanel.setAttribute("aria-hidden", "false");
}

function closeDiscoveryPanel() {
  discoveryPanel.classList.remove("is-open");
  discoveryPanel.setAttribute("aria-hidden", "true");
}

function discoverStar(star) {
  const id = star.dataset.starId;

  if (!state.visitedStars.has(id)) {
    state.visitedStars.add(id);
    starProgressCount.textContent = String(state.visitedStars.size);
    star.classList.remove("dormant", "awakened");
    star.classList.add("discovered");

    if (state.visitedStars.size === 80) {
      state.epilogueUnlocked = true;
      openEpilogueButton.hidden = false;
      window.setTimeout(openEpilogue, 650);
    }

    saveProgress();
  }

  openPanel("Una luz pequeña", star.dataset.message, "Pensamiento");
}

function discoverCelestial(object) {
  if (state.movedDuringPointer) return;

  const x = Number(object.dataset.x);
  const y = Number(object.dataset.y);
  const kind = object.dataset.kind;
  const planetName = object.dataset.planet;
  const targetScale = window.innerWidth < 700 ? 0.78 : 0.92;

  centerOnWorldPoint(x, y, targetScale, true);

  if (planetName && !state.visitedPlanets.has(planetName)) {
    state.visitedPlanets.add(planetName);
    object.classList.remove("dormant", "awakened");
    object.classList.add("discovered");
    progressCount.textContent = String(state.visitedPlanets.size);

    saveProgress();

    if (state.visitedPlanets.size === 8) {
      unlockSecretObject();
    }
  }

  window.setTimeout(() => {
    openPanel(
      object.dataset.title,
      object.dataset.message,
      kind === "sun" ? "Origen" : "Planeta descubierto"
    );
  }, 620);
}

async function unlockSecretObject() {
  if (state.secretUnlocked) return;
  state.secretUnlocked = true;
  saveProgress();

  closeDiscoveryPanel();
  await showNarrative("Has encontrado todos los rincones visibles de este universo.", 2700);
  await showNarrative("Pero todavía queda una luz que no podía aparecer antes.", 2800);

  secretObject.classList.remove("hidden-object");
  secretObject.classList.add("is-revealed");
  centerOnWorldPoint(Number(secretObject.dataset.x), Number(secretObject.dataset.y), 0.72, true);
}

function openLetter() {
  closeDiscoveryPanel();
  letterScene.classList.add("is-open");
  letterScene.setAttribute("aria-hidden", "false");

  if (state.audioEnabled && !music.paused) {
    music.volume = 0.28;
  }
}

function closeLetterScene() {
  letterScene.classList.remove("is-open");
  letterScene.setAttribute("aria-hidden", "true");

  if (state.audioEnabled && state.audioStarted) {
    music.volume = 0.72;
  }
}


function openEpilogue() {
  if (!state.epilogueUnlocked) return;
  state.epilogueShown = true;
  closeDiscoveryPanel();
  epilogueScene.classList.add("is-open");
  epilogueScene.setAttribute("aria-hidden", "false");

  if (state.audioEnabled && !music.paused) {
    music.volume = 0.22;
  }
}

function closeEpilogueScene() {
  epilogueScene.classList.remove("is-open");
  epilogueScene.setAttribute("aria-hidden", "true");

  if (state.audioEnabled && state.audioStarted) {
    music.volume = 0.72;
  }
}

let revealFrame = null;

function scheduleRevealCheck() {
  if (revealFrame) return;

  revealFrame = window.requestAnimationFrame(() => {
    revealFrame = null;
    updateRevealStates();
  });
}

function updateRevealStates() {
  if (!state.started) return;

  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;
  const revealRadius = Math.min(window.innerWidth, window.innerHeight) * 0.62;
  const planetRevealRadius = Math.min(window.innerWidth, window.innerHeight) * 0.82;

  document.querySelectorAll(".interactive-star:not(.discovered)").forEach((star) => {
    const rect = star.getBoundingClientRect();
    const dx = rect.left + rect.width / 2 - viewportCenterX;
    const dy = rect.top + rect.height / 2 - viewportCenterY;
    const distance = Math.hypot(dx, dy);

    if (distance < revealRadius) {
      star.classList.remove("dormant");
      star.classList.add("awakened");
    } else {
      star.classList.remove("awakened");
      star.classList.add("dormant");
    }
  });

  document.querySelectorAll(".planet:not(.discovered)").forEach((planet) => {
    const rect = planet.getBoundingClientRect();
    const dx = rect.left + rect.width / 2 - viewportCenterX;
    const dy = rect.top + rect.height / 2 - viewportCenterY;
    const distance = Math.hypot(dx, dy);

    if (distance < planetRevealRadius) {
      planet.classList.remove("dormant");
      planet.classList.add("awakened");
    } else {
      planet.classList.remove("awakened");
      planet.classList.add("dormant");
    }
  });
}

function pointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return;
  if (event.target.closest("button, .discovery-panel, .letter-scene")) return;

  state.dragging = true;
  state.movedDuringPointer = false;
  state.pointerStartX = event.clientX;
  state.pointerStartY = event.clientY;
  state.cameraStartX = camera.x;
  state.cameraStartY = camera.y;
  viewport.classList.add("is-dragging");
  viewport.setPointerCapture?.(event.pointerId);
}

function pointerMove(event) {
  if (!state.dragging) return;

  const dx = event.clientX - state.pointerStartX;
  const dy = event.clientY - state.pointerStartY;

  if (Math.hypot(dx, dy) > 5) {
    state.movedDuringPointer = true;
  }

  camera.x = state.cameraStartX + dx;
  camera.y = state.cameraStartY + dy;
  constrainCamera();
  setWorldTransform(false);
}

function pointerUp(event) {
  if (!state.dragging) return;
  state.dragging = false;
  viewport.classList.remove("is-dragging");
  viewport.releasePointerCapture?.(event.pointerId);

  window.setTimeout(() => {
    state.movedDuringPointer = false;
  }, 0);
}

function wheelZoom(event) {
  if (!state.started || letterScene.classList.contains("is-open")) return;
  event.preventDefault();

  const previousScale = camera.scale;
  const zoomFactor = Math.exp(-event.deltaY * 0.0011);
  const nextScale = clamp(previousScale * zoomFactor, MIN_SCALE, MAX_SCALE);

  const mouseX = event.clientX - window.innerWidth / 2;
  const mouseY = event.clientY - window.innerHeight / 2;
  const scaleRatio = nextScale / previousScale;

  camera.x = mouseX - (mouseX - camera.x) * scaleRatio;
  camera.y = mouseY - (mouseY - camera.y) * scaleRatio;
  camera.scale = nextScale;
  constrainCamera();
  setWorldTransform(false);
}

function handleTouchStart(event) {
  if (event.touches.length === 2) {
    const [a, b] = event.touches;
    state.pinchDistance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    state.pinchScale = camera.scale;
  }
}

function handleTouchMove(event) {
  if (event.touches.length !== 2 || !state.pinchDistance) return;
  event.preventDefault();

  const [a, b] = event.touches;
  const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  camera.scale = clamp(state.pinchScale * (distance / state.pinchDistance), MIN_SCALE, MAX_SCALE);
  constrainCamera();
  setWorldTransform(false);
}

function handleTouchEnd(event) {
  if (event.touches.length < 2) {
    state.pinchDistance = null;
  }
}


function findNearestUndiscoveredLight() {
  const candidates = [...document.querySelectorAll(".interactive-star:not(.discovered)")];

  if (!candidates.length) {
    showNarrative("Has descubierto todas las luces pequeñas de este universo.", 2400);
    return;
  }

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const nearest = candidates.reduce((best, star) => {
    const rect = star.getBoundingClientRect();
    const distance = Math.hypot(rect.left + rect.width / 2 - centerX, rect.top + rect.height / 2 - centerY);
    return !best || distance < best.distance ? { star, distance } : best;
  }, null).star;

  nearest.classList.remove("dormant");
  nearest.classList.add("awakened", "guided-light");
  centerOnWorldPoint(Number(nearest.dataset.x), Number(nearest.dataset.y), Math.max(camera.scale, 0.9), true);

  window.setTimeout(() => nearest.classList.remove("guided-light"), 4200);
}

function resetCamera() {
  closeDiscoveryPanel();
  centerOnWorldPoint(1800, 1300, DEFAULT_SCALE, true);
}

function toggleMusic() {
  state.audioEnabled = !state.audioEnabled;
  toggleAudio.setAttribute("aria-pressed", String(state.audioEnabled));

  if (state.audioEnabled) {
    toggleAudio.textContent = "Sonido: activo";

    if (!state.audioStarted) {
      fadeAudioIn();
    } else {
      music.play().catch(() => {});
      music.volume = 0.72;
    }
  } else {
    toggleAudio.textContent = "Sonido: pausado";
    music.pause();
  }
}

function positionCelestialObjects() {
  document.querySelectorAll(".celestial[data-x][data-y]").forEach((object) => {
    object.style.left = `${object.dataset.x}px`;
    object.style.top = `${object.dataset.y}px`;
  });
}

function closeFinalMenu() {
  finalMenuPopover.hidden = true;
  finalMenuToggle.setAttribute("aria-expanded", "false");
}

function toggleFinalMenu(event) {
  event.stopPropagation();
  const willOpen = finalMenuPopover.hidden;
  finalMenuPopover.hidden = !willOpen;
  finalMenuToggle.setAttribute("aria-expanded", String(willOpen));
}

function reopenLetter() {
  closeFinalMenu();
  openLetter();
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    if (!finalMenuPopover.hidden) {
      closeFinalMenu();
    } else if (epilogueScene.classList.contains("is-open")) {
      closeEpilogueScene();
    } else if (letterScene.classList.contains("is-open")) {
      closeLetterScene();
    } else {
      closeDiscoveryPanel();
    }
  }
}

originStar.addEventListener("click", beginExperience);
closePanel.addEventListener("click", closeDiscoveryPanel);
resetView.addEventListener("click", resetCamera);
toggleAudio.addEventListener("click", toggleMusic);
findLight.addEventListener("click", findNearestUndiscoveredLight);
closeLetter.addEventListener("click", closeLetterScene);
closeEpilogue.addEventListener("click", closeEpilogueScene);
openEpilogueButton.addEventListener("click", () => {
  closeFinalMenu();
  openEpilogue();
});
openLetterAgain.addEventListener("click", reopenLetter);
finalMenuToggle.addEventListener("click", toggleFinalMenu);
resetProgress.addEventListener("click", () => {
  closeFinalMenu();
  resetSavedProgress();
});
secretObject.addEventListener("click", openLetter);


const controls = document.getElementById("controls");
controls.addEventListener("pointerdown", (event) => event.stopPropagation());
controls.addEventListener("click", (event) => event.stopPropagation());
document.addEventListener("click", () => closeFinalMenu());

viewport.addEventListener("pointerdown", pointerDown);
viewport.addEventListener("pointermove", pointerMove);
viewport.addEventListener("pointerup", pointerUp);
viewport.addEventListener("pointercancel", pointerUp);
viewport.addEventListener("wheel", wheelZoom, { passive: false });
viewport.addEventListener("touchstart", handleTouchStart, { passive: true });
viewport.addEventListener("touchmove", handleTouchMove, { passive: false });
viewport.addEventListener("touchend", handleTouchEnd, { passive: true });

window.addEventListener("keydown", handleKeydown);
window.addEventListener("resize", () => {
  constrainCamera();
  setWorldTransform(false);
});

letterScene.addEventListener("click", (event) => {
  if (event.target === letterScene || event.target.classList.contains("letter-backdrop")) {
    closeLetterScene();
  }
});

epilogueScene.addEventListener("click", (event) => {
  if (event.target === epilogueScene || event.target.classList.contains("epilogue-backdrop")) {
    closeEpilogueScene();
  }
});

document.querySelectorAll(".celestial:not(#secretObject)").forEach((object) => {
  object.addEventListener("pointerdown", (event) => event.stopPropagation());
  object.addEventListener("click", () => discoverCelestial(object));
});

positionCelestialObjects();
createStars();
applySavedProgress();
setWorldTransform(false);
