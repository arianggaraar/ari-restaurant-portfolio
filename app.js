import * as THREE from "three";

const root = document.documentElement;
const snapShell = document.querySelector("#snapShell");
const sections = [...document.querySelectorAll(".snap-section")];
const dots = [...document.querySelectorAll(".section-dots__dot")];
const revealItems = [...document.querySelectorAll(".reveal")];

const pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  nx: 0,
  ny: 0,
};

function updatePointer(event) {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.nx = (event.clientX / window.innerWidth - 0.5) * 2;
  pointer.ny = (event.clientY / window.innerHeight - 0.5) * 2;
  root.style.setProperty("--pointer-x", ((event.clientX / window.innerWidth) * 100).toFixed(2));
  root.style.setProperty("--pointer-y", ((event.clientY / window.innerHeight) * 100).toFixed(2));
}

window.addEventListener("pointermove", updatePointer, { passive: true });

function bootPreloader() {
  const preloader = document.querySelector("#preloader");
  const loadBar = document.querySelector("#loadBar");
  if (!preloader || !loadBar) return;

  let progress = 0;
  let loaded = false;

  const draw = () => {
    progress += loaded ? 8 : 2.4;
    progress = Math.min(progress, loaded ? 100 : 84);
    loadBar.style.width = `${progress}%`;

    if (progress < 100) {
      requestAnimationFrame(draw);
      return;
    }

    window.setTimeout(() => {
      preloader.classList.add("is-hidden");
      window.setTimeout(() => {
        preloader.hidden = true;
      }, 700);
    }, 220);
  };

  window.setTimeout(() => {
    loaded = true;
  }, 850);

  window.addEventListener("load", () => {
    loaded = true;
  });

  draw();
}

function bootLucide() {
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: {
        "aria-hidden": "true",
      },
    });
  }
}

function bootRoleRotator() {
  const role = document.querySelector("#roleRotator");
  if (!role) return;

  const roles = ["Waiter cekatan", "Helper restaurant", "Food runner stabil", "Service floor support"];
  let index = 0;

  window.setInterval(() => {
    index = (index + 1) % roles.length;
    role.textContent = roles[index];
    role.animate(
      [
        { opacity: 0.45, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 260, easing: "ease-out", fill: "forwards" }
    );
  }, 2100);
}

function bootAgeSync() {
  const ageTargets = [...document.querySelectorAll("[data-age][data-birthdate]")];
  if (!ageTargets.length) return;

  const today = new Date();

  ageTargets.forEach((target) => {
    const birthDate = new Date(`${target.dataset.birthdate}T00:00:00`);
    if (Number.isNaN(birthDate.getTime())) return;

    let age = today.getFullYear() - birthDate.getFullYear();
    const birthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (!birthdayPassed) age -= 1;
    target.textContent = `${age} Tahun`;
  });
}

function bootScrollNavigation() {
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const section = document.querySelector(`#${dot.dataset.target}`);
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;
        document.body.dataset.active = id;
        dots.forEach((dot) => dot.classList.toggle("is-active", dot.dataset.target === id));
      });
    },
    {
      root: snapShell,
      threshold: 0.58,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function bootReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    {
      root: snapShell,
      threshold: 0.22,
      rootMargin: "0px 0px -12% 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function bootFlavorCanvas() {
  const canvas = document.querySelector("#flavorCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const colors = ["#f6bd3a", "#14a46c", "#e43f2f", "#f7f9f3"];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(118, Math.max(58, Math.floor((width * height) / 15000)));
    particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: 1.4 + Math.random() * 3.8,
      color: colors[index % colors.length],
      phase: Math.random() * Math.PI * 2,
    }));
  };

  const draw = (time) => {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    particles.forEach((particle, index) => {
      const dx = particle.x - pointer.x;
      const dy = particle.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      const push = Math.max(0, 150 - dist) / 150;

      if (push > 0 && dist > 0) {
        particle.vx += (dx / dist) * push * 0.035;
        particle.vy += (dy / dist) * push * 0.035;
      }

      particle.vx *= 0.988;
      particle.vy *= 0.988;
      particle.x += particle.vx + Math.sin(time * 0.0012 + particle.phase) * 0.12;
      particle.y += particle.vy + Math.cos(time * 0.001 + particle.phase) * 0.12;

      if (particle.x < -12) particle.x = width + 12;
      if (particle.x > width + 12) particle.x = -12;
      if (particle.y < -12) particle.y = height + 12;
      if (particle.y > height + 12) particle.y = -12;

      const alpha = 0.18 + Math.sin(time * 0.002 + particle.phase) * 0.09;
      ctx.beginPath();
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = alpha;
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      const next = particles[(index + 7) % particles.length];
      const lineDistance = Math.hypot(next.x - particle.x, next.y - particle.y);
      if (lineDistance < 92) {
        ctx.beginPath();
        ctx.globalAlpha = (1 - lineDistance / 92) * 0.08;
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 1;
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
}

function createSteamCurve(xOffset, zOffset) {
  const points = [];
  for (let i = 0; i < 8; i += 1) {
    points.push(
      new THREE.Vector3(
        xOffset + Math.sin(i * 0.9) * 0.1,
        0.58 + i * 0.18,
        zOffset + Math.cos(i * 0.7) * 0.08
      )
    );
  }
  return new THREE.CatmullRomCurve3(points);
}

function bootThreeScene() {
  const canvas = document.querySelector("#threeScene");
  if (!canvas) return;

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
  } catch (error) {
    document.body.classList.add("no-webgl");
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  const clock = new THREE.Clock();
  const serviceGroup = new THREE.Group();
  const floatingGroup = new THREE.Group();
  const steamMeshes = [];

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  camera.position.set(0, 1.35, 7.4);
  scene.add(serviceGroup, floatingGroup);

  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x12382a,
    roughness: 0.55,
    metalness: 0.18,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xf6bd3a,
    roughness: 0.35,
    metalness: 0.28,
  });
  const chickenMat = new THREE.MeshStandardMaterial({
    color: 0xd86a2f,
    roughness: 0.82,
    metalness: 0.02,
  });
  const riceMat = new THREE.MeshStandardMaterial({
    color: 0xfffbef,
    roughness: 0.9,
  });
  const sambalMat = new THREE.MeshStandardMaterial({
    color: 0xe43f2f,
    roughness: 0.78,
  });
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x14a46c,
    roughness: 0.7,
  });
  const steamMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xf6bd3a,
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.24,
    roughness: 0.2,
  });

  const plate = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.36, 0.2, 96), plateMat);
  plate.position.y = -0.34;
  plate.scale.z = 0.72;
  plate.rotation.x = Math.PI * 0.04;
  serviceGroup.add(plate);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.22, 0.075, 16, 128), rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -0.19;
  rim.scale.z = 0.72;
  serviceGroup.add(rim);

  const rice = new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 20), riceMat);
  rice.scale.set(1, 0.66, 1);
  rice.position.set(0.35, 0.05, 0.02);
  serviceGroup.add(rice);

  const sambal = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 12), sambalMat);
  sambal.scale.set(1, 0.42, 1);
  sambal.position.set(0.26, 0.39, 0.01);
  serviceGroup.add(sambal);

  const chickenPositions = [
    [-0.72, 0.03, 0.2],
    [-1.04, 0.12, -0.1],
    [-0.38, 0.18, -0.26],
    [0.98, 0.07, -0.14],
    [1.22, 0.15, 0.22],
  ];

  chickenPositions.forEach(([x, y, z], index) => {
    const chunk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.33 + index * 0.015, 1), chickenMat);
    chunk.position.set(x, y, z);
    chunk.rotation.set(index * 0.7, index * 0.4, index * 0.2);
    chunk.userData.spin = 0.12 + index * 0.02;
    serviceGroup.add(chunk);
  });

  for (let i = 0; i < 7; i += 1) {
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.13), leafMat);
    leaf.position.set(-0.9 + i * 0.28, -0.04, -0.48 + Math.sin(i) * 0.09);
    leaf.rotation.y = i * 0.9;
    leaf.rotation.z = i * 0.28;
    serviceGroup.add(leaf);
  }

  [-0.7, -0.25, 0.48].forEach((xOffset, index) => {
    const steam = new THREE.Mesh(
      new THREE.TubeGeometry(createSteamCurve(xOffset, -0.08 + index * 0.16), 28, 0.018, 8, false),
      steamMat.clone()
    );
    steam.userData.delay = index * 0.85;
    steamMeshes.push(steam);
    serviceGroup.add(steam);
  });

  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xf6bd3a,
    transparent: true,
    opacity: 0.32,
  });

  for (let i = 0; i < 16; i += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13 + Math.random() * 0.09, 0.009, 8, 24), ringMat);
    ring.position.set((Math.random() - 0.5) * 8.2, (Math.random() - 0.5) * 4.8, -2 - Math.random() * 3.5);
    ring.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    ring.userData.speed = 0.15 + Math.random() * 0.35;
    floatingGroup.add(ring);
  }

  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  const keyLight = new THREE.DirectionalLight(0xfff4d2, 2.3);
  keyLight.position.set(2.8, 3.4, 4.2);
  const redLight = new THREE.PointLight(0xe43f2f, 8, 9);
  redLight.position.set(-2.6, 1.2, 2);
  const greenLight = new THREE.PointLight(0x14a46c, 5, 8);
  greenLight.position.set(2.8, -1.1, 1.5);
  scene.add(ambient, keyLight, redLight, greenLight);

  serviceGroup.position.set(2.05, -0.62, 0);
  serviceGroup.rotation.set(-0.16, -0.42, 0.08);

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);

    if (width < 720) {
      serviceGroup.scale.setScalar(0.74);
      serviceGroup.position.set(0.45, -0.58, 0);
    } else {
      serviceGroup.scale.setScalar(1);
      serviceGroup.position.set(2.05, -0.62, 0);
    }
  }

  function animate() {
    const elapsed = clock.getElapsedTime();
    const active = document.body.dataset.active;
    const targetOpacity = active === "motion" ? 0.86 : active === "hero" ? 0.24 : 0.5;
    canvas.style.opacity = String(targetOpacity);

    serviceGroup.rotation.y = -0.42 + pointer.nx * 0.22 + Math.sin(elapsed * 0.55) * 0.1;
    serviceGroup.rotation.x = -0.16 + pointer.ny * 0.12;
    serviceGroup.position.y += (Math.sin(elapsed * 1.2) * 0.045 - (serviceGroup.position.y + 0.62)) * 0.05;

    serviceGroup.children.forEach((child) => {
      if (child.userData.spin) {
        child.rotation.y += child.userData.spin * 0.01;
        child.rotation.z += child.userData.spin * 0.006;
      }
    });

    steamMeshes.forEach((steam) => {
      const phase = (Math.sin(elapsed * 1.4 + steam.userData.delay) + 1) / 2;
      steam.material.opacity = 0.12 + phase * 0.24;
      steam.scale.y = 0.82 + phase * 0.25;
      steam.position.y = phase * 0.14;
    });

    floatingGroup.children.forEach((ring) => {
      ring.rotation.x += ring.userData.speed * 0.006;
      ring.rotation.y += ring.userData.speed * 0.008;
      ring.position.y += Math.sin(elapsed * ring.userData.speed + ring.position.x) * 0.0018;
    });

    camera.position.x += (pointer.nx * 0.28 - camera.position.x) * 0.025;
    camera.position.y += (1.35 - pointer.ny * 0.12 - camera.position.y) * 0.025;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  resize();
  animate();
}

bootPreloader();
bootLucide();
bootRoleRotator();
bootAgeSync();
bootScrollNavigation();
bootReveal();
bootFlavorCanvas();
bootThreeScene();
