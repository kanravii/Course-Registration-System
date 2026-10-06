import { useState } from 'react'
import Navbar from '../components/Navbar'
import OfferingsPanel from '../components/OfferingsPanel'

function AdvisorDashboard() {
  const [tab, setTab] = useState('offerings')

  return (
    <>
      <Navbar title="Advisor Dashboard" />
      <main className="page page-wide">
        <div className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'offerings'}
            className={tab === 'offerings' ? 'tab active' : 'tab'}
            onClick={() => setTab('offerings')}
          >
            Course Offerings
          </button>
          <button
            role="tab"
            aria-selected={tab === 'registration'}
            className={tab === 'registration' ? 'tab active' : 'tab'}
            onClick={() => setTab('registration')}
          >
            Student Registration
          </button>
        </div>

        {tab === 'offerings' && <OfferingsPanel />}
        {tab === 'registration' && <p>Student registration coming soon.</p>}
      </main>
    </>
  )
}

export default AdvisorDashboard