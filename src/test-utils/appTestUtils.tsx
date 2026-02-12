import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

export const setupApp = () => {
  const user = userEvent.setup()
  const rendered = render(<App />)
  return { user, ...rendered }
}

export const getAssetsPanel = () => screen.getByLabelText('Liste des assets')

export const getDetailPanel = () => screen.getByLabelText("Détail de l'asset")
