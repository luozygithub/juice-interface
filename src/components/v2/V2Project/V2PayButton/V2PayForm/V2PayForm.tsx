import { SmileOutlined } from '@ant-design/icons'
import * as constants from '@ethersproject/constants'
import { t, Trans } from '@lingui/macro'
import { Checkbox, Form, Input, Modal, Space, Switch, Tooltip } from 'antd'
import { FormInstance, FormProps, useWatch } from 'antd/lib/form/Form'
import { EthAddressInput } from 'components/inputs/EthAddressInput'
import { FormImageUploader } from 'components/inputs/FormImageUploader'
import { AttachStickerModal } from 'components/modals/AttachStickerModal'
import { ThemeContext } from 'contexts/themeContext'
import { V2ProjectContext } from 'contexts/v2/projectContext'
import { isAddress } from 'ethers/lib/utils'
import { useContext, useState } from 'react'
import ProjectRiskNotice from 'components/ProjectRiskNotice'
import { MinimalCollapse } from 'components/MinimalCollapse'
import Callout from 'components/Callout'
import {
  getUnsafeV2FundingCycleProperties,
  V2FundingCycleRiskCount,
} from 'utils/v2/fundingCycle'

import { ProjectPreferences } from 'constants/v2/projectPreferences'
import { StickerSelection } from './StickerSelection'

export interface V2PayFormType {
  memo?: string
  beneficiary?: string
  stickerUrls?: string[]
  uploadedImage?: string
  preferClaimed?: boolean
}

export const V2PayForm = ({
  form,
  ...props
}: { form: FormInstance<V2PayFormType> } & FormProps) => {
  const {
    theme: { colors },
  } = useContext(ThemeContext)
  const { tokenAddress, fundingCycle, projectMetadata } =
    useContext(V2ProjectContext)

  const [customBeneficiaryEnabled, setCustomBeneficiaryEnabled] =
    useState<boolean>(false)
  const [attachStickerModalVisible, setAttachStickerModalVisible] =
    useState<boolean>(false)
  const [riskModalVisible, setRiskModalVisible] = useState<boolean>()

  const stickerUrls = useWatch('stickerUrls', form)

  const hasIssuedTokens = tokenAddress !== constants.AddressZero

  const canAddMoreStickers =
    (stickerUrls ?? []).length < ProjectPreferences.STICKER_MAX

  const riskCount = fundingCycle
    ? V2FundingCycleRiskCount(fundingCycle)
    : undefined

  return (
    <>
      <Form form={form} layout="vertical" {...props}>
        <Space direction="vertical" size="large">
          <MinimalCollapse
            header={
              <h3 style={{ margin: 0 }}>
                <Trans>Customize payment</Trans>
              </h3>
            }
            style={{ marginBottom: '1rem' }}
          >
            <Form.Item
              label={t`Memo (optional)`}
              className={'antd-no-number-handler'}
              style={{ marginBottom: 0 }}
            >
              <Form.Item
                name="memo"
                extra={t`Add an on-chain memo to this payment.`}
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea
                  placeholder={t`WAGMI!`}
                  maxLength={256}
                  showCount
                  autoSize
                />
              </Form.Item>
              <div
                style={{
                  fontSize: '.8rem',
                  position: 'absolute',
                  right: 7,
                  top: 7,
                }}
              >
                {canAddMoreStickers ? (
                  <Tooltip title={t`Attach a sticker`}>
                    <SmileOutlined
                      style={{ color: colors.text.secondary }}
                      onClick={() => {
                        setAttachStickerModalVisible(true)
                      }}
                    />
                  </Tooltip>
                ) : (
                  <SmileOutlined
                    style={{
                      color: colors.text.disabled,
                      cursor: 'not-allowed',
                    }}
                  />
                )}
              </div>
              <Form.Item name="stickerUrls">
                <StickerSelection />
              </Form.Item>
            </Form.Item>
            <Form.Item name="uploadedImage">
              <FormImageUploader text={t`Add image`} />
            </Form.Item>
            <Form.Item extra={t`Mint tokens to a custom address.`}>
              <Space>
                <Switch
                  checked={customBeneficiaryEnabled}
                  onChange={setCustomBeneficiaryEnabled}
                />
                <span style={{ color: colors.text.primary, fontWeight: 500 }}>
                  <Trans>Custom token beneficiary</Trans>
                </span>
              </Space>
              {customBeneficiaryEnabled && (
                <Form.Item
                  style={{ marginTop: '1rem', marginBottom: 0 }}
                  name="beneficiary"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (!value || !isAddress(value)) {
                          return Promise.reject('Address is required')
                        }
                        if (value === constants.AddressZero) {
                          return Promise.reject('Cannot use zero address')
                        }
                        return Promise.resolve()
                      },
                      validateTrigger: 'onCreate',
                      required: true,
                    },
                  ]}
                >
                  <EthAddressInput />
                </Form.Item>
              )}
            </Form.Item>
            {hasIssuedTokens ? (
              <Form.Item
                extra={
                  <Trans>
                    Mint this project's ERC-20 tokens to your wallet. Leave
                    unchecked to have Juicebox track your token balance, saving
                    gas on this transaction. You can claim your ERC-20 tokens
                    later.
                  </Trans>
                }
              >
                <Checkbox
                  onChange={e =>
                    form.setFieldsValue({ preferClaimed: e.target.checked })
                  }
                >
                  <Trans>Receive ERC-20</Trans>
                </Checkbox>
              </Form.Item>
            ) : null}
          </MinimalCollapse>

          {projectMetadata && (
            <Callout>
              <Trans>
                Paying <strong>{projectMetadata.name}</strong> is not an
                investment — it's a way to support the project.{' '}
                <strong>{projectMetadata.name}</strong> determines any value or
                utility of the tokens you receive.
              </Trans>
            </Callout>
          )}

          {riskCount && fundingCycle ? (
            <Form.Item
              name="riskCheckbox"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(t`You must review and accept the risks.`),
                        ),
                },
              ]}
              style={{
                padding: '1rem',
                border: `1px solid ${colors.stroke.secondary}`,
                marginBottom: 0,
              }}
            >
              <Checkbox>
                <Trans>
                  I accept this project's{' '}
                  <a
                    onClick={e => {
                      setRiskModalVisible(true)
                      e.preventDefault()
                    }}
                  >
                    risks
                  </a>
                  .
                </Trans>
              </Checkbox>
            </Form.Item>
          ) : null}
        </Space>
      </Form>
      <AttachStickerModal
        visible={attachStickerModalVisible}
        onClose={() => setAttachStickerModalVisible(false)}
        onSelect={sticker => {
          const url = new URL(`${window.location.origin}${sticker.filepath}`)
          const urlString = url.toString()
          const existingStickerUrls = (form.getFieldValue('stickerUrls') ??
            []) as string[]
          form.setFieldsValue({
            stickerUrls: existingStickerUrls.concat(urlString),
          })
        }}
      />
      <Modal
        title={<Trans>Potential risks</Trans>}
        visible={riskModalVisible}
        okButtonProps={{ hidden: true }}
        onCancel={() => setRiskModalVisible(false)}
        cancelText={<Trans>Close</Trans>}
      >
        {fundingCycle && (
          <ProjectRiskNotice
            unsafeProperties={getUnsafeV2FundingCycleProperties(fundingCycle)}
          />
        )}
      </Modal>
    </>
  )
}