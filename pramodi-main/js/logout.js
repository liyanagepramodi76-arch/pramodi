import { auth } from "./firebase-config.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const logoutBtn = document.getElementById("logoutBtn");


if(logoutBtn){

    logoutBtn.addEventListener("click", async(e)=>{

        e.preventDefault();


        await signOut(auth);


        window.location.href = "index.html";


    });

}