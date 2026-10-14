/* Медленный цикл спокойных фраз; страница не требует ввода или действий. */
(() => {
    "use strict";

    const phrase = document.getElementById("dawn-phrase");
    const words = JSON.parse(document.querySelector(".dawn-experience").dataset.phrases);
    let index = 0;
    let timer;

    function showNext() {
        phrase.classList.remove("is-visible");
        timer = window.setTimeout(() => {
            phrase.textContent = words[index];
            index = (index + 1) % words.length;
            phrase.classList.add("is-visible");
            timer = window.setTimeout(showNext, 6500);
        }, 1800);
    }

    showNext();
    window.addEventListener("pagehide", () => window.clearTimeout(timer));
})();
