(function () {
    const ICONS = {
        "mdi:clipboard-question-outline": '<path fill="currentColor" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-7 0c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1m7 16H5V5h2v3h10V5h2v14m-7-3h-2v-2h2v2m2.07-7.75l-.9.92C12.45 9.9 12 10.5 12 12h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41c0-1.1-.9-2-2-2S9 4.9 9 6H7c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25Z"/>',
        "mdi:check-circle": '<path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z"/>',
        "mdi:close-circle": '<path fill="currentColor" d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z"/>',
        "mdi:help-circle-outline": '<path fill="currentColor" d="M11 18h2v-2h-2v2m1-16C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5c0-2.21-1.79-4-4-4Z"/>',
        "mdi:alert-circle-outline": '<path fill="currentColor" d="M11 15h2v2h-2v-2m0-8h2v6h-2V7m1-5C6.47 2 2 6.5 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18a8 8 0 0 1-8-8a8 8 0 0 1 8-8a8 8 0 0 1 8 8a8 8 0 0 1-8 8Z"/>',
        "mdi:play-circle-outline": '<path fill="currentColor" d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18a8 8 0 0 1-8-8a8 8 0 0 1 8-8a8 8 0 0 1 8 8a8 8 0 0 1-8 8m-2-4.5v-7l6 3.5l-6 3.5Z"/>',
        "mdi:refresh": '<path fill="currentColor" d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.1A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h8V3l-3.35 3.35Z"/>',
        "mdi:send": '<path fill="currentColor" d="M2 21l21-9L2 3v7l15 2l-15 2v7Z"/>',
        "mdi:chevron-left": '<path fill="currentColor" d="M15.41 7.41L14 6l-6 6l6 6l1.41-1.41L10.83 12l4.58-4.59Z"/>',
        "mdi:chevron-right": '<path fill="currentColor" d="M8.59 16.59L10 18l6-6l-6-6l-1.41 1.41L13.17 12l-4.58 4.59Z"/>',
        "mdi:chevron-down": '<path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6l1.41-1.41Z"/>',
        "mdi:chevron-up": '<path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6l1.41 1.41Z"/>',
        "mdi:close": '<path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>',
        "mdi:cog": '<path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>',
        "mdi:content-save-outline": '<path fill="currentColor" d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4M12 19a3 3 0 1 1 0-6a3 3 0 0 1 0 6M6 8V5h9v3H6Z"/>',
        "mdi:delete-outline": '<path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12M8 9h8v10H8V9m7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5Z"/>',
        "mdi:eye-outline": '<path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5m0 12.5a5 5 0 1 1 0-10a5 5 0 0 1 0 10m0-8a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z"/>',
        "mdi:open-in-new": '<path fill="currentColor" d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3h-7M19 19H5V5h5V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5h-2v5Z"/>',
        "mdi:history": '<path fill="currentColor" d="M13 3a9 9 0 0 0-9 9H1l4 4l4-4H6a7 7 0 1 1 2.05 4.95l-1.42 1.42A9 9 0 1 0 13 3m-1 5v5l4.28 2.54l.72-1.21l-3.5-2.08V8H12Z"/>',
        "mdi:translate": '<path fill="currentColor" d="M12.87 15.07l-2.54-2.51l.03-.03A17.5 17.5 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17A15.7 15.7 0 0 1 9 11.35A15.6 15.6 0 0 1 6.69 8H4.69a17.6 17.6 0 0 0 2.98 4.56l-5.09 5.02L4 19l5-5l3.11 3.11l.76-2.04M18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12m-2.62 7l1.62-4.33L19.12 17h-3.24Z"/>',
        "mdi:key-outline": '<path fill="currentColor" d="M7 14a4 4 0 1 1 3.87-5H22v3h-3v3h-3v-3h-5.13A4 4 0 0 1 7 14m0-6a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z"/>'
    };

    function icon(name, options = {}) {
        const span = document.createElement("span");
        span.className = options.className || "as_icon";
        span.setAttribute("aria-hidden", "true");
        // Force inline-flex display to prevent CSS overrides
        span.style.display = "inline-flex";
        span.style.alignItems = "center";
        span.style.justifyContent = "center";

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", options.viewBox || "0 0 24 24");
        svg.setAttribute("width", String(options.size || 18));
        svg.setAttribute("height", String(options.size || 18));
        svg.setAttribute("focusable", "false");

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const pathData = ICONS[name] || ICONS["mdi:clipboard-question-outline"];
        // Extract the 'd' attribute from the stored string
        const dMatch = pathData.match(/d="([^"]+)"/);
        if (dMatch) {
            path.setAttribute("d", dMatch[1]);
            // Apply color if provided, otherwise use currentColor
            path.setAttribute("fill", options.color || "currentColor");
            svg.appendChild(path);
        }

        span.appendChild(svg);
        return span;
    }

    function setButtonContent(button, options = {}) {
        button.textContent = "";
        if (options.icon) button.appendChild(icon(options.icon, { className: "as_button_icon", size: options.iconSize || 18 }));
        if (options.label) {
            const label = document.createElement("span");
            label.className = "as_button_label";
            label.textContent = options.label;
            button.appendChild(label);
        }
        if (options.title) button.title = options.title;
        if (options.ariaLabel || options.label) button.setAttribute("aria-label", options.ariaLabel || options.label);
    }

    function button(options = {}) {
        const element = document.createElement("button");
        element.type = options.type || "button";
        element.className = ["as_button", options.variant ? `as_button_${options.variant}` : "", options.className || ""].filter(Boolean).join(" ");
        setButtonContent(element, options);
        if (options.onClick) element.addEventListener("click", options.onClick);
        return element;
    }

    window.ActiveStudyUI = {
        button,
        icon,
        setButtonContent
    };
})();
