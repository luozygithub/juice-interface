import { t, Trans } from '@lingui/macro'
import { Modal } from 'antd'
import RichButton from 'components/shared/RichButton'
import { RedeemButtonTooltip } from 'components/v1/V1Project/Rewards/ManageTokensModal'
import { V2ProjectContext } from 'contexts/v2/projectContext'
import { useContext, useState } from 'react'
import { tokenSymbolText } from 'utils/tokenSymbolText'

import V2RedeemModal from './V2RedeemModal'

export default function V2ManageTokensModal({
  visible,
  onCancel,
}: {
  visible: boolean
  onCancel: VoidFunction
}) {
  const { tokenSymbol } = useContext(V2ProjectContext)
  const tokensLabel = tokenSymbolText({
    tokenSymbol: tokenSymbol,
    capitalize: false,
    plural: true,
  })

  const [redeemModalVisible, setRedeemModalVisible] = useState<boolean>(false)

  const redeemDisabled = false // TODO: true when overflow == 0

  return (
    <>
      <Modal
        title={t`Manage ${tokenSymbolText({
          tokenSymbol: tokenSymbol,
          capitalize: false,
          plural: true,
          includeTokenWord: true,
        })}`}
        visible={visible}
        onCancel={onCancel}
        okButtonProps={{ hidden: true }}
        centered
      >
        <RedeemButtonTooltip buttonDisabled={redeemDisabled}>
          <RichButton
            heading={<Trans>Redeem {tokensLabel} for ETH</Trans>}
            description={
              <Trans>
                Redeem your {tokensLabel} for a portion of the project's
                overflow. Any {tokensLabel} you redeem will be burned.
              </Trans>
            }
            onClick={() => setRedeemModalVisible(true)}
            disabled={redeemDisabled}
          />
        </RedeemButtonTooltip>
      </Modal>
      <V2RedeemModal
        visible={redeemModalVisible}
        onOk={() => {
          setRedeemModalVisible(false)
        }}
        onCancel={() => {
          setRedeemModalVisible(false)
        }}
      />
    </>
  )
}