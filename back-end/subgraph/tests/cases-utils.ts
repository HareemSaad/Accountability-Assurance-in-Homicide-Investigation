import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  AddOfficerInCase,
  CaseUpdated,
  EIP712DomainChanged,
  EvidenceApproved,
  NewEvidenceInCase,
  NewParticipantInCase,
  ParticipantApproved,
  RemoveOfficerInCase,
  Trustee
} from "../generated/Cases/Cases"

export function createAddOfficerInCaseEvent(
  caseId: BigInt,
  initiator: Address,
  officer: Address
): AddOfficerInCase {
  let addOfficerInCaseEvent = changetype<AddOfficerInCase>(newMockEvent())

  addOfficerInCaseEvent.parameters = new Array()

  addOfficerInCaseEvent.parameters.push(
    new ethereum.EventParam("caseId", ethereum.Value.fromUnsignedBigInt(caseId))
  )
  addOfficerInCaseEvent.parameters.push(
    new ethereum.EventParam("initiator", ethereum.Value.fromAddress(initiator))
  )
  addOfficerInCaseEvent.parameters.push(
    new ethereum.EventParam("officer", ethereum.Value.fromAddress(officer))
  )

  return addOfficerInCaseEvent
}

export function createCaseUpdatedEvent(
  caseId: BigInt,
  initiator: Address,
  branch: Bytes,
  status: i32
): CaseUpdated {
  let caseUpdatedEvent = changetype<CaseUpdated>(newMockEvent())

  caseUpdatedEvent.parameters = new Array()

  caseUpdatedEvent.parameters.push(
    new ethereum.EventParam("caseId", ethereum.Value.fromUnsignedBigInt(caseId))
  )
  caseUpdatedEvent.parameters.push(
    new ethereum.EventParam("initiator", ethereum.Value.fromAddress(initiator))
  )
  caseUpdatedEvent.parameters.push(
    new ethereum.EventParam("branch", ethereum.Value.fromFixedBytes(branch))
  )
  caseUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )

  return caseUpdatedEvent
}

export function createEIP712DomainChangedEvent(): EIP712DomainChanged {
  let eip712DomainChangedEvent = changetype<EIP712DomainChanged>(newMockEvent())

  eip712DomainChangedEvent.parameters = new Array()

  return eip712DomainChangedEvent
}

export function createEvidenceApprovedEvent(
  evidenceId: BigInt
): EvidenceApproved {
  let evidenceApprovedEvent = changetype<EvidenceApproved>(newMockEvent())

  evidenceApprovedEvent.parameters = new Array()

  evidenceApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "evidenceId",
      ethereum.Value.fromUnsignedBigInt(evidenceId)
    )
  )

  return evidenceApprovedEvent
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

export function createParticipantApprovedEvent(
  participantId: BigInt
): ParticipantApproved {
  let participantApprovedEvent = changetype<ParticipantApproved>(newMockEvent())

  participantApprovedEvent.parameters = new Array()

  participantApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "participantId",
      ethereum.Value.fromUnsignedBigInt(participantId)
    )
  )

  return participantApprovedEvent
}

export function createRemoveOfficerInCaseEvent(
  caseId: BigInt,
  initiator: Address,
  officer: Address
): RemoveOfficerInCase {
  let removeOfficerInCaseEvent = changetype<RemoveOfficerInCase>(newMockEvent())

  removeOfficerInCaseEvent.parameters = new Array()

  removeOfficerInCaseEvent.parameters.push(
    new ethereum.EventParam("caseId", ethereum.Value.fromUnsignedBigInt(caseId))
  )
  removeOfficerInCaseEvent.parameters.push(
    new ethereum.EventParam("initiator", ethereum.Value.fromAddress(initiator))
  )
  removeOfficerInCaseEvent.parameters.push(
    new ethereum.EventParam("officer", ethereum.Value.fromAddress(officer))
  )

  return removeOfficerInCaseEvent
}

export function createTrusteeEvent(
  caseId: BigInt,
  branchId: Bytes,
  initiator: Address,
  trustree: Address,
  approved: boolean
): Trustee {
  let trusteeEvent = changetype<Trustee>(newMockEvent())

  trusteeEvent.parameters = new Array()

  trusteeEvent.parameters.push(
    new ethereum.EventParam("caseId", ethereum.Value.fromUnsignedBigInt(caseId))
  )
  trusteeEvent.parameters.push(
    new ethereum.EventParam("branchId", ethereum.Value.fromFixedBytes(branchId))
  )
  trusteeEvent.parameters.push(
    new ethereum.EventParam("initiator", ethereum.Value.fromAddress(initiator))
  )
  trusteeEvent.parameters.push(
    new ethereum.EventParam("trustree", ethereum.Value.fromAddress(trustree))
  )
  trusteeEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return trusteeEvent
}
