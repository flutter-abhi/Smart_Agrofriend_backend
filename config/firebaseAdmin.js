const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKeyPj.json"); // 🔹 Download from Firebase Console

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
