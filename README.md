## 1) How is it made?
I have used a model trained in `Teachable Machine` to train a model to identify various Yoga poses.

This program in TensorFlow.js uses the classfification model to take a *"Yoga Test"*. Basically it prompts the user to do a specific-pose and if the model identifies the pose done to be the same as the pose prompted then it increases the score by 1.(Pretty startightforward logic)


## 2) How to Use?
You can simply click start to start the test with the predefined model and check your Yoga knowledge.

## 3) How to modify?
You can use your own yoga model by simply providing your model `URL` or you can also play around with the variables like `holdTime` , `ReadyTime` etc. To make your test easy or harder.

### Some Improvements-
    1) Some styling can be done
    2) Model can be trained for more poses and more varied dataset
    3) Removing the console logs