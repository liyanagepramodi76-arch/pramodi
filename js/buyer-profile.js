import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

if (actionArea) actionArea.style.display = "none";
if (photoUpload) photoUpload.disabled = true;

function showToast(message, isError = false) {
    if (!toast) return;
    toast.innerHTML = `<span>${isError ? "✕" : "✓"}</span> <div>${message}</div>`;
    toast.style.background = isError ? "#dc2626" : "#166534";
    toast.style.color = "#ffffff";
    toast.classList.add("show");
    setTimeout(() => { toast.classList.remove("show"); }, 3200);
}

function updateProfileDisplay() {
    const companyName = document.getElementById("companyName").value.trim();
    const district = document.getElementById("district").value;
    const rubberType = document.getElementById("rubberType").value;
    const quantity = document.getElementById("quantity").value;
    const price = document.getElementById("price").value;
    const status = document.getElementById("status").value;

    document.getElementById("displayCompanyName").textContent = companyName || "Buyer / Company";
    document.getElementById("displayLocation").textContent = district ? `${district}, Sri Lanka` : "Sri Lanka";
    document.getElementById("summaryType").textContent = rubberType;
    document.getElementById("summaryQuantity").textContent = `${quantity || 0} kg`;
    document.getElementById("summaryPrice").textContent = `Rs. ${price || 0}/kg`;

    const displayStatus = document.getElementById("displayStatus");
    if (status === "Not Buying" || Number(quantity) === 0) {
        displayStatus.textContent = "● Not Currently Buying";
        displayStatus.classList.add("not-buying");
    } else {
        displayStatus.textContent = "● Currently Buying";
        displayStatus.classList.remove("not-buying");
    }
}

async function loadBuyerProfile(user) {
    try {
        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
            currentProfile = profileSnap.data();

            const values = {
                companyName: currentProfile.companyName || "",
                contactPerson: currentProfile.contactPerson || currentProfile.name || "",
                email: currentProfile.email || user.email || "",
                phone: currentProfile.phone || currentProfile.companyContact || "",
                district: currentProfile.district || "",
                address: currentProfile.address || currentProfile.companyAddress || "",
                rubberType: currentProfile.rubberType || "Latex",
                quality: currentProfile.quality || "Grade A",
                quantity: currentProfile.quantity ?? 1000,
                price: currentProfile.price ?? 360,
                preferredLocation: currentProfile.preferredLocation || "Any Location",
                status: currentProfile.status || "Active",
                about: currentProfile.about || ""
            };

            Object.entries(values).forEach(([id, value]) => {
                const field = document.getElementById(id);
                if (field) field.value = value;
            });

            const photo = currentProfile.profilePhoto || currentProfile.companyLogo || "";
            if (photo) {
                profileImage.src = photo;
                profileImage.style.display = "block";
                defaultAvatar.style.display = "none";
            } else {
                profileImage.style.display = "none";
                defaultAvatar.style.display = "flex";
            }
        } else {
            document.getElementById("email").value = user.email || "";
        }

        updateProfileDisplay();
    } catch (error) {
        console.error("Profile loading error:", error);
        showToast("Could not load buyer profile.", true);
    }
}

editBtn.addEventListener("click", () => {
    originalValues = {};
    editableFields.forEach(field => {
        originalValues[field.id] = field.value;
        field.disabled = false;
    });

    hadProfilePhoto = profileImage.style.display !== "none" && Boolean(profileImage.src);
    originalPhoto = hadProfilePhoto ? profileImage.src : "";

    photoUpload.disabled = false;
    actionArea.style.display = "flex";
    editBtn.style.display = "none";
});

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

saveBtn.addEventListener("click", async () => {
    if (!currentUser) return;

    const companyName = document.getElementById("companyName").value.trim();
    const contactPerson = document.getElementById("contactPerson").value.trim();
    const email = document.getElementById("email").value.trim();
    const quantity = document.getElementById("quantity").value;
    const price = document.getElementById("price").value;

    if (!companyName || !contactPerson || !email) {
        showToast("Please enter company name, contact person and email.", true);
        return;
    }

    const profileData = {
        ...currentProfile,
        companyName,
        contactPerson,
        name: contactPerson,
        email,
        phone: document.getElementById("phone").value.trim(),
        district: document.getElementById("district").value,
        address: document.getElementById("address").value.trim(),
        rubberType: document.getElementById("rubberType").value,
        quality: document.getElementById("quality").value,
        quantity: Number(quantity),
        price: Number(price),
        status: document.getElementById("status").value,
        about: document.getElementById("about").value.trim(),
        userType: "buyer",
        updatedAt: serverTimestamp()
    };

    if (profileImage.style.display !== "none" && profileImage.src.startsWith("data:image/")) {
        profileData.profilePhoto = profileImage.src;
    }

    saveBtn.disabled = true;

    try {
        await setDoc(doc(db, "users", currentUser.uid), profileData, { merge: true });
        currentProfile = profileData;

        editableFields.forEach(field => { field.disabled = true; });
        photoUpload.disabled = true;
        photoUpload.value = "";
        actionArea.style.display = "none";
        editBtn.style.display = "block";

        updateProfileDisplay();
        showToast("Buyer profile updated successfully!");
    } catch (error) {
        console.error("Profile save error:", error);
        showToast("Could not save profile.", true);
    } finally {
        saveBtn.disabled = false;
    }
});

photoUpload.addEventListener("change", () => {
    const file = photoUpload.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
        profileImage.src = event.target.result;
        profileImage.style.display = "block";
        defaultAvatar.style.display = "none";
    };
    reader.readAsDataURL(file);
});

function addText(parent, tag, value) {
    const element = document.createElement(tag);
    element.textContent = value ?? "";
    parent.appendChild(element);
    return element;
}

// 1. MY SENT REQUESTS (Buyer -> Farmer) [HISTORY]
async function loadMyRequests(user) {
    if (!buyerRequests) return;
    buyerRequests.textContent = "Loading your sent requests...";

    try {
        const q = query(collection(db, "requests"), where("buyerId", "==", user.uid));
        const snapshot = await getDocs(q);

        const requests = snapshot.docs
            .map(item => ({ id: item.id, ...item.data() }))
            .filter(data => data.type === "buyer_to_farmer")
            .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

        buyerRequests.replaceChildren();

        if (requests.length === 0) {
            buyerRequests.innerHTML = `<p>You have not sent any requests to farmers yet.</p>`;
            return;
        }

        requests.forEach(data => {
            const currentStatus = String(data.status || "pending").toLowerCase();
            const statusClass = currentStatus === "accepted" ? "status-accepted" :
                                currentStatus === "rejected" ? "status-rejected" : "status-pending";

            const card = document.createElement("article");
            card.className = "buyer-request-card";
            addText(card, "h3", `To: ${data.farmerName || "Farmer"}`);
            addText(card, "p", `Rubber Type: ${data.rubberType || "N/A"}`);
            addText(card, "p", `Quantity: ${data.quantity ?? 0} kg`);
            addText(card, "p", `Offered Price: Rs. ${data.offeredPrice ?? 0}/kg`);
            if (data.message) addText(card, "p", `Message: ${data.message}`);

            const status = addText(card, "span", `Status: ${currentStatus}`);
            status.className = `request-status ${statusClass}`;
            buyerRequests.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading sent requests:", error);
        buyerRequests.textContent = "Could not load sent requests.";
    }
}

// 2. RECEIVED OFFERS (Farmer -> Buyer) [WITH ACCEPT / REJECT]
async function loadReceivedOffers(user) {
    if (!receivedOffers) return;
    receivedOffers.textContent = "Loading received offers...";

    try {
        const q = query(collection(db, "requests"), where("buyerId", "==", user.uid));
        const snapshot = await getDocs(q);

        const offers = snapshot.docs
            .map(item => ({ id: item.id, ...item.data() }))
            .filter(data => data.type === "farmer_to_buyer" || data.type === "farmer_offer")
            .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

        receivedOffers.replaceChildren();

        if (offers.length === 0) {
            receivedOffers.innerHTML = `<p>No farmer requests received yet.</p>`;
            return;
        }

        offers.forEach(item => {
            const currentStatus = String(item.status || "pending").toLowerCase();
            const statusClass = currentStatus === "accepted" ? "status-accepted" :
                                currentStatus === "rejected" ? "status-rejected" : "status-pending";

            const card = document.createElement("article");
            card.className = "buyer-request-card";
            addText(card, "h3", `From: ${item.farmerName || "Rubber Farmer"}`);
            if (item.farmerEmail) addText(card, "p", `Email: ${item.farmerEmail}`);
            addText(card, "p", `Rubber Type: ${item.rubberType || "N/A"}`);
            addText(card, "p", `Quantity: ${item.quantity ?? 0} kg`);
            addText(card, "p", `Offered Price: Rs. ${item.offeredPrice ?? item.price ?? 0}/kg`);
            if (item.message) addText(card, "p", `Message: ${item.message}`);

            const status = addText(card, "span", `Status: ${currentStatus}`);
            status.className = `request-status ${statusClass}`;

            if (currentStatus === "pending") {
                const actionWrap = document.createElement("div");
                actionWrap.className = "offer-actions";

                const acceptBtn = document.createElement("button");
                acceptBtn.type = "button";
                acceptBtn.className = "accept-offer";
                acceptBtn.textContent = "✓ Accept";

                const rejectBtn = document.createElement("button");
                rejectBtn.type = "button";
                rejectBtn.className = "reject-offer";
                rejectBtn.textContent = "✕ Reject";

                acceptBtn.addEventListener("click", () => updateOfferStatus(item.id, "accepted", acceptBtn, rejectBtn));
                rejectBtn.addEventListener("click", () => updateOfferStatus(item.id, "rejected", acceptBtn, rejectBtn));

                actionWrap.append(acceptBtn, rejectBtn);
                card.appendChild(actionWrap);
            }

            receivedOffers.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading received offers:", error);
        receivedOffers.textContent = "Could not load received offers.";
    }
}

async function updateOfferStatus(offerId, status, acceptBtn, rejectBtn) {
    if (!currentUser) return;
    acceptBtn.disabled = true;
    rejectBtn.disabled = true;

    try {
        await updateDoc(doc(db, "requests", offerId), { status, updatedAt: serverTimestamp() });
        showToast(status === "accepted" ? "Farmer request accepted successfully!" : "Farmer request rejected.");
        await loadReceivedOffers(currentUser);
    } catch (error) {
        console.error("Update error:", error);
        showToast("Could not update status.", true);
        acceptBtn.disabled = false;
        rejectBtn.disabled = false;
    }
}

onAuthStateChanged(auth, async user => {
    if (!user) { window.location.href = "login.html"; return; }
    currentUser = user;
    await loadBuyerProfile(user);
    await loadReceivedOffers(user);
    await loadMyRequests(user);
});