const uiState = {
    roomFilter: {},
    selectedRoomId: roomInfo[0] ? roomInfo[0].roomid : null,
    currentCardListKey: null,
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
    uiState.currentCardListKey = null;
    document.getElementById("card-list-body").innerHTML = html;
}

function setCardListWithKey(html, key) {
    uiState.currentCardListKey = key || null;
    document.getElementById("card-list-body").innerHTML = html;
}

function setCurrentUiContext(context = {}) {
    uiState.currentView = {
        section: context.section || "greetings",
        mode: context.mode || "landing",
        title: context.title || "",
        selectedId: context.selectedId ?? null,
        filters: context.filters || {}
    };

    if (typeof window.setAiSectionFocus === "function") {
        window.setAiSectionFocus(uiState.currentView);
    }
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

async function goHome() {
    loadGreetings();

    if (typeof window.sendSystemMessage === "function") {
        await window.sendSystemMessage("System : User returned to home page. Focus on greetings, overview guidance, and helping them choose the next section.", {
            silentReply: true,
            silentError: true
        });
    }
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
            ${subtitle ? `<p class="hero-subtitle">${escapeHtml(subtitle)}</p>` : ""}
            ${actionsHtml ? `<div class="hero-actions">${actionsHtml}</div>` : ""}
        </section>
    `;
}

function renderTagList(items) {
    return items.map((item) => `<span class="tag-pill">${escapeHtml(item)}</span>`).join("");
}

function renderEventFeatureButtons(eventPack) {
    return eventPack.features.map((feature, index) => `
        <button type="button" class="tag-pill tag-button" onclick="askEventFeature(${eventPack.id}, ${index})">${escapeHtml(feature)}</button>
    `).join("");
}

function renderEventCollage(eventPack) {
    const gallery = (eventPack.gallery && eventPack.gallery.length ? eventPack.gallery : [eventPack.image]).slice(0, 3);
    const fallbackImage = gallery[0] || eventPack.image;

    return gallery.map((image, index) => `
        <img class="${index === 0 ? "event-collage-main" : ""}" src="${image || fallbackImage}" alt="${escapeHtml(eventPack.name)} ${index + 1}">
    `).join("");
}

function renderHotelInfoCardList(selectedId = 0) {
    const cards = hotelInfoCards.map((item) => `
        <article class="scroll-card hotel-info-scroll-card ${Number(item.id) === Number(selectedId) ? "is-active" : ""}" onclick="loadMainHotelInfo(${item.id})" data-aos="fade-up" data-aos-duration="600">
            ${renderDoodleLayer("card-doodle-bg")}
            <img src="${item.image}" alt="${escapeHtml(item.title)} preview" loading="eager">
            <div class="scroll-card-body">
                <span class="mini-badge">hotel info</span>
                <h4>${escapeHtml(item.title)}</h4>
                <strong>${escapeHtml(item.value)}</strong>
                <p>${escapeHtml(item.detail)}</p>
            </div>
        </article>
    `).join("");

    setCardListWithKey(cards, "hotel-info-cards");
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

    alert("A member of our customer care team will contact you soon.");
}

function bookDayout(packageId) {
    const pack = dayoutPackages.find((item) => item.id === Number(packageId));

    if (!pack) {
        return;
    }

    alert("A member of our customer care team will contact you soon.");
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
                        <div class="detail-note" data-aos="fade-up" data-aos-duration="600" data-aos-delay="220">
                            <h4>Inclusions</h4>
                            <p>${escapeHtml(room.freePerks)}</p>
                        </div>
                        <div class="detail-note" data-aos="fade-up" data-aos-duration="600" data-aos-delay="280">
                            <h4>Amenities</h4>
                            <p>${escapeHtml(room.amenities)}</p>
                        </div>
                        <div class="detail-note" data-aos="fade-up" data-aos-duration="600" data-aos-delay="340">
                            <h4>Cancellation</h4>
                            <p>${escapeHtml(room.Cancellation)}</p>
                        </div>
                    </div>
                </div>
                <div class="hero-actions detail-actions" data-aos="fade-up" data-aos-duration="600" data-aos-delay="400">
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
    const listHtml = menuList.map((item, index) => `
        <article class="scroll-card menu-scroll-card" onclick="openMenuSection(${index})" data-aos="fade-up" data-aos-duration="600">
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

async function openMenuSection(index) {
    const item = menuList[index];

    if (!item) {
        return;
    }

    resetChatVisual();

    if (item.actionName && typeof window[item.actionName] === "function") {
        window[item.actionName]();
    }

    if (item.chatMessage) {
        sendBotMessage(item.chatMessage);
    }

    if (item.systemPrompt && typeof window.sendSystemMessage === "function") {
        await window.sendSystemMessage(item.systemPrompt, { silentReply: true });
    }
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

function renderPackageList(packages, selectHandlerName, statusText, options = {}) {
    if (options.cacheKey && uiState.currentCardListKey === options.cacheKey) {
        return;
    }

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

    setCardListWithKey(`
        <div class="section-status-card" data-aos="fade-up" data-aos-duration="600">
            <strong>${escapeHtml(statusText)}</strong>
            <p>Browse the available packages below and open one to compare pricing, timing, and included experiences.</p>
        </div>
        ${cards}
    `, options.cacheKey);
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
            "",
            "dayout",
            ``
        )}
        <section class="detail-grid" data-aos="fade-up" data-aos-duration="700">
            <div class="detail-gallery" data-aos="fade-up" data-aos-duration="700" data-aos-delay="80">
                <img class="detail-image static-detail-image" src="${pack.image}" alt="${escapeHtml(pack.name)}">
            </div>
            <div class="detail-content" data-aos="fade-up" data-aos-duration="700" data-aos-delay="140">
                <h3 class="detail-title" data-aos="fade-up" data-aos-duration="600" data-aos-delay="180">${escapeHtml(pack.price)}</h3>
                <p class="detail-copy" data-aos="fade-up" data-aos-duration="600" data-aos-delay="220">Duration: ${escapeHtml(pack.duration)}</p>
                <div class="tag-row" data-aos="fade-up" data-aos-duration="600" data-aos-delay="260">${renderTagList(pack.highlights)}</div>
                <div class="detail-note-grid">
                    <div class="detail-note" data-aos="fade-up" data-aos-duration="600" data-aos-delay="240">
                        <h4>Perfect for</h4>
                        <p>Families, friend groups, and guests who want the villa experience without an overnight booking.</p>
                    </div>
                    <div class="detail-note" data-aos="fade-up" data-aos-duration="600" data-aos-delay="240">
                        <h4>What's included</h4>
                        <p>${escapeHtml(pack.highlights.join(", "))}</p>
                    </div>
                </div>
                <div class="hero-actions detail-actions" data-aos="fade-up" data-aos-duration="600" data-aos-delay="300">
                    <button class="action-btn" onclick="bookDayout(${pack.id})">Book ${escapeHtml(pack.name)}</button>
                    <button class="ghost-btn" onclick="loadDayout()">All Packages</button>
                </div>
            </div>
        </section>
    `);

    renderPackageList(dayoutPackages, "loadDayout", "Showing day-out packages", { cacheKey: "dayout-packages" });
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
        <div class="info-card compact-info-card restaurant-menu-card" data-aos="fade-up" data-aos-duration="600">
            ${renderDoodleLayer("card-doodle-bg")}
            <img src="${item.image}" alt="${escapeHtml(item.name)}" loading="eager" fetchpriority="high">
            <div class="restaurant-menu-copy">
                <span class="mini-badge">${escapeHtml(item.tag)}</span>
                <h4>${escapeHtml(item.name)}</h4>
                <p>${escapeHtml(item.price)}</p>
            </div>
        </div>
    `).join("");

    setInfoPanel(`
        ${renderSectionHero(
            section.name,
            section.summary,
            "restaurant",
            ``
        )}
        <section class="restaurant-layout">
            <article class="info-card restaurant-feature-card" data-aos="fade-up" data-aos-duration="600">
                ${renderDoodleLayer("card-doodle-bg")}
                <img src="${section.serviceImage}" alt="${escapeHtml(section.name)} dining overview" loading="eager" fetchpriority="high">
                <div class="restaurant-feature-body">
                    <span class="mini-badge">Dining Info</span>
                    <h3>${escapeHtml(section.name)} Service</h3>
                    <div class="restaurant-info-list">
                        <div class="restaurant-info-row">
                            <strong>Service Style</strong>
                            <p>Buffet, Room service, and Takeaway</p>
                        </div>
                        <div class="restaurant-info-row">
                            <strong>Hours</strong>
                            <p>Stay-in guests: 5:30 A.M. to 11:00 P.M.</p>
                        </div>
                        <div class="restaurant-info-row">
                            <strong>Public Dining</strong>
                            <p>Available from 8:30 A.M. with dine-in and takeaway options.</p>
                        </div>
                    </div>
                </div>
            </article>
            <div class="restaurant-menu-stack">
                ${menuItemsHtml}
            </div>
        </section>
    `);

    if (uiState.currentCardListKey !== "restaurant-sections") {
        const cards = restaurantSections.map((item) => `
            <article class="scroll-card package-scroll-card section-scroll-card" onclick="loadRestaurantInfo(${item.id})" data-aos="fade-up" data-aos-duration="600">
                <img src="${item.serviceImage}" alt="${escapeHtml(item.name)} section image" loading="eager">
                <div class="scroll-card-body">
                    <h4>${escapeHtml(item.name)}</h4>
                </div>
            </article>
        `).join("");

        setCardListWithKey(cards, "restaurant-sections");
    }
}

function loadMainHotelInfo(selectedId = 0) {
    const info = hotelInfoCards.find((item) => Number(item.id) === Number(selectedId)) || hotelInfoCards[0];
    const collage = (info.collage && info.collage.length ? info.collage : [info.image]).slice(0, 3);
    const noteRows = (info.notes || []).map((note) => `
        <div class="hotel-info-note">
            <span>${escapeHtml(note.label)}</span>
            <strong>${escapeHtml(note.text)}</strong>
        </div>
    `).join("");

    setCurrentUiContext({
        section: "hotelinfo",
        mode: "detail",
        title: info.title,
        selectedId: info.id,
        filters: {}
    });

    setInfoPanel(`
        ${renderSectionHero(
            info.title,
            info.detail,
            "hotel info",
            `<button class="action-btn" onclick="sendSystemMessage('System : user asked about hotel info ${escapeHtml(info.title)}')">Ask About This</button>`
        )}
        <section class="hotel-info-detail" data-aos="fade-up" data-aos-duration="700">
            <div class="hotel-info-collage" data-aos="fade-right" data-aos-duration="700" data-aos-delay="80">
                <img class="hotel-info-collage-main" src="${collage[0]}" alt="${escapeHtml(info.title)} main image">
                <img src="${collage[1] || collage[0]}" alt="${escapeHtml(info.title)} supporting image 1">
                <img src="${collage[2] || collage[0]}" alt="${escapeHtml(info.title)} supporting image 2">
            </div>
            <div class="hotel-info-copy detail-content" data-aos="fade-left" data-aos-duration="700" data-aos-delay="140">
                <span class="hero-badge">${escapeHtml(info.title)}</span>
                <h3 class="detail-title">${escapeHtml(info.value)}</h3>
                <p class="detail-copy">${escapeHtml(info.summary || info.detail)}</p>
                <div class="tag-row">${renderTagList(info.highlights || [])}</div>
                <div class="hotel-info-note-grid">
                    ${noteRows}
                </div>
            </div>
        </section>
    `);

    renderHotelInfoCardList(info.id);
}

function loadEventInfo(selectedId = 0) {
    const eventPack = eventPackages.find((item) => item.id === Number(selectedId)) || eventPackages[0];
    const facilityList = eventPack.features.join(", ");

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
            "",
            "events",
            ""
        )}
        <section class="detail-grid event-detail-grid" data-aos="fade-up" data-aos-duration="700">
            <div class="detail-gallery event-collage" data-aos="fade-right" data-aos-duration="700" data-aos-delay="80">
                ${renderEventCollage(eventPack)}
            </div>
            <div class="detail-content event-detail-content" data-aos="fade-left" data-aos-duration="700" data-aos-delay="140">
                <div class="event-detail-summary">
                    <h3 class="detail-title" data-aos="fade-up" data-aos-duration="600" data-aos-delay="180">${escapeHtml(eventPack.capacity)}</h3>
                    <p class="detail-copy" data-aos="fade-up" data-aos-duration="600" data-aos-delay="220">${escapeHtml(eventPack.price)}</p>
                    <p class="event-description" data-aos="fade-up" data-aos-duration="600" data-aos-delay="240">${escapeHtml(eventPack.summary)}</p>
                </div>
                <div class="tag-row" data-aos="fade-up" data-aos-duration="600" data-aos-delay="260">${renderEventFeatureButtons(eventPack)}</div>
                <div class="event-info-list" data-aos="fade-up" data-aos-duration="600" data-aos-delay="280">
                    <div class="event-info-row">
                        <strong>Planning flow</strong>
                        <p>${escapeHtml(eventPack.planning)}</p>
                    </div>
                    <div class="event-info-row">
                        <strong>Suggested timing</strong>
                        <p>${escapeHtml(eventPack.timing)}</p>
                    </div>
                    <div class="event-info-row">
                        <strong>On-site support</strong>
                        <p>${escapeHtml(eventPack.service)}</p>
                    </div>
                </div>
                <div class="detail-note-grid event-note-grid">
                    <div class="detail-note" data-aos="fade-up" data-aos-duration="600" data-aos-delay="300">
                        <h4>Event style</h4>
                        <p>${escapeHtml(eventPack.eventType)}</p>
                    </div>
                    <div class="detail-note" data-aos="fade-up" data-aos-duration="600" data-aos-delay="360">
                        <h4>Included facilities</h4>
                        <p>${escapeHtml(facilityList)}</p>
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

window.askEventFeature = async function askEventFeature(eventId, featureIndex) {
    const eventPack = eventPackages.find((item) => item.id === Number(eventId)) || eventPackages[0];
    const feature = eventPack.features[featureIndex];

    if (!feature || typeof window.sendSystemMessage !== "function") {
        return;
    }

    await window.sendSystemMessage(`System : User clicked the ${feature} keyword for ${eventPack.name}. Give a helpful, short explanation in the chat about how ${feature} is included in this ${eventPack.eventType} event package.`);
};

window.resetChatVisual = resetChatVisual;
window.getCurrentUiContext = getCurrentUiContext;
window.openMenuSection = openMenuSection;
window.goHome = goHome;
