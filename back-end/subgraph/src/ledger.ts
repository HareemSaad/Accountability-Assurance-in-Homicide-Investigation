import {
  BranchUpdate as BranchUpdateEvent,
  EIP712DomainChanged as EIP712DomainChangedEvent,
  Offboard as OffboardEvent,
  OfficerAddressUpdated as OfficerAddressUpdatedEvent,
  OfficerBadgeUpdated as OfficerBadgeUpdatedEvent,
  OfficerNameUpdated as OfficerNameUpdatedEvent,
  OfficerTransferred as OfficerTransferredEvent,
  Onboard as OnboardEvent,
  Promotion as PromotionEvent
} from "../generated/Ledger/Ledger"
import {
  BranchUpdate,
  EIP712DomainChanged,
  Offboard,
  OfficerAddressUpdated,
  OfficerBadgeUpdated,
  OfficerNameUpdated,
  OfficerTransferred,
  Onboard,
  Promotion
} from "../generated/schema"

export function handleBranchUpdate(event: BranchUpdateEvent): void {
  let entity = new BranchUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.Ledger_id = event.params.id
  entity.precinctAddress = event.params.precinctAddress
  entity.jurisdictionArea = event.params.jurisdictionArea
  entity.stateCode = event.params.stateCode
  entity.title = event.params.title

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleEIP712DomainChanged(
  event: EIP712DomainChangedEvent
): void {
  let entity = new EIP712DomainChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOffboard(event: OffboardEvent): void {
  let entity = new Offboard(
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

export function handleOfficerAddressUpdated(
  event: OfficerAddressUpdatedEvent
): void {
  let entity = new OfficerAddressUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldAddr = event.params.oldAddr
  entity.newAddr = event.params.newAddr
  entity.legalNumber = event.params.legalNumber
  entity.when = event.params.when
  entity.from = event.params.from

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOfficerBadgeUpdated(
  event: OfficerBadgeUpdatedEvent
): void {
  let entity = new OfficerBadgeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.officerAddress = event.params.officerAddress
  entity.badge = event.params.badge
  entity.legalNumber = event.params.legalNumber
  entity.when = event.params.when
  entity.from = event.params.from

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOfficerNameUpdated(event: OfficerNameUpdatedEvent): void {
  let entity = new OfficerNameUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.officerAddress = event.params.officerAddress
  entity.name = event.params.name
  entity.legalNumber = event.params.legalNumber
  entity.when = event.params.when
  entity.from = event.params.from

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOfficerTransferred(event: OfficerTransferredEvent): void {
  let entity = new OfficerTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.officer = event.params.officer
  entity.fromBranchId = event.params.fromBranchId
  entity.toBranchId = event.params.toBranchId

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
  entity.name = event.params.name
  entity.legalNumber = event.params.legalNumber
  entity.badge = event.params.badge
  entity.branchId = event.params.branchId
  entity.rank = event.params.rank
  entity.when = event.params.when
  entity.from = event.params.from

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePromotion(event: PromotionEvent): void {
  let entity = new Promotion(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.officer = event.params.officer
  entity.prevRank = event.params.prevRank
  entity.newRank = event.params.newRank

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
