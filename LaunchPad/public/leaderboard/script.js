// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app.js";
import { getDatabase, ref, onValue, child, query, orderByChild, limitToLast, onChildAdded } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-database.js";

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

window.addEventListener('load', function () {
    //Connect to the UserApp path in db to access values
    const userAppRef = ref(database, 'UserApp/');
    var currentProject = null;
    var currentSponsor = null;
    var isDonorBoardOn = true;
    var isPrayerBoardOn = true;
    var isTeamBoardOn = true;

    const projectOwnerName = document.getElementById('project-owner-name');
    const sponsorName = document.getElementById('sponsor-name');
    const donorBoard = document.getElementById('donor');
    const prayerBoard = document.getElementById('prayer');
    const teamBoard = document.getElementById('team');

    onValue(userAppRef, (snapshot) => {

        //Get and set all the values from db
        snapshot.forEach((childSnapshot) => {
            switch (childSnapshot.key) {
                case "CurrentProject":
                    currentProject = childSnapshot.val();
                    break;
                case "CurrentSponsor":
                    currentSponsor = childSnapshot.val();
                    break;
                case "isDonorBoardOn":
                    isDonorBoardOn = childSnapshot.val();
                    break;
                case "isPrayerBoardOn":
                    isPrayerBoardOn = childSnapshot.val();
                    break;
                case "isTeamBoardOn":
                    isTeamBoardOn = childSnapshot.val();
                    break;
            }
        });

        //Upate the leaderboard with owner, sponsor and board values
        projectOwnerName.innerText = currentProject;
        sponsorName.innerText = currentSponsor;

        if (isDonorBoardOn === false) {
            if (!donorBoard.classList.contains('fade')) {
                donorBoard.classList.toggle('fade');
            }
        }
        else {
            if (donorBoard.classList.contains('fade')) {
                donorBoard.classList.toggle('fade');
            }
        }

        if (isPrayerBoardOn === false) {
            if (!prayerBoard.classList.contains('fade')) {
                prayerBoard.classList.toggle('fade');
            }
        }
        else {
            if (prayerBoard.classList.contains('fade')) {
                prayerBoard.classList.toggle('fade');
            }
        }

        if (isTeamBoardOn === false) {
            if (!teamBoard.classList.contains('fade')) {
                teamBoard.classList.toggle('fade');
            }
        }
        else {
            if (teamBoard.classList.contains('fade')) {
                teamBoard.classList.toggle('fade');
            }
        }

        try {
            //Get the names and pledges from database to add to leaderboard
            const donorNames = query(ref(database, 'Projects/' + currentProject + "/Board:Donors/Names/"), orderByChild('/Pledge'), limitToLast(5));
            const prayerNames = query(ref(database, 'Projects/' + currentProject + "/Board:PrayerPartners/Names/"), limitToLast(5));
            const teamNames = query(ref(database, 'Projects/' + currentProject + "/Board:TeamMembers/Names/"), limitToLast(5));
            const pledgeTotalRef = ref(database, 'Projects/' + currentProject + "/Board:Donors/Names/", orderByChild('Pledge'));
            var currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0});

            async function clearLeaderboard(board) {
                //Clear each leaderboard spot before adding new names
                for (let i = 0; i < 5; i++) {
                    if (board === "donor") {
                        document.getElementById("donor" + i).innerText = null;
                    }
                    else if (board === "prayer") {
                        document.getElementById("prayer" + i).innerText = null;
                    }
                    else if (board === "team") {
                        document.getElementById("team" + i).innerText = null;
                    }
                    else {
                        document.getElementById("donor" + i).innerText = null;
                        document.getElementById("prayer" + i).innerText = null;
                        document.getElementById("team" + i).innerText = null;
                    }
                }

                return 1;
            }

            //Clear the leaderboard initially before adding new names
            clearLeaderboard("all");

            //Take the snapshot into an array and reverse it to display properly
            onValue(donorNames, (snapshot) => {
                const snapShotArray = [];
                snapshot.forEach((data) => {
                    snapShotArray.push(data.child("Name").val() + " " + currencyFormatter.format(data.child("Pledge").val()));
                });

                snapShotArray.reverse();

                clearLeaderboard("donor");

                for (let i = 0; i < snapShotArray.length; i++) {
                    document.getElementById("donor" + i).innerText = snapShotArray[i];
                }
            });

            onValue(pledgeTotalRef, (snapshot) => {
                var pledgeTotal = 0;
                snapshot.forEach((data) => {
                    pledgeTotal += data.child("Pledge").val();
                });

                document.getElementById('donor-title').innerText = "Donors & Pledges / Total: " + currencyFormatter.format(pledgeTotal);
            });

            //Take the snapshot into an array and reverse it to display properly
            onValue(prayerNames, (snapshot) => {
                const snapShotArray = [];
                snapshot.forEach((data) => {
                    snapShotArray.push(data.val());
                });

                snapShotArray.reverse();

                clearLeaderboard("prayer");

                for (let i = 0; i < snapShotArray.length; i++) {
                    document.getElementById("prayer" + i).innerText = snapShotArray[i];
                }
            });

            //Take the snapshot into an array and reverse it to display properly
            onValue(teamNames, (snapshot) => {
                const snapShotArray = [];
                snapshot.forEach((data) => {
                    snapShotArray.push(data.val());
                });

                snapShotArray.reverse();

                clearLeaderboard("team");

                for (let i = 0; i < snapShotArray.length; i++) {
                    document.getElementById("team" + i).innerText = snapShotArray[i];
                }
            });
        } catch (error) {
            console.log(error);
            //window.location.reload();
        }
    });
});