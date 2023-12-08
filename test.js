
// the link to your model provided by Teachable Machine export panel
const URL = 'https://teachablemachine.withgoogle.com/models/2j07vYkZ6/';
let model, webcam, ctx, topPredictionContainer,currentPoseContainer,scoreContainer, maxPredictions;

//test logic variables
let score = 0;
let yogaPoses;
let currentPoseIndex;
let holdingPose = true;
let readyTime = 5;//seconds for getting ready
let holdTime = 5;//seconds to hold the pose
let holdValidTime = 10;//second in which the above pose have to be held
let ongoingPose = null;//manages the two async functions showPose() and checkPose()
let thresholdProbability = 0.5;//minimum probability for allowing the decision to be sureshot.......For ex--> if the maximum surety is 40% it will be rejected

async function init() {
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';


    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses(); 
    yogaPoses = model.getClassLabels();
    currentPoseIndex = 0;

    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(1000, 600, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    webcam.play();
    
    const canvas = document.getElementById('canvas');
    canvas.width = webcam.width; canvas.height = webcam.height;
    ctx = canvas.getContext('2d');
    topPredictionContainer = document.getElementById('topPrediction');
    currentPoseContainer = document.getElementById('currentPose');
    scoreContainer = document.getElementById('score');
    score=0;
    await startTesting();
}

async function startTesting(){
    let shuffledPoses = yogaPoses.sort(() => Math.random() - 0.5);
    console.log(shuffledPoses);
    for (let i = 0; i < shuffledPoses.length; i++) {
        currentPoseIndex = yogaPoses.indexOf(shuffledPoses[i]);
        ongoingPose=null;
        await showAndCheckPose();
        await sleep(holdValidTime * 1000);//makes the fucntion wait unitl the above called fucntion gets executed gets executed
        console.log(`${currentPoseIndex+1} : ${i+1}th cycle completed`);
    }

    scoreContainer.innerHTML = `Final Score : ${score}`;
    console.log(`Final Score: ${score}`);
    webcam.stop();
}

async function showAndCheckPose() {
    if(ongoingPose == null){
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.font = '30px Arial';
        ctx.fillStyle = 'blue';
        ctx.fillText(`Get ready for: ${yogaPoses[currentPoseIndex]}`, canvas.width / 4, canvas.height / 2);

        for (let countdown = readyTime; countdown > 0; countdown--) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '30px Arial';
            ctx.fillStyle = `rgb(255, ${countdown * 30}, 0)`;
            ctx.fillText(`Get ready for: ${yogaPoses[currentPoseIndex]} in ${countdown} seconds`, canvas.width / 4, canvas.height / 2);
            await sleep(1000);
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        holdingPose = true;
        poseStartTime = Date.now();

        ongoingPose = yogaPoses[currentPoseIndex];
        console.log(`Ongoing pose = ${ongoingPose}`);
        currentPoseContainer.innerHTML = `Ongoing pose : ${ongoingPose}`;
        window.requestAnimationFrame(checkPose);
    }
}

async function checkPose(timestamp) {
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    const prediction = await model.predict(posenetOutput);

    drawPose(pose);
    webcam.update();


    // Check if the predicted pose matches the current pose
    const topPrediction = getTopPrediction(prediction);
    topPredictionContainer.innerHTML = `Top Prediction : ${topPrediction.className}`;
    if (topPrediction.className === yogaPoses[currentPoseIndex] && topPrediction.probability > thresholdProbability) {
        holdingPose = true;
        // console.log(topPrediction)
    }else{
        holdingPose = false;
    }

    const currentTime = Date.now();
    const poseDuration = (currentTime - poseStartTime) / 1000;
    
    // Check if the user has held the correct pose for at least 10 seconds
    if ((poseDuration >= holdTime) && holdingPose) {
        score++;
        console.log(`Current Score: ${score}`);
        ongoingPose = null;
        return;
    }else if(poseDuration >= holdValidTime){
        ongoingPose = null;
        return;
    }
    scoreContainer.innerHTML = `Score : ${score}`;

    window.requestAnimationFrame(checkPose);
}

function getTopPrediction(predictions) {
    return predictions.reduce((max, current) => (max.probability > current.probability) ? max : current);
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**/

async function predict() {
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    const prediction = await model.predict(posenetOutput);

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className + ': ' + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }

    // finally draw the poses
    drawPose(pose);
}

function drawPose(pose) {
    ctx.drawImage(webcam.canvas, 0, 0);
    // draw the keypoints and skeleton
    if (pose) {
        const minPartConfidence = 0.5;
        tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
        tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
}
