document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");

  const setActive = () => {
    let current = sections[0]?.id;
    const scrollPos = window.scrollY + 140;

    sections.forEach((sec) => {
      if (scrollPos >= sec.offsetTop) current = sec.id;
    });

    navAnchors.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
    });
  };

  window.addEventListener("scroll", setActive, { passive: true });
  setActive();
  const filterBtns = document.querySelectorAll(".filter-btn");
  const workCards = document.querySelectorAll(".work-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      workCards.forEach((card) => {
        const show = filter === "all" || card.dataset.cat === filter;
        card.classList.toggle("hidden", !show);
      });
    });
  });

  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        if (status) {
          status.textContent = "Please fill in every field before sending.";
          status.style.color = "#ff6b6b";
        }
        return;
      }

      if (status) {
        status.style.color = "var(--accent)";
        status.textContent =
          "Thanks — your message has been noted. I'll reply soon.";
      }
      form.reset();
    });
  }

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  initHero3DModel();
  initGlobalParticleBackground();
});

function initHero3DModel() {
  const container = document.getElementById("hero-3d-container");
  if (
    !container ||
    typeof THREE === "undefined" ||
    typeof THREE.GLTFLoader === "undefined"
  )
    return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000,
  );

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  camera.position.set(0, 0, 8);
  const loader = new THREE.GLTFLoader();
  let model;

  loader.load(
    "3DModel.glb",
    (gltf) => {
      model = gltf.scene;
      model.position.set(0, 0, 0);
      model.scale.set(0.65, 0.65, 0.65);

      model.userData.baseRotX = 0.8;
      model.userData.baseRotY = -5; 

      model.rotation.set(model.userData.baseRotX, model.userData.baseRotY, 0);

      scene.add(model);
    },
    undefined,
    (error) => {
      console.error("Error loading glTF model:", error);
    },
  );
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX / window.innerWidth - 0.5;
    mouseY = event.clientY / window.innerHeight - 0.5;
  });

  function animate() {
    requestAnimationFrame(animate);

    if (model) {
      let targetRotY = model.userData.baseRotY + mouseX * 0.4;
      let targetRotX = model.userData.baseRotX + mouseY * 0.4;
      model.rotation.y += (targetRotY - model.rotation.y) * 0.05;
      model.rotation.x += (targetRotX - model.rotation.x) * 0.05;
      model.position.y = Math.sin(Date.now() * 0.0015) * 0.08;
    }

    renderer.render(scene, camera);
  }

  animate();
  window.addEventListener("resize", () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

function initGlobalParticleBackground() {
  if (
    typeof THREE === "undefined" ||
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined"
  )
    return;

  let container = document.getElementById("global-3d-bg");
  if (!container) {
    container = document.createElement("div");
    container.id = "global-3d-bg";
    document.body.insertBefore(container, document.body.firstChild);
  }

  Object.assign(container.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "-1",
    pointerEvents: "none",
  });


  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 3.5; 

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  const geometry = new THREE.BufferGeometry();
  const particlesCount = 800;
  const posArray = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 8;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

  const material = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x10b981, 
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });

  const particlesMesh = new THREE.Points(geometry, material);
  scene.add(particlesMesh);

  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5, 
    },
  });

  tl.to(
    particlesMesh.rotation,
    {
      y: Math.PI * 2,
      x: Math.PI,
      ease: "none",
    },
    0,
  );

  tl.to(
    camera.position,
    {
      z: 1.5,
      ease: "power2.inOut",
    },
    0,
  );

  function animate() {
    requestAnimationFrame(animate);
    particlesMesh.rotation.y += 0.0005;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}