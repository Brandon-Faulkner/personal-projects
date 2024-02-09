// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDAX8uoeRs8B313j0ChhCWnDjPDsrJQyxM",
    authDomain: "slidrshow.firebaseapp.com",
    databaseURL: "https://slidrshow-default-rtdb.firebaseio.com",
    projectId: "slidrshow",
    storageBucket: "slidrshow.appspot.com",
    messagingSenderId: "394159127739",
    appId: "1:394159127739:web:99ca5e4111c9605081fd9e"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

window.addEventListener('load', () => {
    const loader = document.getElementById("loader");
    const mediaHolder = document.getElementById("mediaHolder");

    //First check if URL has query param, if not, nothing to show
    const urlQuery = window.location.href.split("?")[1];

    if (urlQuery) {
        onValue(ref(database, urlQuery + "/"), (snapshot) => {
            if (snapshot.exists()) {
                loader.style = "";
                const mediaType = snapshot.child("type").val();
                const mediaURL = snapshot.child("url").val();

                if (mediaType && mediaURL) {
                    mediaHolder.replaceChildren();

                    const mediaElem = document.createElement(mediaType);
                    mediaElem.setAttribute("id", "mediaElem");
                    mediaElem.setAttribute("autoplay", "");
                    mediaElem.setAttribute("controls", "");
                    mediaElem.setAttribute("loop", "");
                    mediaElem.src = mediaURL;

                    mediaHolder.appendChild(mediaElem);

                    if (mediaType === "video") {
                        mediaElem.play();
                    }
                }
                loader.style = "display: none";
            }
        }, error => {
            console.log(error.code + ": " + error.message);
        });
    }
});