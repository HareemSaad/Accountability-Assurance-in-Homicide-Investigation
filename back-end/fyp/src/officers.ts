import {
  OffBoard as OffBoardEvent,
  Onboard as OnboardEvent,
  RankUpdate as RankUpdateEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent
} from "../generated/Officers/Officers"
import {
  OffBoard,
  Onboard,
  RankUpdate,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked
} from "../generated/schema"

export function handleOffBoard(event: OffBoardEvent): void {
  let entity = new OffBoard(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.officer = event.params.officer
  entity.employmentStatus = event.params.employmentStatus
  entity.when = event.params.when
  entity.from = event.params.from

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOnboard(event: OnboardEvent): void {
  let entity = new Onboard(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.officer = event.params.officer
  entity.newRank = event.params.newRank
  entity.when = event.params.when
  entity.from = event.params.from

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRankUpdate(event: RankUpdateEvent): void {
  let entity = new RankUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.officer = event.params.officer
  entity.prevRank = event.params.prevRank
  entity.newRank = event.params.newRank
  entity.when = event.params.when
  entity.from = event.params.from

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
