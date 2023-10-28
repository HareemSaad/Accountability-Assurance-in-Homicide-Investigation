import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { CaseUpdated } from "../generated/schema"
import { CaseUpdated as CaseUpdatedEvent } from "../generated/Cases/Cases"
import { handleCaseUpdated } from "../src/cases"
import { createCaseUpdatedEvent } from "./cases-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let caseId = BigInt.fromI32(234)
    let initiator = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let oldStatus = 123
    let newStatus = 123
    let newCaseUpdatedEvent = createCaseUpdatedEvent(
      caseId,
      initiator,
      oldStatus,
      newStatus
    )
    handleCaseUpdated(newCaseUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CaseUpdated created and stored", () => {
    assert.entityCount("CaseUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CaseUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "caseId",
      "234"
    )
    assert.fieldEquals(
      "CaseUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "initiator",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "CaseUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "oldStatus",
      "123"
    )
    assert.fieldEquals(
      "CaseUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newStatus",
      "123"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
