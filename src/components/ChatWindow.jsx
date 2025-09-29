import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { startInterview, submitAnswer, setFinalResults, resetInterview, markAsSaved, updateAndFinalizeDetails } from '../features/interviewSlice.js';
import { addCandidate } from '../features/candidatesSlice.js';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Loader2, Send, CheckCircle, RefreshCw, Maximize, Minimize } from 'lucide-react';
import useFullscreen from '../hooks/useFullscreen.js';

// This is the overlay that will show if the user exits fullscreen.
const FullscreenPrompt = ({ onReEnter }) => (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-center p-8">
        <Maximize className="h-16 w-16 text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Interview Paused</h2>
        <p className="text-slate-600 mb-6">Please re-enter fullscreen mode to continue. The timer is still running.</p>
        <Button onClick={onReEnter}>
            <Maximize className="mr-2 h-4 w-4" />
            Re-enter Fullscreen
        </Button>
    </div>
);


const ChatBubble = ({ message, role, difficulty }) => {
    const isUser = role === 'user';
    
    const difficultyStyles = {
        Easy: 'border-green-300 bg-green-100 text-green-800',
        Medium: 'border-yellow-300 bg-yellow-100 text-yellow-800',
        Hard: 'border-red-300 bg-red-100 text-red-800',
    };
    
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-in fade-in duration-500`}>
            <div className={`relative max-w-md px-4 py-3 rounded-2xl shadow-sm ${isUser ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-900'}`}>
                <p className="whitespace-pre-wrap">{message}</p>
                {difficulty && (
                     <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 border rounded-full py-0.5 px-2.5 font-semibold text-xs ${difficultyStyles[difficulty]}`}>
                        {difficulty}
                    </div>
                )}
            </div>
        </div>
    );
};

const Timer = ({ duration, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const progress = (timeLeft / duration) * 100;

    useEffect(() => {
        setTimeLeft(duration);
    }, [duration]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }
        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeUp]);

    return (
        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s linear' }}></div>
            <p className="text-center text-sm text-slate-500 mt-1">{timeLeft} seconds remaining</p>
        </div>
    );
};

const InfoGathering = ({ candidate }) => {
    const dispatch = useDispatch();
    const [missingInfo, setMissingInfo] = useState('');
    
    const missingField = !candidate.name ? 'name' : !candidate.email ? 'email' : 'phone';
    const prompt = `Thanks for the resume! I found some details, but I'm missing your ${missingField}. Could you please provide it?`;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!missingInfo.trim()) return;
        dispatch(updateAndFinalizeDetails({ [missingField]: missingInfo }));
        setMissingInfo('');
    };

    return (
        <div className="p-4">
            <ChatBubble message={prompt} role="assistant" />
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-4 p-4 border-t">
                <Input
                    placeholder={`Your ${missingField}...`}
                    value={missingInfo}
                    onChange={(e) => setMissingInfo(e.target.value)}
                    autoFocus
                />
                <Button type="submit"><Send className="h-4 w-4" /></Button>
            </form>
        </div>
    );
};

const ChatWindow = () => {
    const dispatch = useDispatch();
    const interviewState = useSelector((state) => state.interview);
    const { status, candidate, questions, answers, currentQuestionIndex, score, summary, isSaved } = interviewState;
    
    const [isLoading, setIsLoading] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [conversation, setConversation] = useState([]);
    const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
    
    const messagesEndRef = useRef(null);
    const chatWindowRef = useRef(null);
    const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen(chatWindowRef);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    const handleTimeUp = useCallback(() => {
        dispatch(submitAnswer(userInput || ""));
        setUserInput('');
    }, [dispatch, userInput]);
    
    useEffect(() => {
        if (status === 'completed' && !isSaved) {
            dispatch(addCandidate(interviewState));
            dispatch(markAsSaved());
            if (isFullscreen) { 
                exitFullscreen();
            }
        }
    }, [status, isSaved, dispatch, interviewState, isFullscreen, exitFullscreen]);

    useEffect(() => {
        const beginInterview = async () => {
            if (status === 'ready' && candidate.name) {
                setIsLoading(true);
                try {
                    const response = await fetch('/api/generateQuestions', { method: 'POST' });
                    if (!response.ok) throw new Error("Failed to generate questions.");
                    const data = await response.json();
                    dispatch(startInterview(data.questions));
                    enterFullscreen(); 
                } catch (error) {
                    console.error("Failed to fetch questions", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        beginInterview();
    }, [status, candidate.name, dispatch, enterFullscreen]);
    
    useEffect(() => {
        if (status === 'in-progress' && !isFullscreen) {
            setShowFullscreenPrompt(true);
        } else {
            setShowFullscreenPrompt(false);
        }
    }, [status, isFullscreen]);

    useEffect(() => {
        const evaluate = async () => {
            if (status === 'evaluating') {
                try {
                    const response = await fetch('/api/evaluateInterview', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ questions, answers }),
                    });
                    const data = await response.json();
                    dispatch(setFinalResults(data));
                } catch (error) {
                    console.error("Failed to evaluate interview", error);
                }
            }
        };
        evaluate();
    }, [status, questions, answers, dispatch]);

    useEffect(() => {
        if (!candidate.name && status !== 'gathering-info') return;

        const newConversation = [{ role: 'assistant', message: `Hello ${candidate.name || ''}! Let's begin.` }];
        if (['in-progress', 'completed', 'evaluating'].includes(status)) {
            questions.slice(0, currentQuestionIndex + 1).forEach((q, index) => {
                newConversation.push({ role: 'assistant', message: q.question, difficulty: q.difficulty });
                if (answers[index] !== undefined) {
                    newConversation.push({ role: 'user', message: answers[index] || "You didn't provide an answer." });
                }
            });
        }
        setConversation(newConversation);
    }, [questions, answers, currentQuestionIndex, candidate.name, status]);

    const handleAnswerSubmit = (e) => {
        e.preventDefault();
        if (status !== 'in-progress') return;
        dispatch(submitAnswer(userInput));
        setUserInput('');
    };

    const handleStartNewInterview = () => {
        dispatch(resetInterview());
    };

    if (status === 'ready' && isLoading) {
        return (
            <div className="text-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                <p className="mt-4 text-lg font-medium text-gray-700">Generating Interview Questions...</p>
                 <div className="mt-6">
                    <p className="text-sm text-slate-500 mb-2">Stuck on this screen?</p>
                    <Button variant="outline" onClick={handleStartNewInterview}>Start Over</Button>
                </div>
            </div>
        )
    }
    
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div
  ref={chatWindowRef}
  className={`relative w-full max-w-2xl mx-auto flex flex-col bg-white border rounded-lg shadow-xl
  ${isFullscreen ? 'h-screen' : 'min-h-[80vh]'} overflow-hidden`}
>
            {showFullscreenPrompt && <FullscreenPrompt onReEnter={enterFullscreen} />}
            
            <div className="p-4 border-b bg-slate-50 rounded-t-lg flex justify-between items-center">
                 <div className="w-10"></div>
                <h2 className="text-xl font-semibold text-center">
                    {status === 'gathering-info' ? 'Completing Your Profile' : 'Your Interview'}
                </h2>
                 <div className="w-10"></div>
            </div>

            {status === 'gathering-info' ? (
                <InfoGathering candidate={candidate} />
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                     <ScrollArea className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
    {conversation.map((entry, index) => (
      <ChatBubble
        key={index}
        message={entry.message}
        role={entry.role}
        difficulty={entry.difficulty}
      />
    ))}
    {status === 'evaluating' && (
      <div className="text-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        <p className="mt-2 font-medium text-gray-700">Evaluating your answers...</p>
      </div>
    )}
    <div ref={messagesEndRef} />
  </ScrollArea>
                    
                     {status === 'in-progress' && currentQuestion && (
                         <div className="p-4 border-t bg-white">
                            <Timer key={currentQuestionIndex} duration={currentQuestion.time} onTimeUp={handleTimeUp} />
                            <form onSubmit={handleAnswerSubmit} className="flex items-center gap-2 mt-2">
                                <Input
                                    placeholder="Type your answer..."
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    className="flex-grow"
                                    autoFocus
                                />
                                <Button type="submit"><Send className="h-4 w-4" /></Button>
                            </form>
                         </div>
                    )}
                     {status === 'completed' && (
                        <div className="p-6 text-center border-t bg-slate-50 rounded-b-lg">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold">Interview Complete!</h3>
                            <p className="text-5xl font-bold my-4">{score}/100</p>
                            <p className="text-slate-600 text-left p-4 bg-slate-100 rounded-md">{summary}</p>
                            <Button onClick={handleStartNewInterview} className="mt-6">
                                <RefreshCw className="mr-2 h-4 w-4" /> Start New Interview
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWindow;

