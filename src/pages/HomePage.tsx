import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../sections/home/Hero'
import WhoWeAre from '../sections/about/WhoWeAre'
import FeatureCards from '../sections/about/FeatureCards'
import ProcessTimeline from '../sections/process/ProcessTimeline'
import Modal from '../components/Modal'

export default function HomePage() {
  const [showModal, setShowModal] = useState(false)
  const { hash } = useLocation()

  useEffect(() => {
    const timer = setTimeout(() => setShowModal(true), 8000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!hash) return
    const el = document.querySelector(hash)
    el?.scrollIntoView({ behavior: 'smooth' })
  }, [hash])

  return (
    <>
      <Hero />

      <section id="about" className="scroll-mt-20 pt-20 pb-10 sm:pt-28 sm:pb-12 bg-white">
        <WhoWeAre />
        <FeatureCards />
      </section>

      <section id="process" className="scroll-mt-20 pt-10 pb-20 sm:pt-12 sm:pb-28 bg-gray-50">
        <ProcessTimeline />
      </section>

      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </>
  )
}
