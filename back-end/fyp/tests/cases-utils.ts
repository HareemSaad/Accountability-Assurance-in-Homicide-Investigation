import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  AddOfficer,
  CaseStatusUpdated,
  EIP712DomainChanged,
  NewCase,
  NewEvidenceInCase,
  NewParticipantInCase,
  RemoveOfficer
} from "../generated/Cases/Cases"

export function createAddOfficerEvent(
  caseId: BigInt,
  initiator: Address,
  officer: Address,
  caseSpecificOfficerId: BigInt
): AddOfficer {
  let addOfficerEvent = changetype<AddOfficer>(newMockEvent())

  addOfficerEvent.parameters = new Array()

  addOfficerEvent.parameters.push(
    new ethereum.EventParam("caseId", ethereum.Value.fromUnsignedBigInt(caseId))
  )
  addOfficerEvent.parameters.push(
    new ethereum.EventParam("initiator", ethereum.Value.fromAddress(initiator))
  )
  addOfficerEvent.parameters.push(
    new ethereum.EventParam("officer", ethereum.Value.fromAddress(officer))
  )
  addOfficerEvent.parameters.push(
    new ethereum.EventParam(
      "caseSpecificOfficerId",
      ethereum.Value.fromUnsignedBigInt(caseSpecificOfficerId)
    )
  )

  return addOfficerEvent
}

export function createCaseStatusUpdatedEvent(
  caseId: BigInt,
  initiator: Address,
  oldStatus: i32,
  newStatus: i32
): CaseStatusUpdated {
  let caseStatusUpdatedEvent = changetype<CaseStatusUpdated>(newMockEvent())

  caseStatusUpdatedEvent.parameters = new Array()

  caseStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam("caseId", ethereum.Value.fromUnsignedBigInt(caseId))
  )
  caseStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam("initiator", ethereum.Value.fromAddress(initiator))
  )
  caseStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "oldStatus",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(oldStatus))
    )
  )
  caseStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newStatus",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(newStatus))
    )
  )

  return caseStatusUpdatedEvent
}

export function createEIP712DomainChangedEvent(): EIP712DomainChanged {
  let eip712DomainChangedEvent = changetype<EIP712DomainChanged>(newMockEvent())

  eip712DomainChangedEvent.parameters = new Array()

  return eip712DomainChangedEvent
}

export function createNewCaseEvent(
  caseId: BigInt,
  initiator: Address
): NewCase {
  let newCaseEvent = changetype<NewCase>(newMockEvent())

  newCaseEvent.parameters = new Array()

  newCaseEvent.parameters.push(
    new ethereum.EventParam("caseId", ethereum.Value.fromUnsignedBigInt(caseId))
  )
  newCaseEvent.parameters.push(
    new ethereum.EventParam("initiator", ethereum.Value.fromAddress(initiator))
  )

  return newCaseEvent
}

export function createNewEvidenceInCaseEvent(
  caseId: BigInt,
  initiator: Address,
  evidenceId: BigInt,
  category: i32,
  dataHash: Bytes,
  data: Bytes
): NewEvidenceInCase {
  let newEvidenceInCaseEvent = changetype<NewEvidenceInCase>(newMockEvent())

  newEvidenceInCaseEvent.parameters = new Array()

  newEvidenceInCaseEvent.parameters.push(
    new ethereum.EventParam("caseId", ethereum.Value.fromUnsignedBigInt(caseId))
  )
  newEvidenceInCaseEvent.parameters.push(
    new ethereum.EventParam("initiator", ethereum.Value.fromAddress(initiator))
  )
  newEvidenceInCaseEvent.parameters.push(
    new ethereum.EventParam(
      "evidenceId",
      ethereum.Value.fromUnsignedBigInt(evidenceId)
    )
  )
  newEvidenceInCaseEvent.parameters.push(
    new ethereum.EventParam(
      "category",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(category))
    )
  )
  newEvidenceInCaseEvent.parameters.push(
    new ethereum.EventParam("dataHash", ethereum.Value.fromFixedBytes(dataHash))
  )
  newEvidenceInCaseEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromBytes(data))
  )

  return newEvidenceInCaseEvent
}

export function createNewParticipantInCaseEvent(
  caseId: BigInt,
  initiator: Address,
  suspectId: BigInt,
  category: i32,
  dataHash: Bytes,
  data: Bytes
): NewParticipantInCase {
  let newParticipantInCaseEvent = changetype<NewParticipantInCase>(
    newMockEvent()
  )

  newParticipantInCaseEvent.parameters = new Array()

  newParticipantInCaseEvent.parameters.push(
    new ethereum.EventParam("caseId", ethereum.Value.fromUnsignedBigInt(caseId))
  )
  newParticipantInCaseEvent.parameters.push(
    new ethereum.EventParam("initiator", ethereum.Value.fromAddress(initiator))
  )
  newParticipantInCaseEvent.parameters.push(
    new ethereum.EventParam(
      "suspectId",
      ethereum.Value.fromUnsignedBigInt(suspectId)
    )
  )
  newParticipantInCaseEvent.parameters.push(
    new ethereum.EventParam(
      "category",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(category))
    )
  )
  newParticipantInCaseEvent.parameters.push(
    new ethereum.EventParam("dataHash", ethereum.Value.fromFixedBytes(dataHash))
  )
  newParticipantInCaseEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromBytes(data))
  )

  return newParticipantInCaseEvent
}

export function createRemoveOfficerEvent(
  caseId: BigInt,
  initiator: Address,
  officer: Address,
  caseSpecificOfficerId: BigInt
): RemoveOfficer {
  let removeOfficerEvent = changetype<RemoveOfficer>(newMockEvent())

  removeOfficerEvent.parameters = new Array()

  removeOfficerEvent.parameters.push(
    new ethereum.EventParam("caseId", ethereum.Value.fromUnsignedBigInt(caseId))
  )
  removeOfficerEvent.parameters.push(
    new ethereum.EventParam("initiator", ethereum.Value.fromAddress(initiator))
  )
  removeOfficerEvent.parameters.push(
    new ethereum.EventParam("officer", ethereum.Value.fromAddress(officer))
  )
  removeOfficerEvent.parameters.push(
    new ethereum.EventParam(
      "caseSpecificOfficerId",
      ethereum.Value.fromUnsignedBigInt(caseSpecificOfficerId)
    )
  )

  return removeOfficerEvent
}
