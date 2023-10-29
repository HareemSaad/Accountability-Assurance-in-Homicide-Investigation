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
  Officers,
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

  // Core business logic
  //  load officer
  let officer = Officers.load(event.params.officer)
  // if officer does not exist create one
  if(!officer) {
    officer = new Officers(event.params.officer)
    officer.rank = event.params.newRank
    officer.employmentStatus = 1
    officer.from = event.params.from
    officer.blockNumber = event.block.number
    officer.blockTimestamp = event.block.timestamp
    officer.transactionHash = event.transaction.hash
  } else {
    officer.rank = event.params.newRank
    officer.employmentStatus = 1
    officer.from = event.params.from
  }

  officer.save()
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

  // Core business logic
  //  load officer
  let officer = Officers.load(event.params.officer)
  // if officer does not exist throe error
  if(!officer) {
    // return new Error("RankUpdate: Officer does not exist");
    return;
  } else { // other wise update rank
    officer.rank = event.params.newRank
  }

  officer.save()
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
