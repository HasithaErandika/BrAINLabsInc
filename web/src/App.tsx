import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PageLayout } from './components/shared/PageLayout';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { Team } from './pages/Team';
import { Publications } from './pages/Publications';
import { Events } from './pages/Events';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { TeamMemberProfile } from './pages/TeamMemberProfile';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { ResearcherDashboard } from './pages/ResearcherDashboard';
import { ResearchAssistantDashboard } from './pages/ResearchAssistantDashboard';
import { AdminDashboard } from '@/pages/AdminDashboard';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PageLayout />}>
            <Route index element={<Home />} />
            <Route path="projects" element={<Projects />} />
            <Route path="team" element={<Team />} />
            <Route path="team/:id" element={<TeamMemberProfile />} />
            <Route path="publications" element={<Publications />} />
            <Route path="events" element={<Events />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:id" element={<BlogPost />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="dashboard/researcher" element={<ResearcherDashboard />} />
            <Route path="dashboard/assistant" element={<ResearchAssistantDashboard />} />
            <Route path="dashboard/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
