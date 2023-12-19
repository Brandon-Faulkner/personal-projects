//#region Firebase Initalization
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app.js";
import { getDatabase, ref, onValue, child, push, set } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-database.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkhBqKXXHQcgk9QYS7TTCY9I1kjx_bowk",
  authDomain: "cana-launchpad.firebaseapp.com",
  projectId: "cana-launchpad",
  storageBucket: "cana-launchpad.appspot.com",
  messagingSenderId: "47186518351",
  appId: "1:47186518351:web:d40c2d357ead5636b8653a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Realtime Database
const database = getDatabase(app);

const connectedRef = ref(database, ".info/connected");
const isUsableRef = ref(database, 'UserApp/isUsable');
const projectOwnerRef = ref(database, 'UserApp/CurrentProject');
const sponsorNameRef = ref(database, 'UserApp/CurrentSponsor');
const prayerBoardRef = ref(database, 'UserApp/isPrayerBoardOn');
const donorBoardRef = ref(database, 'UserApp/isDonorBoardOn');
const teamBoardRef = ref(database, 'UserApp/isTeamBoardOn');
//#endregion Firebase Initialization

//#region Main Functions
window.addEventListener('load', (event) => {
  //#region Variables
  //Overlay Elems
  const loadingAnim = document.getElementById("loader");
  const loadingOverlay = document.getElementById("loading-overlay");
  const notTimeBox = document.getElementById("not-time-box");
  const mainOverlay = document.getElementById("main-overlay");
  const overlayMainBox = document.getElementById("overlay-mainbox");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayTextBox = document.getElementById("overlay-textbox");
  const btnOverlayCancel = document.getElementById("btnOverlayCancel");
  const btnOverlaySubmit = document.getElementById("btnOverlaySubmit");

  //Overlay Messages - Option Not Selected, Amount Is Empty, Submission Successful, Database Error
  const submitOptionText = "It looks like you didn't select from one of the available options to be apart of for this project. Before you submit, please make sure to select any option(s)."
  const submitAmountText = "Please enter your donation amount to update the leaderboard. We'll contact you after LaunchPad to finalize your donation. Press submit after entering the amount."
  const submitSuccessText = "Your name and options for the project are submitted successfully and should show on the Leaderboard! If you chose to be a Donor/Pledger, no payment today; we'll reach out post LaunchPad for the contribution."
  const submitErrorText = "Oops! Something went wrong with your submission. Please submit again or reload the page and submit."

  //Main page Elems
  const projectOwnerName = document.getElementById("project-owner-name");
  const sponsorName = document.getElementById("sponor-name");
  const prayerBoard = document.getElementById("prayer");
  const donorBoard = document.getElementById("donor");
  const teamBoard = document.getElementById("team");

  const btnQuestion = document.getElementById("btnQuestion");
  const usersName = document.getElementById("usersName");
  const btnSubmit = document.getElementById("btnSubmit");

  const inputCurrency = document.getElementById("currency-field");
  inputCurrency.addEventListener("keyup", function () { FormatCurrency(inputCurrency) });
  inputCurrency.addEventListener("blur", function () { FormatCurrency(inputCurrency, "blur") });
  //#endregion Variables

  //#region Firebase Listeners
  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      onValue(isUsableRef, (snapshot) => {
        if (String(snapshot.val()) === "true") {
          setTimeout(function () {
            FadeElems(loadingOverlay, false);
            FadeElems(notTimeBox, false);
            FadeElems(loadingAnim, false);
          }, 1000);
        }
        else {
          FadeElems(loadingOverlay, true);
          FadeElems(notTimeBox, true);
          FadeElems(loadingAnim, true);
        }
      });
    }
  });

  //Determine the Current Project Owner
  onValue(projectOwnerRef, (snapshot) => {
    const project = snapshot.val();
    projectOwnerName.textContent = project;

    inputCurrency.value = "";
    document.getElementById("prayerNo").checked = true;
    document.getElementById("donorNo").checked = true;
    document.getElementById("teamNo").checked = true;
  });

  //Determine the Current Sponsor
  onValue(sponsorNameRef, (snapshot) => {
    const sponsor = snapshot.val();
    sponsorName.textContent = sponsor;
  });

  //Prayer Board
  onValue(prayerBoardRef, (snapshot) => {
    const prayer = snapshot.val();

    if (String(prayer) === "true") {
      FadeElems(prayerBoard, true);
    }
    else if (String(prayer) === "false") {
      FadeElems(prayerBoard, false);
    }
  });

  //Donor Board
  onValue(donorBoardRef, (snapshot) => {
    const donor = snapshot.val();

    if (String(donor) === "true") {
      inputCurrency.disabled = false;
      FadeElems(donorBoard, true);
    }
    else if (String(donor) === "false") {
      inputCurrency.disabled = true;
      FadeElems(donorBoard, false);
    }
  });

  //Team Board
  onValue(teamBoardRef, (snapshot) => {
    const team = snapshot.val();

    if (String(team) === "true") {
      FadeElems(teamBoard, true);
    }
    else if (String(team) === "false") {
      FadeElems(teamBoard, false);
    }
  });
  //#endregion Firebase Listeners

  //#region Event Listeners
  usersName.addEventListener('input', function () {
    this.value = this.value.replace(/[0123456789,./\\/-=+/';"\]\[{}/()!@#$%^&*`~_<>?:|/]/g, "");
    if (usersName.value.trim().length >= 1) {
      FadeElems(btnSubmit, true)
    }
    else {
      FadeElems(btnSubmit, false);
    }
  });

  btnQuestion.addEventListener('click', function () {
    FadeElems(mainOverlay, true);
    UpdatePopup("question", "What's on your mind?", "true", "");
  });

  btnOverlayCancel.addEventListener('click', function () {
    FadeElems(mainOverlay, false);
    UpdatePopup("popup", "Title", "false", "");
  });

  btnOverlaySubmit.addEventListener('click', function () {
    FadeElems(mainOverlay, false);

    if (overlayMainBox.getAttribute("data-type") == "question") {
      if (overlayTextBox.textContent != "" && overlayTextBox.textContent != " ") {
        //Submit the question to the DB under UserApp/Questions
        push(child(ref(database), 'UserApp/Questions'), overlayTextBox.textContent);
      }
    }
  
    UpdatePopup("popup", "Title", "false", "");
  });

  btnSubmit.addEventListener('click', function () {
    var donorPath = projectOwnerName.textContent + "/Board:Donors/Names";
    var prayerPath = projectOwnerName.textContent + "/Board:PrayerPartners/Names";
    var teamPath = projectOwnerName.textContent + "/Board:TeamMembers/Names";

    var prayerValue = document.querySelector('input[name="prayerRadio"]:checked').value;
    var donorValue = document.querySelector('input[name="donorRadio"]:checked').value;
    var teamValue = document.querySelector('input[name="teamRadio"]:checked').value;

    try {
      FadeElems(mainOverlay, true);

      //Determine which submit overlay to show
      if (prayerValue == "no" && donorValue == "no" && teamValue == "no") {
        UpdatePopup("popup", "Option Not Selected", "false", submitOptionText);
      }
      else {
        if (donorValue == "yes") {
          var editedAmount = String(inputCurrency.value).replace(/[$,]/g, "");

          if (editedAmount > 0) {
            //Submit to donor location in DB        
            var donorKey = push(child(ref(database), 'Projects/' + donorPath)).key;
            set(child(ref(database), 'Projects/' + donorPath + "/" + donorKey), {
              Name: usersName.value.trim(),
              Pledge: Number(editedAmount)
            });

            //Submit to prayer location in DB if yes
            if (prayerValue == "yes") {
              push(child(ref(database), 'Projects/' + prayerPath), usersName.value.trim());
            }

            //Submit to team location in DB if yes
            if (teamValue == "yes") {
              push(child(ref(database), 'Projects/' + teamPath), usersName.value.trim());
            }

            UpdatePopup("popup", "Submission Successful", "false", submitSuccessText);
          }
          else {
            UpdatePopup("popup", "Amount Is Empty", "false", submitAmountText);
          }
        }
        else {
          //Submit to prayer location in DB if yes
          if (prayerValue == "yes") {
            push(child(ref(database), 'Projects/' + prayerPath), usersName.value.trim());
          }

          //Submit to team location in DB if yes
          if (teamValue == "yes") {
            push(child(ref(database), 'Projects/' + teamPath), usersName.value.trim());
          }

          UpdatePopup("popup", "Submission Successful", "false", submitSuccessText);
        }
      }
    } catch (error) {
      UpdatePopup("popup", "Error With Submission", "false", submitErrorText);
      console.log(error);
    }
  });
  //#endregion Event Listeners
  
  //#region Helper Functions
  function FormatNumber(n) {
    // 1000000 to 1,234,567
    return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  function FormatCurrency(input, blur) {
    var inputValue = input.value;
  
    // Don't validate empty input
    if (!inputValue.trim()) {
      return;
    }
  
    const originalLength = inputValue.length;
    const caretPosition = input.selectionStart;
  
    // Check for decimal
    if (inputValue.indexOf(".") >= 0) {
      const decimalPosition = inputValue.indexOf(".");
      const leftSide = FormatNumber(inputValue.substring(0, decimalPosition));
      let rightSide = FormatNumber(inputValue.substring(decimalPosition));
  
      leftSide && (inputValue = "$" + leftSide);
      rightSide = rightSide || "00";
  
      // On blur make sure 2 numbers after decimal
      if (blur === "blur") {
        rightSide += "00";
      }
  
      // Limit decimal to only 2 digits
      rightSide = rightSide.substring(0, 2);
      inputValue += "." + rightSide;
  
    } else {
      // No decimal entered
      inputValue = "$" + FormatNumber(inputValue);
    }
  
    // Send updated string to input
    input.value = inputValue;
  
    // Put caret back in the right position
    const updatedLength = inputValue.length;
    const updatedCaretPosition = updatedLength - originalLength + caretPosition;
    input.setSelectionRange(updatedCaretPosition, updatedCaretPosition);
  }
  
  function FadeElems(elem, show) {
    if (show == true) {
      elem.classList.remove("fadeOut");
      elem.classList.add("fadeIn");
    } else {
      elem.classList.remove("fadeIn");
      elem.classList.add("fadeOut");
    }
  }
  
  function UpdatePopup(type, title, editable, content) {
      overlayMainBox.setAttribute("data-type", type);
      overlayTitle.textContent = title;
      overlayTextBox.textContent = content;

      if (editable == "true") {
        overlayTextBox.removeAttribute("disabled");
      } else {
        overlayTextBox.setAttribute("disabled", "true");
      }

      if (type == "question") {
        btnOverlayCancel.style = "";
      } else {
        btnOverlayCancel.style.display = "none";
      }
  }
  //#endregion Helper Functions
});
//#endregion Main Functions