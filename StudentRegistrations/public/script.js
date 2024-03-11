//GO HERE FOR PAGE TRANSITIONS
//https://codepen.io/mburakerman/pen/roJmaZ

//GO HERE FOR OLD ICONS
//https://fontawesome.com/v4/icons/

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app.js";
import { getDatabase, ref as ref_db, get, child, push } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-database.js";
import { getStorage, ref as ref_st, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-storage.js";

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

window.addEventListener('load', () => {
  //#region VARIABLES
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
  var selectedActivity;

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

  //Input box validation 
  var emailGood = { value: false }, eventNameGood = { value: false }, activityNameGood = { value: false }, phoneGood = { value: false };
  
  //#endregion VARIABLES

  //#region MAIN GRID
  var previousForm = null;
  var currentForm = baptismForm;

  baptismLabel.addEventListener('click', function () {
    previousForm = currentForm;
    currentForm = baptismForm;
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
  //#endregion MAIN GRID

  //#region BUTTONS
  baptismGoBack.addEventListener('click', function () {
    var layers = Start_Layer_Anim("right");

    Set_Grid_Animations(baptismGrid, "fade-right");
    Set_Logo_Animations(logo, "fade-right", 1125);
    Set_Grid_Animations(mainGrid, "fade-in");

    Switch_Form_Shown(baptismGrid, mainGrid, layers);
  });

  joshuaGoBack.addEventListener('click', function () {
    var layers = Start_Layer_Anim("left");

    Set_Grid_Animations(joshuaGrid, "fade-left");
    Set_Logo_Animations(logo, "fade-left", 1125);
    Set_Grid_Animations(mainGrid, "fade-in");

    Switch_Form_Shown(joshuaGrid, mainGrid, layers);
  });


  eventsGoBack.addEventListener('click', function () {
    var layers = Start_Layer_Anim("top");

    Set_Grid_Animations(eventsGrid, "fade-down");
    Set_Logo_Animations(logo, "fade-down", 1125);
    Set_Grid_Animations(mainGrid, "fade-in");

    Switch_Form_Shown(eventsGrid, mainGrid, layers);
  });


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

  eventsEventSubmit.addEventListener('click', function () {
    if (emailGood.value == true && phoneGood.value == true && eventNameGood.value == true) {
      //Send text and email
      openSubmitModal("Submission Successful", "We have just notified the parent you provided information for! Now all you have to do is sit back and relax while they do the rest!");
    } else {
      //Show error popup
      openSubmitModal("Error With Submission", "Please make sure to check that all three inputs are green. If there are any that are red, make sure you fix those and try again.");
    }
  });

  eventsActivitySubmit.addEventListener('click', function () {
    if (activityNameGood.value == true && activityChoice.value != "Default") {
      //Save to database
      if (activityChoice.value === "Yes") {
        push(child(ref_db(database), 'Event Info/' + selectedActivity + "/Will Go/"), activityNameInput.value);
      } else {
        push(child(ref_db(database), 'Event Info/' + selectedActivity + "/Won't Go/"), activityNameInput.value);
      }
      openSubmitModal("Submission Successful", "Thank you for letting us know whether you will be at this activity or not! We have recorded your response and we look forward to seeing you there if you will be there!");
    } else {
      //Show error popup
      openSubmitModal("Error With Submission", "Please make sure that you have entered your name correctly and that you have selected whether or not you will be there.");
    }
  });

  //#endregion BUTTONS

  //#region EVENTS/ACTIVITIES
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
            // Show any errors
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
  const submitModal = document.getElementById("submitModal");
  const submitTitle = document.getElementById("submitTitle");
  const submitDesc = document.getElementById("submitDesc");
  const submitCloseButton = document.getElementById("submitCloseButton");

  const openSubmitModal = (title, desc) => {
    submitTitle.textContent = title;
    submitDesc.textContent = desc;
    submitModal.classList.add("is-open");
    body.style.overflow = "hidden";
  }

  const closeSubmitModal = () => {
    submitModal.classList.remove("is-open");
    body.style.overflow = "initial";
  };

  submitCloseButton.addEventListener("click", closeSubmitModal);
  //#endregion EVENTS/ACTIVITIES

//#region HELPER FUNCTIONS
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

  function Show_Forms(curr, prev) {
    curr.style = "animation: fade-in .5s ease-in-out forwards;";
    prev.style = "display: none;";
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
      }, 3000);
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
      selectedActivity = this.getAttribute("id");
      eventsActivityImg.setAttribute("src", this.firstChild.firstChild.getAttribute('src'));
      eventsActivityDate.children[1].textContent = this.getAttribute("data-date");
      eventsActivityCost.children[1].textContent = this.getAttribute("data-cost");
      Clear_Input(activityChoice, activityNameInput, null, null);

      var layers = Start_Layer_Anim("left");

      Set_Grid_Animations(eventsGrid, "fade-left");
      Set_Logo_Animations(logo, "fade-left", 1125);
      Set_Grid_Animations(eventsActivityGrid, "fade-in");

      Switch_Form_Shown(eventsGrid, eventsActivityGrid, layers);
    } else {
      eventsEventImg.setAttribute("src", this.firstChild.firstChild.getAttribute('src'));
      eventsEventDate.children[1].textContent = this.getAttribute("data-date");
      eventsEventCost.children[1].textContent = this.getAttribute("data-cost");
      Clear_Input(null, eventNameInput, eventEmailInput, eventPhoneInput);

      var layers = Start_Layer_Anim("right");

      Set_Grid_Animations(eventsGrid, "fade-right");
      Set_Logo_Animations(logo, "fade-right", 1125);
      Set_Grid_Animations(eventsEventGrid, "fade-in");

      Switch_Form_Shown(eventsGrid, eventsEventGrid, layers);
    }
  }

  function Clear_Input(selection,text1,text2,text3) {
    if(selection != null) {
      selection.value = "Default";
    }
    if (text1 != null) {
      text1.value = "";
      text1.classList.remove("valid");
      text1.classList.remove("invalid");
    }
    if (text2 != null) {
      text2.value = "";
      text2.classList.remove("valid");
      text2.classList.remove("invalid");
    }
    if (text3 != null) {
      text3.value = "";
      text3.classList.remove("valid");
      text3.classList.remove("invalid");
    }
  }

  //Used for phone, name, and email
  function setInputFilter(textbox, inputFilter, isValid,) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop", "focusout"].forEach(function (event) {
      textbox.addEventListener(event, function (e) {
        if (this.value.match(inputFilter)) {
          isValid.value = true;
          textbox.classList.add("valid");
          textbox.classList.remove("invalid");
        }
        else if (textbox.value == "") {
          isValid.value = false;
          textbox.classList.remove("valid");
          textbox.classList.remove("invalid");
        }
        else {
          isValid.value = false;
          textbox.classList.remove("valid");
          textbox.classList.add("invalid");
        }
      });
    });
  }

  setInputFilter(eventPhoneInput, /^[0-9]{10}$/, phoneGood);
  setInputFilter(eventNameInput, /^[a-zA-Z]+ [a-zA-Z]+$/, eventNameGood);
  setInputFilter(activityNameInput, /^[a-zA-Z]+ [a-zA-Z]+$/, activityNameGood);
  setInputFilter(eventEmailInput, /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, emailGood);
  
  //#endregion HELPER FUNCTIONS
});