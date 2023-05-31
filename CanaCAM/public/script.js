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
import { getDatabase, ref as ref_db, onValue, child, set, remove } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-database.js";
import { getStorage, ref as ref_st, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-storage.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, EmailAuthProvider, linkWithCredential, signOut } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-auth.js";

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

window.addEventListener('load', () => {

  /*Notification.requestPermission().then((result) => {
    randomNotification();
  });
  function randomNotification() {
    const notifTitle = "Test Title";
    const notifBody = `Created by Brandon Faulkner.`;
    const notifImg = "Resources/Icons/android-chrome-96x96.png";
    const options = {
      body: notifBody,
      icon: notifImg,
    };
    new Notification(notifTitle, options);
    setTimeout(randomNotification, 30000);
  }*/

  //#region Variables
  // Initialize Firebase, Database and Authentication
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const groupRef = ref_db(database, "Groups/");
  const planRef = ref_db(database, "GroupsInfo/");
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
  const signupButton = document.getElementById('signup-button');

  const mainScreen = document.getElementById('main-page');

  const tabPlanning = document.getElementById('tab-planning');
  const planningBlocked = document.getElementById('planning-blocked');
  const planningIntro = document.getElementById('tab-planning-intro');
  const planningImg = document.getElementById('planning-image');
  const contactBtn = document.getElementById('contact-button');
  const planningWeekSelectParent = document.getElementById('plan-week-select-grid');
  const hostSelection = document.getElementById('host-selection');
  const planWeekSelection = document.getElementById('plan-week-selection');
  const planWeekHolder = document.getElementById('plan-week-holder');

  const overviewWeekSelection = document.getElementById('over-week-selection');
  const overviewWeekHolder = document.getElementById('overview-week-holder');

  const tabProfile = document.getElementById('tab-profile');
  const profileSection = document.getElementById('profile-section');
  const profileBlocked = document.getElementById('profile-blocked');
  const profileInfo = document.getElementById('profile-info');
  //Array to hold the data of each week
  var allWeeksArr = []; var uniqWeeks = [];
  //Arrays to hold group information
  var groupInfoArr = [], hostNameArr = [], userScheduleArr = [];

  function Loading(show) {
    if (show) {
      //Show loading indicator
      if (!loader.classList.contains('fadeIn')) {
        loader.classList.remove('fadeOut');
        loader.classList.add('fadeIn');
      }
    }
    else {
      setTimeout(() => {
        //Remove loading indicator
        if (loader.classList.contains('fadeIn')) {
          loader.classList.remove('fadeIn');
          loader.classList.add('fadeOut');
        }
      }, 500);
    }
  }
  //#endregion Variables

  //#region Authentication Functions
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Signed in Anonymously
      if (user?.isAnonymous) {
        OverviewSetup(groupRef, user?.isAnonymous);

        //Add listeners
        tabPlanning.addEventListener('click', ShowLogin);
        tabProfile.addEventListener('click', ShowLogin);
        loginCloseBtn.addEventListener('click', ShowLogin);
      }
      else {
        //Signed in with Account
        OverviewSetup(groupRef, user?.isAnonymous);
        
        //Remove listeners
        tabPlanning.removeEventListener('click', ShowLogin);
        tabProfile.removeEventListener('click', ShowLogin);
        loginCloseBtn.removeEventListener('click', ShowLogin);
      }
    } else {
      // Signed out
      AnonymousSignIn(auth);
    }
  });

  function ShowLogin() {
    if (!loginScreen.classList.contains('show')) {
      loginScreen.classList.add('show');
      mainScreen.classList.add('disable-click');
    }
    else {
      loginScreen.classList.remove('show');
      mainScreen.classList.remove('disable-click');
    }
  }

  function AnonymousSignIn(auth) {
    signInAnonymously(auth)
      .then(() => {
        console.log("Signed in Anonymously");
      })
      .catch((error) => {
        console.log(error.code + ": " + error.message);
      });
  }

  function UpgradeAnonymous(auth, credential, img, imgName, name, phone) {
    linkWithCredential(auth.currentUser, credential)
      .then((usercred) => {
        //Upload user data to db
        set(ref_db(database, 'Users/' + usercred.user.uid), {
          Image: imgName,
          Name: name,
          Phone: phone
        });

        //Upload prof pic to storage
        const userStoreRef = ref_st(storage, "Users/" + usercred.user.uid + "/" + imgName);
        uploadBytes(userStoreRef, img)
          .then((snapshot) => {
            //Signed in with Account
            OverviewSetup(groupRef, usercred.user?.isAnonymous);

            //Remove listeners
            tabPlanning.removeEventListener('click', ShowLogin);
            tabProfile.removeEventListener('click', ShowLogin);
            loginCloseBtn.removeEventListener('click', ShowLogin);
          });

      }).catch((error) => {
        console.log("Error upgrading anonymous account", error);
      });
  }

  function SignInEmailAndPassword(auth, email, password) {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        loginText.textContent = "Welcome Back!";
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
      });
  }

  function SignOutUser(auth) {
    signOut(auth).then(() => {

    }).catch((error) => {

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
    loginText.classList.remove('login-error');
    loginEmail.classList.remove('login-error');
    loginPassword.classList.remove('login-error');
    SignInEmailAndPassword(auth, loginEmail.value, loginPassword.value);
  });

  signupButton.addEventListener('click', function (e) {
    e.preventDefault();
    const name = signupName.value.trim();
    const phone = signupPhone.value.trim();
    const img = ValidateImg(signupImg.files[0]);
    const imgName = signupImg.parentElement.getAttribute('data-text');
    const email = signupEmail.value.trim();
    const password = signupPassword.value;
    const confirmPass = signupConfirmPass.value;

    const isNameValid = ValidateName(name);
    const isPhoneValid = ValidatePhone(phone);
    const isEmailValid = ValidateEmail(email);
    const isPasswordValid = ValidatePassword(password, confirmPass);

    //Upgrade annonymous account if data is valid
    if (isNameValid && isPhoneValid && isEmailValid && isPasswordValid && img != null) {
      const credential = EmailAuthProvider.credential(email, password);
      UpgradeAnonymous(auth, credential, img, imgName, name, phone);
    }
  });

  signupLink.addEventListener('click', function () {
    signupToggleBtn.click();
  });

  signupPhone.addEventListener('keydown', function (e) {
    // Input must be of a valid number format or a modifier key, and not longer than ten digits
    if (!isNumericInput(e) && !isModifierKey(e)) {
      e.preventDefault();
    }
  });

  const isNumericInput = (event) => {
    const key = event.keyCode;
    return ((key >= 48 && key <= 57) || // Allow number line
      (key >= 96 && key <= 105) // Allow number pad
    );
  };

  const isModifierKey = (event) => {
    const key = event.keyCode;
    return (event.shiftKey === true || key === 35 || key === 36) || // Allow Shift, Home, End
      (key === 8 || key === 9 || key === 13 || key === 46) || // Allow Backspace, Tab, Enter, Delete
      (key > 36 && key < 41) || // Allow left, up, right, down
      (
        // Allow Ctrl/Command + A,C,V,X,Z
        (event.ctrlKey === true || event.metaKey === true) &&
        (key === 65 || key === 67 || key === 86 || key === 88 || key === 90)
      )
  };

  signupPhone.addEventListener('keyup', function (e) {
    if (isModifierKey(e)) { return; }

    const input = e.target.value.replace(/\D/g, '').substring(0, 10); // First ten digits of input only
    const zip = input.substring(0, 3);
    const middle = input.substring(3, 6);
    const last = input.substring(6, 10);

    if (input.length > 6) { e.target.value = `(${zip}) ${middle}-${last}`; }
    else if (input.length > 3) { e.target.value = `(${zip}) ${middle}`; }
    else if (input.length > 0) { e.target.value = `(${zip}`; }
  });

  signupImg.addEventListener('change', function () {
    signupImg.parentElement.setAttribute("data-text", signupImg.value.replace(/.*(\/|\\)/, ''));
  })

  function ValidateName(name) {
    const nameRegex = new RegExp(/^[a-zA-z]+ [a-zA-z]+$/gm, "gm");
    const result = nameRegex.test(name);
    const nameError = document.getElementById("name-error");
    nameError.classList.add('hide');
    signupName.classList.remove('login-error');

    if (result === false) {
      //Show error     
      nameError.classList.remove('hide');
      signupName.classList.add('login-error');
    }

    return result;
  }

  function ValidatePhone(phone) {
    const phoneRegex = new RegExp(/^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/gm, "gm");
    const result = phoneRegex.test(phone);
    const phoneError = document.getElementById("phone-error");
    phoneError.classList.add('hide');
    signupPhone.classList.remove('login-error');

    if (result === false) {
      //Show error     
      phoneError.classList.remove('hide');
      signupPhone.classList.add('login-error');
    }

    return result;
  }

  function ValidateEmail(email) {
    var emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/gm, "gm");
    const result = emailRegex.test(email);
    const emailError = document.getElementById("email-error");
    emailError.classList.add('hide');
    signupEmail.classList.remove('login-error');

    if (result === false) {
      //Show error      
      emailError.classList.remove('hide');
      signupEmail.classList.add('login-error');
    }

    return result;
  }

  function ValidatePassword(password, confirmPass) {
    var passRegex = new RegExp(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/gm, "gm");
    const passError = document.getElementById("pass-error");
    const confPassError = document.getElementById("conf-pass-error");
    passError.classList.add('hide'); confPassError.classList.add('hide');
    signupPassword.classList.remove('login-error');
    signupConfirmPass.classList.remove('login-error');

    if (passRegex.test(password)) {
      if (password === confirmPass) {
        return true;
      } else {
        //Show error       
        confPassError.classList.remove('hide');
        signupConfirmPass.classList.add('login-error');
        return false;
      }
    } else {
      //Show error      
      passError.classList.remove('hide');
      signupPassword.classList.add('login-error');
      return false;
    }
  }

  function ValidateImg(img) {
    const fileError = document.getElementById('file-error');
    fileError.classList.add('hide');
    signupImg.classList.remove('login-error');

    if (img) {
      return img;
    } else {
      //Show error   
      fileError.classList.remove('hide');
      signupImg.classList.add('login-error');
      return null;
    }
  }
  //#endregion Login Functions

  //#region Check Date Functions
  //encodeURIComponent('2/10/2020');
  //decodeURIComponent('2%2F10%2F2020);

  //#endregion Check Date Functions

  //#region Overview Setup
  function OverviewSetup(groupRef, isAnonymous) {
    onValue(groupRef, (snapshot) => {
      //Clear arrays to not have duplicate data
      allWeeksArr = []; uniqWeeks = []; hostNameArr = [];

      Loading(true);

      snapshot.forEach((childSnapshot) => {
        //Group Num, Host and Gen location
        const groupKey = childSnapshot.key;
        const hostName = childSnapshot.child("Hosts").val();
        const genLocation = childSnapshot.child("Location").val();

        //Keep track of just host names for dropdown
        const host = { group: groupKey, host: hostName };
        hostNameArr.push(host);

        //Get the day and times for each week
        childSnapshot.child("Weeks").forEach((week) => {
          week.forEach((day) => {
            const weekData = { group: groupKey, week: decodeURIComponent(week.key), day: day.key, time: day.val(), host: hostName, location: genLocation };
            allWeeksArr.push(weekData);
          });
        });
      });

      //Clear current elements
      overviewWeekHolder.replaceChildren();

      //Create unique arrays for each week to determine all unique days and weeks
      var uniqDays = [...new Set(allWeeksArr.map(item => item.day))]; DaySorter(uniqDays, true);
      uniqWeeks = [...new Set(allWeeksArr.map(item => item.week))];

      //Sort the week arrays by day and then time
      DaySorter(allWeeksArr); TimeSorter(allWeeksArr);

      //Create Week containers for each week
      uniqWeeks.forEach((week) => {
        CreateOverviewWeekContainers(week, overviewWeekHolder);
        var containerElem = document.getElementById(week + "-overview");
        var filteredArr = allWeeksArr.filter(w => w.week === week);
        
        uniqDays.forEach((day) => {
          if (filteredArr.find(d => d.day === day)) {
            CreateOverviewTableHeader(day, containerElem);
            CreateOverviewTableRow(filteredArr, day, containerElem);
          }             
        });
      });

      //Update dropdowns
      SetupDropdowns(planWeekSelection, uniqWeeks, false);
      SetupDropdowns(overviewWeekSelection, uniqWeeks, false);
      SetupDropdowns(hostSelection, hostNameArr, true);

      //Now setup profile tab
      ProfileSetup(auth, isAnonymous);
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

  function CreateOverviewWeekContainers(week, parentElem) {
    var container = document.createElement('div'); container.className = "event-container hide"; container.setAttribute('name', "overview-container");
    var ul = document.createElement('ul'); ul.className = "responsive-table event-ul"; ul.setAttribute('id', week + "-overview");
    container.appendChild(ul);
    parentElem.appendChild(container);
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

        var col1 = document.createElement('div'); col1.className = "col"; col1.setAttribute('data-label', "Time:"); col1.textContent = elem.time; row.appendChild(col1);
        var col2 = document.createElement('div'); col2.className = "col"; col2.setAttribute('data-label', "General Location:"); col2.textContent = elem.location; row.appendChild(col2);
        var col3 = document.createElement('div'); col3.className = "col"; col3.setAttribute('data-label', "Host:"); col3.textContent = elem.host; row.appendChild(col3);

        parentElem.appendChild(row);
      }
    });
  }
  //#endregion Overview Setup

  //#region Profile Setup
  function ProfileSetup(auth, isAnonymous) {
    if (isAnonymous) {
      profileBlocked.classList.remove('hide');
      profileInfo.parentElement.classList.add('hide');
      profileInfo.replaceChildren();
      PlanningSetup(planRef, isAnonymous, null);
    } else {
      loginScreen.classList.remove('show');
      mainScreen.classList.remove('disable-click');
      profileBlocked.classList.add('hide');
      profileInfo.parentElement.classList.remove('hide');
      Loading(true);

      onValue(ref_db(database, 'Users/' + auth?.currentUser.uid), (snapshot) => {
        const userImage = snapshot.child("Image").val();
        const userName = snapshot.child("Name").val();
        const userEmail = auth?.currentUser.email;
        const userPhone = snapshot.child("Phone").val();
        const userTotalRSVP = snapshot.child("Total RSVP'd").val();

        //Clear userScheduleArr to avoid duplicates
        userScheduleArr = [];

        //Now update their schedule for each week
        snapshot.child("Schedule").forEach((week) => {
          week.forEach((day) => {
            const weekDay = { week: week.key, day: day.key, time: day.child('Time').val(), guests: day.child('Guests').val(), group: day.child('GroupID').val() };
            userScheduleArr.push(weekDay);
          });
        });

        getDownloadURL(ref_st(storage, "Users/" + auth?.currentUser.uid + "/" + userImage))
          .then((url) => {
            //Clear current elements from profile section
            profileInfo.replaceChildren();

            CreateProfileHeader(profileInfo, url);
            CreatProfileInfoRow(profileInfo, userName, userEmail, userPhone, userTotalRSVP);

            //Now setup Planning tab
            PlanningSetup(planRef, isAnonymous, 'Group 1', userScheduleArr);
            Loading(false);
          })
          .catch((error) => {
            console.log(error);
          })
      }, {
        onlyOnce: true
      });
    }
  }

  function CreateProfileHeader(parentElem, imgUrl) {
    var profileHeader = document.createElement('li');
    profileHeader.classList.add('profile-header');

    var profCol1 = document.createElement('div'); profCol1.className = "profile-col";
    var profImg = document.createElement('img'); profImg.src = imgUrl; profImg.className = "profile-image";
    profCol1.appendChild(profImg); profileHeader.appendChild(profCol1);

    var profCol2 = document.createElement('div'); profCol2.className = "profile-col"; profCol2.style = "padding-top: 10px;";
    var profSignOut = document.createElement('button'); profSignOut.setAttribute('id', 'signout-button'); profSignOut.className = "signout-button";
    var profSignOutIcon = document.createElement('i'); profSignOutIcon.className = "fa-solid fa-right-from-bracket"; profSignOut.appendChild(profSignOutIcon);
    profCol2.appendChild(profSignOut); profileHeader.appendChild(profCol2);

    parentElem.appendChild(profileHeader);
  }

  function CreatProfileInfoRow(parentElem, userName, userEmail, userPhone, userTotalRSVP) {
    var profileRow = document.createElement('li');
    profileRow.className = "profile-row";

    var title = document.createElement('h2'); title.textContent = "Your Information"; profileRow.appendChild(title);
    var name = document.createElement('h3'); name.textContent = userName; name.className = "prof-info"; name.setAttribute('data-label', 'Name:'); profileRow.appendChild(name);
    var email = document.createElement('h3'); email.textContent = userEmail; email.className = "prof-info"; email.setAttribute('data-label', 'Email:'); profileRow.appendChild(email);
    var phone = document.createElement('h3'); phone.textContent = userPhone; phone.className = "prof-info"; phone.setAttribute('data-label', 'Phone:'); profileRow.appendChild(phone);
    var days = document.createElement('h3'); days.textContent = userTotalRSVP; days.className = "prof-info"; days.setAttribute('data-label', 'Total Days RSVP\'d:'); profileRow.appendChild(days);
    var editButton = document.createElement('button'); editButton.className = "editinfo-button";
    var editIcon = document.createElement('i'); editIcon.className = "fa-solid fa-pen-to-square"; editButton.appendChild(editIcon); profileRow.appendChild(editButton);

    parentElem.appendChild(profileRow);
  }
  //#endregion Profile Setup

  //#region Planning Setup
  function PlanningSetup(planRef, isAnonymous, groupID, userScheduleArr) {
    if (isAnonymous) {
      planningBlocked.classList.remove('hide');
      planningIntro.parentElement.classList.add('hide');
      planningWeekSelectParent.classList.add('hide');
      planWeekHolder.replaceChildren();
      Loading(false);
    } else {
      loginScreen.classList.remove('show');
      mainScreen.classList.remove('disable-click');
      planningBlocked.classList.add('hide');
      planningIntro.parentElement.classList.remove('hide');
      planningWeekSelectParent.classList.remove('hide');
      Loading(true);

      onValue(planRef, (snapshot) => {
        //Clear current data in array to avoid dups
        groupInfoArr = [];

        const childSnapshot = snapshot.child(groupID);
        const groupKey = childSnapshot.key;
        const address = childSnapshot.child("Address").val();
        const description = childSnapshot.child("Description").val();
        const email = childSnapshot.child("Email").val();
        const image = childSnapshot.child("Image").val();
        const phone = childSnapshot.child("Phone").val();

        getDownloadURL(ref_st(storage, "Groups/" + image))
          .then((url) => {

            //Update group array with the new data
            const data = { group: groupKey, address: address, description: description, email: email, image: url, phone: phone };
            groupInfoArr.unshift(data);

            //Clear the current elements in the list
            planWeekHolder.replaceChildren();

            //Create week containers for each week
            uniqWeeks.forEach((week) => {
              CreatePlanningWeekContainers(week, planWeekHolder);
              var containerElem = document.getElementById(week + "-planning");
              CreatePlanningTableHeader(containerElem);

              allWeeksArr.forEach((elem) => {
                if (elem.group === groupID && elem.week === week) {
                  CreatePlanningTableRow(elem, groupInfoArr, elem.group, containerElem, userScheduleArr.filter(u => u.group === groupID && u.week === week));
                }
              });
            });

            //Now Update planning intro
            UpdatePlanningIntro(hostNameArr, groupInfoArr, groupID, planningIntro);
            ShowEventContainers(uniqWeeks[0], 'planning-container');
            Loading(false);
          })
          .catch((error) => {
            console.log(error);
          })
      }, {
        onlyOnce: true
      });
    }
  }

  function UpdatePlanningIntro(hostNameArr, groupInfoArr, groupID, parentElem) {
    parentElem.children[0].children[1].textContent = hostNameArr.find(h => h.group === groupID).host;
    parentElem.children[0].children[2].textContent = groupInfoArr.find(g => g.group === groupID).description;
    parentElem.children[0].children[3].setAttribute("data-groupID", groupID);

    planningImg.setAttribute('src', groupInfoArr.find(g => g.group === groupID).image);
  }

  function CreatePlanningWeekContainers(week, parentElem) {
    var container = document.createElement('div'); container.className = "event-container hide"; container.setAttribute('name', "planning-container");
    var ul = document.createElement('ul'); ul.className = "responsive-table event-ul"; ul.setAttribute('id', week + "-planning");
    container.appendChild(ul);
    parentElem.appendChild(container);
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

  function CreatePlanningTableRow(elem, groupInfoArr, groupID, parentElem, userScheduleArr) {
    var row = document.createElement('li');
    row.className = "table-row";

    var col1 = document.createElement('div'); col1.className = "col"; col1.setAttribute('data-label', "Day/Time:"); col1.textContent = elem.day + "/" + elem.time; row.appendChild(col1);
    var col2 = document.createElement('div'); col2.className = "col"; col2.setAttribute('data-label', "Address:"); col2.textContent = groupInfoArr.find(g => g.group === groupID).address; row.appendChild(col2);

    //Check user schedule to update these values if they exist
    //First create elements, update values if needed, then add to row in order
    var col3 = document.createElement('div'); col3.className = "col"; col3.setAttribute('data-label', "Status:"); col3.textContent = "Not Going";

    var col4 = document.createElement('div'); col4.className = "col"; col4.setAttribute('data-label', "Guests:");
    var counter = document.createElement('div'); counter.className = "counter";
    var minus = document.createElement('span'); minus.className = "guest-down"; var minusIcon = document.createElement('i'); minusIcon.className = "fa-solid fa-minus"; minus.appendChild(minusIcon);
    var counterInput = document.createElement('input'); counterInput.setAttribute("id", "counter-input-" + Math.floor(Math.random() * 100000)); counterInput.setAttribute("type", "text"); counterInput.value = 0; counterInput.disabled = true;
    var plus = document.createElement('span'); plus.className = "guest-up"; var plusIcon = document.createElement('i'); plusIcon.className = "fa-solid fa-plus"; plus.appendChild(plusIcon);

    var col5 = document.createElement('div'); col5.className = "col"; col5.setAttribute('data-label', "Action:");
    var rsvp = document.createElement('button'); rsvp.className = "rsvp-button"; rsvp.setAttribute('data-groupID', groupID);

    //Check schedule
    if (userScheduleArr != null) {
      userScheduleArr.forEach((userDay) => {
        if (elem.day === userDay.day && elem.time === userDay.time) {
          col3.textContent = "Going";
          minus.classList.add('hide'); plus.classList.add('hide');
          counterInput.value = userDay.guests;
          rsvp.classList.add('rsvp-cancel-button');
          rsvp.setAttribute('data-week', userDay.week);
        }
      });
    }

    //Add elements to row then to parent
    row.appendChild(col3);
    counter.appendChild(minus); counter.appendChild(counterInput); counter.appendChild(plus); col4.appendChild(counter); row.appendChild(col4);
    col5.appendChild(rsvp); row.appendChild(col5);

    parentElem.appendChild(row);
  }
  //#endregion Planning Setup

  //#region Week Menu Dropdown
  function SetupDropdowns(select, optionsArr, isHostArr) {
    let menu = select.parentNode,
      button = menu.children[1],
      btnList = button.children[1],
      selectList = menu.children[2];

    //Create options
    select.replaceChildren(); btnList.replaceChildren(); selectList.replaceChildren();
    optionsArr.forEach((elem) => {
      select.add(new Option(isHostArr === true ? elem.host : elem));
      var li1 = document.createElement('li');
      li1.textContent = isHostArr === true ? elem.host : elem;
      var li2 = document.createElement('li');
      li2.textContent = isHostArr === true ? elem.host : elem;
      btnList.appendChild(li1);
      selectList.appendChild(li2);
    });

    select.selectedIndex = "0";
    menu.style.setProperty('--t', select.selectedIndex * -41 + 'px');

    // Show the first container from the first option in lists
    if (!isHostArr) {
      ShowEventContainers(uniqWeeks[0], "planning-container");
      ShowEventContainers(uniqWeeks[0], "overview-container");
    }
  }
  //#endregion

  //#region Click Functions
  document.addEventListener('click', function (e) {
    e.stopPropagation();

    //Dropdown menus
    const menu = e.target.closest('.select-menu');

    if (menu && !menu.classList.contains('open')) {
      menu.classList.add('open');
    }

    if (!e.target.closest('.select-menu')) {
      document.querySelectorAll('.select-menu').forEach(function (menu) {
        menu.classList.remove('open');
      });
    }

    const li = e.target.closest('.select-menu > ul > li');

    if (li) {
      if (li.parentNode.parentNode === overviewWeekSelection.parentNode || li.parentNode.parentNode === planWeekSelection.parentNode) {
        DropdownSelection(li, overviewWeekSelection.parentNode, auth);
        DropdownSelection(li, planWeekSelection.parentNode, auth);

        // Switch Event Containers based on selection
        ShowEventContainers(li.textContent, "planning-container");
        ShowEventContainers(li.textContent, "overview-container");
      }
      else {
        DropdownSelection(li, hostSelection.parentNode, auth);
      }
    }

    //Clickable rows
    const row = e.target.closest('.clickable-row');

    if (row) {
      var liTarget = null;
      Array.from(hostSelection.options).forEach((option) => {
        if (row.children[2].textContent === option.value) {
          liTarget = option;
        }
      });
      DropdownSelection(liTarget, hostSelection.parentNode, auth);
      tabPlanning.click();
    }

    //RSVP Buttons
    const rsvp = e.target.closest('.rsvp-button');

    if (rsvp) {
      rsvp.classList.add('button-onClick');
      if (!rsvp.classList.contains('rsvp-cancel-button')) {
        setTimeout(ValidateRSVP(auth, rsvp, false), 250);
      } else {
        setTimeout(ValidateRSVP(auth, rsvp, true), 250);
      }
    }

    //Guest counter
    const guestDown = e.target.closest('.guest-down');
    const guestUp = e.target.closest('.guest-up');

    if (guestDown) { GuestDown(guestDown); }
    if (guestUp) { GuestUp(guestUp); }

    //Sign out button
    const signOutButton = e.target.closest('.signout-button');

    if (signOutButton) { SignOutUser(auth); }
  });

  function DropdownSelection(elemTarget, menu, auth) {
    let li = elemTarget,
      select = menu && menu.querySelector('select'),
      selected = select && select.querySelector('option:checked'),
      index = li && Array.prototype.indexOf.call(li.parentNode.children, li);

    if (li && menu && select && selected && index !== undefined) {
      menu.style.setProperty('--t', index * -41 + 'px');
      selected.removeAttribute('selected');
      var clicked = select.querySelectorAll('option')[index]; clicked.setAttribute('selected', '');
      menu.classList.add(index > Array.prototype.indexOf.call(select.querySelectorAll('option'), selected) ? 'tilt-down' : 'tilt-up');

      if (menu === hostSelection.parentNode) {
        PlanningSetup(planRef, auth?.currentUser.isAnonymous, hostNameArr.find(h => h.host === clicked.textContent).group, userScheduleArr);
      }

      setTimeout(function () {
        menu.classList.remove('open', 'tilt-up', 'tilt-down');
      }, 500);
    }
  };

  function ShowEventContainers(clickedWeek, containerName) {
    var eventContainers = document.getElementsByName(containerName);
    var containerArr = Array.from(eventContainers);

    containerArr.forEach(elem => {
      elem.classList.remove('show', 'hide');

      var weekID = elem.children[0].getAttribute('id');
      weekID = weekID.replace('-planning', ''); weekID = weekID.replace('-overview', '');
      if (weekID === clickedWeek) {
        elem.classList.add('show');
      } else {
        elem.classList.add('hide');
      }
    });

    if (containerName === "planning-container") {
      planningIntro.parentElement.classList.add('show');
    }
  }

  function ValidateRSVP(auth, button, isRsvp) {
    setTimeout(function () {
      //Get info from elements
      var row = button.parentElement.parentElement;
      var dayAndTime = row.children[0].textContent.split('/');
      var groupID = button.getAttribute('data-groupID');
      var week = button.getAttribute('data-week');
      var guests = row.children[3].children[0].children[1];

      if (isRsvp === true) {
        guests.nextElementSibling.classList.remove('hide');
        guests.previousElementSibling.classList.remove('hide');
        guests.value = 0;

        //Remove day from user schedule in db
        set(ref_db(database, 'Users/' + auth?.currentUser.uid + '/Schedule/' + week + '/' + dayAndTime[0]), {
          GroupID: null,
          Guests: null,
          Time: null,
        })
          .then(() => {
            button.classList.remove('button-onClick');
            button.classList.add('rsvp-validate');
            setTimeout(ApproveRSVP(button, isRsvp), 450);
          })
          .catch((error) => {
            guests.nextElementSibling.classList.remove('hide');
            guests.previousElementSibling.classList.remove('hide');
            button.classList.remove('button-onClick');
            console.log(error.code + ": " + error.message);
          });
      } else {
        guests.nextElementSibling.classList.add('hide');
        guests.previousElementSibling.classList.add('hide');

        //Update user Schedule in db
        set(ref_db(database, 'Users/' + auth?.currentUser.uid + '/Schedule/' + week + '/' + dayAndTime[0]), {
          GroupID: groupID,
          Guests: guests.value,
          Time: dayAndTime[1]
        })
          .then(() => {
            button.classList.remove('button-onClick');
            button.classList.add('rsvp-validate');
            setTimeout(ApproveRSVP(button, isRsvp), 450);
          })
          .catch((error) => {
            guests.nextElementSibling.classList.remove('hide');
            guests.previousElementSibling.classList.remove('hide');
            button.classList.remove('button-onClick');
            console.log(error.code + ": " + error.message);
          });
      }
    }, 1250);
  }

  function ApproveRSVP(button, isRsvp) {
    setTimeout(function () {
      if (isRsvp === true) {
        button.classList.remove('rsvp-cancel-button');
        button.parentElement.parentElement.children[2].textContent = "Not Going";
      } else {
        button.classList.add('rsvp-cancel-button');
        button.parentElement.parentElement.children[2].textContent = "Going";
      }
      button.classList.remove('rsvp-validate');
    }, 1250);
  }

  function GuestDown(elem) {
    var input = elem.nextElementSibling;
    var value = parseInt(input.value, 10);
    if (value >= 1) {
      value = isNaN(value) ? 0 : value;
      value--;
      input.value = value;
    }
  }

  function GuestUp(elem) {
    var input = elem.previousElementSibling;
    var value = parseInt(input.value, 10);
    value = isNaN(value) ? 0 : value;
    if (value < 10) {
      value++;
      input.value = value;
    }
  }

  //#endregion Click Functions
});