import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// =====================================================
// ELEMENTS
// =====================================================

const buyerPriceContainer =
    document.getElementById("buyerPriceContainer");

const searchBuyer =
    document.getElementById("searchBuyer");

const searchPrice =
    document.getElementById("searchPrice");

const districtFilter =
    document.getElementById("districtFilter");


// =====================================================
// STORE BUYER PRICES
// =====================================================

let buyerPrices = [];


// =====================================================
// LOAD BUYER PRICES FROM FIREBASE
// =====================================================

async function loadBuyerPrices() {

    try {

        console.log("DB OBJECT:", db);

        const buyerPricesRef = collection(db, "buyerPrices");

        const querySnapshot = await getDocs(buyerPricesRef);

        buyerPrices = [];

        querySnapshot.forEach((doc) => {

            buyerPrices.push({
                id: doc.id,
                ...doc.data()
            });

        });

        console.log("✅ Buyer prices loaded:", buyerPrices);

        buyerPrices.sort((a, b) => {

            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;

            return timeB - timeA;

        });

        displayBuyerPrices(buyerPrices);

    } catch (error) {

        console.error("❌ Error loading buyer prices:", error);

        if (buyerPriceContainer) {

            buyerPriceContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-exclamation-circle fs-1 text-danger"></i>

                    <h4 class="mt-3">
                        Unable to load buyer prices
                    </h4>

                    <p>
                        ${error.message}
                    </p>
                </div>
            `;

        }

    }

}


// =====================================================
// DISPLAY BUYER PRICE CARDS
// =====================================================

function displayBuyerPrices(prices) {

    if (!buyerPriceContainer) {
        return;
    }

    buyerPriceContainer.innerHTML = "";

    if (prices.length === 0) {

        buyerPriceContainer.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">

                    <i class="bi bi-shop fs-1"></i>

                    <h4 class="mt-3">
                        No Buyer Prices Available
                    </h4>

                    <p>
                        Buyers have not published any prices yet.
                    </p>

                </div>
            </div>
        `;

        return;
    }


    // Find highest price
    const highestPrice = Math.max(
        ...prices.map(item => Number(item.price) || 0)
    );


    prices.forEach((item) => {

        const company =
            item.company || "Unknown Company";

        const district =
            item.district || "Not specified";

        const rubberType =
            item.rubberType || "Not specified";

        const price =
            Number(item.price) || 0;

        const details =
            item.details || "";


        // Best price badge
        const isBestPrice =
            price === highestPrice && prices.length > 1;


        const badge = isBestPrice
            ? `
                <span class="badge bg-warning text-dark">
                    ⭐ Best Price
                </span>
              `
            : `
                <span class="badge bg-success">
                    Available
                </span>
              `;


        const card = document.createElement("div");

        card.className =
            "col-xl-4 col-lg-6 col-md-6";


        card.innerHTML = `

            <div
                class="buyer-card search-card"
                data-company="${company.toLowerCase()}"
                data-district="${district}"
                data-price="${price}">

                <div class="company-icon">
                    <i class="bi bi-building"></i>
                </div>

                <h4>
                    ${escapeHTML(company)}
                </h4>

                <p>
                    <i class="bi bi-geo-alt-fill"></i>
                    ${escapeHTML(district)} District
                </p>

                <p class="rubber-type">
                    <i class="bi bi-circle-fill"></i>
                    ${escapeHTML(rubberType)}
                </p>

                <h2>
                    Rs. ${price.toLocaleString()} / kg
                </h2>

                ${details ? `
                    <p class="buyer-details">
                        ${escapeHTML(details)}
                    </p>
                ` : ""}

                ${badge}

                <button
                    type="button"
                    class="request-btn"
                    onclick="openRequest('${escapeAttribute(company)}')">

                    <i class="bi bi-send"></i>
                    Send Request

                </button>

            </div>

        `;

        buyerPriceContainer.appendChild(card);

    });


    // Re-run AOS animation
    if (typeof AOS !== "undefined") {
        AOS.refresh();
    }

}


// =====================================================
// SEARCH / FILTER
// =====================================================

function filterBuyerPrices() {

    const buyerSearch =
        searchBuyer
            ? searchBuyer.value.trim().toLowerCase()
            : "";

    const priceSearch =
        searchPrice
            ? searchPrice.value.trim()
            : "";

    const selectedDistrict =
        districtFilter
            ? districtFilter.value
            : "all";


    const filtered =
        buyerPrices.filter((item) => {

            const company =
                (item.company || "").toLowerCase();

            const district =
                item.district || "";

            const price =
                Number(item.price) || 0;


            const matchesCompany =
                company.includes(buyerSearch);

            const matchesPrice =
                priceSearch === ""
                || price <= Number(priceSearch);

            const matchesDistrict =
                selectedDistrict === "all"
                || district === selectedDistrict;


            return (
                matchesCompany &&
                matchesPrice &&
                matchesDistrict
            );

        });


    displayBuyerPrices(filtered);

}


// =====================================================
// EVENT LISTENERS
// =====================================================

if (searchBuyer) {

    searchBuyer.addEventListener(
        "input",
        filterBuyerPrices
    );

}

if (searchPrice) {

    searchPrice.addEventListener(
        "input",
        filterBuyerPrices
    );

}

if (districtFilter) {

    districtFilter.addEventListener(
        "change",
        filterBuyerPrices
    );

}


// =====================================================
// HTML SECURITY
// =====================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


// =====================================================
// REQUEST MODAL
// =====================================================

let selectedBuyer = "";


window.openRequest = function (buyer) {

    selectedBuyer = buyer;

    const buyerName =
        document.getElementById("buyerName");

    const requestModal =
        document.getElementById("requestModal");

    if (buyerName) {
        buyerName.innerText = buyer;
    }

    if (requestModal) {
        requestModal.style.display = "flex";
    }

};


window.closeRequest = function () {

    const requestModal =
        document.getElementById("requestModal");

    const successMessage =
        document.getElementById("successMessage");


    if (requestModal) {
        requestModal.style.display = "none";
    }

    if (successMessage) {
        successMessage.style.display = "none";
    }

};


window.sendRequest = function () {

    const quantity =
        document.getElementById("quantity")?.value;

    const price =
        document.getElementById("price")?.value;

    if (!quantity || !price) {

        alert(
            "Please enter quantity and offered price."
        );

        return;
    }


    const successMessage =
        document.getElementById("successMessage");

    if (successMessage) {

        successMessage.innerText =
            `✅ Request sent to ${selectedBuyer} successfully!`;

        successMessage.style.display = "block";

    }

};


// Close modal when clicking outside

window.addEventListener("click", function (event) {

    const modal =
        document.getElementById("requestModal");

    if (
        modal &&
        event.target === modal
    ) {

        closeRequest();

    }

});


// =====================================================
// START
// =====================================================

loadBuyerPrices();

/*import { db, auth } from "./firebase-config.js";

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

};*/