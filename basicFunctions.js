function scrollLeft() {
    document.querySelector('.scroll-container').scrollBy({
        left: -200,
        behavior: 'smooth'
    });
}
function scrollRight() {
    document.querySelector('.scroll-container').scrollBy({
        left: 200,
        behavior: 'smooth'
    });
}

let chatMessages = [];

function sendMessage() {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();

    if (message === "") return; // Ignore empty messages

    // Add message to array
    chatMessages.push(message);

    // Generate chat bubble HTML
    let newMessageHTML = `
        <div style="margin-bottom: 5%;" class="flex items-start gap-2.5 mt-3" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="500">
            
            <div class="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-s-xl rounded-ee-xl">
                <div class="flex items-center space-x-2">
                    <span class="text-sm font-semibold text-gray-900">You</span>
                </div>
                <p class="text-sm font-normal py-2.5 text-gray-900">${message}</p>
            </div>
            <img class="w-8 h-8 rounded-full" src="/assets/img/leisrue Land Logo.jpg" alt="User Image"
                style="border: 2px solid black;">
        </div>
        `;

    // Update chat area
    document.getElementById("chatArea").innerHTML += newMessageHTML;

    // Clear input
    input.value = "";
}

function sendBotMessage(message) {
    const input = document.getElementById("chatInput");

    // Add message to array
    chatMessages.push(message);

    // Generate chat bubble HTML
    let newMessageHTML = `
        <div style="margin-bottom: 5%;" class="flex items-start gap-2.5" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="500">
                            <img class="w-8 h-8 rounded-full" src="/assets/img/leisrue Land Logo.jpg" alt="Jese image"
                                style="border: 2px solid black;">

                            <div
                                class="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                                <div class="flex items-center space-x-2 rtl:space-x-reverse">
                                    <span class="text-sm font-semibold text-gray-900 dark:text-white">Hotel Help
                                        Assistant</span>
                                </div>
                                <p class="text-sm font-normal py-2.5 text-gray-900 dark:text-white">${message}</p>
                            </div>


                        </div>
        `;

    // Update chat area
    document.getElementById("chatArea").innerHTML += newMessageHTML;

    // Clear input
    input.value = "";
}



function loadHotelRoomsMainPanel(id) {

    let panel = `<table style="width: 100%; height: 100%; border-collapse: collapse; table-layout: fixed;" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="250">
                            <tr style="height: 50%;">
                                <td  style=" padding: 0;">
                                    <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel"
                                        style="height: 100%;">
                                        <div class="carousel-inner" style="height: 100%;">
                                            <div class="carousel-item active" style="height: 100%;">
                                                <img src="${roomInfo[id].pic1}" class="d-block w-100 h-100"
                                                    style="object-fit: cover;" alt="">
                                            </div>
                                            <div class="carousel-item" style="height: 100%;">
                                                <img src="${roomInfo[id].pic2}" class="d-block w-100 h-100"
                                                    style="object-fit: cover;" alt="">
                                            </div>
                                            <div class="carousel-item" style="height: 100%;">
                                                <img src="${roomInfo[id].pic3}" class="d-block w-100 h-100"
                                                    style="object-fit: cover;" alt="">
                                            </div>
                                        </div>
                                        <button class="carousel-control-prev" type="button"
                                            data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                                            <span class="carousel-control-prev-icon"></span>
                                        </button>
                                        <button class="carousel-control-next" type="button"
                                            data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                                            <span class="carousel-control-next-icon"></span>
                                        </button>
                                    </div>
                                </td>
                                <td style=" text-align: left; padding-left: 10%;">

                                    <div id="room-details">
                                        <p id="room-size"><strong>Size:</strong> ${roomInfo[id].size} m²</p>
                                        <p id="room-capacity"><strong>Capacity:</strong> ${roomInfo[id].capacityString}</p>
                                        <p id="bed-type"><strong>Bed:</strong> ${roomInfo[id].bed}</p>
                                        <p id="room-amenities"><strong>Amenities:</strong> ${roomInfo[id].amenities}</p>
                                        <p id="free-perks"><strong>Free Perks:</strong> ${roomInfo[id].freePerks}</p>
                                        <p id="cancellation-policy"><strong>Cancellation:</strong> ${roomInfo[id].Cancellation}</p>
                                    </div>
                                </td>
                            </tr>
                            <tr style="height: 50%;">
                                <td style="; text-align: center;">
                                    <h5 class="card-title">${roomInfo[id].roomName}</h5>
                                </td>
                                
                                <td  > 
                                <button type="button" style=" text-align: center; width:100%" class="btn btn-success">Book Now For ${roomInfo[id].price} </button>
                                </td>
                            </tr>
                        </table>`

    document.getElementById("info-panel").innerHTML = panel;

}

function loadHotelRoomsList() {

    document.getElementById("card-list-body").innerHTML = "";

    for (let id = 0; id <= roomInfo.length; id++) {


        let listPanel = `<div style="width: 92vw; margin: 1%;" class="row" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="250">
                                        <div class="col" data-aos="fade-up" data-aos-duration="1000"
                                            data-aos-delay="400">
                                            <div style="width: 32vw; height: 23vh; padding: 1%; ;"
                                                class="cardss">
                                                <div class="card-body" style="display: flex; align-items: center;">

                                                    <!-- Left side: Image -->
                                                    <div style="width: 35%;">
                                                        <img id="room-image" src="${roomInfo[id].pic1}" alt="Room Image"
                                                            style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                                                    </div>

                                                    <!-- Right side: Info -->
                                                    <div
                                                        style="flex: 2; padding-left: 5%; padding-top: 2%; display: flex; flex-direction: column; justify-content: center;">
                                                        <h4 id="room-name" style="margin: 0; font-size: 1.48rem;">${roomInfo[id].roomName}</h4>
                                                        <p style="margin-top:  10%;"><strong>NO. Of Guests :</strong>${roomInfo[id].capacityString}</p>
                                                        <p><strong>Bed :</strong> ${roomInfo[id].bed} </p>
                                                        <p><strong>Price :</strong> ${roomInfo[id].price} </p>

                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>`;

        document.getElementById("card-list-body").innerHTML += listPanel;

    }
}

function loadGreetings() {

    let greetingsPanel = ` <dotlottie-wc style=" padding: 1% ;height: 59vh; display: flex; justify-content: center; align-items: center;"
                            src="https://lottie.host/9764f681-ecca-43fa-ae03-66ca794477b2/hLPcEaC0oG.lottie"
                            style="width: 300px;height: 300px" speed="1" autoplay loop></dotlottie-wc>
`
    document.getElementById("info-panel").innerHTML = greetingsPanel;
}


function loadMenuList() {
    document.getElementById("card-list-body").innerHTML = "";
    for (let id = 0; id < menuList.length; id++) {


        let listPanel = `<div onclick="${menuList[id].methodCall}; ${menuList[id].systemSendMessage}" style="width: 92vw; margin: 1%;" class="row" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="250">
                                        <div class="col" data-aos="fade-up" data-aos-duration="1000"
                                            data-aos-delay="400">
                                            <div style="width: 10vw; height: 23vh; padding: 1%; "
                                                class="cardss">
                                                <div class="card-body" style="padding: 1%;">

                                                    <!-- Left side: Image -->
                                                    <div style="width: 100%;">
                                                        <img id="room-image" src="${menuList[id].image}" alt="Room Image"
                                                            style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                                                    </div>

                                                    <!-- Right side: Info -->
                                                    <br>
                                                    
                                                        <h4 id="room-name" style="margin-left: 5%; font-size: 1.48rem;">${menuList[id].name}</h4>

                                                  
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;

        document.getElementById("card-list-body").innerHTML += listPanel;

    }
}

function loadRoomInfoPanel() {

    document.getElementById("info-panel").innerHTML = `<div id="info-panel-H" style="width: 100%; margin: 1%;" class="row" data-aos="fade-up"
                            data-aos-duration="1000" data-aos-delay="250">

                        </div>`;
    for (let id = 0; id < roomInfoList.length; id++) {

        let roomListPanel = `
                            <div onclick="   loadHotelRoomsMainPanel(0);
      loadHotelRoomsList(); sendSystemMessage('System : User Seleted a Standard room for two People')" class="col" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
                                <div style="width: 88%; height: 50vh; padding: 1%; ;" class="cardss">
                                    <div class="card-body" >

                                        <!-- Left side: Image -->
                                        <div style="width: 100%;">
                                            <img id="room-image" src="${roomInfoList[id].pic}" alt="Room Image"
                                                style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                                        </div>

                                        <!-- Right side: Info -->
                                        <div
                                            style="flex: 2; padding-left: 5%; padding-top: 10%; display: flex; flex-direction: column; justify-content: center;">
                                            <h4  style="margin: 0; font-size: 1.48rem;">${roomInfoList[id].name}</h4>
                                            <p style="margin-top:  10%;"><strong>NO. Of Guests
                                                    : </strong>${roomInfoList[id].capacity}</p>
                                            <p><strong>Price :</strong> ${roomInfoList[id].price} </p>

                                        </div>

                                    </div>
                                </div>
                            </div>
                        `;

        document.getElementById("info-panel-H").innerHTML += roomListPanel;

    }
}

function loadDayout() {

    let roomListPanel = `

    <div style=" padding: 1% ;height: 50vh; display: flex; justify-content: center; align-items: center;">
                             <img id="room-image" src="/assets/img/dayout/dayout-pic.jpg" alt="Room Image"
                                                style="width: auto; height: 100%; object-fit: cover; border-radius: 8px;">
                                                </div>
                        `;

    document.getElementById("info-panel").innerHTML = roomListPanel;

}

function loadRestaurantInfo() {
    let restaurantInfo = `<dotlottie-wc style=" padding: 1% ;height: 59vh; display: flex; justify-content: center; align-items: center;"
  src="https://lottie.host/8cbb861f-5c0e-436a-8512-7660bcf0673c/fi3XWWD1yi.lottie"
  style="width: 300px;height: 300px"
  speed="1"
  autoplay
  loop
></dotlottie-wc>`
    document.getElementById("info-panel").innerHTML = restaurantInfo;

}

function loadMainHotelInfo() {
    let restaurantInfo = `<dotlottie-wc style=" padding: 1% ;height: 59vh; display: flex; justify-content: center; align-items: center;"
  src="https://lottie.host/8cbb861f-5c0e-436a-8512-7660bcf0673c/fi3XWWD1yi.lottie"
  style="width: 300px;height: 300px"
  speed="1"
  autoplay
  loop
></dotlottie-wc>`
    document.getElementById("info-panel").innerHTML = restaurantInfo;

}

function loadEventInfo() {
    let restaurantInfo = `<dotlottie-wc style=" padding: 1% ;height: 59vh; display: flex; justify-content: center; align-items: center;"
  src="https://lottie.host/8cbb861f-5c0e-436a-8512-7660bcf0673c/fi3XWWD1yi.lottie"
  style="width: 300px;height: 300px"
  speed="1"
  autoplay
  loop
></dotlottie-wc>`
    document.getElementById("info-panel").innerHTML = restaurantInfo;

}

window.addEventListener("DOMContentLoaded", async () => {
    //     loadHotelRoomsMainPanel(0);
    //     loadHotelRoomsList() ;

    loadMenuList();
    ;
});