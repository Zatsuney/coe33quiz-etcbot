const admin = require('firebase-admin');
const serviceAccount = require('./nocobot-4fa85-firebase-adminsdk-fbsvc-d430578994.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

module.exports = admin.firestore();