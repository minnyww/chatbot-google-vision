const request = require("request-promise");
const firebaseAdmin = require("firebase-admin");
const firebaseServiceAccount = require("./config/chayen-firebase-adminsdk-dipvx-650f475b09.json");
const admin = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
});
const storageRef = admin.storage().bucket(`gs://chayen.appspot.com`);

const uploadImage = async ({ event }: any) => {
  const LINE_HEADER = {
    "Content-Type": "application/json",
    Authorization: `Bearer E2A8TN6jDyvBgAJjrX2AP4emAs6W5HQBYtdawNuoAzDyCz0+XTBExYjjoqRZYDZaHK4w+16DlgW4EhxbXq3trupDN1rr+KL5J9n/jpu2Oyjh/kcfCrGJR2wPlmaGiZQWDjz+ESf/GVoyLWI5VQxjPwdB04t89/1O/w1cDnyilFU=`,
  };
  const LINE_MESSAGING_API = "https://api-data.line.me/v2/bot/message";
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  let url = `${LINE_MESSAGING_API}/${event.message.id}/content`;
  if (event.message.contentProvider.type === "external") {
    url = event.message.contentProvider.originalContentUrl;
  }

  let buffer = await request.get({
    headers: LINE_HEADER,
    uri: url,
    encoding: null,
  });

  const tempLocalFile = path.join(os.tmpdir(), "temp.jpg");
  await fs.writeFileSync(tempLocalFile, buffer);

  await storageRef.upload(tempLocalFile, {
    destination: `${event.source.userId}.jpg`,
    metadata: { cacheControl: "no-cache" },
  });

  let CONFIG = {
    action: "read",
    expires: Date.now() + 6000000,
  };
  const file = await admin
    .storage()
    .bucket("gs://chayen.appspot.com")
    .file(`${event.source.userId}.jpg`);

  const getUrl = await file.getSignedUrl(CONFIG);
  fs.unlinkSync(tempLocalFile);
  return getUrl?.[0];
};

export default uploadImage;
