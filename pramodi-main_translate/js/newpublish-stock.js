import { db, auth } from "./firebase-config.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const form = document.getElementById("publishStockForm");
console.log("Publish Stock JS loaded");
if (form) {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        if (!auth.currentUser) {
            alert("Please login first.");
            return;
        }

        const rubberType =
            document.getElementById("rubberType").value;

        const quantity =
            document.getElementById("quantity").value;

        const price =
            document.getElementById("price").value;

        const harvestDate =
            document.getElementById("harvestDate").value;

        const description =
            document.getElementById("description").value.trim();


        if (!rubberType || !quantity || !price || !harvestDate) {
            alert("Please fill all required fields.");
            return;
        }


        try {

            await addDoc(
                collection(db, "publishedStocks"),
                {
                    farmerUID: auth.currentUser.uid,
                    farmerEmail: auth.currentUser.email,

                    rubberType: rubberType,

                    quantity: Number(quantity),

                    price: Number(price),

                    harvestDate: harvestDate,

                    description: description,

                    createdAt: serverTimestamp()
                }
            );


            alert("✅ Stock published successfully!");

        } catch (error) {

            console.error(
                "Error publishing stock:",
                error
            );

            alert(
                "Error: " + error.message
            );
        }

    });

}