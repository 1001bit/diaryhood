// TODO: Fetch paths and use sample path for them
const userStepsElem = document.getElementById(
	"user-steps"
) as HTMLParagraphElement;
let totalSteps = 0;

userStepsElem.innerText = "steps: " + totalSteps.toString();
