import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { submitAnswer, loadQuiz, startQuiz } from "../store/actions";
import QuizCard from "./QuizCard";
import quizData from "../testQuiz.json";

export default function QuizContainer(props) {
  const quizState = useSelector((s) => s.quiz);
  const { currentQuestion } = quizState;
  const dispatch = useDispatch();

  useEffect(() => {
    /**
     * In a full-fledged implementation, quiz data
     * would be loaded from an api; for simplicity I'm
     * loading a static JSON file here
     */

    dispatch(loadQuiz(quizData));
  }, [dispatch]);

  let onSelectAnswer = (answerId) => {
    dispatch(submitAnswer(answerId));
  };

  if (quizState.quizData === null) {
    return <div className="QuizContainer">No quiz loaded...</div>;
  }

  const ongoing = !!currentQuestion;
  const finished = !currentQuestion && quizState.score !== null;

  const answerClassNames = {};

  /**
   * If an answer has been selected...
   */
  if (quizState.currentAnswer) {
    /**
     * Disable answer selection callback.
     */
    onSelectAnswer = () => {};

    /**
     * Set classNames for answers depending on correctness.
     */
    if (quizState.currentAnswer.isCorrect) {
      answerClassNames[quizState.currentAnswer.answer] = "show-correct";
    } else {
      answerClassNames[quizState.currentAnswer.answer] = "show-incorrect";
      answerClassNames[quizState.currentQuestion.correctAnswer] =
        "show-correct";
    }
  }

  return (
    <div className="QuizContainer">
      {ongoing ? (
        <>
          <div className="QuizContainer__time">
            <div>Quiz Timer:</div>
            <div>
              {convertSecondsToMinuteAndSeconds(quizState.timeRemainingQuiz)}
            </div>
          </div>
          <QuizCard
            time={quizState.timeRemainingQuestion}
            questionText={currentQuestion.text}
            answers={currentQuestion.answers}
            answerClassNames={answerClassNames}
            onSelectAnswer={onSelectAnswer}
          />
        </>
      ) : finished ? (
        <>
          <h3 className="score">Final Score: {quizState.score} points</h3>
          <button onClick={() => dispatch(startQuiz())}>Restart Quiz</button>
        </>
      ) : (
        <>
          <h3>{quizState.quizData.title}</h3>
          <button onClick={() => dispatch(startQuiz())}>Start Quiz</button>
        </>
      )}
    </div>
  );
}

function convertSecondsToMinuteAndSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secondsOverhang = seconds % 60;

  return `${minutes}:${padSeconds(secondsOverhang)}`;
}

function padSeconds(seconds) {
  if (seconds < 10) {
    return "0" + seconds;
  }

  return seconds;
}
