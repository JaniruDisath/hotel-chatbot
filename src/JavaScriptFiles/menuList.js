let menuList = [
    {
        name: "Greetings",
        image: "assets/img/menu-list/greetings-pic.jpg",
        methodCall: "loadGreetings()",
        systemSendMessage: "sendSystemMessage('System : User selected greetings')"
    },
    {
        name: "Rooms",
        image: "assets/img/menu-list/room-pic.jpg",
        methodCall: "loadRoomInfoPanel()",
        systemSendMessage: ""
    },
    {
        name: "Dayout",
        image: "assets/img/menu-list/dayout-pic.jpg",
        methodCall: "loadDayout()",
        systemSendMessage: "sendSystemMessage('System : User selected dayout')"
    },
    {
        name: "Restaurant",
        image: "assets/img/menu-list/restaurant-pic.jpg",
        methodCall: "loadRestaurantInfo()",
        systemSendMessage: "sendSystemMessage('System : User selected restaurant')"
    },
    {
        name: "Hotel Info",
        image: "assets/img/menu-list/hotelinfo-pic.jpg",
        methodCall: "loadMainHotelInfo()",
        systemSendMessage: "sendSystemMessage('System : User selected hotelinfo')"
    },
    {
        name: "Events",
        image: "assets/img/menu-list/event-pic.jpg",
        methodCall: "loadEventInfo()",
        systemSendMessage: "sendSystemMessage('System : User selected event')"
    }
];

let roomInfoList = [
    {
        name: "Standard",
        type: "standard",
        capacity: "Up to 2 guests",
        price: "LKR 20,000 - 24,000",
        summary: "Easy, quiet stays for couples and short stopovers.",
        pic: "assets/img/hotel-rooms/room-info/standard-pic.jpg"
    },
    {
        name: "Deluxe",
        type: "deluxe",
        capacity: "Up to 4 guests",
        price: "LKR 25,000 - 32,000",
        summary: "Extra floor space with balcony and pool-facing options.",
        pic: "assets/img/hotel-rooms/room-info/delux-pic.jpg"
    },
    {
        name: "Family",
        type: "family",
        capacity: "Up to 6 guests",
        price: "LKR 42,000 - 49,000",
        summary: "Flexible family layouts with multiple real beds.",
        pic: "assets/img/hotel-rooms/room-info/family-pic.jpg"
    },
    {
        name: "Suite",
        type: "suite",
        capacity: "Up to 4 guests",
        price: "LKR 68,000 - 74,000",
        summary: "Premium stays with private comfort and the best views.",
        pic: "assets/img/hotel-rooms/room-info/suit-pic.jpg"
    }
];

let dayoutPackages = [
    {
        id: 0,
        name: "Pool Escape",
        activityType: "poolday",
        duration: "Full Day",
        price: "LKR 6,500 per person",
        image: "assets/img/dayout/dayout-pic.jpg",
        highlights: ["Pool access", "Welcome drink", "Changing room", "Towel service"],
        summary: "A simple day-out built around the shared pool with snacks and a relaxed afternoon feel."
    },
    {
        id: 1,
        name: "BBQ Garden Hangout",
        activityType: "bbq",
        duration: "Afternoon to Evening",
        price: "LKR 8,000 per person",
        image: "assets/img/dayout/dayout-pic.jpg",
        highlights: ["BBQ platter", "Garden seating", "Music setup", "Bonfire corner"],
        summary: "Best for small friend groups wanting a casual garden event without an overnight stay."
    },
    {
        id: 2,
        name: "Family Splash Day",
        activityType: "poolday",
        duration: "Morning to Evening",
        price: "LKR 24,000 for 4 guests",
        image: "assets/img/dayout/dayout-pic.jpg",
        highlights: ["Kid-friendly meals", "Pool access", "Locker use", "Tea break"],
        summary: "A family-focused package with meals, changing space, and enough time to enjoy both shared pools."
    }
];

let restaurantSections = [
    {
        id: 0,
        name: "Breakfast",
        mealType: "breakfast",
        feature: "buffet",
        summary: "Sri Lankan breakfast favourites, fresh fruit, bakery items, and made-to-order eggs.",
        items: [
            { name: "Villa Sunrise Buffet", price: "LKR 2,200", tag: "buffet" },
            { name: "Hoppers and Katta Sambol", price: "LKR 1,450", tag: "local" },
            { name: "Tropical Fruit Bowl", price: "LKR 950", tag: "vegetarian" }
        ]
    },
    {
        id: 1,
        name: "Lunch & Dinner",
        mealType: "lunch",
        feature: "takeaway",
        summary: "Fresh seafood, grilled meats, curries, and sharing plates for stay-in or public guests.",
        items: [
            { name: "Seafood Platter", price: "LKR 5,900", tag: "seafood" },
            { name: "Garden Veg Rice Bowl", price: "LKR 1,850", tag: "vegetarian" },
            { name: "Leisure Land Mixed Grill", price: "LKR 4,200", tag: "bbq" }
        ]
    },
    {
        id: 2,
        name: "Drinks & Desserts",
        mealType: "drinks",
        feature: "roomservice",
        summary: "Mocktails, coffee, cakes, and late-evening comfort orders for guests.",
        items: [
            { name: "Coconut Cloud Mocktail", price: "LKR 850", tag: "drinks" },
            { name: "Chocolate Lava Cake", price: "LKR 1,150", tag: "desserts" },
            { name: "Iced Ceylon Coffee", price: "LKR 780", tag: "drinks" }
        ]
    }
];

let eventPackages = [
    {
        id: 0,
        name: "Garden Wedding Setup",
        eventType: "wedding",
        capacity: "Up to 120 guests",
        price: "From LKR 450,000",
        image: "assets/img/menu-list/event-pic.jpg",
        features: ["Stage", "Sound", "Catering", "Photo-ready backdrop"],
        summary: "A full outdoor wedding concept with reception flow, basic decor, and catering support."
    },
    {
        id: 1,
        name: "Corporate Day Retreat",
        eventType: "conference",
        capacity: "Up to 60 guests",
        price: "From LKR 180,000",
        image: "assets/img/menu-list/event-pic.jpg",
        features: ["Projector", "Sound", "Lunch buffet", "Parking"],
        summary: "A business-friendly setup for offsite meetings, workshops, and team strategy sessions."
    },
    {
        id: 2,
        name: "Poolside Birthday Party",
        eventType: "birthday",
        capacity: "Up to 40 guests",
        price: "From LKR 95,000",
        image: "assets/img/menu-list/event-pic.jpg",
        features: ["Pool access", "BBQ corner", "Music", "Dessert table"],
        summary: "A lively celebration package for private birthdays with light decor and evening-friendly flow."
    }
];

let hotelInfoCards = [
    {
        title: "Location",
        value: "Kalahe, Galle, Sri Lanka",
        detail: "Close to Galle, Unawatuna, and tea-estate routes."
    },
    {
        title: "Stay-In Opening",
        value: "6:00 A.M.",
        detail: "Early arrivals can relax in common areas until check-in is ready."
    },
    {
        title: "Day-Out Opening",
        value: "8:30 A.M.",
        detail: "Pool and package guests are welcomed from mid-morning onward."
    },
    {
        title: "Restaurant Hours",
        value: "5:30 A.M. - 11:00 P.M.",
        detail: "Public service begins from 8:30 A.M.; stay-in guests can order earlier."
    },
    {
        title: "Pools",
        value: "2 shared + 1 private + 1 jacuzzi",
        detail: "Private pool access depends on room selection. Jacuzzi is suite-only."
    },
    {
        title: "Contact",
        value: "+94 91 555 0101",
        detail: "Dummy contact number for prototype use."
    }
];
