// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, onValue, set, remove, update, get, increment } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, EmailAuthProvider, linkWithCredential, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

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

  //#region VARIABLES
  const mainScreen = document.getElementById('main-page');
  const tableContainer = document.getElementById("tables-container");

  const loginSignOutBtn = document.getElementById('header-login-btn');
  const loginScreen = document.getElementById('login-page');
  const loginCloseBtn = document.getElementById('login-close-btn');
  const loginText = document.querySelector(".login-title-text .login");
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const loginButton = document.getElementById('login-button');
  const loginPeek = loginPassword.parentElement.children[1];

  const toastElem = document.querySelector('.toast');
  const toastMessage = document.querySelector('.toast-message');
  const toastProgress = document.querySelector('.toast-progress');
  const toastClose = document.querySelector('.toast .close');

  var toastTimeout, progressTimeout;
  function ShowNotifToast(title, message, statusColor, isTimed, seconds) {
    //Check if toast is active, wait if it is
    if (toastElem.classList.contains('active')) {
      setTimeout(() => {
        ShowNotifToast(title, message, statusColor, isTimed, seconds);
      }, 1000);
    } else {
      //Change --toast-status css var to statusColor
      toastElem.style.setProperty('--toast-status', statusColor);

      //Update toast title
      toastMessage.children[0].textContent = title;
      toastMessage.children[1].textContent = message;

      //Now show the toast
      toastElem.classList.add('active');

      //Show the progress bar if isTimed is true
      if (isTimed === true) {
        toastProgress.style.setProperty('--toast-duration', seconds + 's');
        toastProgress.classList.add('active');

        toastTimeout = setTimeout(() => {
          toastElem.classList.remove('active');
        }, (seconds * 1000) + 200);

        progressTimeout = setTimeout(() => {
          toastProgress.classList.remove('active');
        }, (seconds * 1000) + 500);
      }
    }
  }

  toastClose.addEventListener('click', function () {
    //First clear timers then remove 'active' classes
    clearTimeout(toastTimeout);
    clearTimeout(progressTimeout);
    toastProgress.classList.remove('active');
    toastElem.classList.remove('active');
  });

  var usersTablesArr = []; var headersArr = []; var contentArr = [];
  //#endregion VARIABLES

  //#region LOGIN FUNCTIONS
  //Detect login status and setup tables
  onAuthStateChanged(auth, (user) => {
    if (user === null) {
      // No one is signed in
      tableContainer.replaceChildren();
      loginSignOutBtn.className = "header-login-btn";
      CreateTable("default-table-1", "Default Name", null, 3, 3, false);
    } else if (user.isAnonymous === false) {
      // User is signed in
      ListenForUsersTables();
      loginSignOutBtn.className = "header-signout-btn";
    }
  });

  loginSignOutBtn.addEventListener('click', function () {
    if (loginSignOutBtn.classList.contains('header-login-btn')) {
      loginScreen.classList.add('show');
      mainScreen.classList.add('disable-click');
    } else if (loginSignOutBtn.classList.contains('header-signout-btn')) {
      SignOutUser(auth);
    }
  });

  loginCloseBtn.addEventListener('click', function () {
    loginScreen.classList.remove('show');
    mainScreen.classList.remove('disable-click');
    ClearLoginInputs();
  });

  loginButton.addEventListener('click', function (e) {
    e.preventDefault();
    loginText.classList.remove('login-error');
    loginEmail.classList.remove('login-error');
    loginPassword.classList.remove('login-error');
    loginButton.parentElement.classList.add('login-click');
    SignInEmailAndPassword(auth, loginEmail.value, loginPassword.value);
  });

  loginPeek.addEventListener('click', function () {
    if (loginPeek.classList.contains('fa-eye')) {
      loginPeek.className = "fa-solid fa-eye-slash eye-icon";
      loginPassword.setAttribute('type', 'text');
    } else {
      loginPeek.className = "fa-solid fa-eye eye-icon";
      loginPassword.setAttribute('type', 'password');
    }
  });

  function SignInEmailAndPassword(auth, email, password) {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        loginText.textContent = "Welcome Back!";
        loginButton.parentElement.classList.remove('login-click');
        loginSignOutBtn.className = "header-signout-btn";
        loginCloseBtn.click();
      })
      .catch((error) => {
        // Unsuccessful Sign In
        loginText.textContent = "Log In Failed";
        loginText.classList.add('login-error');

        switch (error.code) {
          case 'auth/invalid-email':
            loginEmail.classList.add('login-error');
            break;
          case 'auth/wrong-password':
            loginPassword.classList.add('login-error');
            break;
          default:
            loginEmail.classList.add('login-error');
            loginPassword.classList.add('login-error');
            break;
        }

        loginButton.parentElement.classList.remove('login-click');
      });
  }

  function SignOutUser(auth) {
    signOut(auth).then(() => {
      loginCloseBtn.click();
      loginSignOutBtn.className = "header-login-btn";
    }).catch((error) => {
      console.log(error.code + ": " + error.message);
      ShowNotifToast("Sign Out Error", "There was an issue with signing you out. Please try again.", "var(--red)", true, 8);
    });
  }

  function ClearLoginInputs() {
    loginEmail.value = null;
    loginPassword.value = null;
    loginText.textContent = "Welcome Back!";
    loginText.classList.remove('login-error');
    loginEmail.classList.remove('login-error');
    loginPassword.classList.remove('login-error');
  }
  //#endregion LOGIN FUNCTIONS

  //#region TABLE FUNCTIONS
  function ListenForUsersTables() {
    onValue(ref(database, 'Tables/'), (snapshot) => {
      tableContainer.replaceChildren();

      if (snapshot.exists()) {
        // Clear the arrays first so no dups
        usersTablesArr = [];

        //Get data for each table based on user
        snapshot.forEach((uid) => {
          headersArr = []; contentArr = [];
          const isThisUser = uid.key === auth.currentUser.uid;
          const usersName = uid.child('Name').val();

          uid.child('Headers').forEach((header) => {
            const headerData = { user: usersName, header: header.val() };
            headersArr.push(headerData);
          });

          var index = 0;
          uid.child('Content').forEach((rows) => {
            rows.forEach((row) => {
              const rowData = { user: usersName, rowNum: index, row: row.val() }
              contentArr.push(rowData);
            });
            index++;
          });

          const tableData = { user: usersName, isMainUser: isThisUser, headers: headersArr, content: contentArr, cols: headersArr.length, rows: index };
          usersTablesArr.push(tableData);
        });

        //Create main user table first, then other users
        const userTable = usersTablesArr.filter(u => u.isMainUser === true);

        if (userTable !== null) {
          CreateTable("user-table", userTable[0].user, userTable[0], userTable[0].cols, userTable[0].rows, true);
        } else {
          //Create default user table since they dont have one yet
          CreateTable("user-table", "Enter Name...", null, 3, 3, true);
        }
        
        //Other users tables
        usersTablesArr.forEach((table) => {
          if (table.isMainUser != true) {
            CreateTable(table.usersName + "-table", table.user, table, table.cols, table.rows, false);
          }
        });
      } else {
        // No tables in DB, create default one for user
        CreateTable("user-table", "Enter Name...", null, 3, 3, true);
      }
    }, error => {
      console.log(error.code + ": " + error.message);
    });
  }

  function CreateTable(tableID, userName, tableArr, col, row, isUsersTable) {
    var tableWrap = document.createElement("div"); tableWrap.setAttribute("id", tableID); tableWrap.className = "table-wrapper";
    var h2 = document.createElement("h2"); h2.textContent = userName; h2.contentEditable = isUsersTable === true ? "plaintext-only" : false; 
    isUsersTable === true ? h2.className = "editable" : null; isUsersTable === true ? h2.setAttribute('placeholder', "Enter Name..."): null; tableWrap.appendChild(h2);
    var table = document.createElement("table"); table.className = "table-items";

    var thead = document.createElement("thead");
    var headTr = document.createElement("tr");
    for (let i = 0; i < col; i++) {
      var th = document.createElement("th");
      th.textContent = tableArr === null ? "Title" : tableArr.headers[i].header;
      th.contentEditable = isUsersTable === true ? "plaintext-only" : false; 
      isUsersTable === true ? th.className = "editable" : null; 
      isUsersTable === true ? th.setAttribute('placeholder', "Title..."): null; headTr.appendChild(th);
    }
    thead.appendChild(headTr); table.appendChild(thead);

    var tbody = document.createElement("tbody");
    for (let i = 0; i < col; i++) {
      var bodyTr = document.createElement("tr");
      var rowData = [];
      if (tableArr != null) {
        tableArr.content.forEach((row) => {
          if (row.rowNum === i) {
            rowData.push(row);
          }
        });
      }
      for (let j = 0; j < row; j++) {
        var td = document.createElement("td");
        td.textContent = tableArr === null ? "Content" : rowData[j].row;
        td.contentEditable = isUsersTable === true ? "plaintext-only" : false; 
        isUsersTable === true ? td.className = "editable" : null; 
        isUsersTable === true ? td.setAttribute('placeholder', "Content..."): null; bodyTr.appendChild(td);
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
      tableBtns.append(saveBtn, addRowBtn, addColBtn, deletBtn);
      tableWrap.appendChild(tableBtns);
    }

    tableContainer.appendChild(tableWrap);
  }

  document.addEventListener("click", function (e) {
    e.stopPropagation();

    //Save Table
    var saveBtn = e.target.closest("#save-btn");

    if (saveBtn) {
      saveBtn.classList.add('button-onClick');
    }

    //Add Row
    var addRowBtn = e.target.closest("#addrow-btn");

    if (addRowBtn) {
      document.getElementById("delete-btn").classList.remove('disabled-btn');
      var userTable = document.getElementById("user-table").children[1];
      var lastRowClone = userTable.children[1].lastChild.cloneNode(true);
      Array.from(lastRowClone.children).forEach((td) => { td.textContent = null; td.className = "editable"; td.setAttribute('placeholder', "Content..."); });
      userTable.children[1].appendChild(lastRowClone);
    }

    //Add Column
    var addColBtn = e.target.closest("#addcol-btn");

    if (addColBtn) {
      document.getElementById("delete-btn").classList.remove('disabled-btn');
      var userTable = document.getElementById("user-table").children[1];
      var headerClone = userTable.children[0].children[0].lastChild.cloneNode();
      headerClone.textContent = null; headerClone.setAttribute('placeholder', "Title...");
      userTable.children[0].children[0].appendChild(headerClone);

      Array.from(userTable.children[1].children).forEach((tr) => {
        var tdClone = tr.lastChild.cloneNode();
        tdClone.textContent = null; tdClone.setAttribute('placeholder', "Content...");
        tr.appendChild(tdClone);
      });
    }

    //Delete
    var deleteBtn = e.target.closest("#delete-btn");

    if (deleteBtn) {
      AddRemoveDeleteIcons(deleteBtn, true);
    }

    //Done deleting
    var doneBtn = e.target.closest("#done-btn");

    if (doneBtn) {
      AddRemoveDeleteIcons(doneBtn, false);
    }

    //Trash btns
    var trashBtn = e.target.closest(".delete-td");

    if (trashBtn) {
      RemoveRowOrCol(trashBtn);
    }
  });

  function AddRemoveDeleteIcons(deleteBtn, isAdd) {
    var userTable = document.getElementById("user-table").children[1];
    var thead = userTable.children[0]; var tbody = userTable.children[1];
    var saveBtn = document.getElementById('save-btn');
    var addRowBtn = document.getElementById('addrow-btn');
    var addColBtn = document.getElementById('addcol-btn');
    deleteBtn.classList.remove('disabled-btn');

    if (isAdd === true) {
      var headValid = true; var bodyValid = true;

      if (tbody.children.length > 1) {
        //Add icons after each row
        Array.from(tbody.children).forEach((tr) => {
          if (tr !== tbody.children[0]) {
            var deleteTd = document.createElement('td'); deleteTd.classList.add('delete-td');
            deleteTd.setAttribute("id", 'row'); tr.appendChild(deleteTd);
          } else {
            var emptyTd = document.createElement('td'); emptyTd.classList.add('empty-td');
            tr.appendChild(emptyTd);
          }
        });
      } else { bodyValid = false; }

      if (thead.children[0].children.length > 1) {
        //Get current number of headers/columns
        var headCount = thead.children[0].children.length;

        //Add row of icons for the columns
        var tr = document.createElement('tr'); tr.setAttribute("id", "delete-cols");
        for (let index = 0; index <= headCount; index++) {
          if (index === 0) {
            var emptyTd = document.createElement('td'); emptyTd.classList.add('empty-td');
            tr.appendChild(emptyTd);
          } else if (index === headCount) {
            if (bodyValid === true) {
              var emptyTd = document.createElement('td'); emptyTd.classList.add('empty-td');
              tr.appendChild(emptyTd);
            }
          } else {
            var deleteTd = document.createElement('td'); deleteTd.classList.add('delete-td');
            deleteTd.setAttribute("id", 'col'); tr.appendChild(deleteTd);
          }
        }
        tbody.appendChild(tr);
      } else { headValid = false; }

      if (headValid === true || bodyValid === true) {
        setTimeout(() => {
          //Disable all other buttons
          saveBtn.classList.add('disabled-btn');
          addRowBtn.classList.add('disabled-btn');
          addColBtn.classList.add('disabled-btn');
          deleteBtn.setAttribute("id", "done-btn");
        }, 1);
      }
    } else {
      //Enable all other buttons
      saveBtn.classList.remove('disabled-btn');
      addRowBtn.classList.remove('disabled-btn');
      addColBtn.classList.remove('disabled-btn');
      deleteBtn.setAttribute("id", "delete-btn");

      //Remove all trash icons and empty td's
      document.querySelectorAll('.delete-td').forEach(td => td.remove());
      document.querySelectorAll('.empty-td').forEach(td => td.remove());
      if (document.getElementById("delete-cols")) {
        tbody.lastChild.remove();
      }

      //Check if delete btn needs to be disabled
      if (tbody.children.length === 1 && tbody.children[0].children.length === 1 && thead.children[0].children.length === 1) {
        deleteBtn.classList.add('disabled-btn');
      }
    }

  }

  function RemoveRowOrCol(trashBtn) {
    var trashID = trashBtn.getAttribute("id");

    if (trashID === "row") {
      trashBtn.parentElement.remove();
    } else {
      var colNum = Array.from(trashBtn.parentElement.children).indexOf(trashBtn);

      var userTable = document.getElementById("user-table").children[1];
      var thead = userTable.children[0];
      var tbody = userTable.children[1];

      //Remove Header
      thead.children[0].children[colNum].remove();

      //Remove each cell from rows in the col
      Array.from(tbody.children).forEach((tr) => {
        tr.children[colNum].remove();
      });

      //Finish up by removing trashBtn
      trashBtn.remove();
    }
  }
  //#endregion TABLE FUNCTIONS
});