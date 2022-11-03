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
  var mainGrid = document.getElementById('main-grid');
  var baptismLabel = document.getElementById("baptism-label");
  var baptismForm = document.getElementById("baptism-form");
  var baptismBtn = document.getElementById("btnBaptism");
  var joshuaLabel = document.getElementById("joshua-project-label");
  var joshuaForm = document.getElementById("jp-form");
  var joshuaBtn = document.getElementById("btnJoshua");
  var eventLabel = document.getElementById("events-label");
  var eventsForm = document.getElementById("events-form");
  var eventsBtn = document.getElementById("btnEvents");

  var baptismGrid = document.getElementById('baptism-grid');
  var baptismGoBack = document.getElementById('btnBaptismBack');

  var joshuaGrid = document.getElementById('joshua-grid');
  var joshuaGoBack = document.getElementById('btnJoshuaBack');

  var eventsGrid = document.getElementById('events-grid');
  var eventsGoBack = document.getElementById('btnEventsBack');

  //******MAIN GRID******//
  var previousForm = null;
  var currentForm = baptismForm;

  baptismLabel.addEventListener('click', function () {
    previousForm = currentForm;
    currentForm = baptismForm
    if (!baptismLabel.children[0].classList.contains('selected')) {
      //Take care of styling first
      Set_Icon_Style(baptismLabel, "fa-solid fa-heart fa-label filled", "add");
      Set_Icon_Style(joshuaLabel, "fa-regular fa-user fa-label", "remove");
      Set_Icon_Style(eventLabel, "fa-regular fa-bell fa-label", "remove");

      //Show the baptism form and hide the previous
      Show_Forms(currentForm, previousForm);
    }
  });

  joshuaLabel.addEventListener('click', function () {
    previousForm = currentForm;
    currentForm = joshuaForm;
    if (!joshuaLabel.children[0].classList.contains('selected')) {
      //Take care of styling first
      Set_Icon_Style(baptismLabel, "fa-regular fa-heart fa-label", "remove");
      Set_Icon_Style(joshuaLabel, "fa-solid fa-user fa-label filled", "add");
      Set_Icon_Style(eventLabel, "fa-regular fa-bell fa-label", "remove");

      //Show the joshua project form and hide the previous
      Show_Forms(currentForm, previousForm);
    }
  });

  eventLabel.addEventListener('click', function () {
    previousForm = currentForm;
    currentForm = eventsForm;
    if (!eventLabel.children[0].classList.contains('selected')) {
      //Take care of styling first
      Set_Icon_Style(baptismLabel, "fa-regular fa-heart fa-label", "remove");
      Set_Icon_Style(joshuaLabel, "fa-regular fa-user fa-label", "remove");
      Set_Icon_Style(eventLabel, "fa-solid fa-bell fa-label filled", "add");

      //Show the event registration form and hide the previous
      Show_Forms(currentForm, previousForm);
    }
  });

  baptismBtn.addEventListener('click', function () {
    var layers = Start_Layer_Anim("left");

    Set_Grid_Animations(mainGrid, "fade-left");
    Set_Grid_Animations(baptismGrid, "fade-in");

    Switch_Form_Shown(mainGrid, baptismGrid, layers);
  });

  joshuaBtn.addEventListener('click', function () {
    var layers = Start_Layer_Anim("right");

    Set_Grid_Animations(mainGrid, "fade-right");
    Set_Grid_Animations(joshuaGrid, "fade-in");

    Switch_Form_Shown(mainGrid, joshuaGrid, layers);
  });

  eventsBtn.addEventListener('click', function () {
    var layers = Start_Layer_Anim("bottom");

    Set_Grid_Animations(mainGrid, "fade-up");
    Set_Grid_Animations(eventsGrid, "fade-in");

    Switch_Form_Shown(mainGrid, eventsGrid, layers);
  });
  //******END MAIN GRID ******//

  //******BAPTISM GRID ******//
  baptismGoBack.addEventListener('click', function () {
    var layers = Start_Layer_Anim("right");

    Set_Grid_Animations(baptismGrid, "fade-right");
    Set_Grid_Animations(mainGrid, "fade-in");

    Switch_Form_Shown(baptismGrid, mainGrid, layers);
  });
  //******JOSHUA GRID ******//
  joshuaGoBack.addEventListener('click', function () {
    var layers = Start_Layer_Anim("left");

    Set_Grid_Animations(joshuaGrid, "fade-left");
    Set_Grid_Animations(mainGrid, "fade-in");

    Switch_Form_Shown(joshuaGrid, mainGrid, layers);
  });
  //******EVENT GRID ******//
  eventsGoBack.addEventListener('click', function () {
    var layers = Start_Layer_Anim("top");

    Set_Grid_Animations(eventsGrid, "fade-down");
    Set_Grid_Animations(mainGrid, "fade-in");

    Switch_Form_Shown(eventsGrid, mainGrid, layers);
  });
});

//FUNCTIONS
function Set_Icon_Style(label, changedClass, addOrRemove) {
  if(addOrRemove == "add"){
    label.children[0].classList.add('selected');
  }
  else{
    label.children[0].classList.remove('selected');
  }  
  label.children[0].children[0].classList = changedClass;
}

function Show_Forms(curr, prev, other) {
  curr.style = "animation: fade-in .5s ease-in-out forwards;";
  prev.style.display = "none";
}

function Start_Layer_Anim(direction) {
  var layers = document.querySelectorAll("."+direction+"-layer");
  for (const layer of layers) {
    layer.classList.remove("done");
    layer.classList.add("active");
  }

  return layers;
}

function Set_Grid_Animations(elem, fadeType) {
  elem.style.animation = 'none';
  elem.offsetHeight;
  elem.style.animation = null;
  elem.style = "animation: " + fadeType + " .8s ease-in-out forwards;";
}

function Switch_Form_Shown(hide, show, layers) {
  setTimeout(() => {
    hide.className = "hidden";
    show.className = "shown";
    for (const layer of layers) {
      layer.classList.add("done");
      layer.classList.remove("active");
    }
  }, 1125);
}

//GO HERE FOR PAGE TRANSITIONS
//https://codepen.io/mburakerman/pen/roJmaZ

//GO HERE FOR ICONS
//https://fontawesome.com/v4/icons/