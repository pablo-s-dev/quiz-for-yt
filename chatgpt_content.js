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
            console.log(`[ActiveStudy] Response updated, length: ${text.length} chars`);
        }

        const stable = Date.now() - stableSince >= RESPONSE_STABLE_MS;
        if (text && stable && !isChatGptStreaming()) {
            if (looksLikeQuizJson(text)) {
                console.log(`[ActiveStudy] Response complete and stable`);
                console.log(`[ActiveStudy] Full response length: ${text.length} chars`);
                console.log(`[ActiveStudy] First 200 chars: ${text.substring(0, 200)}`);
                console.log(`[ActiveStudy] Last 200 chars: ${text.substring(text.length - 200)}`);
                return text;
            }
            console.warn(`[ActiveStudy] Response finished but is not valid quiz JSON`);
        }

        if (text && stable && looksLikeQuizJson(text)) {
            console.log(`[ActiveStudy] Valid quiz JSON detected early`);
            console.log(`[ActiveStudy] Full response length: ${text.length} chars`);
            console.log(`[ActiveStudy] First 200 chars: ${text.substring(0, 200)}`);
            console.log(`[ActiveStudy] Last 200 chars: ${text.substring(text.length - 200)}`);
            return text;
        }

        await delay(POLL_MS);
    }

    if (lastText) {
        console.warn(`[ActiveStudy] Timeout but returning last text, length: ${lastText.length} chars`);
        return lastText;
    }
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

        // Deve ser um array
        if (!Array.isArray(parsed)) return false;

        // Deve ter pelo menos 3 perguntas
        if (parsed.length < 3) return false;

        // Valida estrutura básica de cada pergunta
        return parsed.every((q) => {
            if (!q || typeof q !== "object") return false;
            if (typeof q.question !== "string" || !q.question.trim()) return false;
            if (!Array.isArray(q.alternatives) || q.alternatives.length !== 4) return false;
            if (!q.alternatives.every((a) => typeof a === "string" && a.trim())) return false;

            const answer = String(q.answer || "").trim();
            const validLetter = ["A", "B", "C", "D"].includes(answer);
            const validIndex = ["0", "1", "2", "3"].includes(answer);

            return validLetter || validIndex;
        });
    } catch (error) {
        return false;
    }
}

function parseJsonFromText(text) {
    console.log(`[ActiveStudy] Parsing JSON from text, length: ${text.length} chars`);

    const cleaned = text
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

    console.log(`[ActiveStudy] After cleaning, length: ${cleaned.length} chars`);

    try {
        let jsonStr = cleaned;
        // Fix trailing commas
        jsonStr = jsonStr.replace(/,\s*([\]}])/g, "$1");
        const parsed = JSON.parse(jsonStr);
        console.log(`[ActiveStudy] Successfully parsed JSON directly`);
        return parsed;
    } catch (error) {
        console.log(`[ActiveStudy] Direct parse failed: ${error.message}`);
        console.log(`[ActiveStudy] Attempting to extract JSON from text...`);

        // Tenta extrair JSON de array ou objeto
        let start = cleaned.indexOf("[");
        let end = cleaned.lastIndexOf("]");

        // Se não encontrar array, tenta objeto
        if (start < 0 || end < start) {
            start = cleaned.indexOf("{");
            end = cleaned.lastIndexOf("}");
        }

        if (start < 0 || end < start) {
            console.error(`[ActiveStudy] Could not find JSON boundaries`);
            throw error;
        }

        let subStr = cleaned.slice(start, end + 1);
        console.log(`[ActiveStudy] Extracted substring from ${start} to ${end + 1}, length: ${subStr.length}`);

        subStr = subStr.replace(/,\s*([\]}])/g, "$1");
        const parsed = JSON.parse(subStr);
        console.log(`[ActiveStudy] Successfully parsed extracted JSON`);
        return parsed;
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
