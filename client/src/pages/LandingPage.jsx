import React from 'react'
import LandingHeader from '../components/LandingHeader'
import HeroSection from '../components/HeroSection'
import Features from '../components/Features'
import FeedbackForm from '../components/FeedbackForm'
import Footer from '../components/Footer'

const LandingPage = () => {
  return (
    <div className='min-w-[375px]'>
      <LandingHeader />
      <HeroSection/>
      <Features/>
      <FeedbackForm/>
      <Footer/>
    </div>
  )
}

export default LandingPage
