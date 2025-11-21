package examples

/**
 * Lesson 2: Functions in Scala
 *
 * This file covers:
 * - Function definitions
 * - Default and named parameters
 * - Higher-order functions
 * - Anonymous functions (lambdas)
 * - Currying
 */
object Functions:

  // ============================================
  // BASIC FUNCTIONS
  // ============================================

  // Simple function with explicit return type
  def add(a: Int, b: Int): Int =
    a + b

  // Function with no parameters
  def currentTime(): Long =
    System.currentTimeMillis()

  // Unit return type (like void in Java)
  def printMessage(msg: String): Unit =
    println(msg)

  // ============================================
  // DEFAULT AND NAMED PARAMETERS
  // ============================================

  def greet(name: String, greeting: String = "Hello"): String =
    s"$greeting, $name!"

  // Can call with named parameters in any order
  def createUser(name: String, age: Int, email: String = "N/A"): String =
    s"User($name, $age, $email)"

  // ============================================
  // HIGHER-ORDER FUNCTIONS
  // ============================================

  // Function that takes another function as parameter
  def applyTwice(f: Int => Int, x: Int): Int =
    f(f(x))

  // Function that returns a function
  def multiplier(factor: Int): Int => Int =
    (x: Int) => x * factor

  // Common higher-order functions with collections
  def doubleAll(numbers: List[Int]): List[Int] =
    numbers.map(n => n * 2)

  def filterEvens(numbers: List[Int]): List[Int] =
    numbers.filter(n => n % 2 == 0)

  def sumAll(numbers: List[Int]): Int =
    numbers.reduce((a, b) => a + b)

  // ============================================
  // ANONYMOUS FUNCTIONS (LAMBDAS)
  // ============================================

  // Full syntax
  val addOne: Int => Int = (x: Int) => x + 1

  // Shortened syntax with type inference
  val double: Int => Int = x => x * 2

  // Placeholder syntax (for single use of parameter)
  val triple: Int => Int = _ * 3

  // Multi-parameter lambda
  val multiply: (Int, Int) => Int = (a, b) => a * b

  // ============================================
  // CURRYING
  // ============================================

  // Curried function - multiple parameter lists
  def addCurried(a: Int)(b: Int): Int =
    a + b

  // Partial application
  def add5: Int => Int = addCurried(5)

  // Another curried example
  def formatWithPrefix(prefix: String)(value: String): String =
    s"$prefix: $value"

  // ============================================
  // VARARGS (Variable Arguments)
  // ============================================

  def sumVarargs(numbers: Int*): Int =
    numbers.sum

  def joinStrings(separator: String)(strings: String*): String =
    strings.mkString(separator)

  // ============================================
  // MAIN METHOD
  // ============================================

  @main def runFunctions(): Unit =
    println("=== Functions Demo ===")

    // Basic functions
    println(s"add(3, 4) = ${add(3, 4)}")

    // Default and named parameters
    println(greet("Alice"))
    println(greet("Bob", "Hi"))
    println(greet(greeting = "Hey", name = "Charlie"))
    println(createUser(age = 25, name = "Dave"))

    // Higher-order functions
    val double = (x: Int) => x * 2
    println(s"applyTwice(double, 3) = ${applyTwice(double, 3)}")

    val times3 = multiplier(3)
    println(s"times3(7) = ${times3(7)}")

    // Lambdas
    println(s"doubleAll(List(1,2,3)) = ${doubleAll(List(1, 2, 3))}")
    println(s"filterEvens(List(1,2,3,4,5)) = ${filterEvens(List(1, 2, 3, 4, 5))}")

    // Currying
    println(s"add5(10) = ${add5(10)}")

    val logMessage = formatWithPrefix("LOG")
    println(logMessage("Application started"))

    // Varargs
    println(s"sumVarargs(1,2,3,4,5) = ${sumVarargs(1, 2, 3, 4, 5)}")
    println(joinStrings(" | ")("A", "B", "C"))
