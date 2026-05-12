let menuList = [
    {
        name: "Greetings",
        image: "assets/img/menu-list/greetings-pic.jpg",
        actionName: "loadGreetings",
        chatMessage: "Welcome to Leisure Land Villa. You can ask me about rooms, day-out packages, dining, hotel information, or events.",
        systemPrompt: "System : User selected greetings"
    },
    {
        name: "Rooms",
        image: "assets/img/menu-list/room-pic.jpg",
        actionName: "loadRoomInfoPanel",
        chatMessage: "You are in the rooms section now. Tell me how many guests you have, and I will match the best room.",
        systemPrompt: "System : User selected room"
    },
    {
        name: "Dayout",
        image: "assets/img/menu-list/dayout-pic.jpg",
        actionName: "loadDayout",
        chatMessage: "You are in the day-out section now. Tell me whether you want a pool day, BBQ, sightseeing, sports, spa, or a beach-style day out.",
        systemPrompt: "System : User selected dayout"
    },
    {
        name: "Restaurant",
        image: "assets/img/menu-list/restaurant-pic.jpg",
        actionName: "loadRestaurantInfo",
        chatMessage: "You are in the restaurant section now. Tell me if you want breakfast, lunch, dinner, snacks, or drinks.",
        systemPrompt: "System : User selected restaurant"
    },
    {
        name: "Hotel Info",
        image: "assets/img/menu-list/hotelinfo-pic.jpg",
        actionName: "loadMainHotelInfo",
        chatMessage: "You are in hotel information now. Ask me about facilities, opening hours, contact details, rules, or location.",
        systemPrompt: "System : User selected hotelinfo"
    },
    {
        name: "Events",
        image: "assets/img/events/garden-wedding.jpg",
        actionName: "loadEventInfo",
        chatMessage: "You are in the events section now. Tell me whether you are planning a wedding, birthday, conference, meeting, or party.",
        systemPrompt: "System : User selected event"
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
        serviceImage: "assets/img/restaurant/buffet-service.tmp.jpg",
        hoursImage: "assets/img/restaurant/dessert-hours.tmp.jpg",
        publicImage: "assets/img/restaurant/public-dining.tmp.jpg",
        items: [
            { name: "Villa Sunrise Buffet", price: "LKR 2,200", tag: "buffet", image: "assets/img/restaurant/breakfast-buffet.tmp.jpg" },
            { name: "Hoppers and Katta Sambol", price: "LKR 1,450", tag: "local", image: "assets/img/restaurant/restaurant-local.tmp.jpg" },
            { name: "Tropical Fruit Bowl", price: "LKR 950", tag: "vegetarian", image: "assets/img/restaurant/fruit-bowl.tmp.jpg" }
        ]
    },
    {
        id: 1,
        name: "Lunch & Dinner",
        mealType: "lunch",
        feature: "takeaway",
        summary: "Fresh seafood, grilled meats, curries, and sharing plates for stay-in or public guests.",
        serviceImage: "assets/img/restaurant/restaurant-local.tmp.jpg",
        hoursImage: "assets/img/restaurant/public-dining.tmp.jpg",
        publicImage: "assets/img/restaurant/public-takeaway.tmp.jpg",
        items: [
            { name: "Seafood Platter", price: "LKR 5,900", tag: "seafood", image: "assets/img/restaurant/restaurant-local.tmp.jpg" },
            { name: "Garden Veg Rice Bowl", price: "LKR 1,850", tag: "vegetarian", image: "assets/img/restaurant/veg-rice-bowl.tmp.jpg" },
            { name: "Leisure Land Mixed Grill", price: "LKR 4,200", tag: "bbq", image: "assets/img/restaurant/buffet-service.tmp.jpg" }
        ]
    },
    {
        id: 2,
        name: "Drinks & Desserts",
        mealType: "drinks",
        feature: "roomservice",
        summary: "Mocktails, coffee, cakes, and late-evening comfort orders for guests.",
        serviceImage: "assets/img/restaurant/public-dining.tmp.jpg",
        hoursImage: "assets/img/restaurant/iced-coffee.tmp.jpg",
        publicImage: "assets/img/restaurant/restaurant-local.tmp.jpg",
        items: [
            { name: "Coconut Cloud Mocktail", price: "LKR 850", tag: "drinks", image: "assets/img/restaurant/public-dining.tmp.jpg" },
            { name: "Chocolate Lava Cake", price: "LKR 1,150", tag: "desserts", image: "assets/img/restaurant/dessert-hours.tmp.jpg" },
            { name: "Iced Ceylon Coffee", price: "LKR 780", tag: "drinks", image: "assets/img/restaurant/iced-coffee.tmp.jpg" }
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
        image: "assets/img/events/garden-wedding.jpg",
        gallery: [
            "assets/img/events/garden-wedding.jpg",
            "assets/img/events/wedding-reception.jpg",
            "assets/img/events/wedding-table.jpg"
        ],
        features: ["Stage", "Sound", "Catering", "Photo-ready backdrop"],
        planning: "Ceremony seating, reception movement, and dining areas are arranged as one connected outdoor flow.",
        timing: "Best suited for afternoon ceremonies moving into evening reception service.",
        service: "Includes basic coordination support for guest arrival, vendor setup, meal timing, and photo moments.",
        summary: "A full outdoor wedding concept with reception flow, basic decor, and catering support."
    },
    {
        id: 1,
        name: "Corporate Day Retreat",
        eventType: "conference",
        capacity: "Up to 60 guests",
        price: "From LKR 180,000",
        image: "assets/img/events/corporate-retreat.jpg",
        gallery: [
            "assets/img/events/corporate-retreat.jpg",
            "assets/img/events/corporate-meeting.jpg",
            "assets/img/events/corporate-workshop.jpg"
        ],
        features: ["Projector", "Sound", "Lunch buffet", "Parking"],
        planning: "Designed for structured sessions, breakout conversations, meals, and relaxed team time.",
        timing: "Works well as a half-day or full-day retreat with morning setup and lunch service.",
        service: "The team can support seating layouts, presentation needs, refreshment breaks, and arrival parking.",
        summary: "A business-friendly setup for offsite meetings, workshops, and team strategy sessions."
    },
    {
        id: 2,
        name: "Poolside Birthday Party",
        eventType: "birthday",
        capacity: "Up to 40 guests",
        price: "From LKR 95,000",
        image: "assets/img/events/poolside-birthday.jpg",
        gallery: [
            "assets/img/events/poolside-birthday.jpg",
            "assets/img/events/birthday-cake.jpg",
            "assets/img/events/birthday-table.jpg"
        ],
        features: ["Pool access", "BBQ corner", "Music", "Dessert table"],
        planning: "A compact party setup with pool time, food stations, music space, and cake-cutting moments.",
        timing: "Best for late afternoon celebrations that can continue into an easy evening gathering.",
        service: "Includes light decor placement, food table setup, BBQ support, and party flow guidance.",
        summary: "A lively celebration package for private birthdays with light decor and evening-friendly flow."
    }
];

let hotelInfoCards = [
    {
        id: 0,
        title: "Location",
        value: "Kalahe, Galle, Sri Lanka",
        detail: "Close to Galle, Unawatuna, and tea-estate routes.",
        image: "assets/img/menu-list/hotelinfo-pic.jpg",
        collage: [
            "assets/img/menu-list/hotelinfo-pic.jpg",
            "assets/img/menu-list/dayout-pic.jpg",
            "assets/img/hotel-rooms/room 0/img1.jpg"
        ],
        summary: "Leisure Land Villa sits in Kalahe, giving guests a quiet garden base with quick access to Galle, Unawatuna, and nearby tea-estate roads.",
        highlights: ["Kalahe base", "Near Galle", "Garden setting", "Easy day trips"],
        notes: [
            { label: "Area", text: "Kalahe, Galle" },
            { label: "Best for", text: "Guests who want a calm stay close to coastal attractions." }
        ]
    },
    {
        id: 1,
        title: "Stay-In Opening",
        value: "6:00 A.M.",
        detail: "Early arrivals can relax in common areas until check-in is ready.",
        image: "assets/img/hotel-rooms/room 0/img2.jpg",
        collage: [
            "assets/img/hotel-rooms/room 0/img2.jpg",
            "assets/img/menu-list/room-pic.jpg",
            "assets/img/restaurant/breakfast-buffet.jpg"
        ],
        summary: "Stay-in guests can arrive from 6:00 A.M. and settle into the common areas while the room team prepares their booking.",
        highlights: ["Early arrival", "Common areas", "Breakfast access", "Room support"],
        notes: [
            { label: "Opening", text: "6:00 A.M." },
            { label: "Arrival flow", text: "Guests can relax first and move into rooms once ready." }
        ]
    },
    {
        id: 2,
        title: "Day-Out Opening",
        value: "8:30 A.M.",
        detail: "Pool and package guests are welcomed from mid-morning onward.",
        image: "assets/img/dayout/dayout-pic.jpg",
        collage: [
            "assets/img/dayout/dayout-pic.jpg",
            "assets/img/menu-list/dayout-pic.jpg",
            "assets/img/restaurant/fruit-bowl.jpg"
        ],
        summary: "Day-out visitors are welcomed from 8:30 A.M., with pool time, food service, and package activities arranged for the daytime visit.",
        highlights: ["8:30 A.M. start", "Pool time", "Meal options", "Family friendly"],
        notes: [
            { label: "Opening", text: "8:30 A.M." },
            { label: "Guest type", text: "Ideal for pool, meal, and daytime package guests." }
        ]
    },
    {
        id: 3,
        title: "Restaurant Hours",
        value: "5:30 A.M. - 11:00 P.M.",
        detail: "Public service begins from 8:30 A.M.; stay-in guests can order earlier.",
        image: "assets/img/restaurant/restaurant-local.jpg",
        collage: [
            "assets/img/restaurant/restaurant-local.jpg",
            "assets/img/restaurant/breakfast-buffet.jpg",
            "assets/img/restaurant/dessert-hours.jpg"
        ],
        summary: "The restaurant supports early stay-in orders from 5:30 A.M. and opens public service from 8:30 A.M. through late evening.",
        highlights: ["Early breakfast", "Public dining", "Takeaway", "Late service"],
        notes: [
            { label: "Full hours", text: "5:30 A.M. - 11:00 P.M." },
            { label: "Public service", text: "Starts from 8:30 A.M." }
        ]
    },
    {
        id: 4,
        title: "Pools",
        value: "2 shared + 1 private + 1 jacuzzi",
        detail: "Private pool access depends on room selection. Jacuzzi is suite-only.",
        image: "assets/img/dayout/dayout-pic.jpg",
        collage: [
            "assets/img/dayout/dayout-pic.jpg",
            "assets/img/hotel-rooms/room 0/img3.jpg",
            "assets/img/menu-list/hotelinfo-pic.jpg"
        ],
        summary: "Pool facilities include shared swimming areas, selected private-pool access, and a suite-only private jacuzzi experience.",
        highlights: ["2 shared pools", "Private pool", "Suite jacuzzi", "Pool packages"],
        notes: [
            { label: "Shared pools", text: "Two shared pools are available." },
            { label: "Private access", text: "Private pool and jacuzzi depend on room selection." }
        ]
    },
    {
        id: 5,
        title: "Contact",
        value: "+94 91 555 0101",
        detail: "Dummy contact number for prototype use.",
        image: "assets/img/leisrue Land Logo.jpg",
        collage: [
            "assets/img/leisrue Land Logo.jpg",
            "assets/img/menu-list/greetings-pic.jpg",
            "assets/img/menu-list/hotelinfo-pic.jpg"
        ],
        summary: "For this prototype, guests can use the placeholder contact number while the final booking and enquiry channels are being prepared.",
        highlights: ["Phone support", "Prototype number", "Guest enquiries", "Booking help"],
        notes: [
            { label: "Phone", text: "+94 91 555 0101" },
            { label: "Status", text: "Dummy contact number for prototype use." }
        ]
    }
];
