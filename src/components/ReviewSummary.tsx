import type { AssetState } from '../domain/assets'
import { Card, Col, Row } from 'react-bootstrap'
import { BsCheckCircleFill, BsClock, BsCollection, BsXCircle } from 'react-icons/bs'

type ReviewSummaryProps = {
  total: number
  counts: Record<AssetState, number>
  labels: {
    region: string
    total: string
    pending: string
    keep: string
    reject: string
  }
}

export function ReviewSummary({ total, counts, labels }: ReviewSummaryProps) {
  return (
    <Row as="section" className="g-3 mt-1" aria-label={labels.region}>
      <Col xs={6} lg={3} as="article">
        <Card className="shadow-sm border-0 h-100">
          <Card.Body>
            <h2 className="h6 text-secondary mb-1">
              <BsCollection className="me-1" aria-hidden="true" />
              {labels.total}
            </h2>
            <p className="display-6 fw-bold mb-0">{total}</p>
          </Card.Body>
        </Card>
      </Col>
      <Col xs={6} lg={3} as="article">
        <Card className="shadow-sm border-info-subtle h-100">
          <Card.Body>
            <h2 className="h6 text-secondary mb-1">
              <BsClock className="me-1" aria-hidden="true" />
              {labels.pending}
            </h2>
            <p className="display-6 fw-bold mb-0">{counts.DECISION_PENDING}</p>
          </Card.Body>
        </Card>
      </Col>
      <Col xs={6} lg={3} as="article">
        <Card className="shadow-sm border-success-subtle h-100">
          <Card.Body>
            <h2 className="h6 text-secondary mb-1">
              <BsCheckCircleFill className="me-1" aria-hidden="true" />
              {labels.keep}
            </h2>
            <p className="display-6 fw-bold mb-0">{counts.DECIDED_KEEP}</p>
          </Card.Body>
        </Card>
      </Col>
      <Col xs={6} lg={3} as="article">
        <Card className="shadow-sm border-danger-subtle h-100">
          <Card.Body>
            <h2 className="h6 text-secondary mb-1">
              <BsXCircle className="me-1" aria-hidden="true" />
              {labels.reject}
            </h2>
            <p className="display-6 fw-bold mb-0">{counts.DECIDED_REJECT}</p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}
