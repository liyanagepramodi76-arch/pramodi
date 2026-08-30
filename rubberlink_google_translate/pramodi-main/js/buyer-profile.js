// ==========================================================
// RUBBERLINK BUYER / COMPANY PROFILE
// ==========================================================
console.log("Buyer profile JS loaded");

import { auth, db } from "./firebase-config.js";


import {
    doc,
    getDoc
}
from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


import {
    onAuthStateChanged
}
from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";



// CHECK LOGIN USER

onAuthStateChanged(auth, async(user)=>{


    if(user){


        const userRef = doc(
            db,
            "users",
            user.uid
        );


        const userSnap = await getDoc(userRef);



        if(userSnap.exists()){


            const data = userSnap.data();



            // ======================
            // COMPANY INFORMATION
            // ======================


            document.getElementById("displayCompanyName").innerHTML =
            data.companyName || "Company Name";



            document.getElementById("companyName").value =
            data.companyName || "";



            document.getElementById("contactPerson").value =
            data.name || "";



            document.getElementById("email").value =
            data.email || "";



            document.getElementById("phone").value =
            data.companyContact || "";



            document.getElementById("district").value =
            data.district || "";



            document.getElementById("address").value =
            data.companyAddress || "";



            document.getElementById("displayLocation").innerHTML =
            (data.district || "") + ", Sri Lanka";



        }


    }


    else{


        window.location.href="login.html";


    }



});



// BUTTONS

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const actionArea =
    document.getElementById("actionArea");

const toast =
    document.getElementById("toast");


// PROFILE IMAGE

const photoUpload =
    document.getElementById("photoUpload");

const profileImage =
    document.getElementById("profileImage");

const defaultAvatar =
    document.getElementById("defaultAvatar");


// EDITABLE FIELDS

const editableFields =
    document.querySelectorAll(
        "#companyName, " +
        "#contactPerson, " +
        "#email, " +
        "#phone, " +
        "#district, " +
        "#address, " +
        "#rubberType, " +
        "#quality, " +
        "#quantity, " +
        "#price, " +
        "#preferredLocation, " +
        "#status, " +
        "#about"
    );


// OLD VALUES FOR CANCEL

let originalValues = {};

let originalPhoto = "";

let hadProfilePhoto = false;


// DEFAULT VIEW MODE

actionArea.style.display = "none";

photoUpload.disabled = true;


// ==========================================================
// EDIT PROFILE
// ==========================================================

editBtn.addEventListener("click", function () {

    // Store old data
    editableFields.forEach(function (field) {

        originalValues[field.id] =
            field.value;

        field.disabled = false;

    });


    // Store current logo
    if (
        profileImage.style.display !== "none" &&
        profileImage.src
    ) {

        hadProfilePhoto = true;

        originalPhoto =
            profileImage.src;

    } else {

        hadProfilePhoto = false;

        originalPhoto = "";

    }


    // Enable logo upload
    photoUpload.disabled = false;


    // Show Save + Cancel
    actionArea.style.display = "flex";


    // Hide Edit
    editBtn.style.display = "none";

});


// ==========================================================
// CANCEL
// ==========================================================

cancelBtn.addEventListener("click", function () {

    // Restore old values
    editableFields.forEach(function (field) {

        field.value =
            originalValues[field.id];

        field.disabled = true;

    });


    // Restore old logo
    if (hadProfilePhoto) {

        profileImage.src =
            originalPhoto;

        profileImage.style.display =
            "block";

        defaultAvatar.style.display =
            "none";

    } else {

        profileImage.src = "";

        profileImage.style.display =
            "none";

        defaultAvatar.style.display =
            "flex";

    }


    photoUpload.value = "";

    photoUpload.disabled = true;


    // Hide action buttons
    actionArea.style.display = "none";


    // Show Edit
    editBtn.style.display = "block";

});


// ==========================================================
// SAVE
// ==========================================================

saveBtn.addEventListener("click", function () {

    const companyName =
        document
            .getElementById("companyName")
            .value
            .trim();


    const contactPerson =
        document
            .getElementById("contactPerson")
            .value
            .trim();


    const email =
        document
            .getElementById("email")
            .value
            .trim();


    const district =
        document
            .getElementById("district")
            .value;


    const rubberType =
        document
            .getElementById("rubberType")
            .value;


    const quantity =
        document
            .getElementById("quantity")
            .value;


    const price =
        document
            .getElementById("price")
            .value;


    const status =
        document
            .getElementById("status")
            .value;


    // ================= VALIDATION =================

    if (companyName === "") {

        alert("Please enter the company name.");

        return;
    }


    if (contactPerson === "") {

        alert("Please enter the contact person name.");

        return;
    }


    if (email === "") {

        alert("Please enter the email address.");

        return;
    }


    if (
        quantity === "" ||
        Number(quantity) < 0
    ) {

        alert(
            "Please enter a valid required quantity."
        );

        return;
    }


    if (
        price === "" ||
        Number(price) < 0
    ) {

        alert(
            "Please enter a valid buying price."
        );

        return;
    }


    // Disable fields
    editableFields.forEach(function (field) {

        field.disabled = true;

    });


    photoUpload.disabled = true;


    // ================= HEADER UPDATE =================

    document
        .getElementById("displayCompanyName")
        .textContent =
        companyName;


    document
        .getElementById("displayLocation")
        .textContent =
        district + ", Sri Lanka";


    // ================= SUMMARY UPDATE =================

    document
        .getElementById("summaryType")
        .textContent =
        rubberType;


    document
        .getElementById("summaryQuantity")
        .textContent =
        quantity + " kg";


    document
        .getElementById("summaryPrice")
        .textContent =
        "Rs. " + price + "/kg";


    // ================= STATUS UPDATE =================

    const displayStatus =
        document.getElementById(
            "displayStatus"
        );


    if (
        status === "Not Buying" ||
        Number(quantity) === 0
    ) {

        displayStatus.textContent =
            "● Not Currently Buying";

        displayStatus.classList.add(
            "not-buying"
        );

    } else {

        displayStatus.textContent =
            "● Currently Buying";

        displayStatus.classList.remove(
            "not-buying"
        );

    }


    // Hide action buttons
    actionArea.style.display = "none";


    // Show Edit
    editBtn.style.display = "block";


    // Reset file input
    photoUpload.value = "";


    // ================= TOAST =================

    toast.classList.add("show");


    setTimeout(function () {

        toast.classList.remove("show");

    }, 3000);

});


// ==========================================================
// COMPANY LOGO PREVIEW
// ==========================================================

photoUpload.addEventListener("change", function () {

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


    const reader =
        new FileReader();


    reader.onload = function (event) {

        profileImage.src =
            event.target.result;


        defaultAvatar.style.display =
            "none";


        profileImage.style.display =
            "block";

    };


    reader.readAsDataURL(file);

});