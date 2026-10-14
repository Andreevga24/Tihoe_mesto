/* Обработка записей целиком в браузере; запросы к серверу не выполняются. */
(() => {
    "use strict";

    const editor = document.getElementById("thoughts-editor");
    const experience = document.querySelector(".thoughts-experience");
    const canvas = document.getElementById("thoughts-canvas");
    const context = canvas.getContext("2d");
    const release = document.getElementById("thoughts-release");
    const releaseButton = document.getElementById("thoughts-release-button");
    const hint = document.getElementById("thoughts-hint");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lightTheme = document.body.classList.contains("theme-light");
    const duration = 4000;
    let particles = [];
    let frame = 0;
    let busy = false;
    let finishing = false;

    // Показать поле после небольшой паузы, чтобы сохранить тишину вступления.
    window.setTimeout(() => {
        editor.classList.add("is-ready");
        // Не открывать экранную клавиатуру автоматически на телефоне.
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            editor.focus({ preventScroll: true });
        }
    }, 1800);

    function fitCanvas() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(window.innerWidth * ratio);
        canvas.height = Math.round(window.innerHeight * ratio);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    fitCanvas();
    window.addEventListener("resize", fitCanvas, { passive: true });

    // Создаёт частицы по одной на каждый символ, раскладывая исходный текст строками.
    function makeParticles(text) {
        const fontSize = Math.min(24, Math.max(16, window.innerWidth * 0.022));
        const lineHeight = fontSize * 1.8;
        const lines = text.split("\n");
        const totalHeight = lines.length * lineHeight;
        const centerY = window.innerHeight * 0.5;
        const result = [];

        lines.forEach((line, row) => {
            const chars = Array.from(line);
            context.font = `400 ${fontSize}px Georgia, serif`;
            const lineWidth = context.measureText(line).width;
            let x = (window.innerWidth - lineWidth) / 2;
            const y = centerY - totalHeight / 2 + row * lineHeight;
            chars.forEach((character) => {
                const width = context.measureText(character).width;
                if (character.trim()) {
                    result.push({
                        character,
                        x: x + width / 2,
                        y,
                        startX: x + width / 2,
                        startY: y,
                        drift: (Math.random() - 0.5) * 42,
                        lift: 40 + Math.random() * 85,
                        delay: Math.random() * 550,
                        size: fontSize,
                    });
                }
                x += width;
            });
        });
        return result;
    }

    function drawParticles(timestamp, startedAt) {
        if (!busy || reducedMotion.matches) return;
        const elapsed = timestamp - startedAt;
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        let alive = false;

        for (const particle of particles) {
            const localTime = Math.max(0, elapsed - particle.delay);
            const progress = Math.min(1, localTime / duration);
            if (progress >= 1) continue;
            alive = true;
            const ease = progress * progress * (3 - 2 * progress);
            const sway = Math.sin(progress * Math.PI * 3 + particle.startX * 0.03) * 8;
            const alpha = Math.max(0, 1 - progress) * Math.min(1, localTime / 120);
            particle.x = particle.startX + particle.drift * ease + sway;
            particle.y = particle.startY - particle.lift * ease;

            // Тёплый белый переходит в прохладный голубой по мере растворения.
            const red = lightTheme ? Math.round(65 + 76 * progress) : Math.round(244 - 65 * progress);
            const green = lightTheme ? Math.round(83 + 95 * progress) : Math.round(239 - 30 * progress);
            const blue = lightTheme ? Math.round(111 + 105 * progress) : Math.round(226 + 24 * progress);
            context.save();
            context.globalAlpha = alpha;
            context.font = `400 ${particle.size}px Georgia, serif`;
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.shadowColor = `rgba(${red}, ${green}, ${blue}, ${alpha * 0.8})`;
            context.shadowBlur = 12;
            context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
            context.fillText(particle.character, particle.x, particle.y);
            context.restore();
        }

        if (alive && elapsed < duration + 600) {
            frame = window.requestAnimationFrame((nextTimestamp) => drawParticles(nextTimestamp, startedAt));
        } else {
            context.clearRect(0, 0, window.innerWidth, window.innerHeight);
            finishDissolve();
        }
    }

    function finishDissolve() {
        if (!busy || finishing) return;
        finishing = true;
        release.textContent = experience.dataset.doneText;
        release.classList.add("is-visible");
        window.setTimeout(() => {
            release.classList.remove("is-visible");
            release.textContent = "";
            experience.classList.remove("is-dissolving");
            editor.value = "";
            editor.disabled = false;
            releaseButton.disabled = false;
            releaseButton.hidden = true;
            hint.textContent = experience.dataset.hintText;
            busy = false;
            finishing = false;
            if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
                editor.focus({ preventScroll: true });
            }
        }, 4000);
    }

    function dissolve() {
        const text = editor.value;
        if (busy || !text.trim()) return;
        busy = true;
        editor.disabled = true;
        releaseButton.disabled = true;
        releaseButton.hidden = true;
        hint.textContent = "";
        experience.classList.add("is-dissolving");

        if (reducedMotion.matches) {
            window.setTimeout(finishDissolve, 700);
            return;
        }

        particles = makeParticles(text);
        const startedAt = performance.now();
        frame = window.requestAnimationFrame((timestamp) => drawParticles(timestamp, startedAt));
    }

    editor.addEventListener("input", () => {
        releaseButton.hidden = !editor.value.trim() || busy;
    });

    editor.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && event.shiftKey) {
            event.preventDefault();
            dissolve();
        }
    });

    releaseButton.addEventListener("click", dissolve);

    reducedMotion.addEventListener("change", () => {
        if (busy && reducedMotion.matches) {
            window.cancelAnimationFrame(frame);
            context.clearRect(0, 0, window.innerWidth, window.innerHeight);
            finishDissolve();
        }
    });

    // Снимаем анимацию, если вкладку закрывают, и не оставляем текст в DOM после сброса.
    window.addEventListener("pagehide", () => {
        window.cancelAnimationFrame(frame);
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        particles = [];
    });
})();
