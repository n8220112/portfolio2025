/***** hidden modal *****/
function showModal() {
  let siteInformation = document.getElementById("siteInformation");
  siteInformation.style.width = "600px";
  siteInformation.style.height = "400px";
  siteInformation.style.opacity = "1";
}
function closeModal() {
  let siteInformation = document.getElementById("siteInformation");
  siteInformation.style.width = "0";
  siteInformation.style.height = "0";
  siteInformation.style.opacity = "0";
}

/***** theme change *****/
const themes = ["day", "night", "monet"];
let currentIndex = 0;

// 초기값 설정
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = prefersDark ? "night" : "day";
currentIndex = themes.indexOf(initialTheme);
document.body.setAttribute("data-theme", initialTheme);

document.getElementById("themeChanger").addEventListener("click", function () {
  // 다음 인덱스 계산
  currentIndex = (currentIndex + 1) % themes.length;
  // body에 data-theme 속성 적용
  document.body.setAttribute("data-theme", themes[currentIndex]);
});

/***** menu *****/
function showMenu() {
  document.getElementById("projects").classList.toggle("menuActive");
  document.getElementById("main").classList.toggle("menuActive");
}

/***** menu today *****/
// 초기 날짜 및 시각 설정
function setInitialDate() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const date = now.getDate();

  const monthHTML = `${month}<span>月</span>`;
  const dateHTML = `${date}`;

  document.getElementById("monthMainMenu").innerHTML = monthHTML;
  document.getElementById("dateMainMenu").innerHTML = dateHTML;
  document.getElementById("monthProjectMenu").innerHTML = monthHTML;
  document.getElementById("dateProjectMenu").innerHTML = dateHTML;
}

// 실시간 KST 시계 갱신
function updateClock() {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstTime = new Date(now.getTime() + kstOffset);

  const hours = String(kstTime.getUTCHours()).padStart(2, "0");
  const minutes = String(kstTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(kstTime.getUTCSeconds()).padStart(2, "0");

  const timeString = `${hours}:${minutes}:${seconds}`;

  document.getElementById("nowTimeMainMenu").innerHTML = `KST ${timeString}`;
  document.getElementById("nowTimeProjectMenu").innerHTML = `KST ${timeString}`;
}

// 실행
setInitialDate();
updateClock();
setInterval(updateClock, 1000);

/***** header slide *****/
const text = document.getElementById("slideText");
let pos = document.querySelector(".header-slide").offsetWidth;
const step = 10; // 이동
const interval = 500; // 밀리초 간격 (50ms마다 이동)

const timer = setInterval(() => {
  pos -= step;
  text.style.left = pos + "px";

  // 다 돌면 다시 반복
  if (pos + text.offsetWidth < 0) {
    pos = document.querySelector(".header-slide").offsetWidth;
  }
}, interval);

/***** project menu active *****/
const sections = document.querySelectorAll(".project-section-inner article");
const navLinks = document.querySelectorAll("#project-list li a");
const topWrapper = document.getElementById("main"); // 상단 offset 보정용
const topWrapperHeight = topWrapper.offsetHeight;

// 링크 눌러 이동시 메뉴 자동 닫기
const navLinksAll = document.querySelectorAll("#project-list li a, .chapters li a");
navLinksAll.forEach((link) => {
  link.addEventListener("click", () => {
    if (document.getElementById("projects").classList.contains("menuActive") || document.getElementById("main").classList.contains("menuActive")) {
      document.getElementById("projects").classList.remove("menuActive");
      document.getElementById("main").classList.remove("menuActive");
    }
  });
});
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY - topWrapperHeight + window.innerHeight / 2;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id = section.id;

    navLinks.forEach((link) => {
      const targetId = link.dataset.id;

      if (targetId === id && scrollTop >= top && scrollTop < bottom) {
        link.classList.add("active");
      } else if (targetId === id) {
        link.classList.remove("active");
      }
    });
  });
});

/***** project slide *****/
const projectTrack = document.getElementById("slideProject");

// 콘텐츠 복제로 반복 효과
projectTrack.innerHTML += projectTrack.innerHTML;

let projectPosX = 0;
let projectSlideSpeed = 1;

function animateSlide() {
  projectPosX -= projectSlideSpeed;

  // 원래 콘텐츠 너비 절반만큼 이동했을 때 초기화
  if (Math.abs(projectPosX) >= projectTrack.scrollWidth / 2) {
    projectPosX = 0;
  }

  projectTrack.style.transform = `translateX(${projectPosX}px)`;
  requestAnimationFrame(animateSlide);
}

animateSlide();

/* project swiper */
var swiper = new Swiper(".desktopSwiper", {
  slidesPerView: 1,
  spaceBetween: 30,
  /* autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  }, */
  rewind: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});
var swiper = new Swiper(".mobileSwiper", {
  slidesPerView: 1,
  spaceBetween: 15,
  /* autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  }, */
  rewind: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});

/***** fortune ball *****/
const {Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Query, World} = Matter;

let engine, world, render, runner;
const container = document.getElementById("container");
let dropping = false;
let dropInterval;

function getThemeColors() {
  const styles = getComputedStyle(document.body);
  return [styles.getPropertyValue("--ball-color-1").trim(), styles.getPropertyValue("--ball-color-2").trim(), styles.getPropertyValue("--ball-color-3").trim(), styles.getPropertyValue("--ball-color-4").trim(), styles.getPropertyValue("--ball-color-5").trim()];
}

function getMainColor() {
  const styles = getComputedStyle(document.body);
  return [styles.getPropertyValue("--main-color")];
}

function startSimulation() {
  // 기존 canvas 및 요소 완전 제거
  container.innerHTML = "";
  // 기존 render 제거
  if (render) {
    Render.stop(render);
    render.canvas.remove();
    render = null;
  }

  // 기존 runner 제거
  if (runner) {
    Runner.stop(runner);
    runner = null;
  }

  // 기존 engine 및 world 초기화
  if (engine) {
    World.clear(engine.world, false); // 모든 물체 제거 (false = constraints 유지 안함)
    Engine.clear(engine);
    engine = null;
  }

  // 새로운 엔진/월드 생성
  engine = Engine.create();
  world = engine.world;

  const rect = container.getBoundingClientRect();

  render = Render.create({
    element: container,
    engine: engine,
    options: {
      width: rect.width,
      height: rect.height,
      wireframes: false,
      background: "transparent",
      pixelRatio: "auto",
    },
  });

  // 렌더 canvas 스타일 설정
  render.canvas.style.position = "absolute";
  render.canvas.style.top = "0";
  render.canvas.style.left = "0";
  render.canvas.style.width = "100%";
  render.canvas.style.height = "100%";

  Render.run(render);
  runner = Runner.create();
  Runner.run(runner, engine);

  setupBounds();

  // 마우스 컨트롤 및 클릭 이벤트
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {stiffness: 0.1, render: {visible: false}},
  });
  Composite.add(world, mouseConstraint);
  render.mouse = mouse;

  // 막힌 스크롤 해결
  render.canvas.removeEventListener("wheel", mouse.mousewheel);

  Events.on(mouseConstraint, "mousedown", function (event) {
    const mousePosition = event.mouse.position;
    const bodies = Composite.allBodies(world);
    const clickedBody = Query.point(bodies, mousePosition)[0];
    if (clickedBody) {
      showPopup();
    }
  });

  Events.on(mouseConstraint, "mousemove", function (event) {
    const mousePos = event.mouse.position;
    const bodies = Composite.allBodies(world);
    const hovered = Matter.Query.point(bodies, mousePos)[0];

    render.canvas.style.cursor = hovered ? "pointer" : "default";
  });

  // 공 떨어뜨리기 시작
  if (!dropping) {
    for (let i = 0; i < CHUNK; i++) {
      setTimeout(() => {
        for (let j = 0; j < PER_BATCH; j++) {
          dropBall();
        }
      }, i * 100); // 0.1초 간격
    }
    dropping = true;
  }
}

function setupBounds() {
  const rect = container.getBoundingClientRect();
  Composite.clear(world);

  const ground = Bodies.rectangle(rect.width / 2, rect.height + 20, rect.width, 40, {isStatic: true});
  const leftWall = Bodies.rectangle(-20, rect.height / 2, 40, rect.height, {isStatic: true});
  const rightWall = Bodies.rectangle(rect.width + 20, rect.height / 2, 40, rect.height, {isStatic: true});
  Composite.add(world, [ground, leftWall, rightWall]);
}

let MAX_BALLS;

if (window.innerWidth < 480) {
  MAX_BALLS = 30; // 모바일
} else if (window.innerWidth < 768) {
  MAX_BALLS = 45; // 태블릿
} else if (window.innerWidth < 960) {
  MAX_BALLS = 60; // 태블릿
} else if (window.innerWidth < 1600) {
  MAX_BALLS = 90; // 랩탑
} else {
  MAX_BALLS = 150; // 데스크탑
}

const CHUNK = 12; // 몇 번에 나눌지
const PER_BATCH = MAX_BALLS / CHUNK;

function getExtremeX(containerWidth) {
  const half = containerWidth / 2;
  const edgeWidth = half * 0.8; // 얼마나 치우칠지 (0.8 = 80% 양 끝)

  const side = Math.random() < 0.5 ? "left" : "right";
  if (side === "left") {
    return Math.random() * edgeWidth;
  } else {
    return containerWidth - Math.random() * edgeWidth;
  }
}

function dropBall() {
  const bodies = Composite.allBodies(world);
  const ballCount = bodies.filter((body) => body.label === "Circle Body").length;
  if (ballCount >= MAX_BALLS) return;

  const rect = container.getBoundingClientRect();
  const x = getExtremeX(rect.width); // 치우친 분포 사용
  const colors = getThemeColors();
  const strokeColor = getMainColor();
  const radius = 15 + Math.random() * 10;
  const ball = Bodies.circle(x, -50, radius, {
    restitution: 0.7,
    friction: 0.05,
    render: {
      fillStyle: colors[Math.floor(Math.random() * colors.length)],
      strokeStyle: strokeColor,
      lineWidth: 2,
    },
  });
  Composite.add(world, ball);
}

const messages = [
  `¡Lo más importante en la vida\nes vivir felizmente!\n인생의 가장 중요한 일은 행복하게 사는 것!`,
  `La perfección no es cosa pequeña\npero está hecha de pequeñas cosas\n완벽은 작은 일이 아니지만 작은 일들로 이루어져 있다.`,
  `No se vive celebrando vitorias,\nsino superando derrotas\n승리를 자축하며 살지 말고, 실패를 이겨내며 살아라.`,
  `Sin prisa, pero sin pausa\n서두름 없지만, 멈춤도 없이.`,
  `Podrán cortar todas las flores,\npero no podrán detener la primavera.\n모든 꽃을 꺾을 수는 있지만 봄의 만연을 막을 수는 없다.`,
];

function showPopup() {
  const randomMsg = messages[Math.floor(Math.random() * messages.length)];
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.style.left = 0;
  popup.style.right = 0;
  popup.style.bottom = 0;
  popup.style.top = 0;

  // 줄바꿈 단위로 <p> 생성
  randomMsg.split("\n").forEach((line) => {
    const p = document.createElement("p");
    p.className = "fortuneball-quote";
    p.textContent = line;
    popup.appendChild(p);
  });

  container.appendChild(popup);
  setTimeout(() => popup.remove(), 2000);
}

// 스크롤 감지 (70% 도달 시 실행)
window.addEventListener("scroll", () => {
  const rect = container.getBoundingClientRect();
  const triggerY = window.innerHeight * 0.7;
  if (rect.top <= triggerY && !dropping) {
    startSimulation();
  }
});

// 창 크기 변경 대응 → 아예 새로 시작
window.addEventListener("resize", () => {
  if (dropping) {
    clearInterval(dropInterval);
    dropping = false;
    startSimulation();
  }
});

// 테마 컬러 변경 대응
document.getElementById("themeChanger").addEventListener("click", () => {
  // 1. 드랍 멈추고
  clearInterval(dropInterval);
  dropping = false;

  // 2. 기존 공 초기화까지 확실히!
  if (engine) {
    World.clear(engine.world, false);
    Engine.clear(engine);
    engine = null;
  }

  if (render) {
    Render.stop(render);
    render.canvas.remove();
    render = null;
  }

  if (runner) {
    Runner.stop(runner);
    runner = null;
  }

  container.innerHTML = ""; // canvas 및 팝업 제거

  // 3. requestAnimationFrame으로 테마 스타일 적용 시간 확보
  requestAnimationFrame(() => {
    startSimulation(); // 새 공 생성 시작
  });
});

/***** text copy function *****/
function copyText(item) {
  navigator.clipboard
    .writeText(item)
    .then(() => {
      alert("복사되었습니다!");
    })
    .catch((err) => {
      console.error("마우스 오른쪽 버튼을 클릭하거나 Ctrl + C로 복사해주세요:", err);
    });
}
