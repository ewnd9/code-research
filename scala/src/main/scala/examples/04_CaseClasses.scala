package examples

/**
 * Lesson 4: Case Classes and Pattern Matching
 *
 * This file covers:
 * - Case classes (immutable data containers)
 * - Pattern matching
 * - Extractors
 * - Options
 */

// ============================================
// CASE CLASSES
// ============================================

// Case classes are perfect for immutable data
// They automatically provide: equals, hashCode, toString, copy, apply
case class User(name: String, email: String, age: Int)

case class Address(street: String, city: String, zipCode: String)

case class Employee(
    id: Int,
    user: User,
    address: Address,
    salary: Double
)

object CaseClassExamples:

  // Creating instances (no 'new' keyword needed)
  val alice = User("Alice", "alice@example.com", 30)
  val bob = User("Bob", "bob@example.com", 25)

  // Copy with modifications
  val olderAlice = alice.copy(age = 31)

  // Deep nesting with copy
  val employee = Employee(
    1,
    alice,
    Address("123 Main St", "NYC", "10001"),
    75000.0
  )

  // Update nested fields
  val employeeWithRaise = employee.copy(salary = employee.salary * 1.1)
  val employeeNewCity = employee.copy(
    address = employee.address.copy(city = "Boston")
  )

// ============================================
// PATTERN MATCHING
// ============================================

object PatternMatchingExamples:

  // Basic pattern matching
  def describeNumber(x: Int): String = x match
    case 0 => "zero"
    case 1 => "one"
    case 2 => "two"
    case n if n < 0 => s"negative: $n"
    case n if n % 2 == 0 => s"even: $n"
    case n => s"odd: $n"

  // Pattern matching on case classes
  def greetUser(user: User): String = user match
    case User("Admin", _, _) => "Welcome, Administrator!"
    case User(name, _, age) if age < 18 => s"Hi young $name!"
    case User(name, email, _) => s"Hello $name ($email)"

  // Pattern matching on types
  def describe(x: Any): String = x match
    case i: Int => s"Integer: $i"
    case s: String => s"String of length ${s.length}"
    case list: List[_] => s"List with ${list.size} elements"
    case User(name, _, _) => s"User named $name"
    case _ => "Unknown type"

  // Pattern matching with tuples
  def coordinates(point: (Int, Int)): String = point match
    case (0, 0) => "origin"
    case (x, 0) => s"on x-axis at $x"
    case (0, y) => s"on y-axis at $y"
    case (x, y) => s"point at ($x, $y)"

  // Pattern matching in variable binding
  def processResult(result: (String, Int)): String =
    val (status, code) = result  // Destructuring
    s"$status with code $code"

// ============================================
// OPTION TYPE (handling null safely)
// ============================================

object OptionExamples:

  // Options prevent null pointer exceptions
  def findUserById(id: Int): Option[User] =
    val users = Map(
      1 -> User("Alice", "alice@example.com", 30),
      2 -> User("Bob", "bob@example.com", 25)
    )
    users.get(id)

  // Pattern matching with Option
  def displayUser(maybeUser: Option[User]): String = maybeUser match
    case Some(user) => s"Found: ${user.name}"
    case None => "User not found"

  // Using map, flatMap, getOrElse
  def getUserEmail(id: Int): String =
    findUserById(id)
      .map(_.email)
      .getOrElse("no-email@example.com")

  // Chaining Options with for-comprehension
  def getUserDetails(id: Int): Option[String] =
    for
      user <- findUserById(id)
      if user.age >= 18  // Guard
    yield s"${user.name} (${user.email})"

  // Multiple Options
  case class Order(userId: Int, productId: Int, quantity: Int)

  def findProduct(id: Int): Option[String] =
    Map(1 -> "Laptop", 2 -> "Phone").get(id)

  def describeOrder(order: Order): Option[String] =
    for
      user <- findUserById(order.userId)
      product <- findProduct(order.productId)
    yield s"${user.name} ordered ${order.quantity}x $product"

// ============================================
// EITHER TYPE (error handling)
// ============================================

object EitherExamples:

  // Either[Error, Success] - Left is error, Right is success
  def divide(a: Int, b: Int): Either[String, Int] =
    if b == 0 then Left("Division by zero")
    else Right(a / b)

  def parseAge(input: String): Either[String, Int] =
    try
      val age = input.toInt
      if age < 0 then Left("Age cannot be negative")
      else if age > 150 then Left("Age seems unrealistic")
      else Right(age)
    catch
      case _: NumberFormatException => Left(s"'$input' is not a valid number")

  // Chaining Either with for-comprehension
  def calculateAgeInMonths(input: String): Either[String, Int] =
    for
      age <- parseAge(input)
    yield age * 12

  // Pattern matching on Either
  def describeResult(result: Either[String, Int]): String = result match
    case Right(value) => s"Success: $value"
    case Left(error) => s"Error: $error"

// ============================================
// MAIN METHOD
// ============================================

@main def runCaseClasses(): Unit =
  import CaseClassExamples.*
  import PatternMatchingExamples.*
  import OptionExamples.*
  import EitherExamples.*

  println("=== Case Classes Demo ===")
  println(s"Alice: $alice")
  println(s"Older Alice: $olderAlice")
  println(s"Are they equal? ${alice == olderAlice}")

  println("\n=== Pattern Matching Demo ===")
  List(-1, 0, 1, 2, 7, 10).foreach(n =>
    println(s"$n -> ${describeNumber(n)}")
  )
  println(greetUser(User("Admin", "admin@example.com", 35)))
  println(greetUser(User("Kid", "kid@example.com", 12)))

  println("\n=== Option Demo ===")
  println(displayUser(findUserById(1)))
  println(displayUser(findUserById(99)))
  println(s"User 1 email: ${getUserEmail(1)}")
  println(s"User 99 email: ${getUserEmail(99)}")

  println("\n=== Either Demo ===")
  println(describeResult(divide(10, 2)))
  println(describeResult(divide(10, 0)))
  println(describeResult(parseAge("25")))
  println(describeResult(parseAge("-5")))
  println(describeResult(parseAge("abc")))
