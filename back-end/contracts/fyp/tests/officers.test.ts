import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { OffBoard } from "../generated/schema"
import { OffBoard as OffBoardEvent } from "../generated/Officers/Officers"
import { handleOffBoard } from "../src/officers"
import { createOffBoardEvent } from "./officers-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let officer = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let employmentStatus = 123
    let when = BigInt.fromI32(234)
    let from = Address.fromString("0x0000000000000000000000000000000000000001")
    let newOffBoardEvent = createOffBoardEvent(
      officer,
      employmentStatus,
      when,
      from
    )
    handleOffBoard(newOffBoardEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("OffBoard created and stored", () => {
    assert.entityCount("OffBoard", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "OffBoard",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "officer",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "OffBoard",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "employmentStatus",
      "123"
    )
    assert.fieldEquals(
      "OffBoard",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "when",
      "234"
    )
    assert.fieldEquals(
      "OffBoard",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "from",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
