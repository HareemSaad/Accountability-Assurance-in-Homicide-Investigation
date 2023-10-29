import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  OffBoard,
  Onboard,
  RankUpdate,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked
} from "../generated/Officers/Officers"

export function createOffBoardEvent(
  officer: Address,
  employmentStatus: i32,
  when: BigInt,
  from: Address
): OffBoard {
  let offBoardEvent = changetype<OffBoard>(newMockEvent())

  offBoardEvent.parameters = new Array()

  offBoardEvent.parameters.push(
    new ethereum.EventParam("officer", ethereum.Value.fromAddress(officer))
  )
  offBoardEvent.parameters.push(
    new ethereum.EventParam(
      "employmentStatus",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(employmentStatus))
    )
  )
  offBoardEvent.parameters.push(
    new ethereum.EventParam("when", ethereum.Value.fromUnsignedBigInt(when))
  )
  offBoardEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )

  return offBoardEvent
}

export function createOnboardEvent(
  officer: Address,
  newRank: Bytes,
  when: BigInt,
  from: Address
): Onboard {
  let onboardEvent = changetype<Onboard>(newMockEvent())

  onboardEvent.parameters = new Array()

  onboardEvent.parameters.push(
    new ethereum.EventParam("officer", ethereum.Value.fromAddress(officer))
  )
  onboardEvent.parameters.push(
    new ethereum.EventParam("newRank", ethereum.Value.fromFixedBytes(newRank))
  )
  onboardEvent.parameters.push(
    new ethereum.EventParam("when", ethereum.Value.fromUnsignedBigInt(when))
  )
  onboardEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )

  return onboardEvent
}

export function createRankUpdateEvent(
  officer: Address,
  prevRank: Bytes,
  newRank: Bytes,
  when: BigInt,
  from: Address
): RankUpdate {
  let rankUpdateEvent = changetype<RankUpdate>(newMockEvent())

  rankUpdateEvent.parameters = new Array()

  rankUpdateEvent.parameters.push(
    new ethereum.EventParam("officer", ethereum.Value.fromAddress(officer))
  )
  rankUpdateEvent.parameters.push(
    new ethereum.EventParam("prevRank", ethereum.Value.fromFixedBytes(prevRank))
  )
  rankUpdateEvent.parameters.push(
    new ethereum.EventParam("newRank", ethereum.Value.fromFixedBytes(newRank))
  )
  rankUpdateEvent.parameters.push(
    new ethereum.EventParam("when", ethereum.Value.fromUnsignedBigInt(when))
  )
  rankUpdateEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )

  return rankUpdateEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}
