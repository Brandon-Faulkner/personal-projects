//GO HERE FOR PAGE TRANSITIONS
//https://codepen.io/mburakerman/pen/roJmaZ

//GO HERE FOR OLD ICONS
//https://fontawesome.com/v4/icons/

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app.js";
import { getDatabase, ref as ref_db, get, onValue, child, push, set } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-database.js";
import { getStorage, ref as ref_st, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPa4tUiXdf_ovam3B781JEmwexMbpCbKY",
  authDomain: "student-event-registrations.firebaseapp.com",
  databaseURL: "https://student-event-registrations-default-rtdb.firebaseio.com",
  projectId: "student-event-registrations",
  storageBucket: "student-event-registrations.appspot.com",
  messagingSenderId: "99479317896",
  appId: "1:99479317896:web:9c22c9b06e7bec800f1e3d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Realtime Database
const database = getDatabase(app);
// Initialize Storage
const storage = getStorage(app);
// Initialize Auth
const auth = getAuth(app);

/*//Enable loading icon until Firebase is connected when on event page
const connectedRef = ref(database, ".info/connected");
const loadingContainer = document.getElementById("loading-container");

onValue(connectedRef, (snapshot) => {

  if (snapshot.val() === true) {
    //Stop loading
  }
  else
  {
    //Keep loading
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
  var eventsContainer = document.getElementById('events-main');
  var eventsGoBack = document.getElementById('btnEventsBack');

  var eventsActivityGrid = document.getElementById('events-activity-grid');
  var eventsActivityImg = document.getElementById('activity-image');
  var eventsActivityDate = document.getElementById('activity-date');
  var eventsActivityCost = document.getElementById('activity-cost');
  var activityNameInput = document.getElementById('activity-name');
  var activityChoice = document.getElementById('activity-choice');
  var eventsActivityGoBack = document.getElementById('btnEventsActivityBack');
  var eventsActivitySubmit = document.getElementById('btnEventsActivitySubmit');

  var eventsEventGrid = document.getElementById('events-event-grid');
  var eventsEventImg = document.getElementById('event-image');
  var eventsEventDate = document.getElementById('event-date');
  var eventsEventCost = document.getElementById('event-cost');
  var eventNameInput = document.getElementById('event-name');
  var eventEmailInput = document.getElementById('event-email');
  var eventPhoneInput = document.getElementById('event-phone');
  var eventsEventGoBack = document.getElementById('btnEventsEventBack');
  var eventsEventSubmit = document.getElementById('btnEventsEventSubmit');

  var logo = document.getElementById('logo-img');
  var loading = document.getElementById('loading-overlay');
  var loginScreenGrid = document.getElementById('login-screen-grid');
  var isLoggedIn = false;

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
    Set_Logo_Animations(logo, "fade-left", 1125);
    Set_Grid_Animations(baptismGrid, "fade-in");

    Switch_Form_Shown(mainGrid, baptismGrid, layers);
  });

  joshuaBtn.addEventListener('click', function () {
    var layers = Start_Layer_Anim("right");

    Set_Grid_Animations(mainGrid, "fade-right");
    Set_Logo_Animations(logo, "fade-right", 1125);
    Set_Grid_Animations(joshuaGrid, "fade-in");

    Switch_Form_Shown(mainGrid, joshuaGrid, layers);
  });

  eventsBtn.addEventListener('click', function () {
    var layers = Start_Layer_Anim("bottom");

    Set_Grid_Animations(mainGrid, "fade-up");
    Set_Logo_Animations(logo, "fade-up", 1125);
    Set_Grid_Animations(eventsGrid, "fade-in");
    Load_Events();

    Switch_Form_Shown(mainGrid, eventsGrid, layers);
  });
  //******END MAIN GRID ******//

  //******GO BACK BTNS ******//
  //******BAPTISM GRID ******//
  baptismGoBack.addEventListener('click', function () {
    var layers = Start_Layer_Anim("right");

    Set_Grid_Animations(baptismGrid, "fade-right");
    Set_Logo_Animations(logo, "fade-right", 1125);
    Set_Grid_Animations(mainGrid, "fade-in");

    Switch_Form_Shown(baptismGrid, mainGrid, layers);
  });
  //******JOSHUA GRID ******//
  joshuaGoBack.addEventListener('click', function () {
    var layers = Start_Layer_Anim("left");

    Set_Grid_Animations(joshuaGrid, "fade-left");
    Set_Logo_Animations(logo, "fade-left", 1125);
    Set_Grid_Animations(mainGrid, "fade-in");

    Switch_Form_Shown(joshuaGrid, mainGrid, layers);
  });

  //******EVENT GRID ******//
  eventsGoBack.addEventListener('click', function () {
    var layers = Start_Layer_Anim("top");

    Set_Grid_Animations(eventsGrid, "fade-down");
    Set_Logo_Animations(logo, "fade-down", 1125);
    Set_Grid_Animations(mainGrid, "fade-in");

    Switch_Form_Shown(eventsGrid, mainGrid, layers);
  });

  //******EVENTS ACTIVITY/EVENT GRID ******//
  eventsActivityGoBack.addEventListener('click', function () {
    var layers = Start_Layer_Anim("right");

    Set_Grid_Animations(eventsActivityGrid, "fade-right");
    Set_Logo_Animations(logo, "fade-right", 1125);
    Set_Grid_Animations(eventsGrid, "fade-in");

    Switch_Form_Shown(eventsActivityGrid, eventsGrid, layers);
  });

  eventsEventGoBack.addEventListener('click', function () {
    var layers = Start_Layer_Anim("left");

    Set_Grid_Animations(eventsEventGrid, "fade-left");
    Set_Logo_Animations(logo, "fade-left", 1125);
    Set_Grid_Animations(eventsGrid, "fade-in");

    Switch_Form_Shown(eventsEventGrid, eventsGrid, layers);
  });

  //******END GO BACK BTNS******//

  activityNameInput.addEventListener('input', function () {
    this.value = this.value.replace(/[0123456789,./\\/-=+/';"\]\[{}/()!@#$%^&*`~_<>?:|/]/g, "");
  });

  function Load_Events() {
    //Load events from db
    get(ref_db(database, "Event Info")).then((snapshot) => {
      //Show the loading icon
      Set_Loading_Active(loading, "hidden");
      //Clear old events first
      while (eventsContainer.firstChild) {
        eventsContainer.removeChild(eventsContainer.lastChild);
      }

      snapshot.forEach((child) => {
        var newEvent = document.createElement("div");
        newEvent.className = "db-events";
        newEvent.setAttribute("id", child.key);
        newEvent.setAttribute("data-cost", child.child("Cost").val());
        newEvent.setAttribute("data-date", child.child("Date").val());
        newEvent.setAttribute("data-image", child.child("Image").val());
        newEvent.setAttribute("data-is-event", child.child("IsEvent").val());
        newEvent.addEventListener("click", Event_Click_Listener);

        var imageDiv = document.createElement("div");
        imageDiv.className = "db-img-holder";
        var eventImage = document.createElement("img");
        getDownloadURL(ref_st(storage, child.child("Image").val()))
          .then((url) => {
            eventImage.setAttribute('src', url);
            eventImage.style = "border-radius:10%; width:100%; height:100%;";
          })
          .catch((error) => {
            // Handle any errors
            alert(error);
          });

        var eventTitle = document.createElement("span");
        eventTitle.innerHTML = child.key;

        imageDiv.appendChild(eventImage);
        newEvent.appendChild(imageDiv);
        newEvent.appendChild(eventTitle);
        eventsContainer.appendChild(newEvent);
      });

      //Hide loading icon
      Set_Loading_Active(loading, "shown");
    });
  }

  const body = document.querySelector("body");
  const modal = document.querySelector(".modal");
  const closeButton = document.querySelector(".close-button");
  const loginButton = document.querySelector(".input-button");
  const adminEmail = document.getElementById("email");
  const adminPassword = document.getElementById("password");
  let isOpened = false;

  const openModal = () => {
    modal.classList.add("is-open");
    body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    body.style.overflow = "initial";
  };

  //modalButton.addEventListener("click", openModal);
  closeButton.addEventListener("click", closeModal);

  logo.addEventListener('click', function () {
    if (!mainGrid.classList.contains("hidden")) {
      openModal();
    }
  });

  loginButton.addEventListener('click', function () {
    signInWithEmailAndPassword(auth, adminEmail.value, adminPassword.value).then((userCredential) => {
      //Signed in
      const user = userCredential.user;
    }).catch((error) => {
      //Login error
      const errorCode = error.code;
      const errorMessage = error.message;
    });
  });

  //FUNCTIONS ----------------------------------------------------
  function Set_Login_Screen(elem, currentState) {
    if (currentState === "hidden") {
      Set_Grid_Animations(elem, "fade-in");
      elem.classList.remove("hidden");
    }
    else {
      Set_Grid_Animations(elem, "fade-out");
      setTimeout(() => {
        elem.classList.add("hidden");
      }, 900);
    }
  }

  function Set_Icon_Style(label, changedClass, addOrRemove) {
    if (addOrRemove == "add") {
      label.children[0].classList.add('selected');
    }
    else {
      label.children[0].classList.remove('selected');
    }
    label.children[0].children[0].classList = changedClass;
  }

  function Show_Forms(curr, prev, other) {
    curr.style = "animation: fade-in .5s ease-in-out forwards;";
    prev.style.display = "none";
  }

  function Start_Layer_Anim(direction) {
    var layers = document.querySelectorAll("." + direction + "-layer");
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

  function Set_Logo_Animations(elem, fadeType, waitTime) {
    Set_Grid_Animations(elem, fadeType);
    setTimeout(() => {
      Set_Grid_Animations(elem, "fade-in");
    }, waitTime);
  }

  function Set_Loading_Active(elem, currentState) {
    if (currentState === "hidden") {
      setTimeout(() => {
        Set_Grid_Animations(elem, "fade-in");
        elem.classList.remove("hidden");
      }, 500);
    }
    else {
      setTimeout(() => {
        Set_Grid_Animations(elem, "fade-out");
        setTimeout(() => {
          elem.classList.add("hidden");
        }, 900)
      }, 4000);
    }
  }

  function Switch_Form_Shown(hide, show, layers) {
    setTimeout(() => {
      hide.className = "hidden";
      show.classList.remove("hidden");
      for (const layer of layers) {
        layer.classList.add("done");
        layer.classList.remove("active");
      }
    }, 1125);
  }

  function Event_Click_Listener() {
    if (this.getAttribute('data-is-event') === "false") {
      eventsActivityImg.setAttribute("src", this.firstChild.firstChild.getAttribute('src'));
      eventsActivityDate.children[1].textContent = this.getAttribute("data-date");
      eventsActivityCost.children[1].textContent = this.getAttribute("data-cost");
      activityNameInput.textContent = null;
      activityChoice.value = "Default";

      var layers = Start_Layer_Anim("left");

      Set_Grid_Animations(eventsGrid, "fade-left");
      Set_Logo_Animations(logo, "fade-left", 1125);
      Set_Grid_Animations(eventsActivityGrid, "fade-in");

      Switch_Form_Shown(eventsGrid, eventsActivityGrid, layers);
    } else {
      eventsEventImg.setAttribute("src", this.firstChild.firstChild.getAttribute('src'));
      eventsEventDate.children[1].textContent = this.getAttribute("data-date");
      eventsEventCost.children[1].textContent = this.getAttribute("data-cost");
      eventNameInput.textContent = null;
      eventEmailInput.textContent = null;
      eventPhoneInput.textContent = null;

      var layers = Start_Layer_Anim("right");

      Set_Grid_Animations(eventsGrid, "fade-right");
      Set_Logo_Animations(logo, "fade-right", 1125);
      Set_Grid_Animations(eventsEventGrid, "fade-in");

      Switch_Form_Shown(eventsGrid, eventsEventGrid, layers);
    }
  }
});