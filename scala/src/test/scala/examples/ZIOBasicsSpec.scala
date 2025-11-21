package examples

import zio.*
import zio.test.*
import zio.test.Assertions.*

object ZIOBasicsSpec extends ZIOSpecDefault:

  def spec = suite("ZIO Basics")(

    test("successEffect returns 42") {
      for
        value <- ZIOBasics.successEffect
      yield assertTrue(value == 42)
    },

    test("failedEffect fails with error message") {
      for
        result <- ZIOBasics.failedEffect.either
      yield assertTrue(result == Left("Something went wrong"))
    },

    test("doubled effect returns 84") {
      for
        value <- ZIOBasics.doubled
      yield assertTrue(value == 84)
    },

    test("fetchUser returns user string") {
      for
        user <- ZIOBasics.fetchUser(1)
      yield assertTrue(user == "User-1")
    },

    test("fetchUserPosts returns posts for user") {
      for
        posts <- ZIOBasics.fetchUserPosts("TestUser")
      yield assertTrue(posts.contains("Post by TestUser"))
    },

    test("program chains fetchUser and fetchUserPosts") {
      for
        result <- ZIOBasics.program
      yield assertTrue(result.contains("User-1"))
    },

    test("recovered effect returns default on error") {
      for
        value <- ZIOBasics.recovered
      yield assertTrue(value == 0)
    },

    test("folded effect handles failure") {
      for
        result <- ZIOBasics.folded
      yield assertTrue(result.startsWith("Failed:"))
    },

    test("asEither converts failure to Left") {
      for
        result <- ZIOBasics.asEither
      yield assertTrue(result.isLeft)
    },

    test("allEffects collects all results") {
      for
        list <- ZIOBasics.allEffects
      yield assertTrue(list == List(1, 2, 3))
    },

    test("zipped combines two effects") {
      for
        tuple <- ZIOBasics.zipped
      yield assertTrue(tuple == (1, 2))
    },

    test("summed adds two effects") {
      for
        sum <- ZIOBasics.summed
      yield assertTrue(sum == 3)
    }
  )
