import { auth } from "./firebase-config.js";

import { 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


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

    .then((userCredential) => {

        console.log("Logged in:", userCredential.user.uid);

        window.location.href = "profile.html";

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
