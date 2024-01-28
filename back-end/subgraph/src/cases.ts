import { Bytes } from "@graphprotocol/graph-ts"
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
  Case,
  Officer,
  Evidence,
  Participant,
  TrusteeTable
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

  // Core business logic
  let officer = Officer.load(event.params.officer)
  if (!officer) return 
  //  load case
  let _case = Case.load(event.params.caseId.toString())
  if(!_case) {
    return
  } else {

    // add to officer array regardless
    let temp = _case.officers ? _case.officers : []
    temp!.push(officer.id)
    _case.officers = temp
  }

  _case.save()
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

  // Core business logic
  //  load case
  let _case = Case.load(event.params.caseId.toString())
  if(!_case) {
    _case = new Case(event.params.caseId.toString())

    // add officer since a new case's initiator is the captain of the case otherwise its redundant or a moderator
    let temp = _case.officers ? _case.officers : []
    temp!.push(event.params.initiator)
    _case.officers = temp
    
  } 
  _case.status =  event.params.status
  _case.branch = event.params.branch
  _case.blockNumber = event.block.number
  _case.blockTimestamp = event.block.timestamp
  _case.transactionHash = event.transaction.hash

  _case.save()
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

  let evidence = Evidence.load(event.params.evidenceId.toString())
  if(!evidence) {
    return
  } 
  evidence.approve = true;

  evidence.save()
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
  
  //  load case
  let _case = Case.load(event.params.caseId.toString())
  // if case does not exist do nothing
  if(!_case) {
    return;
  } else {
    let temp = _case.evidences ? _case.evidences : []
    temp!.push(event.params.evidenceId.toString())
    _case.evidences = temp
  }

  _case.save()

  let evidence = Evidence.load(event.params.evidenceId.toString())
  if(!evidence) {
    evidence = new Evidence(event.params.evidenceId.toString());
  } 

  evidence.approve = false
  evidence.data = event.params.data
  evidence.category = event.params.category
  evidence.from = event.params.initiator

  evidence.save()
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
  
  //  load case
  let _case = Case.load(event.params.caseId.toString())
  // if case does not exist do nothing
  if(!_case) {
    return;
  } else {
    let temp = _case.participants ? _case.participants : []
    temp!.push(event.params.suspectId.toString())
    _case.participants = temp
  }

  _case.save()

  let participant = Participant.load(event.params.suspectId.toString())
  if(!participant) {
    participant = new Participant(event.params.suspectId.toString());
  } 

  participant.approve = false
  participant.category = event.params.category
  participant.data = event.params.data
  participant.from = event.params.initiator

  participant.save()
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

  let participant = Participant.load(event.params.participantId.toString())
  if(!participant) {
    return
  } 
  participant.approve = true;

  participant.save()
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

  // Core business logic
  let officer = Officer.load(event.params.officer)
  if (!officer) return 
  //  load case
  let _case = Case.load(event.params.caseId.toString())
  if(!_case) {
    return
  } else {

    // remove officer array regardless
    const temp: Bytes[] = [];
    for (let i = 0; i < _case.officers!.length; i++) {
      if (_case.officers![i] != event.params.officer) {
        temp.push(_case.officers![i]);
      }
    }
    _case.officers = temp
  }

  _case.save()
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

  let trustee = TrusteeTable.load(event.params.trustree)
  if(!trustee) {
    trustee = new TrusteeTable(event.params.trustree);
  } 
  trustee.caseId = event.params.caseId
  trustee.branchId = event.params.branchId
  trustee.approved = event.params.approved

  trustee.save()
}
