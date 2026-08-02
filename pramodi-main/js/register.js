import { auth, db } from "./config.js";

import {
    createUserWithEmailAndPassword
} from 
"https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc
} from 
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const form = document.getElementById("registerForm");


form.addEventListener("submit", async (e)=>{

    e.preventDefault();


    let name = document.getElementById("personName").value.trim();

    let nic = document.getElementById("nicNumber").value.trim();

    let email = document.getElementById("email").value.trim();

    let username = document.getElementById("username").value.trim();

    let password = document.getElementById("password").value;

    let userType = document.getElementById("userType").value;



    try{


        // Create Firebase Authentication Account

        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );


        const user = userCredential.user;



        // Save user details in Firestore

        await setDoc(
    doc(db,"users",user.uid),
    {

        uid:user.uid,

        name:name,

        nic:nic,

        email:email,

        username:username,

        userType:userType,


        // Farmer details
        address: document.getElementById("address")?.value || "",
        contact: document.getElementById("contact")?.value || "",
        district: document.getElementById("district")?.value || "",


        // Buyer details
        companyName: document.getElementById("companyName")?.value || "",
        companyAddress: document.getElementById("companyAddress")?.value || "",
        companyContact: document.getElementById("companyContact")?.value || "",


        createdAt:new Date()

    }
);



        alert("Registration Successful!");

            if (userType === "farmer") {

                window.location.href = "farmer-profile.html";

            }
            else if (userType === "buyer") {

                window.location.href = "buyer-profile.html";

            }
            else {

                window.location.href = "index.html";

            }


    }


    catch(error){


        console.log(error);


        alert(error.message);


    }


});