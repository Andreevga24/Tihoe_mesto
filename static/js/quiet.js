/* Quiet Place: одна фраза за пробел, без кнопок и без сохранения состояния. */
(() => {
    "use strict";

    const prompt = document.getElementById("quiet-prompt");
    const progress = document.getElementById("quiet-progress");
    const nextLink = document.getElementById("thoughts-link");
    const experience = document.querySelector(".quiet-experience");
    const phrases = JSON.parse(experience.dataset.phrases);
    let index = -1;
    let changing = false;

    function advance() {
        if (changing) return;
        changing = true;
        prompt.classList.add("is-leaving");

        window.setTimeout(() => {
            index += 1;
            prompt.textContent = phrases[index];
            prompt.classList.remove("is-leaving");
            progress.textContent = "";

            if (index === phrases.length - 1) {
                nextLink.hidden = false;
                experience.classList.add("is-complete");
                changing = true;
            } else {
                changing = false;
            }
        }, 650);
    }

    document.addEventListener("keydown", (event) => {
        if (event.code !== "Space" || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
        // Не перехватывать пробел, если фокус по клавиатуре уже на ссылке навигации.
        if (event.target instanceof HTMLElement && event.target.closest("a, button, input, textarea, select")) return;
        event.preventDefault();
        advance();
    });
})();
