let menuList = [
    {
        name: "Greetings",
        image: "/assets/img/menu-list/greetings-pic.jpg",
        methodCall: "loadGreetings()",
        systemSendMessage : "sendSystemMessage('System : User Seleted Greetings Option')"
    },
    {
        name: "Rooms",
        image: "/assets/img/menu-list/room-pic.jpg",
        methodCall: "loadRoomInfoPanel()",
        systemSendMessage : "sendSystemMessage('System : User Seleted Rooms Option')"
    },
    {
        name: "Dayout",
        image: "/assets/img/menu-list/dayout-pic.jpg",
        methodCall: "loadDayout()",
        systemSendMessage : "sendSystemMessage('System : User Seleted Dayout Option')"
    },
    {
        name: "Restaurant",
        image: "/assets/img/menu-list/restaurant-pic.jpg",
        methodCall: "loadRestaurantInfo()",
        systemSendMessage : "sendSystemMessage('System : User Seleted Restaurant Option')"
    },
    {
        name: "Hotelinfo",
        image: "/assets/img/menu-list/hotelinfo-pic.jpg",
        methodCall: "loadMainHotelInfo()",
        systemSendMessage : "sendSystemMessage('System : User Seleted Hotelinfo Option')"
    },
    {
        name: "Events",
        image: "/assets/img/menu-list/event-pic.jpg",
        methodCall: "loadEventInfo()",
        systemSendMessage : "sendSystemMessage('System : User Seleted Events Option')"
    }
];

let roomInfoList = [
    {
        name : "Standard",
        capacity : "2 Guests",
        price : "20,000 - 40,000",
        pic : "/assets/img/hotel-rooms/room-info/standard-pic.jpg"
    },
    {
        name : "Delux",
        capacity : "2 - 4 Guests",
        price : "25,000 - 50,000",
        pic: "/assets/img/hotel-rooms/room-info/delux-pic.jpg"
    },
    {
        name : "Family",
        capacity : "5 - 7 Guests",
        price : "35,000 - 60,000",
        pic: "/assets/img/hotel-rooms/room-info/family-pic.jpg"
    },
    {
        name : "Suit",
        capacity : "5 - 10 Guests",
        price : "80,000 - 150,000",
        pic: "/assets/img/hotel-rooms/room-info/suit-pic.jpg"
    }
];