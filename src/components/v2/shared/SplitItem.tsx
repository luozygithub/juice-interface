import { CrownFilled, LockOutlined } from '@ant-design/icons'
import { Trans } from '@lingui/macro'
import { Tooltip } from 'antd'
import { ThemeContext } from 'contexts/themeContext'
import { useContext } from 'react'
import { formatDate } from 'utils/formatDate'

import { Split } from 'models/v2/splits'
import TooltipLabel from 'components/shared/TooltipLabel'
import FormattedAddress from 'components/shared/FormattedAddress'
import { formatWad } from 'utils/formatNumber'
import { BigNumber } from '@ethersproject/bignumber'
import CurrencySymbol from 'components/shared/CurrencySymbol'
import { V2CurrencyOption } from 'models/v2/currencyOption'
import { V2CurrencyName } from 'utils/v2/currency'
import { formatSplitPercent, SPLITS_TOTAL_PERCENT } from 'utils/v2/math'
import useMobile from 'hooks/Mobile'
import { Link } from 'react-router-dom'
import TooltipIcon from 'components/shared/TooltipIcon'

export default function SplitItem({
  split,
  showSplitValue,
  currency,
  totalValue,
  projectOwnerAddress,
  valueSuffix,
  valueFormatProps,
  reservedRate,
}: {
  split: Split
  currency?: BigNumber
  totalValue: BigNumber | undefined
  projectOwnerAddress: string | undefined
  showSplitValue: boolean
  valueSuffix?: string | JSX.Element
  valueFormatProps?: { precision?: number }
  reservedRate?: number
}) {
  const {
    theme: { colors },
  } = useContext(ThemeContext)

  const isProjectOwner = projectOwnerAddress === split.beneficiary
  const isJuiceboxProject = split.projectId
    ? BigNumber.from(split.projectId).gt(0)
    : false

  const LockedText = ({ lockedUntil }: { lockedUntil: number }) => {
    const lockedUntilFormatted = formatDate(lockedUntil * 1000, 'yyyy-MM-DD')

    return (
      <div style={{ fontSize: '.8rem', color: colors.text.secondary }}>
        <LockOutlined /> <Trans>locked until {lockedUntilFormatted}</Trans>
      </div>
    )
  }

  const isMobile = useMobile()

  const itemFontSize = isMobile ? '0.9rem' : 'unset'

  const JuiceboxProjectBeneficiary = () => {
    return (
      <div>
        {/* TODO figure out project "handles" with ENS resolution */}

        <div style={{ fontWeight: 500 }}>
          <Tooltip
            title={<Trans>Juicebox V2 project with ID {split.projectId}</Trans>}
          >
            <Link
              to={`/v2/p/${split.projectId}`}
              target="_blank"
              className="text-primary hover-text-action-primary hover-text-decoration-underline"
            >
              @{split.projectId}
            </Link>
          </Tooltip>
          :
        </div>
        <div
          style={{
            fontSize: '.8rem',
            color: colors.text.secondary,
            marginLeft: 10,
          }}
        >
          <TooltipLabel
            label={<Trans>Tokens:</Trans>}
            tip={
              <Trans>
                This address will receive any tokens minted when the recipient
                project gets paid.
              </Trans>
            }
          />{' '}
          <FormattedAddress address={split.beneficiary} />{' '}
          {isProjectOwner && (
            <Tooltip title={<Trans>Project owner</Trans>}>
              <CrownFilled />
            </Tooltip>
          )}
        </div>
      </div>
    )
  }

  const ETHAddressBeneficiary = () => {
    return (
      <div
        style={{
          fontWeight: 500,
          fontSize: itemFontSize,
          display: 'flex',
          alignItems: 'baseline',
        }}
      >
        {split.beneficiary ? (
          <FormattedAddress address={split.beneficiary} />
        ) : null}
        {!split.beneficiary && isProjectOwner ? (
          <Trans>Project owner (you)</Trans>
        ) : null}
        {isProjectOwner && (
          <span style={{ marginLeft: 5 }}>
            <Tooltip title={<Trans>Project owner</Trans>}>
              <CrownFilled />
            </Tooltip>
          </span>
        )}
        :
      </div>
    )
  }

  const SplitValue = () => {
    const splitValue = totalValue?.mul(split.percent).div(SPLITS_TOTAL_PERCENT)
    const splitValueFormatted = formatWad(splitValue, { ...valueFormatProps })

    return (
      <span style={{ fontSize: itemFontSize }}>
        (
        <CurrencySymbol
          currency={V2CurrencyName(
            currency?.toNumber() as V2CurrencyOption | undefined,
          )}
        />
        {splitValueFormatted}
        {valueSuffix ? <span> {valueSuffix}</span> : null})
      </span>
    )
  }

  const formattedSplitPercent = formatSplitPercent(
    BigNumber.from(split.percent),
  )

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 5,
      }}
    >
      <div style={{ lineHeight: 1.4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          {isJuiceboxProject ? (
            <JuiceboxProjectBeneficiary />
          ) : (
            <ETHAddressBeneficiary />
          )}
        </div>

        {split.lockedUntil ? (
          <LockedText lockedUntil={split.lockedUntil} />
        ) : null}
      </div>
      <div>
        <span>{formattedSplitPercent}%</span>
        {totalValue?.gt(0) && showSplitValue ? (
          <span style={{ marginLeft: '0.2rem' }}>
            {' '}
            <SplitValue />
          </span>
        ) : null}
        {reservedRate ? (
          <TooltipIcon
            iconStyle={{ marginLeft: 7 }}
            tip={
              <Trans>
                {(reservedRate * parseFloat(formattedSplitPercent)) / 100}% of
                all newly minted tokens.
              </Trans>
            }
          />
        ) : null}
      </div>
    </div>
  )
}
