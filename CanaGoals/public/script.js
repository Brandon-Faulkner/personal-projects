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

  //#region TABLE FUNCTIONS
  const tableContainer = document.getElementById("tables-container");
  tableContainer.replaceChildren();
  CreateTable("default-table-1", "Edit Name...", 3, 3, true);
  CreateTable("default-table-2", "Edit Name...", 3, 3, false);
  CreateTable("default-table-3", "Edit Name...", 3, 3, false);

  function CreateTable(tableID, userName, col, row, isUsersTable) {
    var tableWrap = document.createElement("div"); tableWrap.setAttribute("id", tableID); tableWrap.className = "table-wrapper";
    var h2 = document.createElement("h2"); h2.textContent = userName; h2.contentEditable = isUsersTable; tableWrap.appendChild(h2);
    var table = document.createElement("table"); table.className = "table-items"; 
    var thead = document.createElement("thead");
    var headTr = document.createElement("tr");   
    for (let i = 0; i < col; i++) {
      var th = document.createElement("th"); th.textContent = "Header"; 
      th.contentEditable = isUsersTable; headTr.appendChild(th); 
    }
    thead.appendChild(headTr); table.appendChild(thead);

    var tbody = document.createElement("tbody");
    for (let i = 0; i < col; i++) {
      var bodyTr = document.createElement("tr");
      for (let j = 0; j < row; j++) {
        var td = document.createElement("td"); td.textContent = "Content"; 
        td.contentEditable = isUsersTable; bodyTr.appendChild(td);
      }
      tbody.appendChild(bodyTr);
    }
    table.appendChild(tbody);
    tableWrap.appendChild(table);

    if (isUsersTable === true) {
      var tableBtns = document.createElement('div'); tableBtns.setAttribute("id", "table-buttons");
      var saveBtn = document.createElement('button'); saveBtn.classList.add('table-btn'); saveBtn.setAttribute("id", "save-btn");
      var saveIcon = document.createElement('i'); saveIcon.className = "fa-solid fa-cloud-arrow-up"; saveBtn.appendChild(saveIcon);
      var addRowBtn = document.createElement('button'); addRowBtn.classList.add('table-btn'); addRowBtn.setAttribute("id", "addrow-btn");
      var rowIcon = document.createElement('i'); rowIcon.className = "fa-solid fa-plus"; addRowBtn.appendChild(rowIcon);
      var addColBtn = document.createElement('button'); addColBtn.classList.add('table-btn'); addColBtn.setAttribute("id", "addcol-btn");
      var colIcon = document.createElement('i'); colIcon.className = "fa-solid fa-plus"; addColBtn.appendChild(colIcon);
      var deletBtn = document.createElement('button'); deletBtn.classList.add('table-btn'); deletBtn.setAttribute("id", "delete-btn");
      var deleteIcon = document.createElement('i'); deleteIcon.className = "fa-solid fa-trash"; deletBtn.appendChild(deleteIcon);
      tableBtns.append(saveBtn, addRowBtn, addColBtn, deletBtn);
      tableWrap.appendChild(tableBtns);
    }

    tableContainer.appendChild(tableWrap);
  }

  var prevElem = null; var currElem = null;
  document.addEventListener("click", function(e) {
    e.stopPropagation();

    prevElem = currElem;
    currElem = document.activeElement;
    //Add Row
    var addRowBtn = e.target.closest("#addrow-btn");

    if (addRowBtn) {
      var userTable = document.getElementById("default-table-1").children[1];
      var lastRowClone = userTable.children[1].lastChild.cloneNode(true);
      Array.from(lastRowClone.children).forEach((td) => { td.textContent = "Content"; });
      userTable.children[1].appendChild(lastRowClone);
    }

    //Add Column
    var addColBtn = e.target.closest("#addcol-btn");

    if (addColBtn) {
      var userTable = document.getElementById("default-table-1").children[1];
      var headerClone = userTable.children[0].children[0].lastChild.cloneNode(); 
      headerClone.textContent = "Header"; userTable.children[0].children[0].appendChild(headerClone);

      Array.from(userTable.children[1].children).forEach((tr) => {
        var tdClone = tr.lastChild.cloneNode();
        tdClone.textContent = "Content"; tr.appendChild(tdClone);
      });
    }

    //Delete
    var deleteBtn = e.target.closest("#delete-btn");

    if(deleteBtn) {
      console.log(prevElem);
      console.log(currElem);
    }
  });
  //#endregion TABLE FUNCTIONS
});