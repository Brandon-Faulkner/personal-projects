const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp(functions.config().firebase);

exports.sendUserNotification = functions.database.ref('/UsersMessages/{host}/{uid}/HostMsgs/{timestamp}').onCreate((snapshot, context) => {
    const userID = context.params.uid;
    const hostName = context.params.host;
    const messageContent = snapshot.val();

    //Get user notification token
    return admin.database().ref('/Users/' + userID + '/notifToken').once('value').then(token => {
        //Make sure token exists
        if (!token) {
            return console.log('No notif token to send notifications to.');
        }

        //Notification details
        const message = {
            token: token.val(),
            data: {
                title: hostName + " replied",
                body: messageContent,
                time: Date.now().toString(),
            }
        };

        //Send notification to device
        return admin.messaging().send(message).then((response) => {
            console.log('Sent notification:', response);
            return admin.database().ref('/Users/' + userID + '/UnreadChats/' + hostName).set(Date.now());
        }).catch((error) => {
            console.log('Error sending notification: ', error);
        });
    });
});

exports.sendHostNotification = functions.database.ref('/UsersMessages/{host}/{uid}/UserMsgs/{timestamp}').onCreate((snapshot, context) => {
    const senderID = context.params.uid;
    const host = context.params.host;
    const hostsDataArr = [];
    const messageContent = snapshot.val();
    const messagesArr = [];

    //Get user's name
    return admin.database().ref('/Users/' + senderID + '/Name').once('value').then(name => {
        const userName = name.val();

        //Get the info of both hosts from "Admins" in db
        return admin.database().ref('/Admins/').once('value').then(hostIDs => {
            hostIDs.forEach((data) => {
                if (data.child('groupData').val().split(" | ")[0] === host) {
                    const hostData = { id: data.key, token: data.child('notifToken').val() };
                    hostsDataArr.push(hostData);
                }
            });

            if (hostsDataArr[0].token !== null) {
                const message = {
                    token: hostsDataArr[0].token,
                    data: {
                        title: userName + " replied",
                        body: messageContent,
                        time: Date.now().toString(),
                    }
                }
                messagesArr.push(message);
            } else {
                console.log('No notif token to send notifications to.');
            }

            if (hostsDataArr.length === 2) {
                if (hostsDataArr[1].token !== null) {
                    const message = {
                        token: hostsDataArr[1].token,
                        data: {
                            title: userName + " replied",
                            body: messageContent,
                            time: Date.now().toString(),
                        }
                    }
                    messagesArr.push(message);
                } else {
                    console.log('No notif token to send notifications to.');
                }
            }

            return admin.messaging().sendEach(messagesArr).then((response) => {
                console.log('Sent notification: ', response);

                if (hostsDataArr.length === 2) {
                    return admin.database().ref('/Users/' + hostsDataArr[0].id + '/UnreadChats/' + userName).set(Date.now()).then((next) => {
                        return admin.database().ref('/Users/' + hostsDataArr[1].id + '/UnreadChats/' + userName).set(Date.now());
                    });
                } else {
                    return admin.database().ref('/Users/' + hostsDataArr[0].id + '/UnreadChats/' + userName).set(Date.now());
                }
            });
        });
    }).catch((error) => {
        console.log('Error sending notification: ', error);
    });;
});
