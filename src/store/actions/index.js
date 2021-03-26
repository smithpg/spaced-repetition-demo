import * as actionTypes from "./actionTypes";

export function loadQuiz(quizObject) {
  return {
    type: actionTypes.LOAD_QUIZ,
    payload: quizObject,
  };
}

export function startQuiz() {
  return {
    type: actionTypes.START_QUIZ,
  };
}

export function submitAnswer(answerId) {
  return {
    type: actionTypes.SUBMIT_ANSWER,
    payload: answerId,
  };
}

export function finishQuiz() {
  return {
    type: actionTypes.FINISH_QUIZ,
  };
}
