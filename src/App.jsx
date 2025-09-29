import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import InterviewerDashboard from '@/components/InterviewerDashboard.jsx';
import ChatWindow from '@/components/ChatWindow.jsx';
import ResumeUpload from '@/components/ResumeUpload.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { resetInterview } from '@/features/interviewSlice.js';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const dispatch = useDispatch();
  const interviewStatus = useSelector((state) => state.interview.status);
  
  // State to control the visibility of our new modal
  const [showWelcomeBackModal, setShowWelcomeBackModal] = useState(false);

  // This effect runs once when the app loads to check for an unfinished session
  useEffect(() => {
    if (interviewStatus === 'in-progress') {
      setShowWelcomeBackModal(true);
    }
  }, []); // The empty array ensures this only runs on the initial render

  const handleResume = () => {
    setShowWelcomeBackModal(false);
  };

  const handleStartOver = () => {
    dispatch(resetInterview());
    setShowWelcomeBackModal(false);
  };

  const isInterviewActive = interviewStatus !== 'not-started';

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
     <Header />

      <main className="flex-grow w-full flex items-center justify-center">
        {isInterviewActive ? (
          <Tabs defaultValue="interviewee" className="w-full flex flex-col items-center mt-4">
            <TabsList>
              <TabsTrigger value="interviewee">Interviewee</TabsTrigger>
              <TabsTrigger value="interviewer">Interviewer</TabsTrigger>
            </TabsList>
            <TabsContent value="interviewee" className="w-full flex justify-center p-4">
              <ChatWindow />
            </TabsContent>
            <TabsContent value="interviewer" className="w-full">
              <InterviewerDashboard />
            </TabsContent>
          </Tabs>
        ) : (
          <ResumeUpload />
        )}
      </main>

    
      <Footer />

      {/* --- THE NEW WELCOME BACK MODAL --- */}
      <Dialog open={showWelcomeBackModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Welcome Back!</DialogTitle>
            <DialogDescription className="pt-2">
              It looks like you were in the middle of an interview. Would you like to resume where you left off?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleStartOver}>Start Over</Button>
            <Button onClick={handleResume}>Resume Interview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;