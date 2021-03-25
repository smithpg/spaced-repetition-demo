const initialState = {
  ongoing: false,
  quizData: null,
  questionQueue: [],
  answers: [],
  currentQuestion: null,
  timeRemainingQuestion: null,
  timeRemainingQuiz: null,
  score: null,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "LOAD_QUIZ": {
      /**
       * Store quiz data in state and intialize other fields
       */
      const quizData = Object.freeze(action.payload);
      const questionQueue = Object.keys(quizData.questions);

      return {
        ...state,
        questionQueue,
        quizData,
        timeRemainingQuiz: state.quizData.time,
      };
    }
    case "START_QUIZ": {
      /**
       * Set `ongoing` flag
       */

      return {
        ...state,
        ongoing: true,
      };
    }
    case "SUBMIT_ANSWER": {
      /**
       * Check answer against quiz data; schedule repetition of question
       * based on correctness of latest answer and historic performance
       */

      const isCorrect = checkAnswer(
        action.payload,
        state.currentQuestion,
        state.quizData
      );

      const newAnswers = [
        ...state.answers,
        { question: state.currentQuestion, answer: action.payload, isCorrect },
      ];

      const questionPerformance = getQuestionPerformance(
        state.currentQuestion,
        newAnswers
      );

      let insertionIndex;
      if (isCorrect) {
      } else {
      }

      const newQuestionQueue = clampedInsert(
        state.questionQueue,
        insertionIndex,
        state.currentQuestion
      );

      return {
        ...state,
        answers: newAnswers,
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
        timeRemainingQuestion: newCurrentQuestion.time,
        questionQueue: newQuestionQueue,
        currentQuestion: newCurrentQuestion,
      };
    }
    case "FINISH_QUIZ": {
      /**
       *  Calculate final score
       */

      return {
        ...state,
        ongoing: false,
        score: calculateScore(state.answers, state.quizData),
      };
    }
    default: {
      return state;
    }
  }
}

function checkAnswer(answerId, questionId, quizData) {
  const targetQuestion = quizData.questions.find((q) => q.id === questionId);

  return answerId === targetQuestion.correctAnswer;
}

function getQuestionPerformance(questionId, answers) {
  return answers
    .filter((answer) => answer.question === questionId)
    .reduce((acc, answer) => {
      if (answer.isCorrect) {
        return acc + 1;
      } else {
        return acc === 0 ? acc : acc - 1;
      }
    }, 0);
}

function calculateScore(answers, quizData) {
  /**
   * Caclulate final score
   */

  // TODO: Is this the score calculation we want?
  return;
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
