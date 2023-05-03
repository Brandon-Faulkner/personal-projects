// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app.js";
import { getDatabase, ref, onValue, get, child, update } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-database.js";

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

window.addEventListener('load', (event) => {
  //The two main ref points from db
  const projectsRef = ref(database, 'Projects/');
  const userAppRef = ref(database, 'UserApp/');

  //Get all project names from db then add to dropdown box
  var allProjectsArray = [];
  var currentProject = null;
  const projectDropdown = document.getElementById('project-dropdown');

  get(child(userAppRef, "AllProjects")).then((snapshot) => {
    allProjectsArray = snapshot.val().split(',');

    for (let i = 0; i < allProjectsArray.length; i++) {
      var project = document.createElement('option');
      project.value = allProjectsArray[i].trim();
      project.innerHTML = allProjectsArray[i].trim();
      projectDropdown.appendChild(project);
    }

    allProjectsArray = null;
    loadCurrentProject();
  });

  //Get the current project & sponsor name as well as current board values
  function loadCurrentProject() {
    onValue(userAppRef, (snapshot) => {
      currentProject = snapshot.child('CurrentProject').val().trim();
      projectDropdown.value = snapshot.child('CurrentProject').val().trim();
      document.getElementById('name').value = snapshot.child('CurrentSponsor').val();

      //Donor board on or off
      if (snapshot.child('isDonorBoardOn').val() === true) {
        document.getElementById("donorOn").checked = true;
      }
      else {
        document.getElementById("donorOff").checked = true;
      }

      //Prayer board on or off
      if (snapshot.child('isPrayerBoardOn').val() === true) {
        document.getElementById("prayerOn").checked = true;
      }
      else {
        document.getElementById("prayerOff").checked = true;
      }

      //Team board on or off
      if (snapshot.child('isTeamBoardOn').val() === true) {
        document.getElementById("teamOn").checked = true;
      }
      else {
        document.getElementById("teamOff").checked = true;
      }

      //User app toggle on or off
      if (snapshot.child('isUsable').val() === true) {
        document.getElementById('userOn').checked = true;
      }
      else {
        document.getElementById('userOff').checked = true;
      }
    });
  }

  projectDropdown.addEventListener("change", (event) => {
    if (projectDropdown.value != "Default") {
      //Update project isSelected values in db
      const updateProjects = {};
      updateProjects[currentProject + "/isSelected"] = false;
      updateProjects[projectDropdown.value + "/isSelected"] = true;
      update(ref(database, 'Projects/'), updateProjects);

      //Get sponsor and board values from new project in db
      var donorBoardValue, prayerBoardValue, teamBoardValue, sponsorValue = null;
      const updateUserApp = {};

      get(child(projectsRef, projectDropdown.value)).then((snapshot) => {
        donorBoardValue = snapshot.child("Board:Donors").child("isBoardOn").val();
        prayerBoardValue = snapshot.child("Board:PrayerPartners").child("isBoardOn").val();
        teamBoardValue = snapshot.child("Board:TeamMembers").child("isBoardOn").val();
        sponsorValue = snapshot.child("Sponsor").val();

        //Update user app value in db   
        updateUserApp["CurrentProject"] = projectDropdown.value;
        updateUserApp["CurrentSponsor"] = sponsorValue;
        updateUserApp["isDonorBoardOn"] = donorBoardValue;
        updateUserApp["isPrayerBoardOn"] = prayerBoardValue;
        updateUserApp["isTeamBoardOn"] = teamBoardValue;
        update(userAppRef, updateUserApp);
      });
    }
  });

  //Add Event listeners for each overlay button
  const userAppCancel = document.getElementById("btnUserCancel");
  const userAppSubmit = document.getElementById("btnUserSubmit");
  const leaderboardDone = document.getElementById("btnLeaderboardOk");
  const mainOverlay = document.getElementById("main-overlay");
  const userAppOverlay = document.getElementById("user-app");
  const leaderboardOverlay = document.getElementById("leaderboard");

  //User Cancel
  userAppCancel.addEventListener("click", (event) => {
    userAppOverlay.classList.toggle('fade');
    mainOverlay.classList.toggle('fade');
  });

  //User Submit
  userAppSubmit.addEventListener("click", (event) => {
    var isUserAppUsable = (document.querySelector('input[name="userRadio"]:checked').value === "true");

    const updateUserApp = {};
    updateUserApp['isUsable'] = isUserAppUsable;
    update(userAppRef, updateUserApp);

    userAppOverlay.classList.toggle('fade');
    mainOverlay.classList.toggle('fade');
  });

  //Leaderboard Done
  leaderboardDone.addEventListener("click", (event) => {
    leaderboardOverlay.classList.toggle('fade');
    mainOverlay.classList.toggle('fade');
  });

  //Add Event listeners for each button on main page
  const userAppBtn = document.getElementById('btnUserApp');
  const leaderboardBtn = document.getElementById('btnLeaderboard');
  const submitSponsorBtn = document.getElementById('btnSponsorName');
  const submitBoardsBtn = document.getElementById('btnBoardChanges');

  userAppBtn.addEventListener("click", (event) => {
    mainOverlay.classList.toggle('fade');
    userAppOverlay.classList.toggle('fade');
  });

  //Add Event listeners for each of the cancel and delete btns on the leaderboard page
  (function addBtnListeners() {
    for (let i = 0; i < 3; i++) {
      document.getElementById("btnCancel" + i).addEventListener("click", cancelCheckboxes);
      document.getElementById("btnDelete" + i).addEventListener("click", deleteCheckboxes)

    }
  })();

  //Cancel event listener
  function cancelCheckboxes() {
    var currentBoard = this.getAttribute("name");

    switch (currentBoard) {
      case "prayer":
        var prayerPartners = document.getElementById("prayerPartners");
        var checkboxes = prayerPartners.children;
        for (let i = 0; i < prayerPartners.children.length; i++) {
          checkboxes[i].firstChild.checked = false;
        }
        break;
      case "donor":
        var donorsPledgers = document.getElementById("donorsPledgers");
        var checkboxes = donorsPledgers.children;
        for (let i = 0; i < donorsPledgers.children.length; i++) {
          checkboxes[i].firstChild.checked = false;
        }
        break;
      case "team":
        var teamMembers = document.getElementById("teamMembers");
        var checkboxes = teamMembers.children;
        for (let i = 0; i < teamMembers.children.length; i++) {
          checkboxes[i].firstChild.checked = false;
        }
        break;
    }
  }

  //Delete names event listener
  function deleteCheckboxes() {
    var currentBoard = this.getAttribute("name");

    switch (currentBoard) {
      case "prayer":
        var prayerPartners = document.getElementById("prayerPartners");
        var checkboxes = prayerPartners.children;
        const updatePrayerPartner = {};

        if (checkboxes.length > 0) {
          for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].firstChild.checked == true) {
              updatePrayerPartner[checkboxes[i].firstChild.value] = null;
              checkboxes[i].setAttribute("name", "delete");
            }
          }

          var removeCheckboxes = document.getElementsByName("delete");
          for (let i = removeCheckboxes.length - 1; i >= 0; i--) {
            removeCheckboxes[i].remove();
          }

          update(child(projectsRef, projectDropdown.value + "/Board:PrayerPartners/Names/"), updatePrayerPartner);
        }
        break;
      case "donor":
        var donorsPledgers = document.getElementById("donorsPledgers");
        var checkboxes = donorsPledgers.children;
        const updateDonorsPledgers = {};

        if (checkboxes.length > 0) {
          for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].firstChild.checked == true) {
              updateDonorsPledgers[checkboxes[i].firstChild.value] = null;
              checkboxes[i].setAttribute("name", "delete");
            }
          }

          var removeCheckboxes = document.getElementsByName("delete");
          for (let i = removeCheckboxes.length - 1; i >= 0; i--) {
            removeCheckboxes[i].remove();
          }

          update(child(projectsRef, projectDropdown.value + "/Board:Donors/Names/"), updateDonorsPledgers);
        }
        break;
      case "team":
        var teamMembers = document.getElementById("teamMembers");
        var checkboxes = teamMembers.children;
        const updateTeamMembers = {};

        if (checkboxes.length > 0) {
          for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].firstChild.checked == true) {
              updateTeamMembers[checkboxes[i].firstChild.value] = null;
              checkboxes[i].setAttribute("name", "delete");
            }
          }

          var removeCheckboxes = document.getElementsByName("delete");
          for (let i = removeCheckboxes.length - 1; i >= 0; i--) {
            removeCheckboxes[i].remove();
          }

          update(child(projectsRef, projectDropdown.value + "/Board:TeamMembers/Names/"), updateTeamMembers);
        }
        break;
    }
  }

  leaderboardBtn.addEventListener("click", (event) => {
    mainOverlay.classList.toggle('fade');
    leaderboardOverlay.classList.toggle('fade');

    var prayerPartners = document.getElementById("prayerPartners");
    var donorsPledgers = document.getElementById("donorsPledgers");
    var teamMembers = document.getElementById("teamMembers");

    (function removeOldNames() {
      //Clear prayer board
      while (prayerPartners.firstChild) {
        prayerPartners.removeChild(prayerPartners.lastChild);
      }

      //Clear donor board
      while (donorsPledgers.firstChild) {
        donorsPledgers.removeChild(donorsPledgers.lastChild);
      }

      //Clear team board
      while (teamMembers.firstChild) {
        teamMembers.removeChild(teamMembers.lastChild);
      }
    })();

    //Load the names from each board from DB
    //Prayer Board
    get(child(projectsRef, projectDropdown.value + "/Board:PrayerPartners/Names")).then((snapshot) => {
      snapshot.forEach((childSnap) => {
        var newPerson = document.createElement("label");
        newPerson.className = "checkbox checkbox-label";

        var checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("id", childSnap.key);
        checkbox.setAttribute("value", childSnap.key);
        newPerson.appendChild(checkbox);

        var span = document.createElement("span");
        span.innerText = childSnap.val();
        newPerson.appendChild(span);

        prayerPartners.appendChild(newPerson);
      });
    });

    //Donor Board
    get(child(projectsRef, projectDropdown.value + "/Board:Donors/Names")).then((snapshot) => {
      snapshot.forEach((childSnap) => {
        var newPerson = document.createElement("label");
        newPerson.className = "checkbox checkbox-label";

        var checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("id", childSnap.key);
        checkbox.setAttribute("value", childSnap.key);
        newPerson.appendChild(checkbox);

        var span = document.createElement("span");
        span.innerText = childSnap.child("Name").val() + " $" + childSnap.child("Pledge").val()
        newPerson.appendChild(span);

        donorsPledgers.appendChild(newPerson);
      });
    });

    //Team Board
    get(child(projectsRef, projectDropdown.value + "/Board:TeamMembers/Names")).then((snapshot) => {
      snapshot.forEach((childSnap) => {
        var newPerson = document.createElement("label");
        newPerson.className = "checkbox checkbox-label";

        var checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("id", childSnap.key);
        checkbox.setAttribute("value", childSnap.key);
        newPerson.appendChild(checkbox);

        var span = document.createElement("span");
        span.innerText = childSnap.val();
        newPerson.appendChild(span);

        teamMembers.appendChild(newPerson);
      });
    });
  });

  submitSponsorBtn.addEventListener("click", (event) => {
    const sponsorName = document.getElementById('name').value;

    //Update value in db under User App
    const updateUserSponsor = {};
    updateUserSponsor["CurrentSponsor"] = sponsorName;
    update(userAppRef, updateUserSponsor).then(() => {
      //Update value in db under Projects
      const updateProjectSponsor = {};
      updateProjectSponsor["Sponsor"] = sponsorName;
      update(child(projectsRef, projectDropdown.value + "/"), updateProjectSponsor).then(() => {
        //Show the success notification if successful
        var notification = document.getElementById("notification");
        notification.style.animation = 'none';
        notification.offsetHeight;
        notification.style.animation = null;
        notification.style = "animation: fade-in-out 3.5s ease-in-out forwards;";
      }).catch((projectError) => {
        alert(projectError);
      });
    }).catch((userError) => {
      alert(userError);
    });
  });

  submitBoardsBtn.addEventListener("click", (event) => {
    var donorBoardValue = (document.querySelector('input[name="donorRadio"]:checked').value === "true");
    var prayerBoardValue = (document.querySelector('input[name="prayerRadio"]:checked').value === "true");
    var teamBoardValue = (document.querySelector('input[name="teamRadio"]:checked').value === "true");

    //Update values in db under User App
    const updateUserBoards = {};
    updateUserBoards["isDonorBoardOn"] = donorBoardValue;
    updateUserBoards["isPrayerBoardOn"] = prayerBoardValue;
    updateUserBoards["isTeamBoardOn"] = teamBoardValue;
    update(userAppRef, updateUserBoards).then(() => {
      //Update values in db under Projects
      const updateProjectBoards = {};
      updateProjectBoards["/Board:Donors/isBoardOn"] = donorBoardValue;
      updateProjectBoards["/Board:PrayerPartners/isBoardOn"] = prayerBoardValue;
      updateProjectBoards["/Board:TeamMembers/isBoardOn"] = teamBoardValue;
      update(child(projectsRef, projectDropdown.value), updateProjectBoards).then(() => {
        //Show the success notification if successful
        var notification = document.getElementById("notification");
        notification.style.animation = 'none';
        notification.offsetHeight;
        notification.style.animation = null;
        notification.style = "animation: fade-in-out 3.5s ease-in-out forwards;";
      }).catch((projectError) => {
        alert(projectError);
      });
    }).catch((userError) => {
      alert(userError);
    });
  });
});
