import { db, auth } from "./firebase-config.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ================= SEARCH =================

// ================= SEARCH & FILTER =================

const searchBuyer = document.getElementById("searchBuyer");
const searchPrice = document.getElementById("searchPrice");
const districtFilter = document.getElementById("districtFilter");

const cards = document.querySelectorAll(".search-card");

if (searchBuyer && searchPrice && districtFilter) {

    searchBuyer.addEventListener("input", filterCards);

    searchPrice.addEventListener("input", filterCards);

    districtFilter.addEventListener("change", filterCards);

}

function filterCards() {

    const buyer = searchBuyer.value.trim().toLowerCase();

    const minimumPrice = parseFloat(searchPrice.value) || 0;

    const district = districtFilter.value;

    cards.forEach(card => {

        const company = card.dataset.company.toLowerCase();

        const cardDistrict = card.dataset.district;

        const cardPrice = parseFloat(card.dataset.price);

        const buyerMatch =
            company.includes(buyer);

        const districtMatch =
            district === "all" ||
            district === cardDistrict;

        const priceMatch =
            minimumPrice === 0 ||
            cardPrice >= minimumPrice;

        card.parentElement.style.display =
            buyerMatch &&
            districtMatch &&
            priceMatch
                ? "block"
                : "none";

    });

}



// ================= OPEN MODAL =================

function openRequest(company){

    document.getElementById("buyerName").textContent = company;

    document.getElementById("quantity").value = "";

    document.getElementById("price").value = "";

    document.getElementById("message").value = "";

    document.getElementById("requestModal").style.display = "flex";

}


// ================= CLOSE MODAL =================

function closeRequest() {

    document.getElementById("requestModal").style.display = "none";

}


// ================= SEND REQUEST =================

async function sendRequest() {

    if (!auth.currentUser) {

        alert("Please login first.");

        return;

    }

    const buyer = document.getElementById("buyerName").textContent;

    const quantity = document.getElementById("quantity").value;

    const price = document.getElementById("price").value;

    const message = document.getElementById("message").value;

    if (!quantity || !price) {

        alert("Please enter quantity and offered price.");

        return;

    }

    try {

        await addDoc(collection(db, "requests"), {

            buyer: buyer,

            sender: auth.currentUser.email,

            senderUID: auth.currentUser.uid,

            quantity: Number(quantity),

            offeredPrice: Number(price),

            message: message,

            status: "Pending",

            createdAt: serverTimestamp()

        });

        alert("✅ Request sent successfully!");

        document.getElementById("quantity").value = "";

        document.getElementById("price").value = "";

        document.getElementById("message").value = "";

        closeRequest();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}


// Make functions available to HTML onclick

window.openRequest = openRequest;

window.closeRequest = closeRequest;

window.sendRequest = sendRequest;


window.onclick = function(event){

    const modal = document.getElementById("requestModal");

    if(event.target === modal){

        modal.style.display = "none";

    }

};
