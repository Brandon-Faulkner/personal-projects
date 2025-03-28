// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref as ref_db, onValue, set, remove, update, get, increment } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { getStorage, ref as ref_st, getDownloadURL, uploadBytes, deleteObject } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { getAuth, onAuthStateChanged, reauthenticateWithCredential, signInAnonymously, sendEmailVerification, signInWithEmailAndPassword, updateEmail, sendPasswordResetEmail, EmailAuthProvider, linkWithCredential, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
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
  //Ensure that the browser supports the service worker API then register it
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
  const loadingErrorPage = document.getElementById('loading-error-page');
  const loadingErrorCloseBtn = document.getElementById("loading-error-close-btn");
  const loadingErrorReloadBtn = document.getElementById("reload-button");
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
  const aboutHelpBtn = document.getElementById('abouthelp-button');
  const aboutHelpPage = document.getElementById('abouthelp-page');
  const aboutToggleBtn = document.getElementById('abouthelp-slider-about');
  const helpToggleBtn = document.getElementById('abouthelp-slider-help');
  const aboutHelpAboutPage = document.getElementById('abouthelp-aboutpage');
  const aboutHelpHelpPage = document.getElementById('abouthelp-helppage');

  const dashboardPage = document.getElementById('dashboard-page');

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
  const chatSlider = document.getElementById('chat-slider');
  const chatSliderHosts = document.getElementById('chat-slider-hosts');
  const chatSliderUsers = document.getElementById('chat-slider-users');
  const chatView = document.getElementById('chat-view');
  const chatHostLoader = document.getElementById('chat-host-loader');
  const chatLoader = document.getElementById('chat-loader');
  const chatHostProf = document.getElementById('chat-host-profile');
  const chatMessages = document.getElementById('chat-messages');
  const chatMessageInput = document.getElementById('chat-msg-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const editInfoScreen = document.getElementById("editinfo-page");
  const editInfoCloseBtn = document.getElementById("editinfo-close-btn");
  const editInfoContentScreen = document.getElementById("editinfo-content");
  const editInfoCredentialScreen = document.getElementById("editinfo-credentials");
  const editInfoName = document.getElementById("editinfo-name");
  const editInfoPhone = document.getElementById("editinfo-phone");
  const editInfoCredEmail = document.getElementById("editinfo-credemail");
  const editInfoCredPass = document.getElementById("editinfo-credpass");
  const editInfoEmailBtn = document.getElementById("editinfo-updateemail-button");
  const editInfoEmail = document.getElementById("editinfo-email");
  const editInfoImg = document.getElementById("editinfo-img");
  const editInfoVerifyBtn = document.getElementById("editinfo-credsubmit-button");
  const editInfoSubmitBtn = document.getElementById("editinfo-submit-button");

  var isFirstLoad = true;
  //Array to hold the data of each week
  var allWeeksArr = []; var unsortedWeeksArr = []; var uniqWeeks = [];
  //Arrays to hold group information
  var groupInfoArr = [], hostNameArr = [], userScheduleArr = [], groupsCurrCapac = [];
  //Values to register swipe actions
  var touchStartX = 0, touchStartY = 0; var touchEndX = 0, touchEndY = 0;
  //Used to determine if Forgot Password Page is open
  var forgPass = false;
  //Locally keep track of total RSVP days for user & their name
  var userTotalRSVP = 0; var userFullName = null; var userUnreadChats = [];
  //Locally keep track of admin status
  var isAdmin = false; var adminGroup = null; var adminHostName = null; var adminHostInfoArr = [];
  var userNameArr = []; var hostWeeksArr = []; var rsvpdUsersArr = []; var adminNotifToken = null; var adminCapacity = null;
  //Used to stop user from recieving messages on an authChange state
  var unsubscribe = null;

  var loadingTimeout = null;
  function Loading(loaderElem, show) {
    if (show) {
      //Show loading indicator
      if (!loaderElem.classList.contains('fadeIn')) {
        loaderElem.classList.remove('fadeOut');
        loaderElem.classList.add('fadeIn');
      }

      if (loadingTimeout != null) clearTimeout(loadingTimeout);

      //Check to see if still loading after 10 seconds
      loadingTimeout = setTimeout(() => {
        if (loaderElem.classList.contains('fadeIn')) {
          loadingErrorPage.classList.add('show');
        }
      }, 10000);
    }
    else {
      setTimeout(() => {
        //Remove loading indicator
        if (loaderElem.classList.contains('fadeIn')) {
          loaderElem.classList.remove('fadeIn');
          loaderElem.classList.add('fadeOut');
          loadingErrorPage.classList.remove('show');
        }
      }, 500);
    }
  }

  loadingErrorCloseBtn.addEventListener('click', function () {
    if (loadingErrorPage.classList.contains('show')) {
      loadingErrorPage.classList.remove('show');
    }
  });

  loadingErrorReloadBtn.addEventListener('click', function () {
    window.location.reload();
  });
  //#endregion Variables

  //#region Authentication Functions
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Signed in Anonymously
      if (user?.isAnonymous) {
        ClearLoginAndSignupInputs();
        RemoveOldWeeksFromGroups(groupRef);

        planningBlocked.textContent = "You must be logged in to RSVP to the days you want to attend!";
        profileBlocked.textContent = "You must log in or sign up to view your profile!";

        //Reset admin vars and remove onMessage listener just incase
        isAdmin = false;
        adminGroup = null;
        adminHostName = null;
        userNameArr = [];
        unsubscribe === null ? null : unsubscribe();
        OverviewSetup(groupRef, user?.isAnonymous);

        //Add listeners
        tabPlanning.addEventListener('click', ShowLogin);
        tabProfile.addEventListener('click', ShowLogin);
        loginCloseBtn.addEventListener('click', ShowLogin);

        //If coming back from forgot password, open up login
        const currentUrl = window.location.href;
        const splitUrl = currentUrl.split('.app');
        if (splitUrl[1] === "/?forgPass=true") {
          tabProfile.click();
        }
      } else if (user?.emailVerified === false) {
        var actionCodeSettings = {
          url: 'https://cana-cam.web.app/?emailVerified=true'
        }
        sendEmailVerification(auth.currentUser, actionCodeSettings).then(() => {
          //User signed in but needs to verify email
          ShowNotifToast("Email Verification Is Needed", "We have sent you an email to verify your account so you can fully use this app. If you are not recieving the email, try refreshing the page or clearing your cache/cookies. If you still have issues, contact brandon@canachurch.com", "var(--blue)", false);
          ClearLoginAndSignupInputs();

          planningBlocked.textContent = "You must verify your email before fully using the app!";
          profileBlocked.textContent = "You must verify your email before fully using the app!";

          //Remove listeners
          tabPlanning.removeEventListener('click', ShowLogin);
          tabProfile.removeEventListener('click', ShowLogin);
          loginCloseBtn.removeEventListener('click', ShowLogin);

          //Only allow anonymous access
          OverviewSetup(groupRef, true);
        }).catch((error) => {
          //Email failed
          console.log(error.code + ": " + error.message);
          ShowNotifToast("Email Verification Error", "We tried sending you an email but there was an error. Please refresh the page and see if you get a valid notification.", "var(--red)", true, 15);
        });
      } else {
        //Check if coming back from verifying email
        const currentUrl = window.location.href;
        const splitUrl = currentUrl.split('.app');
        if (splitUrl[1] === "/?emailVerified=true") {
          ShowNotifToast("Thank You For Joining!", "Your email is now verified and you have full access to Cana CAM! If you need help or what to know more about what Cana CAM is, click the About/Help Button on the home page!", "var(--green)", true, 20);
        }

        //Signed in with Account
        RemoveOldWeeksFromGroups(groupRef);
        RemoveOldWeeksFromUser(auth);

        //Check users admin status, then setup pages
        CheckAdminStatus();

        //Show message notif to user when recieved on the foreground
        unsubscribe = onMessage(messaging, (payload) => {
          //Only show notif if the user does not have the chat view from the host open
          if (!chatScreen.classList.contains('show')) {
            //Need to show notif, badge, status
            ShowNotifToast(payload.data.title, "View message in profile.", "var(--blue)", true, 5);

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

            //Update unreadchats status
            userUnreadChats.push(payload.data.title.replace(" replied", ""));
            UpdateUnreadChatsStatus(payload.data.title.replace(" replied", ""), "add");

          } else if (chatView.classList.contains('fadeInChat') && chatHostProf.children[0].textContent === payload.data.title.replace(" replied", "")) {
            //Only need to create message bubble if the right convo is open
            CreateMessageBubble(chatMessages, payload.data.body, "left", payload.data.time);
          } else {
            //Need to show notif, status
            ShowNotifToast(payload.data.title, "View message in profile.", "var(--blue)", true, 5);

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

            //Update unreadchats status
            userUnreadChats.push(msgTitle);
            UpdateUnreadChatsStatus(msgTitle, "add");
          }
        }, error => {
          console.log(error.code + ": " + error.message);
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
        loginToggleBtn.click();
      }
      else {
        loginScreen.classList.remove('show');
        mainScreen.classList.remove('disable-click');
        ClearLoginAndSignupInputs();
        loginToggleBtn.click();
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

  function UpgradeAnonymous(auth, credential, img, imgName, name, phone, email) {
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
              Email: email,
              Phone: phone,
              "Total RSVP'd": 0,
            })
              .then(() => {
                //Signed in with Account
                SetupMessagingRequirements(auth, registration, true);

                //Remove listeners
                tabPlanning.removeEventListener('click', ShowLogin);
                tabProfile.removeEventListener('click', ShowLogin);
                loginCloseBtn.removeEventListener('click', ShowLogin);

                signupButton.parentElement.classList.remove('login-click');
              });
          });
      }).catch((error) => {
        console.log(error.code + ": " + error.message);
        signupButton.parentElement.classList.remove('login-click');
        ShowNotifToast('Account Creation Error', "We ran into an issue creating your account. Please try again or refresh the page and try again.", "var(--red)", true, 8);
      });
  }

  function SignInEmailAndPassword(auth, email, password) {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        loginText.textContent = "Welcome Back!";
        loginButton.parentElement.classList.remove('login-click');
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

    }).catch((error) => {
      console.log(error.code + ": " + error.message);
      ShowNotifToast("Sign Out Error", "There was an issue with signing you out. Please try again.", "var(--red)", true, 8);
    });
  }

  function SendForgotPasswordEmail(auth, email) {
    var actionCodeSettings = {
      url: 'https://cana-cam.web.app/?forgPass=true'
    }
    sendPasswordResetEmail(auth, email, actionCodeSettings)
      .then(() => {
        //Email sent
        ShowNotifToast("Email Sent", "An email has been sent to the provided email address that will allow you to reset your password.", "var(--blue)", true, 5);
      })
      .catch((error) => {
        console.log(error.code + ": " + error.message);
        if (error.code === "auth/invalid-email") {
          ShowNotifToast("Invalid Email", "The email address provided is an invalid email. Make sure there are no typos and that the email is correct.", "var(--red)", true, 8);
        } else if (error.code === "auth/user-not-found") {
          ShowNotifToast("Account Not Found", "There is not an existing account with that email address. Make sure there are no typos and that the email is correct.", "var(--red)", true, 8);
        } else {
          ShowNotifToast("Error Sending Email", "There was an error trying to send you a password reset email. Please try again or refresh the page and try again.", "var(--red)", true, 8);
        }
      });
  }

  function CheckAdminStatus() {
    var unsubFromRSVP = null;
    onValue(ref_db(database, 'Admins/' + auth?.currentUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        isAdmin = true;
        const hostData = snapshot.child("groupData").val().split(" | ");
        adminGroup = hostData[1];
        adminHostName = hostData[0];
        var tempToken = snapshot.child('notifToken');

        //Create host dashboard
        CreateAdminDashboard(dashboardPage);

        //Start a listener for rsvps
        const dashboardMsgWeeks = document.getElementById('dashboard-msg-weeks');
        const dashboardMsgDays = document.getElementById('dashboard-msg-days');
        unsubFromRSVP = GetAllRSVPdUsers(dashboardMsgDays, dashboardMsgWeeks);
      }
      else {
        isAdmin = false;
        adminGroup = null;
        adminHostName = null;
        dashboardPage.replaceChildren();
        if (unsubFromRSVP) unsubFromRSVP();
      }

      //Now proceed with setting up the app
      if (adminNotifToken === null || adminNotifToken === tempToken) {
        OverviewSetup(groupRef, auth?.currentUser.isAnonymous);
      }
      adminNotifToken = tempToken;
    }, (error) => {
      if (error.code === "PERMISSION_DENIED") {
        //User is not admin, but they are still possibly authenticated and able to use app
        var isAnonymous = true;
        auth.currentUser === null ? isAnonymous = true : isAnonymous = auth?.currentUser.isAnonymous;
        OverviewSetup(groupRef, isAnonymous);
      } else {
        console.log(error.code + ": " + error.message);
      }
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
    loginButton.parentElement.classList.add('login-click');
    SignInEmailAndPassword(auth, loginEmail.value, loginPassword.value);
  });

  signupButton.addEventListener('click', function (e) {
    e.preventDefault();

    signupButton.parentElement.classList.add('signup-click');

    const name = signupName.value.trim();
    const phone = signupPhone.value.trim();
    const img = ValidateImg(signupImg.files[0], null);
    const imgName = signupImg.parentElement.getAttribute('data-text');
    const email = signupEmail.value.trim();
    const password = signupPassword.value;
    const confirmPass = signupConfirmPass.value;

    const isNameValid = ValidateName(name, null);
    const isPhoneValid = ValidatePhone(phone, null);
    const isEmailValid = ValidateEmail(email, null);
    const isPasswordValid = ValidatePassword(password, confirmPass);

    //Upgrade annonymous account if data is valid
    if (isNameValid && isPhoneValid && isEmailValid && isPasswordValid && img != null) {
      const credential = EmailAuthProvider.credential(email, password);
      UpgradeAnonymous(auth, credential, img, imgName, name, phone, email);
    } else {
      signupButton.parentElement.classList.remove('signup-click');
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

  signupPassword.addEventListener('keyup', function () {
    ValidatePassword(signupPassword.value, signupConfirmPass.value, true);
  });

  signupConfirmPass.addEventListener('keyup', function () {
    ValidatePassword(signupPassword.value, signupConfirmPass.value, true);
  });

  signupImg.addEventListener('change', function () {
    signupImg.parentElement.setAttribute("data-text", "Upload Profile Picture");
    const fileError = document.getElementById('file-error');
    fileError.classList.add('hide');

    if (signupImg.files.length > 0) {
      const fileSize = signupImg.files.item(0).size;
      const fileMb = 5242880; //5MB
      if (fileSize >= fileMb) {
        //Bad
        fileError.children[0].textContent = "Please select a file less than 5MB.";
        fileError.classList.remove('hide');
      } else {
        //Good
        signupImg.parentElement.setAttribute("data-text", signupImg.value.replace(/.*(\/|\\)/, ''));
      }
    }
  });

  function ValidateName(name, isEditInfo) {
    const nameRegex = new RegExp(/^[a-zA-z]+ [a-zA-z]+$/gm, "gm");
    const result = nameRegex.test(name);
    const nameError = document.getElementById("name-error");

    if (isEditInfo === null) {
      nameError.classList.add('hide');
      signupName.classList.remove('login-error');

      if (result === false) {
        //Show error   
        setTimeout(() => {
          nameError.classList.remove('hide');
          signupName.classList.add('login-error');
        }, 100);
      }
    }

    return result;
  }

  function ValidatePhone(phone, isEditInfo) {
    const phoneRegex = new RegExp(/^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/gm, "gm");
    const result = phoneRegex.test(phone);
    const phoneError = document.getElementById("phone-error");

    if (isEditInfo === null) {
      phoneError.classList.add('hide');
      signupPhone.classList.remove('login-error');

      if (result === false) {
        //Show error  
        setTimeout(() => {
          phoneError.classList.remove('hide');
          signupPhone.classList.add('login-error');
        }, 100);
      }
    }

    return result;
  }

  function ValidateEmail(email, isEditInfo) {
    var emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/gm, "gm");
    const result = emailRegex.test(email);
    const emailError = document.getElementById("email-error");

    if (isEditInfo === null) {
      emailError.classList.add('hide');
      signupEmail.classList.remove('login-error');

      if (result === false) {
        //Show error      
        setTimeout(() => {
          emailError.classList.remove('hide');
          signupEmail.classList.add('login-error');
        }, 100);
      }
    }

    return result;
  }

  function ValidatePassword(password, confirmPass, isUserTyping) {
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
        if (isUserTyping != true) {
          setTimeout(() => {
            confPassError.classList.remove('hide');
            signupConfirmPass.classList.add('login-error');
          }, 100);
        } else {
          confPassError.classList.remove('hide');
        }

        return false;
      }
    } else {
      //Show error  
      if (isUserTyping != true || isUserTyping === null) {
        setTimeout(() => {
          passError.classList.remove('hide');
          signupPassword.classList.add('login-error');
        }, 100);
      } else {
        passError.classList.remove('hide');
      }

      return false;
    }
  }

  function ValidateImg(img, isEditInfo) {
    const fileError = document.getElementById('file-error');
    if (isEditInfo === null) {
      fileError.classList.add('hide');
      signupImg.classList.remove('login-error');
    }

    if (img) {
      return img;
    } else {
      if (isEditInfo === null) {
        //Show error   
        setTimeout(() => {
          fileError.classList.remove('hide');
          signupImg.classList.add('login-error');
        }, 100);
      }

      return null;
    }
  }

  function ClearLoginAndSignupInputs() {
    //Login
    loginEmail.value = null;
    loginPassword.value = null;
    loginText.textContent = "Welcome Back!";
    loginText.classList.remove('login-error');
    loginEmail.classList.remove('login-error');
    loginPassword.classList.remove('login-error');

    //Sign up
    signupName.value = null; signupName.classList.remove('login-error');
    const nameError = document.getElementById('name-error'); nameError.classList.add('hide');
    signupPhone.value = null; signupPhone.classList.remove('login-error');
    const phoneError = document.getElementById('phone-error'); phoneError.classList.add('hide');
    signupEmail.value = null; signupEmail.classList.remove('login-error');
    const emailError = document.getElementById('email-error'); emailError.classList.add('hide');
    signupPassword.value = null; signupPassword.classList.remove('login-error');
    const passError = document.getElementById('pass-error'); passError.classList.add('hide');
    signupConfirmPass.value = null; signupConfirmPass.classList.remove('login-error');
    const confPassError = document.getElementById('conf-pass-error'); confPassError.classList.add('hide');
    signupImg.value = null; signupImg.classList.remove('login-error');
    const fileError = document.getElementById('file-error'); fileError.classList.add('hide');
    signupImg.parentElement.setAttribute("data-text", "Profile Picture");
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
          const endWeekDate = new Date(splitWeekDates[1] + " 11:59:59:999 PM");
          const currentDate = new Date();

          //If the entire week has passed
          if (endWeekDate.getTime() < currentDate.getTime()) {
            remove(ref_db(database, 'Groups/' + group.key + '/Weeks/' + week.key));
            remove(ref_db(database, 'Capacities/' + group.key + week.key));
          } else {
            const sorter = { "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6 };
            //Week is still valid, check if individual days have passed and remove
            week.forEach((day) => {
              const tempBeginDate = new Date(beginWeekDate);
              tempBeginDate.setDate(tempBeginDate.getDate() + sorter[day.key]); AddTimeToDate(day.val(), tempBeginDate);
              if (tempBeginDate.getTime() < currentDate.getTime()) {
                remove(ref_db(database, 'Groups/' + group.key + '/Weeks/' + week.key + '/' + day.key));
                remove(ref_db(database, 'Capacities/' + group.key + '/' + week.key + '/' + day.key));
              }
            });
          }
        });
      });
    }, {
      onlyOnce: true
    }, error => {
      console.log(error.code + ": " + error.message);
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
        const endWeekDate = new Date(splitWeekDates[1] + " 11:59:59:999 PM");
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
    }, error => {
      console.log(error.code + ": " + error.message);
    });
  }
  //#endregion Remove Old Weeks

  //#region Overview Setup
  function OverviewSetup(groupRef, isAnonymous) {
    onValue(groupRef, (snapshot) => {
      //Clear arrays to not have duplicate data
      allWeeksArr = []; uniqWeeks = []; hostNameArr = []; hostWeeksArr = [];

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

      //Sort the allWeeksArr by week first
      WeekSorter(allWeeksArr);

      //Verify if the user is a host so we can get their week data
      if (isAdmin === true && adminGroup != null) {
        hostWeeksArr = allWeeksArr.filter(a => a.group === adminGroup);
        hostWeeksArr.forEach(h => allWeeksArr.splice(allWeeksArr.findIndex(a => a.group === h.group && a.week === h.week && a.day === h.day && a.time === h.time), 1));
        adminHostInfoArr = hostNameArr.splice(hostNameArr.findIndex(h => h.group === adminGroup), 1);

        //Unique weeks from host weeks
        var uniqueHostWks = [...new Set(hostWeeksArr.map(item => item.week))];
        var firstWeek = hostWeeksArr.filter(h => h.week === uniqueHostWks[0].week);
        var uniqHostDays = [...new Set(firstWeek.map(item => item.day))]; DaySorter(uniqHostDays, true);

        //Update admin dropdowns
        const dashboardMsgWeekss = document.getElementById('dashboard-msg-weeks');
        const dashboardMsgDayss = document.getElementById('dashboard-msg-days');

        if (hostWeeksArr.length > 0) {
          SetupDropdowns(dashboardMsgWeekss, uniqueHostWks, false);
          SetupDropdowns(dashboardMsgDayss, uniqHostDays, false);
        } else {
          SetupDropdowns(dashboardMsgWeekss, ["No Weeks Available"], false);
          SetupDropdowns(dashboardMsgDayss, ["No Days Available"], false);
        }
      }

      //Clear current elements
      overviewWeekHolder.replaceChildren();

      if (allWeeksArr.length > 0) {
        //Create unique arrays for each week to determine all unique days and weeks
        var uniqDays = [...new Set(allWeeksArr.map(item => item.day))]; DaySorter(uniqDays, true);
        uniqWeeks = [...new Set(allWeeksArr.map(item => item.week))];

        //Sort the week arrays by day and then time
        unsortedWeeksArr = allWeeksArr.map(a => ({ ...a }));
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

        //Update overview and planning host dropdown
        SetupDropdowns(overviewWeekSelection, uniqWeeks, false);
        SetupDropdowns(hostSelection, hostNameArr, true);
      } else {
        //Make sure dropdowns are updated
        SetupDropdowns(overviewWeekSelection, ["No Weeks Available"], false);

        if (hostNameArr.length === 0) {
          SetupDropdowns(hostSelection, ["No Hosts Available"], false);
        } else {
          SetupDropdowns(hostSelection, hostNameArr, true);
        }
      }

      //Now setup profile tab
      ProfileSetup(auth, isAnonymous);
    }, error => {
      console.log(error.code + ": " + error.message);
    });
  }

  function WeekSorter(weekArr) {
    weekArr.sort(function sortByWeek(a, b) {
      var aDates = new Date(a.week.split('-')[1] + " 11:59 PM");
      var bDates = new Date(b.week.split('-')[0] + " 11:59 PM");

      return aDates.getTime() - bDates.getTime();
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

  aboutHelpBtn.addEventListener('click', function () {
    if (!aboutHelpPage.classList.contains('show')) {
      aboutHelpPage.classList.add('show');
    }
  });

  aboutToggleBtn.addEventListener('click', function () {
    if (aboutHelpAboutPage.classList.contains('hide')) {
      aboutHelpAboutPage.classList.remove('hide');
      aboutHelpHelpPage.classList.add('hide');
    }
  });

  helpToggleBtn.addEventListener('click', function () {
    if (aboutHelpHelpPage.classList.contains('hide')) {
      aboutHelpHelpPage.classList.remove('hide');
      aboutHelpAboutPage.classList.add('hide');
    }
  });
  //#endregion Overview Setup

  //#region Profile Setup
  function ProfileSetup(auth, isAnonymous) {
    if (isAnonymous) {
      profileBlocked.classList.remove('hide');
      profileInfo.parentElement.classList.add('hide');
      profileInfo.replaceChildren();
      PlanningSetup(planRef, isAnonymous, hostNameArr[0].group);
    } else {
      onValue(ref_db(database, 'Users/' + auth?.currentUser.uid), (snapshot) => {
        loginScreen.classList.remove('show');
        mainScreen.classList.remove('disable-click');
        profileBlocked.classList.add('hide');
        profileInfo.parentElement.classList.remove('hide');
        Loading(mainLoader, true);

        const userImage = snapshot.child("Image").val();
        const userName = snapshot.child("Name").val(); userFullName = userName;
        const userEmail = auth?.currentUser.email;
        const userPhone = snapshot.child("Phone").val();
        userTotalRSVP = snapshot.child("Total RSVP'd").val();

        //Get unreadchats
        userUnreadChats = [];
        snapshot.child("UnreadChats").forEach((contact) => {
          userUnreadChats.push(contact.key);
        });

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

            CreateProfileHeader(profileInfo, url, userImage);
            isAdmin === true ? CreateProfileDashboardHeader(profileInfo) : null;
            CreatProfileInfoRow(profileInfo, userName, userEmail, userPhone, userTotalRSVP);

            //Setup planning tab and wait till completion to setup chat hosts
            var groupID = hostNameArr.length > 0 ? hostNameArr[0].group : null;
            PlanningSetup(planRef, isAnonymous, groupID, userScheduleArr, null);
            //Setup each host in Contact Host section
            chatHosts.replaceChildren();
            hostNameArr.forEach((host) => {
              ChatHostsSetup(chatHosts, host.host);
            });

            if (userUnreadChats.length > 0) {
              //Show badges
              const messagesBtn = document.getElementById('messages-button');
              messagesBtn.setAttribute('data-notif', '!');
              const tabProfileLabel = document.querySelector('.tabs-ul .new-msg-notif label');
              tabProfileLabel.setAttribute('data-notif', "!");
            }
            Loading(mainLoader, false);
          })
          .catch((error) => {
            console.log(error.code + ": " + error.message);
          });
      }, {
        onlyOnce: true
      }, error => {
        console.log(error.code + ": " + error.message);
      });
    }
  }

  function CreateProfileHeader(parentElem, imgUrl, imgName) {
    var profileHeader = document.createElement('li');
    profileHeader.classList.add('profile-header');

    var profCol1 = document.createElement('div'); profCol1.className = "profile-col";
    var profImg = document.createElement('img'); profImg.src = imgUrl; profImg.className = "profile-image"; profImg.setAttribute("data-imgName", imgName);
    profImg.setAttribute('id', 'main-prof-img'); profImg.setAttribute('loading', "lazy"); profCol1.appendChild(profImg); profileHeader.appendChild(profCol1);

    var profCol2 = document.createElement('div'); profCol2.className = "profile-col-buttons";
    var profSignOut = document.createElement('button'); profSignOut.setAttribute('id', 'signout-button'); profSignOut.className = "signout-button";
    var profSignOutIcon = document.createElement('i'); profSignOutIcon.className = "fa-solid fa-right-from-bracket"; profSignOut.appendChild(profSignOutIcon);
    profCol2.appendChild(profSignOut);
    var profMessages = document.createElement('button'); profMessages.setAttribute('id', 'messages-button'); profMessages.className = "messages-button";
    var profMessagesIcon = document.createElement('i'); profMessagesIcon.className = "fa-solid fa-message"; profMessages.appendChild(profMessagesIcon); profMessages.innerHTML += "Messages";
    profCol2.appendChild(profMessages); profileHeader.appendChild(profCol2);

    //Disable the chat sliders if not admin
    if (isAdmin === true) {
      chatHostsList.style = null;
      chatSlider.style = null;
    } else {
      chatHostsList.style = "grid-template-rows: 12.5% 87.5%;";
      chatSlider.style = "display: none";
    }

    parentElem.appendChild(profileHeader);
  }

  function CreateProfileDashboardHeader(parentElem) {
    var profileHeader = document.createElement('li');
    profileHeader.classList.add('profile-host');

    var title = document.createElement('h2'); title.textContent = "Host Dashboard"; profileHeader.appendChild(title);
    var description = document.createElement('p'); description.style.padding = "0"; description.textContent = "View current RSVPs, send a message to all RSVP'd users at once, or open your house to more days."; profileHeader.appendChild(description);
    var profCol = document.createElement('div'); profCol.className = "profile-col";
    var dashBtn = document.createElement('button'); dashBtn.setAttribute('id', 'dashboard-button'); dashBtn.className = "dashboard-button";
    var dashIcon = document.createElement('i'); dashIcon.className = "fa-solid fa-gear"; dashBtn.appendChild(dashIcon); dashBtn.innerHTML += "Dashboard";
    profCol.appendChild(dashBtn); profileHeader.appendChild(profCol);

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

  //#region Messages
  function ChatHostsSetup(parentElem, host) {
    var hostDiv = document.createElement('div'); hostDiv.classList.add('chat-host'); hostDiv.setAttribute('id', host + '-chat');

    var hostIcon = document.createElement('i'); hostIcon.className = "fa-circle-user"; hostDiv.appendChild(hostIcon);
    var hostName = document.createElement('p'); var nameText = document.createElement('strong'); nameText.textContent = host; hostName.appendChild(nameText); hostDiv.appendChild(hostName);

    var notifStatus = document.createElement('div'); notifStatus.classList.add('status');
    notifStatus.setAttribute('id', host + '-status');
    userUnreadChats.forEach((contact) => {
      if (contact === host) {
        notifStatus.classList.add('new-msg');
      }
    });
    hostDiv.appendChild(notifStatus);

    parentElem.appendChild(hostDiv);
  }

  function CreateMessageBubble(parentElem, msg, side, time) {
    var mainDiv = document.createElement('div'); side === "right" ? mainDiv.className = "message right" : mainDiv.className = "message";

    var bubble = document.createElement('div'); bubble.className = "bubble"; bubble.textContent = msg;
    var bubbleCorner = document.createElement('div'); bubbleCorner.className = "corner-" + side; bubble.appendChild(bubbleCorner);
    var bubbleTime = document.createElement('span'); var timestamp = new Date(parseInt(time));
    bubbleTime.textContent = timestamp.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    side === "left" ? bubbleTime.style = "left:0;" : null; bubble.appendChild(bubbleTime);

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
      if (isAdmin === true && chatSliderUsers.checked === true) {
        const userID = userNameArr.find(u => u.name === hostName).uid;
        const sendMessage = {};
        sendMessage['UsersMessages/' + adminHostName + '/' + userID + '/HostMsgs/' + Date.now()] = messageContent;
        update(ref_db(database), sendMessage).then(() => {
          CreateMessageBubble(chatMessages, messageContent, "right", Date.now());
          chatMessageInput.value = null;
        })
          .catch((error) => {
            console.log(error.code + ": " + error.message);
            ShowNotifToast("Error Sending Message", "There was an error trying to send your message. Please try to send it again.", "var(--red)", true, 6);
          });
      } else {
        const sendMessage = {};
        sendMessage['UsersMessages/' + hostName + '/' + auth?.currentUser.uid + '/UserMsgs/' + Date.now()] = messageContent;
        update(ref_db(database), sendMessage).then(() => {
          CreateMessageBubble(chatMessages, messageContent, "right", Date.now());
          chatMessageInput.value = null;
        })
          .catch((error) => {
            console.log(error.code + ": " + error.message);
            ShowNotifToast("Error Sending Message", "There was an error trying to send your message. Please try to send it again.", "var(--red)", true, 6);
          });
      }
    }
  });

  function SetupMessagingRequirements(auth, reg, isSignup) {
    if (auth?.currentUser.isAnonymous === false && ('Notification' in window)) {
      getToken(messaging, { serviceWorkerRegistration: reg, vapidKey: "BPN_vJi33qNLzcxQdUGrfBckm5ONtGrKXgtJqDmIWBuLNjQbT79i8eBYFoFUHffm-93MieygaJm6_fCfQKH5tAM" })
        .then((currentToken) => {
          if (currentToken) {
            //Send to db in users data and admin data if they are one
            const updateUserToken = {};
            updateUserToken["Users/" + auth?.currentUser.uid + "/notifToken"] = currentToken;
            if (isAdmin === true) {
              updateUserToken["Admins/" + auth?.currentUser.uid + "/notifToken"] = currentToken;
            }
            update(ref_db(database), updateUserToken).then(() => { if (isSignup === true) { location.reload(); } });
          } else {
            //Show notification request
            if (!("Notification" in window)) {
              console.log("This browser does not support notifications.");
            } else if (checkNotificationPromise()) {
              Notification.requestPermission().then((result) => {
                if (result === 'granted') {
                  SetupMessagingRequirements(auth, reg, isSignup);
                }
              });
            } else {
              Notification.requestPermission((permission) => {
                if (Notification.permission === 'granted') {
                  SetupMessagingRequirements(auth, reg, isSignup);
                }
              })
            }
          }
        }).catch((error) => {
          console.log(error.code + ": " + error.message);
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

  function UpdateUnreadChatsStatus(contactName, addOrRemove) {
    const msgUpdates = {};
    msgUpdates["Users/" + auth?.currentUser.uid + "/UnreadChats/" + contactName] = addOrRemove === "add" ? Date.now() : null;
    update(ref_db(database), msgUpdates).catch((error) => {
      console.log(error.code + ": " + error.message);
    });
  }
  //#endregion Messages

  //#region Edit Info
  editInfoCloseBtn.addEventListener('click', function () {
    if (!editInfoCredentialScreen.classList.contains('hide')) {
      editInfoCredentialScreen.classList.add('hide');
      editInfoContentScreen.classList.remove('hide');
      editInfoCredEmail.value = null;
      editInfoCredPass.value = null;
      editInfoVerifyBtn.parentElement.classList.remove('submit-click');
    } else if (editInfoScreen.classList.contains('show')) {
      editInfoScreen.classList.remove('show');
      ClearEditInfoInputs();
    }
  });

  editInfoPhone.addEventListener('keydown', function (e) {
    // Input must be of a valid number format or a modifier key, and not longer than ten digits
    if (!isNumericInput(e) && !isModifierKey(e)) {
      e.preventDefault();
    }
  });

  editInfoPhone.addEventListener('keyup', function (e) {
    if (isModifierKey(e)) { return; }

    const input = e.target.value.replace(/\D/g, '').substring(0, 10); // First ten digits of input only
    const zip = input.substring(0, 3);
    const middle = input.substring(3, 6);
    const last = input.substring(6, 10);

    if (input.length > 6) { e.target.value = `(${zip}) ${middle}-${last}`; }
    else if (input.length > 3) { e.target.value = `(${zip}) ${middle}`; }
    else if (input.length > 0) { e.target.value = `(${zip}`; }
  });

  editInfoEmailBtn.addEventListener('click', function () {
    editInfoContentScreen.classList.add('hide');
    editInfoCredentialScreen.classList.remove('hide');
  });

  editInfoVerifyBtn.addEventListener('click', function () {
    const credEmail = document.getElementById("editinfo-credemail");
    const credPass = document.getElementById("editinfo-credpass");
    editInfoVerifyBtn.parentElement.classList.add('submit-click');

    if (credEmail.value != "" && credPass.value != "") {
      const credential = EmailAuthProvider.credential(credEmail.value, credPass.value);
      reauthenticateWithCredential(auth?.currentUser, credential).then(() => {
        const infoInputs = document.getElementById("editinfo-inputs");
        infoInputs.children[2].classList.add('hide');
        infoInputs.children[3].classList.remove('hide');
        editInfoCredentialScreen.classList.add('hide');
        editInfoContentScreen.classList.remove('hide');
        ShowNotifToast("Successfully Authenticated", "You may now update your email and submit your changes.", "var(--green)", true, 5);
        editInfoVerifyBtn.parentElement.classList.remove('submit-click');
      }).catch((error) => {
        console.log(error.code + ": " + error.message);
        var message = null;

        switch (error.code) {
          case 'auth/invalid-email':
            message = "The email provided was invalid. Please verify the email you input and try again.";
            break;
          case 'auth/wrong-password':
            message = "The password provided was invalid. Please type your password again.";
            break;
          default:
            message = "There was an error trying to authenticate your credentials. Please try again.";
            break;
        }

        ShowNotifToast("Error Authenticating", message, "var(--red)", true, 8);
        editInfoVerifyBtn.parentElement.classList.remove('submit-click');
      });
    }
  });

  editInfoImg.addEventListener('change', function () {
    editInfoImg.parentElement.setAttribute("data-text", "Profile Picture");

    if (editInfoImg.files.length > 0) {
      const fileSize = editInfoImg.files.item(0).size;
      const fileMb = fileSize / 1024 ** 2;
      if (fileMb >= 2) {
        //Bad
        ShowNotifToast("Invalid Profile Picture", "Please select a file that is less than 2MB.", "var(--red)", true, 5);
      } else {
        //Good
        editInfoImg.parentElement.setAttribute("data-text", editInfoImg.value.replace(/.*(\/|\\)/, ''));
      }
    }
  });

  editInfoSubmitBtn.addEventListener('click', function () {
    if (auth?.currentUser.isAnonymous === false) {
      editInfoSubmitBtn.parentElement.classList.add('submit-click');
      //If const is -1 then it is unused. If it is true or false then it is used
      const nameValid = editInfoName.value.trim() != "" ? ValidateName(editInfoName.value.trim(), true) : -1;
      const phoneValid = editInfoPhone.value.trim() != "" ? ValidatePhone(editInfoPhone.value.trim(), true) : -1;
      const emailValid = editInfoEmail.value.trim() != "" ? ValidateEmail(editInfoEmail.value.trim(), true) : -1;
      const imgValid = editInfoImg.files[0] != null ? ValidateImg(editInfoImg.files[0], true) : -1;
      var invalidCounter = 0;
      var errorString = "The information you put for the item(s) you wanted to update is invalid.";

      if (nameValid === false) {
        invalidCounter++;
        errorString += "\nMake sure to put your first and last name like \"John Smith\"."
      }

      if (phoneValid === false) {
        invalidCounter++;
        errorString += "\nPhone number must only be digits in the format: (817) 888-8888."
      }

      if (emailValid === false) {
        invalidCounter++;
        errorString += "\nEmail must be valid and in the format email@example.com.";
      }

      if (imgValid === null) {
        invalidCounter++;
        errorString += "\nProfile Picture must be a valid image (png, jpg, webp, etc.) and less than 2MB.";
      }

      if (nameValid === -1 && phoneValid === -1 && emailValid === -1 && imgValid === -1) {
        //Nothing was entered, do nothing
        editInfoSubmitBtn.parentElement.classList.remove('submit-click');
        return;
      } else if (invalidCounter === 0) {
        //Update in database then locally
        const infoUpdates = {};

        if (nameValid === true) {
          infoUpdates["Users/" + auth?.currentUser.uid + "/Name"] = editInfoName.value.trim();
        }

        if (phoneValid === true) {
          infoUpdates["Users/" + auth?.currentUser.uid + "/Phone"] = editInfoPhone.value.trim();
        }

        if (imgValid instanceof File) {
          var imgElem = document.getElementById('main-prof-img');
          var imgName = imgElem.getAttribute("data-imgName");

          deleteObject(ref_st(storage, "Users/" + auth?.currentUser.uid + "/" + imgName)).then(() => {
            //Upload new image
            const metaData = { cacheControl: 'public,max-age=604800', };
            const newImgName = editInfoImg.parentElement.getAttribute('data-text');
            uploadBytes(ref_st(storage, "Users/" + auth?.currentUser.uid + "/" + newImgName), imgValid, metaData).then(() => {
              //Upload successful, now proceed with update
              infoUpdates["Users/" + auth?.currentUser.uid + "/Image"] = newImgName;
              if (emailValid === true) {
                updateEmail(auth.currentUser, editInfoEmail.value.trim()).then(() => {
                  infoUpdates["Users/" + auth?.currentUser.uid + "/Email"] = editInfoEmail.value.trim();
                  update(ref_db(database), infoUpdates).then(() => {
                    //Update local then show toast
                    UpdateLocalProfInfo(nameValid, phoneValid, emailValid, imgValid);
                    ShowNotifToast("Updated Profile Info", "You have successfully updated your profile information.", "var(--green)", true, 5);
                    ClearEditInfoInputs();
                    editInfoCloseBtn.click();
                  });
                });
              } else {
                update(ref_db(database), infoUpdates).then(() => {
                  //Update local then show toast
                  UpdateLocalProfInfo(nameValid, phoneValid, emailValid, imgValid);
                  ShowNotifToast("Updated Profile Info", "You have successfully updated your profile information.", "var(--green)", true, 5);
                  ClearEditInfoInputs();
                  editInfoCloseBtn.click();
                });
              }

            });
          }).catch((error) => {
            console.log(error.code + ": " + error.message);
            ShowNotifToast("Error Updating Info", "There was an error when trying to update your information in the database. Please try to submit again.", "var(--red)", true, 8);
            editInfoSubmitBtn.parentElement.classList.remove('submit-click');
          });
        } else {
          if (emailValid === true) {
            updateEmail(auth.currentUser, editInfoEmail.value.trim()).then(() => {
              infoUpdates["Users/" + auth?.currentUser.uid + "/Email"] = editInfoEmail.value.trim();
              update(ref_db(database), infoUpdates).then(() => {
                //Update local then show toast
                UpdateLocalProfInfo(nameValid, phoneValid, emailValid, imgValid);
                ShowNotifToast("Updated Profile Info", "You have successfully updated your profile information.", "var(--green)", true, 5);
                ClearEditInfoInputs();
                editInfoCloseBtn.click();
              })
            }).catch((error) => {
              console.log(error.code + ": " + error.message);
              ShowNotifToast("Error Updating Info", "There was an error when trying to update your information in the database. Please try to submit again.", "var(--red)", true, 8);
              editInfoSubmitBtn.parentElement.classList.remove('submit-click');
            });;
          } else {
            update(ref_db(database), infoUpdates).then(() => {
              //Update local then show toast
              UpdateLocalProfInfo(nameValid, phoneValid, emailValid, imgValid);
              ShowNotifToast("Updated Profile Info", "You have successfully updated your profile information.", "var(--green)", true, 5);
              ClearEditInfoInputs();
              editInfoCloseBtn.click();
            }).catch((error) => {
              console.log(error.code + ": " + error.message);
              ShowNotifToast("Error Updating Info", "There was an error when trying to update your information in the database. Please try to submit again.", "var(--red)", true, 8);
              editInfoSubmitBtn.parentElement.classList.remove('submit-click');
            });
          }
        }
      } else if (invalidCounter > 0) {
        //Something is invalid
        ShowNotifToast("Error Updating Info", errorString, "var(--red)", true, 8);
        editInfoSubmitBtn.parentElement.classList.remove('submit-click');
      }
    }
  });

  function UpdateLocalProfInfo(nameValid, phoneValid, emailValid, imgValid) {
    var profInfoElem = document.getElementById("profile-info").children[isAdmin ? 2 : 1];

    if (nameValid === true) {
      profInfoElem.children[1].textContent = editInfoName.value.trim();
    }

    if (phoneValid === true) {
      profInfoElem.children[3].textContent = editInfoPhone.value.trim();
    }

    if (emailValid === true) {
      profInfoElem.children[2].textContent = editInfoEmail.value.trim();
    }

    if (imgValid instanceof File) {
      var imgElem = document.getElementById('main-prof-img');
      var fileReader = new FileReader();
      fileReader.onload = function (e) {
        imgElem.src = e.target.result
      }
      fileReader.readAsDataURL(imgValid);
    }
  }

  function ClearEditInfoInputs() {
    editInfoName.value = null;
    editInfoPhone.value = null;
    editInfoEmailBtn.parentElement.classList.remove('hide');
    editInfoEmail.parentElement.classList.add('hide');
    editInfoVerifyBtn.parentElement.classList.remove('submit-click');
    editInfoCredEmail.value = null;
    editInfoCredPass.value = null;
    editInfoEmail.value = null;
    editInfoImg.value = null;
    editInfoImg.parentElement.setAttribute("data-text", "Profile Picture");
    editInfoSubmitBtn.parentElement.classList.remove('submit-click');
  }
  //#endregion Edit Info

  //#region Admin Dashboard
  function CreateAdminDashboard(dashPage) {
    const dashContent = dashPage.children[0].children[0];
    //Remove messages and add days but keep title element and pop ups
    document.getElementById('dashboard-message')?.remove();
    document.getElementById('dashboard-add-days')?.remove();

    //Now setup messages for dashboard
    var dashMessage = document.createElement('div'); dashMessage.setAttribute('id', 'dashboard-message');

    var messageTitle = document.createElement('h2'); messageTitle.style = "color:var(--white);font-size:calc(1.25vw + 1.5vh);margin:auto;";
    messageTitle.textContent = "View or Message All RSVP'd Users"; dashMessage.appendChild(messageTitle);

    SetupHelpForDashboard(dashMessage, "messages");

    var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg'); svg.setAttribute('viewBox', '0 0 16 16');
    var path = document.createElementNS("http://www.w3.org/2000/svg", 'path'); path.setAttribute('d', "M 7.247 11.14 L 2.451 5.658 C 1.885 5.013 2.345 4 3.204 4 h 9.592 a 1 1 0 0 1 0.753 1.659 l -4.796 5.48 a 1 1 0 0 1 -1.506 0 Z");
    svg.appendChild(path);

    var messageDrops = document.createElement('div'); messageDrops.className = "week-select-grid mobile-select-grid";
    var drop1 = document.createElement('label'); drop1.classList.add('dropdown'); drop1.setAttribute('for', 'dashboard-msg-weeks');
    var select1 = document.createElement('select'); select1.setAttribute('id', 'dashboard-msg-weeks'); select1.required = true; drop1.appendChild(select1);
    var svgClone = svg.cloneNode(true); drop1.appendChild(svgClone);
    var drop2 = document.createElement('label'); drop2.classList.add('dropdown'); drop2.setAttribute('for', 'dashboard-msg-days');
    var select2 = document.createElement('select'); select2.setAttribute('id', 'dashboard-msg-days'); select2.required = true; drop2.appendChild(select2);
    drop2.appendChild(svg);
    messageDrops.appendChild(drop1); messageDrops.appendChild(drop2); dashMessage.appendChild(messageDrops);

    var rsvpContent = document.createElement('div'); rsvpContent.setAttribute('id', "dashboard-rsvp-content"); rsvpContent.className = "no-rsvps";
    var noRsvp = document.createElement('p'); noRsvp.style = "padding: 0px 20px;"; noRsvp.textContent = "No RSVP's Yet"; rsvpContent.appendChild(noRsvp);
    dashMessage.appendChild(rsvpContent);

    var sendMsg = document.createElement('div'); sendMsg.setAttribute('id', 'dashboard-send-message');
    var textArea = document.createElement('textarea'); textArea.setAttribute('id', 'dashboard-msg-input'); textArea.setAttribute('type', 'text');
    textArea.placeholder = "Send a message..."; textArea.maxLength = "240"; sendMsg.appendChild(textArea);
    var sendBtn = document.createElement('button'); sendBtn.setAttribute('id', 'dashboard-send-btn');
    var sendSvg = document.createElementNS("http://www.w3.org/2000/svg", 'svg'); sendSvg.setAttribute('viewBox', "0 0 512 512"); sendSvg.setAttribute('height', '1em');
    var sendPath = document.createElementNS("http://www.w3.org/2000/svg", "path"); sendPath.setAttribute('d', 'M 205 34.8 c 11.5 5.1 19 16.6 19 29.2 v 64 H 336 c 97.2 0 176 78.8 176 176 c 0 113.3 -81.5 163.9 -100.2 174.1 c -2.5 1.4 -5.3 1.9 -8.1 1.9 c -10.9 0 -19.7 -8.9 -19.7 -19.7 c 0 -7.5 4.3 -14.4 9.8 -19.5 c 9.4 -8.8 22.2 -26.4 22.2 -56.7 c 0 -53 -43 -96 -96 -96 H 224 v 64 c 0 12.6 -7.4 24.1 -19 29.2 s -25 3 -34.4 -5.4 l -160 -144 C 3.9 225.7 0 217.1 0 208 s 3.9 -17.7 10.6 -23.8 l 160 -144 c 9.4 -8.5 22.9 -10.6 34.4 -5.4 Z');
    sendSvg.appendChild(sendPath); sendBtn.appendChild(sendSvg); sendMsg.appendChild(sendBtn); dashMessage.appendChild(sendMsg);

    dashContent.appendChild(dashMessage);

    //Now setup Add/Remove Schedule days for dashboard
    var addDays = document.createElement('div'); addDays.setAttribute('id', 'dashboard-add-days');
    var daysTitle = document.createElement('h2'); daysTitle.style = "color:var(--white);font-size:calc(1.25vw + 1.5vh);margin:auto;";
    daysTitle.textContent = "Add/Remove Scheduled Days"; addDays.appendChild(daysTitle);

    SetupHelpForDashboard(addDays, "schedule");

    var addDateTime = document.createElement('div'); addDateTime.setAttribute('id', 'dashboard-add-datetime');
    var dateTime = document.createElement('div'); dateTime.setAttribute('id', "dashboard-datetime");
    var date = document.createElement('input'); date.type = "date"; date.setAttribute('id', 'dashboard-date'); dateTime.appendChild(date);
    var span = document.createElement('span'); dateTime.appendChild(span);
    var time = document.createElement('input'); time.type = "time"; time.setAttribute('id', 'dashboard-time'); dateTime.appendChild(time);
    addDateTime.appendChild(dateTime);
    var addDayBtn = document.createElement('button'); addDayBtn.setAttribute('id', 'dashboard-add-day');
    var addDayIcon = document.createElement('i'); addDayIcon.className = "fa-solid fa-plus"; addDayBtn.appendChild(addDayIcon);
    addDateTime.appendChild(addDayBtn);
    addDays.appendChild(addDateTime);

    var daysAdded = document.createElement('div'); daysAdded.setAttribute('id', 'dashboard-days-content'); daysAdded.className = "no-days";
    var noDays = document.createElement('p'); noDays.style = "padding: 0px 20px"; noDays.textContent = "No Scheduled Days Yet"; daysAdded.appendChild(noDays);
    addDays.appendChild(daysAdded);

    var removeAndSchedule = document.createElement('div'); removeAndSchedule.setAttribute('id', 'dashboard-removeAndSchedule');
    var removeBtn = document.createElement('button'); removeBtn.setAttribute('id', 'dashboard-remove-day');
    var removeIcon = document.createElement('i'); removeIcon.className = "fa-solid fa-trash-can"; removeBtn.appendChild(removeIcon);
    removeAndSchedule.appendChild(removeBtn);
    var scheduleBtn = document.createElement('button'); scheduleBtn.setAttribute('id', 'dashboard-schedule-days');
    var scheduleIcon = document.createElement('i'); scheduleIcon.className = "fa-solid fa-check"; scheduleBtn.appendChild(scheduleIcon);
    removeAndSchedule.appendChild(scheduleBtn);
    addDays.appendChild(removeAndSchedule);

    dashContent.appendChild(addDays);
  }

  function SetupHelpForDashboard(parentElem, helpContentName) {
    //Create help button
    var helpBtn = document.createElement('button'); helpBtn.classList.add("help-button");
    var helpIcon = document.createElement('i'); helpIcon.className = "fa-solid fa-circle-question"; helpBtn.appendChild(helpIcon);

    if (helpContentName === "messages") {
      helpBtn.setAttribute("id", "messageshelp-button");
      helpBtn.setAttribute("data-pageId", "messageshelp-page");
      parentElem.appendChild(helpBtn);
    } else if (helpContentName === "schedule") {
      helpBtn.setAttribute("id", "schedulehelp-button");
      helpBtn.setAttribute("data-pageId", "schedulehelp-page");
      parentElem.appendChild(helpBtn);
    }
  }

  function ChatUsersSetup(parentElem, user) {
    var userDiv = document.createElement('div'); userDiv.classList.add('chat-host'); userDiv.setAttribute('id', user + '-chat');

    var userIcon = document.createElement('i'); userIcon.className = "fa-user chat-user-icon"; userDiv.appendChild(userIcon);
    var userName = document.createElement('p'); var nameText = document.createElement('strong'); nameText.textContent = user; userName.appendChild(nameText); userDiv.appendChild(userName);

    var notifStatus = document.createElement('div'); notifStatus.classList.add('status');
    notifStatus.setAttribute('id', user + '-status');
    userUnreadChats.forEach((contact) => {
      if (contact === user) {
        notifStatus.classList.add('new-msg');
      }
    });
    userDiv.appendChild(notifStatus);

    parentElem.appendChild(userDiv);
  }

  function SetupDateTime() {
    const todayDate = new Date(Date.now());
    const yearAhead = new Date(Date.now()); yearAhead.setMonth(yearAhead.getMonth() + 13);
    const dateMin = todayDate.getFullYear() + "-" + ('0' + (todayDate.getMonth() + 1)).slice(-2) + "-" + ('0' + todayDate.getDate()).slice(-2);
    const dateMax = yearAhead.getFullYear() + "-" + ('0' + yearAhead.getMonth()).slice(-2) + "-" + ('0' + yearAhead.getDate()).slice(-2);

    const dashboardDate = document.getElementById('dashboard-date');
    const dashboardTime = document.getElementById('dashboard-time');
    dashboardDate.min = dateMin; dashboardDate.valueAsDate = todayDate; dashboardDate.max = dateMax;
    dashboardTime.value = "12:00";
  }

  function GetAllRSVPdUsers(msgDays, msgWeeks) {
    const unsubscribeRsvp = onValue(ref_db(database, 'RSVPs/' + adminGroup), (snapshot) => {
      rsvpdUsersArr = [];
      //First we need to check if there are any old weeks
      //If there are old weeks, move those to OldRSVPs in DB
      const rsvpUpdates = {};
      snapshot.forEach((week) => {
        const decodedWeek = decodeURIComponent(week.key);
        const splitWeekDates = decodedWeek.split('-');
        const beginWeekDate = new Date(splitWeekDates[0]);
        const endWeekDate = new Date(splitWeekDates[1] + " 11:59:59:999 PM");
        const currentDate = new Date();

        //If the entire week has passed
        if (endWeekDate.getTime() < currentDate.getTime()) {
          //Now we need to get all days and rsvps from this week and move them
          week.forEach((day) => {
            day.forEach((user) => {
              const userRsvp = { Guests: user.child('Guests').val(), Name: user.child('Name').val() };
              rsvpUpdates["OldRSVPs/" + adminGroup + "/" + week.key + "/" + day.key + "/" + user.key] = userRsvp;
            });
          });

          //Remove week from old spot
          rsvpUpdates["RSVPs/" + adminGroup + '/' + week.key] = null;
        } else {
          const sorter = { "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6 };
          //Week is still good, check check if individual days have passed and then get rsvps
          week.forEach((day) => {
            const tempBeginDate = new Date(beginWeekDate);
            tempBeginDate.setDate(tempBeginDate.getDate() + sorter[day.key]); tempBeginDate.setHours(23, 59, 59, 999);

            day.forEach((user) => {
              if (tempBeginDate.getTime() < currentDate.getTime()) {
                const userRsvp = { Guests: user.child('Guests').val(), Name: user.child('Name').val() };
                rsvpUpdates["OldRSVPs/" + adminGroup + '/' + week.key + '/' + day.key + '/' + user.key] = userRsvp;
              } else {
                const userData = { week: decodedWeek, day: day.key, name: user.child('Name').val(), guests: user.child('Guests').val(), uid: user.key };
                rsvpdUsersArr.push(userData);
              }
            });

            //Check again to remove the day with all user rsvps after users have been moved to oldrsvps
            if (tempBeginDate.getTime() < currentDate.getTime()) {
              rsvpUpdates["RSVPs/" + adminGroup + '/' + week.key + '/' + day.key] = null;
            }
          });
        }
      });

      //Now commit updates and continue
      update(ref_db(database), rsvpUpdates).then(() => {
        if (msgDays.value !== "default") {
          GetRSVPdUsersByDay(msgDays.value, msgWeeks);
        } else {
          GetRSVPdUsersByWeek(msgWeeks.value);
        }
      });
    }, error => {
      console.log(error.code + ": " + error.message);
      if (error.code === "PERMISSION_DENIED") {
        //Admin status has been removed, reload page
        window.location.reload();
      }
    });

    return unsubscribeRsvp;
  }

  function GetRSVPdUsersByWeek(week) {
    const dashboardRsvpUsers = document.getElementById('dashboard-rsvp-content');
    dashboardRsvpUsers.replaceChildren();
    var rsvp = document.createElement('p');
    var tempArr = rsvpdUsersArr.filter(r => r.week === week);

    //Get only unique names from the arr
    var uniqNames = [...new Map(tempArr.map(item => [item.name, item])).values()];

    if (uniqNames.length > 0) {
      //Update ui to show rsvpd users
      dashboardRsvpUsers.classList.remove('no-rsvps');
      uniqNames.forEach((user) => {
        var rsvpClone = rsvp.cloneNode(); rsvpClone.className = "rsvpd-user";
        rsvpClone.textContent = user.name;
        dashboardRsvpUsers.appendChild(rsvpClone);
      });
    } else {
      dashboardRsvpUsers.classList.add('no-rsvps');
      var rsvpClone = rsvp.cloneNode(); rsvpClone.style = "padding: 0 20px";
      rsvpClone.textContent = "No RSVP's Yet";
      dashboardRsvpUsers.appendChild(rsvpClone);
    }
  }

  function GetRSVPdUsersByDay(day, msgWeeks) {
    const dashboardRsvpUsers = document.getElementById('dashboard-rsvp-content');
    dashboardRsvpUsers.replaceChildren();
    var rsvp = document.createElement('p');
    const tempArr = rsvpdUsersArr.filter(r => r.week === msgWeeks.value);

    if (tempArr.length > 0 && day !== "default") {
      dashboardRsvpUsers.classList.remove('no-rsvps');
      tempArr.forEach((user) => {
        if (user.day === day) {
          var rsvpClone = rsvp.cloneNode(); rsvpClone.className = "rsvpd-user";
          rsvpClone.textContent = user.name + "\n Guests:" + user.guests;
          dashboardRsvpUsers.appendChild(rsvpClone);
        }
      });
    } else {
      dashboardRsvpUsers.classList.add('no-rsvps');
      var rsvpClone = rsvp.cloneNode(); rsvpClone.style = "padding: 0 20px";
      rsvpClone.textContent = "No RSVP's Yet";
      dashboardRsvpUsers.appendChild(rsvpClone);
    }
  }

  var prevUsersName;
  function ViewRSVPdUser(usersName) {
    Loading(document.getElementById("viewuser-loader"), true);

    if (prevUsersName == null && prevUsersName != usersName) {
      //Get user from arr
      var tempUser = rsvpdUsersArr.find(u => usersName === u.name);
      if (tempUser === null) {
        //Couldnt find user in array
        //Tell host and close screen
        ShowNotifToast("Unable To Get User Info", "There was an error trying to get this users information. Please try again.", "var(--red)", true, 5);
        var userPage = document.getElementById('viewUser-page');
        if (userPage.classList.contains('show')) {
          userPage.classList.remove('show');
        }
      } else {
        //Found user so get their info
        get(ref_db(database, 'Users/' + tempUser.uid)).then((snapshot) => {
          //Elements to update
          var parentElem = document.querySelector("#viewUser-page > div > div > div.viewUser-header");
          var profImg = parentElem.children[0].children[0];
          var profName = parentElem.children[1];
          var profEmail = parentElem.children[2].children[0];
          var profPhone = parentElem.children[2].children[1];
          var profDays = parentElem.children[2].children[2];

          //First make sure img comes through before updating anything
          getDownloadURL(ref_st(storage, "Users/" + tempUser.uid + "/" + snapshot.child("Image").val())).then((url) => {
            profImg.src = url;
            profName.textContent = snapshot.child("Name").val();
            profEmail.textContent = snapshot.child("Email").val();
            profPhone.textContent = snapshot.child("Phone").val();
            profDays.textContent = snapshot.child("Total RSVP'd").val();

            //Make sure message box is cleared
            document.getElementById("viewuser-msg-input").value = null;

            //Now show everything
            setTimeout(() => {
              prevUsersName = usersName;
              Loading(document.getElementById("viewuser-loader"), false);
            }, 1000);

          }).catch((error) => {
            console.log(error.code + ": " + error.message);
            ShowNotifToast("Unable To Get User Info", "There was an error trying to get this users information. Please try again.", "var(--red)", true, 5);
            var userPage = document.getElementById('viewUser-page');
            if (userPage.classList.contains('show')) {
              userPage.classList.remove('show');
            }
          });
        }).catch((error) => {
          console.log(error.code + ": " + error.message);
          ShowNotifToast("Unable To Get User Info", "There was an error trying to get this users information. Please try again.", "var(--red)", true, 5);
          var userPage = document.getElementById('viewUser-page');
          if (userPage.classList.contains('show')) {
            userPage.classList.remove('show');
          }
        });
      }
    } else {
      //This users info is already loaded
      Loading(document.getElementById("viewuser-loader"), false);
    }
  }

  function SendViewedUserMessage(usersName, msgElem) {
    const msgUpdate = {}; const timestamp = Date.now();
    var tempUser = rsvpdUsersArr.find(u => usersName === u.name);

    msgUpdate['UsersMessages/' + adminHostName + '/' + tempUser.uid + "/HostMsgs/" + timestamp] = msgElem.value;
    update(ref_db(database), msgUpdate).then(() => {
      ShowNotifToast("Message Sent", "Your message to " + usersName + " was successully sent.", "var(--green)", true, 5);
      msgElem.value = null;
    }).catch((error) => {
      console.log(error.code + ": " + error.message);
      ShowNotifToast("Error Sending Message", "There was an error when trying to send your message to this user. Please try again.", "var(--red)", true, 5);
    });
  }

  function ShowCurrentScheduledDays() {
    const dashboardDays = document.getElementById('dashboard-days-content');
    dashboardDays.replaceChildren();
    var schedDay = document.createElement('p'); schedDay.className = "scheduled-day";
    const sorter = { "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6 };

    if (hostWeeksArr.length > 0) {
      //Update ui to show current host scheduled days    
      dashboardDays.classList.remove('no-days');
      hostWeeksArr.forEach((week) => {
        const currWeek = week.week.split('-');
        var beginWeek = new Date(currWeek[0]); beginWeek.setDate(beginWeek.getDate() + sorter[week.day]);
        const dateString = (beginWeek.getMonth() + 1) + "/" + ('0' + beginWeek.getDate()).slice(-2) + "/" + ('0' + beginWeek.getFullYear()).slice(-2);
        var schedClone = schedDay.cloneNode(); schedClone.textContent = dateString + " at " + week.time;
        dashboardDays.appendChild(schedClone);
      });
    } else {
      dashboardDays.classList.add('no-days');
      var schedClone = schedDay.cloneNode(); schedClone.textContent = "No Scheduled Days Yet"; schedClone.classList.remove('scheduled-day');
      dashboardDays.appendChild(schedClone);
    }
  }

  function AddDayToList() {
    const dashboardDays = document.getElementById('dashboard-days-content');
    const dashboardDateTime = document.getElementById('dashboard-datetime');
    const dateElem = document.getElementById('dashboard-date');
    const timeElem = document.getElementById('dashboard-time');

    var [timeH, timeM] = timeElem.value.split(":");
    var timeH2 = (timeH % 12 ? timeH % 12 : 12);
    const timeString = timeH2 + ":" + timeM + (timeH >= 12 ? ' PM' : ' AM');

    const rawDateString = new Date(dateElem.value.replace(/-/g, "/") + " " + timeString);
    const dateVal = new Date(rawDateString);
    const dateString = (dateVal.getMonth() + 1) + "/" + ('0' + dateVal.getDate()).slice(-2) + "/" + ('0' + dateVal.getFullYear()).slice(-2);
    const minDate = new Date(dateElem.getAttribute('min'));
    const maxDate = new Date(dateElem.getAttribute('max'));

    if (dateVal.getTime() > minDate.getTime() && dateVal.getTime() < maxDate.getTime()) {
      //Date is good, add to list, check to see if list is empty first
      if (dashboardDays.classList.contains('no-days')) {
        dashboardDays.classList.remove('no-days');
        dashboardDays.replaceChildren();
      }

      //Now check to see if the date is already added
      var isValid = true;
      Array.from(dashboardDays.children).forEach((day) => {
        if (day.textContent.split(" at ")[0] === dateString) {
          isValid = false
        }
      });

      if (isValid === true) {
        const pElem = document.createElement('p'); pElem.className = "added-day"; pElem.textContent = dateString + ' at ' + timeString;
        dashboardDays.appendChild(pElem);
      }

    } else {
      dashboardDateTime.classList.add('login-error');
      setTimeout(() => {
        dashboardDateTime.classList.remove('login-error');
      }, 3000);
    }
  }

  function SendMsgToAllRsvpUsers(rsvpContentArr, msgBox) {
    const msgUpdates = {}; const timestamp = Date.now();
    rsvpContentArr.forEach((user) => {
      var usersName;
      if (document.getElementById('dashboard-msg-days').value != "default") {
        usersName = user.textContent.split("\n Guests:")[0];
      } else {
        usersName = user.textContent;
      }
      var temp = rsvpdUsersArr.find(u => usersName === u.name);
      msgUpdates['UsersMessages/' + adminHostName + '/' + temp.uid + '/HostMsgs/' + timestamp] = msgBox.value;
    });

    update(ref_db(database), msgUpdates).then(() => {
      ShowNotifToast("Message Sent", "All specified RSVP'd Users will now be getting your message.", "var(--green)", true, 5);
      msgBox.value = null;
    })
      .catch((error) => {
        console.log(error.code + ": " + error.message);
        ShowNotifToast("Error Sending Message", "There was an error sending your message. Please try to send it again.", "var(--red)", true, 5);
      });
  }

  function ScheduleDays(daysContentArr) {
    const dayUpdates = {};
    const sorter = { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" };

    //Need to get the week attached to each day to schedule
    //Sun-Sat, 0-6. Our weeks will start on Mon, 1
    daysContentArr.forEach((day) => {
      if (day.classList.contains("added-day")) {
        var splitDateTime = day.textContent.split(" at ");
        var date = new Date(splitDateTime[0]);
        var dayOfWeek = sorter[date.getDay()];
        var begin, end;
        switch (dayOfWeek) {
          case "Sunday":
            begin = -6; end = 0;
            break;
          case "Monday":
            begin = 0; end = 6;
            break;
          case "Tuesday":
            begin = -1; end = 5;
            break;
          case "Wednesday":
            begin = -2; end = 4;
            break;
          case "Thursday":
            begin = -3; end = 3;
            break;
          case "Friday":
            begin = -4; end = 2;
            break;
          case "Saturday":
            begin = -5; end = 1;
            break;
        }
        var tempEnd = new Date(date.getTime()); var tempBegin = new Date(date.getTime());
        var endWeek = new Date(tempEnd.setDate(tempEnd.getDate() + end));
        var beginWeek = new Date(tempBegin.setDate(tempBegin.getDate() + begin));
        const beginString = (beginWeek.getMonth() + 1) + "/" + ('0' + beginWeek.getDate()).slice(-2) + "/" + ('0' + beginWeek.getFullYear()).slice(-2);
        const endString = (endWeek.getMonth() + 1) + "/" + ('0' + endWeek.getDate()).slice(-2) + "/" + ('0' + endWeek.getFullYear()).slice(-2);
        dayUpdates["Capacities/" + adminGroup + "/" + encodeURIComponent(beginString + '-' + endString) + "/" + dayOfWeek] = adminCapacity;
        dayUpdates["Groups/" + adminGroup + "/Weeks/" + encodeURIComponent(beginString + '-' + endString) + "/" + dayOfWeek] = splitDateTime[1];
      }
    });

    update(ref_db(database), dayUpdates).then(() => {
      //Change each class to scheduled-days
      daysContentArr.forEach((day) => {
        day.classList.remove('added-day', 'day-clicked');
        day.classList.add('scheduled-day');
      });

      ShowNotifToast("Days Scheduled", "The days you choose have been added to your schedule.", "var(--green)", true, 5);
    })
      .catch((error) => {
        console.log(error.code + ": " + error.message);
        ShowNotifToast("Error Scheduling Days", "There was an error scheduling days into the database. Please try to schedule them again.", "var(--red)", true, 5);
      });
  }
  //#endregion Admin Dashboard

  //#endregion Profile Setup

  //#region Planning Setup
  function PlanningSetup(planRef, isAnonymous, groupID, userScheduleArr, clickedWeek) {
    if (isAnonymous) {
      planningBlocked.classList.remove('hide');
      planningIntro.parentElement.classList.add('hide');
      planningWeekSelectParent.classList.add('hide');
      planWeekHolder.replaceChildren();
      Loading(mainLoader, false);
      if (tabOverview.checked === true && auth?.currentUser.isAnonymous === true) aboutHelpBtn.click();
    } else {
      loginScreen.classList.remove('show');
      mainScreen.classList.remove('disable-click');
      planningBlocked.classList.add('hide');
      planningIntro.parentElement.classList.remove('hide');
      planningWeekSelectParent.classList.remove('hide');
      Loading(mainLoader, true);

      //Clear the current elements in the list
      planWeekHolder.replaceChildren();

      if (hostNameArr.length > 0) {
        if (groupInfoArr.length > 0 && groupInfoArr.find(g => g.group === groupID) != null) {
          //We already have this groups info, just update UI
          PlanningSetupHelper(groupID, userScheduleArr, clickedWeek);
        } else {
          //We don't have this groups info, get from DB
          onValue(planRef, (snapshot) => {
            const childSnapshot = snapshot.child(groupID);
            const groupKey = childSnapshot.key;
            const location = childSnapshot.child("Location").val();
            const capacity = childSnapshot.child("Capacity").val();
            const description = childSnapshot.child("Description").val();
            const image = childSnapshot.child("Image").val();

            if (isAdmin === true && adminGroup !== null) {
              //Always make sure adminCapacity is valid
              adminCapacity = snapshot.child(adminGroup).child("Capacity").val();
            }

            getDownloadURL(ref_st(storage, "Groups/" + image))
              .then((url) => {
                //Update group array with the new data
                const data = { group: groupKey, location: location, capacity: capacity, description: description, image: url };
                groupInfoArr.unshift(data);

                PlanningSetupHelper(groupID, userScheduleArr, clickedWeek);
              })
              .catch((error) => {
                console.log(error.code + ": " + error.message);
                console.log(error);
              });
          }, {
            onlyOnce: true
          }, error => {
            console.log(error.code + ": " + error.message);
          });
        }
      } else {
        SetupDropdowns(planWeekSelection, ["No Days Available"], false);
        Loading(mainLoader, false);
      }
    }
  }

  function PlanningSetupHelper(groupID, userScheduleArr, clickedWeek) {
    DaySorter(allWeeksArr);
    //Create week containers for each week
    var uniqHostWks = [...new Set((unsortedWeeksArr.filter(a => a.group === groupID)).map(item => item.week))];
    uniqHostWks.forEach((week) => {
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

    if (allWeeksArr.length > 0 && allWeeksArr.find(a => a.group === groupID) != null) {
      if (clickedWeek === null || !uniqHostWks.find(u => u === clickedWeek)) clickedWeek = uniqHostWks[0];
      overviewWeekSelection.value = clickedWeek;

      //Setup planning weeks dropdown
      SetupDropdowns(planWeekSelection, uniqHostWks, false);
      planWeekSelection.value = clickedWeek;
      ShowEventContainers(clickedWeek, 'planning-container');
    } else {
      SetupDropdowns(planWeekSelection, ["No Days Available"], false);
      ShowEventContainers(overviewWeekSelection.options[0].value, 'overview-container');
    }

    //Make sure db listener gets started on first load
    if (isFirstLoad === true) {
      ListenForCapacityChanges();
      isFirstLoad = false;
    } else {
      UpdateCapacityInRows();
      Loading(mainLoader, false);
    }
  }

  function ListenForCapacityChanges() {
    onValue(ref_db(database, "Capacities/"), (snapshot) => {
      groupsCurrCapac = [];

      //Load all capacity data
      snapshot.forEach((group) => {
        group.forEach((week) => {
          week.forEach((day) => {
            var capData = { group: group.key, week: decodeURIComponent(week.key), day: day.key, capacity: day.val() };
            groupsCurrCapac.push(capData);
          });
        });
      });

      UpdateCapacityInRows();

      Loading(mainLoader, false);
    }, error => {
      console.log(error.code + ": " + error.message);
    });
  }

  function UpdateCapacityInRows() {
    //Capacity is loaded for each group's days, now update planning rows for those that are loaded
    var filteredByCurrGroup = groupsCurrCapac.filter(g => hostNameArr.find(h => hostSelection.value === h.host).group === g.group);

    filteredByCurrGroup.forEach((week) => {
      var tableElem = document.getElementById(week.week + "-planning");
      if (tableElem != null) {
        var tableElemArr = Array.from(tableElem.children);

        tableElemArr.forEach((row) => {
          var rowDate = row.children[0].textContent.split('/')[0];
          if (row.classList.contains('table-row') && rowDate === week.day) {
            row.children[2].textContent = week.capacity;
            var isRSVPd = row.children[3].children[0].classList.contains('rsvp-cancel-button');

            if (week.capacity === 1) {
              //Only user can rsvp, no friends
              row.children[3].children[0].classList.remove('rsvp-disabled');
              row.children[4].children[0].classList.remove('counter-disabled');
              if (isRSVPd === false) {
                row.children[4].children[0].classList.add('counter-disabled');
              }
            } else if (week.capacity === 0) {
              //No one can rsvp
              row.children[3].children[0].classList.remove('rsvp-disabled');
              row.children[4].children[0].classList.remove('counter-disabled');
              if (isRSVPd === false) {
                row.children[3].children[0].classList.add('rsvp-disabled');
                row.children[4].children[0].classList.add('counter-disabled');
              }
            } else {
              if (isRSVPd === false) {
                row.children[3].children[0].classList.remove('rsvp-disabled');
                row.children[4].children[0].classList.remove('counter-disabled');
                if (parseInt(row.children[4].children[0].children[1].value, 10) >= week.capacity) {
                  row.children[4].children[0].children[1].value = week.capacity - 1;
                }
              }
            }
          }
        });
      }
    });
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
    var headerDiv2 = document.createElement('div'); headerDiv2.className = "col"; headerDiv2.textContent = "General Location"; tableHeader.appendChild(headerDiv2);
    var headerDiv3 = document.createElement('div'); headerDiv3.className = "col"; headerDiv3.textContent = "Spaces Available"; tableHeader.appendChild(headerDiv3);
    var headerDiv4 = document.createElement('div'); headerDiv4.className = "col"; headerDiv4.textContent = "I'm Going"; tableHeader.appendChild(headerDiv4);
    var headerDiv5 = document.createElement('div'); headerDiv5.className = "col"; headerDiv5.textContent = "Friends"; tableHeader.appendChild(headerDiv5);
    parentElem.appendChild(tableHeader);
  }

  function CreatePlanningTableRow(elem, groupInfoArr, groupID, parentElem, userScheduleArr) {
    var row = document.createElement('li');
    row.className = "table-row";

    var col1 = document.createElement('div'); col1.className = "col"; col1.setAttribute('data-label', "Day/Time:"); col1.textContent = elem.day + "/" + elem.time; row.appendChild(col1);
    var col2 = document.createElement('div'); col2.className = "col"; col2.setAttribute('data-label', "General Location:"); col2.textContent = groupInfoArr.find(g => g.group === groupID).location; row.appendChild(col2);

    //Check user schedule to update these values if they exist
    //First create elements, update values if needed, then add to row in order
    var col3 = document.createElement('div'); col3.className = "col"; col3.setAttribute('data-label', "Spaces Available:"); col3.textContent = groupInfoArr.find(g => g.group === groupID).capacity;

    var col4 = document.createElement('div'); col4.className = "col"; col4.setAttribute('data-label', "I'm Going:");
    var rsvp = document.createElement('button'); rsvp.className = "rsvp-button"; rsvp.setAttribute('data-groupID', groupID); rsvp.setAttribute('data-week', elem.week); rsvp.setAttribute('data-day', elem.day);

    var col5 = document.createElement('div'); col5.className = "col"; col5.setAttribute('data-label', "Friends:");
    var counter = document.createElement('div'); counter.className = "counter";
    var minus = document.createElement('span'); minus.className = "guest-down"; var minusIcon = document.createElement('i'); minusIcon.className = "fa-solid fa-minus"; minus.appendChild(minusIcon);
    var counterInput = document.createElement('input'); counterInput.setAttribute("id", "counter-input-" + groupID + '-' + elem.week + '-' + elem.day); counterInput.setAttribute("type", "text"); counterInput.value = 0;
    var plus = document.createElement('span'); plus.className = "guest-up"; var plusIcon = document.createElement('i'); plusIcon.className = "fa-solid fa-plus"; plus.appendChild(plusIcon);

    //Check schedule
    if (userScheduleArr != null) {
      userScheduleArr.forEach((userDay) => {
        if (elem.day === userDay.day && elem.time === userDay.time) {
          minus.classList.add('hide'); plus.classList.add('hide');
          counterInput.value = userDay.guests;
          rsvp.classList.add('rsvp-cancel-button');
        }
      });
    }

    //Add elements to row then to parent
    row.appendChild(col3);
    col4.appendChild(rsvp); row.appendChild(col4);
    counter.appendChild(minus); counter.appendChild(counterInput); counter.appendChild(plus); col5.appendChild(counter); row.appendChild(col5);

    parentElem.appendChild(row);
  }
  //#endregion Planning Setup

  //#region Week Menu Dropdown
  function SetupDropdowns(select, optionsArr, isHostArr) {
    //Create List item options
    select.replaceChildren();

    if (isAdmin === true && select === document.getElementById('dashboard-msg-days')) {
      var option = document.createElement('option');
      option.value = "default";
      option.innerText = "All RSVPs This Week";
      select.appendChild(option);
    }

    optionsArr.forEach((elem) => {
      var option = document.createElement('option');
      option.value = isHostArr === true ? elem.host : elem;
      option.innerText = isHostArr === true ? elem.host : elem;
      select.appendChild(option);
    });

    select[0].selected = 'selected';
    select.removeEventListener('change', HandleSelectChange);
    select.addEventListener('change', HandleSelectChange);

    // Show the first container from the first option in lists
    if (!isHostArr) {
      ShowEventContainers(optionsArr[0], "planning-container");
      ShowEventContainers(optionsArr[0], "overview-container");
    }
  }
  //#endregion

  //#region Click Functions
  function HandleSelectChange(event) {
    const selectElem = event.target;

    if (selectElem === overviewWeekSelection || selectElem === planWeekSelection) {
      //Make sure both week selects for plan and overview are equal
      //First check if that value exists as an option in the planning selection
      for (let index = 0; index < planWeekSelection.length; index++) {
        if (planWeekSelection.options[index].value === selectElem.value) {
          planWeekSelection.value = selectElem.value;
          ShowEventContainers(selectElem.value, "planning-container");
        }
      }

      //Switch Event Containers based on selection 
      //First check if the selectElem.value is coming from an empty planning section
      if (selectElem.value != "No Days Available") {
        overviewWeekSelection.value = selectElem.value;
        ShowEventContainers(selectElem.value, "overview-container");
      }
    } else if (selectElem === document.getElementById('dashboard-msg-weeks')) {
      GetRSVPdUsersByWeek(selectElem.value);
      var specificWeek = hostWeeksArr.filter(h => h.week === selectElem.value);
      var uniqHostDays = [...new Set(specificWeek.map(item => item.day))]; DaySorter(uniqHostDays, true);
      SetupDropdowns(document.getElementById('dashboard-msg-days'), uniqHostDays, false);
    } else if (selectElem === document.getElementById('dashboard-msg-days')) {
      if (document.getElementById('dashboard-msg-days').value === "default") {
        GetRSVPdUsersByWeek(document.getElementById('dashboard-msg-weeks').value);
      } else {
        GetRSVPdUsersByDay(document.getElementById('dashboard-msg-days').value, document.getElementById('dashboard-msg-weeks'));
      }
    }
    else {
      //Host Selection Dropdown
      const selectedWeek = allWeeksArr.length > 0 ? document.getElementById('plan-week-selection').value : "No Weeks Available";
      PlanningSetup(planRef, auth?.currentUser.isAnonymous, hostNameArr.find(h => h.host === selectElem.value).group, userScheduleArr, selectedWeek);
    }
  }

  document.addEventListener('click', function (e) {
    e.stopPropagation();

    //About/Help Buttons 
    var dashboardHelpBtn = e.target.closest('.help-button');
    var aboutHelpCloseBtn = e.target.closest('.abouthelp-close-btn');

    if (dashboardHelpBtn) {
      var pageId = dashboardHelpBtn.getAttribute('data-pageId');
      var helpPage = document.getElementById(pageId);

      if (!helpPage.classList.contains('show')) {
        helpPage.classList.add('show');
      }
    }

    if (aboutHelpCloseBtn) {
      var pageId = aboutHelpCloseBtn.getAttribute('data-pageId');
      var aboutHelpPage = document.getElementById(pageId);

      if (aboutHelpPage.classList.contains('show')) {
        aboutHelpPage.classList.remove('show');
      }
    }

    //Show/Hide password
    const eyeIcon = e.target.closest('.eye-icon');

    if (eyeIcon) {
      if (eyeIcon.classList.contains('fa-eye')) {
        eyeIcon.className = "fa-solid fa-eye-slash eye-icon";
        eyeIcon.parentElement.children[0].setAttribute('type', 'text');
      } else {
        eyeIcon.className = "fa-solid fa-eye eye-icon";
        eyeIcon.parentElement.children[0].setAttribute('type', 'password');
      }
    }

    //Clickable rows
    const row = e.target.closest('.clickable-row');

    if (row) {
      var liTarget = row.children[2].textContent;
      const selectedWeek = document.getElementById('over-week-selection');
      hostSelection.value = liTarget;

      if (auth?.currentUser.isAnonymous === true) {
        PlanningSetup(planRef, auth?.currentUser.isAnonymous, hostNameArr.find(h => h.host === liTarget).group, userScheduleArr, selectedWeek.value);
      } else if (auth?.currentUser.isAnonymous === false && auth?.currentUser.emailVerified === true) {
        PlanningSetup(planRef, auth?.currentUser.isAnonymous, hostNameArr.find(h => h.host === liTarget).group, userScheduleArr, selectedWeek.value);
      }
      tabPlanning.click();
    }

    //RSVP Buttons
    const rsvp = e.target.closest('.rsvp-button');

    if (rsvp) {
      var guests = rsvp.parentElement.parentElement.children[4].children[0];

      if (guests.classList.contains('counter-disabled')) {
        guests.children[1].value = 0;
      }

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
      if (contactButton && chatSliderHosts.checked === false) {
        chatSliderHosts.checked = true;
        chatSliderUsers.checked = false;

        //Setup each host in Contact Host section
        chatHosts.replaceChildren();
        hostNameArr.forEach((host) => {
          ChatHostsSetup(chatHosts, host.host);
        });
      }

      SetupMessagingRequirements(auth, registration);

      if (isAdmin === true && chatSliderUsers.checked === true) {
        chatHosts.replaceChildren();
        GetContactUsersFromDB(adminHostName);
      }

      SortChatHostsAndRemoveBadge(messagesButton, chatHosts);

      if (!chatScreen.classList.contains('show')) {
        chatScreen.classList.add('show');
        if (contactButton) {
          tabProfile.click();
          ShowChatScreen(contactButton.getAttribute('data-host'), contactButton.getAttribute('data-host'), auth?.currentUser.uid);
        }
      }
    }

    //Edit Info Button
    var editInfoBtn = e.target.closest(".editinfo-button");

    if (editInfoBtn) {
      if (!editInfoScreen.classList.contains('show')) {
        editInfoScreen.classList.add('show');
      }
    }

    //Chat sliders
    if (isAdmin === true) {
      const slideHost = e.target.closest('.slide-hosts');
      const slideUser = e.target.closest('.slide-users');

      if (slideHost && chatSliderHosts.checked === false) {
        Loading(chatHostLoader, true);
        chatHostsList.children[0].textContent = "Contact Hosts";
        //Setup each host in Contact Host section
        chatHosts.replaceChildren();
        hostNameArr.forEach((host) => {
          ChatHostsSetup(chatHosts, host.host);
        });
        SortChatHostsAndRemoveBadge(null, chatHosts);
        Loading(chatHostLoader, false);
      } else if (slideUser && chatSliderUsers.checked === false) {
        Loading(chatHostLoader, true);
        chatHostsList.children[0].textContent = "Contact Users";
        //Setup each user who asked a question in Contact User Section
        chatHosts.replaceChildren();
        GetContactUsersFromDB(adminHostName);
      }
    }

    //Admin dashboard button
    var dashboardButton = e.target.closest('.dashboard-button');

    if (dashboardButton) {
      if (!dashboardPage.classList.contains('show')) {
        dashboardPage.classList.add('show');
        GetRSVPdUsersByWeek(document.getElementById('dashboard-msg-weeks').value);
        var specificWeek = hostWeeksArr.filter(h => h.week === document.getElementById('dashboard-msg-weeks').value);
        var uniqHostDays = [...new Set(specificWeek.map(item => item.day))]; DaySorter(uniqHostDays, true);
        SetupDropdowns(document.getElementById('dashboard-msg-days'), uniqHostDays, false);
        ShowCurrentScheduledDays(); SetupDateTime();
      } else {
        dashboardPage.classList.remove('show');
      }
    }

    //Admin dashboard close button
    var dashboardClose = e.target.closest('#dashboard-close-btn');

    if (dashboardClose) {
      if (!dashboardPage.classList.contains('show')) {
        dashboardPage.classList.add('show');
      } else {
        dashboardPage.classList.remove('show');
      }
    }

    //Admin dashboard view user 
    var rsvpdUser = e.target.closest('.rsvpd-user');

    if (rsvpdUser) {
      var userPage = document.getElementById('viewUser-page');
      if (!userPage.classList.contains('show')) {
        userPage.classList.add('show');

        var usersName = rsvpdUser.textContent;
        if (document.getElementById('dashboard-msg-days').value != "default") {
          usersName = rsvpdUser.textContent.split("\n Guests:")[0];
        }

        ViewRSVPdUser(usersName);
      }
    }

    //Admin dashboard send user msg
    var sendUserMsg = e.target.closest("#viewuser-send-btn");
    var textInput = document.getElementById("viewuser-msg-input");

    if (sendUserMsg && textInput.value.trim() != null && textInput.value.length > 0) {
      var parentElem = document.querySelector("#viewUser-page > div > div > div.viewUser-header");
      SendViewedUserMessage(parentElem.children[1].textContent, textInput);
    }

    //Admin dashboard send messages
    var sendMsgs = e.target.closest('#dashboard-send-btn');
    const rsvpContent = document.getElementById('dashboard-rsvp-content');

    if (sendMsgs) {
      const msgBox = document.getElementById('dashboard-msg-input');
      if (msgBox.value.trim() != null && msgBox.value.length > 0) {
        if (!rsvpContent.classList.contains('no-rsvps')) {
          var rsvpsArr = Array.from(rsvpContent.children);
          SendMsgToAllRsvpUsers(rsvpsArr, msgBox);
        }
      }
    }

    //Contact From Messages
    const contact = e.target.closest('.chat-host');

    if (contact) {
      //Remove new msg status & entry from userunreadchats & db
      contact.children[2].classList.remove('new-msg');
      const contactName = contact.children[1].children[0].textContent;
      const index = userUnreadChats.indexOf(contactName);
      if (index !== -1) { userUnreadChats.splice(index, 1) };
      UpdateUnreadChatsStatus(contactName, "remove");

      SortChatHostsAndRemoveBadge(null, chatHosts);
      if (isAdmin === true) {
        if (chatSliderHosts.checked === true) {
          ShowChatScreen(contactName, contactName, auth?.currentUser.uid);
        } else if (chatSliderUsers.checked === true) {
          ShowChatScreen(adminHostName, contactName, userNameArr.find(u => u.name === contactName).uid);
        }
      } else {
        ShowChatScreen(contactName, contactName, auth?.currentUser.uid);
      }
    }

    //Admin Dashboard Add Day button
    var addDayButton = e.target.closest('#dashboard-add-day');

    if (addDayButton) {
      AddDayToList();
    }

    //Admin Dashboard Remove Day Button and Day Click
    var addedDay = e.target.closest('.added-day');
    var scheduledDay = e.target.closest('.scheduled-day');
    var removeDayButton = e.target.closest('#dashboard-remove-day');

    if (addedDay) {
      if (!addedDay.classList.contains('day-clicked')) {
        addedDay.classList.add('day-clicked');
      } else {
        addedDay.classList.remove('day-clicked');
      }
    }

    if (scheduledDay) {
      if (!scheduledDay.classList.contains('day-clicked')) {
        scheduledDay.classList.add('day-clicked');
      } else {
        scheduledDay.classList.remove('day-clicked');
      }
    }

    if (removeDayButton) {
      const dashboardDays = document.getElementById('dashboard-days-content');
      const sorter = { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" };
      var isDBUpdate = false; const dayUpdates = {}; var localDaysToRemove = [];

      Array.from(dashboardDays.children).forEach((day) => {
        if (day.classList.contains('day-clicked')) {
          if (day.classList.contains('added-day')) {
            day.remove();
          } else if (day.classList.contains('scheduled-day')) {
            isDBUpdate = true;
            //First get day of week
            var dateString = day.textContent.split(" at ")[0] + " 12:00 AM"; var dayDate = new Date(dateString);
            var dayOfWeek = sorter[dayDate.getDay()];

            //Find which week this day belongs to
            hostWeeksArr.forEach((week) => {
              var splitWeek = week.week.split('-');
              var beginString = splitWeek[0] + " 12:00 AM"; var beginWeek = new Date(beginString);
              var endString = splitWeek[1] + " 11:59 PM"; var endWeek = new Date(endString);

              if (dayDate.getTime() >= beginWeek.getTime() && dayDate.getTime() <= endWeek.getTime()) {
                //Now add it to updates to be removed then add to array to remove locally
                dayUpdates["Capacities/" + adminGroup + "/" + encodeURIComponent(week.week) + "/" + dayOfWeek] = null;
                dayUpdates["Groups/" + adminGroup + "/Weeks/" + encodeURIComponent(week.week) + "/" + dayOfWeek] = null;
                localDaysToRemove.push(day);
              }
            });
          }
        }
      });

      if (isDBUpdate === true) {
        //Perform update operation in db
        update(ref_db(database), dayUpdates).then(() => {
          ShowNotifToast("Days Removed", 'The days you choose have been removed from your schedule.', "var(--green)", true, 5);
          localDaysToRemove.forEach(day => { day.remove(); });
          ShowCurrentScheduledDays();
        })
          .catch((error) => {
            console.log(error.code + ": " + error.message);
            ShowNotifToast("Error Removing Days", "There was an error when trying to remove days from your schedule. Please try again.", "var(--red)", true, 5);
          });
      } else {
        if (dashboardDays.children.length === 0) {
          var noDay = document.createElement('p'); noDay.textContent = "No Scheduled Days Yet";
          dashboardDays.appendChild(noDay);
          dashboardDays.classList.add('no-days');
        }
      }
    }

    //Admin dashboard schedule days
    var schedDays = e.target.closest('#dashboard-schedule-days');
    const daysContent = document.getElementById('dashboard-days-content');

    if (schedDays) {
      if (!daysContent.classList.contains('no-days')) {
        var daysArr = Array.from(daysContent.children);

        ScheduleDays(daysArr);
      }
    }
  });

  var isZooming = false;
  document.addEventListener('touchstart', e => {
    if (e.touches.length > 1) {
      isZooming = true;
    } else if (e.touches.length === 1) {
      isZooming = false;
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }
  });

  document.addEventListener('touchend', e => {
    if (isZooming === false) {
      touchEndY = e.changedTouches[0].screenY;

      if (Math.abs((touchStartY - touchEndY)) < 30) {
        touchEndX = e.changedTouches[0].screenX;
        SwitchTabOnSwipe();
      }
    }
  });

  function SwitchTabOnSwipe() {
    //Make sure no pop ups or overlays are being shown first
    if (!loginScreen.classList.contains('show') && mainLoader.classList.contains('fadeOut')
      && !chatScreen.classList.contains('show') && !dashboardPage.classList.contains('show')
      && !editInfoScreen.classList.contains('show') && !aboutHelpPage.classList.contains('show')
      && !loadingErrorPage.classList.contains('show') && isZooming === false) {
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

  function SortChatHostsAndRemoveBadge(messagesButton, arrElem) {
    if (!messagesButton) {
      messagesButton = document.getElementById('messages-button');
    }

    //Sort the contacts by new-msg status
    var chatContactsArr = Array.from(arrElem.children);

    //First Move contacts with new msg status to end of list
    chatContactsArr.forEach((contact) => {
      if (contact.children[2].classList.contains('new-msg')) {
        arrElem.appendChild(contact);
      }
    });

    //Remove notif badges if no new messages
    if (userUnreadChats.length === 0) {
      messagesButton.removeAttribute('data-notif');
      const tabProfileLabel = document.querySelector('.tabs-ul .new-msg-notif label');
      tabProfileLabel.removeAttribute('data-notif');
    }

    //Now move the rest to end of list to make them on bottom
    chatContactsArr.forEach((contact) => {
      if (!contact.children[2].classList.contains('new-msg')) {
        arrElem.appendChild(contact);
      }
    });
  }

  function ShowChatScreen(hostName, displayName, userID) {
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

    chatHostName.textContent = displayName;
    chatHostsList.classList.add('fadeOut');
    chatView.style.display = 'inline-grid'; chatView.classList.add('fadeInChat');

    //Get messages from db and Update UI
    get(ref_db(database, 'UsersMessages/' + hostName + '/' + userID + '/')).then((snapshot) => {
      chatMessages.replaceChildren();
      if (snapshot.size > 0) {
        //Array used to hold all messages. After obtaining
        //all msgs, sort the array by the msg timestamp
        const allMsgsArr = [];

        //Host messages
        snapshot.child('HostMsgs').forEach((msg) => {
          if (isAdmin === true && chatSliderUsers.checked === true) {
            allMsgsArr.push({ timestamp: msg.key, message: msg.val(), side: "right" });
          } else {
            allMsgsArr.push({ timestamp: msg.key, message: msg.val(), side: "left" });
          }
        });

        //User messages
        snapshot.child('UserMsgs').forEach((msg) => {
          if (isAdmin === true && chatSliderHosts.checked === true) {
            allMsgsArr.push({ timestamp: msg.key, message: msg.val(), side: "right" });
          } else if (isAdmin === true && chatSliderUsers.checked === true) {
            allMsgsArr.push({ timestamp: msg.key, message: msg.val(), side: "left" });
          } else {
            allMsgsArr.push({ timestamp: msg.key, message: msg.val(), side: "right" });
          }
        });

        //Sort the array by timestamp
        allMsgsArr.sort(function sortByTimestamp(a, b) {
          return a.timestamp - b.timestamp;
        });

        //Create message bubbles and day labels
        var prevLabelDate = null
        const daySorter = { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" };
        const monthSorter = { 0: "Jan", 1: "Feb", 2: "March", 3: "April", 4: "May", 5: "June", 6: "July", 7: "Aug", 8: "Sept", 9: "Oct", 10: "Nov", 12: "Dec" };
        allMsgsArr.forEach((msg) => {
          const msgDate = new Date(parseInt(msg.timestamp)); msgDate.setHours(0, 0, 0);
          const monthStr = monthSorter[msgDate.getMonth()];
          const dayStr = daySorter[msgDate.getDay()];
          const msgDayLabel = document.createElement('label');
          msgDayLabel.textContent = dayStr + ", " + monthStr + ' ' + msgDate.getDate();

          if (prevLabelDate === null || prevLabelDate != msgDayLabel.textContent) {
            chatMessages.appendChild(msgDayLabel);
          }

          CreateMessageBubble(chatMessages, msg.message, msg.side, msg.timestamp);
          prevLabelDate = msgDayLabel.textContent;
        });
      } else {
        var noMsgsLabel = document.createElement('label');
        noMsgsLabel.textContent = "No Messages";
        chatMessages.appendChild(noMsgsLabel);
      }
      Loading(chatLoader, false);
    }).catch((error) => {
      console.log(error.code + ": " + error.message);
      ShowNotifToast("Error Loading Messages", "There was an error loading your messages. Either close this screen and try opening it again or refresh the page.", "var(--red)", true, 5);
    });
  }

  function GetContactUsersFromDB(hostName) {
    get(ref_db(database, 'UsersMessages/' + hostName + '/')).then((snapshot) => {
      if (snapshot.size > 0) {
        userNameArr = [];
        //Get each username and setup in chat
        snapshot.forEach((userID) => {
          get(ref_db(database, 'Users/' + userID.key + '/Name')).then((userName) => {
            const userData = { uid: userID.key, name: userName.val() };
            userNameArr.push(userData);
            ChatUsersSetup(chatHosts, userName.val());
            SortChatHostsAndRemoveBadge(null, chatHosts);
            Loading(chatHostLoader, false);
          }).catch((error) => {
            console.log(error);
          });
        });
      } else {
        Loading(chatHostLoader, false);
      }
    }).catch((error) => {
      Loading(chatHostLoader, false);
      console.log(error.code + ": " + error.message);
      ShowNotifToast("Error Loading Users", "There was an error loading the users that have contacted you. Either close this screen and open it again or try refreshing the page.", "var(--red)", true, 8);
    });
  }

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

  function ValidateRSVP(auth, button, isNotRsvp) {
    setTimeout(function () {
      //Get info from elements
      var row = button.parentElement.parentElement;
      var dayAndTime = row.children[0].textContent.split('/');
      var groupID = button.getAttribute('data-groupID');
      var groupNum = groupID.split(' ')[1];
      var decodedWeek = button.getAttribute('data-week');
      var week = encodeURIComponent(decodedWeek);
      var guests = row.children[4].children[0].children[1];
      const updates = {};
      const totalRsvpElem = document.getElementById('user-total-rsvp');

      if (isNotRsvp === true) {
        guests.nextElementSibling.classList.remove('hide');
        guests.previousElementSibling.classList.remove('hide');

        //Remove day from user schedule in db
        set(ref_db(database, 'Users/' + auth?.currentUser.uid + '/Schedule/' + week + '/' + dayAndTime[0] + '-' + groupNum), {
          GroupID: null,
          Guests: null,
          Time: null,
        })
          .then(() => {
            //Remove rsvp from RSVPs in db
            remove(ref_db(database, 'RSVPs/' + groupID + "/" + week + "/" + dayAndTime[0] + "/" + auth?.currentUser.uid));
            //Increase capacity depending on guest value
            updates['Capacities/' + groupID + '/' + week + '/' + dayAndTime[0]] = increment(parseInt(guests.value, 10) + 1);
            //Subtract total day rsvp from user
            updates['Users/' + auth?.currentUser.uid + "/Total RSVP'd"] = increment(-1);
            update(ref_db(database), updates).then(() => {
              totalRsvpElem.textContent = --userTotalRSVP;
              button.classList.remove('button-onClick');
              button.classList.add('rsvp-validate');
              guests.value = 0;

              //Remove from userScheduleArr to keep data valid
              const scheduleIndex = userScheduleArr.findIndex(u => u.group === groupID && u.week === decodedWeek && u.day === dayAndTime[0] && u.time === dayAndTime[1]);
              if (scheduleIndex !== -1) userScheduleArr.splice(scheduleIndex, 1);
              setTimeout(ApproveRSVP(button, isNotRsvp), 450);
            });
          })
          .catch((error) => {
            guests.nextElementSibling.classList.remove('hide');
            guests.previousElementSibling.classList.remove('hide');
            button.classList.remove('button-onClick');
            console.log(error.code + ": " + error.message);
            ShowNotifToast("Error Removing RSVP", "There was an error while trying to remove an RSVP from your schedule. Please try to Cancel RSVP again.", "var(--red)", true, 5);
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
            //Update capacity based on guests and user
            updates['Capacities/' + groupID + '/' + week + '/' + dayAndTime[0]] = increment(-(parseInt(guests.value, 10) + 1));
            //Add total day rsvp from user
            updates['Users/' + auth?.currentUser.uid + "/Total RSVP'd"] = increment(1);
            //Add to RSVPs in db with user's name and number of guests
            const rsvpData = { Name: userFullName, Guests: guests.value };
            updates['RSVPs/' + groupID + "/" + week + "/" + dayAndTime[0] + "/" + auth?.currentUser.uid] = rsvpData;
            update(ref_db(database), updates).then(() => {
              totalRsvpElem.textContent = ++userTotalRSVP;
              button.classList.remove('button-onClick');
              button.classList.add('rsvp-validate');

              //Add to userScheduleArr to keep data valid
              const scheduleDay = { week: decodedWeek, day: dayAndTime[0], time: dayAndTime[1], guests: guests.value, group: groupID };
              userScheduleArr.push(scheduleDay);
              setTimeout(ApproveRSVP(button, isNotRsvp), 450);
            });
          })
          .catch((error) => {
            guests.nextElementSibling.classList.remove('hide');
            guests.previousElementSibling.classList.remove('hide');
            button.classList.remove('button-onClick');
            console.log(error.code + ": " + error.message);
            ShowNotifToast("Error Adding RSVP", "There was an error while trying to add an RSVP to your schedule. Please try to RSVP again.", "var(--red)", true, 5);
          });
      }
    }, 1250);
  }

  function ApproveRSVP(button, isNotRsvp) {
    setTimeout(function () {
      //Add or remove badge on clickable row in overview on the day of the RSVP      
      const groupID = button.getAttribute('data-groupID');
      const week = button.getAttribute('data-week');
      const day = button.getAttribute('data-day');

      if (isNotRsvp === true) {
        button.classList.remove('rsvp-cancel-button');
        AddOrRemoveNotifBadge(groupID + '-' + week + '-' + day, null, 'remove')
      } else {
        button.classList.add('rsvp-cancel-button');
        AddOrRemoveNotifBadge(groupID + '-' + week + '-' + day, 'RSVP\'d', 'add');
      }
      button.classList.remove('rsvp-validate');
      UpdateCapacityInRows(true);
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
    var curCap = parseInt(input.parentElement.parentElement.parentElement.children[2].textContent, 10);
    if (value < (curCap - 1)) {
      value++;
      input.value = value;
    }
  }

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
  //#endregion Click Functions
});