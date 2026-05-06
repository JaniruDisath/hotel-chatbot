const uiState = {
    roomFilter: {},
    selectedRoomId: roomInfo[0] ? roomInfo[0].roomid : null,
    currentView: {
        section: "greetings",
        mode: "landing"
    }
};

let chatMessages = [];

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function scrollCardsLeft() {
    const container = document.querySelector(".scroll-container");

    if (container) {
        container.scrollBy({
            left: -260,
            behavior: "smooth"
        });
    }
}

function scrollCardsRight() {
    const container = document.querySelector(".scroll-container");

    if (container) {
        container.scrollBy({
            left: 260,
            behavior: "smooth"
        });
    }
}

function setInfoPanel(html) {
    document.getElementById("info-panel").innerHTML = html;
}

function setCardList(html) {
    document.getElementById("card-list-body").innerHTML = html;
}

function setCurrentUiContext(context = {}) {
    uiState.currentView = {
        section: context.section || "greetings",
        mode: context.mode || "landing",
        title: context.title || "",
        selectedId: context.selectedId || null,
        filters: context.filters || {}
    };
}

function getCurrentUiContext() {
    return {
        section: uiState.currentView.section,
        mode: uiState.currentView.mode,
        title: uiState.currentView.title,
        selectedId: uiState.currentView.selectedId,
        filters: { ...uiState.currentView.filters }
    };
}

function sendMessage() {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();

    if (message === "") {
        return;
    }

    chatMessages.push(message);

    const newMessageHTML = `
        <div class="chat-message chat-message-user" data-aos="fade-up" data-aos-duration="700">
            <div class="chat-bubble chat-bubble-user">
                <div class="chat-label">You</div>
                <p>${escapeHtml(message)}</p>
            </div>
            <img class="chat-avatar" src="assets/img/leisrue Land Logo.jpg" alt="User avatar">
        </div>
    `;

    document.getElementById("chatArea").innerHTML += newMessageHTML;
    input.value = "";
    scrollChatToBottom();
}

function renderUserMessageHtml(message) {
    return `
        <div class="chat-message chat-message-user" data-aos="fade-up" data-aos-duration="700">
            <div class="chat-bubble chat-bubble-user">
                <div class="chat-label">You</div>
                <p>${escapeHtml(message)}</p>
            </div>
            <img class="chat-avatar" src="assets/img/leisrue Land Logo.jpg" alt="User avatar">
        </div>
    `;
}

function resetChatVisual(currentUserMessage = "") {
    const chatArea = document.getElementById("chatArea");

    if (!chatArea) {
        return;
    }

    chatArea.innerHTML = currentUserMessage ? renderUserMessageHtml(currentUserMessage) : "";
    scrollChatToBottom();
}

function sendBotMessage(message) {
    const input = document.getElementById("chatInput");

    chatMessages.push(message);

    const newMessageHTML = `
        <div class="chat-message chat-message-bot" data-aos="fade-up" data-aos-duration="700">
            <img class="chat-avatar" src="assets/img/leisrue Land Logo.jpg" alt="Hotel assistant avatar">
            <div class="chat-bubble chat-bubble-bot">
                <div class="chat-label">Hotel Help Assistant</div>
                <p>${escapeHtml(message)}</p>
            </div>
        </div>
    `;

    document.getElementById("chatArea").innerHTML += newMessageHTML;
    input.value = "";
    scrollChatToBottom();
}

function scrollChatToBottom() {
    const chatArea = document.getElementById("chatArea");
    const wrapper = chatArea && chatArea.parentElement;

    if (wrapper) {
        wrapper.scrollTop = wrapper.scrollHeight;
    }
}

function renderSectionHero(title, subtitle, badge, actionsHtml) {
    return `
        <section class="hero-panel" data-aos="fade-up" data-aos-duration="700">
            <span class="hero-badge">${escapeHtml(badge)}</span>
            <h2 class="hero-title">${escapeHtml(title)}</h2>
            <p class="hero-subtitle">${escapeHtml(subtitle)}</p>
            <div class="hero-actions">${actionsHtml || ""}</div>
        </section>
    `;
}

function renderTagList(items) {
    return items.map((item) => `<span class="tag-pill">${escapeHtml(item)}</span>`).join("");
}

function renderPromptButtons(items) {
    return items.map((item) => `
        <button type="button" class="prompt-pill" onclick="sendQuickPrompt('${escapeHtml(item)}')">${escapeHtml(item)}</button>
    `).join("");
}

function renderDoodleLayer(className = "") {
    return "";
}

function renderWelcomeBubbleField() {
    return "";
}

function getFilteredRooms(filters = uiState.roomFilter) {
    return roomInfo.filter((room) => {
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
}

function describeRoomFilter(filters = uiState.roomFilter) {
    const parts = [];

    if (filters.roomType) {
        parts.push(`${filters.roomType} rooms`);
    }

    if (filters.minCapacity) {
        parts.push(`for ${filters.minCapacity}+ guests`);
    }

    if (filters.bedCount) {
        parts.push(`with ${filters.bedCount}+ beds`);
    }

    if (filters.feature) {
        parts.push(`including ${filters.feature}`);
    }

    return parts.length ? `Showing ${parts.join(" ")}` : "Showing all available dummy room types";
}

function resetRoomFilter() {
    uiState.roomFilter = {};
    uiState.selectedRoomId = roomInfo[0] ? roomInfo[0].roomid : null;
    loadRoomInfoPanel();
}

function applyRoomFilter(filters = {}) {
    uiState.roomFilter = filters;

    const filteredRooms = getFilteredRooms(filters);
    uiState.selectedRoomId = filteredRooms.length ? filteredRooms[0].roomid : null;

    if (filteredRooms.length) {
        loadHotelRoomsMainPanel(filteredRooms[0].roomid);
    } else {
        loadRoomEmptyState();
    }

    loadHotelRoomsList(filters);
}

function selectRoom(roomId) {
    uiState.selectedRoomId = Number(roomId);
    loadHotelRoomsMainPanel(uiState.selectedRoomId);
}

function bookRoom(roomId) {
    const room = roomInfo.find((item) => item.roomid === Number(roomId));

    if (!room) {
        return;
    }

    sendBotMessage(`Great choice. I can help continue with ${room.roomName}. Tell me your dates and guest count to move forward.`);
}

function loadRoomEmptyState() {
    setCurrentUiContext({
        section: "room",
        mode: "empty",
        title: "No matching rooms",
        filters: { ...uiState.roomFilter }
    });

    setInfoPanel(`
        <section class="empty-state" data-aos="fade-up" data-aos-duration="700">
            <h3>No rooms match that request yet</h3>
            <p>Try a broader request like "family room", "room for four", or "suite with pool access".</p>
            <button class="action-btn" onclick="resetRoomFilter()">Show All Rooms</button>
        </section>
    `);
}

function loadHotelRoomsMainPanel(id) {
    const room = roomInfo.find((item) => item.roomid === Number(id));

    if (!room) {
        loadRoomEmptyState();
        return;
    }

    uiState.selectedRoomId = room.roomid;
    setCurrentUiContext({
        section: "room",
        mode: "detail",
        title: room.roomName,
        selectedId: room.roomid,
        filters: { ...uiState.roomFilter }
    });

    const panel = `
        <section class="detail-grid" data-aos="fade-up" data-aos-duration="700">
            <div class="detail-gallery">
                <div id="carouselRoom${room.roomid}" class="carousel slide detail-carousel" data-bs-ride="carousel">
                    <div class="carousel-inner detail-carousel-inner">
                        <div class="carousel-item active">
                            <img src="${room.pic1}" class="detail-image" alt="${escapeHtml(room.roomName)} image 1">
                        </div>
                        <div class="carousel-item">
                            <img src="${room.pic2}" class="detail-image" alt="${escapeHtml(room.roomName)} image 2">
                        </div>
                        <div class="carousel-item">
                            <img src="${room.pic3}" class="detail-image" alt="${escapeHtml(room.roomName)} image 3">
                        </div>
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#carouselRoom${room.roomid}" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon"></span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#carouselRoom${room.roomid}" data-bs-slide="next">
                        <span class="carousel-control-next-icon"></span>
                    </button>
                </div>
            </div>
            <div class="detail-content">
                <span class="hero-badge">${escapeHtml(room.roomType)}</span>
                <h3 class="detail-title">${escapeHtml(room.roomName)}</h3>
                <p class="detail-copy">${escapeHtml(room.description)}</p>
                <div class="detail-scroll-body">
                    <div class="detail-meta detail-meta-primary">
                        <div><strong>Capacity</strong><span>${escapeHtml(room.capacityString)}</span></div>
                        <div><strong>Bed Setup</strong><span>${escapeHtml(room.bed)}</span></div>
                        <div><strong>Room Size</strong><span>${room.size} m²</span></div>
                        <div><strong>Price</strong><span>${escapeHtml(room.price)}</span></div>
                    </div>
                    <div class="detail-feature-block">
                        <h4>Highlights</h4>
                        <div class="tag-row">${renderTagList(room.features)}</div>
                    </div>
                    <div class="detail-note-grid">
                        <div class="detail-note">
                            <h4>Inclusions</h4>
                            <p>${escapeHtml(room.freePerks)}</p>
                        </div>
                        <div class="detail-note">
                            <h4>Amenities</h4>
                            <p>${escapeHtml(room.amenities)}</p>
                        </div>
                        <div class="detail-note">
                            <h4>Cancellation</h4>
                            <p>${escapeHtml(room.Cancellation)}</p>
                        </div>
                    </div>
                </div>
                <div class="hero-actions detail-actions">
                    <button class="action-btn" onclick="bookRoom(${room.roomid})">Book ${escapeHtml(room.roomName)}</button>
                    <button class="ghost-btn" onclick="resetRoomFilter()">All Rooms</button>
                </div>
            </div>
        </section>
    `;

    setInfoPanel(panel);
}

function loadHotelRoomsList(filters = uiState.roomFilter) {
    const filteredRooms = getFilteredRooms(filters);

    if (!filteredRooms.length) {
        setCardList(`
            <div class="section-status-card">
                <strong>No matching rooms</strong>
                <p>Try relaxing the guest count or room type filter.</p>
            </div>
        `);
        return;
    }

    const listHtml = filteredRooms.map((room) => `
        <article class="scroll-card room-scroll-card ${room.roomid === uiState.selectedRoomId ? "is-active" : ""}" onclick="selectRoom(${room.roomid})" data-aos="fade-up" data-aos-duration="600">
            ${renderDoodleLayer("card-doodle-bg")}
            <img src="${room.pic1}" alt="${escapeHtml(room.roomName)}">
            <div class="scroll-card-body">
                <div class="scroll-card-top">
                    <strong>${escapeHtml(room.price)}</strong>
                </div>
                <h4>${escapeHtml(room.roomName)}</h4>
                <p>${escapeHtml(room.capacityString)} · ${room.bedCount} bed setup</p>
                <div class="tag-row compact-tags">${renderTagList(room.features.slice(0, 3))}</div>
            </div>
        </article>
    `).join("");

    setCardList(listHtml);
}

function loadGreetings() {
    setCurrentUiContext({
        section: "greetings",
        mode: "landing",
        title: "Welcome to Leisure Land Villa",
        filters: {}
    });

    setInfoPanel(`
        <section class="welcome-hero" data-aos="fade-up" data-aos-duration="700">
            <div class="welcome-content">
                <div class="welcome-top">
                    <span class="hero-badge">hotel assistant</span>
                    <h1 class="welcome-title">Welcome to Leisure Land Villa</h1>
                </div>
                <div class="welcome-bottom">
                    <p class="welcome-kicker">Try searching for</p>
                    <div class="tag-row welcome-tags">
                        ${renderPromptButtons(["room for four", "family room", "day out package", "seafood dinner", "wedding package"])}
                    </div>
                </div>
            </div>
        </section>
    `);
    loadMenuList();
}

function loadMenuList() {
    const listHtml = menuList.map((item) => `
        <article class="scroll-card menu-scroll-card" onclick="${item.methodCall}; ${item.systemSendMessage}" data-aos="fade-up" data-aos-duration="600">
            ${renderDoodleLayer("card-doodle-bg")}
            <img src="${item.image}" alt="${escapeHtml(item.name)}">
            <div class="scroll-card-body">
                <h4>${escapeHtml(item.name)}</h4>
                <p>Open the ${escapeHtml(item.name.toLowerCase())} flow.</p>
            </div>
        </article>
    `).join("");

    setCardList(listHtml);
}

function loadRoomInfoPanel() {
    setCurrentUiContext({
        section: "room",
        mode: "category",
        title: "Choose a room style",
        filters: { ...uiState.roomFilter }
    });

    const roomCategoryHtml = roomInfoList.map((room) => `
        <article class="overview-card" onclick="openRoomCategory('${room.type}')" data-aos="fade-up" data-aos-duration="600">
            ${renderDoodleLayer("card-doodle-bg")}
            <img src="${room.pic}" alt="${escapeHtml(room.name)} room category">
            <div class="overview-card-body">
                <span class="mini-badge">${escapeHtml(room.type)}</span>
                <h3>${escapeHtml(room.name)}</h3>
                <p>${escapeHtml(room.summary)}</p>
                <div class="overview-meta">
                    <span>${escapeHtml(room.capacity)}</span>
                    <strong>${escapeHtml(room.price)}</strong>
                </div>
            </div>
        </article>
    `).join("");

    setInfoPanel(`
        ${renderSectionHero(
            "Choose a room style",
            "",
            "rooms",
            ``
        )}
        <section class="overview-grid">
            ${roomCategoryHtml}
        </section>
    `);

    loadHotelRoomsList();
}

function openRoomCategory(type) {
    applyRoomFilter({ roomType: type });
}

function renderPackageList(packages, selectHandlerName, statusText) {
    const cards = packages.map((item) => `
        <article class="scroll-card package-scroll-card" onclick="${selectHandlerName}(${item.id})" data-aos="fade-up" data-aos-duration="600">
            ${renderDoodleLayer("card-doodle-bg")}
            <img src="${item.image}" alt="${escapeHtml(item.name)}">
            <div class="scroll-card-body">
                <h4>${escapeHtml(item.name)}</h4>
                <p>${escapeHtml(item.price)}</p>
            </div>
        </article>
    `).join("");

    setCardList(`
        <div class="section-status-card">
            <strong>${escapeHtml(statusText)}</strong>
            <p>Dummy content to complete the full chatbot-led flow.</p>
        </div>
        ${cards}
    `);
}

function loadDayout(selectedId = 0) {
    const pack = dayoutPackages.find((item) => item.id === Number(selectedId)) || dayoutPackages[0];

    setCurrentUiContext({
        section: "dayout",
        mode: "detail",
        title: pack.name,
        selectedId: pack.id,
        filters: {}
    });

    setInfoPanel(`
        ${renderSectionHero(
            pack.name,
            pack.summary,
            "dayout",
            `<button class="action-btn" onclick="sendSystemMessage('System : user asked about dayout package ${escapeHtml(pack.name)}')">Ask About This Package</button>`
        )}
        <section class="detail-grid">
            <div class="detail-gallery">
                <img class="detail-image static-detail-image" src="${pack.image}" alt="${escapeHtml(pack.name)}">
            </div>
            <div class="detail-content">
                <h3 class="detail-title">${escapeHtml(pack.price)}</h3>
                <p class="detail-copy">Duration: ${escapeHtml(pack.duration)}</p>
                <div class="tag-row">${renderTagList(pack.highlights)}</div>
                <div class="detail-note-grid">
                    <div class="detail-note">
                        <h4>Perfect for</h4>
                        <p>Families, friend groups, and guests who want the villa experience without an overnight booking.</p>
                    </div>
                    <div class="detail-note">
                        <h4>What's included</h4>
                        <p>${escapeHtml(pack.highlights.join(", "))}</p>
                    </div>
                </div>
            </div>
        </section>
    `);

    renderPackageList(dayoutPackages, "loadDayout", "Showing day-out packages");
}

function loadRestaurantInfo(selectedId = 0) {
    const section = restaurantSections.find((item) => item.id === Number(selectedId)) || restaurantSections[0];
    setCurrentUiContext({
        section: "restaurant",
        mode: "detail",
        title: section.name,
        selectedId: section.id,
        filters: {}
    });
    const menuItemsHtml = section.items.map((item) => `
        <div class="info-card compact-info-card">
            ${renderDoodleLayer("card-doodle-bg")}
            <span class="mini-badge">${escapeHtml(item.tag)}</span>
            <h4>${escapeHtml(item.name)}</h4>
            <p>${escapeHtml(item.price)}</p>
        </div>
    `).join("");

    setInfoPanel(`
        ${renderSectionHero(
            section.name,
            section.summary,
            "restaurant",
            `<button class="action-btn" onclick="sendSystemMessage('System : user asked about restaurant ${escapeHtml(section.mealType)}')">Ask About ${escapeHtml(section.name)}</button>`
        )}
        <section class="info-grid">
            <div class="info-card">
                ${renderDoodleLayer("card-doodle-bg")}
                <h3>Service Style</h3>
                <p>${escapeHtml(section.feature)}</p>
            </div>
            <div class="info-card">
                ${renderDoodleLayer("card-doodle-bg")}
                <h3>Hours</h3>
                <p>Stay-in guests: 5:30 A.M. to 11:00 P.M.</p>
            </div>
            <div class="info-card">
                ${renderDoodleLayer("card-doodle-bg")}
                <h3>Public Dining</h3>
                <p>Available from 8:30 A.M. with dine-in and takeaway options.</p>
            </div>
        </section>
        <section class="info-grid">
            ${menuItemsHtml}
        </section>
    `);

    const cards = restaurantSections.map((item) => `
        <article class="scroll-card package-scroll-card" onclick="loadRestaurantInfo(${item.id})" data-aos="fade-up" data-aos-duration="600">
            <div class="scroll-card-body">
                <h4>${escapeHtml(item.name)}</h4>
                <p>${escapeHtml(item.summary)}</p>
            </div>
        </article>
    `).join("");

    setCardList(cards);
}

function loadMainHotelInfo() {
    setCurrentUiContext({
        section: "hotelinfo",
        mode: "overview",
        title: "Everything at a glance",
        filters: {}
    });

    const cards = hotelInfoCards.map((item) => `
        <article class="info-card" data-aos="fade-up" data-aos-duration="600">
            ${renderDoodleLayer("card-doodle-bg")}
            <span class="mini-badge">hotel info</span>
            <h3>${escapeHtml(item.title)}</h3>
            <strong>${escapeHtml(item.value)}</strong>
            <p>${escapeHtml(item.detail)}</p>
        </article>
    `).join("");

    setInfoPanel(`
        ${renderSectionHero(
            "Everything at a glance",
            "A simple info wall for opening times, facilities, and contact details while the richer booking flow is still being built.",
            "hotel info",
            `<button class="action-btn" onclick="loadRoomInfoPanel()">Check Rooms</button>`
        )}
        <section class="info-grid">
            ${cards}
        </section>
    `);

    setCardList(`
        <div class="section-status-card">
            <strong>Hotel facts loaded</strong>
            <p>Ask the assistant about facilities, pricing, restaurant, contact, or pool timing.</p>
        </div>
    `);
}

function loadEventInfo(selectedId = 0) {
    const eventPack = eventPackages.find((item) => item.id === Number(selectedId)) || eventPackages[0];

    setCurrentUiContext({
        section: "event",
        mode: "detail",
        title: eventPack.name,
        selectedId: eventPack.id,
        filters: {}
    });

    setInfoPanel(`
        ${renderSectionHero(
            eventPack.name,
            eventPack.summary,
            "events",
            `<button class="action-btn" onclick="sendSystemMessage('System : user asked about event ${escapeHtml(eventPack.eventType)}')">Ask About This Event</button>`
        )}
        <section class="detail-grid">
            <div class="detail-gallery">
                <img class="detail-image static-detail-image" src="${eventPack.image}" alt="${escapeHtml(eventPack.name)}">
            </div>
            <div class="detail-content">
                <h3 class="detail-title">${escapeHtml(eventPack.capacity)}</h3>
                <p class="detail-copy">${escapeHtml(eventPack.price)}</p>
                <div class="tag-row">${renderTagList(eventPack.features)}</div>
                <div class="detail-note-grid">
                    <div class="detail-note">
                        <h4>Event style</h4>
                        <p>${escapeHtml(eventPack.eventType)}</p>
                    </div>
                    <div class="detail-note">
                        <h4>Included facilities</h4>
                        <p>${escapeHtml(eventPack.features.join(", "))}</p>
                    </div>
                </div>
            </div>
        </section>
    `);

    renderPackageList(eventPackages, "loadEventInfo", "Showing dummy event packages");
}

window.addEventListener("DOMContentLoaded", async () => {
    loadGreetings();
});

window.sendQuickPrompt = function sendQuickPrompt(promptText) {
    const input = document.getElementById("chatInput");

    if (!input) {
        return;
    }

    input.value = promptText;
    sendHotelMessage();
};

window.resetChatVisual = resetChatVisual;
window.getCurrentUiContext = getCurrentUiContext;
