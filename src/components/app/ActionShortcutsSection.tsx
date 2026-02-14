import { Button, Col, Row, Stack } from 'react-bootstrap'
import {
  BsArrowRightCircle,
  BsClockHistory,
  BsEye,
  BsEyeSlash,
  BsKeyboard,
  BsPinAngle,
} from 'react-icons/bs'

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  showShortcutsHelp: boolean
  onToggleShortcutsHelp: () => void
  onFocusPending: () => void
  onToggleBatchOnly: () => void
  onOpenNextPending: () => void
}

export function ActionShortcutsSection({
  t,
  showShortcutsHelp,
  onToggleShortcutsHelp,
  onFocusPending,
  onToggleBatchOnly,
  onOpenNextPending,
}: Props) {
  return (
    <section className="border border-2 border-secondary-subtle rounded p-3 mt-3">
      <Stack direction="horizontal" className="justify-content-between align-items-center gap-2">
        <h3 className="h6 mb-0">
          <BsKeyboard className="me-1" aria-hidden="true" />
          {t('actions.shortcutsTitle')}
        </h3>
        <Button type="button" size="sm" variant="outline-secondary" onClick={onToggleShortcutsHelp}>
          {showShortcutsHelp ? (
            <BsEyeSlash className="me-1" aria-hidden="true" />
          ) : (
            <BsEye className="me-1" aria-hidden="true" />
          )}
          {showShortcutsHelp ? t('actions.shortcutsToggleHide') : t('actions.shortcutsToggleShow')}
        </Button>
      </Stack>
      {showShortcutsHelp ? (
        <section data-testid="shortcuts-overlay" className="mt-3 border border-secondary rounded p-3">
          <p className="small text-secondary mb-2">{t('actions.shortcuts')}</p>
          <Row className="g-3">
            <Col xs={12} md={4}>
              <h4 className="h6 mb-2">{t('actions.shortcutsNavTitle')}</h4>
              <ul className="small mb-0">
                <li>{t('actions.shortcutsNavList')}</li>
              </ul>
            </Col>
            <Col xs={12} md={4}>
              <h4 className="h6 mb-2">{t('actions.shortcutsBatchTitle')}</h4>
              <ul className="small mb-0">
                <li>{t('actions.shortcutsBatchList')}</li>
              </ul>
            </Col>
            <Col xs={12} md={4}>
              <h4 className="h6 mb-2">{t('actions.shortcutsFlowTitle')}</h4>
              <ul className="small mb-0">
                <li>{t('actions.shortcutsFlowList')}</li>
              </ul>
            </Col>
          </Row>
          <Stack direction="horizontal" className="flex-wrap gap-2 mt-3">
            <Button size="sm" variant="outline-primary" onClick={onFocusPending}>
              <BsClockHistory className="me-1" aria-hidden="true" />
              {t('actions.shortcutsActionPending')}
            </Button>
            <Button size="sm" variant="outline-primary" onClick={onToggleBatchOnly}>
              <BsPinAngle className="me-1" aria-hidden="true" />
              {t('actions.shortcutsActionBatch')}
            </Button>
            <Button size="sm" variant="outline-primary" onClick={onOpenNextPending}>
              <BsArrowRightCircle className="me-1" aria-hidden="true" />
              {t('actions.shortcutsActionNext')}
            </Button>
          </Stack>
        </section>
      ) : null}
    </section>
  )
}
