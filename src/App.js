import { Provider } from "react-redux";

import store from "./store";
import QuizContainer from "./components/QuizContainer";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <QuizContainer />
      </div>
    </Provider>
  );
}

export default App;
