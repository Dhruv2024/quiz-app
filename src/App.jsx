import React, { useEffect, useRef, useState } from 'react';
import screenfull from 'screenfull';
import './App.css';
import { useTimer } from 'use-timer';
import { questions } from '../data/questions'

function App() {
  const [fullScreen, setFullScreen] = useState(false);
  const [startQuiz, setStart] = useState(false);
  const [newUser, setNewUser] = useState(parseInt(localStorage.getItem('currentQuestion')) > 0 ? false : true);
  const [testEnded, setTestEnded] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [currentQuestion, setCurrentQuestion] = useState(parseInt(localStorage.getItem('currentQuestion')) || 0);
  const score = useRef(0);
  const { time, start, pause, reset, status } = useTimer({
    initialTime: localStorage.getItem('timeLeft') != null ? (parseInt(localStorage.getItem('timeLeft'))) : 600,
    endTime: 0,
    timerType: 'DECREMENTAL',
    onTimeOver: () => {
      console.log('Time is over');
      setTestEnded(true);
    },
  });

  const [check, setCheck] = useState(true);
  const handleFullScreen = () => {
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  };
  // console.log(questions)
  useEffect(() => {
    const handleScreenChange = () => {
      // console.log(screenfull.isFullscreen)
      setFullScreen(screenfull.isFullscreen);
      if (screenfull.isFullscreen) {
        setStart(true);
        start();
      }
      else {
        pause();
      }
    };
    if (screenfull.isEnabled) {
      screenfull.on('change', handleScreenChange);
    }

    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change', handleScreenChange);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('currentQuestion', JSON.stringify(currentQuestion));
  }, [currentQuestion]);

  useEffect(() => {
    localStorage.setItem('timeLeft', time);
  }, [time]);

  if (newUser) {
    return (
      <div>
        <div>
          New User
        </div>
        <button onClick={() => {
          handleFullScreen();
          setNewUser(false);
        }}>Start Quiz</button>
      </div>
    )
  }
  if (testEnded) {
    return (
      <div>
        Your Score is : {score.current}
      </div>
    )
  }
  if (!fullScreen) {
    return (
      <div className="fullscreen-prompt">
        <p>Please enable fullscreen mode to start the quiz.</p>
        <button onClick={handleFullScreen}>Enable Fullscreen</button>
      </div>
    );
  }
  return (
    <div className="quiz-container">
      <h1>Quiz in Fullscreen Mode</h1>
      {startQuiz && <p>Quiz has started!</p>}
      Time Left: {time}

      <div>
        Question: {
          questions[currentQuestion].question},
        {
          check &&
          (questions[currentQuestion].option).map((element, index) => (
            <div key={index} className={(index == selected) ? "bg-blue-300" : ""} onClick={() => {
              setSelected(index)
            }}>{element}</div>
          ))
        }
        {
          !check &&
          (questions[currentQuestion].option).map((op, index) => (
            <div key={index} className={(questions[currentQuestion].option[index] === questions[currentQuestion].correct ? ("bg-green-400") : (index === selected) ? ("bg-red-400") : "")}> {op}</div>
          ))
        }
        {
          check ? (
            <button onClick={() => {
              setCheck(false);
            }}>
              Check Answer
            </button>
          ) : (
            <div onClick={() => {
              // console.log(score);
              if (currentQuestion + 1 >= questions.length) {
                if (questions[currentQuestion].option[selected] === questions[currentQuestion].correct) {
                  score.current = score.current + 1;
                }
                setTestEnded(true);
                return;
              }
              setCurrentQuestion(currentQuestion + 1);
              setCheck(true);
              setSelected(-1);
            }}>
              Next Question
            </div>
          )
        }
      </div>
    </div>
  );
}

export default App;