
import { db, auth } from "./firebase-config.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Get the form
const buyerPriceForm = document.getElementById("buyerPriceForm");


// Submit form
buyerPriceForm.addEventListener("submit", async (e) => {

    e.preventDefault();


    // Check login
    if (!auth.currentUser) {

        alert("Please login first.");
        return;

    }


    // Get form values
    const company = document.getElementById("companyName").value.trim();
    const district = document.getElementById("district").value;
    const rubberType = document.getElementById("rubberType").value;
    const price = document.getElementById("buyingPrice").value;
    const details = document.getElementById("details").value.trim();


    // Validate
    if (!company || !district || !rubberType || !price) {

        alert("Please fill all required fields.");
        return;

    }


    try {

        // Save to Firestore
        await addDoc(collection(db, "buyerPrices"), {

            company: company,
            district: district,
            rubberType: rubberType,
            price: Number(price),
            details: details,

            buyerEmail: auth.currentUser.email,
            buyerUID: auth.currentUser.uid,

            createdAt: serverTimestamp()

        });


        // Success message
        alert("✅ Buying price published successfully!");


        // Clear form
        buyerPriceForm.reset();

    }

    catch (error) {

        console.error("Error publishing buying price:", error);

        alert("Error: " + error.message);

    }

});