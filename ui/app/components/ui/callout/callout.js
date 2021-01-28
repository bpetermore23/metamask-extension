import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import InfoIconInverted from '../icon/info-icon-inverted.component'
import { SEVERITIES } from '../../../helpers/constants/design-system'

export default function Callout({
  severity,
  children,
  dismissAlert,
  isFirst,
  isLast,
  isMultiple,
}) {
  const [removed, setRemoved] = useState(false)
  const calloutClassName = classnames('callout', `callout--${severity}`, {
    'callout--dismissed': removed === true,
    'callout--multiple': isMultiple === true,
    'callout--first': isFirst === true,
    'callout--last': isLast === true,
  })
  // Clicking the close button will set removed state, which will trigger this
  // effect to refire due to changing dependencies. When that happens, after a
  // half of a second we fire the dismissAlert method from the parent. The
  // consuming component is responsible for modifying state and then removing
  // the element from the DOM.
  useEffect(() => {
    if (removed) {
      setTimeout(() => {
        dismissAlert()
      }, 500)
    }
  }, [removed, dismissAlert])
  return (
    <div className={calloutClassName}>
      <InfoIconInverted severity={severity} />
      <div className="callout__content">{children}</div>
      {dismissAlert && (
        <i
          onClick={() => {
            setRemoved(true)
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              setRemoved(true)
            }
          }}
          role="button"
          tabIndex={0}
          className="fas fa-times callout__close-button"
        />
      )}
    </div>
  )
}

Callout.propTypes = {
  severity: PropTypes.oneOf(Object.values(SEVERITIES)).isRequired,
  children: PropTypes.node.isRequired,
  dismissAlert: PropTypes.func,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  isMultiple: PropTypes.bool,
}
