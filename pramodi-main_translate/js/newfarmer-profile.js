// ==========================================================
// RUBBERLINK FARMER PROFILE
// Firestore + Compressed Base64 Profile Photo
// ==========================================================

import { auth, db } from "./firebase-config.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================================
// GET ELEMENTS
// ==========================================================

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const actionArea = document.getElementById("actionArea");
const toast = document.getElementById("toast");


// ==========================================================
// PROFILE PHOTO
// ==========================================================

const photoUpload = document.getElementById("photoUpload");
const profileImage = document.getElementById("profileImage");
const defaultAvatar = document.getElementById("defaultAvatar");


// ==========================================================
// PROFILE FIELDS
// ==========================================================

const editableFields = document.querySelectorAll(
    "#fullName, " +
    "#email, " +
    "#phone, " +
    "#district, " +
    "#address, " +
    "#rubberType, " +
    "#quality, " +
    "#stock, " +
    "#price, " +
    "#status, " +
    "#about"
);


// ==========================================================
// VARIABLES
// ==========================================================

let originalValues = {};
let originalPhoto = "";
let selectedPhoto = "";


// ==========================================================
// INITIAL STATE
// ==========================================================

if (actionArea) {
    actionArea.style.display = "none";
}


// ==========================================================
// LOAD USER PROFILE
// ==========================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    try {

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            console.error("User profile document does not exist.");
            return;

        }

        const data = userSnap.data();


        // ==================================================
        // PERSONAL INFORMATION
        // ==================================================

        document.getElementById("displayName").textContent =
            data.name || "Farmer";

        document.getElementById("fullName").value =
            data.name || "";

        document.getElementById("email").value =
            data.email || user.email || "";

        document.getElementById("phone").value =
            data.contact || "";

        document.getElementById("district").value =
            data.district || "";

        document.getElementById("address").value =
            data.address || "";

        document.getElementById("displayLocation").textContent =
            (data.district || "") + ", Sri Lanka";


        // ==================================================
        // RUBBER INFORMATION
        // ==================================================

        if (data.rubberType) {

            document.getElementById("rubberType").value =
                data.rubberType;

            document.getElementById("summaryType").textContent =
                data.rubberType;

        }

        if (data.quality) {

            document.getElementById("quality").value =
                data.quality;

        }

        if (data.stock !== undefined) {

            document.getElementById("stock").value =
                data.stock;

            document.getElementById("summaryStock").textContent =
                data.stock + " kg";

        }

        if (data.price !== undefined) {

            document.getElementById("price").value =
                data.price;

            document.getElementById("summaryPrice").textContent =
                "Rs. " + data.price + "/kg";

        }

        if (data.status) {

            document.getElementById("status").value =
                data.status;

        }

        if (data.about) {

            document.getElementById("about").value =
                data.about;

        }


        // ==================================================
        // AVAILABILITY
        // ==================================================

        const displayAvailability =
            document.getElementById("displayAvailability");

        if (
            data.status === "Out of Stock" ||
            Number(data.stock) === 0
        ) {

            displayAvailability.textContent =
                "● Out of Stock";

            displayAvailability.classList.add(
                "out-of-stock"
            );

        } else {

            displayAvailability.textContent =
                "● Available for Selling";

            displayAvailability.classList.remove(
                "out-of-stock"
            );

        }


        // ==================================================
        // LOAD SAVED PROFILE PHOTO
        // ==================================================

        if (
            data.profilePhoto &&
            typeof data.profilePhoto === "string"
        ) {

            console.log("✅ Profile photo found in Firestore.");

            profileImage.src =
                data.profilePhoto;

            profileImage.style.display =
                "block";

            defaultAvatar.style.display =
                "none";

            originalPhoto =
                data.profilePhoto;

        } else {

            console.log("ℹ️ No profile photo found.");

            profileImage.src = "";

            profileImage.style.display =
                "none";

            defaultAvatar.style.display =
                "flex";

            originalPhoto = "";

        }

    }

    catch (error) {

        console.error(
            "Error loading farmer profile:",
            error
        );

    }

});


// ==========================================================
// EDIT PROFILE
// ==========================================================

editBtn.addEventListener("click", () => {

    editableFields.forEach((field) => {

        originalValues[field.id] =
            field.value;

        field.disabled = false;

    });


    originalPhoto =
        profileImage.style.display !== "none"
            ? profileImage.src
            : "";

    selectedPhoto = "";

    actionArea.style.display =
        "flex";

    editBtn.style.display =
        "none";

});


// ==========================================================
// COMPRESS IMAGE
// ==========================================================

function compressImage(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = (event) => {

            const image = new Image();

            image.onload = () => {

                const maxSize = 300;

                let width = image.width;
                let height = image.height;


                // Resize

                if (width > height) {

                    if (width > maxSize) {

                        height =
                            height * (maxSize / width);

                        width =
                            maxSize;

                    }

                } else {

                    if (height > maxSize) {

                        width =
                            width * (maxSize / height);

                        height =
                            maxSize;

                    }

                }


                const canvas =
                    document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;


                const context =
                    canvas.getContext("2d");


                context.drawImage(
                    image,
                    0,
                    0,
                    width,
                    height
                );


                // JPEG compression

                const compressed =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.50
                    );


                resolve(compressed);

            };


            image.onerror = () => {

                reject(
                    new Error(
                        "Could not load image."
                    )
                );

            };


            image.src =
                event.target.result;

        };


        reader.onerror = () => {

            reject(
                new Error(
                    "Could not read image."
                )
            );

        };


        reader.readAsDataURL(file);

    });

}


// ==========================================================
// PROFILE PHOTO SELECT
// ==========================================================

photoUpload.addEventListener("change", async () => {

    const file =
        photoUpload.files[0];

    if (!file) {
        return;
    }


    // Image validation

    if (!file.type.startsWith("image/")) {

        alert(
            "Please select an image file."
        );

        photoUpload.value = "";

        return;

    }


    // Original file max 5 MB

    if (file.size > 5 * 1024 * 1024) {

        alert(
            "Please select an image smaller than 5MB."
        );

        photoUpload.value = "";

        return;

    }


    try {

        console.log("Processing profile photo...");


        const compressedImage =
            await compressImage(file);


        // Check compressed size

        console.log(
            "Compressed image size:",
            compressedImage.length
        );


        if (compressedImage.length > 700000) {

            alert(
                "Please select a smaller image."
            );

            photoUpload.value = "";

            return;

        }


        // Keep selected photo

        selectedPhoto =
            compressedImage;


        // Preview

        profileImage.src =
            compressedImage;

        profileImage.style.display =
            "block";

        defaultAvatar.style.display =
            "none";


        console.log(
            "✅ Profile photo preview ready."
        );

    }

    catch (error) {

        console.error(
            "Image processing error:",
            error
        );

        alert(
            "Unable to process the selected image."
        );

    }

});


// ==========================================================
// CANCEL
// ==========================================================

cancelBtn.addEventListener("click", () => {

    editableFields.forEach((field) => {

        field.value =
            originalValues[field.id];

        field.disabled = true;

    });


    // Restore old photo

    if (originalPhoto) {

        profileImage.src =
            originalPhoto;

        profileImage.style.display =
            "block";

        defaultAvatar.style.display =
            "none";

    } else {

        profileImage.src =
            "";

        profileImage.style.display =
            "none";

        defaultAvatar.style.display =
            "flex";

    }


    selectedPhoto = "";

    photoUpload.value = "";

    actionArea.style.display =
        "none";

    editBtn.style.display =
        "block";

});


// ==========================================================
// SAVE CHANGES
// ==========================================================

saveBtn.addEventListener("click", async () => {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "Please login first."
        );

        return;

    }


    // ==================================================
    // GET VALUES
    // ==================================================

    const fullName =
        document.getElementById("fullName")
            .value
            .trim();

    const email =
        document.getElementById("email")
            .value
            .trim();

    const phone =
        document.getElementById("phone")
            .value
            .trim();

    const district =
        document.getElementById("district")
            .value;

    const address =
        document.getElementById("address")
            .value
            .trim();

    const rubberType =
        document.getElementById("rubberType")
            .value;

    const quality =
        document.getElementById("quality")
            .value;

    const stock =
        document.getElementById("stock")
            .value;

    const price =
        document.getElementById("price")
            .value;

    const status =
        document.getElementById("status")
            .value;

    const about =
        document.getElementById("about")
            .value
            .trim();


    // ==================================================
    // VALIDATION
    // ==================================================

    if (!fullName) {

        alert(
            "Please enter your full name."
        );

        return;

    }

    if (!email) {

        alert(
            "Please enter your email address."
        );

        return;

    }

    if (
        stock === "" ||
        Number(stock) < 0
    ) {

        alert(
            "Please enter a valid stock quantity."
        );

        return;

    }

    if (
        price === "" ||
        Number(price) < 0
    ) {

        alert(
            "Please enter a valid selling price."
        );

        return;

    }


    try {

        // ==================================================
        // PREPARE FIRESTORE DATA
        // ==================================================

        const updateData = {

            name: fullName,

            email: email,

            contact: phone,

            district: district,

            address: address,

            rubberType: rubberType,

            quality: quality,

            stock: Number(stock),

            price: Number(price),

            status: status,

            about: about

        };


        // Add profile photo

        if (selectedPhoto) {

            updateData.profilePhoto =
                selectedPhoto;

        }


        console.log(
            "Saving profile to Firestore..."
        );


        // ==================================================
        // SAVE TO FIRESTORE
        // ==================================================

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        await setDoc(
            userRef,
            updateData,
            {
                merge: true
            }
        );


        console.log(
            "✅ Profile saved successfully."
        );


        // ==================================================
        // UPDATE LOCAL STATE
        // ==================================================

        if (selectedPhoto) {

            originalPhoto =
                selectedPhoto;

        }


        selectedPhoto = "";


        // ==================================================
        // DISABLE FIELDS
        // ==================================================

        editableFields.forEach((field) => {

            field.disabled = true;

        });


        photoUpload.value = "";

        actionArea.style.display =
            "none";

        editBtn.style.display =
            "block";


        // ==================================================
        // SUCCESS TOAST
        // ==================================================

        toast.classList.add("show");


        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);


    }

    catch (error) {

        console.error(
            "❌ Error saving profile:",
            error
        );

        alert(
            "Error saving profile: " +
            error.message
        );

    }

});