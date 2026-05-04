const STORAGE_KEYS = {
    settings: "generationSettings",
    activeChatGptJob: "activeChatGptJob"
};

const DEFAULT_SETTINGS = {
    generationMode: "openai",
    openAiModel: "gpt-4o-mini"
};

const CHATGPT_URL = "https://chatgpt.com/";
const CHATGPT_PROMPT_RETRY_ATTEMPTS = 80;
const CHATGPT_PROMPT_RETRY_DELAY_MS = 500;

const QUIZ_RESPONSE_SCHEMA = {
    type: "object",
    additionalProperties: false,
    properties: {
        questions: {
            type: "array",
            minItems: 3,
            items: {
                type: "object",
                additionalProperties: false,
                properties: {
                    question: { type: "string" },
                    alternatives: {
                        type: "array",
                        minItems: 4,
                        maxItems: 4,
                        items: { type: "string" }
                    },
                    answer: { type: "string" }
                },
                required: ["question", "alternatives", "answer"]
            }
        }
    },
    required: ["questions"]
};

const chatGptJobs = new Map();
let chatGptWindowId = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.request === "generateQuizWithOpenAI") {
        generateQuizWithOpenAI(message.prompt)
            .then(sendResponse)
            .catch((error) => sendResponse({ ok: false, error: error.message }));
        return true;
    }

    if (message.request === "generateQuizWithChatGpt") {
        startChatGptQuizJob(message, sender)
            .then(sendResponse)
            .catch((error) => sendResponse({ ok: false, error: error.message }));
        return true;
    }

    if (message.request === "chatGptTabReady") {
        handleChatGptTabReady(sender)
            .then(sendResponse)
            .catch((error) => sendResponse({ ok: false, error: error.message }));
        return true;
    }

    if (message.request === "chatGptQuizResponse") {
        handleChatGptQuizResponse(message)
            .then(sendResponse)
            .catch((error) => sendResponse({ ok: false, error: error.message }));
        return true;
    }

    if (message.request === "chatGptQuizError") {
        handleChatGptQuizError(message)
            .then(sendResponse)
            .catch((error) => sendResponse({ ok: false, error: error.message }));
        return true;
    }

    if (message.request === "openChatGptPopup") {
        openChatGptPopup()
            .then((result) => sendResponse({ ok: true, ...result }))
            .catch((error) => sendResponse({ ok: false, error: error.message }));
        return true;
    }

    if (message.request === "minimizeChatGptPopup") {
        minimizeChatGptPopup(message.windowId)
            .then(sendResponse)
            .catch((error) => sendResponse({ ok: false, error: error.message }));
        return true;
    }
});

chrome.tabs.onRemoved?.addListener((tabId) => {
    for (const [jobId, job] of chatGptJobs) {
        if (job.chatGptTabId === tabId || job.sourceTabId === tabId) {
            clearChatGptJob(jobId);
        }
    }
});

async function generateQuizWithOpenAI(prompt) {
    const settings = await getGenerationSettings();
    const apiKey = String(settings.openAiApiKey || "").trim();

    if (!apiKey) {
        return {
            ok: false,
            error: "Configure sua chave da OpenAI no popup da extensao ou use o fluxo automatico do ChatGPT."
        };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: settings.openAiModel || DEFAULT_SETTINGS.openAiModel,
            messages: [
                {
                    role: "system",
                    content: "Voce gera quizzes de estudo ativo e responde somente com JSON valido no formato solicitado."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "active_study_quiz",
                    strict: true,
                    schema: QUIZ_RESPONSE_SCHEMA
                }
            },
            temperature: 0.7
        })
    });

    const data = await response.json();

    if (!response.ok) {
        return {
            ok: false,
            error: data.error?.message || `OpenAI API error: ${response.status}`
        };
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
        return { ok: false, error: "A OpenAI nao retornou conteudo para o quiz." };
    }

    try {
        return { ok: true, quiz: parseJsonFromText(content) };
    } catch (error) {
        return { ok: false, error: "Nao foi possivel interpretar o JSON retornado pela OpenAI." };
    }
}

async function startChatGptQuizJob(message, sender) {
    const sourceTabId = sender.tab?.id || message.sourceTabId;
    if (!sourceTabId) {
        return { ok: false, error: "Nao foi possivel identificar a aba do YouTube." };
    }

    const popup = await openChatGptPopup();
    if (!popup.tabId) {
        return { ok: false, error: "Nao foi possivel abrir a aba do ChatGPT." };
    }

    // Minimiza o popup imediatamente após abrir
    setTimeout(() => minimizeChatGptPopup(popup.windowId), 1000);

    const job = {
        jobId: createJobId(),
        prompt: message.prompt,
        sourceTabId,
        videoId: message.videoId,
        videoTitle: message.videoTitle,
        chatGptWindowId: popup.windowId,
        chatGptTabId: popup.tabId,
        createdAt: Date.now(),
        status: "opening"
    };

    chatGptJobs.set(job.jobId, job);
    await persistActiveChatGptJob(job);

    sendPromptToChatGptWhenReady(job).catch((error) => {
        forwardChatGptError(job, error.message);
        clearChatGptJob(job.jobId);
    });

    return { ok: true, jobId: job.jobId };
}

async function handleChatGptTabReady(sender) {
    const tabId = sender.tab?.id;
    if (!tabId) return { ok: false };

    const jobs = await getAllKnownChatGptJobs();
    const job = jobs.find((candidate) => candidate.chatGptTabId === tabId);
    if (!job || job.status === "prompt_sent") return { ok: true };

    sendPromptToChatGptWhenReady(job).catch((error) => {
        forwardChatGptError(job, error.message);
        clearChatGptJob(job.jobId);
    });

    return { ok: true };
}

async function handleChatGptQuizResponse(message) {
    const job = await getChatGptJob(message.jobId);
    if (!job) {
        return { ok: false, error: "Sessao do ChatGPT nao encontrada." };
    }

    await sendMessageToTab(job.sourceTabId, {
        request: "chatGptQuizResponse",
        jobId: job.jobId,
        responseText: message.responseText
    });

    await minimizeChatGptPopup(job.chatGptWindowId);
    await clearChatGptJob(job.jobId);
    return { ok: true };
}

async function handleChatGptQuizError(message) {
    const job = await getChatGptJob(message.jobId);
    if (!job) {
        return { ok: false, error: "Sessao do ChatGPT nao encontrada." };
    }

    await forwardChatGptError(job, message.error || "Falha ao obter resposta do ChatGPT.");
    await clearChatGptJob(job.jobId);
    return { ok: true };
}

async function sendPromptToChatGptWhenReady(job) {
    const currentJob = await getChatGptJob(job.jobId);
    if (currentJob?.status === "prompt_sent" || currentJob?.status === "sending") {
        return { ok: true, alreadyStarted: true };
    }

    job.status = "sending";
    chatGptJobs.set(job.jobId, job);
    await persistActiveChatGptJob(job);

    for (let attempt = 0; attempt < CHATGPT_PROMPT_RETRY_ATTEMPTS; attempt++) {
        try {
            const response = await sendMessageToTab(job.chatGptTabId, {
                request: "runChatGptPrompt",
                jobId: job.jobId,
                prompt: job.prompt
            });

            if (response?.ok) {
                job.status = "prompt_sent";
                chatGptJobs.set(job.jobId, job);
                await persistActiveChatGptJob(job);
                return response;
            }

            if (response?.fatal) {
                throw new Error(response.error || "Falha ao iniciar o ChatGPT.");
            }
        } catch (error) {
            const message = String(error.message || error);
            const canRetry = message.includes("Receiving end does not exist") || message.includes("Could not establish connection");
            if (!canRetry && attempt > 3) {
                throw error;
            }
        }

        await delay(CHATGPT_PROMPT_RETRY_DELAY_MS);
    }

    throw new Error("Timeout esperando o content script do ChatGPT ficar pronto.");
}

async function forwardChatGptError(job, errorMessage) {
    try {
        await sendMessageToTab(job.sourceTabId, {
            request: "chatGptQuizError",
            jobId: job.jobId,
            error: errorMessage
        });
    } catch (error) {
        console.warn("Nao foi possivel enviar erro para a aba do YouTube:", error.message);
    }
}

async function getGenerationSettings() {
    const data = await chrome.storage.local.get(STORAGE_KEYS.settings);
    return {
        ...DEFAULT_SETTINGS,
        ...(data[STORAGE_KEYS.settings] || {})
    };
}

async function openChatGptPopup() {
    const createdWindow = await chrome.windows.create({
        url: CHATGPT_URL,
        type: "popup",
        width: 560,
        height: 780,
        focused: true
    });

    chatGptWindowId = createdWindow.id;
    const tabId = createdWindow.tabs?.[0]?.id || await getFirstTabIdForWindow(createdWindow.id);
    return {
        windowId: createdWindow.id,
        tabId
    };
}

async function getFirstTabIdForWindow(windowId) {
    if (!windowId) return null;

    try {
        const tabs = await chrome.tabs.query({ windowId });
        return tabs[0]?.id || null;
    } catch (error) {
        return null;
    }
}

async function minimizeChatGptPopup(windowId = chatGptWindowId) {
    if (!windowId) return { ok: true };

    try {
        await chrome.windows.update(windowId, { state: "minimized" });
    } catch (error) {
        if (windowId === chatGptWindowId) chatGptWindowId = null;
    }

    return { ok: true };
}

async function sendMessageToTab(tabId, message) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }
            resolve(response);
        });
    });
}

async function persistActiveChatGptJob(job) {
    await chrome.storage.local.set({ [STORAGE_KEYS.activeChatGptJob]: job });
}

async function getChatGptJob(jobId) {
    if (chatGptJobs.has(jobId)) return chatGptJobs.get(jobId);

    const data = await chrome.storage.local.get(STORAGE_KEYS.activeChatGptJob);
    const storedJob = data[STORAGE_KEYS.activeChatGptJob];
    if (storedJob?.jobId === jobId) {
        chatGptJobs.set(jobId, storedJob);
        return storedJob;
    }

    return null;
}

async function getAllKnownChatGptJobs() {
    const jobs = Array.from(chatGptJobs.values());
    const data = await chrome.storage.local.get(STORAGE_KEYS.activeChatGptJob);
    const storedJob = data[STORAGE_KEYS.activeChatGptJob];

    if (storedJob && !jobs.some((job) => job.jobId === storedJob.jobId)) {
        jobs.push(storedJob);
        chatGptJobs.set(storedJob.jobId, storedJob);
    }

    return jobs;
}

async function clearChatGptJob(jobId) {
    chatGptJobs.delete(jobId);
    const data = await chrome.storage.local.get(STORAGE_KEYS.activeChatGptJob);
    if (data[STORAGE_KEYS.activeChatGptJob]?.jobId === jobId) {
        await chrome.storage.local.remove(STORAGE_KEYS.activeChatGptJob);
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
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");
        if (start < 0 || end < start) throw error;
        let subStr = cleaned.slice(start, end + 1);
        subStr = subStr.replace(/,\s*([\]}])/g, "$1");
        return JSON.parse(subStr);
    }
}

function createJobId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
