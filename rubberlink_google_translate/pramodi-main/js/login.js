import { auth,db } from "./firebase-config.js";


import { 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
}
from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ================= PASSWORD SHOW / HIDE =================

const togglePassword = document.getElementById("togglePassword");

const password = document.getElementById("password");


togglePassword.addEventListener("click", function(){

    if(password.type === "password"){

        password.type = "text";

        togglePassword.classList.remove("fa-eye");

        togglePassword.classList.add("fa-eye-slash");

    }

    else{

        password.type = "password";

        togglePassword.classList.remove("fa-eye-slash");

        togglePassword.classList.add("fa-eye");

    }

});



// ================= FIREBASE LOGIN =================


const loginForm = document.querySelector("form");

const loginButton = document.querySelector(".login-btn");


loginForm.addEventListener("submit", function(e){

    e.preventDefault();


    const email = document.getElementById("email").value;
    const userPassword = password.value;



    loginButton.classList.add("loading");

    loginButton.innerHTML = "Signing in...";



    signInWithEmailAndPassword(auth, email, userPassword)

    .then(async (userCredential) => {


    const user = userCredential.user;


    console.log("Logged in:", user.uid);



    // Get user details from Firestore

    const userDoc = await getDoc(
        doc(db,"users",user.uid)
    );



    if(userDoc.exists()){


        const userData = userDoc.data();



        console.log("User Type:", userData.userType);



        if(userData.userType === "farmer"){


            window.location.href = "farmer-profile.html";


        }


        else if(userData.userType === "buyer"){


            window.location.href = "buyer-profile.html";


        }


        else{


            window.location.href = "index.html";


        }


    }


    else{


        alert("User profile data not found.");


    }


})


    .catch((error)=>{

    console.log(error.code);

    if(error.code === "auth/user-not-found"){

        alert("No account found with this email.");

    }

    else if(error.code === "auth/wrong-password"){

        alert("Incorrect password.");

    }

    else if(error.code === "auth/invalid-email"){

        alert("Invalid email address.");

    }

    else{

        alert(error.message);

    }


    loginButton.classList.remove("loading");

    loginButton.innerHTML="Sign In";

});



});