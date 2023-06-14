const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp(functions.config().firebase);

exports.sendListenerPostNotification = functions.database.ref('/UsersMessages/{host}/{uid}/HostMsgs/{timestamp}').onCreate((snapshot, context) => {
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
            }
        };

        //Send notification to device
        return admin.messaging().send(message).then((response) => {
            console.log('Sent notification:', response);
        }).catch((error) => {
            console.log('Error sending notification: ', error);
        });
    });
});
