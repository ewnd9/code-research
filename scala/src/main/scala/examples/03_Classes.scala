package examples

/**
 * Lesson 3: Classes and Objects
 *
 * This file covers:
 * - Class definitions
 * - Constructor parameters
 * - Methods and fields
 * - Companion objects
 * - Traits (interfaces)
 * - Inheritance
 */

// ============================================
// BASIC CLASS
// ============================================

// Primary constructor is in the class definition
class Person(val name: String, var age: Int):

  // Additional fields
  private var _nickname: String = name

  // Getter
  def nickname: String = _nickname

  // Setter
  def nickname_=(newNickname: String): Unit =
    _nickname = newNickname

  // Method
  def greet(): String =
    s"Hi, I'm $name and I'm $age years old"

  // Method with parameter
  def celebrateBirthday(): Unit =
    age += 1

  // Override toString
  override def toString: String =
    s"Person($name, $age)"

// ============================================
// COMPANION OBJECT (Static members)
// ============================================

class Circle(val radius: Double):
  def area: Double = Circle.PI * radius * radius
  def circumference: Double = 2 * Circle.PI * radius

// Companion object - same name as class
object Circle:
  val PI: Double = 3.14159265359

  // Factory method
  def apply(radius: Double): Circle = new Circle(radius)

  // Alternative factory
  def withDiameter(diameter: Double): Circle =
    new Circle(diameter / 2)

// ============================================
// TRAITS (like interfaces, but can have implementations)
// ============================================

trait Printable:
  def print(): String  // Abstract method

  def printFormatted(): String =  // Concrete method
    s"[${print()}]"

trait Identifiable:
  def id: String

// ============================================
// CLASS WITH TRAITS
// ============================================

class Document(val title: String, val content: String) extends Printable with Identifiable:

  override def print(): String =
    s"$title: $content"

  override def id: String =
    title.hashCode.toHexString

// ============================================
// INHERITANCE
// ============================================

// Abstract class (cannot be instantiated)
abstract class Shape:
  def area: Double
  def perimeter: Double
  def description: String = "I am a shape"

class Rectangle(val width: Double, val height: Double) extends Shape:
  override def area: Double = width * height
  override def perimeter: Double = 2 * (width + height)
  override def description: String = s"Rectangle ${width}x${height}"

class Square(side: Double) extends Rectangle(side, side):
  override def description: String = s"Square ${width}x${width}"

// ============================================
// SEALED CLASSES (for exhaustive pattern matching)
// ============================================

sealed trait Color
case object Red extends Color
case object Green extends Color
case object Blue extends Color
case class Custom(hex: String) extends Color

object ColorUtils:
  def toHex(color: Color): String = color match
    case Red => "#FF0000"
    case Green => "#00FF00"
    case Blue => "#0000FF"
    case Custom(hex) => hex

// ============================================
// MAIN METHOD
// ============================================

@main def runClasses(): Unit =
  println("=== Classes Demo ===")

  // Basic class
  val person = Person("Alice", 30)
  println(person.greet())
  person.celebrateBirthday()
  println(s"After birthday: ${person.age}")

  // Companion object factory
  val circle1 = Circle(5.0)  // Uses apply
  val circle2 = Circle.withDiameter(10.0)
  println(s"Circle area: ${circle1.area}")

  // Traits
  val doc = Document("README", "This is a readme file")
  println(doc.print())
  println(doc.printFormatted())
  println(s"Document ID: ${doc.id}")

  // Inheritance
  val shapes: List[Shape] = List(
    Rectangle(4, 5),
    Square(3)
  )
  shapes.foreach(s => println(s"${s.description} - Area: ${s.area}"))

  // Sealed classes
  val colors = List(Red, Green, Blue, Custom("#PURPLE"))
  colors.foreach(c => println(s"$c -> ${ColorUtils.toHex(c)}"))
