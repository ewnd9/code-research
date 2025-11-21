package examples

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class CaseClassesSpec extends AnyFlatSpec with Matchers:

  import CaseClassExamples.*

  "Case classes" should "be created without new keyword" in {
    val user = User("Test", "test@example.com", 25)
    user.name shouldBe "Test"
    user.email shouldBe "test@example.com"
    user.age shouldBe 25
  }

  it should "have automatic equals implementation" in {
    val user1 = User("Alice", "alice@example.com", 30)
    val user2 = User("Alice", "alice@example.com", 30)
    user1 shouldBe user2
  }

  it should "support copy with modifications" in {
    val original = User("Alice", "alice@example.com", 30)
    val modified = original.copy(age = 31)
    modified.name shouldBe "Alice"
    modified.age shouldBe 31
    original.age shouldBe 30  // Original unchanged
  }

  it should "have automatic toString" in {
    val user = User("Bob", "bob@example.com", 25)
    user.toString shouldBe "User(Bob,bob@example.com,25)"
  }

  "PatternMatchingExamples" should "describe numbers correctly" in {
    import PatternMatchingExamples.*

    describeNumber(0) shouldBe "zero"
    describeNumber(1) shouldBe "one"
    describeNumber(2) shouldBe "two"
    describeNumber(-5) shouldBe "negative: -5"
    describeNumber(4) shouldBe "even: 4"
    describeNumber(7) shouldBe "odd: 7"
  }

  it should "greet users based on pattern" in {
    import PatternMatchingExamples.*

    greetUser(User("Admin", "admin@test.com", 40)) shouldBe "Welcome, Administrator!"
    greetUser(User("Kid", "kid@test.com", 10)) shouldBe "Hi young Kid!"
    greetUser(User("Regular", "reg@test.com", 30)) shouldBe "Hello Regular (reg@test.com)"
  }

  it should "describe types correctly" in {
    import PatternMatchingExamples.*

    describe(42) shouldBe "Integer: 42"
    describe("hello") shouldBe "String of length 5"
    describe(List(1, 2, 3)) shouldBe "List with 3 elements"
    describe(User("Test", "t@t.com", 20)) shouldBe "User named Test"
    describe(3.14) shouldBe "Unknown type"
  }

  it should "describe coordinates" in {
    import PatternMatchingExamples.*

    coordinates((0, 0)) shouldBe "origin"
    coordinates((5, 0)) shouldBe "on x-axis at 5"
    coordinates((0, 3)) shouldBe "on y-axis at 3"
    coordinates((2, 4)) shouldBe "point at (2, 4)"
  }

  "OptionExamples" should "find users by id" in {
    import OptionExamples.*

    findUserById(1) shouldBe a[Some[_]]
    findUserById(99) shouldBe None
  }

  it should "display user correctly" in {
    import OptionExamples.*

    displayUser(Some(User("Test", "t@t.com", 25))) shouldBe "Found: Test"
    displayUser(None) shouldBe "User not found"
  }

  it should "get user email with fallback" in {
    import OptionExamples.*

    getUserEmail(1) shouldBe "alice@example.com"
    getUserEmail(99) shouldBe "no-email@example.com"
  }

  "EitherExamples" should "handle division" in {
    import EitherExamples.*

    divide(10, 2) shouldBe Right(5)
    divide(10, 0) shouldBe Left("Division by zero")
  }

  it should "parse age with validation" in {
    import EitherExamples.*

    parseAge("25") shouldBe Right(25)
    parseAge("-5") shouldBe Left("Age cannot be negative")
    parseAge("200") shouldBe Left("Age seems unrealistic")
    parseAge("abc") shouldBe Left("'abc' is not a valid number")
  }
