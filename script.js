const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const tieneMouse = window.matchMedia("(pointer: fine)").matches;

// 1) Aparecer elementos al hacer scroll (y animar contadores)
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add("is-visible");
    const num = el.querySelector(".stat__num");
    if (num) contar(num);
    observer.unobserve(el);
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach((el, i) => {
  if (el.matches(".card, .service, .stat")) el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  observer.observe(el);
});

function contar(elemento) {
  const meta = Number(elemento.dataset.count);
  if (reducirMovimiento) { elemento.textContent = meta; return; }
  const duracion = 1200;
  const inicio = performance.now();
  (function paso(ahora) {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    elemento.textContent = Math.round(meta * (1 - Math.pow(1 - progreso, 3)));
    if (progreso < 1) requestAnimationFrame(paso);
  })(inicio);
}

// 2) Barra de progreso de scroll
const barra = document.querySelector(".progress");
function actualizarBarra() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  barra.style.transform = `scaleX(${total > 0 ? window.scrollY / total : 0})`;
}
window.addEventListener("scroll", actualizarBarra, { passive: true });
actualizarBarra();

// 3) Link activo en el menú según la sección visible
const enlaces = document.querySelectorAll(".nav nav a");
const secciones = [...enlaces].map((a) => document.querySelector(a.getAttribute("href")));
const observadorMenu = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    enlaces.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-40% 0px -55% 0px" });
secciones.forEach((s) => s && observadorMenu.observe(s));

// 4) Texto que se escribe solo en la portada
const palabras = ["cortometrajes", "videoclips", "videojuegos", "recorridos virtuales"];
const destino = document.getElementById("typed");
if (!reducirMovimiento) {
  let p = 0, c = palabras[0].length, borrando = false;
  (function escribir() {
    const palabra = palabras[p];
    destino.textContent = palabra.slice(0, c);
    let espera = borrando ? 40 : 90;
    if (!borrando && c === palabra.length) { borrando = true; espera = 1600; }
    else if (borrando && c === 0) { borrando = false; p = (p + 1) % palabras.length; espera = 350; }
    c += borrando ? -1 : 1;
    setTimeout(escribir, espera);
  })();
}

// 5) Efectos con mouse (solo en computadora)
if (tieneMouse && !reducirMovimiento) {
  // Luz que sigue al cursor
  const luz = document.querySelector(".cursor-glow");
  window.addEventListener("mousemove", (e) => {
    luz.style.opacity = 1;
    luz.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  // Foto que se inclina hacia el cursor
  const foto = document.getElementById("photo");
  const portada = document.getElementById("inicio");
  portada.addEventListener("mousemove", (e) => {
    const r = foto.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
    const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
    foto.style.setProperty("--ry", `${x * 18}deg`);
    foto.style.setProperty("--rx", `${-y * 18}deg`);
  });
  portada.addEventListener("mouseleave", () => {
    foto.style.setProperty("--ry", "0deg");
    foto.style.setProperty("--rx", "0deg");
  });

  // Tarjetas con inclinación suave
  document.querySelectorAll(".tilt").forEach((tarjeta) => {
    tarjeta.addEventListener("mousemove", (e) => {
      const r = tarjeta.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tarjeta.classList.add("is-tilting");
      tarjeta.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
    });
    tarjeta.addEventListener("mouseleave", () => {
      tarjeta.classList.remove("is-tilting");
      tarjeta.style.transform = "";
    });
  });
}

// 6) Videos: al hacer clic se carga el reproductor de YouTube
document.querySelectorAll(".video").forEach((boton) => {
  boton.addEventListener("click", () => {
    const id = boton.dataset.video.trim();
    if (!id) {
      if (!boton.querySelector(".video__note")) {
        const nota = document.createElement("span");
        nota.className = "video__note";
        nota.textContent = "Agrega el ID de tu video de YouTube en data-video.";
        boton.appendChild(nota);
        setTimeout(() => nota.remove(), 3000);
      }
      return;
    }
    boton.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0"
      title="Video del proyecto" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  });
});
