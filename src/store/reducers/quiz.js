const initialState = {
  quizData: null,
  questionQueue: [],
  answers: [],
  currentAnswer: null,
  currentQuestion: null,
  timeRemainingQuestion: null,
  timeRemainingQuiz: null,
  score: null,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "LOAD_QUIZ": {
      /**
       * Store quiz data in state
       */
      const quizData = Object.freeze(action.payload);

      return {
        ...state,
        quizData,
      };
    }
    case "START_QUIZ": {
      const questionQueue = Object.values(state.quizData.questions);

      return {
        ...state,
        answers: [],
        score: null,
        questionQueue,
        timeRemainingQuiz: state.quizData.time,
      };
    }
    case "QUIZ_TIMER_TICK": {
      return {
        ...state,
        timeRemainingQuiz: state.timeRemainingQuiz - 1,
      };
    }
    case "QUESTION_TIMER_TICK": {
      return {
        ...state,
        timeRemainingQuestion: state.timeRemainingQuestion - 1,
      };
    }
    case "SUBMIT_ANSWER": {
      /**
       * Check answer against quiz data; schedule repetition of question
       * based on correctness of latest answer and historic performance
       */
      const selectedAnswerId = action.payload;
      const isCorrect =
        selectedAnswerId === state.currentQuestion.correctAnswer;
      const answerRecord = {
        question: state.currentQuestion.id,
        answer: selectedAnswerId,
        timeRemaining: state.timeRemainingQuestion,
        isCorrect,
      };

      const answersIncludingLatest = [...state.answers, answerRecord];

      let insertionIndex;
      if (isCorrect) {
        const questionStreak = getQuestionStreak(
          state.currentQuestion.id,
          answersIncludingLatest
        );

        if (questionStreak === state.quizData.maxStreak) {
          /**
           * If `maxStreak` has been reached, do not insert
           */
          insertionIndex = null;
        } else {
          /**
           *  Because this is a timed quiz involving a constant stream of questions,
           *  the 'spacing' component of 'spaced-repetition' is accomplished by means of
           *  reinserting answered questions back into the queue of incoming questions at
           *  an index that is a function of the current streak.
           *
           *  The more consecutive correct answers for a certain question, the farther back
           *  in the queue that question will be reinserted.
           */
          insertionIndex = 1 + mapStreakToInsertionIndex(questionStreak);
        }
      } else {
        /**
         * When the user gets a question wrong, it is inserted into the
         * queue in the second position (after the next question.)
         */
        insertionIndex = 1;
      }

      const newQuestionQueue = insertionIndex
        ? clampedInsert(
            state.questionQueue,
            insertionIndex,
            state.currentQuestion
          )
        : state.questionQueue;

      return {
        ...state,
        currentAnswer: answerRecord,
        answers: answersIncludingLatest,
        questionQueue: newQuestionQueue,
      };
    }
    case "NEXT_QUESTION": {
      /**
       * Pull next question from front of the queue
       */

      const newQuestionQueue = state.questionQueue.slice();
      const newCurrentQuestion = newQuestionQueue.shift();

      return {
        ...state,
        currentAnswer: null,
        timeRemainingQuestion: newCurrentQuestion.time,
        questionQueue: newQuestionQueue,
        currentQuestion: newCurrentQuestion,
      };
    }
    case "FINISH_QUIZ": {
      /**
       *  Calculate final score
       */
      const score = calculateScore(state.answers, state.quizData);

      return {
        ...state,
        currentQuestion: null,
        score,
      };
    }
    default: {
      return state;
    }
  }
}

function getQuestionStreak(targetQuestion, answers) {
  return answers
    .filter((answer) => answer.question === targetQuestion)
    .reduce((acc, answer) => {
      if (answer.isCorrect) {
        return acc + 1;
      } else {
        return 0;
      }
    }, 0);
}

function mapStreakToInsertionIndex(streak) {
  /**
   * For streak = 1, returns 1 ;
   * For streak = 2, returns 1 + 2;
   * For streak = 3, returns 1 + 2 + 3;
   * ...etc.
   */
  return Array(streak)
    .fill(0)
    .map((_, i) => i + 1)
    .reduce((sum, n) => sum + n, 0);
}

function calculateScore(answers, quizData) {
  /**
   * Caclulate final score
   */

  const getAnswerScoreContribution = (answerRecord) => {
    /**
     * Calculate contribution of passed answerRecord to total score
     * based on correctness and speed of answer
     */
    if (!answerRecord.isCorrect) return 0;

    const questionAllottedTime = quizData.questions[answerRecord.question].time;

    return (
      10 + Math.floor(10 * (answerRecord.timeRemaining / questionAllottedTime))
    );
  };

  return answers.reduce(
    (totalScore, answerRecord) =>
      totalScore + getAnswerScoreContribution(answerRecord),
    0
  );
}

function clampedInsert(array, index, newElement) {
  /**
   * Attempt to insert at specified index.
   *
   * If the index is out out of bounds, push to
   * the end of the array.
   */
  const copy = array.slice();

  if (index >= array.length) {
    copy.push(newElement);
  } else {
    copy.splice(index, 0, newElement);
  }

  return copy;
}
