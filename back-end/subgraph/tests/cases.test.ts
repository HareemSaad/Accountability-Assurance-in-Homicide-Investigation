import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { AddOfficerInCase } from "../generated/schema"
import { AddOfficerInCase as AddOfficerInCaseEvent } from "../generated/Cases/Cases"
import { handleAddOfficerInCase } from "../src/cases"
import { createAddOfficerInCaseEvent } from "./cases-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let caseId = BigInt.fromI32(234)
    let initiator = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let officer = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newAddOfficerInCaseEvent = createAddOfficerInCaseEvent(
      caseId,
      initiator,
      officer
    )
    handleAddOfficerInCase(newAddOfficerInCaseEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("AddOfficerInCase created and stored", () => {
    assert.entityCount("AddOfficerInCase", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AddOfficerInCase",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "caseId",
      "234"
    )
    assert.fieldEquals(
      "AddOfficerInCase",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "initiator",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "AddOfficerInCase",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "officer",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
