const CHATGPT_SELECTORS = {
    composer: [
        "#prompt-textarea",
        "textarea[data-testid='prompt-textarea']",
        "textarea[placeholder]",
        "div[contenteditable='true'][id='prompt-textarea']",
        "div[contenteditable='true']"
    ],
    sendButton: [
        "button[data-testid='send-button']",
        "button[aria-label='Send prompt']",
        "button[aria-label='Send message']",
        "button[aria-label*='Send']"
    ],
    stopButton: [
        "button[data-testid='stop-button']",
        "button[aria-label*='Stop']",
        "button[aria-label*='Parar']"
    ],
    assistantMessage: [
        "[data-message-author-role='assistant']",
        "[data-testid*='conversation-turn'] [data-message-author-role='assistant']"
    ],
    extendedModePill: [
        "button.__composer-pill-remove[aria-label*='Estendido']",
        "button.__composer-pill-remove[aria-label*='Extended']",
        "#thread-bottom button.__composer-pill-remove"
    ]
};

const RESPONSE_TIMEOUT_MS = 180000;
const RESPONSE_STABLE_MS = 1800;
const POLL_MS = 300;

let activeJobId = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.request !== "runChatGptPrompt") return false;

    runChatGptPrompt(message.jobId, message.prompt).catch((error) => {
        chrome.runtime.sendMessage({
            request: "chatGptQuizError",
            jobId: message.jobId,
            error: error.message
        });
    });

    sendResponse({ ok: true, started: true });
    return true;
});

notifyReady();
setTimeout(notifyReady, 1000);
setTimeout(notifyReady, 2500);

async function runChatGptPrompt(jobId, prompt) {
    if (activeJobId === jobId) return;
    activeJobId = jobId;

    const beforeCount = getAssistantMessages().length;

    // Pausa inicial reduzida
    await delay(400 + Math.random() * 300);

    const composer = await waitForAnyElement(CHATGPT_SELECTORS.composer, 45000);

    // Tenta remover o modo estendido de forma mais rápida
    await removeExtendedMode();

    // Pausa mínima
    await delay(200);

    await setComposerValue(composer, prompt);

    // Pausa antes de clicar em enviar (reduzida)
    await delay(300 + Math.random() * 200);

    const sendButton = await waitForSendButton(30000);
    sendButton.click();

    const responseText = await waitForAssistantResponse(beforeCount);
    await chrome.runtime.sendMessage({
        request: "chatGptQuizResponse",
        jobId,
        responseText
    });
}

function notifyReady() {
    chrome.runtime.sendMessage({ request: "chatGptTabReady" });
}

async function removeExtendedMode() {
    console.log("[ActiveStudy] Monitorando modo estendido...");

    const specificSelector = "#thread-bottom > div > div > div > div > div.pointer-events-auto.relative.z-1.flex.h-\\(---composer-container-height\\,100\\%\\).max-w-full.flex-\\(---composer-container-flex\\,1\\).flex-col > form > div:nth-child(2) > div > div.-m-1.max-w-full.overflow-x-auto.p-1.\\[grid-area\\:footer\\].\\[scrollbar-width\\:none\\] > div > div > div > button.__composer-pill-remove";

    // Tenta encontrar o botão rapidamente (2 tentativas × 200ms)
    for (let i = 0; i < 2; i++) {
        const btn = document.querySelector(specificSelector) ||
            document.querySelector("button.__composer-pill-remove[aria-label*='Estendido']") ||
            document.querySelector("button.__composer-pill-remove[aria-label*='Extended']");

        if (btn) {
            console.log("[ActiveStudy] Botão 'Estendido' encontrado! Removendo...");
            btn.click();
            await delay(400); // Espera reduzida para a UI reagir
            return true;
        }

        await delay(200); // Espera reduzida entre tentativas
    }

    console.log("[ActiveStudy] Modo estendido não detectado ou já removido.");
    return false;
}

async function setComposerValue(composer, prompt) {
    composer.focus();

    if (composer.tagName === "TEXTAREA" || composer.tagName === "INPUT") {
        composer.value = prompt;
        composer.dispatchEvent(new Event("input", { bubbles: true }));
        composer.dispatchEvent(new Event("change", { bubbles: true }));
        return;
    }

    composer.textContent = "";

    try {
        document.execCommand("insertText", false, prompt);
    } catch (error) {
        composer.textContent = prompt;
    }

    if (!composer.textContent?.trim()) {
        composer.textContent = prompt;
    }

    composer.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        inputType: "insertText",
        data: prompt
    }));
    composer.dispatchEvent(new Event("change", { bubbles: true }));
}

async function waitForSendButton(timeoutMs) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        const button = findFirstElement(CHATGPT_SELECTORS.sendButton);
        if (button && !button.disabled && button.getAttribute("aria-disabled") !== "true") {
            return button;
        }
        await delay(POLL_MS);
    }

    throw new Error("Nao encontrei o botao de enviar do ChatGPT. Verifique se voce esta logado.");
}

async function waitForAssistantResponse(beforeCount) {
    const startedAt = Date.now();
    let lastText = "";
    let stableSince = Date.now();

    while (Date.now() - startedAt < RESPONSE_TIMEOUT_MS) {
        const messages = getAssistantMessages();
        const candidate = messages.length > beforeCount ? messages[messages.length - 1] : null;
        const text = getMessageText(candidate);

        if (text !== lastText) {
            lastText = text;
            stableSince = Date.now();
        }

        const stable = Date.now() - stableSince >= RESPONSE_STABLE_MS;
        if (text && stable && !isChatGptStreaming()) {
            return text;
        }

        if (text && stable && looksLikeQuizJson(text)) {
            return text;
        }

        await delay(POLL_MS);
    }

    if (lastText) return lastText;
    throw new Error("Timeout esperando a resposta do ChatGPT.");
}

function getAssistantMessages() {
    const messages = [];
    for (const selector of CHATGPT_SELECTORS.assistantMessage) {
        messages.push(...document.querySelectorAll(selector));
    }
    return Array.from(new Set(messages));
}

function getMessageText(messageElement) {
    if (!messageElement) return "";

    const clone = messageElement.cloneNode(true);
    // Remove botões, SVGs, navegação e blocos de PENSAMENTO/RACIOCÍNIO
    clone.querySelectorAll("button, svg, nav, .thought, [data-testid*='thought'], .whitespace-pre-wrap.italic").forEach((element) => element.remove());

    // Remove especificamente o bloco que o ChatGPT usa para "Pensando" ou "Thinking"
    // Geralmente é o primeiro bloco de texto se for itálico ou tiver classes específicas
    const text = (clone.innerText || clone.textContent || "").trim();

    // Se a resposta começar com "Pensando" e tiver um pulo de linha, tenta pegar só o que vem depois
    if (text.startsWith("Pensando") && text.includes("\n")) {
        return text.split("\n").slice(1).join("\n").trim();
    }

    return text;
}

function isChatGptStreaming() {
    return Boolean(findFirstElement(CHATGPT_SELECTORS.stopButton));
}

function looksLikeQuizJson(text) {
    try {
        const parsed = parseJsonFromText(text);
        return Array.isArray(parsed);
    } catch (error) {
        return false;
    }
}

function parseJsonFromText(text) {
    const cleaned = text
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

    try {
        let jsonStr = cleaned;
        // Fix trailing commas
        jsonStr = jsonStr.replace(/,\s*([\]}])/g, "$1");
        return JSON.parse(jsonStr);
    } catch (error) {
        // Tenta extrair JSON de array ou objeto
        let start = cleaned.indexOf("[");
        let end = cleaned.lastIndexOf("]");

        // Se não encontrar array, tenta objeto
        if (start < 0 || end < start) {
            start = cleaned.indexOf("{");
            end = cleaned.lastIndexOf("}");
        }

        if (start < 0 || end < start) throw error;

        let subStr = cleaned.slice(start, end + 1);
        subStr = subStr.replace(/,\s*([\]}])/g, "$1");
        return JSON.parse(subStr);
    }
}

function findFirstElement(selectors) {
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) return element;
    }
    return null;
}

function waitForAnyElement(selectors, timeoutMs) {
    return new Promise((resolve, reject) => {
        const existing = findFirstElement(selectors);
        if (existing) {
            resolve(existing);
            return;
        }

        const startedAt = Date.now();
        const observer = new MutationObserver(() => {
            const element = findFirstElement(selectors);
            if (element) {
                observer.disconnect();
                resolve(element);
                return;
            }

            if (Date.now() - startedAt >= timeoutMs) {
                observer.disconnect();
                reject(new Error("Nao encontrei o campo de mensagem do ChatGPT. Verifique se voce esta logado."));
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error("Timeout esperando a interface do ChatGPT carregar."));
        }, timeoutMs);
    });
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
