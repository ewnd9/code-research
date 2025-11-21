package examples

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class FunctionsSpec extends AnyFlatSpec with Matchers:

  "Functions" should "add two numbers" in {
    Functions.add(3, 4) shouldBe 7
    Functions.add(-1, 1) shouldBe 0
    Functions.add(0, 0) shouldBe 0
  }

  it should "greet with default parameter" in {
    Functions.greet("Alice") shouldBe "Hello, Alice!"
    Functions.greet("Bob", "Hi") shouldBe "Hi, Bob!"
  }

  it should "create user with default email" in {
    Functions.createUser("John", 25) shouldBe "User(John, 25, N/A)"
    Functions.createUser("Jane", 30, "jane@test.com") shouldBe "User(Jane, 30, jane@test.com)"
  }

  it should "apply function twice" in {
    val double = (x: Int) => x * 2
    Functions.applyTwice(double, 3) shouldBe 12  // 3 -> 6 -> 12
    Functions.applyTwice(_ + 1, 5) shouldBe 7   // 5 -> 6 -> 7
  }

  it should "create multiplier functions" in {
    val times2 = Functions.multiplier(2)
    val times5 = Functions.multiplier(5)
    times2(3) shouldBe 6
    times5(4) shouldBe 20
  }

  it should "double all numbers in list" in {
    Functions.doubleAll(List(1, 2, 3)) shouldBe List(2, 4, 6)
    Functions.doubleAll(Nil) shouldBe Nil
  }

  it should "filter even numbers" in {
    Functions.filterEvens(List(1, 2, 3, 4, 5)) shouldBe List(2, 4)
    Functions.filterEvens(List(1, 3, 5)) shouldBe Nil
  }

  it should "sum all numbers" in {
    Functions.sumAll(List(1, 2, 3, 4, 5)) shouldBe 15
  }

  "Lambda values" should "work correctly" in {
    Functions.addOne(5) shouldBe 6
    Functions.double(5) shouldBe 10
    Functions.triple(5) shouldBe 15
    Functions.multiply(3, 4) shouldBe 12
  }

  "Curried functions" should "support partial application" in {
    Functions.addCurried(5)(3) shouldBe 8
    Functions.add5(10) shouldBe 15

    val logMessage = Functions.formatWithPrefix("LOG")
    logMessage("test") shouldBe "LOG: test"
  }

  "Varargs functions" should "handle variable arguments" in {
    Functions.sumVarargs(1, 2, 3, 4, 5) shouldBe 15
    Functions.sumVarargs() shouldBe 0
    Functions.joinStrings(", ")("a", "b", "c") shouldBe "a, b, c"
  }
