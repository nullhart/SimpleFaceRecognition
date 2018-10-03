const cv = require("opencv4nodejs");
const fr = require("face-recognition").withCv(cv);
const fs = require("fs");
const path = require("path");
const keycode = require("keycode");
const exec = require("await-exec");
const process = require("process");
const imgsPath = path.resolve(__dirname, "TrainerImages");
const nameMappings = ["blake", "obama"];
const imgFiles = fs.readdirSync(imgsPath);
const eigen = new cv.EigenFaceRecognizer();
const fisher = new cv.FisherFaceRecognizer();
const lbph = new cv.LBPHFaceRecognizer();

const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
const getFaceImage = grayImg => {
  const faceRects = classifier.detectMultiScale(grayImg).objects;
  if (!faceRects.length) {
    throw new Error("failed to detect faces");
  }
  return grayImg.getRegion(faceRects[0]);
};

const getSingleFaceImage = grayImg => {
  const faceRects = classifier.detectMultiScale(grayImg).objects;
  if (!faceRects.length) {
    return "failed to detect faces";
  }
  return grayImg.getRegion(faceRects[0]);
};

const images = imgFiles

  .map(file => {
    return path.resolve(imgsPath, file);
  })

  .map(filePath => cv.imread(filePath))

  .map(img => {
    return img.bgrToGray();
  })

  .map(getFaceImage)
  .map(faceImg => faceImg.resize(80, 80));

// make labels
const labels = imgFiles.map(file =>
  nameMappings.findIndex(name => file.includes(name))
);
console.log(labels);

eigen.train(images, labels);
fisher.train(images, labels);
lbph.train(images, labels);

const runPrediction = (recognizer, img) => {
  return recognizer.predict(img);
};

const wCap = new cv.VideoCapture(0);
const recognizer = new cv.EigenFaceRecognizer();

var PersonFound;
var FoundConfidence;


function getPerson() {
  return {
    person: PersonFound,
    confidence: FoundConfidence
  };
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function confirmIdentify() {
  resultArray = []
  for (i = 0; i <= 3; i++) {
    await wait(1000)
    let result = getPerson()
    resultArray.push(result.person)
  }
  var filteredArray = resultArray.filter(item => item == 'blake')

  var ratio = (filteredArray.length / resultArray.length) * 100

  console.log(`# of Faces ${resultArray.length} | # of blakes ${filteredArray.length}`)
  return ratio
}

function start(CheckInterval = 1000) {
  console.log('Confirming Identity ✅ ')
  let frame = wCap.read();
  let image = getSingleFaceImage(frame);
  if (typeof image == "string") {
    PersonFound = "No Faces Found"
    return;
  }
  let grayImage = image.bgrToGray();
  let resized = grayImage.resize(80, 80);
  let prediction = runPrediction(eigen, resized);
  PersonFound = nameMappings[prediction.label];
  FoundConfidence = prediction.confidence
  setInterval(() => {
    let frame = wCap.read();
    let image = getSingleFaceImage(frame);
    if (typeof image == "string") {
      PersonFound = "No Faces Found"
      return;
    }
    let grayImage = image.bgrToGray();
    let resized = grayImage.resize(80, 80);
    let prediction = runPrediction(eigen, resized);
    PersonFound = nameMappings[prediction.label];
    FoundConfidence = prediction.confidence
    // console.log(
    //   `${nameMappings[prediction.label]} Confidence: ${prediction.confidence}`
    // );
  }, CheckInterval);
}

module.exports = {
  start,
  getPerson,
  confirmIdentify
};