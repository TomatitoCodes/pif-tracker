'use client'

import { useCallback, useEffect, useState } from 'react'

const ZONES = [
  { id: 'nuca-izq',    label: 'Nuca Izq.',     color: '#e07b54', cx: 118, cy: 52  },
  { id: 'nuca-der',    label: 'Nuca Der.',      color: '#d4a853', cx: 148, cy: 52  },
  { id: 'espalda-izq', label: 'Espalda Izq.',   color: '#7a9e7e', cx: 100, cy: 100 },
  { id: 'espalda-der', label: 'Espalda Der.',    color: '#5d8f82', cx: 166, cy: 100 },
  { id: 'lomo-izq',    label: 'Lomo Izq.',      color: '#9c7bb5', cx: 95,  cy: 145 },
  { id: 'lomo-der',    label: 'Lomo Der.',       color: '#7b6fa0', cx: 171, cy: 145 },
]

const ZONE_MAP = Object.fromEntries(ZONES.map(z => [z.id, z]))

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(str) {
  const d = new Date(`${str}T12:00:00`)
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatMonth(str) {
  const d = new Date(`${str}T12:00:00`)
  return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

function formatCalendarDate(str) {
  const d = new Date(`${str}T12:00:00`)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function formatTime(timeStr) {
  return timeStr ? timeStr.slice(0, 5) : '--:--'
}

function getSecondTime(firstTime) {
  if (!firstTime) return '20:00'
  const [h, m] = firstTime.split(':').map(Number)
  const secondH = (h + 12) % 24
  return `${String(secondH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
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
  const [slot, setSlot] = useState('first')
  const [notes, setNotes] = useState('')
  const [catName, setCatName] = useState(initialTreatment.catName)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  const firstTime = initialTreatment.firstInjectionTime || '08:00'
  const secondTime = getSecondTime(firstTime)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2200)
  }, [])

  const suggested = getSuggestedZone(history)
  const currentTreatmentDay = Math.min(Math.max(daysDiff(initialTreatment.startedAt) + 1, 1), 84)

  useEffect(() => {
    const injectionsForDate = history.filter(e => e.date === date)
    const hasFirst = injectionsForDate.some(e => e.slot === 'first')
    const hasSecond = injectionsForDate.some(e => e.slot === 'second')
    if (!hasFirst && !hasSecond) setSlot('first')
    else if (hasFirst && !hasSecond) setSlot('second')
    else if (!hasFirst && hasSecond) setSlot('first')
  }, [date, history])

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

    const injectionsForDate = history.filter(e => e.date === date)
    if (injectionsForDate.some(e => e.slot === slot)) {
      showToast(`Ya registraste la ${slot === 'first' ? '1ª' : '2ª'} dosis de ese día`)
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/treatments/${initialTreatment.shareToken}/injections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone: selectedZone, date, slot, notes }),
      })

      if (!response.ok) throw new Error('Failed to save injection')

      const { injection } = await response.json()
      setHistory(prev => [injection, ...prev])
      setSelectedZone(null)
      setNotes('')
      setDate(todayStr())
      showToast(`✓ ${slot === 'first' ? '1ª' : '2ª'} dosis guardada`)
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
        <img className="brand-logo" src="/logo%20piftracker.webp" alt="PIF Tracker" />
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

            <div className="slot-selector">
              <button
                type="button"
                className={`slot-btn ${slot === 'first' ? 'active' : ''}`}
                onClick={() => setSlot('first')}
              >
                1ª dosis <span>{formatTime(firstTime)}</span>
              </button>
              <button
                type="button"
                className={`slot-btn ${slot === 'second' ? 'active' : ''}`}
                onClick={() => setSlot('second')}
              >
                2ª dosis <span>{formatTime(secondTime)}</span>
              </button>
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
              {saving ? 'Guardando...' : `Guardar ${slot === 'first' ? '1ª' : '2ª'} dosis`}
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
                        <div className="history-meta">
                          {getRelativeDay(entry.date)} · {entry.slot === 'first' ? formatTime(firstTime) : formatTime(secondTime)} ({entry.slot === 'first' ? '1ª' : '2ª'})
                        </div>
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
  const injectionsByDate = {}
  history.forEach(entry => {
    if (!injectionsByDate[entry.date]) injectionsByDate[entry.date] = {}
    injectionsByDate[entry.date][entry.slot] = entry
  })

  const firstTrackedDay = Number(startDay) || 1
  const todayDate = todayStr()
  const days = Array.from({ length: 84 }, (_, index) => {
    const day = index + 1
    const date = addDays(startedAt, index)
    const monthKey = date.slice(0, 7)

    return { day, date, monthKey, monthLabel: formatMonth(date) }
  })
  const months = days.reduce((groups, dayInfo) => {
    const existing = groups.find(group => group.key === dayInfo.monthKey)

    if (existing) {
      existing.days.push(dayInfo)
    } else {
      groups.push({ key: dayInfo.monthKey, label: dayInfo.monthLabel, days: [dayInfo] })
    }

    return groups
  }, [])

  const currentDayEntry = days.find(d => d.day === currentTreatmentDay)
  const currentMonthKey = currentDayEntry ? currentDayEntry.monthKey : todayDate.slice(0, 7)
  const initialIndex = months.findIndex(m => m.key === currentMonthKey)
  const [visibleIndex, setVisibleIndex] = useState(Math.max(initialIndex, 0))
  const visibleMonth = months[visibleIndex]

  return (
    <section className="calendar-panel">
      <div className="calendar-heading">
        <div>
          <h2>Calendario del tratamiento</h2>
          <p>Día actual estimado: {currentTreatmentDay} de 84 · seguimiento desde día {firstTrackedDay}</p>
        </div>
      </div>

      <div className="calendar-nav">
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={() => setVisibleIndex(i => Math.max(0, i - 1))}
          disabled={visibleIndex === 0}
          aria-label="Mes anterior"
        >
          ←
        </button>
        <h3 className="calendar-month-title">{visibleMonth.label}</h3>
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={() => setVisibleIndex(i => Math.min(months.length - 1, i + 1))}
          disabled={visibleIndex === months.length - 1}
          aria-label="Mes siguiente"
        >
          →
        </button>
      </div>

      <div className="calendar-single-month" aria-label="Seguimiento de 84 días">
        <div className="calendar-grid">
          {visibleMonth.days.map(({ day, date }) => {
            const dayInjections = injectionsByDate[date] || {}
            const hasFirst = !!dayInjections.first
            const hasSecond = !!dayInjections.second
            const isToday = date === todayDate
            const isCurrentDay = day === currentTreatmentDay
            const status = hasFirst && hasSecond
              ? 'done'
              : (hasFirst || hasSecond)
                ? 'partial'
                : day < firstTrackedDay
                  ? 'previous'
                  : day < currentTreatmentDay
                    ? 'missed'
                    : 'pending'
            const className = [
              'calendar-day',
              status,
              isCurrentDay ? 'current' : '',
              isToday ? 'today' : '',
            ].filter(Boolean).join(' ')

            return (
              <div key={day} className={className} title={`${formatDate(date)}${hasFirst || hasSecond ? ` - ${hasFirst ? '1ª' : ''}${hasFirst && hasSecond ? ' y ' : ''}${hasSecond ? '2ª' : ''}` : ''}`}>
                <div className="calendar-day-strip" />
                <div className="calendar-slots">
                  <div className={`calendar-slot ${hasFirst ? 'done' : ''}`} />
                  <div className={`calendar-slot ${hasSecond ? 'done' : ''}`} />
                </div>
                <strong>Día {day}</strong>
                <span>{formatCalendarDate(date)}</span>
                {isToday && <span className="calendar-day-label">Hoy</span>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
