import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


document.addEventListener("DOMContentLoaded",()=>{

    const profileBtn = document.getElementById("profileBtn");


    if(profileBtn){

        profileBtn.addEventListener("click",()=>{


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


                        if(data.userType === "farmer"){

                            window.location.href =
                            "farmer-profile.html";

                        }


                        else if(data.userType === "buyer"){

                            window.location.href =
                            "buyer-profile.html";

                        }


                    }


                }

                else{

                    window.location.href =
                    "login.html";

                }


            });


        });


    }



});