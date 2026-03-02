import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { BackingPage } from '../features/backing/BackingPage'
import { ImprovPage } from '../features/improv/ImprovPage'
import { KnowledgePage } from '../features/knowledge/KnowledgePage'
import { HomePage } from '../features/home/HomePage'
import { BluesHomePage } from '../features/home/BluesHomePage'
import { ChordFretboardPage } from '../features/chords-fretboard/ChordFretboardPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="blues/home" element={<BluesHomePage />} />
        <Route path="backing" element={<BackingPage />} />
        <Route path="chord-fretboard" element={<ChordFretboardPage />} />
        <Route path="fretboard" element={<Navigate to="/chord-fretboard" replace />} />
        <Route path="chords" element={<Navigate to="/chord-fretboard" replace />} />
        <Route path="improv" element={<ImprovPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
      </Route>
    </Routes>
  )
}
