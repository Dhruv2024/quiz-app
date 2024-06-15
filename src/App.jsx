import React, { useEffect, useState } from 'react';
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
  const [score, setScore] = useState(0);
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
    if (!testEnded) {
      localStorage.setItem('currentQuestion', JSON.stringify(currentQuestion));
    }
  }, [currentQuestion]);
  useEffect(() => {
    if (!testEnded) {
      localStorage.setItem('timeLeft', time);
    }
  }, [time]);

  if (newUser) {
    return (
      <div className="w-full h-screen flex justify-center items-center flex-col bg-gray-900 text-white">
        <button
          onClick={() => {
            handleFullScreen();
            setNewUser(false);
          }}
          className="text-2xl border-2 border-purple-800 p-4 rounded-lg hover:bg-purple-800"
        >
          Start Quiz
        </button>
      </div>
    )
  }
  if (testEnded) {
    localStorage.clear();
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-2xl mb-4">Your Score is: {score}</p>
          <button
            onClick={() => {
              location.reload();
            }}
            className="text-xl bg-purple-600 p-4 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  if (!fullScreen) {
    return (
      <div className="overflow-hidden bg-slate-800 text-white lg:text-black">
        <div className="lg:bg-[url('./assets/screen.jpg')] lg:h-[100vh] w-[100vw] lg:bg-no-repeat lg:bg-cover lg:absolute"></div>
        <div className="lg:relative lg:translate-y-48 z-20 h-[100vh] lg:left-60 translate-y-40">
          <p className='lg:text-3xl text-xl font-semibold text-center lg:text-start'>Please enable fullscreen mode to start the quiz.</p>
          <button onClick={handleFullScreen} className='text-center lg:translate-x-[150%] mt-6 border-2 p-4 rounded-xl hover:bg-slate-200 hover:text-black'>Enable Fullscreen</button>
        </div>
      </div >
    );
  }
  return (
    <div className="div w-[100vw] h-[100vh] flex flex-col pt-[5%] items-center gap-y-6 bg-slate-800 text-white">
      {/* {startQuiz && <p>Quiz has started!</p>} */}
      <div className='border-2 border-yellow-300 p-6 rounded-full'>
        {time}
      </div>

      <div className=''>
        <div className='flex items-center text-2xl mb-4'>
          <span className="text-blue-300 mr-2">Question:</span>
          {questions[currentQuestion].question}
        </div>
        {
          check &&
          <div className='flex flex-col items-center'>
            {
              questions[currentQuestion].option.map((element, index) => (
                <div key={index} className={((index == selected) ? "bg-blue-300 text-black text-xl border-2 mb-3 text-center p-1 rounded-lg w-[80%] cursor-pointer" : "text-xl border-2 mb-3 text-center p-1 rounded-lg w-[80%] hover:bg-slate-700 cursor-pointer")} onClick={() => {
                  setSelected(index)
                }}> {element}</div>
              ))
            }
          </div>
        }
        {
          !check &&
          <div className='flex flex-col items-center'>
            {
              (questions[currentQuestion].option).map((op, index) => (
                <div key={index} className={(questions[currentQuestion].option[index] === questions[currentQuestion].correct ? ("bg-green-400 text-xl border-2 mb-3 text-center p-1 rounded-lg w-[80%] hover:bg-slate-700 cursor-pointer") : (index === selected) ? ("bg-red-400 text-xl border-2 mb-3 text-center p-1 rounded-lg w-[80%] hover:bg-slate-700 cursor-pointer") : "text-xl border-2 mb-3 text-center p-1 rounded-lg w-[80%] hover:bg-slate-700 cursor-pointer")}> {op}</div>
              ))
            }
          </div>
        }
        {
          check ? (
            <div className='flex justify-center mt-10'>
              <button onClick={() => {
                if (questions[currentQuestion].option[selected] === questions[currentQuestion].correct) {
                  setScore(score + 1);
                }
                setCheck(false);
              }}
                className='border-2 px-4 py-3 w-[90%] rounded-2xl hover:bg-yellow-300 hover:text-black'
              >
                Check Answer
              </button>
            </div>
          ) : (
            <div className='flex justify-center mt-10'>
              <button onClick={() => {
                // console.log(score);
                if (currentQuestion + 1 >= questions.length) {
                  setTestEnded(true);
                  return;
                }
                setCurrentQuestion(currentQuestion + 1);
                setCheck(true);
                setSelected(-1);
              }}
                className='border-2 px-4 py-3 w-[90%] rounded-2xl hover:bg-yellow-300 hover:text-black'
              >
                Next Question
              </button>
            </div>
          )
        }
      </div>
    </div>
  );
}

export default App;