import { BrowserRouter, Routes, Route } from "react-router-dom"
import OfflineGame from "./pages/OfflineGame"
import OnlineGame from "./pages/OnlineGame"
import Lobby from "./pages/Lobby"
import ImposterCards from "./pages/ImposterCards"
import WaitingConversation from "./pages/WaitingConversation"
import ImposterReveal from "./pages/ImposterReveal"
import LandingPage from "./pages/LandingPage"

const App = () => {
  return (
    <div style={{ overflowX: 'hidden', width: '100%', position: 'relative' }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/offline" element={<OfflineGame />} />
          <Route path="/online" element={<OnlineGame />} />
          <Route path="/lobby/:lobbyId" element={<Lobby />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/cards" element={<ImposterCards />} />
          <Route path="/waiting" element={<WaitingConversation />} />
          <Route path="/reveal" element={<ImposterReveal />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;