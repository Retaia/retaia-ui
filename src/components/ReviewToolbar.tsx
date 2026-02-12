import type { AssetDateFilter, AssetFilter, AssetMediaTypeFilter } from '../domain/assets'
import { Card, Col, Form, Row } from 'react-bootstrap'
import { BsCalendar3, BsFunnel, BsSearch, BsSliders2 } from 'react-icons/bs'

type ReviewToolbarProps = {
  filter: AssetFilter
  mediaTypeFilter: AssetMediaTypeFilter
  dateFilter: AssetDateFilter
  search: string
  labels: {
    filter: string
    mediaType: string
    date: string
    search: string
    searchPlaceholder: string
    all: string
    date7d: string
    date30d: string
  }
  onFilterChange: (filter: AssetFilter) => void
  onMediaTypeFilterChange: (filter: AssetMediaTypeFilter) => void
  onDateFilterChange: (filter: AssetDateFilter) => void
  onSearchChange: (search: string) => void
}

export function ReviewToolbar({
  filter,
  mediaTypeFilter,
  dateFilter,
  search,
  labels,
  onFilterChange,
  onMediaTypeFilterChange,
  onDateFilterChange,
  onSearchChange,
}: ReviewToolbarProps) {
  return (
    <Card as="section" className="shadow-sm border-0 mt-3">
      <Card.Body>
        <Row className="g-3">
          <Col xs={12} md={4}>
            <Form.Label className="fw-semibold" htmlFor="state-filter">
              <BsFunnel className="me-1" aria-hidden="true" />
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

          <Col xs={12} md={4}>
            <Form.Label className="fw-semibold" htmlFor="media-type-filter">
              <BsSliders2 className="me-1" aria-hidden="true" />
              {labels.mediaType}
            </Form.Label>
            <Form.Select
              id="media-type-filter"
              value={mediaTypeFilter}
              onChange={(event) => onMediaTypeFilterChange(event.target.value as AssetMediaTypeFilter)}
            >
              <option value="ALL">{labels.all}</option>
              <option value="VIDEO">VIDEO</option>
              <option value="AUDIO">AUDIO</option>
              <option value="IMAGE">IMAGE</option>
              <option value="OTHER">OTHER</option>
            </Form.Select>
          </Col>

          <Col xs={12} md={4}>
            <Form.Label className="fw-semibold" htmlFor="captured-date-filter">
              <BsCalendar3 className="me-1" aria-hidden="true" />
              {labels.date}
            </Form.Label>
            <Form.Select
              id="captured-date-filter"
              value={dateFilter}
              onChange={(event) => onDateFilterChange(event.target.value as AssetDateFilter)}
            >
              <option value="ALL">{labels.all}</option>
              <option value="LAST_7_DAYS">{labels.date7d}</option>
              <option value="LAST_30_DAYS">{labels.date30d}</option>
            </Form.Select>
          </Col>

          <Col xs={12}>
            <Form.Label className="fw-semibold" htmlFor="asset-search">
              <BsSearch className="me-1" aria-hidden="true" />
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
