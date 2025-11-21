package examples

/**
 * Lesson 1: Scala Basics
 *
 * This file covers:
 * - Variables (val vs var)
 * - Basic types
 * - String interpolation
 * - Type inference
 */
object Basics:

  // ============================================
  // VARIABLES: val vs var
  // ============================================

  // 'val' is immutable (like final in Java) - PREFERRED
  val immutableNumber: Int = 42
  val immutableString: String = "Hello, Scala!"

  // 'var' is mutable - use sparingly
  var mutableCounter: Int = 0

  // Type inference - Scala figures out the type
  val inferredInt = 100        // Scala knows this is Int
  val inferredDouble = 3.14    // Scala knows this is Double
  val inferredString = "Hi"    // Scala knows this is String

  // ============================================
  // BASIC TYPES
  // ============================================

  val byte: Byte = 127
  val short: Short = 32767
  val int: Int = 2147483647
  val long: Long = 9223372036854775807L
  val float: Float = 3.14f
  val double: Double = 3.14159265359
  val char: Char = 'A'
  val boolean: Boolean = true

  // ============================================
  // STRING INTERPOLATION
  // ============================================

  def greet(name: String): String =
    s"Hello, $name!"  // s-interpolation for simple variables

  def formatPrice(item: String, price: Double): String =
    f"$item costs $$$price%.2f"  // f-interpolation for formatting

  def rawString(): String =
    raw"Line1\nLine2"  // raw interpolation - no escape processing

  // ============================================
  // EXPRESSIONS (everything returns a value)
  // ============================================

  // if/else is an expression that returns a value
  def absoluteValue(x: Int): Int =
    if x >= 0 then x else -x

  // Block expressions return the last value
  def calculateWithSteps(a: Int, b: Int): Int =
    val sum = a + b
    val doubled = sum * 2
    doubled + 1  // This is the return value

  // ============================================
  // MAIN METHOD (Entry Point)
  // ============================================

  @main def runBasics(): Unit =
    println("=== Scala Basics Demo ===")
    println(s"Immutable number: $immutableNumber")
    println(greet("Learner"))
    println(formatPrice("Coffee", 4.5))
    println(s"Absolute value of -5: ${absoluteValue(-5)}")
    println(s"Calculate: ${calculateWithSteps(3, 4)}")
