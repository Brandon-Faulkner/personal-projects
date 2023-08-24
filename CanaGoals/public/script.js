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
      //Disable Login/Sign out btn for convenience
      loginSignOutBtn.classList.add('disabled-btn');

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
          loginSignOutBtn.classList.remove('disabled-btn');
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
    loginSignOutBtn.classList.remove('disabled-btn');
  });

  var usersTablesArr = []; var headersArr = [];
  var contentArr = []; var bbArr = []; var isFirstLoad = true;
  //#endregion VARIABLES

  //#region LOGIN FUNCTIONS
  //Detect login status and setup tables
  onAuthStateChanged(auth, (user) => {
    if (user === null) {
      // No one is signed in
      isFirstLoad = true;
      tableContainer.replaceChildren();
      loginSignOutBtn.className = "header-login-btn";
      CreateTable("default-table", "Default Name", null, 3, 3, false);
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

      if (isFirstLoad === true) {
        tableContainer.replaceChildren();
      } else {
        Array.from(tableContainer.children).forEach((table) => {
          if (table.getAttribute('id') !== auth.currentUser.uid + '-table') {
            table.remove();
          }
        });
      }

      if (snapshot.exists()) {
        // Clear the arrays first so no dups
        usersTablesArr = [];

        //Get data for each table based on user
        snapshot.forEach((uid) => {
          headersArr = []; contentArr = []; bbArr = [];
          const isThisUser = uid.key === auth.currentUser.uid;
          const usersName = uid.child('Name').val();

          uid.child('Headers').forEach((header) => {
            const headerData = { user: usersName, header: header.val() };
            headersArr.push(headerData);
          });

          var index = 0;
          uid.child('Content').forEach((rows) => {
            rows.forEach((row) => {
              if (row.key !== "BB") {
                const rowData = { user: usersName, rowNum: index, row: row.val() };
                contentArr.push(rowData);
              } else {
                var bbRowIndex = 0; var bbIndex = 0;
                row.forEach((bb) => {
                  //Building blocks         
                  bb.forEach((con) => {
                    const bbData = { user: usersName, id: parseInt(rows.key), rowNum: bbRowIndex, bbNum: bbIndex, row: con.val() };
                    bbArr.push(bbData);
                    bbIndex++;
                  });
                  bbRowIndex++;
                });
              }
            });
            index++;
          });

          const tableData = { user: usersName, uid: uid.key, isMainUser: isThisUser, headers: headersArr, content: contentArr, buildingBlocks: bbArr, cols: headersArr.length, rows: index };
          usersTablesArr.push(tableData);
        });

        if (isFirstLoad === true) {
          //Create main user table first, then other users
          const userTable = usersTablesArr.filter(u => u.isMainUser === true);
          if (userTable.length > 0) {
            CreateTable(userTable[0].uid + "-table", userTable[0].user, userTable[0], userTable[0].cols, userTable[0].rows, true);
          } else {
            //Create default user table since they dont have one yet
            CreateTable(auth.currentUser.uid + "-table", null, null, 3, 3, true);
          }
        }

        //Other users tables
        usersTablesArr.forEach((table) => {
          if (table.isMainUser != true) {
            CreateTable(table.uid + "-table", table.user, table, table.cols, table.rows, true);
          }
        });
      } else {
        // No tables in DB, create default one for user
        CreateTable(auth.currentUser.uid + "-table", null, null, 3, 3, true);
      }

      isFirstLoad = false;
    }, error => {
      console.log(error.code + ": " + error.message);
    });
  }

  function CreateTable(tableID, userName, tableArr, col, row, isUsersTable) {
    var tableWrap = document.createElement("div"); tableWrap.setAttribute("id", tableID); tableWrap.className = "table-wrapper";
    var h2 = document.createElement("h2"); h2.textContent = userName; h2.contentEditable = isUsersTable === true ? "plaintext-only" : false;
    isUsersTable === true ? h2.className = "editable" : null; isUsersTable === true ? h2.setAttribute('placeholder', "Enter Name...") : null; tableWrap.appendChild(h2);
    var table = document.createElement("table"); table.className = "table-items";

    var thead = document.createElement("thead");
    var headTr = document.createElement("tr");
    for (let i = 0; i < col; i++) {
      if (i === 0) {
        var thEmpty = document.createElement('th');
        thEmpty.classList.add('empty-th'); headTr.appendChild(thEmpty);
      }
      var th = document.createElement("th");
      th.textContent = tableArr === null ? null : tableArr.headers[i].header;
      th.setAttribute('placeholder', "Title..."); headTr.appendChild(th);
    }
    thead.appendChild(headTr); table.appendChild(thead);

    var tbody = document.createElement("tbody");
    for (let i = 0; i < row; i++) {
      var bodyTr = document.createElement("tr");
      bodyTr.className = "view";

      //Create View Row, aka the goal row
      var rowData = tableArr.content.filter(c => c.rowNum === i);
      if (rowData.length > 0) {
        for (let k = 0; k < rowData.length; k++) {
          if (k === 0) {
            var tdDrop = document.createElement('td');
            tdDrop.classList.add('view-td');
            var arrow = document.createElement('i');
            arrow.className = "fa-solid fa-caret-down"; tdDrop.appendChild(arrow);
            bodyTr.appendChild(tdDrop);
          }
          var td = document.createElement("td");
          td.textContent = tableArr === null ? null : rowData[k].row;
          td.contentEditable = isUsersTable === true ? "plaintext-only" : false;
          isUsersTable === true ? td.className = "editable" : null;
          isUsersTable === true ? td.setAttribute('placeholder', "Content...") : null; bodyTr.appendChild(td);
        }
      }

      tbody.appendChild(bodyTr);

      //Create Fold Row, aka building blocks row
      var foldTr = document.createElement("tr"); foldTr.className = "fold";
      var foldTd = document.createElement('td'); foldTd.setAttribute('colspan', 4);
      foldTd.classList.add('fold-main-td'); foldTr.appendChild(foldTd);

      var foldDiv = document.createElement('div'); foldDiv.className = "fold-div"; foldTd.appendChild(foldDiv);
      var foldTable = document.createElement('table'); foldDiv.appendChild(foldTable);
      var foldHead = document.createElement('thead'); foldTable.appendChild(foldHead);
      var foldBody = document.createElement('tbody'); foldTable.appendChild(foldBody);

      //Fold cols
      var foldHTr = document.createElement('tr'); foldHead.appendChild(foldHTr);
      for (let l = 0; l < col; l++) {
        var th = document.createElement("th");
        th.textContent = tableArr === null ? null : l === 0 ? "Building Blocks" : tableArr.headers[l].header;
        th.setAttribute('placeholder', "Title..."); foldHTr.appendChild(th);
      }

      //Fold Rows
      var rowData = tableArr.buildingBlocks.filter(b => b.id === i);
      if (rowData.length > 0) {
        var foldBTr = document.createElement('tr'); foldBody.appendChild(foldBTr);
        var counter = 0;
        for (let j = 0; j < rowData.length; j++) {
          if (counter === 3) {
            var foldBTr = document.createElement('tr'); foldBody.appendChild(foldBTr);
            counter = 0;
          }
          if (rowData[j].bbNum === j) {
            var td = document.createElement("td");
            td.textContent = tableArr === null ? null : rowData[j].row;
            td.contentEditable = isUsersTable === true ? "plaintext-only" : false;
            isUsersTable === true ? td.className = "editable" : null;
            isUsersTable === true ? td.setAttribute('placeholder', "Content...") : null; foldBTr.appendChild(td);
            counter++;
          }
        }
      }
      tbody.appendChild(foldTr);
    }
    
    table.appendChild(tbody);
    tableWrap.appendChild(table);

    if (isUsersTable === true) {
      var tableBtns = document.createElement('div'); tableBtns.setAttribute("id", "table-buttons");
      var saveBtn = document.createElement('button'); saveBtn.classList.add('table-btn'); saveBtn.setAttribute("id", "save-btn");
      var saveIcon = document.createElement('i'); saveIcon.className = "fa-solid fa-cloud-arrow-up"; saveBtn.appendChild(saveIcon);
      var addRowBtn = document.createElement('button'); addRowBtn.classList.add('table-btn'); addRowBtn.setAttribute("id", "addrow-btn");
      var rowIcon = document.createElement('i'); rowIcon.className = "fa-solid fa-plus"; addRowBtn.appendChild(rowIcon);
      var deletBtn = document.createElement('button'); deletBtn.classList.add('table-btn'); deletBtn.setAttribute("id", "delete-btn");
      tableBtns.append(saveBtn, addRowBtn, deletBtn);
      tableWrap.appendChild(tableBtns);
    }

    tableContainer.appendChild(tableWrap);
  }

  document.addEventListener("click", function (e) {
    e.stopPropagation();

    //Fold/Unfold table
    var foldBtn = e.target.closest(".view-td");

    if (foldBtn) {
      var foldRow = foldBtn.parentElement.nextElementSibling;
      if (foldBtn.children[0].classList.contains("fa-caret-down")) {
        foldRow.className = "fold-open";
        foldBtn.children[0].className = "fa-solid fa-caret-up";
      } else {
        foldRow.className = "fold";
        foldBtn.children[0].className = "fa-solid fa-caret-down";
      }
    }

    //Save Table
    var saveBtn = e.target.closest("#save-btn");

    if (saveBtn) {
      saveBtn.classList.add('button-onClick');
      var userTable = saveBtn.parentElement.parentElement;
      SaveTableToDB(userTable, saveBtn);
    }

    //Add Row
    var addRowBtn = e.target.closest("#addrow-btn");

    if (addRowBtn) {
      addRowBtn.nextElementSibling.classList.remove('disabled-btn');
      var userTable = addRowBtn.parentElement.parentElement;
      var firstRowClone = userTable.children[1].children[1].firstChild.cloneNode(true);
      Array.from(firstRowClone.children).forEach((td) => {
        if (td !== firstRowClone.children[0]) {
          td.textContent = null;
          td.className = "editable";
          td.setAttribute('placeholder', "Content...");
        }
      });
      userTable.children[1].children[1].appendChild(firstRowClone);
      var foldRowClone = userTable.children[1].children[1].children[1].cloneNode(true);
      Array.from(foldRowClone.children[0].children[0].children[0].children[1].children).forEach((tr) => {
        Array.from(tr.children).forEach((td) => {
          td.textContent = null;
        });
      });
      userTable.children[1].children[1].appendChild(foldRowClone);
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
      if (trashBtn.parentElement.classList.contains('view')) {
        trashBtn.parentElement.nextElementSibling.remove();
        trashBtn.parentElement.remove();
      } else {
        trashBtn.parentElement.remove();
      }

    }
  });

  function SaveTableToDB(userTable, saveBtn) {
    var userName = userTable.children[0].textContent;
    var headers = userTable.children[1].children[0].children[0];
    var rows = userTable.children[1].children[1];
    var headersArr = []; var rowsArr = []; var cellsArr = []; var bbArr = [];

    Array.from(headers.children).forEach((header) => {
      if (!header.classList.contains('empty-th')) {
        headersArr.push(header.textContent);
      }   
    });

    Array.from(rows.children).forEach((row) => {
      cellsArr = [];
      Array.from(row.children).forEach((cell) => {
        cellsArr.push(cell.textContent);
      });
      rowsArr.push(cellsArr);
    });

    set(ref(database, 'Tables/' + auth?.currentUser.uid), {
      Content: rowsArr,
      Headers: headersArr,
      Name: userName
    }).then(() => {
      ShowNotifToast("Saved Table", "Any changes made to your table has been saved.", "var(--green)", true, 5);
      saveBtn.classList.remove('button-onClick');
    }).catch((error) => {
      console.log(error.code + ": " + error.message);
      ShowNotifToast("Error Saving Table", "There was an error saving your table. Please try again.", "var(--red)", true, 5);
      saveBtn.classList.remove('button-onClick');
    });
  }

  function AddRemoveDeleteIcons(deleteBtn, isAdd) {
    var userTable = deleteBtn.parentElement.parentElement;
    var tbody = userTable.children[1].children[1];
    var saveBtn = document.getElementById('save-btn');
    var addRowBtn = document.getElementById('addrow-btn');
    deleteBtn.classList.remove('disabled-btn');

    if (isAdd === true) {
      var bodyValid = true;

      if (tbody.children.length > 1) {
        //Add icons after each row
        var index = 0
        Array.from(tbody.children).forEach((tr) => {
          if (index % 2 === 0 && tr !== tbody.children[0]) {
            var deleteTd = document.createElement('td'); deleteTd.classList.add('delete-td');
            deleteTd.setAttribute("id", 'row'); tr.appendChild(deleteTd);
          } else if (index % 2 !== 0) {
            //Is a fold tr
            var foldBody = tr.children[0].children[0].children[0].children[1];
            Array.from(foldBody.children).forEach((foldTr) => {
              if (foldTr != foldBody.children[0]) {
                var deleteTd = document.createElement('td'); deleteTd.classList.add('delete-td');
                deleteTd.setAttribute("id", 'row'); foldTr.appendChild(deleteTd);
              }
            });
          } else {
            var emptyTd = document.createElement('td'); emptyTd.classList.add('empty-td');
            tr.appendChild(emptyTd);
          }
          index++;
        });
      } else { bodyValid = false; }

      if (bodyValid === true) {
        setTimeout(() => {
          //Disable all other buttons
          saveBtn.classList.add('disabled-btn');
          addRowBtn.classList.add('disabled-btn');
          deleteBtn.setAttribute("id", "done-btn");
        }, 1);
      }
    } else {
      //Enable all other buttons
      saveBtn.classList.remove('disabled-btn');
      addRowBtn.classList.remove('disabled-btn');
      deleteBtn.setAttribute("id", "delete-btn");

      //Remove all trash icons and empty td's
      document.querySelectorAll('.delete-td').forEach(td => td.remove());
      document.querySelectorAll('.empty-td').forEach(td => td.remove());

      //Check if delete btn needs to be disabled
      if (tbody.children.length === 2 && tbody.children[1].children[0].children[0].children[0].children[1].children.length === 1) {
        deleteBtn.classList.add('disabled-btn');
      }
    }

  }
  //#endregion TABLE FUNCTIONS
});