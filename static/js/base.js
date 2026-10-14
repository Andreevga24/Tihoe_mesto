/* Управление музыкой и кнопкой возврата в начало страницы. */
(() => {
    "use strict";

    const audio = document.getElementById("background-audio");
    const muteButton = document.querySelector(".mute-toggle");
    if (audio && muteButton) {
        audio.volume = 0.2;
        audio.muted = false;

        const updateMuteButton = () => {
            const muted = audio.muted;
            muteButton.setAttribute("aria-pressed", String(muted));
            const label = muted ? muteButton.dataset.labelUnmute : muteButton.dataset.labelMute;
            muteButton.setAttribute("aria-label", label);
            muteButton.title = label;
            muteButton.querySelector(".mute-icon").textContent = muted ? "♪̸" : "♪";
        };

        const startAudio = () => {
            audio.play().then(() => {
                muteButton.hidden = false;
                document.removeEventListener("keydown", onFirstKey);
                document.removeEventListener("pointerdown", onFirstPointer);
            }).catch(() => {
                // Если запуск заблокирован браузером, следующее действие попробует снова.
            });
        };
        const onFirstKey = (event) => {
            if (["Shift", "Control", "Alt", "Meta"].includes(event.key)) return;
            startAudio();
        };
        const onFirstPointer = () => startAudio();

        document.addEventListener("keydown", onFirstKey);
        document.addEventListener("pointerdown", onFirstPointer, { once: true });
        muteButton.addEventListener("click", () => {
            audio.muted = !audio.muted;
            updateMuteButton();
        });
        window.addEventListener("pagehide", () => {
            audio.pause();
            audio.currentTime = 0;
        });
        updateMuteButton();
    }

    // Кнопка отображается лишь после прокрутки и учитывает снижение анимации.
    const topButton = document.querySelector(".to-top");
    if (topButton) {
        const updateTopButton = () => {
            topButton.hidden = window.scrollY < 240;
        };
        window.addEventListener("scroll", updateTopButton, { passive: true });
        topButton.addEventListener("click", () => {
            const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
        });
        updateTopButton();
    }
})();
