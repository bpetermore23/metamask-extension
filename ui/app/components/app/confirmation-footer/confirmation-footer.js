import React from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import Button from '../../ui/button'
import Callout from '../../ui/callout'
import { SEVERITIES } from '../../../helpers/constants/design-system'

export default function ConfirmationFooter({
  onApprove,
  onCancel,
  approveText,
  cancelText,
  alerts,
  dismissAlert,
}) {
  const className = classnames('confirmation-footer', {
    'confirmation-footer--with-alerts':
      alerts && Object.keys(alerts).length > 0,
  })

  return (
    <div className={className}>
      {alerts &&
        Object.values(alerts)
          .filter((alert) => alert.dismissed === false)
          .map((alert, idx, filtered) => (
            <Callout
              key={alert.id}
              severity={alert.severity}
              dismissAlert={() => dismissAlert(alert.id)}
              isFirst={idx === 0}
              isLast={idx === filtered.length - 1}
              isMultiple={filtered.length > 1}
            >
              {alert.content}
            </Callout>
          ))}
      <div className="confirmation-footer__actions">
        <Button
          rounded
          type="secondary"
          onClick={onCancel}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              onCancel()
            }
          }}
        >
          {cancelText}
        </Button>
        <Button
          rounded
          type="primary"
          onClick={onApprove}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              onApprove()
            }
          }}
        >
          {approveText}
        </Button>
      </div>
    </div>
  )
}

ConfirmationFooter.propTypes = {
  alerts: PropTypes.objectOf(
    PropTypes.shape({
      severity: PropTypes.oneOf(Object.values(SEVERITIES)),
      content: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    }),
  ),
  dismissAlert: PropTypes.func,
  onApprove: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  approveText: PropTypes.string.isRequired,
  cancelText: PropTypes.string.isRequired,
}
