import React from "react";

export default function QuizCard(props) {
  const getClassName = (id) => props.answerClassNames[id];

  return (
    <div className="QuizCard">
      <div className="QuizCard__header">
        <h3>{props.questionText}</h3>
        <div className="QuizCard__time">Time remaining: {props.time}s</div>
      </div>
      <ol className="QuizCard__answers">
        {props.answers.map((a) => {
          return (
            <li
              key={a.id}
              onClick={() => {
                props.onSelectAnswer(a.id);
              }}
              className={getClassName(a.id)}
            >
              {a.text}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
