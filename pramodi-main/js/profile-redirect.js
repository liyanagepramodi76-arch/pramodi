import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {

    const profileBtn = document.getElementById("profileBtn");
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");

    // Feature sections
    const publicFeatures = document.getElementById("publicFeatures");
    const farmerFeatures = document.getElementById("farmerFeatures");
    const buyerFeatures = document.getElementById("buyerFeatures");


    onAuthStateChanged(auth, async (user) => {

        // First, hide all feature sections
        if (publicFeatures) {
            publicFeatures.style.display = "none";
        }

        if (farmerFeatures) {
            farmerFeatures.style.display = "none";
        }

        if (buyerFeatures) {
            buyerFeatures.style.display = "none";
        }


        // ================= NOT LOGGED IN =================
        if (!user) {

            // Show Login button
            if (loginBtn) {
                loginBtn.style.display = "inline-flex";
            }

            // Show Register button
            if (registerBtn) {
                registerBtn.style.display = "inline-flex";
            }

            // Hide Profile button
            if (profileBtn) {
                profileBtn.style.display = "none";
            }

            // Show Public Features
            if (publicFeatures) {
                publicFeatures.style.display = "flex";
            }

            return;
        }


        // ================= LOGGED IN =================

        // Hide Login and Register buttons
        if (loginBtn) {
            loginBtn.style.display = "none";
        }

        if (registerBtn) {
            registerBtn.style.display = "none";
        }

        // Show Profile button
        if (profileBtn) {
            profileBtn.style.display = "inline-flex";
        }


        try {

            // Get user type from Firestore
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);


            if (!userSnap.exists()) {

                // If user data does not exist,
                // show public features
                if (publicFeatures) {
                    publicFeatures.style.display = "flex";
                }

                return;
            }


            const data = userSnap.data();


            // ================= FARMER =================
            if (data.userType === "farmer") {

                if (farmerFeatures) {
                    farmerFeatures.style.display = "flex";
                }

            }


            // ================= BUYER =================
            else if (data.userType === "buyer") {

                if (buyerFeatures) {
                    buyerFeatures.style.display = "flex";
                }

            }

            else {

                // Unknown user type
                if (publicFeatures) {
                    publicFeatures.style.display = "flex";
                }

            }


            // ================= PROFILE REDIRECT =================
            if (profileBtn) {

                profileBtn.onclick = (e) => {

                    e.preventDefault();

                    if (data.userType === "farmer") {

                        window.location.href =
                            "farmer-profile.html";

                    }

                    else if (data.userType === "buyer") {

                        window.location.href =
                            "buyer-profile.html";

                    }

                };

            }

        }

        catch (error) {

            console.error("Error getting user data:", error);

            // Show public features if an error occurs
            if (publicFeatures) {
                publicFeatures.style.display = "flex";
            }

        }

    });

});