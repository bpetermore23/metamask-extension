import { useSelector } from 'react-redux'
import { getDomainMetadata } from '../selectors'

export function useOriginMetadata(origin) {
  const domainMetaData = useSelector(getDomainMetadata)
  const url = new URL(origin)

  if (domainMetaData?.[origin]) {
    return {
      ...domainMetaData[origin],
      origin,
    }
  }
  return {
    host: url.host,
    name: url.hostname,
    origin,
  }
}
