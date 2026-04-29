import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../app/AppHeader'
import type { Locale } from '../../i18n/resources'

type AuthenticatedView = 'review' | 'library' | 'rejects' | 'activity' | 'settings' | 'account'

type Props = {
  currentView: AuthenticatedView
  contextEyebrow?: string
  contextTitle?: string
  contextDescription?: string
  contextMeta?: string[]
  contextActions?: ReactNode
  children: ReactNode
}

export function AuthenticatedShell({
  currentView,
  contextEyebrow,
  contextTitle,
  contextDescription,
  contextMeta,
  contextActions,
  children,
}: Props) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = (i18n.resolvedLanguage ?? 'fr') as Locale

  return (
    <AppHeader
      locale={locale}
      t={t}
      currentView={currentView}
      contextEyebrow={contextEyebrow}
      contextTitle={contextTitle}
      contextDescription={contextDescription}
      contextMeta={contextMeta}
      contextActions={contextActions}
      onChangeLanguage={(nextLocale) => {
        void i18n.changeLanguage(nextLocale)
      }}
      onOpenReview={() => navigate('/review')}
      onOpenLibrary={() => navigate('/library')}
      onOpenRejects={() => navigate('/rejects')}
      onOpenActivity={() => navigate('/activity')}
      onOpenSettings={() => navigate('/settings')}
      onOpenAccount={() => navigate('/account')}
    >
      {children}
    </AppHeader>
  )
}
