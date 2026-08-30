import { db, auth } from "./firebase-config.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const publishBtn = document.getElementById("publishBtn");

publishBtn.addEventListener("click", async () => {

    if (!auth.currentUser) {

        alert("Please login first.");
        return;

    }

    const company = document.getElementById("company").value.trim();
    const district = document.getElementById("district").value;
    const price = document.getElementById("price").value;
    const phone = document.getElementById("phone").value.trim();

    if (!company || !price || !phone) {

        alert("Please fill all fields.");
        return;

    }

    try {

        await addDoc(collection(db, "buyerPrices"), {

            company: company,
            district: district,
            price: Number(price),
            phone: phone,

            buyerEmail: auth.currentUser.email,
            buyerUID: auth.currentUser.uid,

            createdAt: serverTimestamp()

        });

        alert("✅ Buying price published successfully!");

        document.getElementById("company").value = "";
        document.getElementById("price").value = "";
        document.getElementById("phone").value = "";

    }

    catch(error){

        console.error(error);
        alert(error.message);

    }

});