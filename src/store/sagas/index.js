import { put, takeEvery, call, select } from "redux-saga/effects";

import * as actionTypes from "../actions/actionTypes";
import { submitAnswer } from "../actions";

function delay(ms) {
  return new Promise((resolve, reject) => {
    return setTimeout(resolve, ms);
  });
}

function* handleQuestionTimerTick() {
  /**
   * If question timer has elapsed, treat question as
   * wrong
   */

  const questionTimeRemaining = yield select(
    (s) => s.quiz.questionTimeRemaining
  );

  if (questionTimeRemaining === 0) {
    yield put(submitAnswer(null));
  }
}

function* handleQuizLifecycle() {
  /**
   * Start quiz timer and pull question from queue
   */
  yield put({ type: actionTypes.NEXT_QUESTION });

  let quizTime = yield select((s) => s.quiz.timeRemainingQuiz);

  while (quizTime > 0) {
    yield call(delay, 1000);
    yield put({ type: actionTypes.QUIZ_TIMER_TICK });

    quizTime = yield select((s) => s.quiz.timeRemainingQuiz);
  }

  yield put({ type: actionTypes.FINISH_QUIZ });
}

export default function* rootSaga() {
  yield takeEvery(actionTypes.START_QUIZ, handleQuizLifecycle);

  yield takeEvery(actionTypes.QUESTION_TIMER_TICK, handleQuestionTimerTick);
}
