//#region Initial Setup
// Ensure that the browser supports the service worker API
if (navigator.serviceWorker) {
  // Start registration process on every page load
  window.addEventListener('load', () => {
    navigator.serviceWorker
      // The register function takes as argument
      // the file path to the worker's file
      .register('service-worker.js')
      // Gives us registration object
      .then(reg => console.log('Service Worker Registered'))
      .catch(swErr => console.log(
        `Service Worker Installation Error: ${swErr}}`));
  });
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app.js";
import { getDatabase, ref as ref_db, onValue, child, push, set } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-database.js";
import { getStorage, ref as ref_st, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-storage.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, EmailAuthProvider, linkWithCredential } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNmzs6isOjHTVJq0YM7HGLxBrJ4d22sf8",
  authDomain: "cana-cam.firebaseapp.com",
  databaseURL: "https://cana-cam-default-rtdb.firebaseio.com",
  projectId: "cana-cam",
  storageBucket: "cana-cam.appspot.com",
  messagingSenderId: "587415518534",
  appId: "1:587415518534:web:0a62871e35785219bc3947"
};

// Initialize Firebase, Database and Authentication
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const groupRef = ref_db(database, "Groups/");
const planRef = ref_db(database, "GroupsInfo/");
const userRef = ref_db(database, "Users/");
const storage = getStorage(app);
const auth = getAuth(app);

// Main Elements used before & after login
const loader = document.getElementById('loader');
const loginScreen = document.getElementById('login-page');
const loginCloseBtn = document.getElementById('login-close-btn');
const loginText = document.querySelector(".login-title-text .login");
const loginForm = document.querySelector("form.login");
const loginToggleBtn = document.querySelector("label.login");
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');

const signupForm = document.getElementById('signup-form-content');
const signupToggleBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");
const signupName = document.getElementById('signup-name');
const signupPhone = document.getElementById('signup-phone');
const signupImg = document.getElementById('signup-img');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupConfirmPass = document.getElementById('signup-confirm-pass');
const signupButon = document.getElementById('signup-button');

const mainScreen = document.getElementById('main-page');
const tabPlanning = document.getElementById('tab-planning');
const planningBlocked = document.getElementById('planning-blocked');
const planningIntro = document.getElementById('tab-planning-intro');
const planningImg = document.getElementById('main-image');
const contactBtn = document.getElementById('contact-button');
const planningWeekSelectParent = document.getElementById('plan-week-select-grid');
const hostSelection = document.getElementById('host-selection');
//const planWeekSelection = document.getElementById('plan-week-selection');
const planCurrWeek = document.getElementById('plan-current-week');
const planNextWeek = document.getElementById('plan-next-week');
const planFutureWeek = document.getElementById('plan-future-week');
//const overviewWeekSelection = document.getElementById('over-week-selection');
const overviewCurrWeek = document.getElementById('overview-current-week');
const overviewNextWeek = document.getElementById('overview-next-week');
const overviewFutureWeek = document.getElementById('overview-future-week');
const profileSection = document.getElementById('profile-section');

//Arrays to hold the data of each week
var currWeekArr = [], nextWeekArr = [], futureWeekArr = [];
//Arrays to hold group information
var groupInfoArr = [];

//#region Authentication Functions
// When the Auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Signed in Anonymously
    if (user?.isAnonymous) {
      OverviewSetup(groupRef, true);

      tabPlanning.addEventListener('click', function () {
        loginScreen.classList.add('show');
        mainScreen.classList.add('disable-click');
      });
      loginCloseBtn.addEventListener('click', function () {
        loginScreen.classList.remove('show');
        mainScreen.classList.remove('disable-click');
      });
    }
    //Signed in with Account
    else {
      OverviewSetup(groupRef, false);

    }

  } else {
    // Signed out
    AnonymousSignIn(auth);
  }
});

// Sign user in Anonymously if not already logged in
function AnonymousSignIn(auth) {
  signInAnonymously(auth)
    .then(() => {
      console.log("Signed in Anonymously");
    })
    .catch((error) => {
      console.log(error.code + ": " + error.message);
    });
}

// Upgrade Anonymous to an account
function UpgradeAnonymous(auth, credential) {
  linkWithCredential(auth.currentUser, credential)
    .then((usercred) => {
      const user = usercred.user;
      console.log("Anonymous account successfully upgraded", user);
    }).catch((error) => {
      console.log("Error upgrading anonymous account", error);
    });
}

// Sign user in with Email and Password
function SignInEmailAndPassword(auth, email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      console.log("Signed in with Email: " + user);
    })
    .catch((error) => {
      console.log(error.code + ": " + error.message);
      return false;
    });
}
//#endregion Authentication Functions

//#region Login Functions
signupToggleBtn.addEventListener('click', function () {
  loginForm.style.marginLeft = "-50%";
  loginText.style.marginLeft = "-50%";
  setTimeout(() => {
    signupForm.classList.remove("hide");
    signupForm.classList.add("show");
  }, 250);
});
loginToggleBtn.addEventListener('click', function () {
  loginForm.style.marginLeft = "0%";
  loginText.style.marginLeft = "0%";
  setTimeout(() => {
    signupForm.classList.remove("show");
    signupForm.classList.add("hide");
  }, 250);
});

loginButton.addEventListener('click', function (e) {
  e.preventDefault();
  var email = loginEmail.value;
  var password = loginPassword.value;

  if (SignInEmailAndPassword(auth, email, password)) {
    // Successful sign in
  } else {
    // Unsuccessful sign in
  }
});

signupButon.addEventListener('click', function (e) {
  e.preventDefault();
  var name = signupName.value;
  var phone = signupPhone.value;
  var img = signupImg.value;
  var email = signupEmail.value;
  var password = signupPassword.value;
  var confirmPass = signupConfirmPass.value;

  var isEmailValid = validateEmail(email);
  var isPasswordValid = validatePassword(password, confirmPass);

  //Upgrade annonymous account if data is valid
  if (isEmailValid && isPasswordValid) {
    const credential = EmailAuthProvider.credential(email, password);
    UpgradeAnonymous(auth, credential);
  } else {
    console.log("Sign up data is invalid");
  }

});

signupLink.addEventListener('click', function () {
  signupBtn.click();
  return false;
});

function validateEmail(email) {
  var emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/gm, "gm");

  return emailRegex.test(email);
}

function validatePassword(password, confirmPass) {
  if (password === confirmPass) {

    return true;
  } else {
    return false;
  }
}

signupImg.addEventListener('change', function () {
  signupImg.parentElement.setAttribute("data-text", signupImg.value.replace(/.*(\/|\\)/, ''));
})

//#endregion Login Functions

//#region Overview Setup
function OverviewSetup(groupRef, isAnonymous) {
  onValue(groupRef, (snapshot) => {
    //Clear arrays to not have duplicate data
    currWeekArr = []; nextWeekArr = []; futureWeekArr = [];

    //Show loading indicator
    if (loader.classList.contains('hide')) {
      loader.classList.remove('hide');
    }

    snapshot.forEach((childSnapshot) => {
      //Group Num, Host and Gen location
      const groupKey = childSnapshot.key;
      const hostName = childSnapshot.child("Hosts").val();
      const genLocation = childSnapshot.child("Location").val();

      //Get the Day and times for each week
      childSnapshot.child("Weeks").child("Current Week").forEach((day) => {
        const currWeekDay = { group: groupKey, day: day.key, time: day.val(), host: hostName, location: genLocation };
        currWeekArr.unshift(currWeekDay);
      });
      childSnapshot.child("Weeks").child("Next Week").forEach((day) => {
        const nextWeekDay = { group: groupKey, day: day.key, time: day.val(), host: hostName, location: genLocation };
        nextWeekArr.unshift(nextWeekDay);
      });
      childSnapshot.child("Weeks").child("Future Week").forEach((day) => {
        const futureWeekDay = { group: groupKey, day: day.key, time: day.val(), host: hostName, location: genLocation };
        futureWeekArr.unshift(futureWeekDay);
      });

      //Clear current elements in the lists
      overviewCurrWeek.replaceChildren();
      overviewNextWeek.replaceChildren();
      overviewFutureWeek.replaceChildren();

      //Create unique arrays for each week to determine all unique days
      var uniqCurr = [...new Set(currWeekArr.map(item => item.day))]; DaySorter(uniqCurr, true);
      var uniqNext = [...new Set(nextWeekArr.map(item => item.day))]; DaySorter(uniqNext, true);
      var uniqFuture = [...new Set(futureWeekArr.map(item => item.day))]; DaySorter(uniqFuture, true);

      //Sort the week arrays by day and then time
      DaySorter(currWeekArr); TimeSorter(currWeekArr);
      DaySorter(nextWeekArr); TimeSorter(nextWeekArr);
      DaySorter(futureWeekArr); TimeSorter(futureWeekArr);

      //Create elements for the lists from each array
      uniqCurr.forEach((elem) => {
        CreateOverviewTableHeader(elem, overviewCurrWeek);
        CreateOverviewTableRow(currWeekArr, elem, overviewCurrWeek);
      });
      uniqNext.forEach((elem) => {
        CreateOverviewTableHeader(elem, overviewNextWeek);
        CreateOverviewTableRow(nextWeekArr, elem, overviewNextWeek);
      });
      uniqFuture.forEach((elem) => {
        CreateOverviewTableHeader(elem, overviewFutureWeek);
        CreateOverviewTableRow(futureWeekArr, elem, overviewFutureWeek);
      });
    });

    //Now setup planning tab
    PlanningSetup(planRef, 'Group 1', isAnonymous);

    //Remove loading indicator
    if (!loader.classList.contains('hide')) {
      loader.classList.add('hide');
    }
  });
}

function DaySorter(weekArr, isUniq) {
  const sorter = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7 };
  weekArr.sort(function sortByDay(a, b) {
    var day1, day2;
    if (!isUniq) {
      day1 = a.day; day2 = b.day;
    } else {
      day1 = a; day2 = b;
    }
    return sorter[day1] - sorter[day2];
  });
}

function TimeSorter(weekArr) {
  const getNumber = n => +n.replace(/:/g, '');
  weekArr.sort(function sortByTime(a, b) {
    var time1 = getNumber(a.time); var time2 = getNumber(b.time);
    return time2 - time1;
  })
}

function CreateOverviewTableHeader(day, parentElem) {
  var wrapper = document.createElement('li');
  wrapper.classList.add('overview-days');

  var dayHeader = document.createElement('h2'); dayHeader.textContent = day;
  wrapper.appendChild(dayHeader);
  parentElem.appendChild(wrapper);

  var tableHeader = document.createElement('li');
  tableHeader.classList.add('table-header');
  var headerDiv1 = document.createElement('div'); headerDiv1.className = "col"; headerDiv1.textContent = "Time"; tableHeader.appendChild(headerDiv1);
  var headerDiv2 = document.createElement('div'); headerDiv2.className = "col"; headerDiv2.textContent = "General Location"; tableHeader.appendChild(headerDiv2);
  var headerDiv3 = document.createElement('div'); headerDiv3.className = "col"; headerDiv3.textContent = "Host"; tableHeader.appendChild(headerDiv3);
  parentElem.appendChild(tableHeader);
}

function CreateOverviewTableRow(array, day, parentElem) {
  array.forEach((elem) => {
    if (elem.day === day) {
      var row = document.createElement('li');
      row.className = "table-row clickable-row";

      var col1 = document.createElement('div'); col1.className = "col"; col1.setAttribute('data-label', "Time"); col1.textContent = elem.time; row.appendChild(col1);
      var col2 = document.createElement('div'); col2.className = "col"; col2.setAttribute('data-label', "General Location"); col2.textContent = elem.location; row.appendChild(col2);
      var col3 = document.createElement('div'); col3.className = "col"; col3.setAttribute('data-label', "Host"); col3.textContent = elem.host; row.appendChild(col3);

      parentElem.appendChild(row);
    }
  });
}

document.addEventListener('click', function (e) {
  e.stopPropagation();
  if (e.target.closest('.clickable-row')) {
    tabPlanning.click();
  }
});
//#endregion Overview Setup

//#region Planning Setup
function PlanningSetup(planRef, groupID, isAnonymous) {
  if (isAnonymous) {
    planningBlocked.classList.remove('hide');
    planningIntro.parentElement.classList.add('hide');
    planningWeekSelectParent.classList.add('hide');
    planCurrWeek.replaceChildren();
    planNextWeek.replaceChildren();
    planFutureWeek.replaceChildren();
  } else {
    planningBlocked.classList.add('hide');
    planningIntro.parentElement.classList.remove('hide');
    planningWeekSelectParent.classList.remove('hide');

    onValue(planRef, (snapshot) => {
      //Show loading indicator
      if (loader.classList.contains('hide')) {
        loader.classList.remove('hide');
      }

      //Clear current data in array to avoid dups
      groupInfoArr = [];

      var childSnapshot = snapshot.child(groupID);
      const groupKey = childSnapshot.key;
      const address = childSnapshot.child("Address").val();
      const description = childSnapshot.child("Description").val();
      const email = childSnapshot.child("Email").val();
      var image = childSnapshot.child("Image").val();
      const phone = childSnapshot.child("Phone").val();

      //Get url for image from storage
      getDownloadURL(ref_st(storage, "Groups/" + image))
        .then((url) => {
          image = url;
        })
        .catch((error) => {
          console.log(error.code + error.message);
        });

      //Update group array with the new data
      const data = { group: groupKey, address: address, description: description, email: email, image: image, phone: phone };
      groupInfoArr.unshift(data);

      //Clear the current elements in the lists
      planCurrWeek.replaceChildren();
      planNextWeek.replaceChildren();
      planFutureWeek.replaceChildren();

      //Create elements for the lists from each array
      CreatePlanningTableHeader(planCurrWeek);
      currWeekArr.forEach((elem) => {
        if (elem.group === groupKey) {       
          CreatePlanningTableRow(elem, groupInfoArr, elem.group, planCurrWeek);
        }
      });
      CreatePlanningTableHeader(planNextWeek);
      nextWeekArr.forEach((elem) => {
        if (elem.group === groupKey) {   
          CreatePlanningTableRow(elem, groupInfoArr, elem.group, planNextWeek);
        }
      });
      CreatePlanningTableHeader(planFutureWeek);
      futureWeekArr.forEach((elem) => {
        if (elem.group === groupKey) {        
          CreatePlanningTableRow(elem, groupInfoArr, elem.group, planFutureWeek);
        }
      });

      //Now Update planning intro to first host and week
      UpdatePlanningIntro(currWeekArr, groupInfoArr, groupID, planningIntro);

      //Remove loading indicator
      if (!loader.classList.contains('hide')) {
        loader.classList.add('hide');
      }
    });
  }
}

function UpdatePlanningIntro(weekArr, groupInfoArr, groupID, parentElem) {
  //Show loading indicator
  if (loader.classList.contains('hide')) {
    loader.classList.remove('hide');
  }

  parentElem.children[0].textContent = weekArr.find(w => w.group === groupID).host;
  parentElem.children[1].children[0].textContent = groupInfoArr.find(g => g.group === groupID).description;
  parentElem.children[1].children[1].setAttribute("data-groupID", groupID);

  planningImg.setAttribute('src', 'https://firebasestorage.googleapis.com/v0/b/cana-cam.appspot.com/o/Groups%2Fgroup1.jpg?alt=media&token=437b9dea-5684-46db-b31d-bbbd39a24a3e');

  //Remove loading indicator
  if (!loader.classList.contains('hide')) {
    loader.classList.add('hide');
  }
}

function CreatePlanningTableHeader(parentElem) {
  var tableHeader = document.createElement('li');
  tableHeader.classList.add('table-header');
  var headerDiv1 = document.createElement('div'); headerDiv1.className = "col"; headerDiv1.textContent = "Day/Time"; tableHeader.appendChild(headerDiv1);
  var headerDiv2 = document.createElement('div'); headerDiv2.className = "col"; headerDiv2.textContent = "Address"; tableHeader.appendChild(headerDiv2);
  var headerDiv3 = document.createElement('div'); headerDiv3.className = "col"; headerDiv3.textContent = "Status"; tableHeader.appendChild(headerDiv3);
  var headerDiv4 = document.createElement('div'); headerDiv4.className = "col"; headerDiv4.textContent = "Guests"; tableHeader.appendChild(headerDiv4);
  var headerDiv5 = document.createElement('div'); headerDiv5.className = "col"; headerDiv5.textContent = "Action"; tableHeader.appendChild(headerDiv5);
  parentElem.appendChild(tableHeader);
}

function CreatePlanningTableRow(elem, groupInfoArr, groupID, parentElem) {
  var row = document.createElement('li');
  row.className = "table-row";

  var col1 = document.createElement('div'); col1.className = "col"; col1.setAttribute('data-label', "Day/Time"); col1.textContent = elem.day + "/" + elem.time; row.appendChild(col1);
  var col2 = document.createElement('div'); col2.className = "col"; col2.setAttribute('data-label', "Address"); col2.textContent = groupInfoArr.find(g => g.group === groupID).address; row.appendChild(col2);
  var col3 = document.createElement('div'); col3.className = "col"; col3.setAttribute('data-label', "Status"); col3.textContent = "Not Going"; row.appendChild(col3);

  var col4 = document.createElement('div'); col4.className = "col"; col4.setAttribute('data-label', "Guests");
  var counter = document.createElement('div'); counter.className = "counter";
  var minus = document.createElement('span'); minus.setAttribute("id", "guest-down"); minus.className = "down"; minus.textContent = "-"; counter.appendChild(minus);
  var counterInput = document.createElement('input'); counterInput.setAttribute("id", "counter-input"); counterInput.setAttribute("type", "text"); counterInput.value = 0; counterInput.disabled = true; counter.appendChild(counterInput);
  var plus = document.createElement('span'); plus.setAttribute("id", "guest-up"); plus.className = "up"; plus.textContent = "+"; counter.appendChild(plus);
  col4.appendChild(counter); row.appendChild(col4);

  var col5 = document.createElement('div'); col5.className = "col"; col5.setAttribute('data-label', "Action");
  var rsvp = document.createElement('button'); rsvp.className = "rsvp-button";
  col5.appendChild(rsvp); row.appendChild(col5);

  parentElem.appendChild(row);
}
//#endregion Planning Setup

//#endregion Initial Setup

//#region Week Menu Dropdown
document.querySelectorAll('select[data-menu]').forEach(function (select) {

  let options = select.querySelectorAll('option'),
    menu = document.createElement('div'),
    button = document.createElement('div'),
    list = document.createElement('ul'),
    arrow = document.createElement('em');

  menu.classList.add('select-menu');
  button.classList.add('button');

  options.forEach(function (option) {
    let li = document.createElement('li');
    li.textContent = option.textContent;
    list.appendChild(li);
  });

  menu.style.setProperty('--t', select.selectedIndex * -41 + 'px');
  select.parentNode.insertBefore(menu, select);
  menu.appendChild(select);
  button.appendChild(list);
  menu.appendChild(button);
  button.insertBefore(arrow, list);
  menu.appendChild(list.cloneNode(true));

  // Show the first container from the first option in lists
  showEventContainers(list.childNodes[0].textContent, "planning-container");
  showEventContainers(list.childNodes[0].textContent, "overview-container");
});

document.addEventListener('click', function (e) {

  let menu = e.target.closest('.select-menu');

  if (menu && !menu.classList.contains('open')) {
    menu.classList.add('open');
  }
});

document.addEventListener('click', function (e) {

  let li = e.target.closest('.select-menu > ul > li'),
    menu = li && li.parentNode.parentNode,
    select = menu && menu.querySelector('select'),
    selected = select && select.querySelector('option:checked'),
    index = li && Array.prototype.indexOf.call(li.parentNode.children, li);

  if (li && menu && select && selected && index !== undefined) {
    menu.style.setProperty('--t', index * -41 + 'px');
    selected.removeAttribute('selected');
    var clicked = select.querySelectorAll('option')[index]; clicked.setAttribute('selected', '');
    menu.classList.add(index > Array.prototype.indexOf.call(select.querySelectorAll('option'), selected) ? 'tilt-down' : 'tilt-up');

    // Switch Event Containers based on selection
    showEventContainers(clicked.textContent, "planning-container");
    showEventContainers(clicked.textContent, "overview-container");

    setTimeout(function () {
      menu.classList.remove('open', 'tilt-up', 'tilt-down');
    }, 500);
  }

});

document.addEventListener('click', function (e) {
  e.stopPropagation();
  if (!e.target.closest('.select-menu')) {
    document.querySelectorAll('.select-menu').forEach(function (menu) {
      menu.classList.remove('open');
    });
  }
});

function showEventContainers(clickedWeek, containerName) {
  var eventContainers = document.getElementsByName(containerName);

  switch (clickedWeek) {
    case "Current Week":
      eventContainers[0].style = "display: inline-grid";
      eventContainers[1].style = "display: none";
      eventContainers[2].style = "display: none";
      break;
    case "Next Week":
      eventContainers[0].style = "display: none";
      eventContainers[1].style = "display: inline-grid";
      eventContainers[2].style = "display: none";
      break;
    case "Future Week":
      eventContainers[0].style = "display: none";
      eventContainers[1].style = "display: none";
      eventContainers[2].style = "display: inline-grid";
      break;
    default:
      eventContainers[0].style = "display: inline-grid";
      eventContainers[1].style = "display: none";
      eventContainers[2].style = "display: none";
      break;
  }
}
//#endregion

//#region Guest & RSVP Button
document.addEventListener('DOMContentLoaded', function () {
  var rsvpButtons = document.getElementsByClassName('rsvp-button');
  var guestDown = document.getElementById("guest-down");
  var guestUp = document.getElementById("guest-up");


  Array.from(rsvpButtons).forEach(function (button) {
    button.addEventListener('click', function () {
      button.classList.add('rsvp-onClick');
      setTimeout(validate(button), 250);
    });
  })

  function validate(button) {
    setTimeout(function () {
      button.classList.remove('rsvp-onClick');
      button.classList.add('rsvp-validate');
      setTimeout(callback(button), 450);
    }, 2250);
  }

  function callback(button) {
    setTimeout(function () {
      button.classList.remove('rsvp-validate');
    }, 2250);
  }

  guestUp.addEventListener('click', function () {
    var input = this.previousElementSibling;
    var value = parseInt(input.value, 10);
    value = isNaN(value) ? 0 : value;
    value++;
    input.value = value;
  });

  guestDown.addEventListener('click', function () {
    var input = this.nextElementSibling;
    var value = parseInt(input.value, 10);
    if (value >= 1) {
      value = isNaN(value) ? 0 : value;
      value--;
      input.value = value;
    }
  });
});
//#endregion Guest & RSVP Button

