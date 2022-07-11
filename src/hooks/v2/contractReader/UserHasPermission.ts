import { NetworkContext } from 'contexts/networkContext'
import { useContext } from 'react'
import { V2OperatorPermission } from 'models/v2/permissions'
import { V2ProjectContext } from 'contexts/v2/projectContext'

import useProjectOwner from './ProjectOwner'
import { useHasPermissions } from './HasPermissions'

export function useUserHasPermission(
  permission: V2OperatorPermission | V2OperatorPermission[],
) {
  const { userAddress } = useContext(NetworkContext)
  const { projectId, isPreviewMode } = useContext(V2ProjectContext)

  const { data: owner } = useProjectOwner(projectId)

  const hasOperatorPermission = useHasPermissions({
    operator: userAddress,
    account: owner,
    domain: projectId,
    permissions: Array.isArray(permission) ? permission : [permission],
  })

  if (isPreviewMode) return false

  const isOwner =
    userAddress && owner && userAddress.toLowerCase() === owner.toLowerCase()

  return (
    isOwner ||
    hasOperatorPermission.data ||
    process.env.NODE_ENV === 'development'
  )
}