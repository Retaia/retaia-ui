import type { AssetFilter } from '../domain/assets'
import { Card, Col, Form, Row } from 'react-bootstrap'

type ReviewToolbarProps = {
  filter: AssetFilter
  search: string
  labels: {
    filter: string
    search: string
    searchPlaceholder: string
    all: string
  }
  onFilterChange: (filter: AssetFilter) => void
  onSearchChange: (search: string) => void
}

export function ReviewToolbar({
  filter,
  search,
  labels,
  onFilterChange,
  onSearchChange,
}: ReviewToolbarProps) {
  return (
    <Card as="section" className="shadow-sm border-0 mt-3">
      <Card.Body>
        <Row className="g-3">
          <Col xs={12} md={6}>
            <Form.Label className="fw-semibold" htmlFor="state-filter">
              {labels.filter}
            </Form.Label>
            <Form.Select
              id="state-filter"
              value={filter}
              onChange={(event) => onFilterChange(event.target.value as AssetFilter)}
            >
              <option value="ALL">{labels.all}</option>
              <option value="DECISION_PENDING">DECISION_PENDING</option>
              <option value="DECIDED_KEEP">DECIDED_KEEP</option>
              <option value="DECIDED_REJECT">DECIDED_REJECT</option>
            </Form.Select>
          </Col>

          <Col xs={12} md={6}>
            <Form.Label className="fw-semibold" htmlFor="asset-search">
              {labels.search}
            </Form.Label>
            <Form.Control
              id="asset-search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={labels.searchPlaceholder}
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
