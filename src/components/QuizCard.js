import React from "react";

export default function QuizCard(props) {
  return (
    <div className="QuizCard">
      <h3>{props.questionText}</h3>
      <ol className="QuizCard__answers">
        {props.answers.map((a) => (
          <li
            onClick={() => {
              props.onSelectAnswer(a.id);
            }}
          >
            {a.text}
          </li>
        ))}
      </ol>
    </div>
  );
}
