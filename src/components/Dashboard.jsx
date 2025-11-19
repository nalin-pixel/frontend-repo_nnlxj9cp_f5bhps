import { useEffect, useState } from 'react'

function Section({ title, children }){
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h2 className="text-white font-semibold mb-3">{title}</h2>
      {children}
    </div>
  )
}

export default function Dashboard({ user, onLogout }){
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [stats, setStats] = useState(null)
  const [newAppt, setNewAppt] = useState({ doctor_id:'', scheduled_at:'', reason:'', payment_method:'online' })
  const [presc, setPresc] = useState({ appointment_id:'', notes:'', medications:'', follow_up_date:'' })
  const [availability, setAvailability] = useState({ week_start:'', slots:'' })

  useEffect(()=>{
    if(user.role==='patient'){
      fetch(`${baseUrl}/api/doctors`).then(r=>r.json()).then(setDoctors)
      fetch(`${baseUrl}/api/patient/${user._id}/appointments`).then(r=>r.json()).then(setAppointments)
    }
    if(user.role==='doctor'){
      fetch(`${baseUrl}/api/doctor/${user._id}/appointments`).then(r=>r.json()).then(setAppointments)
      fetch(`${baseUrl}/api/doctor/${user._id}/stats`).then(r=>r.json()).then(setStats)
    }
    if(user.role==='admin'){
      fetch(`${baseUrl}/api/doctors`).then(r=>r.json()).then(setDoctors)
    }
  },[user])

  const bookAppointment = async ()=>{
    const body = { doctor_id: newAppt.doctor_id, scheduled_at: newAppt.scheduled_at, reason: newAppt.reason, payment_method: newAppt.payment_method }
    const res = await fetch(`${baseUrl}/api/patient/${user._id}/appointments`,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    const data = await res.json()
    alert('Booked appointment ' + data.appointment_id)
  }

  const createPrescription = async ()=>{
    const body = { appointment_id: presc.appointment_id, notes: presc.notes, medications: presc.medications.split('\n').filter(Boolean), follow_up_date: presc.follow_up_date }
    await fetch(`${baseUrl}/api/doctor/${user._id}/prescription`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    alert('Prescription saved')
  }

  const saveAvailability = async ()=>{
    const body = { week_start: availability.week_start, available_slots: availability.slots.split('\n').filter(Boolean) }
    await fetch(`${baseUrl}/api/doctor/${user._id}/availability`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    alert('Availability saved')
  }

  const adminBook = async ()=>{
    const body = { patient_id: newAppt.patient_id, doctor_id: newAppt.doctor_id, scheduled_at: newAppt.scheduled_at, reason: newAppt.reason }
    const res = await fetch(`${baseUrl}/api/admin/appointments`,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    const data = await res.json()
    alert('Admin booked ' + data.appointment_id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
          <button onClick={onLogout} className="px-3 py-1 rounded bg-slate-800 border border-white/10">Logout</button>
        </div>

        {user.role==='patient' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Section title="Find Doctors & Book">
              <div className="space-y-2">
                <select className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2" value={newAppt.doctor_id} onChange={e=>setNewAppt(a=>({...a, doctor_id:e.target.value}))}>
                  <option value="">Select doctor</option>
                  {doctors.map(d=> <option key={d._id} value={d._id}>{d.name || d.email}</option>)}
                </select>
                <input className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2" type="datetime-local" value={newAppt.scheduled_at} onChange={e=>setNewAppt(a=>({...a, scheduled_at:e.target.value}))} />
                <input className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2" placeholder="Reason" value={newAppt.reason} onChange={e=>setNewAppt(a=>({...a, reason:e.target.value}))} />
                <select className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2" value={newAppt.payment_method} onChange={e=>setNewAppt(a=>({...a, payment_method:e.target.value}))}>
                  <option value="online">Online</option>
                  <option value="cod">Pay at counter</option>
                </select>
                <button onClick={bookAppointment} className="px-4 py-2 rounded bg-blue-600">Book Appointment</button>
              </div>
            </Section>
            <Section title="Your Appointments">
              <ul className="space-y-2">
                {appointments.map(a=> (
                  <li key={a._id} className="p-3 bg-slate-900/60 border border-white/10 rounded">
                    <div className="text-sm">Doctor: {a.doctor_id}</div>
                    <div className="text-sm">When: {a.scheduled_at}</div>
                    <div className="text-sm">Status: {a.status} | Payment: {a.payment_status}</div>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        )}

        {user.role==='doctor' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Section title="Appointments">
              <ul className="space-y-2">
                {appointments.map(a=> (
                  <li key={a._id} className="p-3 bg-slate-900/60 border border-white/10 rounded">
                    <div className="text-sm">Patient: {a.patient_id}</div>
                    <div className="text-sm">When: {a.scheduled_at}</div>
                    <div className="text-sm">Status: {a.status}</div>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Weekly Availability">
              <div className="space-y-2">
                <input className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2" type="date" value={availability.week_start} onChange={e=>setAvailability(s=>({...s, week_start:e.target.value}))} />
                <textarea className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2" rows="5" placeholder="Slots (one ISO datetime per line)" value={availability.slots} onChange={e=>setAvailability(s=>({...s, slots:e.target.value}))}></textarea>
                <button onClick={saveAvailability} className="px-4 py-2 rounded bg-blue-600">Save</button>
              </div>
            </Section>
            <Section title="Add Prescription">
              <div className="space-y-2">
                <input className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2" placeholder="Appointment ID" value={presc.appointment_id} onChange={e=>setPresc(p=>({...p, appointment_id:e.target.value}))} />
                <textarea className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2" rows="3" placeholder="Notes" value={presc.notes} onChange={e=>setPresc(p=>({...p, notes:e.target.value}))}></textarea>
                <textarea className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2" rows="4" placeholder="Medications (one per line)" value={presc.medications} onChange={e=>setPresc(p=>({...p, medications:e.target.value}))}></textarea>
                <input className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2" type="date" value={presc.follow_up_date} onChange={e=>setPresc(p=>({...p, follow_up_date:e.target.value}))} />
                <button onClick={createPrescription} className="px-4 py-2 rounded bg-blue-600">Save Prescription</button>
              </div>
            </Section>
            <Section title="Your Stats">
              {stats ? (
                <div className="space-y-1 text-sm">
                  <div>Treated Patients: {stats.treated_patients}</div>
                  <div>Points: {stats.points}</div>
                  <div>Salary: ${'{'}stats.salary{'}'}</div>
                </div>
              ) : <div className="text-slate-400 text-sm">Loading...</div>}
            </Section>
          </div>
        )}

        {user.role==='admin' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Section title="Create Appointment">
              <div className="space-y-2">
                <input className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2" placeholder="Patient ID" value={newAppt.patient_id||''} onChange={e=>setNewAppt(a=>({...a, patient_id:e.target.value}))} />
                <select className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2" value={newAppt.doctor_id} onChange={e=>setNewAppt(a=>({...a, doctor_id:e.target.value}))}>
                  <option value="">Select doctor</option>
                  {doctors.map(d=> <option key={d._id} value={d._id}>{d.name || d.email}</option>)}
                </select>
                <input className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2" type="datetime-local" value={newAppt.scheduled_at} onChange={e=>setNewAppt(a=>({...a, scheduled_at:e.target.value}))} />
                <input className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2" placeholder="Reason" value={newAppt.reason} onChange={e=>setNewAppt(a=>({...a, reason:e.target.value}))} />
                <button onClick={adminBook} className="px-4 py-2 rounded bg-blue-600">Book</button>
              </div>
            </Section>
            <Section title="Doctors">
              <ul className="space-y-2">
                {doctors.map(d=> <li key={d._id} className="p-3 bg-slate-900/60 border border-white/10 rounded">{d.name || d.email}</li>)}
              </ul>
            </Section>
          </div>
        )}
      </div>
    </div>
  )
}
