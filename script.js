
const shootingStars = document.getElementById("shooting-stars");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

// Create the shooting stars
if (shootingStars) {
  for (let i = 0; i < 9; i++) {
    const star = document.createElement("div");
    star.className = "shooting-star";

    star.style.setProperty("--top", `${5 + Math.random() * 65}%`);
    star.style.setProperty("--left", `${25 + Math.random() * 100}%`);
    star.style.setProperty("--duration", `${4 + Math.random() * 7}s`);
    star.style.setProperty("--delay", `${Math.random() * 12}s`);

    shootingStars.appendChild(star);
  }
}

// Mobile navigation
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "✕" : "☰";
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  });
}

// Reveal sections smoothly as you scroll
const sections = document.querySelectorAll(".section");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(section => observer.observe(section));
}

const introScreen = document.getElementById("intro-screen");

if (introScreen) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      introScreen.classList.add("intro-hidden");
    }, 2400);
  });
}

const logoutButton = document.getElementById("logout-button");

async function checkStudentSession() {
  if (!logoutButton) return;

  try {
    const response = await fetch("/api/students/me");

    if (response.ok) {
      // A student is already logged in.
      logoutButton.hidden = false;
    } else {
      logoutButton.hidden = true;
    }
  } catch (error) {
    logoutButton.hidden = true;
  }
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    logoutButton.textContent = "LOGGING OUT...";

    try {
      const response = await fetch("/api/students/logout", {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Could not log out. Please try again.");
      }

      window.location.reload();
    } catch (error) {
      alert(error.message);
      logoutButton.disabled = false;
      logoutButton.textContent = "↪ LOG OUT";
    }
  });
}

checkStudentSession();