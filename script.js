const GEMINI_API_KEY = "";
const CONTROLLER_MODEL = "gemini-2.5-flash";
const CONVERSATION_MODEL = "gemini-2.5-pro";

const HOTEL_CONTROLLER_SYSTEM_INSTRUCTION = `You are the routing and slot-filling controller for Leisure Land Villas.

You MUST reply in EXACTLY this format and nothing else:
<MainService> : <S2> : <S3> : <S4> : <S5> : <Duration>

Rules:
- Output only the 6-slot control line.
- All values must be lowercase.
- Use 'none' when a slot is unknown.
- Fill as many slots as you confidently can from the user message and current page context.
- If the user is clearly continuing the same topic, keep the same main service.
- Do not switch to greetings for follow-up questions about the current page.
- Do not write explanations, greetings, or natural language.

MainService options:
- greetings, room, dayout, restaurant, hotelinfo, event, system

Service slots:
1) room
- S2 = guests: one..ten or roominfo
- S3 = roomtype: standard, deluxe, family, suite, dorm, none
- S4 = feature1: wifi, hotwater, poolaccess, roomservice, seaview, gardenview, parking, tv, none
- S5 = feature2 or none
- Duration = one..ten or none

2) dayout
- S2 = quantity or none
- S3 = activitytype: poolday, sightseeing, sports, spa, bbq, beachday, none
- S4 = feature1: poolaccess, locker, changingroom, towels, bbq, none
- S5 = feature2 or none
- Duration = one..ten or none

3) restaurant
- S2 = quantity or none
- S3 = mealtype: breakfast, lunch, dinner, snack, drinks, none
- S4 = cuisine or special: seafood, vegetarian, vegan, bbq, desserts, none
- S5 = service: roomservice, takeaway, buffet, none
- Duration = none

4) hotelinfo
- S2 = infotype: facilities, rules, pricing, availability, contact, location, none
- S3 = extra filter: pool, wifi, restaurant, hotwater, parking, none
- S4 = none
- S5 = none
- Duration = none

5) event
- S2 = eventtype: wedding, birthday, conference, meeting, party, none
- S3 = quantity or none
- S4 = facility: projector, stage, sound, catering, poolaccess, none
- S5 = second facility or none
- Duration = one..ten or none

6) greetings
- S2-S5 = none
- Duration = none

7) system
- S2-S5 = none unless the system message clearly implies a service and slot fill
- Duration = none unless clearly provided`;

const HOTEL_CONVERSATION_SYSTEM_INSTRUCTION = `You are the conversational hotel assistant for Leisure Land Villas.

Rules:
- Reply in natural plain text only.
- Never output slot strings or control syntax.
- Sound warm, clear, and proactive.
- If a key slot is already known, do not ask for it again.
- Ask only the next most useful missing question.
- If enough information is known, recommend a concrete room, package, menu section, or event setup.
- Stay focused on the current page and current topic unless the controller clearly changed the service.
- Keep replies concise and helpful.`;

const conversationHistory = [];
let lastUiAction = { mainService: "greetings", filters: {} };
let currentAiFocus = {
    section: "greetings",
    mode: "landing",
    title: "Welcome to Leisure Land Villa",
    selectedId: null,
    filters: {}
};

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

const SLOT_MEMORY_LABELS = {
    room: ["guests", "roomtype", "feature1", "feature2", "duration"],
    dayout: ["quantity", "activitytype", "feature1", "feature2", "duration"],
    restaurant: ["quantity", "mealtype", "cuisine", "service", "duration"],
    hotelinfo: ["infotype", "filter", "slot4", "slot5", "duration"],
    event: ["eventtype", "quantity", "facility1", "facility2", "duration"]
};

let controllerSlotMemory = createEmptySlotMemory();

function createEmptySlotMemory() {
    return {
        room: ["none", "none", "none", "none", "none"],
        dayout: ["none", "none", "none", "none", "none"],
        restaurant: ["none", "none", "none", "none", "none"],
        hotelinfo: ["none", "none", "none", "none", "none"],
        event: ["none", "none", "none", "none", "none"]
    };
}

function getModelApiUrl(model) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

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

function buildHomeFocusPrompt() {
    return `The user is currently at the home/start page.
- Focus on general hotel guidance and help them choose between rooms, day-out packages, restaurant, hotel information, or events.
- If they are unsure, gently guide them toward the next best section.
- Use the home page as the default overview context.`;
}

function buildRoomFocusPrompt(context) {
    if (context.mode === "detail" && context.selectedId) {
        const room = roomInfo.find((item) => item.roomid === Number(context.selectedId));

        if (room) {
            return `The user is currently viewing a room detail page.
- Focus on this room first: ${room.roomName}.
- Room type: ${room.roomType}.
- Capacity: ${room.capacityString}.
- Bed setup: ${room.bed}.
- Price: ${room.price}.
- Features: ${room.features.join(", ")}.
- Inclusions: ${room.freePerks}.
- Amenities: ${room.amenities}.
- Cancellation: ${room.Cancellation}.`;
        }
    }

    if (context.mode === "category") {
        const roomCategories = roomInfoList.map((item) => `${item.name}: ${item.capacity}, ${item.price}, ${item.summary}`).join(" | ");
        return `The user is currently in the rooms category section.
- Available room categories: ${roomCategories}.
- Focus on helping them choose a room style and guest fit.`;
    }

    const filteredRoomSummary = getBestMatchingRoom(context.filters || {});
    return `The user is currently in the rooms section.
- Current filters: ${JSON.stringify(context.filters || {})}.
- Best current room match: ${filteredRoomSummary ? `${filteredRoomSummary.roomName} (${filteredRoomSummary.price})` : "none yet"}.
- Keep answers centered on room selection, guest count, bed setup, and features.`;
}

function buildDayoutFocusPrompt(context) {
    const selectedPack = dayoutPackages.find((item) => item.id === Number(context.selectedId)) || dayoutPackages[0];

    return `The user is currently in the day-out section.
- Active package: ${selectedPack.name}.
- Duration: ${selectedPack.duration}.
- Price: ${selectedPack.price}.
- Highlights: ${selectedPack.highlights.join(", ")}.
- Summary: ${selectedPack.summary}.`;
}

function buildRestaurantFocusPrompt(context) {
    const selectedSection = restaurantSections.find((item) => item.id === Number(context.selectedId)) || restaurantSections[0];
    const itemSummary = selectedSection.items.map((item) => `${item.name} (${item.price}, ${item.tag})`).join(" | ");

    return `The user is currently in the restaurant section.
- Focus on ${selectedSection.name}.
- Meal type: ${selectedSection.mealType}.
- Summary: ${selectedSection.summary}.
- Visible menu items: ${itemSummary}.
- Restaurant hours: stay-in guests 5:30 A.M. to 11:00 P.M., public dining from 8:30 A.M. to 11:00 P.M.
- Service styles available: buffet, room service, takeaway.`;
}

function buildHotelInfoFocusPrompt() {
    const infoSummary = hotelInfoCards.map((item) => `${item.title}: ${item.value}`).join(" | ");

    return `The user is currently in the hotel information section.
- Focus on operational details and general hotel facts.
- Key information: ${infoSummary}.`;
}

function buildEventFocusPrompt(context) {
    const selectedEvent = eventPackages.find((item) => item.id === Number(context.selectedId)) || eventPackages[0];

    return `The user is currently in the events section.
- Focus on the active event package: ${selectedEvent.name}.
- Event type: ${selectedEvent.eventType}.
- Capacity: ${selectedEvent.capacity}.
- Price: ${selectedEvent.price}.
- Features: ${selectedEvent.features.join(", ")}.
- Summary: ${selectedEvent.summary}.`;
}

function buildCurrentSectionFocusPrompt(context = getCurrentUiContextSafe()) {
    switch (context.section) {
        case "room":
            return buildRoomFocusPrompt(context);
        case "dayout":
            return buildDayoutFocusPrompt(context);
        case "restaurant":
            return buildRestaurantFocusPrompt(context);
        case "hotelinfo":
            return buildHotelInfoFocusPrompt();
        case "event":
            return buildEventFocusPrompt(context);
        case "greetings":
        default:
            return buildHomeFocusPrompt();
    }
}

function setAiSectionFocus(context = {}) {
    currentAiFocus = {
        section: context.section || "greetings",
        mode: context.mode || "landing",
        title: context.title || "",
        selectedId: context.selectedId ?? null,
        filters: { ...(context.filters || {}) }
    };
}

function buildSlotMemoryInstruction(service = null) {
    if (!service || !SLOT_MEMORY_LABELS[service]) {
        return "No remembered slot values.";
    }

    const labels = SLOT_MEMORY_LABELS[service];
    const values = controllerSlotMemory[service];

    return labels
        .map((label, index) => `- ${label}: ${values[index] || "none"}`)
        .join("\n");
}

function buildUiContextInstruction() {
    const currentContext = {
        ...getCurrentUiContextSafe(),
        ...currentAiFocus
    };
    const filters = currentContext.filters || {};
    const filterSummary = Object.keys(filters).length
        ? JSON.stringify(filters)
        : "none";
    const sectionFocusPrompt = buildCurrentSectionFocusPrompt(currentContext);
    const memoryPrompt = buildSlotMemoryInstruction(currentContext.section);

    return `Current visible page context:
- section: ${currentContext.section || "greetings"}
- mode: ${currentContext.mode || "landing"}
- title: ${currentContext.title || "none"}
- selected id: ${currentContext.selectedId ?? "none"}
- filters: ${filterSummary}

Follow-up behavior:
- If the user refers to "this", "that", "current", "more information", "more details", or asks a follow-up about the visible page, keep the response tied to the current section instead of switching sections.
- Use 'greetings' only for real greetings or landing-page intent, not for follow-up questions about the current page.
- If the current page already matches the user's request, answer normally without forcing a new section change.

Remembered slot memory for the active service:
${memoryPrompt}

Section focus prompt:
${sectionFocusPrompt}`;
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
            loadDayout(action.dayoutId ?? 0);
            break;
        case "restaurant":
            loadRestaurantInfo(action.restaurantId ?? 0);
            break;
        case "hotelinfo":
            loadMainHotelInfo();
            break;
        case "event":
            loadEventInfo(action.eventId ?? 0);
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

function detectDurationWord(text) {
    const lower = text.toLowerCase();
    const match = lower.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(night|nights|day|days)\b/);

    if (match) {
        return numberToWord(normalizeNumericWord(match[1]));
    }

    if (/\bfull day\b/.test(lower)) {
        return "one";
    }

    return null;
}

function detectBedCount(text) {
    const match = text.toLowerCase().match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*[- ]?(bed|beds|bedroom|bedrooms)\b/);
    return match ? normalizeNumericWord(match[1]) : null;
}

function detectGuestCount(text) {
    const match = text.toLowerCase().match(/\b(?:for\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(guest|guests|adult|adults|person|people)\b/);
    return match ? normalizeNumericWord(match[1]) : null;
}

function detectGenericQuantityWord(text, currentContext = getCurrentUiContextSafe()) {
    const explicitGuestCount = detectGuestCount(text);

    if (explicitGuestCount) {
        return numberToWord(explicitGuestCount);
    }

    if (isBareNumberMessage(text) && currentContext.section !== "greetings") {
        return numberToWord(normalizeNumericWord(text));
    }

    const match = text.toLowerCase().match(/\bfor\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/);
    return match ? numberToWord(normalizeNumericWord(match[1])) : null;
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

function detectEventTypeFromText(text) {
    const lower = text.toLowerCase();

    if (lower.includes("birthday")) {
        return "birthday";
    }

    if (lower.includes("wedding")) {
        return "wedding";
    }

    if (lower.includes("conference")) {
        return "conference";
    }

    if (lower.includes("meeting")) {
        return "meeting";
    }

    if (lower.includes("party")) {
        return "party";
    }

    return null;
}

function detectEventFacilityFromText(text) {
    const lower = text.toLowerCase();

    if (lower.includes("projector")) {
        return "projector";
    }

    if (lower.includes("stage")) {
        return "stage";
    }

    if (lower.includes("sound")) {
        return "sound";
    }

    if (lower.includes("catering")) {
        return "catering";
    }

    if (lower.includes("pool")) {
        return "poolaccess";
    }

    return null;
}

function detectRestaurantMealTypeFromText(text) {
    const lower = text.toLowerCase();

    if (lower.includes("breakfast")) {
        return "breakfast";
    }

    if (lower.includes("lunch")) {
        return "lunch";
    }

    if (lower.includes("dinner")) {
        return "dinner";
    }

    if (lower.includes("snack") || lower.includes("snacks")) {
        return "snack";
    }

    if (lower.includes("drink") || lower.includes("coffee") || lower.includes("mocktail")) {
        return "drinks";
    }

    return null;
}

function detectRestaurantCuisineFromText(text) {
    const lower = text.toLowerCase();

    if (lower.includes("seafood")) {
        return "seafood";
    }

    if (lower.includes("vegetarian")) {
        return "vegetarian";
    }

    if (lower.includes("vegan")) {
        return "vegan";
    }

    if (lower.includes("bbq") || lower.includes("grill")) {
        return "bbq";
    }

    if (lower.includes("dessert") || lower.includes("cake")) {
        return "desserts";
    }

    return null;
}

function detectRestaurantServiceFromText(text) {
    const lower = text.toLowerCase();

    if (lower.includes("room service") || lower.includes("roomservice")) {
        return "roomservice";
    }

    if (lower.includes("takeaway") || lower.includes("take away")) {
        return "takeaway";
    }

    if (lower.includes("buffet")) {
        return "buffet";
    }

    return null;
}

function detectDayoutActivityTypeFromText(text) {
    const lower = text.toLowerCase();

    if (lower.includes("bbq")) {
        return "bbq";
    }

    if (lower.includes("sightseeing")) {
        return "sightseeing";
    }

    if (lower.includes("sports")) {
        return "sports";
    }

    if (lower.includes("spa")) {
        return "spa";
    }

    if (lower.includes("beach")) {
        return "beachday";
    }

    if (lower.includes("pool day") || lower.includes("poolday") || lower.includes("day out") || lower.includes("dayout") || lower.includes("pool")) {
        return "poolday";
    }

    return null;
}

function detectDayoutFeatureFromText(text) {
    const lower = text.toLowerCase();

    if (lower.includes("changing room") || lower.includes("changingroom")) {
        return "changingroom";
    }

    if (lower.includes("locker")) {
        return "locker";
    }

    if (lower.includes("towel")) {
        return "towels";
    }

    if (lower.includes("bbq")) {
        return "bbq";
    }

    if (lower.includes("pool")) {
        return "poolaccess";
    }

    return null;
}

function detectHotelInfoTypeFromText(text) {
    const lower = text.toLowerCase();

    if (lower.includes("facility") || lower.includes("facilities")) {
        return "facilities";
    }

    if (lower.includes("rule") || lower.includes("rules")) {
        return "rules";
    }

    if (lower.includes("price") || lower.includes("pricing") || lower.includes("rate")) {
        return "pricing";
    }

    if (lower.includes("availability") || lower.includes("available")) {
        return "availability";
    }

    if (lower.includes("contact") || lower.includes("phone") || lower.includes("number")) {
        return "contact";
    }

    if (lower.includes("location") || lower.includes("where") || lower.includes("address")) {
        return "location";
    }

    return null;
}

function detectHotelInfoFilterFromText(text) {
    const lower = text.toLowerCase();

    if (lower.includes("pool")) {
        return "pool";
    }

    if (lower.includes("wifi")) {
        return "wifi";
    }

    if (lower.includes("restaurant")) {
        return "restaurant";
    }

    if (lower.includes("hot water") || lower.includes("hotwater")) {
        return "hotwater";
    }

    if (lower.includes("parking")) {
        return "parking";
    }

    return null;
}

function detectMainServiceFromText(text, currentContext = getCurrentUiContextSafe()) {
    const lower = text.toLowerCase();

    if (isBareNumberMessage(text) && currentContext.section && currentContext.section !== "greetings") {
        return currentContext.section;
    }

    if (detectDayoutActivityTypeFromText(text)) {
        return "dayout";
    }

    if (detectRestaurantMealTypeFromText(text) || lower.includes("restaurant")) {
        return "restaurant";
    }

    if (detectEventTypeFromText(text) || lower.includes("event")) {
        return "event";
    }

    if (detectHotelInfoTypeFromText(text) || lower.includes("hotel info")) {
        return "hotelinfo";
    }

    if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
        return "greetings";
    }

    if (lower.includes("room") || lower.includes("suite") || lower.includes("bed")) {
        return "room";
    }

    if (currentContext.section === "room" && (detectRoomTypeFromText(text) || detectFeatureFromText(text))) {
        return "room";
    }

    if (currentContext.section !== "greetings" && isContextualFollowUp(text, currentContext)) {
        return currentContext.section;
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

function getEventPackageByType(eventType) {
    return eventPackages.find((item) => item.eventType === eventType) || eventPackages[0];
}

function getDayoutPackageByActivityType(activityType) {
    const activityMap = {
        poolday: 0,
        bbq: 1,
        sightseeing: 2,
        sports: 2,
        spa: 0,
        beachday: 2
    };

    return dayoutPackages.find((item) => item.id === (activityMap[activityType] ?? 0)) || dayoutPackages[0];
}

function getRestaurantSectionByMealType(mealType) {
    const mealMap = {
        breakfast: 0,
        lunch: 1,
        dinner: 1,
        snack: 2,
        drinks: 2
    };

    return restaurantSections.find((item) => item.id === (mealMap[mealType] ?? 0)) || restaurantSections[0];
}

function createControllerState(mainService = "greetings", slots = [], rawText = "") {
    const normalizedMainService = String(mainService || "greetings").trim().toLowerCase();
    const normalizedSlots = Array.from({ length: 5 }, (_, index) => {
        const value = slots[index];
        return value ? String(value).trim().toLowerCase() : "none";
    });

    return {
        mainService: normalizedMainService,
        slots: normalizedSlots,
        keywordArray: [normalizedMainService, ...normalizedSlots],
        rawText
    };
}

function controllerStateToString(state) {
    return [state.mainService, ...state.slots].join(" : ");
}

function parseControllerReply(fullResponse) {
    const keywordText = (fullResponse || "").split("|")[0].trim();
    const parts = keywordText.split(":").map((item) => item.trim().toLowerCase());

    return createControllerState(parts[0] || "greetings", [
        parts[1] || "none",
        parts[2] || "none",
        parts[3] || "none",
        parts[4] || "none",
        parts[5] || "none"
    ], keywordText);
}

function getServiceMemory(service) {
    return controllerSlotMemory[service]
        ? [...controllerSlotMemory[service]]
        : ["none", "none", "none", "none", "none"];
}

function saveServiceMemory(service, slots) {
    if (!controllerSlotMemory[service]) {
        return;
    }

    controllerSlotMemory[service] = controllerSlotMemory[service].map((oldValue, index) => {
        const nextValue = slots[index];
        return nextValue && nextValue !== "none" ? nextValue : oldValue;
    });
}

function resolveControllerService(messageText, controllerState, currentContext = getCurrentUiContextSafe()) {
    const localService = detectMainServiceFromText(messageText, currentContext);
    let service = controllerState.mainService;

    if (!service || service === "none" || service === "system") {
        service = localService;
    }

    if (service === "greetings" && localService !== "greetings") {
        service = localService;
    }

    if (currentContext.section !== "greetings" && isContextualFollowUp(messageText, currentContext) && (service === "greetings" || service === "system")) {
        service = currentContext.section;
    }

    return service || "greetings";
}

function fillRoomSlotsFromText(slots, messageText, currentContext) {
    const nextSlots = [...slots];
    const quantity = nextSlots[0] !== "none"
        ? normalizeNumericWord(nextSlots[0])
        : detectGuestCount(messageText) || detectRoomQuantityHint(messageText) || (isBareNumberMessage(messageText) && currentContext.section === "room" ? normalizeNumericWord(messageText) : null);
    const roomType = nextSlots[1] !== "none" ? nextSlots[1] : detectRoomTypeFromText(messageText);
    const feature = detectFeatureFromText(messageText);
    const duration = nextSlots[4] !== "none" ? nextSlots[4] : detectDurationWord(messageText);

    if (quantity) {
        nextSlots[0] = numberToWord(quantity);
    }

    if (roomType) {
        nextSlots[1] = roomType;
    }

    if (feature) {
        if (nextSlots[2] === "none") {
            nextSlots[2] = feature;
        } else if (nextSlots[2] !== feature && nextSlots[3] === "none") {
            nextSlots[3] = feature;
        }
    }

    if (duration) {
        nextSlots[4] = duration;
    }

    return nextSlots;
}

function fillDayoutSlotsFromText(slots, messageText, currentContext) {
    const nextSlots = [...slots];
    const quantity = nextSlots[0] !== "none" ? nextSlots[0] : detectGenericQuantityWord(messageText, currentContext);
    const activity = nextSlots[1] !== "none" ? nextSlots[1] : detectDayoutActivityTypeFromText(messageText);
    const feature = detectDayoutFeatureFromText(messageText);
    const duration = nextSlots[4] !== "none" ? nextSlots[4] : detectDurationWord(messageText);

    if (quantity) {
        nextSlots[0] = quantity;
    }

    if (activity) {
        nextSlots[1] = activity;
    }

    if (feature) {
        if (nextSlots[2] === "none") {
            nextSlots[2] = feature;
        } else if (nextSlots[2] !== feature && nextSlots[3] === "none") {
            nextSlots[3] = feature;
        }
    }

    if (duration) {
        nextSlots[4] = duration;
    }

    return nextSlots;
}

function fillRestaurantSlotsFromText(slots, messageText, currentContext) {
    const nextSlots = [...slots];
    const quantity = nextSlots[0] !== "none" ? nextSlots[0] : detectGenericQuantityWord(messageText, currentContext);
    const mealType = nextSlots[1] !== "none" ? nextSlots[1] : detectRestaurantMealTypeFromText(messageText);
    const cuisine = nextSlots[2] !== "none" ? nextSlots[2] : detectRestaurantCuisineFromText(messageText);
    const service = nextSlots[3] !== "none" ? nextSlots[3] : detectRestaurantServiceFromText(messageText);

    if (quantity) {
        nextSlots[0] = quantity;
    }

    if (mealType) {
        nextSlots[1] = mealType;
    }

    if (cuisine) {
        nextSlots[2] = cuisine;
    }

    if (service) {
        nextSlots[3] = service;
    }

    nextSlots[4] = "none";
    return nextSlots;
}

function fillHotelInfoSlotsFromText(slots, messageText) {
    const nextSlots = [...slots];
    const infoType = nextSlots[0] !== "none" ? nextSlots[0] : detectHotelInfoTypeFromText(messageText);
    const filter = nextSlots[1] !== "none" ? nextSlots[1] : detectHotelInfoFilterFromText(messageText);

    if (infoType) {
        nextSlots[0] = infoType;
    }

    if (filter) {
        nextSlots[1] = filter;
    }

    nextSlots[2] = "none";
    nextSlots[3] = "none";
    nextSlots[4] = "none";

    return nextSlots;
}

function fillEventSlotsFromText(slots, messageText, currentContext) {
    const nextSlots = [...slots];
    const eventType = nextSlots[0] !== "none" ? nextSlots[0] : detectEventTypeFromText(messageText);
    const quantity = nextSlots[1] !== "none" ? nextSlots[1] : detectGenericQuantityWord(messageText, currentContext);
    const facility = detectEventFacilityFromText(messageText);
    const duration = nextSlots[4] !== "none" ? nextSlots[4] : detectDurationWord(messageText);

    if (eventType) {
        nextSlots[0] = eventType;
    }

    if (quantity) {
        nextSlots[1] = quantity;
    }

    if (facility) {
        if (nextSlots[2] === "none") {
            nextSlots[2] = facility;
        } else if (nextSlots[2] !== facility && nextSlots[3] === "none") {
            nextSlots[3] = facility;
        }
    }

    if (duration) {
        nextSlots[4] = duration;
    }

    return nextSlots;
}

function normalizeControllerState(messageText, controllerState, currentContext = getCurrentUiContextSafe()) {
    const mainService = resolveControllerService(messageText, controllerState, currentContext);
    let slots = [...controllerState.slots];

    switch (mainService) {
        case "room":
            slots = fillRoomSlotsFromText(slots, messageText, currentContext);
            break;
        case "dayout":
            slots = fillDayoutSlotsFromText(slots, messageText, currentContext);
            break;
        case "restaurant":
            slots = fillRestaurantSlotsFromText(slots, messageText, currentContext);
            break;
        case "hotelinfo":
            slots = fillHotelInfoSlotsFromText(slots, messageText);
            break;
        case "event":
            slots = fillEventSlotsFromText(slots, messageText, currentContext);
            break;
        case "greetings":
        default:
            slots = ["none", "none", "none", "none", "none"];
            break;
    }

    const shouldUseMemory = mainService === currentContext.section || isContextualFollowUp(messageText, currentContext);

    if (shouldUseMemory && controllerSlotMemory[mainService]) {
        const memory = getServiceMemory(mainService);
        slots = slots.map((value, index) => (value === "none" && memory[index] !== "none" ? memory[index] : value));
    }

    const normalizedState = createControllerState(mainService, slots, controllerState.rawText);

    if (controllerSlotMemory[mainService]) {
        saveServiceMemory(mainService, normalizedState.slots);
    }

    return normalizedState;
}

function controllerStateToParsedReply(controllerState) {
    return {
        fullResponse: controllerStateToString(controllerState),
        messageText: "",
        keywordArray: controllerState.keywordArray
    };
}

function inferUiActionFromMessage(messageText, parsedReply) {
    const keywordArray = parsedReply ? parsedReply.keywordArray : [];
    const lowerText = messageText.toLowerCase();
    const currentContext = getCurrentUiContextSafe();
    const mainService = keywordArray[0] || detectMainServiceFromText(messageText, currentContext);
    const filters = {};

    if (mainService === "room") {
        const quantity = normalizeNumericWord(keywordArray[1])
            || detectGuestCount(messageText)
            || detectRoomQuantityHint(messageText)
            || (isBareNumberMessage(messageText) && currentContext.section === "room" ? normalizeNumericWord(messageText) : null);
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
            restaurantId: restaurantMap[mealType] ?? 0
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
            dayoutId: dayoutMap[activityType] ?? 0
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
            eventId: eventMap[eventType] ?? 0
        };
    }

    return { mainService };
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
        const nextFilters = action.filters || {};
        const currentFilters = currentContext.filters || {};
        const nextKeys = Object.keys(nextFilters);
        const currentKeys = Object.keys(currentFilters);

        if (action.roomInfoOnly && currentContext.mode === "category") {
            return false;
        }

        if (currentContext.mode === "detail" && !nextKeys.length) {
            return false;
        }

        if (nextKeys.length !== currentKeys.length) {
            return true;
        }

        return nextKeys.some((key) => nextFilters[key] !== currentFilters[key]);
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

function buildLocalConversationReply(messageText, controllerState) {
    const currentContext = getCurrentUiContextSafe();
    const mainService = controllerState.mainService;
    const slots = controllerState.slots;

    if (mainService === "room") {
        if (slots[0] === "none") {
            return "How many guests will be staying? Once I have that, I can match you with the best room option.";
        }

        const filters = {};

        if (slots[1] !== "none" && slots[1] !== "roominfo") {
            filters.roomType = slots[1];
        }

        if (slots[0] !== "none") {
            filters.minCapacity = normalizeNumericWord(slots[0]);
        }

        if (slots[2] !== "none") {
            filters.feature = slots[2];
        }

        const bestRoom = getBestMatchingRoom(filters);

        if (bestRoom) {
            return `For ${slots[0]} guests, ${bestRoom.roomName} looks like the best fit. It starts at ${bestRoom.price}. Does that room look good to you?`;
        }

        return "I could not find an exact room match for that combination yet. Would you like me to broaden the room type or feature requirements?";
    }

    if (mainService === "dayout") {
        if (slots[1] === "none") {
            return "What kind of day-out are you after: pool day, BBQ, sightseeing, sports, spa, or beach day?";
        }

        const pack = getDayoutPackageByActivityType(slots[1]);
        return `${pack.name} looks like a strong match for that. Would you like me to explain the timing, inclusions, or pricing next?`;
    }

    if (mainService === "restaurant") {
        if (slots[1] === "none") {
            return "Are you looking for breakfast, lunch, dinner, snacks, or drinks?";
        }

        const section = getRestaurantSectionByMealType(slots[1]);
        const featuredItem = section.items[0];
        return `For ${slots[1]}, ${featuredItem.name} is a good option from our ${section.name} section. Would you like buffet, room service, or takeaway details?`;
    }

    if (mainService === "event") {
        if (slots[0] === "none") {
            return "What kind of event are you planning: a wedding, birthday, conference, meeting, or party?";
        }

        const eventPack = getEventPackageByType(slots[0]);

        if (slots[1] === "none") {
            return `${eventPack.name} looks like a good direction for a ${slots[0]} setup. Around how many guests are you expecting?`;
        }

        return `For a ${slots[0]} with ${slots[1]} guests, ${eventPack.name} looks like a strong fit. Would you like details on facilities, timing, or pricing?`;
    }

    if (mainService === "hotelinfo") {
        if (slots[0] === "none") {
            return "What would you like to know about the hotel: facilities, rules, pricing, availability, contact, or location?";
        }

        const filterText = slots[1] !== "none" ? ` about ${slots[1]}` : "";
        return `I can help with ${slots[0]} information${filterText}. What specific detail would you like to know?`;
    }

    if (currentContext.section !== "greetings" && isContextualFollowUp(messageText, currentContext)) {
        return `You are still in the ${currentContext.section} section. Ask me anything about what is visible here and I will stay focused on it.`;
    }

    return "Hello. How can I assist you today?";
}

function buildConversationSupportInstruction(controllerState, uiShouldChange) {
    const currentContext = getCurrentUiContextSafe();

    return `Controller decision:
- service: ${controllerState.mainService}
- s2: ${controllerState.slots[0]}
- s3: ${controllerState.slots[1]}
- s4: ${controllerState.slots[2]}
- s5: ${controllerState.slots[3]}
- duration: ${controllerState.slots[4]}
- ui change required: ${uiShouldChange ? "yes" : "no"}
- current page section: ${currentContext.section}

Conversation rules:
- If a slot already has a concrete value, do not ask for it again.
- Ask only the next missing thing.
- If enough information is known, recommend a concrete option from the current section.
- If ui change required is no, continue naturally inside the current page context.
- If service is event and s2 is birthday, do not ask what kind of event it is again.
- If service is room and s2 has a guest count, do not ask for guest count again.`;
}

async function generateModelText(model, systemTexts, contents, generationConfig) {
    if (!GEMINI_API_KEY) {
        throw new Error("Missing Gemini API key in script.js.");
    }

    const requestBody = {
        system_instruction: {
            parts: systemTexts.map((text) => ({ text }))
        },
        contents,
        generationConfig
    };

    const response = await fetch(getModelApiUrl(model), {
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

    return fullResponse;
}

async function generateControllerState(messageText) {
    const fullResponse = await generateModelText(
        CONTROLLER_MODEL,
        [HOTEL_CONTROLLER_SYSTEM_INSTRUCTION, buildUiContextInstruction()],
        [
            {
                role: "user",
                parts: [
                    {
                        text: messageText
                    }
                ]
            }
        ],
        {
            temperature: 0,
            topP: 0.2,
            topK: 12,
            maxOutputTokens: 60
        }
    );

    return parseControllerReply(fullResponse);
}

async function generateConversationReply(messageText, controllerState, uiShouldChange) {
    const assistantReply = await generateModelText(
        CONVERSATION_MODEL,
        [
            HOTEL_CONVERSATION_SYSTEM_INSTRUCTION,
            buildUiContextInstruction(),
            buildConversationSupportInstruction(controllerState, uiShouldChange)
        ],
        [
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
        {
            temperature: 0.55,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 180
        }
    );

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
                    text: assistantReply
                }
            ]
        }
    );

    return assistantReply;
}

async function handleAssistantFlow(messageText, options = {}) {
    const currentContext = getCurrentUiContextSafe();
    let controllerState;

    try {
        controllerState = await generateControllerState(messageText);
    } catch (error) {
        console.error("Controller Gemini API error:", error);
        controllerState = createControllerState(detectMainServiceFromText(messageText, currentContext), ["none", "none", "none", "none", "none"], "");
    }

    controllerState = normalizeControllerState(messageText, controllerState, currentContext);

    const parsedController = controllerStateToParsedReply(controllerState);
    const action = inferUiActionFromMessage(messageText, parsedController);
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

    if (options.silentReply) {
        return;
    }

    let assistantText;

    try {
        assistantText = await generateConversationReply(messageText, controllerState, uiShouldChange);
    } catch (error) {
        console.error("Conversation Gemini API error:", error);
        assistantText = buildLocalConversationReply(messageText, controllerState);
    }

    sendBotMessage(assistantText);
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

async function sendSystemMessage(inputMessage, options = {}) {
    const messageText = (inputMessage || "").trim();

    if (!messageText) {
        return;
    }

    await handleAssistantFlow(messageText, { silentReply: true, silentError: true, ...options });
}

window.HOTEL_SYSTEM_INSTRUCTION = HOTEL_CONTROLLER_SYSTEM_INSTRUCTION;
window.HOTEL_CONTROLLER_SYSTEM_INSTRUCTION = HOTEL_CONTROLLER_SYSTEM_INSTRUCTION;
window.HOTEL_CONVERSATION_SYSTEM_INSTRUCTION = HOTEL_CONVERSATION_SYSTEM_INSTRUCTION;
window.sendHotelMessage = sendHotelMessage;
window.sendSystemMessage = sendSystemMessage;
window.setAiSectionFocus = setAiSectionFocus;

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
