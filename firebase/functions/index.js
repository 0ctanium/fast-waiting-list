// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

exports.joinList = functions.https.onCall(async (data, context) => {
  const listID = data.id;
  const name = data.name;
  const uid = context.auth.uid;

  if (
    listID &&
    name &&
    uid &&
    typeof listID === 'string' &&
    typeof name === 'string'
  ) {
    const listRef = admin.database().ref().child('lists').child(listID);

    await listRef.child('data').child(uid).set({
      name: name,
    });

    const indexSnap = await listRef
      .child('dataState')
      .orderByChild('index')
      .limitToLast(1)
      .once('value');
    const index = indexSnap.exists()
      ? Object.values(indexSnap.val())[0].index
      : -1;

    await listRef
      .child('dataState')
      .child(uid)
      .set({
        index: index + 1,
      });

    return true;
  }

  return false;
});

exports.createList = functions.https.onCall(async (data, context) => {
  const name = data.name;
  const desc = data.desc;
  const uid = context.auth.uid;

  if (name && uid && typeof name === 'string') {
    if (desc && typeof desc !== 'string') return false;

    let key = Math.random().toString(36).substr(2, 5);
    let snap = await admin
      .database()
      .ref()
      .child('lists')
      .child(key)
      .once('value');

    while (snap.exists()) {
      key = Math.random().toString(36).substr(2, 5);
      snap = await admin
        .database()
        .ref()
        .child('lists')
        .child(key)
        .once('value');
    }

    await admin.database().ref().child('lists').child(key).set({
      name,
      desc,
      owner: uid,
    });

    return key;
  }

  return false;
});
