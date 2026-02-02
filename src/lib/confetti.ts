import confetti from "canvas-confetti";

// Basic confetti burst
export function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

// Gold/biblical themed confetti
export function fireGoldConfetti() {
  const colors = ["#FF9F1C", "#FFD700", "#FFA500", "#38B6FF"];

  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.6 },
    colors,
  });
}

// Side cannons for big achievements
export function fireCelebration() {
  const duration = 2000;
  const end = Date.now() + duration;

  const colors = ["#FF9F1C", "#38B6FF", "#FFD700"];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// Stars for streak celebrations
export function fireStars() {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ["#FFD700", "#FF9F1C", "#38B6FF"],
  };

  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.2,
    shapes: ["star"],
  });

  confetti({
    ...defaults,
    particleCount: 20,
    scalar: 0.75,
    shapes: ["circle"],
  });
}
