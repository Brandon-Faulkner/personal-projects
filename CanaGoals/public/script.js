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

  //#region VARIABLES
  const mainScreen = document.getElementById('main-page');
  const semestersContainer = document.getElementById('semesters-container');
  const darkmodeToggle = document.getElementById('theme-toggle');

  //Detect users prefered color scheme
  const localTheme = localStorage.getItem("theme");
  const darkTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const currTheme = GetThemeString(localTheme, darkTheme);
  document.querySelector("html").setAttribute("data-theme", currTheme);
  currTheme === "dark" ? darkmodeToggle.checked = false : darkmodeToggle.checked = true;

  function GetThemeString(localTheme, darkTheme) {
    if (localTheme !== null) return localTheme;
    if (darkTheme.matches) return "dark";
    return "light";
  }

  darkmodeToggle.addEventListener('change', function () {
    const newTheme = darkmodeToggle.checked ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    document.querySelector("html").setAttribute("data-theme", newTheme);
  });

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
      semestersContainer.replaceChildren();
      loginSignOutBtn.className = "header-login-btn";
      var defaultLi = CreateHeading("Default Title", "Start Date", "End Date");
      CreateTable(defaultLi, "default-table", "Default Name", null, 3, 3, false);
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
  var semesterTitlesArr = []; var semLi = null;
  function ListenForUsersTables() {
    onValue(ref(database, 'Semesters/'), (snapshot) => {
      var tempSemArr = [];

      if (snapshot.exists()) {

        if (isFirstLoad === true) {
          semestersContainer.replaceChildren();
        } else {
          Array.from(semestersContainer.children).forEach((li) => {
            Array.from(li.children[3].children).forEach((table) => {
              if (table.getAttribute('id') !== auth.currentUser.uid + '-table') {
                table.remove();
              }
            });
          });
        }

        snapshot.forEach((semester) => {

          tempSemArr.push(semester.key);
          //Check if this semester is already in the arr
          if (!semesterTitlesArr.includes(semester.key)) {
            semesterTitlesArr.push(semester.key);

            //Create accordion headear for this semester
            var semTitle = semester.key;
            var endDate = semester.child("End").val();
            var startDate = semester.child("Start").val();
            semLi = CreateHeading(semTitle, startDate, endDate);
          } else {
            semLi = semestersContainer.children[semesterTitlesArr.indexOf(semester.key)];
          }

          // Clear the arrays first so no dups
          usersTablesArr = [];

          //Make sure tables in this semester exist
          const semTables = semester.child("Tables");

          if (semTables.exists()) {
            //Get data for each table based on user
            semester.child("Tables").forEach((uid) => {
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
                CreateTable(semLi, userTable[0].uid + "-table", userTable[0].user, userTable[0], userTable[0].cols, userTable[0].rows, true);
              } else {
                //Create default user table since they dont have one yet
                const defaultTableArr = []; defaultTableArr.push(CreateDefaultArr(headersArr));
                CreateTable(semLi, defaultTableArr[0].uid + "-table", null, defaultTableArr[0], 3, 1, true);
              }
            }

            //Other users tables
            usersTablesArr.forEach((table) => {
              if (table.isMainUser != true) {
                CreateTable(semLi, table.uid + "-table", table.user, table, table.cols, table.rows, true);
              }
            });
          } else {
            //Need to create empty table for user in this semester since there are no tables
            semLi.children[3].replaceChildren();
            const defaultTableArr = []; defaultTableArr.push(CreateDefaultArr(headersArr));
            CreateTable(semLi, defaultTableArr[0].uid + "-table", null, defaultTableArr[0], 3, 1, true);
          }
        });
      } else {
        // No tables in DB, create default one for user
        CreateTable(semLi, auth.currentUser.uid + "-table", null, null, 3, 3, true);
      }

      //Remove deleted semesters
      Array.from(semestersContainer.children).forEach((li) => {
        if (!tempSemArr.includes(li.children[2].textContent.split(" : ")[0])) {
          li.remove();
        }
      });

      isFirstLoad = false;
    }, error => {
      console.log(error.code + ": " + error.message);
    });
  }

  function CreateHeading(semester, start, end) {
    var semesterLi = document.createElement('li');
    var checkbox = document.createElement('input'); checkbox.setAttribute('name', 'Show/Hide Semester');
    checkbox.setAttribute('type', 'checkbox'); checkbox.setAttribute('checked', "true");
    var iconElem = document.createElement('i'); iconElem.className = 'semester-i';
    var semTitle = document.createElement('h2'); semTitle.textContent = semester + " : " + start + " - " + end;
    semTitle.className = "semesters-h2";
    var semTableDiv = document.createElement('div'); semTableDiv.className = "semesters-main-div";
    semesterLi.appendChild(checkbox); semesterLi.appendChild(iconElem);
    semesterLi.appendChild(semTitle); semesterLi.appendChild(semTableDiv);
    semestersContainer.appendChild(semesterLi);
    return semesterLi;
  }

  function CreateTable(semLi, tableID, userName, tableArr, col, row, isUsersTable) {
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
            tdDrop.setAttribute('data-tooltip', "left");  
            var arrow = document.createElement('i');
            arrow.className = "fa-solid fa-caret-down"; tdDrop.appendChild(arrow);
            var span = document.createElement('span'); span.classList.add('tooltip');
            span.textContent = "Show/Hide the Building Blocks for this Goal."; tdDrop.appendChild(span);
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

      //Add empty row with add row btn to end of fold rows
      var foldBTr = document.createElement('tr'); foldBody.appendChild(foldBTr);
      for (let n = 0; n < col; n++) {
        var td = document.createElement('td'); td.className = "empty-addbb-td";
        if (n === col - 1) {
          var btn = document.createElement('button'); btn.className = "table-btn addBB-btn";
          var icon = document.createElement('i'); icon.className = "fa-solid fa-plus";
          btn.setAttribute('data-tooltip', "right"); btn.appendChild(icon);
          var span = document.createElement('span'); span.classList.add('tooltip');
          span.textContent = "Adds a new row to Building Blocks"; btn.appendChild(span);
          td.appendChild(btn);
        }
        foldBTr.appendChild(td);
      }

      tbody.appendChild(foldTr);
    }

    table.appendChild(tbody);
    tableWrap.appendChild(table);

    if (isUsersTable === true) {
      var tableBtns = document.createElement('div'); tableBtns.classList.add("table-buttons");
      var saveBtn = document.createElement('button'); saveBtn.classList.add('table-btn', 'save-btn'); 
      saveBtn.setAttribute('data-tooltip', "right"); var savespan = document.createElement('span'); savespan.classList.add('tooltip');
      savespan.textContent = "Saves all data from the table to the database."; saveBtn.appendChild(savespan);
      var saveIcon = document.createElement('i'); saveIcon.className = "fa-solid fa-cloud-arrow-up"; saveBtn.appendChild(saveIcon);
      var addGoalBtn = document.createElement('button'); addGoalBtn.classList.add('table-btn', 'addGoal-btn');
      addGoalBtn.setAttribute('data-tooltip', "right"); var goalspan = document.createElement('span'); goalspan.classList.add('tooltip');
      goalspan.textContent = "Adds A New Row To Goals."; addGoalBtn.appendChild(goalspan);
      var rowIcon = document.createElement('i'); rowIcon.className = "fa-solid fa-plus"; addGoalBtn.appendChild(rowIcon);
      var deletBtn = document.createElement('button'); deletBtn.classList.add('table-btn', 'delete-btn');
      deletBtn.setAttribute('data-tooltip', "right"); var delspan = document.createElement('span'); delspan.classList.add('tooltip');
      delspan.textContent = "Starts the process of deleting rows. After pressing, you will see trash cans next to rows you can delete."; deletBtn.appendChild(delspan); 
      tableBtns.append(saveBtn, addGoalBtn, deletBtn);
      tableWrap.appendChild(tableBtns);
    }

    semLi.children[3].appendChild(tableWrap);
  }

  function CreateDefaultArr(headersArr) {
    var defaultContentArr = []; var defaultBBArr = [];
    for (let i = 0; i < 3; i++) {
      var defaultContent = { user: null, rowNum: 0, row: null };
      defaultContentArr.push(defaultContent);
      var defaultBB = { user: null, id: 0, rowNum: 0, bbNum: i, row: null };
      defaultBBArr.push(defaultBB);
    }

    var defaultData = { user: null, uid: auth?.currentUser.uid, isMainUser: true, headers: headersArr, content: defaultContentArr, buildingBlocks: defaultBBArr, cols: 3, rows: 1 };
    return defaultData;
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
    var saveBtn = e.target.closest(".save-btn");

    if (saveBtn) {
      saveBtn.classList.add('button-onClick');
      var userTable = saveBtn.parentElement.parentElement;
      SaveTableToDB(userTable, saveBtn);
    }

    //Add Goal
    var addGoalBtn = e.target.closest(".addGoal-btn");

    if (addGoalBtn) {
      addGoalBtn.nextElementSibling.classList.remove('disabled-btn');
      var userTable = addGoalBtn.parentElement.parentElement;
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

    //Add Building Block
    var addBBBtn = e.target.closest(".addBB-btn");

    if (addBBBtn) {
      var foldBody = addBBBtn.parentElement.parentElement.parentElement;
      var bbClone = foldBody.firstChild.cloneNode(true);
      Array.from(bbClone.children).forEach((td) => td.textContent = null);
      foldBody.insertBefore(bbClone, foldBody.lastChild);
    }

    //Delete
    var deleteBtn = e.target.closest(".delete-btn");

    if (deleteBtn) {
      AddRemoveDeleteIcons(deleteBtn, true);
    }

    //Done deleting
    var doneBtn = e.target.closest(".done-btn");

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
    var headersArr = []; var rowsArr = []; var cellsArr = [];
    var bbRowArr = []; var bbCellArr = [];

    Array.from(headers.children).forEach((header) => {
      if (!header.classList.contains('empty-th')) {
        headersArr.push(header.textContent);
      }
    });

    Array.from(rows.children).forEach((row) => {
      cellsArr = [];
      if (row.className === "view") {

        //Get goal row values first
        Array.from(row.children).forEach((cell) => {
          if (cell.className !== 'view-td') {
            cellsArr.push(cell.textContent);
          }
        });

        //Get building block values next
        bbRowArr = [];
        var bbRows = row.nextElementSibling.children[0].children[0].children[0].children[1];
        Array.from(bbRows.children).forEach((bbRow) => {
          bbCellArr = [];
          Array.from(bbRow.children).forEach((bbCell) => {
            bbCellArr.push(bbCell.textContent);
          });
          bbRowArr.push(bbCellArr);
        });

        rowsArr.push({ 0: cellsArr[0], 1: cellsArr[1], 2: cellsArr[2], BB: bbRowArr });
      }
    });

    const usersID = userTable.getAttribute('id').split('-')[0];
    const semester = userTable.parentElement.parentElement.children[2].textContent.split(" : ")[0];
    set(ref(database, 'Semesters/' + semester + '/Tables/' + usersID), {
      Content: rowsArr,
      Headers: headersArr,
      Name: userName
    }).then(() => {
      ShowNotifToast("Saved Table", "Any changes made to this table has been saved.", "var(--green)", true, 5);
      saveBtn.classList.remove('button-onClick');
    }).catch((error) => {
      console.log(error.code + ": " + error.message);
      ShowNotifToast("Error Saving Table", "There was an error saving this table. Please try again.", "var(--red)", true, 5);
      saveBtn.classList.remove('button-onClick');
    });
  }

  function AddRemoveDeleteIcons(deleteBtn, isAdd) {
    var userTable = deleteBtn.parentElement.parentElement;
    var tbody = userTable.children[1].children[1];
    var saveBtn = deleteBtn.parentElement.firstChild;
    var addGoalBtn = saveBtn.nextElementSibling;
    deleteBtn.classList.remove('disabled-btn');
    userTable.querySelectorAll('.addBB-btn').forEach(btn => btn.classList.add('disabled-btn'));

    if (isAdd === true) {
      var bodyValid = true;

      if (tbody.children.length > 1) {
        //Add icons after each row
        var index = 0; var trashspan = document.createElement('span'); 
        trashspan.classList.add('tooltip'); trashspan.textContent = "Delete this row from the table.";
        Array.from(tbody.children).forEach((tr) => {
          if (index % 2 === 0 && tr !== tbody.firstChild) {
            var deleteTd = document.createElement('td'); deleteTd.classList.add('delete-td');
            deleteTd.setAttribute('data-tooltip', 'right'); deleteTd.appendChild(trashspan.cloneNode(true));
            tr.appendChild(deleteTd);
          } else if (index % 2 !== 0) {
            //Is a fold tr
            var foldBody = tr.children[0].children[0].children[0].children[1];
            Array.from(foldBody.children).forEach((foldTr) => {
              if (foldTr !== foldBody.firstChild && foldTr !== foldBody.lastChild) {
                var deleteTd = document.createElement('td'); deleteTd.classList.add('delete-td');
                deleteTd.setAttribute('data-tooltip', 'right'); deleteTd.appendChild(trashspan.cloneNode(true));
                foldTr.appendChild(deleteTd);
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
          addGoalBtn.classList.add('disabled-btn');
          deleteBtn.className = "table-btn done-btn";
        }, 1);
      }
    } else {
      //Enable all other buttons
      saveBtn.classList.remove('disabled-btn');
      addGoalBtn.classList.remove('disabled-btn');
      deleteBtn.className = "table-btn delete-btn";
      userTable.querySelectorAll('.addBB-btn').forEach(btn => btn.classList.remove('disabled-btn'));

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