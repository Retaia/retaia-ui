import { UiResetPage } from './UiResetPage'

type ReviewPageProps = {
  view?: 'workspace' | 'activity' | 'batch'
}

function ReviewPage({ view = 'workspace' }: ReviewPageProps) {
  const route = view === 'activity' ? '/activity' : '/review'
  const title = view === 'activity' ? 'Activity UI removed' : 'Review UI removed'
  return <UiResetPage title={title} route={route} />
}

export default ReviewPage
