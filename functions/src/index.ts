import { detectTextInImage } from "./detectImage";
import FLEX_MESSAGE from "./messagesType/flex";
import uploadImage from "./uploadImage";

// import * as functions from "firebase-functions";
const express = require("express");
const app = express();
app.use(express.json());

const line = require("@line/bot-sdk");

const config = {
  channelAccessToken:
    "E2A8TN6jDyvBgAJjrX2AP4emAs6W5HQBYtdawNuoAzDyCz0+XTBExYjjoqRZYDZaHK4w+16DlgW4EhxbXq3trupDN1rr+KL5J9n/jpu2Oyjh/kcfCrGJR2wPlmaGiZQWDjz+ESf/GVoyLWI5VQxjPwdB04t89/1O/w1cDnyilFU=",
  channelSecret: "c01f55953a855d1cd5b94fe4685b3e34",
};

const client = new line.Client(config);
app.post("/line-webhook", async function (req: any, res: any) {
  const event = req.body.events[0];
  const eventType = req.body.events[0].type;
  const replyToken = req.body.events[0].replyToken;
  const userId = event.source.userId;
  console.log("event : ", event);
  console.log("userId :: ----> ", userId);

  if (eventType === "message") {
    const messageType = event.message.type;
    switch (messageType) {
      case "text":
        const messageText = event.message.text;
        if (messageText === "location") {
          client.replyMessage(event.replyToken, {
            type: "location",
            title: "my location",
            address: "〒150-0002 東京都渋谷区渋谷２丁目２１−１",
            latitude: 35.65910807942215,
            longitude: 139.70372892916203,
          });
        }
        if (messageText === "imageMap") {
          client.replyMessage(replyToken, {
            type: "imagemap",
            baseUrl:
              "https://i.ytimg.com/vi/1Ne1hqOXKKI/maxresdefault.jpg?_ignored=",
            altText: "Image map จ้า",
            baseSize: {
              width: 1040,
              height: 1040,
            },
            actions: [
              {
                type: "message",
                area: {
                  x: 46,
                  y: 32,
                  width: 420,
                  height: 420,
                },
                text: "chayen",
              },
            ],
          });
        }
        if (messageText === "flex") {
          client.replyMessage(replyToken, FLEX_MESSAGE);
        }
        if (messageText === "quickReply") {
          client.replyMessage(replyToken, {
            type: "text",
            text: `quick reply`,
            quickReply: {
              items: [
                {
                  type: "action",
                  action: {
                    type: "postback",
                    label: "postback",
                    data: "action=name=min",
                    displayText: "what is user name ? ",
                  },
                },
                {
                  type: "action",
                  action: {
                    type: "message",
                    label: "message text",
                    text: "message text",
                  },
                },
                {
                  type: "action",
                  action: {
                    type: "datetimepicker",
                    label: "date",
                    data: "storeId=12345",
                    mode: "datetime",
                    initial: "2017-12-25t00:00",
                    max: "2018-01-24t23:59",
                    min: "2017-12-25t00:00",
                  },
                },
                {
                  type: "action",
                  action: {
                    type: "camera",
                    label: "Camera",
                  },
                },
                {
                  type: "action",
                  action: {
                    type: "cameraRoll",
                    label: "Camera roll",
                  },
                },
                {
                  type: "action",
                  action: {
                    type: "location",
                    label: "Location",
                  },
                },
              ],
            },
          });
        } else {
          return client.replyMessage(event.replyToken, [
            {
              type: "text",
              text: messageText,
            },
            {
              type: "text",
              text: "\uDBC0\uDC84 LINE original emoji",
            },
          ]);
        }

      case "sticker":
        client.replyMessage(replyToken, [
          {
            type: "text",
            text: `ส่ง sticker`,
          },
          {
            type: "sticker",
            packageId: "11538",
            stickerId: "51626506",
          },
        ]);
        return res.send("ok");
      case "image":
        const imageUrl = await uploadImage({ event });

        if (imageUrl) {
          const imageDescription = await detectTextInImage({
            url: imageUrl,
          });
          return client.replyMessage(replyToken, imageDescription);
        }

        return client.replyMessage(replyToken, {
          type: "image",
          originalContentUrl:
            "https://i.ytimg.com/vi/1Ne1hqOXKKI/maxresdefault.jpg",
          previewImageUrl:
            "https://i.ytimg.com/vi/1Ne1hqOXKKI/maxresdefault.jpg",
        });
      case "video":
        client.replyMessage(replyToken, {
          type: "video",
          originalContentUrl:
            "https://firebasestorage.googleapis.com/v0/b/chayen.appspot.com/o/movie.mp4?alt=media&token=d8767953-8561-4967-8b35-7887b4fbd7a5",
          previewImageUrl:
            "https://i.ytimg.com/vi/1Ne1hqOXKKI/maxresdefault.jpg",
        });
        return res.send("ok");
      case "audio":
        client.replyMessage(replyToken, {
          type: "audio",
          originalContentUrl:
            "https://firebasestorage.googleapis.com/v0/b/chayen.appspot.com/o/13.01.mp3?alt=media&token=a532491b-bdfd-48a7-ad58-4e40f17da763",
          duration: 55928,
        });
        return res.send("ok");
      case "location":
        const { id, ...locationData } = event.message;
        const newLocationData = {
          ...locationData,
          title: "min Home",
        };
        client.replyMessage(replyToken, newLocationData);
        return res.send("ok");
      default:
        return res.send("ok").status(200);
    }
  }
  if (eventType === "postback") {
    const postbackData = event.postback.data;
    client.replyMessage(replyToken, {
      type: "text",
      text: JSON.stringify(postbackData),
    });
  }
  if (eventType === "follow") {
    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: "welcome to my world",
      },
      {
        type: "text",
        text: "\uDBC0\uDC84 LINE original emoji",
      },
    ]);
  }
  res.send("LINE API");
});

app.listen(9000, () => {
  console.log("Application is running on port 9000");
});

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
