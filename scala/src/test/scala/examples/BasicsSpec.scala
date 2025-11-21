package examples

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class BasicsSpec extends AnyFlatSpec with Matchers:

  "Basics" should "have correct immutable values" in {
    Basics.immutableNumber shouldBe 42
    Basics.immutableString shouldBe "Hello, Scala!"
  }

  it should "support type inference" in {
    Basics.inferredInt shouldBe 100
    Basics.inferredDouble shouldBe 3.14
    Basics.inferredString shouldBe "Hi"
  }

  it should "greet correctly with string interpolation" in {
    Basics.greet("World") shouldBe "Hello, World!"
    Basics.greet("Scala") shouldBe "Hello, Scala!"
  }

  it should "format prices correctly" in {
    Basics.formatPrice("Coffee", 4.5) shouldBe "Coffee costs $4.50"
    Basics.formatPrice("Book", 19.99) shouldBe "Book costs $19.99"
  }

  it should "not process escapes in raw strings" in {
    Basics.rawString() shouldBe "Line1\\nLine2"
  }

  it should "calculate absolute value correctly" in {
    Basics.absoluteValue(5) shouldBe 5
    Basics.absoluteValue(-5) shouldBe 5
    Basics.absoluteValue(0) shouldBe 0
  }

  it should "calculate with steps correctly" in {
    // (3 + 4) * 2 + 1 = 15
    Basics.calculateWithSteps(3, 4) shouldBe 15
    // (0 + 0) * 2 + 1 = 1
    Basics.calculateWithSteps(0, 0) shouldBe 1
  }
