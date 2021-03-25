import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { submitAnswer, loadQuiz } from "../store/actions";
import QuizCard from "./QuizCard";
import quizData from "../testQuiz.json";

export default function QuizContainer(props) {
  const quizState = useSelector((s) => s);
  const dispatch = useDispatch();
  const currentQuestion = quizState.currentQuestion;

  useEffect(() => {
    /**
     * In a full-fledged implementation, quiz data
     * would be loaded from an api; for simplicity I'm
     * loading a static JSON file here
     */

    dispatch(loadQuiz(quizData));
  }, [dispatch]);

  const onSelectAnswer = (answerId) => {
    dispatch(submitAnswer(answerId));
  };

  if (quizState.quizData === null) {
    return <div className="QuizContainer">No quiz loaded...</div>;
  }

  return (
    <div className="QuizContainer">
      {JSON.stringify(quizState)}
      <QuizCard
        questionText={currentQuestion.text}
        answers={currentQuestion.answers}
        onSelectAnswer={onSelectAnswer}
      />
    </div>
  );
}
