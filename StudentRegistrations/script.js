/* // Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app.js";
import { getDatabase, ref, onValue, child, push, set } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-database.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWRKzFbIfeg-tkp-yDM4KGqfMl5qYTJA4",
  authDomain: "ministry-in-a-box.firebaseapp.com",
  databaseURL: "https://ministry-in-a-box-default-rtdb.firebaseio.com",
  projectId: "ministry-in-a-box",
  storageBucket: "ministry-in-a-box.appspot.com",
  messagingSenderId: "527584792499",
  appId: "1:527584792499:web:3d579c5928383a9051c5c6",
  measurementId: "G-3VEQTDFJEQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Realtime Database
const database = getDatabase(app); */

/* //Enable loading screen until Firebase is connected
//Then determine if User App is Usable now or not
const connectedRef = ref(database, ".info/connected");
const loadingContainer = document.getElementById("loading-container");
const isUsableRef = ref(database, 'UserApp/isUsable');
const splashScreenOverlay = document.getElementById("splash-screen-overlay");
const notTimeBox = document.getElementById("not-time-box");

onValue(connectedRef, (snapshot) => {

  if (snapshot.val() === true) {

    onValue(isUsableRef, (snapshot) => {
      const usable = snapshot.val();

      if (String(usable) === "true") {
        setTimeout(function () {
          $(splashScreenOverlay).fadeOut(500);
          $(notTimeBox).fadeOut(500);
          if (!loadingContainer.classList.contains('fade')) {
            loadingContainer.classList.toggle('fade');
          }
        }, 2000);
      }
      else {
        $(splashScreenOverlay).fadeIn(500);
        $(notTimeBox).fadeIn(500);
        if (!loadingContainer.classList.contains('fade')) {
          loadingContainer.classList.toggle('fade');
        }
      }
    });
  }
}); */

window.addEventListener('load', (event) => {
  var baptismLabel = document.getElementById("baptism-label");
  var baptismForm = document.getElementById("baptism-form");
  var baptismBtn = document.getElementById("btnBaptism");

  var joshuaLabel = document.getElementById("joshua-project-label");
  var joshuaForm = document.getElementById("jp-form");
  var joshuaBtn = document.getElementById("btnJoshua");

  var eventLabel = document.getElementById("events-label");
  var eventsForm = document.getElementById("events-form");
  var eventsBtn = document.getElementById("btnEvents");

  var previousForm = null;
  var currentForm = "baptism";

  baptismLabel.addEventListener('click', function () {
    previousForm = currentForm;
    currentForm = "baptism";
    if (!baptismLabel.children[0].classList.contains('selected')) {
      //Take care of styling first
      baptismLabel.children[0].classList.add('selected');
      baptismLabel.children[0].children[0].classList = "fa fa-heart fa-label filled";

      joshuaLabel.children[0].classList.remove('selected');
      joshuaLabel.children[0].children[0].classList = "fa fa-user-o fa-label";

      eventLabel.children[0].classList.remove('selected');
      eventLabel.children[0].children[0].classList = "fa fa-bell-o fa-label";

      //Show the baptism form and hide the previous
      baptismForm.style = "animation: fade-in .5s ease-in-out forwards;";
      if (previousForm == "joshua") {
        joshuaForm.style = "display: none;";
      }
      else {
        eventsForm.style = "display:none;";
      }
    }
  });

  joshuaLabel.addEventListener('click', function () {
    previousForm = currentForm;
    currentForm = "joshua";
    if (!joshuaLabel.children[0].classList.contains('selected')) {
      //Take care of styling first
      baptismLabel.children[0].classList.remove('selected');
      baptismLabel.children[0].children[0].classList = "fa fa-heart-o fa-label";

      joshuaLabel.children[0].classList.add('selected');
      joshuaLabel.children[0].children[0].classList = "fa fa-user fa-label filled";

      eventLabel.children[0].classList.remove('selected');
      eventLabel.children[0].children[0].classList = "fa fa-bell-o fa-label";

      //Show the joshua project form and hide the previous
      joshuaForm.style = "animation: fade-in .5s ease-in-out forwards;";
      if (previousForm == "baptism") {
        baptismForm.style = "display: none;";
      }
      else {
        eventsForm.style = "display:none;";
      }
    }
  });

  eventLabel.addEventListener('click', function () {
    previousForm = currentForm;
    currentForm = "events";
    if (!eventLabel.children[0].classList.contains('selected')) {
      //Take care of styling first
      baptismLabel.children[0].classList.remove('selected');
      baptismLabel.children[0].children[0].classList = "fa fa-heart-o fa-label";

      joshuaLabel.children[0].classList.remove('selected');
      joshuaLabel.children[0].children[0].classList = "fa fa-user-o fa-label";

      eventLabel.children[0].classList.add('selected');
      eventLabel.children[0].children[0].classList = "fa fa-bell fa-label filled";

      //Show the event registration form and hide the previous
      eventsForm.style = "animation: fade-in .4s ease-in-out forwards;";
      if (previousForm == "baptism") {
        baptismForm.style = "display:none;";
      }
      else {
        joshuaForm.style = "display:none;";
      }
    }
  });

  baptismBtn.addEventListener('click', function () {
    var layers = document.querySelectorAll(".left-layer");
    for (const layer of layers) {
      layer.classList.add("active");
    }
  });

  joshuaBtn.addEventListener('click', function () {

  });

  eventsBtn.addEventListener('click', function () {

  });
});

//GO HERE FOR PAGE TRANSITIONS
//https://codepen.io/mburakerman/pen/roJmaZ

//GO HERE FOR ICONS
//https://fontawesome.com/v4/icons/