import {
  AddOfficerInCase as AddOfficerInCaseEvent,
  CaseUpdated as CaseUpdatedEvent,
  EIP712DomainChanged as EIP712DomainChangedEvent,
  EvidenceApproved as EvidenceApprovedEvent,
  NewEvidenceInCase as NewEvidenceInCaseEvent,
  NewParticipantInCase as NewParticipantInCaseEvent,
  ParticipantApproved as ParticipantApprovedEvent,
  RemoveOfficerInCase as RemoveOfficerInCaseEvent,
  Trustee as TrusteeEvent,
} from "../generated/Cases/Cases"
import {
  AddOfficerInCase,
  CaseUpdated,
  EIP712DomainChanged,
  EvidenceApproved,
  NewEvidenceInCase,
  NewParticipantInCase,
  ParticipantApproved,
  RemoveOfficerInCase,
  Trustee,
} from "../generated/schema"

export function handleAddOfficerInCase(event: AddOfficerInCaseEvent): void {
  let entity = new AddOfficerInCase(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.caseId = event.params.caseId
  entity.initiator = event.params.initiator
  entity.officer = event.params.officer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCaseUpdated(event: CaseUpdatedEvent): void {
  let entity = new CaseUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.caseId = event.params.caseId
  entity.initiator = event.params.initiator
  entity.branch = event.params.branch
  entity.status = event.params.status

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleEIP712DomainChanged(
  event: EIP712DomainChangedEvent,
): void {
  let entity = new EIP712DomainChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleEvidenceApproved(event: EvidenceApprovedEvent): void {
  let entity = new EvidenceApproved(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.evidenceId = event.params.evidenceId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNewEvidenceInCase(event: NewEvidenceInCaseEvent): void {
  let entity = new NewEvidenceInCase(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
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
  event: NewParticipantInCaseEvent,
): void {
  let entity = new NewParticipantInCase(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
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

export function handleParticipantApproved(
  event: ParticipantApprovedEvent,
): void {
  let entity = new ParticipantApproved(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.participantId = event.params.participantId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRemoveOfficerInCase(
  event: RemoveOfficerInCaseEvent,
): void {
  let entity = new RemoveOfficerInCase(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.caseId = event.params.caseId
  entity.initiator = event.params.initiator
  entity.officer = event.params.officer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTrustee(event: TrusteeEvent): void {
  let entity = new Trustee(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.caseId = event.params.caseId
  entity.branchId = event.params.branchId
  entity.initiator = event.params.initiator
  entity.trustree = event.params.trustree
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
