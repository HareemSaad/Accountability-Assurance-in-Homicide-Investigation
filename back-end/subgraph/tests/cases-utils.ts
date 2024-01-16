import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  CaseShifted,
  CaseUpdated,
  EIP712DomainChanged,
  EvidenceApproved,
  NewEvidenceInCase,
  NewParticipantInCase,
  ParticipantApproved,
  RemoveOfficer,
  Trustee,
  UpdateOfficerInCase
} from "../generated/Cases/Cases"

export function createCaseShiftedEvent(
  caseId: BigInt,
  captain: Address,
  branch: Bytes
): CaseShifted {
  let caseShiftedEvent = changetype<CaseShifted>(newMockEvent())

  caseShiftedEvent.parameters = new Array()

  caseShiftedEvent.parameters.push(
    new ethereum.EventParam("caseId", ethereum.Value.fromUnsignedBigInt(caseId))
  )
  caseShiftedEvent.parameters.push(
    new ethereum.EventParam("captain", ethereum.Value.fromAddress(captain))
  )
  caseShiftedEvent.parameters.push(
    new ethereum.EventParam("branch", ethereum.Value.fromFixedBytes(branch))
  )

  return caseShiftedEvent
}

export function createCaseUpdatedEvent(
  caseId: BigInt,
  initiator: Address,
  branch: Bytes,
  oldStatus: i32,
  newStatus: i32
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
      "oldStatus",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(oldStatus))
    )
  )
  caseUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newStatus",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(newStatus))
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

export function createRemoveOfficerEvent(
  caseId: BigInt,
  initiator: Address,
  officer: Address
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

  return removeOfficerEvent
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

export function createUpdateOfficerInCaseEvent(
  caseId: BigInt,
  initiator: Address,
  officer: Address
): UpdateOfficerInCase {
  let updateOfficerInCaseEvent = changetype<UpdateOfficerInCase>(newMockEvent())

  updateOfficerInCaseEvent.parameters = new Array()

  updateOfficerInCaseEvent.parameters.push(
    new ethereum.EventParam("caseId", ethereum.Value.fromUnsignedBigInt(caseId))
  )
  updateOfficerInCaseEvent.parameters.push(
    new ethereum.EventParam("initiator", ethereum.Value.fromAddress(initiator))
  )
  updateOfficerInCaseEvent.parameters.push(
    new ethereum.EventParam("officer", ethereum.Value.fromAddress(officer))
  )

  return updateOfficerInCaseEvent
}
