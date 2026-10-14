/* Локальная, одноразовая поддержка: текст никогда не отправляется и не сохраняется. */
(() => {
    "use strict";

    const editor = document.getElementById("comfort-editor");
    const releaseButton = document.getElementById("release-button");
    const support = document.getElementById("comfort-support");
    const supportivePhrases = JSON.parse(document.querySelector(".comfort-experience").dataset.phrases);

    editor.addEventListener("input", () => {
        releaseButton.hidden = editor.value.trim().length === 0;
    });

    releaseButton.addEventListener("click", () => {
        if (!editor.value.trim()) return;

        releaseButton.disabled = true;
        editor.disabled = true;
        editor.classList.add("is-releasing");
        releaseButton.hidden = true;

        window.setTimeout(() => {
            // Стираем ввод до показа фразы и не сохраняем его за пределами страницы.
            editor.value = "";
            editor.classList.remove("is-releasing");
            editor.disabled = false;
            support.textContent = supportivePhrases[Math.floor(Math.random() * supportivePhrases.length)];
            support.classList.add("is-visible");
            window.setTimeout(() => support.classList.remove("is-visible"), 4500);
            releaseButton.disabled = false;
            editor.focus({ preventScroll: true });
        }, 1100);
    });
})();
