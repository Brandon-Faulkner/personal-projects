// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref as ref_db, onValue, set, remove, update, get, increment } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { getStorage, ref as ref_st, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, sendPasswordResetEmail, EmailAuthProvider, linkWithCredential, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNmzs6isOjHTVJq0YM7HGLxBrJ4d22sf8",
  authDomain: "cana-cam.firebaseapp.com",
  databaseURL: "https://cana-cam-default-rtdb.firebaseio.com",
  projectId: "cana-cam",
  storageBucket: "cana-cam.appspot.com",
  messagingSenderId: "587415518534",
  appId: "1:587415518534:web:0a62871e35785219bc3947",
  measurementId: "G-FQMB5KD4NX"
};

// Initialize Firebase, Database and Authentication
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const groupRef = ref_db(database, "Groups/");
const planRef = ref_db(database, "GroupsInfo/");
const storage = getStorage(app);
const auth = getAuth(app);
const messaging = getMessaging(app);

window.addEventListener('load', () => {
  // Ensure that the browser supports the service worker API then register it
  var registration = null;
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('service-worker.js').then(reg => {
      registration = reg;
      console.log('Service Worker Registered');
    }).catch(swErr => console.log(`Service Worker Installation Error: ${swErr}}`));
  }

  //#region Variables
  // Main Elements used before & after login
  const mainLoader = document.getElementById('loader');
  const loginScreen = document.getElementById('login-page');
  const loginCloseBtn = document.getElementById('login-close-btn');
  const loginText = document.querySelector(".login-title-text .login");
  const loginForm = document.querySelector("form.login");
  const loginFormContainer = document.getElementById('login-form-container');
  const loginToggleBtn = document.querySelector("label.login");
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const loginForgotPassword = document.getElementById('login-forgot-password');
  const loginButton = document.getElementById('login-button');

  const forgotPassContainer = document.getElementById('forgot-pass-container');
  const forgotPassEmail = document.getElementById('forgot-pass-email');
  const forgotPassBtn = document.getElementById('forgot-pass-button');

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

  const toastElem = document.querySelector('.toast');
  const toastMessage = document.querySelector('.toast-message');
  const toastProgress = document.querySelector('.toast-progress');
  const toastClose = document.querySelector('.toast .close');

  const mainScreen = document.getElementById('main-page');

  const tabPlanning = document.getElementById('tab-planning');
  const planningBlocked = document.getElementById('planning-blocked');
  const planningIntro = document.getElementById('tab-planning-intro');
  const planningImg = document.getElementById('planning-image');
  const planningWeekSelectParent = document.getElementById('plan-week-select-grid');
  const hostSelection = document.getElementById('host-selection');
  const planWeekSelection = document.getElementById('plan-week-selection');
  const planWeekHolder = document.getElementById('plan-week-holder');

  const tabOverview = document.getElementById('tab-overview');
  const overviewWeekSelection = document.getElementById('over-week-selection');
  const overviewWeekHolder = document.getElementById('overview-week-holder');

  const tabProfile = document.getElementById('tab-profile');
  const profileBlocked = document.getElementById('profile-blocked');
  const profileInfo = document.getElementById('profile-info');
  const chatScreen = document.getElementById('chat-page');
  const chatCloseBtn = document.getElementById('chat-close-btn');
  const chatHostsList = document.getElementById('chat-host-list');
  const chatHosts = document.getElementById('chat-hosts');
  const chatView = document.getElementById('chat-view');
  const chatLoader = document.getElementById('chat-loader');
  const chatHostProf = document.getElementById('chat-host-profile');
  const chatMessages = document.getElementById('chat-messages');
  const chatMessageInput = document.getElementById('chat-msg-input');
  const chatSendBtn = document.getElementById('chat-send-btn');

  //Array to hold the data of each week
  var allWeeksArr = []; var uniqWeeks = [];
  //Arrays to hold group information
  var groupInfoArr = [], hostNameArr = [], userScheduleArr = [];
  //Values to register swipe actions
  var touchStartX = 0; var touchEndX = 0;
  //Used to determine if Forgot Password Page is open
  var forgPass = false;
  //Locally keep track of total RSVP days for user
  var userTotalRSVP = 0;

  function Loading(loaderElem, show) {
    if (show) {
      //Show loading indicator
      if (!loaderElem.classList.contains('fadeIn')) {
        loaderElem.classList.remove('fadeOut');
        loaderElem.classList.add('fadeIn');
      }
    }
    else {
      setTimeout(() => {
        //Remove loading indicator
        if (loaderElem.classList.contains('fadeIn')) {
          loaderElem.classList.remove('fadeIn');
          loaderElem.classList.add('fadeOut');
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
        ClearLoginAndSignupInputs();
        RemoveOldWeeksFromGroups(groupRef);
        OverviewSetup(groupRef, user?.isAnonymous);

        //Add listeners
        tabPlanning.addEventListener('click', ShowLogin);
        tabProfile.addEventListener('click', ShowLogin);
        loginCloseBtn.addEventListener('click', ShowLogin);
      }
      else {
        //Signed in with Account
        RemoveOldWeeksFromGroups(groupRef);
        RemoveOldWeeksFromUser(auth);
        OverviewSetup(groupRef, user?.isAnonymous);

        // Show message notif to user when recieved on the foreground
        onMessage(messaging, (payload) => {
          //Only show notif if the user does not have the chat view from the host open
          if (!chatScreen.classList.contains('show')) {
            //Need to show notif, badge, status
            ShowNotifToast(payload.data.title, "View message in profile.");

            //Update status
            var chatHostsArr = Array.from(chatHosts.children);
            var msgTitle = payload.data.title.replace(" replied", "");
            chatHostsArr.forEach((host) => {
              var hostName = host.getAttribute('id').replace("-chat", "");
              if (hostName === msgTitle) {
                host.children[2].classList.add('new-msg');
              }
            });

            //Show badges
            const messagesBtn = document.getElementById('messages-button');
            messagesBtn.setAttribute('data-notif', '!');
            const tabProfileLabel = document.querySelector('.tabs-ul .new-msg-notif label');
            tabProfileLabel.setAttribute('data-notif', "!");

          } else if (chatView.classList.contains('fadeInChat')) {
            //Only need to create message bubble
            CreateMessageBubble(chatMessages, payload.data.body, "left");
          } else {
            //Need to show notif, status
            ShowNotifToast(payload.data.title, "View message in profile.");

            //Update status and order of hosts
            var chatHostsArr = Array.from(chatHosts.children);
            var msgTitle = payload.data.title.replace(" replied", "");
            chatHostsArr.forEach((host) => {
              var hostName = host.getAttribute('id').replace("-chat", "");
              if (hostName === msgTitle) {
                host.children[2].classList.add('new-msg');
                chatHosts.appendChild(host);
              }
            });
            //Now move the rest to end of list to make them on bottom
            chatHostsArr.forEach((host) => {
              if (!host.children[2].classList.contains('new-msg')) {
                chatHosts.appendChild(host);
              }
            });
          }
        });

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
    if (forgPass === true) {
      if (forgotPassContainer.classList.contains('hide')) {
        loginFormContainer.classList.add('hide');
        forgotPassContainer.classList.remove('hide');
      } else {
        loginFormContainer.classList.remove('hide');
        forgotPassContainer.classList.add('hide');
        forgPass = false;
      }
    } else {
      if (!loginScreen.classList.contains('show')) {
        loginScreen.classList.add('show');
        mainScreen.classList.add('disable-click');
      }
      else {
        loginScreen.classList.remove('show');
        mainScreen.classList.remove('disable-click');
        ClearLoginAndSignupInputs();
      }
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
        //Upload prof pic to storage
        const metaData = { cacheControl: 'public,max-age=604800', };
        const userStoreRef = ref_st(storage, "Users/" + usercred.user.uid + "/" + imgName);
        uploadBytes(userStoreRef, img, metaData)
          .then(() => {
            //Upload user data to db
            set(ref_db(database, 'Users/' + usercred.user.uid), {
              Image: imgName,
              Name: name,
              Phone: phone,
              "Total RSVP'd": 0,
            })
              .then(() => {
                //Signed in with Account
                OverviewSetup(groupRef, usercred.user?.isAnonymous);

                //Remove listeners
                tabPlanning.removeEventListener('click', ShowLogin);
                tabProfile.removeEventListener('click', ShowLogin);
                loginCloseBtn.removeEventListener('click', ShowLogin);
              });
          });
      }).catch((error) => {
        console.log("Error upgrading anonymous account:", error);
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

  function SendForgotPasswordEmail(auth, email) {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        //Email sent
        console.log("yay");
      })
      .catch((error) => {
        console.log("Error with Forgot Password: ", error);
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

  loginForgotPassword.addEventListener('click', function () {
    forgPass = true;
    ShowLogin();
  });

  forgotPassBtn.addEventListener('click', function (e) {
    e.preventDefault(0);
    const email = forgotPassEmail.value.trim();
    SendForgotPasswordEmail(auth, email);
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
    signupImg.parentElement.setAttribute("data-text", "Upload Profile Picture");
    const fileError = document.getElementById('file-error');
    fileError.classList.add('hide');

    if (signupImg.files.length > 0) {
      const fileSize = signupImg.files.item(0).size;
      const fileMb = fileSize / 1024 ** 2;
      if (fileMb >= 2) {
        //Bad
        fileError.children[0].textContent = "Please select a file less than 2MB.";
        fileError.classList.remove('hide');
      } else {
        //Good
        signupImg.parentElement.setAttribute("data-text", signupImg.value.replace(/.*(\/|\\)/, ''));
      }
    }
  });

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

  function ClearLoginAndSignupInputs() {
    //Login
    loginEmail.value = null;
    loginPassword.value = null;

    //Sign up
    signupName.value = null;
    signupPhone.value = null;
    signupEmail.value = null;
    signupPassword.value = null;
    signupConfirmPass.value = null;
    signupImg.value = null;
    signupImg.parentElement.setAttribute("data-text", "Upload Profile Picture");
  }
  //#endregion Login Functions

  //#region Remove Old Weeks
  function RemoveOldWeeksFromGroups(groupRef) {
    onValue(groupRef, (snapshot) => {
      snapshot.forEach((group) => {
        group.child("Weeks").forEach((week) => {
          const decodedWeek = decodeURIComponent(week.key);
          const splitWeekDates = decodedWeek.split('-');
          const beginWeekDate = new Date(splitWeekDates[0]);//.toLocaleDateString('en', {month: 'numeric', day: '2-digit', year: '2-digit'});
          const endWeekDate = new Date(splitWeekDates[1]);
          const currentDate = new Date();

          //If the entire week has passed
          if (endWeekDate.getTime() < currentDate.getTime()) {
            remove(ref_db(database, 'Groups/' + group.key + '/Weeks/' + week.key));
          } else {
            const sorter = { "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6 };
            //Week is still valid, check if individual days have passed and remove
            week.forEach((day) => {
              const tempBeginDate = new Date(beginWeekDate);
              tempBeginDate.setDate(tempBeginDate.getDate() + sorter[day.key]); AddTimeToDate(day.val(), tempBeginDate);
              if (tempBeginDate.getTime() < currentDate.getTime()) {
                remove(ref_db(database, 'Groups/' + group.key + '/Weeks/' + week.key + '/' + day.key));
              }
            });
          }
        });
      });
    }, {
      onlyOnce: true
    });
  }

  function AddTimeToDate(time, date) {
    //Check for AM or PM
    if (time.includes('PM')) {
      time = time.replace('PM', '');

      //Split hours and minutes
      var hoursAndMin = time.split(':');
      date.setHours(parseInt(hoursAndMin[0]) + 12, hoursAndMin[1]);
    } else {
      time = time.replace('AM', '');

      //Split hours and minutes
      var hoursAndMin = time.split(':');
      date.setHours(hoursAndMin[0], hoursAndMin[1]);
    }
  }

  function RemoveOldWeeksFromUser(auth) {
    onValue(ref_db(database, 'Users/' + auth?.currentUser.uid), (snapshot) => {
      snapshot.child('Schedule').forEach((week) => {
        const decodedWeek = decodeURIComponent(week.key);
        const splitWeekDates = decodedWeek.split('-');
        const beginWeekDate = new Date(splitWeekDates[0]);//.toLocaleDateString('en', {month: 'numeric', day: '2-digit', year: '2-digit'});
        const endWeekDate = new Date(splitWeekDates[1]);
        const currentDate = new Date();

        //If the entire week has passed
        if (endWeekDate.getTime() < currentDate.getTime()) {
          remove(ref_db(database, 'Users/' + auth?.currentUser.uid + '/Schedule/' + week.key));
        } else {
          const sorter = { "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6 };
          //Week is still valid, check if individual days have passed and remove
          week.forEach((day) => {
            const tempBeginDate = new Date(beginWeekDate);
            tempBeginDate.setDate(tempBeginDate.getDate() + sorter[day.key]); AddTimeToDate(day.child('Time').val(), tempBeginDate);
            if (tempBeginDate.getTime() < currentDate.getTime()) {
              remove(ref_db(database, 'Users/' + auth?.currentUser.uid + '/Schedule/' + week.key + '/' + day.key));
            }
          });
        }
      });
    }, {
      onlyOnce: true
    });
  }

  //#endregion Remove Old Weeks

  //#region Overview Setup
  function OverviewSetup(groupRef, isAnonymous) {
    onValue(groupRef, (snapshot) => {
      //Clear arrays to not have duplicate data
      allWeeksArr = []; uniqWeeks = []; hostNameArr = [];

      Loading(mainLoader, true);

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
    weekArr.sort(function sortByTime(a, b) {
      return new Date('1970/01/01 ' + a.time) - new Date('1970/01/01 ' + b.time);
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
        row.className = "table-row clickable-row"; row.setAttribute('id', elem.group + '-' + elem.week + '-' + elem.day);

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
      onValue(ref_db(database, 'Users/' + auth?.currentUser.uid), (snapshot) => {
        loginScreen.classList.remove('show');
        mainScreen.classList.remove('disable-click');
        profileBlocked.classList.add('hide');
        profileInfo.parentElement.classList.remove('hide');
        Loading(mainLoader, true);

        const userImage = snapshot.child("Image").val();
        const userName = snapshot.child("Name").val();
        const userEmail = auth?.currentUser.email;
        const userPhone = snapshot.child("Phone").val();
        userTotalRSVP = snapshot.child("Total RSVP'd").val();

        //Clear userScheduleArr to avoid duplicates
        userScheduleArr = [];

        //Now update their schedule for each week
        snapshot.child("Schedule").forEach((week) => {
          week.forEach((day) => {
            const dayKey = day.key.split('-'); //Monday-1
            const weekDay = { week: decodeURIComponent(week.key), day: dayKey[0], time: day.child('Time').val(), guests: day.child('Guests').val(), group: day.child('GroupID').val() };
            userScheduleArr.push(weekDay);
            AddOrRemoveNotifBadge(weekDay.group + '-' + weekDay.week + '-' + weekDay.day, 'RSVP\'d', 'add');
          });
        });

        getDownloadURL(ref_st(storage, "Users/" + auth?.currentUser.uid + "/" + userImage))
          .then((url) => {
            //Clear current elements from profile section
            profileInfo.replaceChildren();

            CreateProfileHeader(profileInfo, url);
            CreatProfileInfoRow(profileInfo, userName, userEmail, userPhone, userTotalRSVP);

            //Setup planning tab and wait till completion to setup chat hosts
            PlanningSetup(planRef, isAnonymous, 'Group 1', userScheduleArr, null);
            //Setup each host in Contact Host section
            chatHosts.replaceChildren();
            hostNameArr.forEach((host) => {
              ChatHostsSetup(chatHosts, host.host);
            });
            Loading(mainLoader, false);
          })
          .catch((error) => {
            console.log(error);
          });
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

    var profCol2 = document.createElement('div'); profCol2.className = "profile-col"; profCol2.style = "padding-top: 10px; display: inline-flex; justify-content: center;";
    var profSignOut = document.createElement('button'); profSignOut.setAttribute('id', 'signout-button'); profSignOut.className = "signout-button";
    var profSignOutIcon = document.createElement('i'); profSignOutIcon.className = "fa-solid fa-right-from-bracket"; profSignOut.appendChild(profSignOutIcon);
    profCol2.appendChild(profSignOut);
    var profMessages = document.createElement('button'); profMessages.setAttribute('id', 'messages-button'); profMessages.className = "messages-button";
    var profMessagesIcon = document.createElement('i'); profMessagesIcon.className = "fa-solid fa-message"; profMessages.appendChild(profMessagesIcon); profMessages.innerHTML += "Messages";
    profCol2.appendChild(profMessages); profileHeader.appendChild(profCol2);

    parentElem.appendChild(profileHeader);
  }

  function CreatProfileInfoRow(parentElem, userName, userEmail, userPhone, userTotalRSVP) {
    var profileRow = document.createElement('li');
    profileRow.className = "profile-row";

    var title = document.createElement('h2'); title.textContent = "Your Information"; profileRow.appendChild(title);
    var name = document.createElement('h3'); name.textContent = userName; name.className = "prof-info"; name.setAttribute('data-label', 'Name:'); profileRow.appendChild(name);
    var email = document.createElement('h3'); email.textContent = userEmail; email.className = "prof-info"; email.setAttribute('data-label', 'Email:'); profileRow.appendChild(email);
    var phone = document.createElement('h3'); phone.textContent = userPhone; phone.className = "prof-info"; phone.setAttribute('data-label', 'Phone:'); profileRow.appendChild(phone);
    var days = document.createElement('h3'); days.textContent = userTotalRSVP; days.className = "prof-info"; days.setAttribute('data-label', 'Total Days RSVP\'d:'); days.setAttribute('id', 'user-total-rsvp'); profileRow.appendChild(days);
    var editButton = document.createElement('button'); editButton.className = "editinfo-button";
    var editIcon = document.createElement('i'); editIcon.className = "fa-solid fa-pen-to-square"; editButton.appendChild(editIcon); profileRow.appendChild(editButton);

    parentElem.appendChild(profileRow);
  }

  //Messages
  function ChatHostsSetup(parentElem, host) {
    var hostDiv = document.createElement('div'); hostDiv.classList.add('chat-host'); hostDiv.setAttribute('id', host + '-chat');

    var hostIcon = document.createElement('i'); hostIcon.className = "fa-circle-user"; hostDiv.appendChild(hostIcon);
    var hostName = document.createElement('p'); var nameText = document.createElement('strong'); nameText.textContent = host; hostName.appendChild(nameText); hostDiv.appendChild(hostName);

    var notifStatus = document.createElement('div'); notifStatus.classList.add('status'); notifStatus.setAttribute('id', host + '-status'); hostDiv.appendChild(notifStatus);

    parentElem.appendChild(hostDiv);
  }

  function CreateMessageBubble(parentElem, msg, side) {
    var mainDiv = document.createElement('div'); side === "right" ? mainDiv.className = "message right" : mainDiv.className = "message";

    var bubble = document.createElement('div'); bubble.className = "bubble"; bubble.textContent = msg;
    var bubbleCorner = document.createElement('div'); bubbleCorner.className = "corner-" + side; bubble.appendChild(bubbleCorner);
    //var timeStamp = document.createElement('span'); timeStamp.textContent = msg.timestamp; bubble.appendChild(timeStamp);
    mainDiv.appendChild(bubble);
    parentElem.appendChild(mainDiv);
    mainDiv.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
  }

  chatCloseBtn.addEventListener('click', function () {
    if (chatView.classList.contains('fadeInChat')) {
      chatView.classList.add('fadeOut');
      chatView.classList.remove('fadeInChat');
      chatHostsList.classList.add('fadeInChat');
      chatHostsList.classList.remove('fadeOut');
    } else {
      chatScreen.classList.remove('show');
      chatMessageInput.value = null;
    }
  });

  chatSendBtn.addEventListener('click', function () {
    //Send message using update from firebase, clear input, create the message bubble
    const messageContent = chatMessageInput.value.trim();
    const hostName = chatHostProf.children[0].textContent;

    if (messageContent != null && messageContent.length > 0) {
      const sendMessage = {};
      sendMessage['UsersMessages/' + hostName + '/' + auth?.currentUser.uid + '/UserMsgs/' + Date.now()] = messageContent;
      update(ref_db(database), sendMessage).then(() => {
        CreateMessageBubble(chatMessages, messageContent, "right");
        chatMessageInput.value = null;
      });
    }
  });

  function SetupMessagingRequirements(auth, reg) {
    if (auth?.currentUser.isAnonymous === false && ('Notification' in window)) {
      getToken(messaging, { serviceWorkerRegistration: reg, vapidKey: "BPN_vJi33qNLzcxQdUGrfBckm5ONtGrKXgtJqDmIWBuLNjQbT79i8eBYFoFUHffm-93MieygaJm6_fCfQKH5tAM" })
        .then((currentToken) => {
          if (currentToken) {
            //Send to db
            const updateUserToken = {};
            updateUserToken["Users/" + auth?.currentUser.uid + "/notifToken"] = currentToken;
            update(ref_db(database), updateUserToken);
          } else {
            //Show notification request
            if (!("Notification" in window)) {
              console.log("This browser does not support notifications.");
            } else if (checkNotificationPromise()) {
              Notification.requestPermission().then((result) => {
                if (result === 'granted') {
                  SetupMessagingRequirements(auth, reg);
                }
              });
            } else {
              Notification.requestPermission((permission) => {
                if (Notification.permission === 'granted') {
                  SetupMessagingRequirements(auth, reg);
                }
              })
            }
          }
        }).catch((error) => {
          console.log('An error occurred while retrieving token. ', error);
        });
    }
  }

  function checkNotificationPromise() {
    try {
      Notification.requestPermission().then();
    } catch (error) {
      return false;
    }

    return true;
  }
  //#endregion Profile Setup

  //#region Planning Setup
  function PlanningSetup(planRef, isAnonymous, groupID, userScheduleArr, clickedWeek) {
    if (isAnonymous) {
      planningBlocked.classList.remove('hide');
      planningIntro.parentElement.classList.add('hide');
      planningWeekSelectParent.classList.add('hide');
      planWeekHolder.replaceChildren();
      Loading(mainLoader, false);
    } else {
      onValue(planRef, (snapshot) => {
        loginScreen.classList.remove('show');
        mainScreen.classList.remove('disable-click');
        planningBlocked.classList.add('hide');
        planningIntro.parentElement.classList.remove('hide');
        planningWeekSelectParent.classList.remove('hide');
        Loading(mainLoader, true);

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
            if (clickedWeek === null) clickedWeek = uniqWeeks[0];
            ShowEventContainers(clickedWeek, 'planning-container');
            Loading(mainLoader, false);
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
    const hostName = hostNameArr.find(h => h.group === groupID).host;
    parentElem.children[0].children[1].textContent = hostName;
    parentElem.children[0].children[2].textContent = groupInfoArr.find(g => g.group === groupID).description;
    parentElem.children[0].children[3].setAttribute("data-host", hostName);

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
    var headerDiv4 = document.createElement('div'); headerDiv4.className = "col"; headerDiv4.textContent = "I'm Going"; tableHeader.appendChild(headerDiv4);
    var headerDiv5 = document.createElement('div'); headerDiv5.className = "col"; headerDiv5.textContent = "Friends"; tableHeader.appendChild(headerDiv5);
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

    var col4 = document.createElement('div'); col4.className = "col"; col4.setAttribute('data-label', "Friends:");
    var counter = document.createElement('div'); counter.className = "counter";
    var minus = document.createElement('span'); minus.className = "guest-down"; var minusIcon = document.createElement('i'); minusIcon.className = "fa-solid fa-minus"; minus.appendChild(minusIcon);
    var counterInput = document.createElement('input'); counterInput.setAttribute("id", "counter-input-" + Math.floor(Math.random() * 100000)); counterInput.setAttribute("type", "text"); counterInput.value = 0;
    var plus = document.createElement('span'); plus.className = "guest-up"; var plusIcon = document.createElement('i'); plusIcon.className = "fa-solid fa-plus"; plus.appendChild(plusIcon);

    var col5 = document.createElement('div'); col5.className = "col"; col5.setAttribute('data-label', "I'm Going:");
    var rsvp = document.createElement('button'); rsvp.className = "rsvp-button"; rsvp.setAttribute('data-groupID', groupID); rsvp.setAttribute('data-week', elem.week); rsvp.setAttribute('data-day', elem.day);

    //Check schedule
    if (userScheduleArr != null) {
      userScheduleArr.forEach((userDay) => {
        if (elem.day === userDay.day && elem.time === userDay.time) {
          col3.textContent = "Going";
          minus.classList.add('hide'); plus.classList.add('hide');
          counterInput.value = userDay.guests;
          rsvp.classList.add('rsvp-cancel-button');
        }
      });
    }

    //TESTING NEW LAYOUT *****************************
    //Switching Col4 and Col5
    //Add elements to row then to parent
    row.appendChild(col3);
    col5.appendChild(rsvp); row.appendChild(col5);
    counter.appendChild(minus); counter.appendChild(counterInput); counter.appendChild(plus); col4.appendChild(counter); row.appendChild(col4);

    parentElem.appendChild(row);
  }
  //#endregion Planning Setup

  //#region Week Menu Dropdown
  function SetupDropdowns(select, optionsArr, isHostArr) {
    let mainBtn = select.children[0],
      dropdownTitle = mainBtn.children[0],
      dropdownList = select.children[1].children[0].children[0];

    //Create List item options
    dropdownList.replaceChildren(); var index = 0;
    optionsArr.forEach((elem) => {
      var li = document.createElement('li'); li.className = "dropdown-list-item";
      var btn = document.createElement('button'); btn.className = "dropdown-button list-button"; btn.setAttribute('data-translate-value', (100 * index) + "%");
      var span = document.createElement('span'); span.className = "text-truncate"; span.textContent = isHostArr === true ? elem.host : elem;
      btn.appendChild(span); li.appendChild(btn);
      dropdownList.appendChild(li);

      index++;
    });

    dropdownTitle.textContent = isHostArr === true ? optionsArr[0].host : optionsArr[0];

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
    const menu = e.target.closest('.dropdown-container');
    const allMenus = document.querySelectorAll('.dropdown-container');

    if (menu) {
      if (!menu.children[1].classList.contains('open')) {
        menu.children[1].classList.add('open');
        menu.children[0].children[1].classList.add('flip-arrow');

        //Close other menus 
        allMenus.forEach(function (otherMenu) {
          if (menu != otherMenu) {
            otherMenu.children[1].classList.remove('open');
            otherMenu.children[0].children[1].classList.remove('flip-arrow');
          }
        });
      } else {
        menu.children[1].classList.remove('open');
        menu.children[0].children[1].classList.remove('flip-arrow');
      }
    } else {
      allMenus.forEach(function (menu) {
        menu.children[1].classList.remove('open');
        menu.children[0].children[1].classList.remove('flip-arrow');
      });
    }

    const li = e.target.closest('.dropdown-list-item');

    if (li) {
      const liParent = li.parentNode.parentNode.parentNode.parentNode;
      const clickedText = li.children[0].children[0].textContent;

      //Make sure it is not the already selected item
      if (liParent.children[0].children[0].textContent != clickedText) {
        if (liParent === overviewWeekSelection || liParent === planWeekSelection) {
          DropdownSelection(clickedText, overviewWeekSelection, auth);
          DropdownSelection(clickedText, planWeekSelection, auth);

          // Switch Event Containers based on selection
          ShowEventContainers(clickedText, "planning-container");
          ShowEventContainers(clickedText, "overview-container");
        }
        else {
          const selectedWeek = document.getElementById('plan-week-selection');
          DropdownSelection(clickedText, hostSelection, auth, selectedWeek.children[0].children[0].textContent);
        }
      }
    }

    //Clickable rows
    const row = e.target.closest('.clickable-row');

    if (row) {
      var liTarget = row.children[2].textContent;
      const selectedWeek = document.getElementById('over-week-selection');
      DropdownSelection(liTarget, hostSelection, auth, selectedWeek.children[0].children[0].textContent);
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

    if (signOutButton) { signOutButton.classList.add('button-onClick'); SignOutUser(auth); }

    //Messages & Contact button 
    var messagesButton = e.target.closest('.messages-button');
    var contactButton = e.target.closest('.contact-button');

    if (messagesButton || contactButton) {
      SetupMessagingRequirements(auth, registration);
      SortChatHostsAndRemoveBadge(messagesButton);

      if (!chatScreen.classList.contains('show')) {
        chatScreen.classList.add('show');
        if (contactButton) {
          tabProfile.click();
          ShowChatScreen(contactButton.getAttribute('data-host'));
        }
      }
    }

    //Host Contact From Messages
    const hostContact = e.target.closest('.chat-host');

    if (hostContact) {
      //Remove new msg status
      hostContact.children[2].classList.remove('new-msg');
      SortChatHostsAndRemoveBadge(null);
      ShowChatScreen(hostContact.children[1].children[0].textContent);
    }
  });

  document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  });

  document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    SwitchTabOnSwipe();
  });

  function SwitchTabOnSwipe() {
    //Make sure no pop ups or overlays are being shown first
    if (!loginScreen.classList.contains('show') && mainLoader.classList.contains('fadeOut') && !chatScreen.classList.contains('show')) {
      if (touchEndX < touchStartX && (touchStartX - touchEndX) > 50) {
        if (tabPlanning.checked === true) {
          tabOverview.click();
        } else if (tabOverview.checked === true) {
          tabProfile.click();
        }
      }
      if (touchEndX > touchStartX && (touchEndX - touchStartX) > 50) {
        if (tabProfile.checked === true) {
          tabOverview.click();
        } else if (tabOverview.checked === true) {
          tabPlanning.click();
        }
      }
    }
  }

  function SortChatHostsAndRemoveBadge(messagesButton) {
    if (!messagesButton) {
      messagesButton = document.getElementById('messages-button');
    }
    
    //Sort the hosts by new-msg status
    var chatHostsArr = Array.from(chatHosts.children);

    var isNewMsgs = false;
    //First Move hosts with new msg status to end of list
    chatHostsArr.forEach((host) => {
      if (host.children[2].classList.contains('new-msg')) {
        chatHosts.appendChild(host);
        isNewMsgs = true;
      }
    });

    //Remove notif badges if no new messages
    if (isNewMsgs === false) {
      messagesButton.removeAttribute('data-notif');
      const tabProfileLabel = document.querySelector('.tabs-ul .new-msg-notif label');
      tabProfileLabel.removeAttribute('data-notif');
    }

    //Now move the rest to end of list to make them on bottom
    chatHostsArr.forEach((host) => {
      if (!host.children[2].classList.contains('new-msg')) {
        chatHosts.appendChild(host);
      }
    });
  }

  function ShowChatScreen(hostName) {
    Loading(chatLoader, true);
    const chatHostName = chatHostProf.children[0];

    //First reset everything
    chatView.classList.remove('fadeInChat', 'fadeOut');
    chatHostsList.classList.remove('fadeInChat', 'fadeOut');
    chatHostName.classList.remove('fadeInChat', 'fadeOut');
    chatHostProf.classList.remove('fadeInChat', 'fadeOut');

    //Start hiding and showing the correct elems
    setTimeout(() => {
      chatHostName.classList.add('fadeInChat');
      chatHostProf.classList.add('fadeInChat');
    }, 100);

    setTimeout(() => {
      chatMessages.classList.add('animate');
    }, 150);

    chatHostName.textContent = hostName;
    chatHostsList.classList.add('fadeOut');
    chatView.style.display = 'inline-grid'; chatView.classList.add('fadeInChat');

    //Get messages from db and Update UI
    get(ref_db(database, 'UsersMessages/' + hostName + '/' + auth?.currentUser.uid + '/')).then((snapshot) => {
      chatMessages.replaceChildren();
      if (snapshot.size > 0) {
        //Host messages
        const hostMsgs = [];
        snapshot.child('HostMsgs').forEach((msg) => {
          hostMsgs.push({ timestamp: msg.key, message: msg.val(), side: "left" });
        });

        //User messages
        const userMsgs = [];
        snapshot.child('UserMsgs').forEach((msg) => {
          userMsgs.push({ timestamp: msg.key, message: msg.val(), side: "right" });
        });

        //Merge the two arrays together in order
        const mergedMsgs = [];
        var index1, index2 = Math.min(hostMsgs.length, userMsgs.length);

        for (index1 = 0; index1 < index2; index1++) {
          mergedMsgs.push(userMsgs[index1], hostMsgs[index1]);
        }

        mergedMsgs.push(...userMsgs.slice(index2), ...hostMsgs.slice(index2));

        var currentMsgsLabel = document.createElement('label');
        currentMsgsLabel.textContent = "Current Messages";
        chatMessages.appendChild(currentMsgsLabel);

        //Create message bubbles 
        mergedMsgs.forEach((msg) => {
          CreateMessageBubble(chatMessages, msg.message, msg.side);
        });
      } else {
        var noMsgsLabel = document.createElement('label');
        noMsgsLabel.textContent = "No Messages";
        chatMessages.appendChild(noMsgsLabel);
      }
      Loading(chatLoader, false);
    }).catch((error) => {
      console.log(error);
    });
  }

  function DropdownSelection(elemTarget, menu, auth, selectedWeek) {
    if (elemTarget != null) {
      menu.children[0].children[0].textContent = elemTarget;
      if (menu === hostSelection) {
        PlanningSetup(planRef, auth?.currentUser.isAnonymous, hostNameArr.find(h => h.host === elemTarget).group, userScheduleArr, selectedWeek);
      }
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
      var groupNum = groupID.split(' ')[1];
      var decodedWeek = button.getAttribute('data-week');
      var week = encodeURIComponent(decodedWeek);
      var guests = row.children[3].children[0].children[1];
      const updates = {};
      const totalRsvpElem = document.getElementById('user-total-rsvp');

      if (isRsvp === true) {
        guests.nextElementSibling.classList.remove('hide');
        guests.previousElementSibling.classList.remove('hide');
        guests.value = 0;

        //Remove day from user schedule in db
        set(ref_db(database, 'Users/' + auth?.currentUser.uid + '/Schedule/' + week + '/' + dayAndTime[0] + '-' + groupNum), {
          GroupID: null,
          Guests: null,
          Time: null,
        })
          .then(() => {
            //Subtract total day rsvp from user
            updates['Users/' + auth?.currentUser.uid + "/Total RSVP'd"] = increment(-1);
            update(ref_db(database), updates).then(() => {
              totalRsvpElem.textContent = --userTotalRSVP;
              button.classList.remove('button-onClick');
              button.classList.add('rsvp-validate');

              //Remove from userScheduleArr to keep data valid
              const scheduleIndex = userScheduleArr.findIndex(u => u.group === groupID && u.week === decodedWeek && u.day === dayAndTime[0] && u.time === dayAndTime[1]);
              if (scheduleIndex !== -1) userScheduleArr.splice(scheduleIndex, 1);
              setTimeout(ApproveRSVP(button, isRsvp), 450);
            });
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
        set(ref_db(database, 'Users/' + auth?.currentUser.uid + '/Schedule/' + week + '/' + dayAndTime[0] + '-' + groupNum), {
          GroupID: groupID,
          Guests: guests.value,
          Time: dayAndTime[1]
        })
          .then(() => {
            //Add total day rsvp from user
            updates['Users/' + auth?.currentUser.uid + "/Total RSVP'd"] = increment(1);
            update(ref_db(database), updates).then(() => {
              totalRsvpElem.textContent = ++userTotalRSVP;
              button.classList.remove('button-onClick');
              button.classList.add('rsvp-validate');

              //Add to userScheduleArr to keep data valid
              const scheduleDay = { week: decodedWeek, day: dayAndTime[0], time: dayAndTime[1], guests: guests.value, group: groupID };
              userScheduleArr.push(scheduleDay);
              setTimeout(ApproveRSVP(button, isRsvp), 450);
            });
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
      //Add or remove badge on clickable row in overview on the day of the RSVP      
      const groupID = button.getAttribute('data-groupID');
      const week = button.getAttribute('data-week');
      const day = button.getAttribute('data-day');

      if (isRsvp === true) {
        button.classList.remove('rsvp-cancel-button');
        button.parentElement.parentElement.children[2].textContent = "Not Going";
        AddOrRemoveNotifBadge(groupID + '-' + week + '-' + day, null, 'remove')
      } else {
        button.classList.add('rsvp-cancel-button');
        button.parentElement.parentElement.children[2].textContent = "Going";
        AddOrRemoveNotifBadge(groupID + '-' + week + '-' + day, 'RSVP\'d', 'add');
      }
      button.classList.remove('rsvp-validate');
    }, 1250);
  }

  function AddOrRemoveNotifBadge(idString, contentString, addOrRemove) {
    const elem = document.getElementById(idString);
    if (elem != null) {
      if (addOrRemove === 'add') {
        elem.setAttribute('data-badge', contentString);
      } else if (addOrRemove === 'remove') {
        elem.removeAttribute('data-badge');
      }
    }
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

  function ShowNotifToast(title, message) {
    //Reset just in case
    toastElem.classList.remove('active');
    toastProgress.classList.remove('active');

    //Update toast title
    toastMessage.children[0].textContent = title;
    toastMessage.children[1].textContent = message;

    //Now show the toast
    toastElem.classList.add('active');
    toastProgress.classList.add('active');

    setTimeout(() => {
      toastElem.classList.remove('active');
    }, 5000);

    setTimeout(() => {
      toastProgress.classList.remove('active');
    }, 5300);
  }

  toastClose.addEventListener('click', function () {
    toastElem.classList.remove('active');

    setTimeout(() => {
      toastProgress.classList.remove('active');
    }, 300);
  });
  //#endregion Click Functions
});