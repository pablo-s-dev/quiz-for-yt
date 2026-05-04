const STORAGE_KEYS = {
    history: "quizHistory",
    settings: "generationSettings"
};

const DEFAULT_SETTINGS = {
    generationMode: "chatgpt",
    openAiModel: "gpt-4o-mini",
    uiLanguage: "system"
};

const I18N = {
    "en-US": {
        settings_title: "Settings",
        language_label: "Language",
        language_system: "Browser language",
        mode_label: "Mode",
        mode_openai: "OpenAI API with my token",
        mode_chatgpt: "ChatGPT Popup",
        api_key_label: "OpenAI API key",
        save_token: "Save token",
        clear_token: "Remove token",
        model_label: "Model",
        token_hint: "The token is stored only in the extension local storage and sent directly to OpenAI.",
        current_video_title: "Current video",
        create_current_quiz: "Create quiz from current video",
        shortcut_hint: "YouTube shortcut: Ctrl + Shift + Q.",
        history_title: "History and stats",
        settings_saved: "Settings saved automatically.",
        token_saved: "Token saved.",
        token_removed: "Token removed.",
        no_quiz: "No quiz created yet.",
        untitled_video: "Untitled video",
        answered: "answered",
        correct: "correct",
        generations: "generations",
        show: "Show",
        open_video: "Open video",
        videos: "videos",
        answers: "answers",
        accuracy: "accuracy",
        creating_quiz: "Creating quiz in the current video.",
        open_youtube_first: "Open a YouTube video first."
    },
    "pt-BR": {
        settings_title: "Configurações",
        language_label: "Idioma",
        language_system: "Idioma do navegador",
        mode_label: "Modo",
        mode_openai: "API OpenAI com meu token",
        mode_chatgpt: "Popup ChatGPT",
        api_key_label: "Chave da API OpenAI",
        save_token: "Salvar token",
        clear_token: "Remover token",
        model_label: "Modelo",
        token_hint: "O token fica salvo apenas no storage local da extensão e é enviado direto para a OpenAI.",
        current_video_title: "Vídeo atual",
        create_current_quiz: "Criar quiz do vídeo atual",
        shortcut_hint: "Atalho no YouTube: Ctrl + Shift + Q.",
        history_title: "Histórico e estatísticas",
        settings_saved: "Configuração salva automaticamente.",
        token_saved: "Token salvo.",
        token_removed: "Token removido.",
        no_quiz: "Nenhum quiz criado ainda.",
        untitled_video: "Vídeo sem título",
        answered: "respondidas",
        correct: "acertos",
        generations: "gerações",
        show: "Mostrar",
        open_video: "Abrir vídeo",
        videos: "vídeos",
        answers: "respostas",
        accuracy: "acerto",
        creating_quiz: "Criando quiz no vídeo atual.",
        open_youtube_first: "Abra um vídeo do YouTube primeiro."
    }
};

let activeLanguage = getSystemLanguage();

document.addEventListener("DOMContentLoaded", () => {
    bindPopupFrame();
    bindActions();
    loadSettings();
    renderHistory();
});

function bindPopupFrame() {
    const closeBtn = document.getElementById("closePopup");
    closeBtn?.addEventListener("click", () => window.close());
    if (closeBtn && window.ActiveStudyUI?.setButtonContent) {
        window.ActiveStudyUI.setButtonContent(closeBtn, {
            icon: closeBtn.getAttribute("data-icon") || "mdi:close",
            ariaLabel: closeBtn.getAttribute("aria-label") || "Close",
            title: closeBtn.getAttribute("aria-label") || "Close",
            iconSize: 18
        });
    }

    document.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape") window.close();
    });
}

function bindActions() {
    document.getElementById("saveToken").addEventListener("click", saveToken);
    document.getElementById("clearToken").addEventListener("click", clearToken);
    document.getElementById("generateCurrent").addEventListener("click", regenerateCurrentQuiz);
    document.getElementById("uiLanguage").addEventListener("change", autoSaveSettings);
    document.getElementById("generationMode").addEventListener("change", autoSaveSettings);
    document.getElementById("openAiModel").addEventListener("change", autoSaveSettings);
    document.getElementById("openAiModel").addEventListener("blur", autoSaveSettings);
}

async function loadSettings() {
    const data = await chrome.storage.local.get(STORAGE_KEYS.settings);
    const settings = {
        ...DEFAULT_SETTINGS,
        ...(data[STORAGE_KEYS.settings] || {})
    };

    document.getElementById("generationMode").value = settings.generationMode;
    document.getElementById("uiLanguage").value = settings.uiLanguage || DEFAULT_SETTINGS.uiLanguage;
    document.getElementById("openAiApiKey").value = settings.openAiApiKey || "";
    document.getElementById("openAiModel").value = settings.openAiModel || DEFAULT_SETTINGS.openAiModel;
    activeLanguage = resolveLanguage(settings.uiLanguage);
    applyTranslations();
    updateOpenAiFieldsVisibility();
    initGlobalIcons();
    renderHistory();
}

async function saveToken() {
    const currentSettings = await getCurrentSettings();
    const settings = {
        ...currentSettings,
        openAiApiKey: document.getElementById("openAiApiKey").value.trim(),
        openAiModel: getModelValue()
    };

    await chrome.storage.local.set({ [STORAGE_KEYS.settings]: settings });
    setText("settingsStatus", t("token_saved"));
}

async function autoSaveSettings() {
    const currentSettings = await getCurrentSettings();
    const settings = {
        ...currentSettings,
        uiLanguage: document.getElementById("uiLanguage").value,
        generationMode: document.getElementById("generationMode").value,
        openAiModel: getModelValue()
    };

    await chrome.storage.local.set({ [STORAGE_KEYS.settings]: settings });
    activeLanguage = resolveLanguage(settings.uiLanguage);
    applyTranslations();
    updateOpenAiFieldsVisibility();
    initGlobalIcons();
    await renderHistory();
    setText("settingsStatus", t("settings_saved"));
}

async function clearToken() {
    const data = await chrome.storage.local.get(STORAGE_KEYS.settings);
    const settings = {
        ...DEFAULT_SETTINGS,
        ...(data[STORAGE_KEYS.settings] || {}),
        openAiApiKey: ""
    };

    await chrome.storage.local.set({ [STORAGE_KEYS.settings]: settings });
    document.getElementById("openAiApiKey").value = "";
    setText("settingsStatus", t("token_removed"));
}

async function getCurrentSettings() {
    const data = await chrome.storage.local.get(STORAGE_KEYS.settings);
    return {
        ...DEFAULT_SETTINGS,
        ...(data[STORAGE_KEYS.settings] || {})
    };
}

function getModelValue() {
    return document.getElementById("openAiModel").value.trim() || DEFAULT_SETTINGS.openAiModel;
}

function updateOpenAiFieldsVisibility() {
    const mode = document.getElementById("generationMode").value;
    document.getElementById("openAiFields").classList.toggle("hidden", mode === "chatgpt");
}

function getSystemLanguage() {
    const browserLanguage = navigator.language || "en-US";
    return browserLanguage.toLowerCase().startsWith("pt") ? "pt-BR" : "en-US";
}

function resolveLanguage(language) {
    if (!language || language === "system") return getSystemLanguage();
    return I18N[language] ? language : "en-US";
}

function t(key) {
    return (I18N[activeLanguage] || I18N["en-US"])[key] || key;
}

function applyTranslations() {
    document.documentElement.lang = activeLanguage;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.getAttribute("data-i18n");
        if (element.tagName === "OPTION") {
            element.textContent = t(key);
            return;
        }
        element.textContent = t(key);
    });
}

function initGlobalIcons() {
    document.querySelectorAll("[data-icon]").forEach((el) => {
        const iconName = el.getAttribute("data-icon");
        if (el.tagName === "BUTTON") {
            window.ActiveStudyUI?.setButtonContent(el, {
                icon: iconName,
                label: el.getAttribute("data-i18n") ? t(el.getAttribute("data-i18n")) : null
            });
        } else {
            // Para spans/divs (como o logo)
            const iconEl = window.ActiveStudyUI.icon(iconName, { size: 22 });
            el.innerHTML = "";
            el.appendChild(iconEl);
        }
    });
}

async function renderHistory() {
    const data = await chrome.storage.local.get(STORAGE_KEYS.history);
    const history = Object.values(data[STORAGE_KEYS.history] || {})
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

    renderTotalStats(history);

    const container = document.getElementById("prevQuizContainer");
    container.innerHTML = "";

    if (!history.length) {
        const empty = document.createElement("p");
        empty.className = "empty_state";
        empty.innerText = t("no_quiz");
        container.appendChild(empty);
        return;
    }

    const items = history.map((quiz) => {
        const item = document.createElement("div");
        item.className = "history_item";

        const title = document.createElement("p");
        title.className = "history_title";
        title.innerText = quiz.videoTitle || t("untitled_video");

        const meta = document.createElement("p");
        meta.className = "history_meta";
        meta.innerText = [
            `${quiz.answeredCount || 0}/${quiz.totalQuestions || 0} ${t("answered")}`,
            `${quiz.correctCount || 0} ${t("correct")}`,
            `${quiz.accuracy || 0}%`,
            `${quiz.timesGenerated || 0} ${t("generations")}`
        ].join(" | ");

        const buttonRow = document.createElement("div");
        buttonRow.className = "button_row";

        const showButton = window.ActiveStudyUI.button({
            icon: "mdi:eye-outline",
            label: t("show"),
            className: "as_button_secondary"
        });
        showButton.addEventListener("click", () => showQuiz(quiz));

        const openButton = window.ActiveStudyUI.button({
            icon: "mdi:open-in-new",
            label: t("open_video"),
            className: "as_button_secondary"
        });
        openButton.addEventListener("click", () => chrome.tabs.create({ url: getQuizUrl(quiz) }));

        buttonRow.append(showButton, openButton);
        item.append(title, meta, buttonRow);
        return item;
    });

    container.append(...items);
}

function renderTotalStats(history) {
    const totalVideos = history.length;
    const totalAnswered = history.reduce((sum, quiz) => sum + (quiz.answeredCount || 0), 0);
    const totalCorrect = history.reduce((sum, quiz) => sum + (quiz.correctCount || 0), 0);
    const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const stats = [
        { label: t("videos"), value: totalVideos },
        { label: t("answers"), value: totalAnswered },
        { label: t("accuracy"), value: `${accuracy}%` }
    ];

    const statsContainer = document.getElementById("historyStats");
    statsContainer.innerHTML = "";
    statsContainer.append(...stats.map((stat) => {
        const box = document.createElement("div");
        box.className = "stat_box";

        const number = document.createElement("span");
        number.className = "stat_number";
        number.innerText = stat.value;

        const label = document.createElement("span");
        label.className = "stat_label";
        label.innerText = stat.label;

        box.append(number, label);
        return box;
    }));
}

function showQuiz(quiz) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab?.id) return;

        chrome.tabs.sendMessage(tab.id, { request: "showQuiz", quiz, videoId: quiz.id }, (response) => {
            if (chrome.runtime.lastError || !response?.ok) {
                chrome.tabs.create({ url: getQuizUrl(quiz) });
            }
        });
    });
}

function regenerateCurrentQuiz() {
    sendToActiveTab({ request: "regenerateQuiz" }, t("creating_quiz"));
}

function sendToActiveTab(message, successMessage) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab?.id) {
            setText("currentStatus", t("open_youtube_first"));
            return;
        }

        chrome.tabs.sendMessage(tab.id, message, (response) => {
            if (chrome.runtime.lastError || !response?.ok) {
                setText("currentStatus", response?.error || t("open_youtube_first"));
                return;
            }

            setText("currentStatus", successMessage);
        });
    });
}

function setText(id, text) {
    document.getElementById(id).innerText = text;
}

function getQuizUrl(quiz) {
    return quiz.url || `https://www.youtube.com/watch?v=${quiz.id}`;
}
