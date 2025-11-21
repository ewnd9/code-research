package examples

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class ClassesSpec extends AnyFlatSpec with Matchers:

  "Person class" should "be created with constructor parameters" in {
    val person = Person("Alice", 30)
    person.name shouldBe "Alice"
    person.age shouldBe 30
  }

  it should "allow age modification (var)" in {
    val person = Person("Bob", 25)
    person.age = 26
    person.age shouldBe 26
  }

  it should "greet correctly" in {
    val person = Person("Charlie", 35)
    person.greet() shouldBe "Hi, I'm Charlie and I'm 35 years old"
  }

  it should "celebrate birthday" in {
    val person = Person("Dave", 40)
    person.celebrateBirthday()
    person.age shouldBe 41
  }

  it should "support nickname getter and setter" in {
    val person = Person("Eve", 28)
    person.nickname shouldBe "Eve"  // Default is name
    person.nickname = "Evie"
    person.nickname shouldBe "Evie"
  }

  "Circle class" should "calculate area correctly" in {
    val circle = Circle(5.0)
    circle.area shouldBe (Circle.PI * 25.0)
  }

  it should "calculate circumference correctly" in {
    val circle = Circle(5.0)
    circle.circumference shouldBe (2 * Circle.PI * 5.0)
  }

  it should "be created via companion object factory" in {
    val circle = Circle(3.0)  // Uses apply
    circle.radius shouldBe 3.0

    val fromDiameter = Circle.withDiameter(10.0)
    fromDiameter.radius shouldBe 5.0
  }

  "Document with traits" should "implement Printable" in {
    val doc = Document("README", "This is content")
    doc.print() shouldBe "README: This is content"
    doc.printFormatted() shouldBe "[README: This is content]"
  }

  it should "implement Identifiable" in {
    val doc = Document("README", "This is content")
    doc.id should not be empty
  }

  "Rectangle shape" should "calculate area and perimeter" in {
    val rect = Rectangle(4.0, 5.0)
    rect.area shouldBe 20.0
    rect.perimeter shouldBe 18.0
    rect.description shouldBe "Rectangle 4.0x5.0"
  }

  "Square shape" should "be a special rectangle" in {
    val square = Square(3.0)
    square.area shouldBe 9.0
    square.perimeter shouldBe 12.0
    square.description shouldBe "Square 3.0x3.0"
  }

  "ColorUtils" should "convert colors to hex" in {
    ColorUtils.toHex(Red) shouldBe "#FF0000"
    ColorUtils.toHex(Green) shouldBe "#00FF00"
    ColorUtils.toHex(Blue) shouldBe "#0000FF"
    ColorUtils.toHex(Custom("#ABC123")) shouldBe "#ABC123"
  }
