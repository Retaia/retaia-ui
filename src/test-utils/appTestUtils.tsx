import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

export const setupApp = () => {
  window.history.replaceState({}, '', '/')
  const user = userEvent.setup()
  const rendered = render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  )
  return { user, ...rendered }
}

export const getAssetsPanel = () => screen.getByLabelText('Liste des assets')

export const getDetailPanel = () => screen.getByLabelText("Détail de l'asset")
