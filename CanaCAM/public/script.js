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
const groupRef = ref_db(database, "Groups");
const userRef = ref_db(database, "Users");
const storage = getStorage(app);
const auth = getAuth(app);

// Main Elements used before & after login
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
const planningSection = document.getElementById('planning-section');
const overviewSection = document.getElementById('overview-section');
const profileSection = document.getElementById('profile-section');

//#region Authentication Functions
// When the Auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Signed in
    if (user?.isAnonymous) {
      tabPlanning.addEventListener('click', function () {
        loginScreen.classList.add('show');
        mainScreen.classList.add('disable-click');
      });
      loginCloseBtn.addEventListener('click', function () {
        loginScreen.classList.remove('show');
        mainScreen.classList.remove('disable-click');
      })
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
      console.log("Signed in");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode + ": " + errorMessage);
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
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode + ": " + errorMessage);
      return false;
    });
}
//#endregion Authentication Functions

//#region Login Functions
signupToggleBtn.addEventListener('click', function () {
  loginForm.style.marginLeft = "-50%";
  loginText.style.marginLeft = "-50%";
  signupForm.classList.remove("hide");
  signupForm.classList.add("show");
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


}

signupImg.addEventListener('change', function () {
  signupImg.parentElement.setAttribute("data-text", signupImg.value.replace(/.*(\/|\\)/, ''));
})

//#endregion Login Functions

//#region Overview Setup

//#endregion Overview Setup

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

