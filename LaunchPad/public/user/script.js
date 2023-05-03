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

//Enable loading screen until Firebase is connected
//Then determine if User App is Usable now or not
const connectedRef = ref(database, ".info/connected");
const loadingContainer = document.getElementById("loading-container");
const isUsableRef = ref(database, 'UserApp/isUsable');
const splashScreenOverlay = document.getElementById("splash-screen-overlay");
const notTimeBox = document.getElementById("not-time-box");

onValue(connectedRef, (snapshot) => {

  if (snapshot.val() === true) {

    onValue(isUsableRef, (snapshot) => {
      const usable = snapshot.val();

      if (String(usable) === "true") {
        setTimeout(function () {
          $(splashScreenOverlay).fadeOut(500);
          $(notTimeBox).fadeOut(500);
          if (!loadingContainer.classList.contains('fade')) {
            loadingContainer.classList.toggle('fade');
          }
        }, 2000);
      }
      else {
        $(splashScreenOverlay).fadeIn(500);
        $(notTimeBox).fadeIn(500);
        if (!loadingContainer.classList.contains('fade')) {
          loadingContainer.classList.toggle('fade');
        }
      }
    });
  }
});

//Determine the Current Project Owner
const projectOwnerRef = ref(database, 'UserApp/CurrentProject');
const projectOwnerName = document.getElementById("project-owner-name");
onValue(projectOwnerRef, (snapshot) => {
  const project = snapshot.val();
  projectOwnerName.textContent = project;

  //Reset amount to null and board choices to no
  var amount = document.getElementById("currency-field");
  var prayerRadio = document.getElementById("prayerNo");
  var donorRadio = document.getElementById("donorNo");
  var teamRadio = document.getElementById("teamNo");

  amount.value = "";
  prayerRadio.checked = true;
  donorRadio.checked = true;
  teamRadio.checked = true;
});

//Determine the Current Sponsor
const sponsorNameRef = ref(database, 'UserApp/CurrentSponsor');
const sponsorName = document.getElementById("sponor-name");
onValue(sponsorNameRef, (snapshot) => {
  const sponsor = snapshot.val();
  sponsorName.textContent = sponsor;
});

//Determine if the Boards are on or not
const prayerBoardRef = ref(database, 'UserApp/isPrayerBoardOn');
const donorBoardRef = ref(database, 'UserApp/isDonorBoardOn');
const teamBoardRef = ref(database, 'UserApp/isTeamBoardOn');

const prayerBoard = document.getElementById("prayer");
const donorBoard = document.getElementById("donor");
const teamBoard = document.getElementById("team");

//Prayer Board
onValue(prayerBoardRef, (snapshot) => {
  const prayer = snapshot.val();

  if (String(prayer) === "true") {
    if (prayerBoard.classList.contains('fade')) {
      prayerBoard.classList.toggle('fade');
    }
  }
  else if (String(prayer) === "false") {
    if (!prayerBoard.classList.contains('fade')) {
      prayerBoard.classList.toggle('fade');
    }
  }
});

//Donor Board
onValue(donorBoardRef, (snapshot) => {
  const donor = snapshot.val();
  const enableDisableAmount = document.getElementById("currency-field");

  if (String(donor) === "true") {
    enableDisableAmount.disabled = false;

    if (donorBoard.classList.contains('fade')) {
      donorBoard.classList.toggle('fade');
    }
  }
  else if (String(donor) === "false") {
    enableDisableAmount.disabled = true;

    if (!donorBoard.classList.contains('fade')) {
      donorBoard.classList.toggle('fade');
    }
  }
});

//Team Board
onValue(teamBoardRef, (snapshot) => {
  const team = snapshot.val();

  if (String(team) === "true") {
    if (teamBoard.classList.contains('fade')) {
      teamBoard.classList.toggle('fade');
    }
  }
  else if (String(team) === "false") {
    if (!teamBoard.classList.contains('fade')) {
      teamBoard.classList.toggle('fade');
    }
  }
});
/**********************************************************************************/

//AMOUNT FORMAT CODE ****************
$("input[data-type='currency']").on({
  keyup: function () {
    formatCurrency($(this));
  },
  blur: function () {
    formatCurrency($(this), "blur");
  }
});

function formatNumber(n) {
  // format number 1000000 to 1,234,567
  return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatCurrency(input, blur) {
  // appends $ to value, validates decimal side
  // and puts cursor back in right position.

  // get input value
  var input_val = input.val();

  // don't validate empty input
  if (input_val === "") { return; }

  // original length
  var original_len = input_val.length;

  // initial caret position 
  var caret_pos = input.prop("selectionStart");

  // check for decimal
  if (input_val.indexOf(".") >= 0) {

    // get position of first decimal
    // this prevents multiple decimals from
    // being entered
    var decimal_pos = input_val.indexOf(".");

    // split number by decimal point
    var left_side = input_val.substring(0, decimal_pos);
    var right_side = input_val.substring(decimal_pos);

    // add commas to left side of number
    left_side = formatNumber(left_side);

    // validate right side
    right_side = formatNumber(right_side);

    // On blur make sure 2 numbers after decimal
    if (blur === "blur") {
      right_side += "00";
    }

    // Limit decimal to only 2 digits
    right_side = right_side.substring(0, 2);

    // join number by .
    input_val = "$" + left_side + "." + right_side;

  } else {
    // no decimal entered
    // add commas to number
    // remove all non-digits
    input_val = formatNumber(input_val);
    input_val = "$" + input_val;

    // final formatting
    if (blur === "blur") {
      //input_val += ".00";
    }
  }

  // send updated string to input
  input.val(input_val);

  // put caret back in the right position
  var updated_len = input_val.length;
  caret_pos = updated_len - original_len + caret_pos;
  input[0].setSelectionRange(caret_pos, caret_pos);
}
/**********************************************************************************/

//ALL OVERLAY FUNCTIONS**************
window.addEventListener('load', (event) => {
  var mainOverlay = document.getElementById("main-overlay");

  //QUESTION OVERLAY
  var questionsBox = document.getElementById("questions-box");
  var btnQuestion = document.getElementById("btnQuestion");
  var btnQuestionCancel = document.getElementById("btnQuestionCancel");
  var btnQuestionSubmit = document.getElementById("btnQuestionSubmit");
  var enteredQuestion = document.getElementById("question-text-box");

  btnQuestion.addEventListener('click', function () {
    mainOverlay.classList.toggle('fade');
    questionsBox.classList.toggle('fade');
  });

  btnQuestionCancel.addEventListener('click', function () {
    mainOverlay.classList.toggle('fade');
    questionsBox.classList.toggle('fade');

    enteredQuestion.value = "";
  });

  btnQuestionSubmit.addEventListener('click', function () {
    mainOverlay.classList.toggle('fade');
    questionsBox.classList.toggle('fade');

    if (enteredQuestion.value != "" && enteredQuestion.value != " ") {
      //Submit the question to the DB under UserApp/Questions
      push(child(ref(database), 'UserApp/Questions'), enteredQuestion.value);
    }

    enteredQuestion.value = "";
  });

  //FADE IN SUBMIT BTN WHEN NAME IS ENTERED
  var name = document.getElementById("name");
  var btnSubmit = document.getElementById("btnSubmit");

  name.addEventListener('input', function () {
    this.value = this.value.replace(/[0123456789,./\\/-=+/';"\]\[{}/()!@#$%^&*`~_<>?:|/]/g, "");
    if (name.value.trim().length >= 1) {
      if (!btnSubmit.classList.contains('fade')) {
        btnSubmit.classList.toggle('fade');
      }
    }
    else {
      if (btnSubmit.classList.contains('fade')) {
        btnSubmit.classList.toggle('fade');
      }
    }
  });

  //SUBMIT ERROR/SUCCESS OVERLAYS*******************
  var submitOptionBox = document.getElementById("submit-option-box");
  var submitAmountBox = document.getElementById("submit-amount-box");
  var submitSuccessBox = document.getElementById("submit-success-box");
  var databaseErrorBox = document.getElementById("database-error-box");

  var btnOptionOk = document.getElementById("btnOptionOk");
  var btnAmountOk = document.getElementById("btnAmountOk");
  var btnSuccessOk = document.getElementById("btnSuccessOk");
  var btnDatabaseOk = document.getElementById("btnDatabaseOk");

  btnSubmit.addEventListener('click', function () {
    var userName = document.getElementById("name").value.trim();
    var userAmount = document.getElementById("currency-field").value;

    var projectOwnerValue = document.getElementById("project-owner-name").textContent;
    var donorPath = projectOwnerValue + "/Board:Donors/Names";
    var prayerPath = projectOwnerValue + "/Board:PrayerPartners/Names";
    var teamPath = projectOwnerValue + "/Board:TeamMembers/Names";

    var prayerRadio = $("input[type=radio][name=prayerRadio]:checked").val();
    var donorRadio = $("input[type=radio][name=donorRadio]:checked").val();
    var teamRadio = $("input[type=radio][name=teamRadio]:checked").val();

    try {
      //Determine which submit overlay to show
      if (prayerRadio == "no" && donorRadio == "no" && teamRadio == "no") {
        mainOverlay.classList.toggle('fade');
        submitOptionBox.classList.toggle('fade');
      }
      else {
        if (donorRadio == "yes") {
          mainOverlay.classList.toggle('fade');

          var editedAmount = String(userAmount).replace(/[$,]/g, "");

          if (editedAmount > 0) {
            submitSuccessBox.classList.toggle('fade');

            //Submit to donor location in DB        
            var donorKey = push(child(ref(database), 'Projects/' + donorPath)).key;
            set(child(ref(database), 'Projects/' + donorPath + "/" + donorKey), {
              Name: userName,
              Pledge: Number(editedAmount)
            });
            
            //Submit to prayer location in DB if yes
            if (prayerRadio == "yes") {
              push(child(ref(database), 'Projects/' + prayerPath), userName);
            }

            //Submit to team location in DB if yes
            if (teamRadio == "yes") {
              push(child(ref(database), 'Projects/' + teamPath), userName);
            }
          }
          else {
            submitAmountBox.classList.toggle('fade');
          }
        }
        else {
          mainOverlay.classList.toggle('fade');
          submitSuccessBox.classList.toggle('fade');

          //Submit to prayer location in DB if yes
          if (prayerRadio == "yes") {
            push(child(ref(database), 'Projects/' + prayerPath), userName);
          }

          //Submit to team location in DB if yes
          if (teamRadio == "yes") {
            push(child(ref(database), 'Projects/' + teamPath), userName);
          }
        }
      }
    } catch (error) {
      if (!mainOverlay.classList.contains('fade')) {
        mainOverlay.classList.toggle('fade');
      }

      if (!databaseErrorBox.classList.contains('fade')) {
        databaseErrorBox.classList.toggle('fade');
      }
    }
  });

  //Option overlay ok button
  btnOptionOk.addEventListener('click', function () {
    mainOverlay.classList.toggle("fade");
    submitOptionBox.classList.toggle("fade");
  });

  //Amount overlay ok button
  btnAmountOk.addEventListener('click', function () {
    mainOverlay.classList.toggle('fade');
    submitAmountBox.classList.toggle('fade');
  });

  //Success overlay ok button
  btnSuccessOk.addEventListener('click', function () {
    mainOverlay.classList.toggle('fade');
    submitSuccessBox.classList.toggle('fade');
  });

  btnDatabaseOk.addEventListener('click', function () {
    mainOverlay.classList.toggle('fade');
    databaseErrorBox.classList.toggle('fade');
  })
});