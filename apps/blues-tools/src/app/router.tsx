import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { BackingPage } from '../features/backing/BackingPage'
import { FretboardPage } from '../features/fretboard/FretboardPage'
import { ImprovPage } from '../features/improv/ImprovPage'
import { ChordFinderPage } from '../features/chords/ChordFinderPage'
import { KnowledgePage } from '../features/knowledge/KnowledgePage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/backing" replace />} />
        <Route path="backing" element={<BackingPage />} />
        <Route path="fretboard" element={<FretboardPage />} />
        <Route path="improv" element={<ImprovPage />} />
        <Route path="chords" element={<ChordFinderPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
      </Route>
    </Routes>
  )
}
