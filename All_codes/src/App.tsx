import { Routes, Route } from 'react-router-dom';
import Home from './app/page';
import WorkPage from './app/work/page';
import AdvisorPage from './app/advisor/page';
import JournalPage from './app/journal/[tripId]/page';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/work" element={<WorkPage />} />
      <Route path="/advisor" element={<AdvisorPage />} />
      <Route path="/journal/:tripId" element={<JournalPage />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
