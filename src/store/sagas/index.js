import {
  put,
  takeEvery,
  take,
  call,
  cancel,
  select,
  delay,
  race,
} from "redux-saga/effects";

import * as actionTypes from "../actions/actionTypes";
import { submitAnswer } from "../actions";

function* timer(seconds, tickActionType) {
  let secondsRemaining = seconds;

  while (secondsRemaining > 0) {
    yield delay(1000);
    yield put({ type: tickActionType });

    secondsRemaining -= 1;
  }
}

function* questionQueueWatcher() {
  while (true) {
    yield take(actionTypes.SUBMIT_ANSWER);

    /**
     * Check whether `questionQueue` is empty and end quiz if so.
     */

    const questionQueue = yield select((s) => s.quiz.questionQueue);

    if (questionQueue.length === 0) {
      break;
    }
  }
}

function* handleQuestionLifecycle() {
  /**
   * Start question timer...
   */
  const timeRemainingQuestion = yield select(
    (s) => s.quiz.timeRemainingQuestion
  );
  const { answer } = yield race({
    timer: call(timer, timeRemainingQuestion, actionTypes.QUESTION_TIMER_TICK),
    answer: take(actionTypes.SUBMIT_ANSWER),
  });

  if (!answer) {
    /**
     * If timer elapsed without a submission, treat as incorrect.
     */

    yield put(submitAnswer(null));
  }

  /**
   * Delay for 1 second to highlight correct answer...
   */

  yield delay(1000);

  /**
   * Then advance to the next question.
   */

  yield put({ type: actionTypes.NEXT_QUESTION });
}

function* handleQuizLifecycle() {
  /**
   * Start watcher to handle question lifecycle actions
   */
  const questionHandler = yield takeEvery(
    actionTypes.NEXT_QUESTION,
    handleQuestionLifecycle
  );

  /**
   * Pull a question from the queue, starting the quiz...
   */
  yield put({ type: actionTypes.NEXT_QUESTION });

  /**
   * Start quiz timer and queueWatcher, awaiting whichever finishes first
   */
  let quizTime = yield select((s) => s.quiz.timeRemainingQuiz);
  yield race({
    timer: call(timer, quizTime, actionTypes.QUIZ_TIMER_TICK),
    queueWatcher: call(questionQueueWatcher),
  });

  /**
   * Quiz is complete.
   */
  yield cancel(questionHandler);
  yield put({ type: actionTypes.FINISH_QUIZ });
}

export default function* rootSaga() {
  yield takeEvery(actionTypes.START_QUIZ, handleQuizLifecycle);
}
