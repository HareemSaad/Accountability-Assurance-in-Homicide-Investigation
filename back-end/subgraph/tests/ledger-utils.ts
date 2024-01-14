import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
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
} from "../generated/Ledger/Ledger"

export function createBranchUpdateEvent(
  id: Bytes,
  precinctAddress: string,
  jurisdictionArea: BigInt,
  stateCode: BigInt
): BranchUpdate {
  let branchUpdateEvent = changetype<BranchUpdate>(newMockEvent())

  branchUpdateEvent.parameters = new Array()

  branchUpdateEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )
  branchUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "precinctAddress",
      ethereum.Value.fromString(precinctAddress)
    )
  )
  branchUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "jurisdictionArea",
      ethereum.Value.fromUnsignedBigInt(jurisdictionArea)
    )
  )
  branchUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "stateCode",
      ethereum.Value.fromUnsignedBigInt(stateCode)
    )
  )

  return branchUpdateEvent
}

export function createEIP712DomainChangedEvent(): EIP712DomainChanged {
  let eip712DomainChangedEvent = changetype<EIP712DomainChanged>(newMockEvent())

  eip712DomainChangedEvent.parameters = new Array()

  return eip712DomainChangedEvent
}

export function createOffboardEvent(
  officer: Address,
  employmentStatus: i32,
  when: BigInt,
  from: Address
): Offboard {
  let offboardEvent = changetype<Offboard>(newMockEvent())

  offboardEvent.parameters = new Array()

  offboardEvent.parameters.push(
    new ethereum.EventParam("officer", ethereum.Value.fromAddress(officer))
  )
  offboardEvent.parameters.push(
    new ethereum.EventParam(
      "employmentStatus",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(employmentStatus))
    )
  )
  offboardEvent.parameters.push(
    new ethereum.EventParam("when", ethereum.Value.fromUnsignedBigInt(when))
  )
  offboardEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )

  return offboardEvent
}

export function createOfficerAddressUpdatedEvent(
  oldAddr: Address,
  newAddr: Address,
  legalNumber: Bytes,
  when: BigInt,
  from: Address
): OfficerAddressUpdated {
  let officerAddressUpdatedEvent = changetype<OfficerAddressUpdated>(
    newMockEvent()
  )

  officerAddressUpdatedEvent.parameters = new Array()

  officerAddressUpdatedEvent.parameters.push(
    new ethereum.EventParam("oldAddr", ethereum.Value.fromAddress(oldAddr))
  )
  officerAddressUpdatedEvent.parameters.push(
    new ethereum.EventParam("newAddr", ethereum.Value.fromAddress(newAddr))
  )
  officerAddressUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "legalNumber",
      ethereum.Value.fromFixedBytes(legalNumber)
    )
  )
  officerAddressUpdatedEvent.parameters.push(
    new ethereum.EventParam("when", ethereum.Value.fromUnsignedBigInt(when))
  )
  officerAddressUpdatedEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )

  return officerAddressUpdatedEvent
}

export function createOfficerBadgeUpdatedEvent(
  officerAddress: Address,
  badge: Bytes,
  legalNumber: Bytes,
  when: BigInt,
  from: Address
): OfficerBadgeUpdated {
  let officerBadgeUpdatedEvent = changetype<OfficerBadgeUpdated>(newMockEvent())

  officerBadgeUpdatedEvent.parameters = new Array()

  officerBadgeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "officerAddress",
      ethereum.Value.fromAddress(officerAddress)
    )
  )
  officerBadgeUpdatedEvent.parameters.push(
    new ethereum.EventParam("badge", ethereum.Value.fromFixedBytes(badge))
  )
  officerBadgeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "legalNumber",
      ethereum.Value.fromFixedBytes(legalNumber)
    )
  )
  officerBadgeUpdatedEvent.parameters.push(
    new ethereum.EventParam("when", ethereum.Value.fromUnsignedBigInt(when))
  )
  officerBadgeUpdatedEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )

  return officerBadgeUpdatedEvent
}

export function createOfficerNameUpdatedEvent(
  officerAddress: Address,
  name: string,
  legalNumber: Bytes,
  when: BigInt,
  from: Address
): OfficerNameUpdated {
  let officerNameUpdatedEvent = changetype<OfficerNameUpdated>(newMockEvent())

  officerNameUpdatedEvent.parameters = new Array()

  officerNameUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "officerAddress",
      ethereum.Value.fromAddress(officerAddress)
    )
  )
  officerNameUpdatedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  officerNameUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "legalNumber",
      ethereum.Value.fromFixedBytes(legalNumber)
    )
  )
  officerNameUpdatedEvent.parameters.push(
    new ethereum.EventParam("when", ethereum.Value.fromUnsignedBigInt(when))
  )
  officerNameUpdatedEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )

  return officerNameUpdatedEvent
}

export function createOfficerTransferredEvent(
  officer: Address,
  fromBranchId: Bytes,
  toBranchId: Bytes
): OfficerTransferred {
  let officerTransferredEvent = changetype<OfficerTransferred>(newMockEvent())

  officerTransferredEvent.parameters = new Array()

  officerTransferredEvent.parameters.push(
    new ethereum.EventParam("officer", ethereum.Value.fromAddress(officer))
  )
  officerTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "fromBranchId",
      ethereum.Value.fromFixedBytes(fromBranchId)
    )
  )
  officerTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "toBranchId",
      ethereum.Value.fromFixedBytes(toBranchId)
    )
  )

  return officerTransferredEvent
}

export function createOnboardEvent(
  officer: Address,
  name: string,
  legalNumber: Bytes,
  badge: Bytes,
  branchId: Bytes,
  rank: i32,
  when: BigInt,
  from: Address
): Onboard {
  let onboardEvent = changetype<Onboard>(newMockEvent())

  onboardEvent.parameters = new Array()

  onboardEvent.parameters.push(
    new ethereum.EventParam("officer", ethereum.Value.fromAddress(officer))
  )
  onboardEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  onboardEvent.parameters.push(
    new ethereum.EventParam(
      "legalNumber",
      ethereum.Value.fromFixedBytes(legalNumber)
    )
  )
  onboardEvent.parameters.push(
    new ethereum.EventParam("badge", ethereum.Value.fromFixedBytes(badge))
  )
  onboardEvent.parameters.push(
    new ethereum.EventParam("branchId", ethereum.Value.fromFixedBytes(branchId))
  )
  onboardEvent.parameters.push(
    new ethereum.EventParam(
      "rank",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(rank))
    )
  )
  onboardEvent.parameters.push(
    new ethereum.EventParam("when", ethereum.Value.fromUnsignedBigInt(when))
  )
  onboardEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )

  return onboardEvent
}

export function createPromotionEvent(
  officer: Address,
  prevRank: i32,
  newRank: i32
): Promotion {
  let promotionEvent = changetype<Promotion>(newMockEvent())

  promotionEvent.parameters = new Array()

  promotionEvent.parameters.push(
    new ethereum.EventParam("officer", ethereum.Value.fromAddress(officer))
  )
  promotionEvent.parameters.push(
    new ethereum.EventParam(
      "prevRank",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(prevRank))
    )
  )
  promotionEvent.parameters.push(
    new ethereum.EventParam(
      "newRank",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(newRank))
    )
  )

  return promotionEvent
}
