import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { CaseShifted } from "../generated/schema"
import { CaseShifted as CaseShiftedEvent } from "../generated/Cases/Cases"
import { handleCaseShifted } from "../src/cases"
import { createCaseShiftedEvent } from "./cases-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let caseId = BigInt.fromI32(234)
    let captain = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let branch = Bytes.fromI32(1234567890)
    let newCaseShiftedEvent = createCaseShiftedEvent(caseId, captain, branch)
    handleCaseShifted(newCaseShiftedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CaseShifted created and stored", () => {
    assert.entityCount("CaseShifted", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CaseShifted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "caseId",
      "234"
    )
    assert.fieldEquals(
      "CaseShifted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "captain",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "CaseShifted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "branch",
      "1234567890"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
