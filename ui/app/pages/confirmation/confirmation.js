import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { isEqual } from 'lodash'
import { getEnvironmentType } from '../../../../app/scripts/lib/util'
import {
  ENVIRONMENT_TYPE_FULLSCREEN,
  ENVIRONMENT_TYPE_POPUP,
  MESSAGE_TYPE,
} from '../../../../shared/constants/app'
import ConfirmationFooter from '../../components/app/confirmation-footer'
import Box from '../../components/ui/box'
import Chip from '../../components/ui/chip'
import MetaMaskTemplateRenderer from '../../components/app/metamask-template-renderer'
import SiteIcon from '../../components/ui/site-icon'
import { DEFAULT_ROUTE } from '../../helpers/constants/routes'
import { stripHttpSchemes } from '../../helpers/utils/util'
import { useI18nContext } from '../../hooks/useI18nContext'
import { useOriginMetadata } from '../../hooks/useOriginMetadata'
import { getUnapprovedAddEthereumChainRequests } from '../../selectors'
import NetworkDisplay from '../../components/app/network-display/network-display'
import { COLORS, SIZES } from '../../helpers/constants/design-system'
import {
  getTemplateState,
  getTemplateValues,
  getTemplateAlerts,
} from './templates'

const fakeGetUnapprovedAddEthereumChainRequests = () => [
  {
    id: 'xlo',
    type: MESSAGE_TYPE.ADD_ETHEREUM_CHAIN,
    origin: 'https://example-site.io/',
    requestData: {
      chainName: 'Example',
      chainId: '0x2329',
      rpcUrl: 'https://mainnet.example-site.io',
      blockExplorerUrl: 'https://blockexplorer.example-site.io/',
      ticker: 'EXMPL',
    },
  },
]

export default function ConfirmationPage() {
  const t = useI18nContext()
  const dispatch = useDispatch()
  const history = useHistory()
  const pendingConfirmations = useSelector(
    /* getUnapprovedAddEthereumChainRequests */ fakeGetUnapprovedAddEthereumChainRequests,
    isEqual,
  )

  const [currentPendingConfirmation, setCurrentPendingConfirmation] = useState(
    0,
  )

  // It is necessary to allow templates to generate state that can only be consumed
  // within the template itself. To allow for this we use a single state object, and
  // pass it the getTemplatedValues function. Generating this state is also handled
  // in the template file.
  const [confirmationState, setConfirmationState] = useState({})

  const [alertState, setAlertState] = useState({})

  useEffect(() => {
    const environmentType = getEnvironmentType()
    // If the number of pending confirmations reduces to zero when the user
    // is in the fullscreen or popup UI, return them to the default route.
    // Otherwise, if the number of pending confirmations reduces to a number
    // that is less than the currently viewed index, reset the index.
    if (
      pendingConfirmations.length === 0 &&
      environmentType ===
        (ENVIRONMENT_TYPE_FULLSCREEN ||
          environmentType === ENVIRONMENT_TYPE_POPUP)
    ) {
      history.push(DEFAULT_ROUTE)
    } else if (pendingConfirmations.length <= currentPendingConfirmation) {
      setCurrentPendingConfirmation(pendingConfirmations.length - 1)
    }
  }, [pendingConfirmations, history, currentPendingConfirmation])

  const pendingConfirmation = pendingConfirmations[currentPendingConfirmation]

  useEffect(() => {
    let signal = true
    getTemplateAlerts(pendingConfirmation).then((alerts) => {
      if (signal && alerts) {
        setAlertState((prevAlertState) => {
          return {
            ...prevAlertState,
            [pendingConfirmation.id]: {
              ...prevAlertState?.[pendingConfirmation.id],
              ...alerts.reduce((acc, alert) => {
                if (!prevAlertState?.[pendingConfirmation.id]?.[alert.id]) {
                  acc[alert.id] = {
                    ...alert,
                    dismissed: false,
                  }
                }
                return acc
              }, {}),
            },
          }
        })
      }
    })
    return () => {
      signal = false
    }
  }, [pendingConfirmation])

  const dismissAlert = useCallback(
    (alertId) => {
      setAlertState((prevAlertState) => ({
        ...prevAlertState,
        [pendingConfirmation.id]: {
          ...prevAlertState?.[pendingConfirmation.id],
          [alertId]: {
            ...prevAlertState?.[pendingConfirmation.id]?.[alertId],
            dismissed: true,
          },
        },
      }))
    },
    [pendingConfirmation],
  )

  // This effect will call the template's state generation function, which must
  // be async. If this component is unmounted it'll prevent the template state
  // from being set.
  useEffect(() => {
    let signal = true
    getTemplateState(pendingConfirmation).then((newState) => {
      if (signal) {
        setConfirmationState(newState)
      }
    })
    return () => {
      signal = false
    }
  }, [pendingConfirmation])

  // Generating templatedValues is potentially expensive, and if done on every render
  // will result in a new object. Avoiding calling this generation unnecessarily will
  // improve performance and prevent unnecessary draws.
  const templatedValues = useMemo(() => {
    return getTemplateValues(
      pendingConfirmation,
      t,
      dispatch,
      confirmationState,
      setConfirmationState,
    )
  }, [pendingConfirmation, t, dispatch, confirmationState])

  const originMetadata = useOriginMetadata(pendingConfirmation.origin)

  return (
    <div className="confirmation-page">
      {pendingConfirmations.length > 1 && (
        <div className="confirmation-page__navigation">
          <p>
            {currentPendingConfirmation + 1} of {pendingConfirmations.length}{' '}
            pending
          </p>
          {currentPendingConfirmation > 0 && (
            <button
              className="confirmation-page__navigation-button"
              onClick={() =>
                setCurrentPendingConfirmation(currentPendingConfirmation - 1)
              }
            >
              <i className="fas fa-chevron-left"></i>
            </button>
          )}
          <button
            className="confirmation-page__navigation-button"
            disabled={
              currentPendingConfirmation + 1 === pendingConfirmations.length
            }
            onClick={() =>
              setCurrentPendingConfirmation(currentPendingConfirmation + 1)
            }
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
      <div className="confirmation-page__content">
        <Box justifyContent="center">
          <NetworkDisplay
            colored={false}
            indicatorSize={SIZES.XS}
            labelProps={{ color: COLORS.BLACK }}
          />
        </Box>
        <Box justifyContent="center" padding={[1, 4, 4]}>
          <Chip
            label={stripHttpSchemes(originMetadata.origin)}
            labelColor="gray"
            leftIcon={
              <SiteIcon
                icon={originMetadata.icon}
                iconName={originMetadata.name}
                size={32}
              />
            }
          />
        </Box>
        <MetaMaskTemplateRenderer sections={templatedValues.content} />
      </div>
      <ConfirmationFooter
        dismissAlert={dismissAlert}
        alerts={alertState[pendingConfirmation.id]}
        onApprove={templatedValues.onApprove}
        onCancel={templatedValues.onCancel}
        approveText={templatedValues.approvalText}
        cancelText={templatedValues.cancelText}
      />
    </div>
  )
}
