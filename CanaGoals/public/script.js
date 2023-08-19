// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, onValue, set, remove, update, get, increment } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { getAuth, onAuthStateChanged, reauthenticateWithCredential, signInAnonymously, sendEmailVerification, signInWithEmailAndPassword, updateEmail, sendPasswordResetEmail, EmailAuthProvider, linkWithCredential, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDYuTQDXbkmGM73f-mBCghdLeTsXLoS9Q",
  authDomain: "cana-goals.firebaseapp.com",
  projectId: "cana-goals",
  storageBucket: "cana-goals.appspot.com",
  messagingSenderId: "77801609796",
  appId: "1:77801609796:web:da20da804555c984113a11",
  measurementId: "G-54LFB530MD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

window.addEventListener('load', () => {
  //Ensure that the browser supports the service worker API then register it
  var registration = null;
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('service-worker.js').then(reg => {
      registration = reg;
      console.log('Service Worker Registered');
    }).catch(swErr => console.log(`Service Worker Installation Error: ${swErr}}`));
  }

  //Detect users prefered color scheme
  const darkTheme = window.matchMedia("(prefers-color-scheme: dark)");
  document.querySelector("html").setAttribute("data-theme", darkTheme.matches === true ? "dark" : "light");

  //Detect login status and setup tables
  /*onAuthStateChanged(auth, (user) => {
    if (user) {
      // Signed in Anonymously
      if (user?.isAnonymous) {
        
      } else {
        
      }
    } else {
      // Signed out
      
    }
  });*/

  const tableContainer = document.getElementById("tables-container");
  tableContainer.replaceChildren();
  CreateTable("default-table-1", "Edit Name...", 3, 3);
  CreateTable("default-table-2", "Edit Name...", 3, 3);
  CreateTable("default-table-3", "Edit Name...", 3, 3);

  function CreateTable(tableID, userName, col, row) {
    var tableWrap = document.createElement("div"); tableWrap.setAttribute("id", tableID); tableWrap.className = "table-wrapper";

    var h2 = document.createElement("h2"); h2.textContent = userName; h2.contentEditable = true; tableWrap.appendChild(h2);

    var table = document.createElement("table"); table.className = "table-items"; 
    var thead = document.createElement("thead");
    var headTr = document.createElement("tr");   
    for (let i = 0; i < col; i++) {
      var th = document.createElement("th"); th.textContent = "Header " + (i + 1); 
      th.contentEditable = "true"; headTr.appendChild(th); 
    }
    thead.appendChild(headTr); table.appendChild(thead);

    var tbody = document.createElement("tbody");
    for (let i = 0; i < col; i++) {
      var bodyTr = document.createElement("tr");
      for (let j = 0; j < row; j++) {
        var td = document.createElement("td"); td.textContent = "Content " + (i + 1); 
        td.contentEditable = "true"; bodyTr.appendChild(td);
      }
      tbody.appendChild(bodyTr);
    }
    table.appendChild(tbody);

    tableWrap.appendChild(table);
    tableContainer.appendChild(tableWrap);
  }
});