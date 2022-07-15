import { Trans } from '@lingui/macro'
import { Button } from 'antd'

import { useHistory } from 'react-router-dom'

import { layouts } from 'constants/styles/layouts'
import { padding } from 'constants/styles/padding'

export default function NewDeployNotAvailable({
  handleOrId: name,
}: {
  handleOrId: string | number | undefined
}) {
  const history = useHistory()

  return (
    <div
      style={{
        padding: padding.app,
        height: '100%',
        ...layouts.centered,
        textAlign: 'center',
      }}
    >
      <h2>
        <Trans>
          Project {name} will be available soon! Try refreshing the page
          shortly.
        </Trans>
        <br />
        <br />
        <Button type="primary" onClick={() => history.go(0)}>
          <Trans>Refresh</Trans>
        </Button>
      </h2>
    </div>
  )
}
