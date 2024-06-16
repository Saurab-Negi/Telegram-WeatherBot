import React, { useState, useEffect } from 'react';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [fullScreenEnabled, setFullScreenEnabled] = useState(false);

  useEffect(() => {
    fetch('/questions.json')
      .then(response => response.json())
      .then(data => setQuestions(data));
    
    const savedIndex = localStorage.getItem('currentQuestionIndex');
    const savedTime = localStorage.getItem('timeRemaining');
    if (savedIndex) setCurrentQuestionIndex(Number(savedIndex));
    if (savedTime) setTimeRemaining(Number(savedTime));

    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime > 0) {
          localStorage.setItem('timeRemaining', prevTime - 1);
          return prevTime - 1;
        }
        return prevTime;
      });
    }, 1000);

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const handleFullScreenChange = () => {
    setFullScreenEnabled(document.fullscreenElement != null);
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleNextQuestion = () => {
    if (selectedOption) {
      setSelectedOption('');
      setCurrentQuestionIndex(prevIndex => {
        const newIndex = prevIndex + 1;
        localStorage.setItem('currentQuestionIndex', newIndex);
        return newIndex;
      });
    }
  };

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
  };

  if (questions.length === 0) return <div>Loading...</div>;

  const currentQuestion = questions[currentQuestionIndex];
  
  if (currentQuestionIndex >= questions.length || timeRemaining <= 0) {
    return <div>Quiz Finished</div>;
  }

  return (
    <div>
      {!fullScreenEnabled && (
        <div className="fullscreen-popup">
          <p>Please enable full screen mode to continue the quiz.</p>
          <button onClick={handleFullScreen}>Enable Full Screen</button>
        </div>
      )}
      <div className={`quiz-container ${fullScreenEnabled ? '' : 'blur'}`}>
        <h2>{currentQuestion.question}</h2>
        {currentQuestion.options.map((option, index) => (
          <div key={index}>
            <input
              type="radio"
              value={option}
              checked={selectedOption === option}
              onChange={handleOptionChange}
            />
            {option}
          </div>
        ))}
        <button onClick={handleNextQuestion}>Next</button>
        <div>Time Remaining: {Math.floor(timeRemaining / 60)}:{timeRemaining % 60}</div>
      </div>
    </div>
  );
};

export default Quiz;
