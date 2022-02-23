const vision = require("@google-cloud/vision");

const clientVision = new vision.ImageAnnotatorClient({
  projectId: "chayen",
  keyFilename: "./config/chayen-a99bd9296d50.json",
});

// const detectImageWithBase64 = async (base64: string) => {
//   const base64Data = base64.split(",");

//   const request = { image: { content: base64Data[1] } };
//   const [result] = await clientVision.textDetection(request);
// };

export const detectImageDescription = async ({ url }: { url: string }) => {
  const [result] = await clientVision.labelDetection(url);
  const labels = result.labelAnnotations;
  const messageWithAnnotations = labels?.map((label: any) => {
    return { type: "text", text: label.description };
  });
  return messageWithAnnotations?.splice(0, 5);
};

export const detectTextInImage = async ({ url }: { url: string }) => {
  const [result] = await clientVision.textDetection(url);
  const labels = result.textAnnotations;
  const messageWithAnnotations = labels?.map((label: any) => {
    return { type: "text", text: label.description };
  });
  return messageWithAnnotations?.splice(0, 5);
};
