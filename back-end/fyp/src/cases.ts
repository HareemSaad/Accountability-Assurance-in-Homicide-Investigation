import { Error } from "error"
import {
  CaseUpdated as CaseUpdatedEvent,
  EIP712DomainChanged as EIP712DomainChangedEvent,
  NewEvidenceInCase as NewEvidenceInCaseEvent,
  NewParticipantInCase as NewParticipantInCaseEvent,
  RemoveOfficer as RemoveOfficerEvent,
  UpdateOfficerInCase as UpdateOfficerInCaseEvent
} from "../generated/Cases/Cases"
import {
  CaseUpdated,
  EIP712DomainChanged,
  NewEvidenceInCase,
  NewParticipantInCase,
  RemoveOfficer,
  UpdateOfficerInCase,
  Cases,
  Evidences,
  Participants
} from "../generated/schema"

export function handleCaseUpdated(event: CaseUpdatedEvent): void {

  //save in Case Updated Event
  let entity = new CaseUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caseId = event.params.caseId
  entity.initiator = event.params.initiator
  entity.oldStatus = event.params.oldStatus
  entity.newStatus = event.params.newStatus

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Core business logic
  //  load case
  let _entity = Cases.load(event.params.caseId.toString())
  // if case does not exist create it
  if(!_entity) {
    _entity = new Cases(event.params.caseId.toString());
    _entity.captain = event.params.initiator;
    _entity.status = event.params.newStatus;
    _entity.blockNumber = event.block.number
    _entity.blockTimestamp = event.block.timestamp
    _entity.transactionHash = event.transaction.hash
  } else {
    // if it does exist update its status
    _entity.status = event.params.newStatus;
  }

  _entity.save()
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

export function handleNewEvidenceInCase(event: NewEvidenceInCaseEvent): void | Error {
  let entity = new NewEvidenceInCase(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caseId = event.params.caseId
  entity.initiator = event.params.initiator
  entity.evidenceId = event.params.evidenceId
  entity.category = event.params.category
  entity.dataHash = event.params.dataHash
  entity.data = event.params.data

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Core business logic
  //  load case
  let _case = Cases.load(event.params.caseId.toString())
  // if case does not do nothing
  if(!_case) {
    return new Error("AddEvidence: Case doesnot exist")
  } else {
    // if it does exist add evidence
    _case.evidences.push(event.params.evidenceId)
  }

  _case.save()

  //  load evidence
  let evidence = Evidences.load(event.params.evidenceId.toString())
  // if evidence does not exist create one other wise add it to case
  if(!evidence) {
    evidence = new Evidences(event.params.evidenceId.toString());
  } 
  evidence.cases.push(event.params.caseId.toString())

  _case.save()
  evidence.save()
}

export function handleNewParticipantInCase(
  event: NewParticipantInCaseEvent
): void | Error {
  let entity = new NewParticipantInCase(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caseId = event.params.caseId
  entity.initiator = event.params.initiator
  entity.suspectId = event.params.suspectId
  entity.category = event.params.category
  entity.dataHash = event.params.dataHash
  entity.data = event.params.data

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Core business logic
  //  load case
  let _case = Cases.load(event.params.caseId.toString())
  // if case does not do nothing
  if(!_case) {
    return new Error("AddParticipant]: Case doesnot exist")
  } else {
    // if it does exist add evidence
    _case.evidences.push(event.params.suspectId)
  }

  _case.save()

  //  load evidence
  let participant = Participants.load(event.params.suspectId.toString())
  // if evidence does not exist create one other wise add it to case
  if(!participant) {
    participant = new Participants(event.params.suspectId.toString());
  } 
  participant.cases.push(event.params.caseId.toString())

  _case.save()
  participant.save()
}

export function handleRemoveOfficer(event: RemoveOfficerEvent): void {
  let entity = new RemoveOfficer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caseId = event.params.caseId
  entity.initiator = event.params.initiator
  entity.officer = event.params.officer
  entity.caseSpecificOfficerId = event.params.caseSpecificOfficerId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpdateOfficerInCase(
  event: UpdateOfficerInCaseEvent
): void {
  let entity = new UpdateOfficerInCase(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caseId = event.params.caseId
  entity.initiator = event.params.initiator
  entity.officer = event.params.officer
  entity.caseSpecificOfficerId = event.params.caseSpecificOfficerId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
