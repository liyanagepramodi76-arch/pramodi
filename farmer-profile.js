// ==========================================================
// RUBBERLINK FARMER PROFILE
// ==========================================================


// ----------------------------------------------------------
// GET BUTTONS
// ----------------------------------------------------------

const editBtn = document.getElementById("editBtn");

const saveBtn = document.getElementById("saveBtn");

const cancelBtn = document.getElementById("cancelBtn");

const actionArea = document.getElementById("actionArea");

const toast = document.getElementById("toast");


// ----------------------------------------------------------
// PROFILE PHOTO
// ----------------------------------------------------------

const photoUpload =
    document.getElementById("photoUpload");

const profileImage =
    document.getElementById("profileImage");

const defaultAvatar =
    document.getElementById("defaultAvatar");


// ----------------------------------------------------------
// PROFILE FIELDS
// ----------------------------------------------------------

const editableFields =
    document.querySelectorAll(

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


// ----------------------------------------------------------
// VARIABLES FOR CANCEL FUNCTION
// ----------------------------------------------------------

let originalValues = {};

let originalPhoto = "";

let hadProfilePhoto = false;


// ----------------------------------------------------------
// DEFAULT STATE
// ----------------------------------------------------------

actionArea.style.display = "none";


// Change Photo should only work in Edit Mode initially

photoUpload.disabled = true;


// ==========================================================
// EDIT PROFILE
// ==========================================================

editBtn.addEventListener(
    "click",
    function () {

        // ---------------------------------------------
        // Store old field values
        // ---------------------------------------------

        editableFields.forEach(
            function (field) {

                originalValues[field.id] =
                    field.value;

                field.disabled = false;

            }
        );


        // ---------------------------------------------
        // Store current photo state
        // ---------------------------------------------

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


        // Allow photo change

        photoUpload.disabled = false;


        // Show Save + Cancel

        actionArea.style.display =
            "flex";


        // Hide Edit Profile button

        editBtn.style.display =
            "none";

    }
);


// ==========================================================
// CANCEL EDIT
// ==========================================================

cancelBtn.addEventListener(
    "click",
    function () {

        // ---------------------------------------------
        // Restore old field values
        // ---------------------------------------------

        editableFields.forEach(
            function (field) {

                field.value =
                    originalValues[field.id];

                field.disabled = true;

            }
        );


        // ---------------------------------------------
        // Restore old photo
        // ---------------------------------------------

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


        // Reset file input

        photoUpload.value = "";

        photoUpload.disabled = true;


        // Hide buttons

        actionArea.style.display =
            "none";


        // Show Edit button again

        editBtn.style.display =
            "block";

    }
);


// ==========================================================
// SAVE CHANGES
// ==========================================================

saveBtn.addEventListener(
    "click",
    function () {

        // ---------------------------------------------
        // GET VALUES
        // ---------------------------------------------

        const fullName =
            document
                .getElementById("fullName")
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


        const stock =
            document
                .getElementById("stock")
                .value;


        const price =
            document
                .getElementById("price")
                .value;


        const status =
            document
                .getElementById("status")
                .value;


        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (fullName === "") {

            alert(
                "Please enter your full name."
            );

            return;
        }


        if (email === "") {

            alert(
                "Please enter your email address."
            );

            return;
        }


        if (stock === "" || Number(stock) < 0) {

            alert(
                "Please enter a valid stock quantity."
            );

            return;
        }


        if (price === "" || Number(price) < 0) {

            alert(
                "Please enter a valid selling price."
            );

            return;
        }


        // ---------------------------------------------
        // DISABLE ALL FIELDS
        // ---------------------------------------------

        editableFields.forEach(
            function (field) {

                field.disabled = true;

            }
        );


        photoUpload.disabled = true;


        // ==================================================
        // UPDATE TOP PROFILE INFORMATION
        // ==================================================

        document
            .getElementById("displayName")
            .textContent =
            fullName;


        document
            .getElementById("displayLocation")
            .textContent =
            district + ", Sri Lanka";


        // ==================================================
        // UPDATE SUMMARY CARDS
        // ==================================================

        document
            .getElementById("summaryType")
            .textContent =
            rubberType;


        document
            .getElementById("summaryStock")
            .textContent =
            stock + " kg";


        document
            .getElementById("summaryPrice")
            .textContent =
            "Rs. " +
            price +
            "/kg";


        // ==================================================
        // UPDATE AVAILABILITY
        // ==================================================

        const displayAvailability =
            document.getElementById(
                "displayAvailability"
            );


        if (
            status === "Out of Stock" ||
            Number(stock) === 0
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


        // ---------------------------------------------
        // HIDE SAVE + CANCEL
        // ---------------------------------------------

        actionArea.style.display =
            "none";


        // ---------------------------------------------
        // SHOW EDIT BUTTON
        // ---------------------------------------------

        editBtn.style.display =
            "block";


        // ---------------------------------------------
        // RESET FILE INPUT
        // ---------------------------------------------

        photoUpload.value = "";


        // ==================================================
        // SUCCESS TOAST
        // ==================================================

        toast.classList.add(
            "show"
        );


        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

    }
);


// ==========================================================
// PROFILE PHOTO PREVIEW
// ==========================================================

photoUpload.addEventListener(
    "change",
    function () {

        const file =
            photoUpload.files[0];


        if (!file) {

            return;

        }


        // Only allow image files

        if (
            !file.type.startsWith("image/")
        ) {

            alert(
                "Please select an image file."
            );

            photoUpload.value = "";

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                // Set selected photo

                profileImage.src =
                    event.target.result;


                // Hide default avatar

                defaultAvatar.style.display =
                    "none";


                // Show selected image

                profileImage.style.display =
                    "block";

            };


        reader.readAsDataURL(
            file
        );

    }
);
