'use client'

import { useCallback, useState } from 'react'

const ZONES = [
  { id: 'nuca-izq',    label: 'Nuca Izq.',     color: '#e07b54', cx: 118, cy: 52  },
  { id: 'nuca-der',    label: 'Nuca Der.',      color: '#d4a853', cx: 148, cy: 52  },
  { id: 'espalda-izq', label: 'Espalda Izq.',   color: '#7a9e7e', cx: 100, cy: 100 },
  { id: 'espalda-der', label: 'Espalda Der.',    color: '#5d8f82', cx: 166, cy: 100 },
  { id: 'lomo-izq',    label: 'Lomo Izq.',      color: '#9c7bb5', cx: 95,  cy: 145 },
  { id: 'lomo-der',    label: 'Lomo Der.',       color: '#7b6fa0', cx: 171, cy: 145 },
  { id: 'cadera-izq',  label: 'Cadera Izq.',    color: '#c0756b', cx: 105, cy: 192 },
  { id: 'cadera-der',  label: 'Cadera Der.',     color: '#b05a5a', cx: 161, cy: 192 },
]

const ZONE_MAP = Object.fromEntries(ZONES.map(z => [z.id, z]))

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(str) {
  const d = new Date(`${str}T12:00:00`)
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

function daysDiff(dateStr) {
  const now = new Date(`${todayStr()}T00:00:00`)
  const then = new Date(`${dateStr}T00:00:00`)
  return Math.round((now - then) / 86400000)
}

function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function CatDiagram({ selected, history, onSelect }) {
  const lastUsed = {}
  history.forEach(entry => {
    if (!(entry.zone in lastUsed)) {
      lastUsed[entry.zone] = daysDiff(entry.date)
    }
  })

  const suggested = getSuggestedZone(history)

  function getZoneState(id) {
    if (id === selected) return 'selected'
    if (id === suggested?.id) return 'suggest'
    const days = lastUsed[id]
    if (days === 0) return 'today'
    if (days !== undefined && days <= 3) return 'recent'
    return 'idle'
  }

  function getFill(id) {
    const state = getZoneState(id)
    const zone = ZONE_MAP[id]
    if (state === 'selected') return zone.color
    if (state === 'suggest') return '#7a9e7e'
    if (state === 'today') return '#c75f3e'
    if (state === 'recent') return '#c4792a'
    return '#d4c4b5'
  }

  function getStroke(id) {
    const state = getZoneState(id)
    if (state === 'selected') return '#2d2118'
    if (state === 'suggest') return '#4a7a50'
    return 'none'
  }

  function handleKeyDown(event, zoneId) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(zoneId)
    }
  }

  return (
    <div className="cat-svg-wrap">
      <svg viewBox="0 0 266 260" xmlns="http://www.w3.org/2000/svg" fill="none">
        <ellipse cx="133" cy="148" rx="62" ry="78" fill="#e8d5be" />
        <ellipse cx="133" cy="48" rx="34" ry="30" fill="#e8d5be" />
        <polygon points="103,24 95,4 118,18" fill="#e8d5be" />
        <polygon points="107,22 99,6 120,17" fill="#d4b89a" />
        <polygon points="163,24 171,4 148,18" fill="#e8d5be" />
        <polygon points="159,22 167,6 146,17" fill="#d4b89a" />
        <path d="M195,200 Q230,185 240,155 Q248,130 228,118" stroke="#e8d5be" strokeWidth="14" strokeLinecap="round" fill="none"/>
        <rect x="100" y="205" width="20" height="42" rx="10" fill="#e8d5be"/>
        <rect x="146" y="205" width="20" height="42" rx="10" fill="#e8d5be"/>
        <ellipse cx="108" cy="215" rx="15" ry="24" fill="#dfc9a8"/>
        <ellipse cx="158" cy="215" rx="15" ry="24" fill="#dfc9a8"/>
        <ellipse cx="110" cy="244" rx="13" ry="7" fill="#d4b89a"/>
        <ellipse cx="156" cy="244" rx="13" ry="7" fill="#d4b89a"/>
        <ellipse cx="122" cy="50" rx="6" ry="7" fill="#2d2118" opacity="0.85"/>
        <ellipse cx="144" cy="50" rx="6" ry="7" fill="#2d2118" opacity="0.85"/>
        <ellipse cx="122" cy="49" rx="3" ry="4" fill="white" opacity="0.5"/>
        <ellipse cx="144" cy="49" rx="3" ry="4" fill="white" opacity="0.5"/>
        <path d="M131,61 L133,64 L135,61 Z" fill="#c46e7e"/>
        <path d="M133,64 Q129,67 127,66" stroke="#c46e7e" strokeWidth="1" strokeLinecap="round" fill="none"/>
        <path d="M133,64 Q137,67 139,66" stroke="#c46e7e" strokeWidth="1" strokeLinecap="round" fill="none"/>
        <line x1="100" y1="60" x2="122" y2="62" stroke="#9b8878" strokeWidth="0.8" opacity="0.6"/>
        <line x1="100" y1="64" x2="122" y2="63" stroke="#9b8878" strokeWidth="0.8" opacity="0.6"/>
        <line x1="144" y1="62" x2="166" y2="60" stroke="#9b8878" strokeWidth="0.8" opacity="0.6"/>
        <line x1="144" y1="63" x2="166" y2="64" stroke="#9b8878" strokeWidth="0.8" opacity="0.6"/>
        <path d="M105,120 Q133,115 161,120" stroke="#d4b89a" strokeWidth="2" fill="none" opacity="0.5"/>
        <path d="M103,135 Q133,130 163,135" stroke="#d4b89a" strokeWidth="1.5" fill="none" opacity="0.4"/>
        <path d="M104,150 Q133,145 162,150" stroke="#d4b89a" strokeWidth="2" fill="none" opacity="0.5"/>

        {ZONES.map(zone => (
          <g
            key={zone.id}
            className="zone-btn"
            onClick={() => onSelect(zone.id)}
            role="button"
            tabIndex={0}
            aria-label={zone.label}
            onKeyDown={event => handleKeyDown(event, zone.id)}
          >
            <circle
              className="zone-circle"
              cx={zone.cx}
              cy={zone.cy}
              r="17"
              fill={getFill(zone.id)}
              stroke={getStroke(zone.id)}
              strokeWidth="2.5"
              opacity="0.88"
            />
            <text className="zone-label" x={zone.cx} y={zone.cy}>
              {zone.label.split(' ').map((word, i, arr) => (
                <tspan key={i} x={zone.cx} dy={i === 0 ? (arr.length > 1 ? '-3' : '0') : '8'}>
                  {word}
                </tspan>
              ))}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function getSuggestedZone(history) {
  if (history.length === 0) return ZONES[0]

  const lastUsed = {}
  history.forEach(entry => {
    if (!(entry.zone in lastUsed)) {
      lastUsed[entry.zone] = entry.date
    }
  })

  let best = null
  let bestDate = null

  for (const zone of ZONES) {
    const date = lastUsed[zone.id] ?? '2000-01-01'
    if (bestDate === null || date < bestDate) {
      bestDate = date
      best = zone
    }
  }

  return best
}

export default function TrackerClient({ initialTreatment }) {
  const [history, setHistory] = useState(initialTreatment.injections)
  const [selectedZone, setSelectedZone] = useState(null)
  const [date, setDate] = useState(todayStr())
  const [notes, setNotes] = useState('')
  const [catName, setCatName] = useState(initialTreatment.catName)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2200)
  }, [])

  const suggested = getSuggestedZone(history)
  const currentTreatmentDay = Math.min(Math.max(daysDiff(initialTreatment.startedAt) + 1, 1), 84)

  async function saveCatName() {
    try {
      const response = await fetch(`/api/treatments/${initialTreatment.shareToken}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catName }),
      })

      if (!response.ok) throw new Error('Failed to save cat name')
      showToast('Nombre guardado')
    } catch {
      showToast('No se pudo guardar el nombre')
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch {
      showToast('No se pudo cerrar sesión')
    }
  }

  async function handleLog() {
    if (!selectedZone || saving) return

    setSaving(true)

    try {
      const response = await fetch(`/api/treatments/${initialTreatment.shareToken}/injections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone: selectedZone, date, notes }),
      })

      if (!response.ok) throw new Error('Failed to save injection')

      const { injection } = await response.json()
      setHistory(prev => [injection, ...prev])
      setSelectedZone(null)
      setNotes('')
      setDate(todayStr())
      showToast('✓ Inyección registrada')
    } catch {
      showToast('No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`/api/treatments/${initialTreatment.shareToken}/injections/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete injection')
      setHistory(prev => prev.filter(e => e.id !== id))
      showToast('Entrada eliminada')
    } catch {
      showToast('No se pudo eliminar')
    }
  }

  async function handleClear() {
    if (!confirm('¿Borrar todo el historial?')) return

    const previous = history
    setHistory([])

    try {
      await Promise.all(previous.map(entry => fetch(
        `/api/treatments/${initialTreatment.shareToken}/injections/${entry.id}`,
        { method: 'DELETE' }
      )))
      showToast('Historial eliminado')
    } catch {
      setHistory(previous)
      showToast('No se pudo borrar todo')
    }
  }

  function getRelativeDay(dateStr) {
    const diff = daysDiff(dateStr)
    if (diff === 0) return 'hoy'
    if (diff === 1) return 'ayer'
    if (diff === 2) return 'hace 2 días'
    return formatDate(dateStr)
  }

  return (
    <main className="app">
      <header className="header">
        <div className="header-paw">🐾</div>
        <h1>Tracker <span>PIF</span></h1>
        <div className="cat-name-input-wrap">
          <span style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>para</span>
          <input
            className="cat-name-input"
            value={catName}
            onBlur={saveCatName}
            onChange={e => setCatName(e.target.value)}
            placeholder="nombre del gato"
            maxLength={30}
          />
        </div>
        <button className="btn-link" onClick={handleLogout}>Cerrar sesión</button>
      </header>

      <div className="suggestion">
        <div className="suggestion-icon">💉</div>
        <div className="suggestion-text">
          <strong>Zona sugerida para hoy</strong>
          <span>{suggested?.label ?? '—'}</span>
          {history.length > 0 && suggested && (() => {
            const lastEntry = history.find(e => e.zone === suggested.id)
            if (!lastEntry) return <div className="suggestion-days">Nunca usada</div>
            const days = daysDiff(lastEntry.date)
            return <div className="suggestion-days">Última vez hace {days} día{days !== 1 ? 's' : ''}</div>
          })()}
          {history.length === 0 && <div className="suggestion-days">Empieza por aquí</div>}
        </div>
        <button className="btn-suggestion" onClick={() => setSelectedZone(suggested?.id ?? null)}>
          Usar esta
        </button>
      </div>

      <div className="main-grid">
        <div className="diagram-panel">
          <h2>Selecciona la zona</h2>
          <CatDiagram selected={selectedZone} history={history} onSelect={setSelectedZone} />
          <div className="legend">
            <div className="legend-item"><div className="legend-dot" style={{ background: '#d4c4b5' }}/><span>Libre</span></div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#7a9e7e' }}/><span>Sugerida</span></div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#c4792a' }}/><span>Reciente (≤3d)</span></div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#c75f3e' }}/><span>Hoy</span></div>
          </div>
        </div>

        <div className="right-panel">
          <div className="log-form">
            <h2>Registrar inyección</h2>

            <div className={`selected-zone-display ${!selectedZone ? 'empty' : ''}`}>
              {selectedZone ? `📍 ${ZONE_MAP[selectedZone]?.label}` : 'Haz clic en una zona del gato'}
            </div>

            <input type="date" className="date-input" value={date} onChange={e => setDate(e.target.value)} />

            <textarea
              className="notes-input"
              rows={2}
              placeholder="Notas opcionales (reacción, dosis…)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />

            <button className="btn-log" disabled={!selectedZone || saving} onClick={handleLog}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>

          <div className="history-panel">
            <h2>
              Historial
              {history.length > 0 && <button className="btn-clear" onClick={handleClear}>borrar todo</button>}
            </h2>

            {history.length === 0 ? (
              <p className="history-empty">Sin registros aún</p>
            ) : (
              <ul className="history-list">
                {history.map(entry => {
                  const zone = ZONE_MAP[entry.zone]
                  const diff = daysDiff(entry.date)
                  const cls = diff === 0 ? 'today' : diff === 1 ? 'yesterday' : ''

                  return (
                    <li key={entry.id} className={`history-item ${cls}`}>
                      <div className="history-dot" style={{ background: zone?.color ?? '#ccc' }} />
                      <div className="history-info">
                        <div className="history-zone">{zone?.label ?? entry.zone}</div>
                        <div className="history-meta">{getRelativeDay(entry.date)}</div>
                        {entry.notes && <div className="history-notes">{entry.notes}</div>}
                      </div>
                      <button className="btn-delete-entry" onClick={() => handleDelete(entry.id)} aria-label="Eliminar">
                        ×
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <TreatmentCalendar
        history={history}
        startedAt={initialTreatment.startedAt}
        startDay={initialTreatment.startDay}
        currentTreatmentDay={currentTreatmentDay}
      />

      <div className={`toast ${toastVisible ? 'show' : ''}`}>{toast}</div>
    </main>
  )
}

function TreatmentCalendar({ history, startedAt, startDay, currentTreatmentDay }) {
  const injectionByDate = Object.fromEntries(history.map(entry => [entry.date, entry]))
  const firstTrackedDay = Number(startDay) || 1

  return (
    <section className="calendar-panel">
      <div className="calendar-heading">
        <div>
          <h2>Calendario del tratamiento</h2>
          <p>Día actual estimado: {currentTreatmentDay} de 84 · seguimiento desde día {firstTrackedDay}</p>
        </div>
      </div>

      <div className="calendar-grid" aria-label="Seguimiento de 84 días">
        {Array.from({ length: 84 }, (_, index) => {
          const day = index + 1
          const date = addDays(startedAt, index)
          const injection = injectionByDate[date]
          const className = [
            'calendar-day',
            injection ? 'done' : '',
            day === currentTreatmentDay ? 'current' : '',
            day < firstTrackedDay && !injection ? 'previous' : '',
            day >= firstTrackedDay && day < currentTreatmentDay && !injection ? 'missed' : '',
          ].filter(Boolean).join(' ')

          return (
            <div key={day} className={className} title={`${formatDate(date)}${injection ? ` - ${injection.zone}` : ''}`}>
              <strong>{day}</strong>
              {injection && <span>✓</span>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
