import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
import { BranchUpdate } from "../generated/schema"
import { BranchUpdate as BranchUpdateEvent } from "../generated/Ledger/Ledger"
import { handleBranchUpdate } from "../src/ledger"
import { createBranchUpdateEvent } from "./ledger-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let id = Bytes.fromI32(1234567890)
    let precinctAddress = "Example string value"
    let jurisdictionArea = BigInt.fromI32(234)
    let stateCode = BigInt.fromI32(234)
    let newBranchUpdateEvent = createBranchUpdateEvent(
      id,
      precinctAddress,
      jurisdictionArea,
      stateCode
    )
    handleBranchUpdate(newBranchUpdateEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("BranchUpdate created and stored", () => {
    assert.entityCount("BranchUpdate", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "BranchUpdate",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "precinctAddress",
      "Example string value"
    )
    assert.fieldEquals(
      "BranchUpdate",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "jurisdictionArea",
      "234"
    )
    assert.fieldEquals(
      "BranchUpdate",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "stateCode",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
