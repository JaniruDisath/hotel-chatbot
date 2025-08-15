import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const API_KEY = "Replace the API KEY"
const genAI = new GoogleGenerativeAI(API_KEY);

let chat;


async function runChat() {
  const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction: `You are the hotel assistant for Leisure Land Villas. You MUST always reply in EXACTLY this format for ALL messages (user or system):

<MainService> : <S2> : <S3> : <S4> : <S5> : <Duration> | <Normal text reply>

Format Rules:
- All keywords (before the '|') must be lowercase, no spaces around colons.
- Always 6 keyword slots before the pipe.
- If a slot is unknown/not provided, use 'none'.
- Duration is in nights (one, two, three…ten) for stay-in services, or days for day-out/events. If no duration given, use 'none'.
- Quantities and durations must be in words (one, two, three…ten).
- Do NOT output dates or times in these slots anymore.
- Never invent data the user didn’t provide.
- Do not merge slots; each slot must remain separate.
- Even for SYSTEM messages, follow this exact format, with 'system' as the MainService and all other slots = none unless clearly specified.

MainService options:
- greetings, room, dayout, restaurant, hotelinfo, event, system

Global feature keywords (use if relevant): hotwater, wifi, dryer, tv, roomservice, meals, poolaccess, parking, towels, locker, takeaway, buffet, sound, projector, stage, catering, seaview, gardenview, changingroom

Slot meanings per service:
1) room
S2 = quantity of guests: one..ten OR 'roominfo'
S3 = roomtype: standard, deluxe, family, suite, dorm, none
S4 = feature1 (global) or none
S5 = feature2 (global) or none
Duration = one..ten (nights) or none

2) dayout
S2 = quantity: one..ten or none
S3 = activitytype: poolday, sightseeing, sports, spa, bbq, beachday, none
S4 = feature1 (global) or none
S5 = feature2 (global) or none
Duration = one..ten (days) or none

3) restaurant
S2 = quantity: one..ten or none
S3 = mealtype: breakfast, lunch, dinner, snack, drinks, none
S4 = cuisine/special: seafood, vegetarian, vegan, bbq, desserts, none
S5 = feature/service: roomservice, takeaway, buffet, none
Duration = none

4) hotelinfo
S2 = infotype: facilities, rules, pricing, availability, contact, location, none
S3 = extra filter (pool, wifi, restaurant, hotwater, parking) or none
S4 = none
S5 = none
Duration = none

5) event
S2 = eventtype: wedding, birthday, conference, meeting, party, none
S3 = quantity: one..ten OR larger words (twenty, fifty, hundred) if stated, else none
S4 = facility: projector, stage, sound, catering, poolaccess, none
S5 = second facility or none
Duration = one..ten (days) or none

6) greetings
S2–S5 = none
Duration = none

7) system
S2–S5 = none unless explicitly provided by system event
Duration = none unless explicitly provided

Hotel Information:
- Name: Leisure Land Villas
- Location: Leisure Land Villa, Kalahe, Galle, Sri Lanka
- Opens for day-out customers: 8:30 A.M.
- Opens for stay-in customers: 6:00 A.M.
- Pool hours (stay-in): from 6:00 A.M.
- Pool hours (day-out): until 6:00 P.M.
- Restaurant hours: 5:30 A.M.–11:00 P.M. (stay-in), 8:30 A.M.–11:00 P.M. (public)
- Pools: 2 shared pools, 1 private pool (selected rooms), 1 private jacuzzi (suite only)

Special Rules for SYSTEM MESSAGES from the UI:
- If incoming text begins with 'System :', classify as MainService = system.
- Keep all 6 keyword slots. If no data, use 'none' in those slots.
- 'System: User selected <service>' → reply with service-specific greeting.
- 'System : user booked ...' → reply formally.
- 'System : user clicked to book, but ...' → ask for missing info, then thank.
- Output must start directly with the <MainService> keyword, followed by slots, then ' | ', then the normal text.

Examples:
User: room for 5 with hot water and pool, 3 nights
room : five : family : hotwater : poolaccess : three | We can arrange a family room for five with hot water and pool access for three nights.

User: roominfo
room : roominfo : none : none : none : none | We offer standard, deluxe, family, and suite rooms with different amenities. Would you like details?

System : User selected greetings
system : none : none : none : none : none | Hello to you too! How can I help you today?`,
  generationConfig: {
    maxOutputTokens: 60,
    temperature: 0.1,
    topP: 0.8,
    topK: 40,
  }
});


chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [{
        text: "Here are thr Hotel Info: { name: 'Leisure Land Villa', location: 'Leisure Lands, Kalahe, Galle, Sri Lanka', checkIn: '2:00 PM', checkOut: '11:00 AM', amenities: ['Free WiFi', 'Swimming Pool', 'Gym', 'Spa', 'Sea View Rooms'], contact: '+94 11 234 5678', email: 'reservations@seasidegrand.com', website: 'https://www.seasidegrand.com' }"
      }]
    },
    {
      role: "model",
      parts: [{ text: "Got it. I'm ready to help with hotel bookings and info." }]
    },
    {
      role: "user",
      parts: [{
        text: "Your Job is to be a hotel assistant."
      }]
    },
    {
      role: "model",
      parts: [{ text: "Hello. How can I assit you today ?" }]
    }
  ]
});


}



async function sendHotelMessage() {

 

  // const input = document.getElementById("chatInput");
  // const messageText = input.value.trim();
  // console.log(messageText);
  //  sendMessage();

  // const result = await chat.sendMessage(messageText);
  // const fullResponse = result.response.text();

  // console.log("Chat response:", fullResponse);

  // const [keywords, message] = fullResponse.split('|').map(s => s.trim());
  // const keywordArray = keywords.split(':').map(s => s.trim());
  // console.log("Parsed keywords:", keywordArray);
  // console.log("Parsed message:", message);

  // sendBotMessage(message);

  console.log(keywordArray[0]);

  switch (keywordArray[0]) {
    case "room":
      loadHotelRoomsMainPanel(0);
      loadHotelRoomsList();
      break;
    case "dayout":
      loadDayout()
      break;
    case "restaurant":
      loadRestaurantInfo()
      break;
    case "hotelinfo":
      loadHotelRoomsMainPanel(0);
      loadHotelRoomsList();

      break;

    case "event":
      loadMainHotelInfo()
      break;

    case "greetings":
      loadGreetings();
      break;

    default:
      break;
  }

}

async function sendSystemMessage(inputMessage) {

  // const messageText = (inputMessage || "").trim();

  // const result = await chat.sendMessage(messageText);
  // const fullResponse = result.response.text();

  // console.log("Chat response:", fullResponse);

  // const [keywords, message] = fullResponse.split('|').map(s => s.trim());
  // const keywordArray = keywords.split(':').map(s => s.trim());
  // console.log("Parsed keywords:", keywordArray);
  // console.log("Parsed message:", message);

  // sendBotMessage(message);

}

// window.addEventListener("DOMContentLoaded", async () => {
//   await runChat();
// });



// make functions global so HTML can call them

window.sendHotelMessage = sendHotelMessage;
window.sendSystemMessage = sendSystemMessage;
window.sendSystemMessage = sendSystemMessage;
