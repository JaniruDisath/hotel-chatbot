const GEMINI_API_KEY = "AIzaSyChG7QSbL5B8lxeG2LXUW2A-4vAfteliW4";
const GEMINI_MODEL = "gemini-2.5-pro";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const HOTEL_SYSTEM_INSTRUCTION = `You are the hotel assistant for Leisure Land Villas. You MUST always reply in EXACTLY this format for ALL messages (user or system):

<MainService> : <S2> : <S3> : <S4> : <S5> : <Duration> | <Normal text reply>

Format Rules:
- All keywords (before the '|') must be lowercase, no spaces around colons.
- Always 6 keyword slots before the pipe.
- If a slot is unknown or not provided, use 'none'.
- Duration is in nights for stay-in services, or days for day-out and event services. If no duration is given, use 'none'.
- Quantities and durations must be in words whenever possible.
- Do not output dates or times in the keyword slots.
- Never invent data the user did not provide.
- Do not merge slots; each slot must remain separate.
- Even for SYSTEM messages, follow this exact format, with 'system' as the MainService and all other slots = none unless clearly specified.

MainService options:
- greetings, room, dayout, restaurant, hotelinfo, event, system

Global feature keywords:
- hotwater, wifi, dryer, tv, roomservice, meals, poolaccess, parking, towels, locker, takeaway, buffet, sound, projector, stage, catering, seaview, gardenview, changingroom

Slot meanings per service:
1) room
S2 = quantity of guests: one..ten OR 'roominfo'
S3 = roomtype: standard, deluxe, family, suite, dorm, none
S4 = feature1 or none
S5 = feature2 or none
Duration = one..ten or none

2) dayout
S2 = quantity or none
S3 = activitytype: poolday, sightseeing, sports, spa, bbq, beachday, none
S4 = feature1 or none
S5 = feature2 or none
Duration = one..ten or none

3) restaurant
S2 = quantity or none
S3 = mealtype: breakfast, lunch, dinner, snack, drinks, none
S4 = cuisine or special: seafood, vegetarian, vegan, bbq, desserts, none
S5 = service: roomservice, takeaway, buffet, none
Duration = none

4) hotelinfo
S2 = infotype: facilities, rules, pricing, availability, contact, location, none
S3 = extra filter: pool, wifi, restaurant, hotwater, parking, none
S4 = none
S5 = none
Duration = none

5) event
S2 = eventtype: wedding, birthday, conference, meeting, party, none
S3 = quantity or none
S4 = facility: projector, stage, sound, catering, poolaccess, none
S5 = second facility or none
Duration = one..ten or none

6) greetings
S2-S5 = none
Duration = none

7) system
S2-S5 = none unless explicitly provided by system event
Duration = none unless explicitly provided

Hotel Information:
- Name: Leisure Land Villas
- Location: Leisure Land Villa, Kalahe, Galle, Sri Lanka
- Opens for day-out customers: 8:30 A.M.
- Opens for stay-in customers: 6:00 A.M.
- Pool hours (stay-in): from 6:00 A.M.
- Pool hours (day-out): until 6:00 P.M.
- Restaurant hours: 5:30 A.M.-11:00 P.M. (stay-in), 8:30 A.M.-11:00 P.M. (public)
- Pools: 2 shared pools, 1 private pool (selected rooms), 1 private jacuzzi (suite only)

When the user asks for a room for a certain group size, choose the best room type and mention the fit naturally in the text response.
When the user asks for room info in general, use room : roominfo : none : none : none : none.
When the user asks for a restaurant, day-out, hotel info, or event topic, classify it cleanly and keep the response short and helpful.

Additional behavior rules:
- Always try to fill as many keyword slots as possible from the user's message and the visible page context.
- If an important slot is still missing, ask a short follow-up question that targets that missing slot.
- Be proactive. Do not stop at a generic answer if you can ask the next useful question.
- For room requests, if guest count is missing, ask for the number of guests.
- For room requests with guest count known, suggest the best-fit room naturally and ask whether that option looks good.
- For restaurant requests with no meal type, ask whether they want breakfast, lunch, dinner, snacks, or drinks.
- For event requests with no event type, ask whether it is for a wedding, birthday, conference, meeting, or party.
- For day-out requests with no activity type, ask what kind of day-out experience they want.`;

const conversationHistory = [];
let lastUiAction = { mainService: "greetings", filters: {} };

const WORD_TO_NUMBER = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10
};

function getCurrentUiContextSafe() {
    if (typeof window.getCurrentUiContext === "function") {
        return window.getCurrentUiContext();
    }

    return {
        section: lastUiAction.mainService || "greetings",
        mode: "landing",
        title: "",
        selectedId: null,
        filters: { ...(lastUiAction.filters || {}) }
    };
}

function buildUiContextInstruction() {
    const currentContext = getCurrentUiContextSafe();
    const filters = currentContext.filters || {};
    const filterSummary = Object.keys(filters).length
        ? JSON.stringify(filters)
        : "none";

    return `Current visible page context:
- section: ${currentContext.section || "greetings"}
- mode: ${currentContext.mode || "landing"}
- title: ${currentContext.title || "none"}
- selected id: ${currentContext.selectedId || "none"}
- filters: ${filterSummary}

Follow-up behavior:
- If the user refers to "this", "that", "current", "more information", "more details", or asks a follow-up about the visible page, keep the response tied to the current section instead of switching sections.
- Use 'greetings' only for real greetings or landing-page intent, not for follow-up questions about the current page.
- If the current page already matches the user's request, answer normally without forcing a new section change.`;
}

function routeUiByIntent(action) {
    const mainService = (action.mainService || "").toLowerCase();

    switch (mainService) {
        case "room":
            if (action.roomInfoOnly) {
                loadRoomInfoPanel();
                break;
            }

            if (action.filters && Object.keys(action.filters).length) {
                applyRoomFilter(action.filters);
            } else {
                loadRoomInfoPanel();
            }
            break;
        case "dayout":
            loadDayout(action.dayoutId || 0);
            break;
        case "restaurant":
            loadRestaurantInfo(action.restaurantId || 0);
            break;
        case "hotelinfo":
            loadMainHotelInfo();
            break;
        case "event":
            loadEventInfo(action.eventId || 0);
            break;
        case "greetings":
            loadGreetings();
            break;
        default:
            break;
    }
}

function hasExplicitNavigationIntent(text) {
    return /\b(show|open|go to|take me|switch|change|browse|see|view|back to|return to|bring me to)\b/i.test(text);
}

function isContextualFollowUp(messageText, currentContext = getCurrentUiContextSafe()) {
    const lower = messageText.toLowerCase().trim();

    if (!lower || currentContext.section === "greetings") {
        return false;
    }

    const followUpPattern = /\b(this|that|current|more info|more information|more details|tell me more|explain this|about this|on this|for this|price of this|details of this)\b/;
    const questionPattern = /^(can you|could you|what|which|when|where|why|how|is there|does it|do you|tell me)/;

    return followUpPattern.test(lower) || (questionPattern.test(lower) && !hasExplicitNavigationIntent(lower));
}

function isGenericGreetingReply(parsedReply) {
    return !!parsedReply
        && (parsedReply.keywordArray[0] || "") === "greetings"
        && /hello|assist you today/i.test(parsedReply.messageText || "");
}

function getCurrentRoomContext() {
    const currentContext = getCurrentUiContextSafe();

    if (currentContext.section !== "room" || !currentContext.selectedId) {
        return null;
    }

    return roomInfo.find((room) => room.roomid === Number(currentContext.selectedId)) || null;
}

function buildContextualReply(currentContext = getCurrentUiContextSafe()) {
    if (currentContext.section === "room") {
        const room = getCurrentRoomContext();

        if (room) {
            return parseAssistantReply(`room : ${Object.keys(WORD_TO_NUMBER).find((key) => WORD_TO_NUMBER[key] === room.capacity) || "none"} : ${room.roomType || "none"} : ${room.features[0] || "none"} : ${room.features[1] || "none"} : none | ${room.roomName} is designed for ${room.capacityString.toLowerCase()}, includes ${room.features.join(", ")}, and starts at ${room.price}.`);
        }

        return parseAssistantReply("room : roominfo : none : none : none : none | You are looking at our room options now. Tell me the guest count, room type, or features you want and I will narrow them down.");
    }

    if (currentContext.section === "restaurant") {
        return parseAssistantReply("restaurant : none : none : none : none : none | You are already viewing the restaurant section. I can help with menu style, dining hours, or meal suggestions from this page.");
    }

    if (currentContext.section === "dayout") {
        return parseAssistantReply("dayout : none : none : none : none : none | You are on a day-out package now. I can explain the inclusions, timing, and who this package suits best.");
    }

    if (currentContext.section === "event") {
        return parseAssistantReply("event : none : none : none : none : none | You are viewing an event package now. I can explain capacity, included facilities, and how the setup works.");
    }

    if (currentContext.section === "hotelinfo") {
        return parseAssistantReply("hotelinfo : facilities : none : none : none : none | You are already in the hotel information section. Ask about opening hours, facilities, contact details, or location.");
    }

    return parseAssistantReply("greetings : none : none : none : none : none | Hello. How can I assist you today?");
}

function areRoomFiltersEqual(nextFilters = {}, currentFilters = {}) {
    const nextKeys = Object.keys(nextFilters);
    const currentKeys = Object.keys(currentFilters);

    if (nextKeys.length !== currentKeys.length) {
        return false;
    }

    return nextKeys.every((key) => nextFilters[key] === currentFilters[key]);
}

function shouldChangeUi(action, messageText, currentContext = getCurrentUiContextSafe()) {
    if (!action || !action.mainService) {
        return false;
    }

    if (isContextualFollowUp(messageText, currentContext)) {
        return false;
    }

    if (action.mainService === "greetings") {
        return currentContext.section === "greetings" ? false : hasExplicitNavigationIntent(messageText);
    }

    if (action.mainService !== currentContext.section) {
        return true;
    }

    if (action.mainService === "room") {
        if (action.roomInfoOnly && currentContext.mode === "category") {
            return false;
        }

        if (currentContext.mode === "detail" && !Object.keys(action.filters || {}).length) {
            return false;
        }

        return !areRoomFiltersEqual(action.filters || {}, currentContext.filters || {});
    }

    if (action.mainService === "dayout" || action.mainService === "restaurant" || action.mainService === "event") {
        const nextId = action.dayoutId ?? action.restaurantId ?? action.eventId ?? null;

        if (nextId === null && currentContext.mode === "detail") {
            return false;
        }

        return nextId !== null && Number(nextId) !== Number(currentContext.selectedId);
    }

    return false;
}

function refineReplyForCurrentContext(messageText, parsedReply) {
    const currentContext = getCurrentUiContextSafe();

    if (isContextualFollowUp(messageText, currentContext) && (isGenericGreetingReply(parsedReply) || (parsedReply.keywordArray[0] || "") !== currentContext.section)) {
        return buildContextualReply(currentContext);
    }

    if ((parsedReply.keywordArray[0] || "") === "greetings" && currentContext.section !== "greetings" && !/^\s*(hi|hello|hey)\b/i.test(messageText)) {
        return buildContextualReply(currentContext);
    }

    return parsedReply;
}

function extractResponseText(apiResponse) {
    const candidate = apiResponse && apiResponse.candidates && apiResponse.candidates[0];
    const parts = candidate && candidate.content && candidate.content.parts;

    if (!parts || !parts.length) {
        return "";
    }

    return parts
        .map((part) => part.text || "")
        .join("")
        .trim();
}

function parseAssistantReply(fullResponse) {
    const segments = fullResponse.split("|");
    const keywordText = (segments[0] || "").trim();
    const messageText = (segments.slice(1).join("|") || fullResponse).trim();
    const keywordArray = keywordText.split(":").map((item) => item.trim().toLowerCase());

    return {
        fullResponse,
        messageText,
        keywordArray
    };
}

function normalizeNumericWord(value) {
    if (!value) {
        return null;
    }

    const cleanValue = String(value).trim().toLowerCase();

    if (/^\d+$/.test(cleanValue)) {
        return Number(cleanValue);
    }

    return WORD_TO_NUMBER[cleanValue] || null;
}

function numberToWord(value) {
    const numericValue = Number(value);
    const entry = Object.entries(WORD_TO_NUMBER).find((item) => item[1] === numericValue);
    return entry ? entry[0] : "none";
}

function detectBedCount(text) {
    const match = text.toLowerCase().match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*[- ]?(bed|beds|bedroom|bedrooms)\b/);
    return match ? normalizeNumericWord(match[1]) : null;
}

function detectGuestCount(text) {
    const match = text.toLowerCase().match(/\b(?:for\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(guest|guests|adult|adults|person|people)\b/);
    return match ? normalizeNumericWord(match[1]) : null;
}

function detectRoomQuantityHint(text) {
    const lower = text.toLowerCase().trim();
    const explicitRoomMatch = lower.match(/\b(?:room|rooms|suite|suites|stay|stays)\s+for\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/);

    if (explicitRoomMatch) {
        return normalizeNumericWord(explicitRoomMatch[1]);
    }

    const shortMatch = lower.match(/\bfor\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/);

    if (shortMatch && (lower.includes("room") || lower.includes("suite"))) {
        return normalizeNumericWord(shortMatch[1]);
    }

    return null;
}

function isBareNumberMessage(text) {
    return /^(\d+|one|two|three|four|five|six|seven|eight|nine|ten)$/.test(text.toLowerCase().trim());
}

function detectRoomTypeFromText(text) {
    const lower = text.toLowerCase();

    if (lower.includes("standard")) {
        return "standard";
    }

    if (lower.includes("deluxe")) {
        return "deluxe";
    }

    if (lower.includes("family")) {
        return "family";
    }

    if (lower.includes("suite")) {
        return "suite";
    }

    if (lower.includes("dorm")) {
        return "dorm";
    }

    return null;
}

function detectFeatureFromText(text) {
    const featureMatchers = [
        ["wifi", /\bwifi\b|\bwi-fi\b/],
        ["hotwater", /\bhot water\b|\bhotwater\b/],
        ["poolaccess", /\bpool\b/],
        ["roomservice", /\broom service\b|\broomservice\b/],
        ["seaview", /\bsea view\b|\bocean view\b|\bseaview\b/],
        ["gardenview", /\bgarden view\b|\bgardenview\b/],
        ["parking", /\bparking\b/],
        ["tv", /\btv\b|\btelevision\b/],
        ["takeaway", /\btakeaway\b/],
        ["buffet", /\bbuffet\b/]
    ];

    const lower = text.toLowerCase();
    const match = featureMatchers.find((item) => item[1].test(lower));

    return match ? match[0] : null;
}

function detectMainServiceFromText(text) {
    const lower = text.toLowerCase();

    if (isBareNumberMessage(text) && lastUiAction.mainService) {
        return lastUiAction.mainService;
    }

    if (lower.includes("day out") || lower.includes("dayout") || lower.includes("bbq") || lower.includes("pool day")) {
        return "dayout";
    }

    if (lower.includes("restaurant") || lower.includes("breakfast") || lower.includes("lunch") || lower.includes("dinner") || lower.includes("drink")) {
        return "restaurant";
    }

    if (lower.includes("event") || lower.includes("wedding") || lower.includes("birthday") || lower.includes("conference") || lower.includes("meeting") || lower.includes("party")) {
        return "event";
    }

    if (lower.includes("hotel info") || lower.includes("facilities") || lower.includes("location") || lower.includes("contact")) {
        return "hotelinfo";
    }

    if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
        return "greetings";
    }

    if (lower.includes("room") || lower.includes("suite") || lower.includes("bed")) {
        return "room";
    }

    if (lastUiAction.mainService === "room" && (detectRoomTypeFromText(text) || detectFeatureFromText(text))) {
        return "room";
    }

    return "greetings";
}

function getBestMatchingRoom(filters = {}) {
    const matches = roomInfo.filter((room) => {
        if (filters.roomType && room.roomType !== filters.roomType) {
            return false;
        }

        if (filters.minCapacity && room.capacity < filters.minCapacity) {
            return false;
        }

        if (filters.bedCount && room.bedCount < filters.bedCount) {
            return false;
        }

        if (filters.feature && !room.features.includes(filters.feature)) {
            return false;
        }

        return true;
    });

    return matches.length ? matches[0] : null;
}

function buildGuidedReply(messageText, parsedReply) {
    const action = inferUiActionFromMessage(messageText, parsedReply);
    const mainService = action.mainService;

    if (mainService === "room") {
        if (action.roomInfoOnly) {
            return parseAssistantReply("room : roominfo : none : none : none : none | I can walk you through the room types. How many guests are you planning for?");
        }

        if (!action.filters.minCapacity) {
            return parseAssistantReply("room : none : none : none : none : none | How many guests will be staying? Once I have that, I can match you with the best room option.");
        }

        const bestRoom = getBestMatchingRoom(action.filters);

        if (bestRoom) {
            const guestWord = numberToWord(action.filters.minCapacity);
            const primaryFeature = action.filters.feature || bestRoom.features[0] || "none";
            const secondaryFeature = bestRoom.features.find((feature) => feature !== primaryFeature) || "none";

            return parseAssistantReply(`room : ${guestWord} : ${bestRoom.roomType || "none"} : ${primaryFeature} : ${secondaryFeature} : none | For ${guestWord} guests, ${bestRoom.roomName} looks like the best fit. I have lined it up for you now. Does this room look good, or would you like a different style?`);
        }

        return parseAssistantReply(`room : ${numberToWord(action.filters.minCapacity)} : ${action.filters.roomType || "none"} : ${action.filters.feature || "none"} : none : none | I could not find an exact match for that combination yet. Would you like me to broaden the room type or feature requirements?`);
    }

    if (mainService === "restaurant") {
        const mealType = parsedReply.keywordArray[2];

        if (!mealType || mealType === "none") {
            return parseAssistantReply("restaurant : none : none : none : none : none | Are you looking for breakfast, lunch, dinner, snacks, or drinks? I can open the right menu once you choose.");
        }
    }

    if (mainService === "dayout") {
        const activityType = parsedReply.keywordArray[2];

        if (!activityType || activityType === "none") {
            return parseAssistantReply("dayout : none : none : none : none : none | What kind of day-out are you after: pool day, BBQ, sightseeing, sports, spa, or beach day?");
        }
    }

    if (mainService === "event") {
        const eventType = parsedReply.keywordArray[1];

        if (!eventType || eventType === "none") {
            return parseAssistantReply("event : none : none : none : none : none | What kind of event are you planning: a wedding, birthday, conference, meeting, or party?");
        }
    }

    if (mainService === "hotelinfo") {
        const infoType = parsedReply.keywordArray[1];

        if (!infoType || infoType === "none") {
            return parseAssistantReply("hotelinfo : none : none : none : none : none | What would you like to know about the hotel: facilities, rules, pricing, availability, contact, or location?");
        }
    }

    return parsedReply;
}

function inferUiActionFromMessage(messageText, parsedReply) {
    const keywordArray = parsedReply ? parsedReply.keywordArray : [];
    const lowerText = messageText.toLowerCase();
    const mainService = keywordArray[0] || detectMainServiceFromText(messageText);
    const filters = {};

    if (mainService === "room") {
        const quantity = normalizeNumericWord(keywordArray[1])
            || detectGuestCount(messageText)
            || detectRoomQuantityHint(messageText)
            || (isBareNumberMessage(messageText) && lastUiAction.mainService === "room" ? normalizeNumericWord(messageText) : null);
        const roomType = keywordArray[2] && keywordArray[2] !== "none" ? keywordArray[2] : detectRoomTypeFromText(messageText);
        const featureOne = keywordArray[3] && keywordArray[3] !== "none" ? keywordArray[3] : null;
        const featureTwo = keywordArray[4] && keywordArray[4] !== "none" ? keywordArray[4] : null;
        const bedCount = detectBedCount(messageText);
        const localFeature = detectFeatureFromText(messageText);

        if (roomType && roomType !== "roominfo") {
            filters.roomType = roomType;
        }

        if (quantity) {
            filters.minCapacity = quantity;
        }

        if (bedCount) {
            filters.bedCount = bedCount;
        }

        if (featureOne) {
            filters.feature = featureOne;
        } else if (featureTwo) {
            filters.feature = featureTwo;
        } else if (localFeature) {
            filters.feature = localFeature;
        }

        return {
            mainService,
            filters,
            roomInfoOnly: keywordArray[1] === "roominfo" || lowerText.includes("room info")
        };
    }

    if (mainService === "restaurant") {
        const mealType = keywordArray[2];
        const restaurantMap = {
            breakfast: 0,
            lunch: 1,
            dinner: 1,
            snack: 2,
            drinks: 2
        };

        return {
            mainService,
            restaurantId: restaurantMap[mealType] || 0
        };
    }

    if (mainService === "dayout") {
        const activityType = keywordArray[2];
        const dayoutMap = {
            poolday: 0,
            bbq: 1,
            sightseeing: 2,
            sports: 2,
            spa: 0,
            beachday: 2
        };

        return {
            mainService,
            dayoutId: dayoutMap[activityType] || 0
        };
    }

    if (mainService === "event") {
        const eventType = keywordArray[1];
        const eventMap = {
            wedding: 0,
            conference: 1,
            meeting: 1,
            birthday: 2,
            party: 2
        };

        return {
            mainService,
            eventId: eventMap[eventType] || 0
        };
    }

    return { mainService };
}

function buildFallbackReply(messageText) {
    const action = inferUiActionFromMessage(messageText, null);
    const bestRoom = action.mainService === "room" ? getBestMatchingRoom(action.filters) : null;
    const responses = {
        room: bestRoom
            ? `room : ${action.filters.minCapacity ? Object.keys(WORD_TO_NUMBER).find((key) => WORD_TO_NUMBER[key] === action.filters.minCapacity) || "none" : "none"} : ${bestRoom.roomType || "none"} : ${action.filters.feature || "none"} : none : none | A good match is ${bestRoom.roomName} for ${bestRoom.capacityString.toLowerCase()} at ${bestRoom.price}.`
            : "room : none : none : none : none : none | I can help with rooms. Tell me your guest count, room type, or how many beds you need.",
        dayout: "dayout : none : none : none : none : none | I can show our day-out packages and help you compare them.",
        restaurant: "restaurant : none : none : none : none : none | I can guide you through breakfast, mains, drinks, and takeaway options.",
        hotelinfo: "hotelinfo : facilities : none : none : none : none | I can show the main hotel information including hours, facilities, and contact details.",
        event: "event : none : none : none : none : none | I can show sample event packages for weddings, conferences, and birthdays.",
        greetings: "greetings : none : none : none : none : none | Hello. How can I assist you today?"
    };

    return parseAssistantReply(responses[action.mainService] || responses.greetings);
}

async function generateHotelReply(messageText) {
    if (!GEMINI_API_KEY) {
        throw new Error("Missing Gemini API key in script.js.");
    }

    const requestBody = {
        system_instruction: {
            parts: [
                {
                    text: HOTEL_SYSTEM_INSTRUCTION
                },
                {
                    text: buildUiContextInstruction()
                }
            ]
        },
        contents: [
            ...conversationHistory,
            {
                role: "user",
                parts: [
                    {
                        text: messageText
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.1,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 140
        }
    };

    const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
        const apiMessage = data && data.error && data.error.message
            ? data.error.message
            : "Unknown Gemini API error.";
        throw new Error(apiMessage);
    }

    const fullResponse = extractResponseText(data);

    if (!fullResponse) {
        throw new Error("Gemini returned an empty response.");
    }

    conversationHistory.push(
        {
            role: "user",
            parts: [
                {
                    text: messageText
                }
            ]
        },
        {
            role: "model",
            parts: [
                {
                    text: fullResponse
                }
            ]
        }
    );

    return parseAssistantReply(fullResponse);
}

async function handleAssistantFlow(messageText, options = {}) {
    let parsedReply;
    const currentContext = getCurrentUiContextSafe();

    try {
        parsedReply = await generateHotelReply(messageText);
    } catch (error) {
        console.error("Gemini API error:", error);
        parsedReply = buildFallbackReply(messageText);
        parsedReply = refineReplyForCurrentContext(messageText, parsedReply);
        parsedReply = buildGuidedReply(messageText, parsedReply);

        const fallbackAction = inferUiActionFromMessage(messageText, parsedReply);
        const fallbackShouldChangeUi = shouldChangeUi(fallbackAction, messageText, currentContext);
        lastUiAction = fallbackShouldChangeUi ? fallbackAction : {
            mainService: currentContext.section,
            filters: currentContext.filters || {}
        };

        if (!options.silentError) {
            if (fallbackShouldChangeUi && typeof window.resetChatVisual === "function") {
                window.resetChatVisual(messageText);
            }
            if (fallbackShouldChangeUi) {
                routeUiByIntent(fallbackAction);
            }
            sendBotMessage(parsedReply.messageText);
            return;
        }
    }

    parsedReply = refineReplyForCurrentContext(messageText, parsedReply);
    parsedReply = buildGuidedReply(messageText, parsedReply);

    const action = inferUiActionFromMessage(messageText, parsedReply);
    const uiShouldChange = shouldChangeUi(action, messageText, currentContext);
    lastUiAction = uiShouldChange ? action : {
        mainService: currentContext.section,
        filters: currentContext.filters || {}
    };

    if (uiShouldChange && !options.silentReply && typeof window.resetChatVisual === "function") {
        window.resetChatVisual(messageText);
    }

    if (uiShouldChange) {
        routeUiByIntent(action);
    }

    if (!options.silentReply) {
        sendBotMessage(parsedReply.messageText);
    }
}

async function sendHotelMessage() {
    const input = document.getElementById("chatInput");
    const messageText = (input.value || "").trim();

    if (!messageText) {
        return;
    }

    sendMessage();
    await handleAssistantFlow(messageText);
}

async function sendSystemMessage(inputMessage) {
    const messageText = (inputMessage || "").trim();

    if (!messageText) {
        return;
    }

    await handleAssistantFlow(messageText, { silentError: true });
}

window.HOTEL_SYSTEM_INSTRUCTION = HOTEL_SYSTEM_INSTRUCTION;
window.sendHotelMessage = sendHotelMessage;
window.sendSystemMessage = sendSystemMessage;

window.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("chatInput");

    if (chatInput) {
        chatInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                sendHotelMessage();
            }
        });
    }
});
