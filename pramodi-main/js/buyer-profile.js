
import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// =====================================================
// ELEMENTS
// =====================================================

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const actionArea = document.getElementById("actionArea");
const toast = document.getElementById("toast");

const photoUpload = document.getElementById("photoUpload");
const profileImage = document.getElementById("profileImage");
const defaultAvatar = document.getElementById("defaultAvatar");

const buyerRequests = document.getElementById("buyerRequests");
const receivedOffers = document.getElementById("receivedOffers");

const editableFields = document.querySelectorAll(
    "#companyName, #contactPerson, #email, #phone, " +
    "#district, #address, #rubberType, #quality, " +
    "#quantity, #price, #preferredLocation, #status, #about"
);

let currentUser = null;
let currentProfile = {};
let originalValues = {};
let originalPhoto = "";
let hadProfilePhoto = false;

// =====================================================
// INITIAL STATE
// =====================================================

if (actionArea) actionArea.style.display = "none";
if (photoUpload) photoUpload.disabled = true;

// =====================================================
// NOTIFICATION
// =====================================================

function showToast(message, isError = false) {
    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");
    toast.style.color = isError ? "#b42318" : "#176638";

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// =====================================================
// PROFILE DISPLAY
// =====================================================

function updateProfileDisplay() {
    const companyName =
        document.getElementById("companyName").value.trim();

    const district =
        document.getElementById("district").value;

    const rubberType =
        document.getElementById("rubberType").value;

    const quantity =
        document.getElementById("quantity").value;

    const price =
        document.getElementById("price").value;

    const status =
        document.getElementById("status").value;

    document.getElementById("displayCompanyName").textContent =
        companyName || "Buyer / Company";

    document.getElementById("displayLocation").textContent =
        district ? `${district}, Sri Lanka` : "Sri Lanka";

    document.getElementById("summaryType").textContent =
        rubberType;

    document.getElementById("summaryQuantity").textContent =
        `${quantity || 0} kg`;

    document.getElementById("summaryPrice").textContent =
        `Rs. ${price || 0}/kg`;

    const displayStatus =
        document.getElementById("displayStatus");

    if (status === "Not Buying" || Number(quantity) === 0) {
        displayStatus.textContent = "● Not Currently Buying";
        displayStatus.classList.add("not-buying");
    } else {
        displayStatus.textContent = "● Currently Buying";
        displayStatus.classList.remove("not-buying");
    }
}

// =====================================================
// LOAD PROFILE
// =====================================================

async function loadBuyerProfile(user) {
    try {
        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
            currentProfile = profileSnap.data();

            const values = {
                companyName: currentProfile.companyName || "",
                contactPerson:
                    currentProfile.contactPerson ||
                    currentProfile.name || "",
                email: currentProfile.email || user.email || "",
                phone:
                    currentProfile.phone ||
                    currentProfile.companyContact || "",
                district: currentProfile.district || "",
                address:
                    currentProfile.address ||
                    currentProfile.companyAddress || "",
                rubberType: currentProfile.rubberType || "Latex",
                quality: currentProfile.quality || "Grade A",
                quantity: currentProfile.quantity ?? 1000,
                price: currentProfile.price ?? 360,
                preferredLocation:
                    currentProfile.preferredLocation || "Any Location",
                status: currentProfile.status || "Active",
                about: currentProfile.about || ""
            };

            Object.entries(values).forEach(([id, value]) => {
                const field = document.getElementById(id);
                if (field) field.value = value;
            });

            const photo =
                currentProfile.profilePhoto ||
                currentProfile.companyLogo ||
                "";

            if (photo) {
                profileImage.src = photo;
                profileImage.style.display = "block";
                defaultAvatar.style.display = "none";
            } else {
                profileImage.style.display = "none";
                defaultAvatar.style.display = "flex";
            }
        } else {
            document.getElementById("email").value =
                user.email || "";
        }

        updateProfileDisplay();
    } catch (error) {
        console.error("Profile loading error:", error);
        showToast("Could not load buyer profile.", true);
    }
}

// =====================================================
// EDIT PROFILE
// =====================================================

editBtn.addEventListener("click", () => {
    originalValues = {};

    editableFields.forEach(field => {
        originalValues[field.id] = field.value;
        field.disabled = false;
    });

    hadProfilePhoto =
        profileImage.style.display !== "none" &&
        Boolean(profileImage.src);

    originalPhoto = hadProfilePhoto ? profileImage.src : "";

    photoUpload.disabled = false;
    actionArea.style.display = "flex";
    editBtn.style.display = "none";
});

// =====================================================
// CANCEL EDIT
// =====================================================

cancelBtn.addEventListener("click", () => {
    editableFields.forEach(field => {
        if (Object.hasOwn(originalValues, field.id)) {
            field.value = originalValues[field.id];
        }

        field.disabled = true;
    });

    if (hadProfilePhoto) {
        profileImage.src = originalPhoto;
        profileImage.style.display = "block";
        defaultAvatar.style.display = "none";
    } else {
        profileImage.removeAttribute("src");
        profileImage.style.display = "none";
        defaultAvatar.style.display = "flex";
    }

    photoUpload.value = "";
    photoUpload.disabled = true;

    actionArea.style.display = "none";
    editBtn.style.display = "block";

    updateProfileDisplay();
});

// =====================================================
// SAVE PROFILE
// =====================================================

saveBtn.addEventListener("click", async () => {
    if (!currentUser) {
        showToast("Please log in again.", true);
        return;
    }

    const companyName =
        document.getElementById("companyName").value.trim();

    const contactPerson =
        document.getElementById("contactPerson").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const quantity =
        document.getElementById("quantity").value;

    const price =
        document.getElementById("price").value;

    if (!companyName || !contactPerson || !email) {
        alert("Please enter company name, contact person and email.");
        return;
    }

    if (
        quantity === "" || Number(quantity) < 0 ||
        price === "" || Number(price) < 0
    ) {
        alert("Please enter a valid quantity and buying price.");
        return;
    }

    const phone = document.getElementById("phone").value.trim();

    const profileData = {
        ...currentProfile,
        companyName,
        contactPerson,
        name: contactPerson,
        email,
        phone,
        companyContact: phone,
        district: document.getElementById("district").value,
        address: document.getElementById("address").value.trim(),
        companyAddress: document.getElementById("address").value.trim(),
        rubberType: document.getElementById("rubberType").value,
        quality: document.getElementById("quality").value,
        quantity: Number(quantity),
        price: Number(price),
        preferredLocation:
            document.getElementById("preferredLocation").value,
        status: document.getElementById("status").value,
        about: document.getElementById("about").value.trim(),
        userType: "buyer",
        updatedAt: serverTimestamp()
    };

    if (
        profileImage.style.display !== "none" &&
        profileImage.src.startsWith("data:image/")
    ) {
        profileData.profilePhoto = profileImage.src;
    }

    saveBtn.disabled = true;

    try {
        await setDoc(
            doc(db, "users", currentUser.uid),
            profileData,
            { merge: true }
        );

        currentProfile = profileData;

        editableFields.forEach(field => {
            field.disabled = true;
        });

        photoUpload.disabled = true;
        photoUpload.value = "";

        actionArea.style.display = "none";
        editBtn.style.display = "block";

        updateProfileDisplay();
        showToast("Buyer profile updated successfully!");
    } catch (error) {
        console.error("Profile save error:", error);
        showToast("Could not save profile. Check Firestore rules.", true);
    } finally {
        saveBtn.disabled = false;
    }
});

// =====================================================
// COMPANY LOGO PREVIEW
// =====================================================

photoUpload.addEventListener("change", () => {
    const file = photoUpload.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        photoUpload.value = "";
        return;
    }

    if (file.size > 700 * 1024) {
        alert("Please select an image smaller than 700 KB.");
        photoUpload.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = event => {
        profileImage.src = event.target.result;
        profileImage.style.display = "block";
        defaultAvatar.style.display = "none";
    };

    reader.readAsDataURL(file);
});

// =====================================================
// CREATE SAFE TEXT ELEMENT
// =====================================================

function addText(parent, tag, value) {
    const element = document.createElement(tag);
    element.textContent = value ?? "";
    parent.appendChild(element);
    return element;
}

// =====================================================
// MY REQUESTS - BUYER TO FARMER
// =====================================================

async function loadMyRequests(user) {
    buyerRequests.textContent = "Loading your requests...";

    try {
        const requestsQuery = query(
            collection(db, "requests"),
            where("buyerId", "==", user.uid)
        );

        const snapshot = await getDocs(requestsQuery);

        const requests = snapshot.docs.filter(item => {
            const data = item.data();

            // Exclude offers sent by farmers.
            return data.type !== "farmer_offer";
        });

        buyerRequests.replaceChildren();

        if (requests.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "You have not sent any requests yet.";
            buyerRequests.appendChild(empty);
            return;
        }

        requests.forEach(item => {
            const data = item.data();

            const card = document.createElement("article");
            card.className = "buyer-request-card";

            addText(card, "h3", data.farmerName || "Rubber Farmer");
            addText(card, "p", `Rubber Type: ${data.rubberType || "Not specified"}`);
            addText(card, "p", `Quantity: ${data.quantity ?? "Not specified"} kg`);
            addText(card, "p", `Offered Price: Rs. ${data.offeredPrice ?? data.price ?? "Not specified"}/kg`);
            addText(card, "p", `Message: ${data.message || "No message"}`);

            const status = addText(
                card,
                "span",
                `Status: ${data.status || "pending"}`
            );

            status.className = "request-status";
            buyerRequests.appendChild(card);
        });
    } catch (error) {
        console.error("Loading buyer requests failed:", error);
        buyerRequests.textContent =
            "Could not load your requests. Check Firestore rules.";
    }
}

// =====================================================
// RECEIVED OFFERS - FARMER TO BUYER
// =====================================================

async function loadReceivedOffers(user) {
    receivedOffers.textContent = "Loading received offers...";

    try {
        const offersQuery = query(
            collection(db, "requests"),
            where("buyerId", "==", user.uid)
        );

        const snapshot = await getDocs(offersQuery);

        const offers = snapshot.docs.filter(item => {
            return item.data().type === "farmer_offer";
        });

        receivedOffers.replaceChildren();

        if (offers.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "No farmer offers received yet.";
            receivedOffers.appendChild(empty);
            return;
        }

        offers.forEach(item => {
            const data = item.data();

            const card = document.createElement("article");
            card.className = "buyer-request-card";

            addText(card, "h3", data.farmerName || "Rubber Farmer");
            addText(card, "p", `Rubber Type: ${data.rubberType || "Not specified"}`);
            addText(card, "p", `Quality: ${data.quality || "Not specified"}`);
            addText(card, "p", `Quantity: ${data.quantity ?? "Not specified"} kg`);
            addText(card, "p", `Offered Price: Rs. ${data.offeredPrice ?? data.price ?? "Not specified"}/kg`);

            if (data.message) {
                addText(card, "p", `Message: ${data.message}`);
            }

            const currentStatus = String(data.status || "pending").toLowerCase();

            const status = addText(
                card,
                "span",
                `Status: ${currentStatus}`
            );

            status.className = "request-status";

            if (currentStatus === "pending") {
                const acceptBtn = document.createElement("button");
                acceptBtn.type = "button";
                acceptBtn.className = "accept-offer";
                acceptBtn.textContent = "✓ Accept Offer";

                acceptBtn.addEventListener("click", () => {
                    updateOfferStatus(item.id, "accepted");
                });

                const rejectBtn = document.createElement("button");
                rejectBtn.type = "button";
                rejectBtn.className = "reject-offer";
                rejectBtn.textContent = "✕ Reject Offer";

                rejectBtn.addEventListener("click", () => {
                    updateOfferStatus(item.id, "rejected");
                });

                card.append(acceptBtn, rejectBtn);
            }

            receivedOffers.appendChild(card);
        });
    } catch (error) {
        console.error("Loading received offers failed:", error);
        receivedOffers.textContent =
            "Could not load received offers. Check Firestore rules.";
    }
}

// =====================================================
// ACCEPT / REJECT OFFER
// =====================================================

async function updateOfferStatus(offerId, status) {
    if (!currentUser) return;

    try {
        await updateDoc(doc(db, "requests", offerId), {
            status,
            updatedAt: serverTimestamp()
        });

        showToast(
            status === "accepted"
                ? "Farmer offer accepted."
                : "Farmer offer rejected."
        );

        await loadReceivedOffers(currentUser);
    } catch (error) {
        console.error("Offer update failed:", error);
        showToast("Could not update offer. Check Firestore rules.", true);
    }
}

// =====================================================
// FIREBASE LOGIN STATE
// =====================================================

onAuthStateChanged(auth, async user => {
    if (!user) {
        currentUser = null;

        buyerRequests.textContent =
            "Please log in as a buyer to view your requests.";

        receivedOffers.textContent =
            "Please log in as a buyer to view farmer offers.";

        return;
    }

    currentUser = user;

    await loadBuyerProfile(user);
    await loadMyRequests(user);
    await loadReceivedOffers(user);
});
