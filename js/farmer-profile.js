import { auth, db } from "./firebase-config.js";
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const actionArea = document.getElementById("actionArea");
const toast = document.getElementById("toast");

const photoUpload = document.getElementById("photoUpload");
const changePhotoLabel = document.getElementById("changePhotoLabel");
const profileImage = document.getElementById("profileImage");
const defaultAvatar = document.getElementById("defaultAvatar");

const incomingList = document.getElementById("incomingRequestsList");
const sentList = document.getElementById("farmerSentRequests");

const editableFields = document.querySelectorAll(
    "#fullName, #email, #phone, #district, #address, " +
    "#rubberType, #quality, #stock, #price, #status, #about"
);

let currentFarmer = null;
let profileData = {};
let originalValues = {};
let originalPhoto = "";
let selectedPhoto = "";

if (photoUpload) photoUpload.disabled = true;
if (actionArea) actionArea.style.display = "none";

function showToast(message, isError = false) {
    if (!toast) return;
    toast.innerHTML = `<span>${isError ? "✕" : "✓"}</span> <div>${message}</div>`;
    toast.style.background = isError ? "#dc2626" : "#166534";
    toast.style.color = "#ffffff";
    toast.classList.add("show");
    setTimeout(() => { toast.classList.remove("show"); }, 3200);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value ?? "";
}

function updateAvailability(status, stock) {
    const element = document.getElementById("displayAvailability");
    if (!element) return;

    if (status === "Out of Stock" || status === "Unavailable" || Number(stock) === 0) {
        element.textContent = "● Out of Stock";
        element.classList.add("out-of-stock");
    } else {
        element.textContent = "● Available for Selling";
        element.classList.remove("out-of-stock");
    }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "login.html"; return; }
    currentFarmer = user;

    try {
        const userRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
            profileData = snapshot.data();

            setText("displayName", profileData.name || "Farmer");
            setValue("fullName", profileData.name || "");
            setValue("email", profileData.email || user.email || "");
            setValue("phone", profileData.contact || "");
            setValue("district", profileData.district || "");
            setValue("address", profileData.address || "");

            setText("displayLocation", (profileData.district || "Sri Lanka") + ", Sri Lanka");

            setValue("rubberType", profileData.rubberType || "Latex");
            setText("summaryType", profileData.rubberType || "Latex");
            setValue("quality", profileData.quality || "Grade A");
            setValue("stock", profileData.stock ?? 0);
            setText("summaryStock", (profileData.stock ?? 0) + " kg");
            setValue("price", profileData.price ?? 0);
            setText("summaryPrice", "Rs. " + (profileData.price ?? 0) + "/kg");
            setValue("status", profileData.status || "Available");
            setValue("about", profileData.about || "");

            updateAvailability(profileData.status, profileData.stock);

            if (
                profileData.profilePhoto &&
                typeof profileData.profilePhoto === "string" &&
                (profileData.profilePhoto.startsWith("data:image") || profileData.profilePhoto.startsWith("http"))
            ) {
                profileImage.src = profileData.profilePhoto;
                profileImage.style.display = "block";
                defaultAvatar.style.display = "none";
                originalPhoto = profileData.profilePhoto;
            } else {
                profileImage.style.display = "none";
                defaultAvatar.style.display = "flex";
                originalPhoto = "";
            }
        } else {
            setValue("email", user.email || "");
        }

        await loadIncomingRequests(user.uid);
        await loadMySentRequests(user.uid);

    } catch (error) {
        console.error("Profile loading error:", error);
        showToast("Could not load profile.", true);
    }
});

editBtn.addEventListener("click", () => {
    originalValues = {};
    editableFields.forEach(field => {
        originalValues[field.id] = field.value;
        field.disabled = false;
    });

    originalPhoto = (profileImage && profileImage.style.display !== "none") ? profileImage.src : "";
    selectedPhoto = "";

    if (photoUpload) photoUpload.disabled = false;
    if (changePhotoLabel) changePhotoLabel.classList.remove("disabled");

    editBtn.style.display = "none";
    if (actionArea) actionArea.style.display = "flex";
});

cancelBtn.addEventListener("click", () => {
    editableFields.forEach(field => {
        if (Object.hasOwn(originalValues, field.id)) {
            field.value = originalValues[field.id];
        }
        field.disabled = true;
    });

    if (originalPhoto) {
        profileImage.src = originalPhoto;
        profileImage.style.display = "block";
        defaultAvatar.style.display = "none";
    } else {
        profileImage.src = "";
        profileImage.style.display = "none";
        defaultAvatar.style.display = "flex";
    }

    selectedPhoto = "";
    if (photoUpload) {
        photoUpload.value = "";
        photoUpload.disabled = true;
    }
    if (changePhotoLabel) changePhotoLabel.classList.add("disabled");

    if (actionArea) actionArea.style.display = "none";
    if (editBtn) editBtn.style.display = "block";
});

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => {
            const image = new Image();
            image.onload = () => {
                const maxSize = 300;
                let width = image.width;
                let height = image.height;

                if (width > height && width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                } else if (height >= width && height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }

                const canvas = document.createElement("canvas");
                canvas.width = Math.round(width);
                canvas.height = Math.round(height);
                canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.5));
            };
            image.onerror = () => reject(new Error("Could not load image."));
            image.src = event.target.result;
        };
        reader.onerror = () => reject(new Error("Could not read image."));
        reader.readAsDataURL(file);
    });
}

if (photoUpload) {
    photoUpload.addEventListener("change", async () => {
        const file = photoUpload.files[0];
        if (!file) return;

        try {
            const compressed = await compressImage(file);
            selectedPhoto = compressed;
            profileImage.src = compressed;
            profileImage.style.display = "block";
            defaultAvatar.style.display = "none";
        } catch (error) {
            console.error(error);
            showToast("Unable to process photo.", true);
        }
    });
}

if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
        const user = auth.currentUser;
        if (!user) return;

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const district = document.getElementById("district").value;
        const rubberType = document.getElementById("rubberType").value;
        const quality = document.getElementById("quality").value;
        const stock = document.getElementById("stock").value;
        const price = document.getElementById("price").value;
        const status = document.getElementById("status").value;
        const about = document.getElementById("about").value.trim();

        if (!fullName || !email) {
            showToast("Please enter your name and email.", true);
            return;
        }

        saveBtn.disabled = true;

        try {
            const updateData = {
                name: fullName,
                email,
                contact: document.getElementById("phone").value.trim(),
                district,
                address: document.getElementById("address").value.trim(),
                rubberType,
                quality,
                stock: Number(stock) || 0,
                price: Number(price) || 0,
                status,
                about,
                userType: "farmer",
                updatedAt: serverTimestamp()
            };

            if (selectedPhoto) updateData.profilePhoto = selectedPhoto;

            await setDoc(doc(db, "users", user.uid), updateData, { merge: true });
            profileData = { ...profileData, ...updateData };

            setText("displayName", fullName);
            setText("displayLocation", (district || "Sri Lanka") + ", Sri Lanka");
            setText("summaryType", rubberType);
            setText("summaryStock", (Number(stock) || 0) + " kg");
            setText("summaryPrice", "Rs. " + (Number(price) || 0) + "/kg");
            updateAvailability(status, Number(stock));

            if (selectedPhoto) originalPhoto = selectedPhoto;
            selectedPhoto = "";

            editableFields.forEach(field => field.disabled = true);
            if (photoUpload) { photoUpload.value = ""; photoUpload.disabled = true; }
            if (changePhotoLabel) changePhotoLabel.classList.add("disabled");

            if (actionArea) actionArea.style.display = "none";
            if (editBtn) editBtn.style.display = "block";

            showToast("Farmer profile updated successfully!");
        } catch (error) {
            console.error("Profile save error:", error);
            showToast("Could not save profile.", true);
        } finally {
            saveBtn.disabled = false;
        }
    });
}

function addText(parent, tag, value) {
    const element = document.createElement(tag);
    element.textContent = value ?? "";
    parent.appendChild(element);
    return element;
}

// 1. INCOMING BUYER REQUESTS (Buyer -> Farmer) [WITH ACCEPT/REJECT]
async function loadIncomingRequests(farmerUid) {
    if (!incomingList) return;
    incomingList.textContent = "Loading buyer requests...";

    try {
        const q = query(collection(db, "requests"), where("farmerId", "==", farmerUid));
        const snapshot = await getDocs(q);

        const requests = snapshot.docs
            .map(item => ({ id: item.id, ...item.data() }))
            .filter(item => item.type === "buyer_to_farmer")
            .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

        incomingList.replaceChildren();

        if (requests.length === 0) {
            incomingList.innerHTML = `<p>No buyer requests received yet.</p>`;
            return;
        }

        requests.forEach(request => {
            const currentStatus = String(request.status || "pending").toLowerCase();
            const statusClass = currentStatus === "accepted" ? "status-accepted" :
                                currentStatus === "rejected" ? "status-rejected" : "status-pending";

            const card = document.createElement("article");
            card.className = "farmer-request-card";
            addText(card, "h3", `From: ${request.buyerName || request.buyerEmail || "Company Buyer"}`);
            if (request.buyerEmail) addText(card, "p", `Email: ${request.buyerEmail}`);
            addText(card, "p", `Rubber Type: ${request.rubberType || "N/A"}`);
            addText(card, "p", `Required Quantity: ${Number(request.quantity) || 0} kg`);
            addText(card, "p", `Offered Price: Rs. ${Number(request.offeredPrice) || 0}/kg`);
            if (request.message) addText(card, "p", `Message: ${request.message}`);

            const status = addText(card, "span", `Status: ${currentStatus}`);
            status.className = `request-status ${statusClass}`;

            if (currentStatus === "pending") {
                const actionWrap = document.createElement("div");
                actionWrap.className = "request-actions";

                const acceptBtn = document.createElement("button");
                acceptBtn.type = "button";
                acceptBtn.className = "accept-btn";
                acceptBtn.textContent = "✓ Accept";

                const rejectBtn = document.createElement("button");
                rejectBtn.type = "button";
                rejectBtn.className = "reject-btn";
                rejectBtn.textContent = "✕ Reject";

                acceptBtn.addEventListener("click", () => updateRequestStatus(request.id, "accepted", acceptBtn, rejectBtn));
                rejectBtn.addEventListener("click", () => updateRequestStatus(request.id, "rejected", acceptBtn, rejectBtn));

                actionWrap.append(acceptBtn, rejectBtn);
                card.appendChild(actionWrap);
            }

            incomingList.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading incoming requests:", error);
        incomingList.textContent = "Could not load buyer requests.";
    }
}

// 2. MY SENT REQUESTS (Farmer -> Buyer) [HISTORY]
async function loadMySentRequests(farmerUid) {
    if (!sentList) return;
    sentList.textContent = "Loading your sent requests...";

    try {
        const q = query(collection(db, "requests"), where("farmerId", "==", farmerUid));
        const snapshot = await getDocs(q);

        const sentRequests = snapshot.docs
            .map(item => ({ id: item.id, ...item.data() }))
            .filter(item => item.type === "farmer_to_buyer" || item.type === "farmer_offer")
            .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

        sentList.replaceChildren();

        if (sentRequests.length === 0) {
            sentList.innerHTML = `<p>You have not sent any requests to buyers yet.</p>`;
            return;
        }

        sentRequests.forEach(req => {
            const currentStatus = String(req.status || "pending").toLowerCase();
            const statusClass = currentStatus === "accepted" ? "status-accepted" :
                                currentStatus === "rejected" ? "status-rejected" : "status-pending";

            const card = document.createElement("article");
            card.className = "farmer-request-card";
            addText(card, "h3", `To: ${req.buyerName || "Company Buyer"}`);
            addText(card, "p", `Rubber Type: ${req.rubberType || "N/A"}`);
            addText(card, "p", `Quantity: ${Number(req.quantity) || 0} kg`);
            addText(card, "p", `Offered Price: Rs. ${Number(req.offeredPrice) || Number(req.price) || 0}/kg`);
            if (req.message) addText(card, "p", `Message: ${req.message}`);

            const status = addText(card, "span", `Status: ${currentStatus}`);
            status.className = `request-status ${statusClass}`;
            sentList.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading sent requests:", error);
        sentList.textContent = "Could not load sent requests.";
    }
}

async function updateRequestStatus(requestId, newStatus, acceptBtn, rejectBtn) {
    acceptBtn.disabled = true;
    rejectButton.disabled = true;

    try {
        await updateDoc(doc(db, "requests", requestId), { status: newStatus, updatedAt: serverTimestamp() });
        showToast(newStatus === "accepted" ? "Buyer request accepted successfully!" : "Buyer request rejected.");
        if (currentFarmer) await loadIncomingRequests(currentFarmer.uid);
    } catch (error) {
        console.error("Update error:", error);
        showToast("Could not update request.", true);
        acceptBtn.disabled = false;
        rejectBtn.disabled = false;
    }
}

onAuthStateChanged(auth, async user => {
    if (!user) { window.location.href = "login.html"; return; }
    currentFarmer = user;
    await loadIncomingRequests(user.uid);
    await loadMySentRequests(user.uid);
});