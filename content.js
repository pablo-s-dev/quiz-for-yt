(async () => {
    console.log("[ActiveStudy] Content script initialized.");
    let currentVid = "";
    let oldVid = "";
    let fullText = "";
    let pressing = false;
    let showingQuiz = false;
    let questions = [];
    let idx = 0;
    let vidTitle = "";
    let lang = (navigator.language || "en-US").toLowerCase().startsWith("pt") ? "pt-BR" : "en-US";
    let currentQuizSource = "saved";
    let focusedAlternativeIndex = -1;
    const pendingChatGptJobs = new Map();

    const STORAGE_KEYS = {
        history: "quizHistory",
        settings: "generationSettings"
    };

    const DEFAULT_SETTINGS = {
        generationMode: "openai",
        openAiModel: "gpt-4o-mini",
        uiLanguage: "system"
    };

    const textContent = {
        "en-US": {
            answer: "Answer",
            api_error: "Could not generate the quiz with the OpenAI API.",
            chatgpt_help: "Opening ChatGPT and waiting for the generated quiz...",
            chatgpt_ready: "ChatGPT is generating the quiz...",
            chatgpt_timeout: "Timed out waiting for ChatGPT.",
            close: "Close",
            correct: "Correct",
            create_quiz: "Create Quiz",
            incorrect: "Incorrect",
            extracting: "Reading video transcript...",
            importing: "Importing response...",
            left: "Left",
            loading: "Generating quiz...",
            chatgpt_title: "Generating with ChatGPT",
            launch_primary: "Create ActiveStudy quiz",
            new_quiz: "New quiz",
            next_question: "Next question",
            no_token: "Add your OpenAI API key in the extension popup or use the automatic ChatGPT mode.",
            no_video: "Open a YouTube video first.",
            not_answered: "Not answered yet",
            previous_question: "Previous question",
            question: "Question",
            quiz: "Quiz",
            right: "Right",
            saved: "Quiz saved.",
            send: "Send",
            submit_answer: "Submit answer",
            use_response: "Use response",
            video_title: "Video Title"
        },
        "pt-BR": {
            answer: "Resposta",
            api_error: "Não foi possível gerar o quiz com a API da OpenAI.",
            chatgpt_help: "Abrindo o ChatGPT e aguardando o quiz gerado...",
            chatgpt_ready: "O ChatGPT está gerando o quiz...",
            chatgpt_timeout: "Tempo esgotado aguardando o ChatGPT.",
            close: "Fechar",
            correct: "Correto",
            create_quiz: "Criar Quiz",
            incorrect: "Incorreto",
            extracting: "Lendo a transcrição do vídeo...",
            importing: "Importando resposta...",
            left: "Esquerda",
            loading: "Gerando quiz...",
            chatgpt_title: "Gerando com ChatGPT",
            launch_primary: "Criar quiz com ActiveStudy",
            new_quiz: "Novo quiz",
            next_question: "Próxima questão",
            no_token: "Adicione sua chave da OpenAI no popup da extensão ou use o modo automático com ChatGPT.",
            no_video: "Abra um vídeo do YouTube primeiro.",
            not_answered: "Ainda não respondida",
            previous_question: "Questão anterior",
            question: "Pergunta",
            quiz: "Quiz",
            right: "Direita",
            saved: "Quiz salvo.",
            send: "Enviar",
            submit_answer: "Enviar resposta",
            use_response: "Usar resposta",
            video_title: "Título do Vídeo"
        }
    };

    function getSystemLang() {
        const browserLang = navigator.language || "en-US";
        if (textContent[browserLang]) return browserLang;
        if (browserLang.toLowerCase().startsWith("pt")) return "pt-BR";
        return "en-US";
    }

    function resolveLang(language) {
        if (!language || language === "system") return getSystemLang();
        return textContent[language] ? language : "en-US";
    }

    function getLang() {
        return resolveLang(lang);
    }

    async function refreshLangFromSettings() {
        if (!isExtensionContextValid()) return lang;
        const settings = await getGenerationSettings();
        lang = resolveLang(settings.uiLanguage);
        return lang;
    }

    function t(key) {
        return (textContent[lang] || textContent["en-US"])[key] || key;
    }

    function isExtensionContextValid() {
        try {
            return Boolean(chrome?.runtime?.id);
        } catch (_) {
            return false;
        }
    }

    const AS_DEBUG = (() => {
        try {
            return Boolean(localStorage.getItem("AS_DEBUG"));
        } catch (_) {
            return false;
        }
    })();

    function asLog(...args) {
        if (!AS_DEBUG) return;
        // Keep logs grep-friendly in DevTools
        console.log("[ActiveStudy]", ...args);
    }

    function storageGet(keys) {
        if (!isExtensionContextValid()) return Promise.resolve({});
        return new Promise((resolve) => {
            try {
                chrome.storage.local.get(keys, resolve);
            } catch (_) {
                resolve({});
            }
        });
    }

    function storageSet(value) {
        if (!isExtensionContextValid()) return Promise.resolve({});
        return new Promise((resolve) => {
            try {
                chrome.storage.local.set(value, resolve);
            } catch (_) {
                resolve({});
            }
        });
    }

    function runtimeSendMessage(message) {
        if (!isExtensionContextValid()) return Promise.resolve({ ok: false, error: "Extension context invalidated" });
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    resolve({ ok: false, error: chrome.runtime.lastError.message });
                    return;
                }
                resolve(response);
            });
        });
    }

    function getCurrentVideoId() {
        try {
            const url = new URL(window.location.href);
            return url.searchParams.get("v") || "";
        } catch (error) {
            return "";
        }
    }

    async function grabVidInfo(force = false) {
        await refreshLangFromSettings();
        const nextVid = getCurrentVideoId();
        if (!nextVid) throw new Error(t("no_video"));

        if (!force && nextVid === oldVid && fullText) {
            currentVid = nextVid;
            return;
        }

        currentVid = nextVid;
        vidTitle = await getVidTitle();
        const subs = await grabSubs(currentVid);
        if (!subs.length) throw new Error("No transcript found for this video.");
        fullText = getFullTextWithTime(subs, vidTitle);
        oldVid = nextVid;
    }

    async function getGenerationSettings() {
        const data = await storageGet(STORAGE_KEYS.settings);
        return {
            ...DEFAULT_SETTINGS,
            ...(data[STORAGE_KEYS.settings] || {})
        };
    }

    async function getHistory() {
        const data = await storageGet(STORAGE_KEYS.history);
        return data[STORAGE_KEYS.history] || {};
    }

    async function getSavedQuiz(videoId) {
        const history = await getHistory();
        if (history[videoId]) return history[videoId];

        const legacyData = localStorage.getItem(videoId);
        if (!legacyData) return null;

        try {
            const parsed = JSON.parse(legacyData);
            const normalizedQuestions = normalizeQuestions(parsed.questions || parsed.Questions || []);
            if (!normalizedQuestions.length) return null;

            const now = new Date().toISOString();
            const record = {
                id: videoId,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                videoTitle: parsed.videoTitle || vidTitle || t("video_title"),
                questions: normalizedQuestions,
                source: "legacy",
                createdAt: now,
                updatedAt: now,
                lastAnsweredAt: null,
                timesGenerated: 1,
                ...getQuizStats(normalizedQuestions)
            };

            history[videoId] = record;
            await storageSet({ [STORAGE_KEYS.history]: history });
            return record;
        } catch (error) {
            return null;
        }
    }

    function getQuizStats(questionList) {
        const totalQuestions = questionList.length;
        const answeredCount = questionList.filter((question) => question.done).length;
        const correctCount = questionList.filter((question) => question.done && question.hit).length;
        const incorrectCount = answeredCount - correctCount;
        const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;

        return {
            totalQuestions,
            answeredCount,
            correctCount,
            incorrectCount,
            accuracy,
            completed: totalQuestions > 0 && answeredCount === totalQuestions
        };
    }

    async function saveQuizRecord(questionList, source, options = {}) {
        const normalizedQuestions = normalizeQuestions(questionList);
        const history = await getHistory();
        const existing = history[currentVid];
        const now = new Date().toISOString();
        const record = {
            id: currentVid,
            url: `https://www.youtube.com/watch?v=${currentVid}`,
            videoTitle: vidTitle || existing?.videoTitle || t("video_title"),
            questions: normalizedQuestions,
            source: source || existing?.source || currentQuizSource,
            createdAt: existing?.createdAt || now,
            updatedAt: now,
            lastAnsweredAt: options.answered ? now : existing?.lastAnsweredAt || null,
            timesGenerated: (existing?.timesGenerated || 0) + (options.newGeneration ? 1 : 0),
            ...getQuizStats(normalizedQuestions)
        };

        history[currentVid] = record;
        await storageSet({ [STORAGE_KEYS.history]: history });
        localStorage.setItem(currentVid, JSON.stringify(record));
        return record;
    }

    function buildQuizPrompt() {
        const isPt = lang === "pt-BR";
        const targetLanguage = isPt ? "português" : "English";

        const instructions = isPt
            ? [
                "Aja como um especialista em estudo ativo. Sua tarefa é criar um quiz de alta qualidade baseado na transcrição do vídeo fornecida.",
                "REGRAS OBRIGATÓRIAS:",
                "1. Responda APENAS com JSON puro. Não inclua markdown (```json), comentários ou explicações.",
                `2. O idioma das perguntas e respostas DEVE SER ${targetLanguage}, independente do idioma da transcrição.`,
                "3. Gere pelo menos 3 perguntas objetivas e desafiadoras.",
                "4. Cada pergunta deve ter exatamente 4 alternativas.",
                "5. O campo 'answer' deve conter APENAS a letra (A, B, C ou D) ou o índice (0, 1, 2 ou 3) da alternativa correta.",
                "6. NÃO coloque o texto completo da alternativa no campo 'answer', apenas a letra ou número.",
                "",
                "FORMATO DE SAÍDA:",
                "[{\"question\":\"Pergunta aqui?\",\"alternatives\":[\"Alternativa A\",\"Alternativa B\",\"Alternativa C\",\"Alternativa D\"],\"answer\":\"A\"}]",
                "",
                "### TRANSCRIÇÃO DO VÍDEO ###",
                fullText
            ]
            : [
                "Act as an active study expert. Your task is to create a high-quality quiz based on the provided video transcription.",
                "MANDATORY RULES:",
                "1. Respond ONLY with pure JSON. Do not include markdown (```json), comments, or explanations.",
                `2. The language of questions and answers MUST BE ${targetLanguage}, regardless of the transcription language.`,
                "3. Generate at least 3 objective and challenging questions.",
                "4. Each question must have exactly 4 alternatives.",
                "5. The 'answer' field must contain ONLY the letter (A, B, C, or D) or index (0, 1, 2, or 3) of the correct alternative.",
                "6. DO NOT put the full alternative text in the 'answer' field, only the letter or number.",
                "",
                "OUTPUT FORMAT:",
                "[{\"question\":\"Question here?\",\"alternatives\":[\"Alternative A\",\"Alternative B\",\"Alternative C\",\"Alternative D\"],\"answer\":\"A\"}]",
                "",
                "### VIDEO TRANSCRIPTION ###",
                fullText
            ];

        return instructions.join("\n");
    }

    async function generateQuizWithOpenAI() {
        const response = await runtimeSendMessage({
            request: "generateQuizWithOpenAI",
            prompt: buildQuizPrompt()
        });

        if (!response?.ok) {
            throw new Error(response?.error || t("api_error"));
        }

        return normalizeQuestions(response.quiz || response.questions || response || []);
    }

    async function generateQuizWithChatGpt() {
        showChatGptAutomationStatus(t("chatgpt_help"));

        const response = await runtimeSendMessage({
            request: "generateQuizWithChatGpt",
            prompt: buildQuizPrompt(),
            videoId: currentVid,
            videoTitle: vidTitle
        });

        if (!response?.ok || !response.jobId) {
            throw new Error(response?.error || t("chatgpt_timeout"));
        }

        showChatGptAutomationStatus(t("chatgpt_ready"));

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                pendingChatGptJobs.delete(response.jobId);
                reject(new Error(t("chatgpt_timeout")));
            }, 190000);

            pendingChatGptJobs.set(response.jobId, {
                resolve: (questionList) => {
                    clearTimeout(timeoutId);
                    resolve(questionList);
                },
                reject: (error) => {
                    clearTimeout(timeoutId);
                    reject(error);
                }
            });
        });
    }

    async function loadQuestions(forceNew = false) {
        const savedQuiz = await getSavedQuiz(currentVid);
        if (savedQuiz && !forceNew) {
            vidTitle = savedQuiz.videoTitle || vidTitle;
            currentQuizSource = savedQuiz.source || "saved";
            questions = normalizeQuestions(savedQuiz.questions);
            return { ok: true, questions };
        }

        const settings = await getGenerationSettings();
        if (settings.generationMode === "chatgpt") {
            try {
                const generatedQuestions = await generateQuizWithChatGpt();
                questions = generatedQuestions;
                idx = 0;
                currentQuizSource = "chatgpt";
                await saveQuizRecord(questions, currentQuizSource, { newGeneration: true });
                return { ok: true, questions };
            } catch (error) {
                return { ok: false, error: error.message || t("chatgpt_timeout") };
            }
        }

        try {
            const generatedQuestions = await generateQuizWithOpenAI();
            if (!generatedQuestions.length) {
                throw new Error(t("api_error"));
            }

            questions = generatedQuestions;
            idx = 0;
            currentQuizSource = "openai";
            await saveQuizRecord(questions, currentQuizSource, { newGeneration: true });
            return { ok: true, questions };
        } catch (error) {
            try {
                const generatedQuestions = await generateQuizWithChatGpt();
                questions = generatedQuestions;
                idx = 0;
                currentQuizSource = "chatgpt";
                await saveQuizRecord(questions, currentQuizSource, { newGeneration: true });
                return { ok: true, questions };
            } catch (chatGptError) {
                return { ok: false, error: chatGptError.message || error.message || t("no_token") };
            }
        }
    }

    async function grabSubs(videoId) {
        const langCode = getLang().split("-")[0];
        const apiSubs = await grabSubsUsingApi(videoId, langCode);
        if (apiSubs.length) return apiSubs;
        return grabSubsUsingUI();
    }

    async function grabSubsUsingApi(videoId, langCode) {
        try {
            const signatureTimestamp = await getSignatureTimestamp();
            const clientVersion = "2.20250222.10.00";
            const response = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false&alt=json", {
                method: "POST",
                headers: {
                    "Accept": "*/*",
                    "Accept-Language": "*",
                    "Content-Type": "application/json",
                    "X-Youtube-Client-Name": "1",
                    "X-Youtube-Client-Version": clientVersion
                },
                body: JSON.stringify({
                    videoId,
                    context: {
                        client: {
                            clientName: "WEB",
                            clientVersion,
                            hl: langCode || "en",
                            gl: "US",
                            platform: "DESKTOP",
                            userAgent: navigator.userAgent
                        }
                    },
                    playbackContext: {
                        contentPlaybackContext: {
                            signatureTimestamp,
                            vis: 0,
                            splay: false
                        }
                    },
                    racyCheckOk: true,
                    contentCheckOk: true
                })
            });

            if (!response.ok) return [];

            const data = await response.json();
            const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
            if (!tracks.length) return [];

            const targetTrack =
                tracks.find((track) => track.languageCode === langCode && track.kind !== "asr") ||
                tracks.find((track) => track.languageCode?.startsWith(langCode) && track.kind !== "asr") ||
                tracks.find((track) => track.kind !== "asr") ||
                tracks[0];

            if (!targetTrack?.baseUrl) return [];

            const subsResponse = await fetch(targetTrack.baseUrl, {
                headers: {
                    "Accept": "*/*"
                }
            });
            if (!subsResponse.ok) return [];

            const xmlText = await subsResponse.text();
            return parseSubtitleXml(xmlText);
        } catch (error) {
            console.warn("ActiveStudy API subtitle extraction failed:", error.message);
            return [];
        }
    }

    async function getSignatureTimestamp() {
        try {
            if (window.ytcfg && typeof window.ytcfg.get === "function") {
                const sts = window.ytcfg.get("STS");
                if (sts) return Number(sts);
            }

            for (const script of document.querySelectorAll("script")) {
                const text = script.textContent || "";
                const match = text.match(/"STS":\s*(\d+)/);
                if (match) return Number(match[1]);
            }
        } catch (error) {
            return null;
        }

        return null;
    }

    function parseSubtitleXml(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const nodes = Array.from(xmlDoc.getElementsByTagName("text"));

        return nodes
            .map((node) => ({
                time: Number(node.getAttribute("start") || 0),
                text: decodeHtmlEntities(node.textContent || "")
            }))
            .filter((sub) => sub.text.trim());
    }

    function decodeHtmlEntities(text) {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = text;
        return textarea.value;
    }

    async function grabSubsUsingUI() {
        const subs = [];
        await waitForElm("#expand", 8000);

        const expandBtn = document.querySelector("#expand");
        expandBtn.click();

        await waitForElm("#primary-button > ytd-button-renderer > yt-button-shape > button", 8000);

        const showSubtitles = document.querySelector("#primary-button > ytd-button-renderer > yt-button-shape > button");
        showSubtitles.click();

        await waitForElm("#segments-container > ytd-transcript-segment-renderer", 10000);

        const subtitles = document.querySelectorAll("#segments-container > ytd-transcript-segment-renderer > div > yt-formatted-string");
        const timestamps = document.querySelectorAll("#segments-container > ytd-transcript-segment-renderer > div > div > div");

        subtitles.forEach((subtitle, i) => {
            const text = subtitle.textContent;
            const timeTxt = timestamps[i]?.textContent.replace(/\n/g, "").replace(/\s/g, "") || "0";
            const time = toSeconds(timeTxt);
            subs.push({ text, time });
        });

        return subs;
    }

    function toSeconds(time) {
        return time.split(":").reduce((seconds, part, i, parts) => {
            return seconds + Number(part) * Math.pow(60, parts.length - 1 - i);
        }, 0);
    }

    function getFullTextWithTime(subs, title) {
        let text = `Video Title: ${title}\n`;
        for (const sub of subs) {
            text += `(${sub.time}s) ${sub.text}\n`;
        }
        return text;
    }

    async function getVidTitle() {
        const titleElement = await waitForFirstElm([
            "#container > h1 > yt-formatted-string",
            "h1.ytd-watch-metadata",
            "#title h1",
            "h1"
        ], 8000);
        return titleElement?.textContent?.trim() || document.title.replace(" - YouTube", "");
    }

    function waitForElm(selector, timeoutMs = 15000) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                return;
            }

            const timeoutId = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timed out waiting for ${selector}`));
            }, timeoutMs);

            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    clearTimeout(timeoutId);
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    function waitForFirstElm(selectors, timeoutMs = 15000) {
        return new Promise((resolve, reject) => {
            const findElement = () => selectors.map((selector) => document.querySelector(selector)).find(Boolean);
            const existing = findElement();
            if (existing) {
                resolve(existing);
                return;
            }

            const timeoutId = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timed out waiting for ${selectors.join(", ")}`));
            }, timeoutMs);

            const observer = new MutationObserver(() => {
                const element = findElement();
                if (element) {
                    clearTimeout(timeoutId);
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    function isWatchPage() {
        const url = new URL(window.location.href);
        return url.pathname === "/watch" && Boolean(getCurrentVideoId());
    }

    function queryDeep(selector, root = document) {
        try {
            const element = root.querySelector(selector);
            if (element) return element;

            const hosts = Array.from(root.querySelectorAll("*")).filter(el => el.shadowRoot);
            for (const host of hosts) {
                const found = queryDeep(selector, host.shadowRoot);
                if (found) return found;
            }
        } catch (e) {
            // ignore
        }
        return null;
    }

    let activeObserver = null;

    function startMutationWatch(target) {
        if (activeObserver) activeObserver.disconnect();

        console.log("[ActiveStudy] Target-specific MutationObserver started on:", target.tagName);

        activeObserver = new MutationObserver((mutations) => {
            const isMissing = !document.querySelector(".activestudy_launch_mount");
            if (isMissing && isWatchPage()) {
                console.log("[ActiveStudy] Mutation detected: Button missing. Re-injecting...");
                syncQuizLaunchButton();
            }
        });

        activeObserver.observe(target, { childList: true, subtree: true });
    }

    function isAnchorReady(anchor) {
        if (!anchor) return false;
        try {
            if (anchor.tagName === "H1" || anchor.id === "title") {
                return anchor.textContent.trim().length > 5;
            }
            return anchor.offsetWidth > 0;
        } catch (e) {
            return false;
        }
    }

    let launchButtonRetryCount = 0;
    let launchButtonSyncScheduled = false;

    function scheduleSyncQuizLaunchButton(delayMs = 0) {
        if (launchButtonSyncScheduled) return;
        launchButtonSyncScheduled = true;
        setTimeout(() => {
            launchButtonSyncScheduled = false;
            asLog("scheduleSyncQuizLaunchButton -> sync", { delayMs, href: location.href });
            syncQuizLaunchButton();
        }, delayMs);
    }

    function findQuizLaunchAnchor() {
        // Strategy 1: Title Area (Targeting the H1 specifically)
        const titleH1 = document.querySelector("h1.ytd-watch-metadata") ||
            document.querySelector("#title h1") ||
            queryDeep("h1", document.querySelector("ytd-watch-metadata"));
        if (titleH1) return titleH1;

        return document.querySelector("#above-the-fold") || null;
    }

    function getPreferredInsertMethod(anchor) {
        if (!anchor) return "prepend";
        const tag = anchor.tagName.toLowerCase();
        const id = anchor.id;

        if (tag === "h1" || id === "title") return "afterend";

        return "prepend";
    }

    async function syncQuizLaunchButton() {
        try {
            if (!isExtensionContextValid()) return;

            const existingMount = document.querySelector(".activestudy_launch_mount");
            const isWatch = isWatchPage();
            const videoId = getCurrentVideoId();

            if (!isWatch) {
                if (existingMount) {
                    console.log("[ActiveStudy] Not a watch page, removing existing button.");
                    existingMount.remove();
                }
                launchButtonRetryCount = 0;
                return;
            }

            await refreshLangFromSettings();
            if (existingMount) {
                if (!existingMount.isConnected) {
                    console.log("[ActiveStudy] Button disconnected from DOM, re-injecting.");
                    existingMount.remove();
                    scheduleSyncQuizLaunchButton(150);
                } else {
                    updateQuizLaunchButtonText(existingMount);
                }
                return;
            }

            console.log(`[ActiveStudy] Checking anchor for video: ${videoId} (Retry: ${launchButtonRetryCount})`);
            let anchor = findQuizLaunchAnchor();

            if (anchor && !isAnchorReady(anchor) && launchButtonRetryCount < 20) {
                console.log("[ActiveStudy] Anchor found but not ready (not populated yet). Waiting...");
                launchButtonRetryCount += 1;
                scheduleSyncQuizLaunchButton(600);
                return;
            }

            let method = "prepend";
            if (!anchor) {
                if (launchButtonRetryCount < 10) {
                    launchButtonRetryCount += 1;
                    scheduleSyncQuizLaunchButton(800);
                    return;
                }

                console.warn("[ActiveStudy] No stable anchor found. Using fallback.");
                anchor = document.body;
                method = "prepend";
            } else {
                method = getPreferredInsertMethod(anchor);
                console.log(`[ActiveStudy] Injecting into: ${anchor.tagName}${anchor.id ? '#' + anchor.id : ''} via ${method}`);
            }

            launchButtonRetryCount = 0;

            const mount = document.createElement("div");
            mount.className = "activestudy_launch_mount";
            // Ensure visibility with high z-index and fixed position if emergency
            if (anchor === document.body) {
                mount.style.position = "fixed";
                mount.style.top = "80px";
                mount.style.left = "20px";
                mount.style.zIndex = "2147483647";
                mount.style.background = "rgba(0,0,0,0.8)";
                mount.style.padding = "10px";
                mount.style.borderRadius = "8px";
                mount.style.border = "1px solid #1f6f8b";
            } else {
                mount.style.zIndex = "10";
                mount.style.position = "relative";
            }

            const button = document.createElement("button");
            button.type = "button";
            button.className = "activestudy_launch_btn";
            button.style.whiteSpace = "nowrap";
            button.style.width = "auto";
            button.style.padding = "0 14px";
            button.style.color = "#000000";
            button.style.fontWeight = "800";
            button.style.cursor = "pointer";
            button.onclick = (event) => {
                console.log("[ActiveStudy] Launch button clicked.");
                event.preventDefault();
                event.stopPropagation();
                startQuizCreation(false);
            };

            const icon = document.createElement("span");
            icon.className = "activestudy_launch_icon";
            icon.style.display = "flex";
            const iconEl = window.ActiveStudyUI.icon("mdi:clipboard-question-outline", { size: 22 });
            icon.appendChild(iconEl);

            const label = document.createElement("span");
            label.textContent = t("create_quiz");
            label.style.marginLeft = "8px";

            button.append(icon, label);
            mount.appendChild(button);
            method = getPreferredInsertMethod(anchor);
            if (method === "afterend" && anchor.insertAdjacentElement) {
                anchor.insertAdjacentElement("afterend", mount);
            } else if (method === "prepend") {
                anchor.prepend(mount);
            } else {
                anchor.append(mount);
            }

            console.log("[ActiveStudy] Button successfully injected into:", anchor.id || anchor.tagName);
            startMutationWatch(anchor.parentElement || anchor);
        } catch (e) {
            console.error("[ActiveStudy] CRITICAL ERROR in syncQuizLaunchButton:", e);
        }
    }

    function updateQuizLaunchButtonText(mount) {
        const button = mount.querySelector(".activestudy_launch_btn");
        const primary = mount.querySelector(".activestudy_launch_primary");
        if (button) button.setAttribute("aria-label", t("launch_primary"));
        if (primary) primary.textContent = t("launch_primary");
    }

    document.addEventListener("keydown", async (event) => {
        if (pressing) return;

        const shortcutPressed = event.ctrlKey && event.shiftKey && (event.key === "Q" || event.key === "q");
        if (!shortcutPressed) return;

        if (showingQuiz) {
            hideQuiz();
            return;
        }

        pressing = true;
        startQuizCreation(false);
    });

    document.addEventListener("keyup", (event) => {
        if (event.key === "Q" || event.key === "q") {
            pressing = false;
        }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        (async () => {
            if (message.request === "showQuiz") {
                await showSavedQuiz(message.quiz, message.videoId);
                sendResponse({ ok: true });
                return;
            }

            if (message.request === "regenerateQuiz") {
                startQuizCreation(true);
                sendResponse({ ok: true });
                return;
            }

            if (message.request === "showChatGptAutomation") {
                startChatGptCreation();
                sendResponse({ ok: true });
                return;
            }

            if (message.request === "chatGptQuizResponse") {
                const pendingJob = pendingChatGptJobs.get(message.jobId);
                let questionList = [];
                let parseError = null;

                try {
                    questionList = normalizeQuestions(parseQuizText(message.responseText || ""));
                    if (!questionList.length) throw new Error(t("api_error"));
                } catch (error) {
                    parseError = error;
                }

                if (parseError) {
                    if (pendingJob) {
                        pendingChatGptJobs.delete(message.jobId);
                        pendingJob.reject(parseError);
                    }
                    throw parseError;
                }

                if (pendingJob) {
                    pendingChatGptJobs.delete(message.jobId);
                    pendingJob.resolve(questionList);
                } else {
                    questions = questionList;
                    idx = 0;
                    currentQuizSource = "chatgpt";
                    await saveQuizRecord(questions, currentQuizSource, { newGeneration: true });
                    renderQuestion();
                }

                sendResponse({ ok: true });
                return;
            }

            if (message.request === "chatGptQuizError") {
                const pendingJob = pendingChatGptJobs.get(message.jobId);
                const error = new Error(message.error || t("chatgpt_timeout"));
                if (pendingJob) {
                    pendingChatGptJobs.delete(message.jobId);
                    pendingJob.reject(error);
                }
                showChatGptAutomationStatus(error.message);
                sendResponse({ ok: true });
                return;
            }

            if (message.request === "getCurrentVideoInfo") {
                const videoId = getCurrentVideoId();
                sendResponse({ ok: Boolean(videoId), videoId, title: document.title });
                return;
            }
        })().catch((error) => sendResponse({ ok: false, error: error.message }));

        return true;
    });

    function hideQuiz() {
        showingQuiz = false;
        focusedAlternativeIndex = -1;
        const quizContainer = document.querySelector(".quiz_container");
        quizContainer?.remove();
    }

    function updateAlternativeFocus() {
        const alternatives = document.querySelectorAll(".alternative_wrapper");
        alternatives.forEach((alt, index) => {
            if (index === focusedAlternativeIndex) {
                alt.classList.add("focused");
                // Scroll para deixar a alternativa na parte de baixo
                alt.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                    inline: "nearest"
                });
            } else {
                alt.classList.remove("focused");
            }
        });
    }

    function handleQuizKeyboard(event) {
        if (!showingQuiz) return;

        const currentQuestion = questions[idx];
        if (!currentQuestion) return;

        // Previne interação com o vídeo do YouTube
        event.preventDefault();
        event.stopPropagation();

        // Escape - Fechar quiz
        if (event.key === "Escape") {
            hideQuiz();
            return;
        }

        // Setas esquerda/direita - Navegar entre questões
        if (event.key === "ArrowLeft") {
            prevQuestion();
            return;
        }

        if (event.key === "ArrowRight") {
            nextQuestion();
            return;
        }

        // Setas cima/baixo - Navegar entre alternativas
        if (event.key === "ArrowUp") {
            if (focusedAlternativeIndex === -1) {
                // Se nenhuma está focada, vai para a última
                focusedAlternativeIndex = currentQuestion.alternatives.length - 1;
            } else {
                focusedAlternativeIndex = Math.max(0, focusedAlternativeIndex - 1);
            }
            updateAlternativeFocus();
            return;
        }

        if (event.key === "ArrowDown") {
            const maxIndex = currentQuestion.alternatives.length - 1;
            if (focusedAlternativeIndex === -1) {
                // Se nenhuma está focada, vai para a primeira
                focusedAlternativeIndex = 0;
            } else {
                focusedAlternativeIndex = Math.min(maxIndex, focusedAlternativeIndex + 1);
            }
            updateAlternativeFocus();
            return;
        }

        // Espaço - Selecionar alternativa focada (marcar radio)
        if (event.key === " ") {
            if (!currentQuestion.done) {
                const alternatives = document.querySelectorAll(".alternative_input");
                if (alternatives[focusedAlternativeIndex]) {
                    alternatives[focusedAlternativeIndex].checked = true;
                }
            }
            return;
        }

        // Enter - Enviar resposta selecionada
        if (event.key === "Enter") {
            if (!currentQuestion.done) {
                checkAns(currentQuestion);
            }
            return;
        }

        // Números 1-4 ou letras A-D - Selecionar alternativa diretamente
        const keyMap = {
            "1": 0, "2": 1, "3": 2, "4": 3,
            "a": 0, "b": 1, "c": 2, "d": 3,
            "A": 0, "B": 1, "C": 2, "D": 3
        };

        if (keyMap.hasOwnProperty(event.key)) {
            const alternativeIndex = keyMap[event.key];

            if (!currentQuestion.done) {
                focusedAlternativeIndex = alternativeIndex;
                const alternatives = document.querySelectorAll(".alternative_input");
                if (alternatives[alternativeIndex]) {
                    alternatives[alternativeIndex].checked = true;
                    updateAlternativeFocus();
                }
            }
            return;
        }
    }

    document.addEventListener("keydown", handleQuizKeyboard, true);

    function showQuizShell() {
        hideQuiz();
        showingQuiz = true;

        const quizContainer = document.createElement("div");
        quizContainer.className = "quiz_container";

        const header = document.createElement("div");
        header.className = "quiz_header";

        const brand = document.createElement("div");
        brand.className = "quiz_brand_container";

        const icon = window.ActiveStudyUI.icon("mdi:clipboard-question-outline", { size: 24, className: "quiz_official_icon" });
        icon.style.color = "#ffffff";

        const title = document.createElement("div");
        title.className = "quiz_title";
        title.textContent = "Quiz for YouTube";

        brand.append(icon, title);

        const regenerateBtn = document.createElement("button");
        regenerateBtn.type = "button";
        regenerateBtn.className = "quiz_close_btn quiz_regenerate_btn";
        regenerateBtn.title = t("new_quiz");
        window.ActiveStudyUI.setButtonContent(regenerateBtn, { icon: "mdi:refresh", ariaLabel: t("new_quiz"), title: t("new_quiz") });
        regenerateBtn.onclick = regenerateQuiz;

        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "quiz_close_btn";
        closeBtn.title = t("close");
        window.ActiveStudyUI.setButtonContent(closeBtn, { icon: "mdi:close", ariaLabel: t("close"), title: t("close") });
        closeBtn.onclick = hideQuiz;

        const headerActions = document.createElement("div");
        headerActions.className = "quiz_header_actions";
        headerActions.append(regenerateBtn, closeBtn);

        header.append(brand, headerActions);

        const scroll = document.createElement("div");
        scroll.className = "quiz_scroll";

        const btnContainer = document.createElement("div");
        btnContainer.className = "btn_container";

        const navRow = document.createElement("div");
        navRow.className = "quiz_nav_row";

        const leftArrow = document.createElement("button");
        leftArrow.type = "button";
        leftArrow.className = "btn icon_btn left_arrow";
        leftArrow.title = t("previous_question");
        window.ActiveStudyUI.setButtonContent(leftArrow, { icon: "mdi:chevron-left", ariaLabel: t("previous_question") });
        leftArrow.onclick = () => prevQuestion();

        const sendAns = document.createElement("button");
        sendAns.className = "btn send_ans";
        sendAns.type = "button";
        sendAns.title = t("submit_answer");
        window.ActiveStudyUI.setButtonContent(sendAns, { icon: "mdi:send", label: t("send"), ariaLabel: t("submit_answer") });
        sendAns.onclick = () => checkAns(questions[idx]);

        const rightArrow = document.createElement("button");
        rightArrow.type = "button";
        rightArrow.className = "btn icon_btn right_arrow";
        rightArrow.title = t("next_question");
        window.ActiveStudyUI.setButtonContent(rightArrow, { icon: "mdi:chevron-right", ariaLabel: t("next_question") });
        rightArrow.onclick = () => nextQuestion();

        navRow.append(leftArrow, sendAns, rightArrow);
        btnContainer.append(navRow);

        scroll.append(getTextPlaceholder());
        quizContainer.append(header, scroll, btnContainer);
        document.body.appendChild(quizContainer);
        if (window.Iconify) window.Iconify.scan();
    }

    async function showQuiz(options = {}) {
        showQuizShell();

        if (options.quiz) {
            vidTitle = options.quiz.videoTitle || vidTitle;
            currentVid = options.quiz.id || options.videoId || currentVid;
            questions = normalizeQuestions(options.quiz.questions);
            currentQuizSource = options.quiz.source || "saved";
            idx = 0;
            renderQuestion();
            return;
        }

        const loadResult = await loadQuestions(Boolean(options.forceNew));
        if (!loadResult.ok) {
            renderError(loadResult.error);
            return;
        }

        renderQuestion();
    }

    async function showSavedQuiz(quiz, videoId) {
        lang = getLang();
        currentVid = videoId || quiz?.id || getCurrentVideoId();
        if (!currentVid) throw new Error(t("no_video"));

        if (quiz) {
            await showQuiz({ quiz, videoId: currentVid });
            return;
        }

        await grabVidInfo();
        await showQuiz();
    }

    async function regenerateQuiz() {
        showQuizShell();
        showChatGptAutomationStatus(t("extracting"));
        await grabVidInfo(true);
        questions = [];
        idx = 0;

        const loadResult = await loadQuestions(true);
        if (!loadResult.ok) {
            renderError(loadResult.error);
            return;
        }

        renderQuestion();
    }

    async function startQuizCreation(forceNew = false) {
        showQuizShell();
        showChatGptAutomationStatus(t("extracting"));
        try {
            await grabVidInfo(forceNew);
            await showQuiz({ forceNew });
        } catch (error) {
            renderError(error.message || t("api_error"));
        } finally {
            pressing = false;
        }
    }

    async function startChatGptCreation() {
        showQuizShell();
        showChatGptAutomationStatus(t("extracting"));
        try {
            await grabVidInfo(true);
            await generateAndRenderWithChatGpt();
        } catch (error) {
            renderError(error.message || t("chatgpt_timeout"));
        } finally {
            pressing = false;
        }
    }

    async function generateAndRenderWithChatGpt() {
        try {
            const generatedQuestions = await generateQuizWithChatGpt();
            questions = generatedQuestions;
            idx = 0;
            currentQuizSource = "chatgpt";
            await saveQuizRecord(questions, currentQuizSource, { newGeneration: true });
            renderQuestion();
        } catch (error) {
            renderError(error.message || t("chatgpt_timeout"));
        }
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function updateNavigationButtons() {
        const leftArrow = document.querySelector(".left_arrow");
        const rightArrow = document.querySelector(".right_arrow");

        if (leftArrow) {
            if (idx === 0) {
                leftArrow.classList.add("disabled");
                leftArrow.disabled = true;
            } else {
                leftArrow.classList.remove("disabled");
                leftArrow.disabled = false;
            }
        }

        if (rightArrow) {
            if (idx >= questions.length - 1) {
                rightArrow.classList.add("disabled");
                rightArrow.disabled = true;
            } else {
                rightArrow.classList.remove("disabled");
                rightArrow.disabled = false;
            }
        }
    }

    function updateProgressBar() {
        let progressBar = document.querySelector(".quiz_progress_bar");
        if (!progressBar) {
            const btnContainer = document.querySelector(".btn_container");
            if (!btnContainer) return;

            progressBar = document.createElement("div");
            progressBar.className = "quiz_progress_bar";

            const progressTrack = document.createElement("div");
            progressTrack.className = "quiz_progress_bar_track";

            const progressFill = document.createElement("div");
            progressFill.className = "quiz_progress_fill";

            const progressText = document.createElement("div");
            progressText.className = "quiz_progress_text";

            progressTrack.appendChild(progressFill);
            progressBar.appendChild(progressTrack);
            progressBar.appendChild(progressText);
            btnContainer.insertBefore(progressBar, btnContainer.firstChild);
        }

        const progressFill = progressBar.querySelector(".quiz_progress_fill");
        const progressText = progressBar.querySelector(".quiz_progress_text");

        if (progressFill && progressText) {
            const progress = ((idx + 1) / questions.length) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${idx + 1}/${questions.length}`;
        }
    }

    async function renderQuestion() {
        const scroll = document.querySelector(".quiz_scroll");
        if (!scroll) return;

        // Scroll to top when changing questions
        scroll.scrollTop = 0;

        // Remove skeleton sem animação
        const skeleton = scroll.querySelector(".skeleton_wrapper");
        if (skeleton) {
            skeleton.remove();
        }

        // Remove questão anterior com animação
        const current = scroll.querySelector(".txt_container");
        if (current) {
            current.classList.remove("quiz_slide_in");
            current.classList.add("quiz_slide_out");
            await delay(250);
            current.remove();
        }

        const textContainer = showQuestion(questions[idx], idx);
        if (!textContainer) return;

        scroll.appendChild(textContainer);

        // Reset focus para nenhuma alternativa (usuário precisa pressionar ↑ ou ↓)
        focusedAlternativeIndex = -1;
        updateAlternativeFocus();

        updateNavigationButtons();
        updateProgressBar();
    }

    function showChatGptAutomationStatus(message) {
        const scroll = document.querySelector(".quiz_scroll");
        if (!scroll) return;

        const textContainer = document.createElement("div");
        textContainer.className = "txt_container chatgpt_status_container";

        const title = document.createElement("div");
        title.className = "chatgpt_status_title";
        title.innerText = t("chatgpt_title");

        const help = document.createElement("p");
        help.className = "chatgpt_status_help";
        help.innerText = message || t("chatgpt_help");

        const statusLine = document.createElement("div");
        statusLine.className = "status_message";
        statusLine.appendChild(getSmallLoadingIndicator());

        textContainer.append(title, help, statusLine);
        scroll.innerHTML = "";
        scroll.appendChild(textContainer);
    }

    function renderError(message) {
        const scroll = document.querySelector(".quiz_scroll");
        if (!scroll) return;

        scroll.innerHTML = "";

        const errorBox = document.createElement("div");
        errorBox.className = "quiz_error_box";

        const iconWrapper = document.createElement("div");
        iconWrapper.className = "quiz_error_icon";
        const iconEl = window.ActiveStudyUI.icon("mdi:alert-circle-outline", { size: 48, color: "#ff4444" });
        iconWrapper.appendChild(iconEl);

        const text = document.createElement("p");
        text.className = "quiz_error_text";
        text.textContent = message;

        errorBox.append(iconWrapper, text);
        scroll.appendChild(errorBox);
    }

    function getSmallLoadingIndicator() {
        const container = document.createElement("div");
        container.className = "quiz_skeleton_container";

        // Pergunta
        const titleLine = document.createElement("div");
        titleLine.className = "skeleton_line skeleton_title";
        container.appendChild(titleLine);

        // 4 Alternativas
        for (let i = 0; i < 4; i++) {
            const row = document.createElement("div");
            row.className = "skeleton_row";

            const dot = document.createElement("div");
            dot.className = "skeleton_dot";

            const line = document.createElement("div");
            line.className = "skeleton_line";
            line.style.width = `${Math.floor(Math.random() * (90 - 60 + 1) + 60)}%`; // Largura variada

            row.append(dot, line);
            container.appendChild(row);
        }

        return container;
    }

    function checkAns(question) {
        if (!question || question.done) return;

        const alternativeList = Array.from(document.querySelectorAll(".alternative_input"));
        const selectedIndex = alternativeList.findIndex((alternative) => alternative.checked);
        if (selectedIndex < 0) return;

        question.done = true;
        question.user_ans = selectedIndex;
        question.hit = alternativeList[selectedIndex].value === question.answer;

        saveQuizRecord(questions, currentQuizSource, { answered: true }).then(() => {
            updateQuestionInPlace();
        });
    }

    function updateQuestionInPlace() {
        const scroll = document.querySelector(".quiz_scroll");
        if (!scroll) return;

        const current = scroll.querySelector(".txt_container");
        if (current) {
            current.remove();
        }

        const textContainer = showQuestion(questions[idx], idx);
        if (!textContainer) return;

        // Remove a classe de animação para não animar
        textContainer.classList.remove("quiz_slide_in");
        scroll.appendChild(textContainer);

        updateNavigationButtons();
        updateProgressBar();
    }

    function showQuestion(question) {
        if (!question) return null;

        const textContainer = document.createElement("div");
        textContainer.className = "txt_container quiz_slide_in";

        const questionDiv = document.createElement("div");
        questionDiv.className = "question";

        // Status icon (apenas ícone, sem texto)
        const statusIcon = document.createElement("span");
        statusIcon.className = "question_status_icon";

        if (question.done) {
            if (question.hit) {
                const iconEl = window.ActiveStudyUI.icon("mdi:check-circle", { size: 20, color: "#4caf50" });
                statusIcon.appendChild(iconEl);
                statusIcon.title = t("correct");
            } else {
                const iconEl = window.ActiveStudyUI.icon("mdi:close-circle", { size: 20, color: "#f44336" });
                statusIcon.appendChild(iconEl);
                statusIcon.title = t("incorrect");
            }
        } else {
            const iconEl = window.ActiveStudyUI.icon("mdi:help-circle-outline", { size: 20, color: "rgba(255, 255, 255, 0.4)" });
            statusIcon.appendChild(iconEl);
            statusIcon.title = t("not_answered");
        }

        const questionText = document.createElement("span");
        questionText.className = "question_text";
        questionText.innerText = question.question;

        questionDiv.append(statusIcon, questionText);

        const alternativesContainer = document.createElement("form");
        alternativesContainer.className = "alternatives_container";

        question.alternatives.forEach((alternativeText, alternativeIndex) => {
            const alternativeDiv = document.createElement("div");
            alternativeDiv.className = "alternative_wrapper";

            const alternativeInput = document.createElement("input");
            const alternativeLabel = document.createElement("label");
            alternativeInput.type = "radio";
            alternativeInput.name = "alternative";
            alternativeInput.className = "alternative_input";
            alternativeInput.value = alternativeText;
            alternativeLabel.innerText = alternativeText;

            if (question.done) {
                alternativeInput.disabled = true;
                if (question.user_ans === alternativeIndex) alternativeInput.checked = true;
                if (alternativeText === question.answer) alternativeDiv.classList.add("correct");
                if (question.user_ans === alternativeIndex && alternativeText !== question.answer) {
                    alternativeDiv.classList.add("wrong");
                }
            }

            alternativeDiv.onclick = () => {
                if (!question.done) alternativeInput.checked = true;
            };

            alternativeDiv.append(alternativeInput, alternativeLabel);
            alternativesContainer.appendChild(alternativeDiv);
        });

        textContainer.append(questionDiv, alternativesContainer);
        return textContainer;
    }

    function getTextPlaceholder() {
        const existingText = document.querySelector(".txt_container, .skeleton_wrapper");
        existingText?.remove();

        const textContainer = document.createElement("div");
        textContainer.className = "skeleton_wrapper";

        const placeholder = document.createElement("div");
        placeholder.className = "placeholder";

        const questionLine = document.createElement("div");
        questionLine.classList.add("text-line", "loading", "question");
        questionLine.title = t("loading");

        const alternativeLine = document.createElement("div");
        alternativeLine.classList.add("text-line", "loading", "alternative");

        const alternativeContainer = document.createElement("div");
        alternativeContainer.className = "alternative_container";
        alternativeContainer.append(alternativeLine, alternativeLine.cloneNode(), alternativeLine.cloneNode(), alternativeLine.cloneNode());

        placeholder.append(questionLine, alternativeContainer);
        textContainer.appendChild(placeholder);
        return textContainer;
    }

    function nextQuestion() {
        if (idx + 1 >= questions.length) return;
        idx++;
        renderQuestion();
    }

    function prevQuestion() {
        if (idx - 1 < 0) return;
        idx--;
        renderQuestion();
    }

    function parseQuizText(text) {
        const cleaned = text
            .trim()
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```$/i, "")
            .trim();

        try {
            let jsonStr = cleaned;
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

    function normalizeQuestions(rawQuiz) {
        // Espera um array direto de perguntas
        const list = Array.isArray(rawQuiz) ? rawQuiz : [];

        return list
            .map((rawQuestion) => {
                const rawAlternatives = rawQuestion.alternatives || rawQuestion.Alternatives || rawQuestion.options || rawQuestion.Options || [];
                const alternatives = Array.isArray(rawAlternatives) ? rawAlternatives.map((alternative) => String(alternative)) : [];
                let answer = rawQuestion.answer ?? rawQuestion.Answer;

                if (typeof answer === "number") {
                    answer = alternatives[answer] || alternatives[answer - 1] || "";
                }

                const userAnswer = rawQuestion.user_ans ?? rawQuestion.userAnswer ?? rawQuestion.UserAnswer;
                const normalizedUserAnswer = userAnswer === null || userAnswer === undefined ? null : Number(userAnswer);

                if (typeof answer === "string") {
                    const letterIndex = answer.trim().toUpperCase().match(/^[A-F]$/)?.[0].charCodeAt(0) - 65;
                    if (Number.isInteger(letterIndex) && alternatives[letterIndex]) {
                        answer = alternatives[letterIndex];
                    }
                }

                return {
                    question: rawQuestion.question || rawQuestion.Question || "",
                    alternatives,
                    answer: String(answer || ""),
                    time: Number(rawQuestion.time ?? rawQuestion.Time ?? 0),
                    done: Boolean(rawQuestion.done),
                    hit: rawQuestion.hit === true,
                    user_ans: Number.isInteger(normalizedUserAnswer) ? normalizedUserAnswer : null
                };
            })
            .filter((question) => {
                return question.question && Array.isArray(question.alternatives) && question.alternatives.length > 1 && question.answer;
            });
    }

    syncQuizLaunchButton();
    window.addEventListener("yt-navigate-start", () => {
        const existing = document.querySelector(".activestudy_launch_mount");
        existing?.remove();
        if (activeObserver) activeObserver.disconnect();
    });
    window.addEventListener("yt-navigate-finish", () => scheduleSyncQuizLaunchButton(3500));
    window.addEventListener("yt-page-data-updated", () => scheduleSyncQuizLaunchButton(3500));
    window.addEventListener("load", () => scheduleSyncQuizLaunchButton(2000));

    // YouTube is an SPA; metadata is often replaced after initial render.
    const launchBtnObserver = new MutationObserver(() => {
        if (!isExtensionContextValid()) return;
        if (!isWatchPage()) return;
        scheduleSyncQuizLaunchButton(200);
    });
    launchBtnObserver.observe(document.documentElement, { childList: true, subtree: true });
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (!isExtensionContextValid()) return;
        if (areaName !== "local" || !changes[STORAGE_KEYS.settings]) return;
        const settings = {
            ...DEFAULT_SETTINGS,
            ...(changes[STORAGE_KEYS.settings].newValue || {})
        };
        lang = resolveLang(settings.uiLanguage);
        syncQuizLaunchButton();
    });
})();
