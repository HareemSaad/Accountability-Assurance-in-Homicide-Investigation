import {
  AddOfficer as AddOfficerEvent,
  CaseStatusUpdated as CaseStatusUpdatedEvent,
  EIP712DomainChanged as EIP712DomainChangedEvent,
  NewCase as NewCaseEvent,
  NewEvidenceInCase as NewEvidenceInCaseEvent,
  NewParticipantInCase as NewParticipantInCaseEvent,
  RemoveOfficer as RemoveOfficerEvent
} from "../generated/Cases/Cases"
import {
  AddOfficer,
  CaseStatusUpdated,
  EIP712DomainChanged,
  NewCase,
  NewEvidenceInCase,
  NewParticipantInCase,
  RemoveOfficer
} from "../generated/schema"

export function handleAddOfficer(event: AddOfficerEvent): void {
  let entity = new AddOfficer(
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

export function handleCaseStatusUpdated(event: CaseStatusUpdatedEvent): void {
  let entity = new CaseStatusUpdated(
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

export function handleNewCase(event: NewCaseEvent): void {
  let entity = new NewCase(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caseId = event.params.caseId
  entity.initiator = event.params.initiator

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNewEvidenceInCase(event: NewEvidenceInCaseEvent): void {
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
}

export function handleNewParticipantInCase(
  event: NewParticipantInCaseEvent
): void {
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
