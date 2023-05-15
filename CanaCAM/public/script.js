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
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
import { getDatabase, ref, onValue, child, push, set } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-database.js";

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

// Initialize Firebase and Database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


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

  // Show the first container from the first option in list
  showEventContainers(list.childNodes[0].textContent);
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
    showEventContainers(clicked.textContent);

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

function showEventContainers(clickedWeek) {
  var eventContainers = document.getElementsByClassName('event-container');

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

document.addEventListener('DOMContentLoaded', function () {
  var rsvpButtons = document.getElementsByName('rsvp-button');

  rsvpButtons.forEach(function (button) {
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
});

