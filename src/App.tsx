import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PageLayout } from './components/shared/PageLayout';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { Team } from './pages/Team';
import { Publications } from './pages/Publications';
import { Events } from './pages/Events';
import { About } from './pages/About';
import { Contact } from './pages/Contact';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageLayout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="team" element={<Team />} />
          <Route path="publications" element={<Publications />} />
          <Route path="events" element={<Events />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
