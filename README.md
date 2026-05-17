# Hotel Chatbot

This project is a front-end prototype for a hotel assistant experience for Leisure Land Villa. It combines a visual hotel information panel with a chat-style assistant UI intended to route users into sections such as rooms, day-out packages, restaurant details, hotel information, and events.

The current version is a static browser app with CDN-based dependencies and local JavaScript data files. The AI integration flow is partially scaffolded but not fully active yet.

## Current Stack

- HTML, CSS, and vanilla JavaScript
- [Bootstrap 5](https://getbootstrap.com/) via CDN
- [Flowbite](https://flowbite.com/) via CDN
- [AOS](https://michalsnik.github.io/aos/) via CDN
- [Lottie Web Components](https://lottiefiles.com/web-player) via CDN
- Gemini client import via `https://esm.run/@google/generative-ai`

## Project Structure

```text
hotel-chatbot/
├── assets/
│   └── img/                     # Local image assets used by the UI
├── src/
│   └── JavaScriptFiles/
│       ├── hotelInfoArray.js    # Room details and room gallery data
│       └── menuList.js          # Menu categories and room-type summary cards
├── basicFunctions.js            # UI rendering helpers and section loaders
├── index.html                   # Main page layout and script loading
├── script.js                    # Chatbot model setup and response routing
└── style.css                    # Visual styling
```

## How It Works

### 1. Layout

`index.html` splits the page into two main sections:

- Left panel:
  - Main information area (`#info-panel`)
  - Horizontal card list area (`#card-list-body`)
- Right panel:
  - Chat history (`#chatArea`)
  - Chat input (`#chatInput`)

The page loads these local scripts in this order:

1. `src/JavaScriptFiles/hotelInfoArray.js`
2. `src/JavaScriptFiles/menuList.js`
3. `basicFunctions.js`
4. `script.js`

That order matters because the UI helpers depend on the room and menu data being defined globally first.

### 2. UI Rendering

`basicFunctions.js` contains the display logic for the prototype. Important functions include:

- `loadMenuList()`
  - Runs on `DOMContentLoaded`
  - Populates the lower horizontal card section with the main menu categories
- `loadRoomInfoPanel()`
  - Shows room-type summary cards such as Standard, Delux, Family, and Suit
- `loadHotelRoomsMainPanel(id)`
  - Renders a larger room detail panel using the selected `roomInfo` entry
- `loadHotelRoomsList()`
  - Builds the room carousel/list section from the `roomInfo` array
- `loadDayout()`, `loadRestaurantInfo()`, `loadMainHotelInfo()`, `loadEventInfo()`, `loadGreetings()`
  - Swap the content shown in the left main panel
- `sendMessage()` and `sendBotMessage(message)`
  - Append user/bot chat bubbles to the chat area

### 3. Data Sources

`src/JavaScriptFiles/hotelInfoArray.js` defines:

- `roomInfo`
  - Detailed per-room entries used by the main room detail panel and room list

`src/JavaScriptFiles/menuList.js` defines:

- `menuList`
  - Top-level category cards shown in the scrollable menu area
- `roomInfoList`
  - High-level room category cards shown before a specific room is selected

### 4. Intended Chatbot Flow

`script.js` is designed to use Gemini as a classifier plus response generator.

The intended model response format is:

```text
<MainService> : <S2> : <S3> : <S4> : <S5> : <Duration> | <Normal text reply>
```

The first keyword is meant to drive the UI:

- `room`
- `dayout`
- `restaurant`
- `hotelinfo`
- `event`
- `greetings`
- `system`

In the intended flow:

1. The user types a message
2. The app sends it to Gemini
3. Gemini returns both:
   - a structured classification prefix
   - a natural-language reply
4. The app parses the prefix
5. The UI loads the matching section
6. The bot reply is shown in the chat area

There is also a `sendSystemMessage(inputMessage)` path intended for menu clicks and guided booking actions.

## Running the Prototype

Because this is a static front-end project, the simplest way to run it is to serve the folder with a local HTTP server instead of opening the file directly.

Examples:

```powershell
# Python
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

If you use a different local server, make sure it serves the repository root so that `/assets/...` and `/src/...` paths resolve correctly.

## Current Status and Known Gaps

This section describes the repo as it exists now.

### Chat integration is scaffolded but not fully active

In `script.js`, the core chat request/response logic inside `sendHotelMessage()` and `sendSystemMessage()` is commented out. That means:

- user text is not currently being sent to Gemini
- structured keyword parsing is not currently running
- bot replies are not currently being appended through the intended live path

### API key is still a placeholder

`script.js` currently contains:

```js
const API_KEY = "Replace the API KEY"
```

So the AI integration is not ready to run without configuration changes.

### Some data looks like placeholder or repeated content

Examples:

- multiple room entries repeat the same room name and image set
- some room categories use placeholder-style pricing ranges
- labels such as `Delux` and `Suit` appear to be spelling variants rather than finalized content

### Some UI sections are still placeholders

`loadRestaurantInfo()`, `loadMainHotelInfo()`, and `loadEventInfo()` currently render the same Lottie-based placeholder panel rather than distinct information views.

### There are a few implementation details to revisit later

Examples visible from the current code:

- `loadHotelRoomsList()` loops with `id <= roomInfo.length`, which will attempt one index past the end of the array
- some chat flow variables are referenced only inside commented sections
- the initial Gemini chat history contains sample hotel details that do not fully match the rest of the Leisure Land Villa data

## Suggested Next Documentation Additions

If you want to keep improving the docs before changing app logic, the next useful additions would be:

- a setup section for API key configuration
- a feature roadmap
- a UI flow diagram for menu clicks and chat classification
- a content management note describing where hotel details should be updated

## Summary

This repository is a solid front-end prototype with:

- a working static hotel UI shell
- reusable section-rendering helpers
- local data-driven room and menu content
- an AI routing concept already outlined in code

The biggest unfinished piece is connecting the live chat flow back into the UI reliably and replacing placeholder content with finalized hotel data.
