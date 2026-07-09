import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ScrollToTop from '../components/ScrollToTop'
import HomePage from '../pages/HomePage'
import RulesPage from '../pages/RulesPage'
import OurTeamPage from '../pages/OurTeamPage'
import SubmitDisputePage from '../pages/SubmitDisputePage'

export default function AppRoutes() {
  return (
    <MainLayout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/our-team" element={<OurTeamPage />} />
        <Route path="/submit-dispute" element={<SubmitDisputePage />} />
      </Routes>
    </MainLayout>
  )
}
