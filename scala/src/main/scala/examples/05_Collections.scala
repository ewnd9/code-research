package examples

/**
 * Lesson 5: Collections
 *
 * This file covers:
 * - List, Vector, Set, Map
 * - Collection operations (map, filter, fold, etc.)
 * - For-comprehensions
 * - Immutable vs mutable collections
 */
object Collections:

  // ============================================
  // LIST (Immutable linked list)
  // ============================================

  val numbers: List[Int] = List(1, 2, 3, 4, 5)
  val empty: List[Int] = Nil
  val prepended = 0 :: numbers        // O(1) prepend
  val concatenated = numbers ++ List(6, 7, 8)

  // List operations
  def listOperations(): Unit =
    println(s"Head: ${numbers.head}")           // 1
    println(s"Tail: ${numbers.tail}")           // List(2,3,4,5)
    println(s"Last: ${numbers.last}")           // 5
    println(s"Init: ${numbers.init}")           // List(1,2,3,4)
    println(s"Take 3: ${numbers.take(3)}")      // List(1,2,3)
    println(s"Drop 2: ${numbers.drop(2)}")      // List(3,4,5)
    println(s"Reverse: ${numbers.reverse}")     // List(5,4,3,2,1)

  // ============================================
  // VECTOR (Immutable indexed sequence)
  // ============================================

  val vector: Vector[String] = Vector("a", "b", "c", "d")

  // Better for random access than List
  def vectorOperations(): Unit =
    println(s"Index 2: ${vector(2)}")           // O(~1) access
    val updated = vector.updated(1, "B")        // Vector("a","B","c","d")
    println(s"Updated: $updated")

  // ============================================
  // SET (Unique elements)
  // ============================================

  val fruits: Set[String] = Set("apple", "banana", "apple", "orange")
  // fruits = Set("apple", "banana", "orange") - duplicates removed

  def setOperations(): Unit =
    val moreFruits = Set("grape", "apple", "mango")
    println(s"Union: ${fruits.union(moreFruits)}")
    println(s"Intersection: ${fruits.intersect(moreFruits)}")
    println(s"Difference: ${fruits.diff(moreFruits)}")
    println(s"Contains banana? ${fruits.contains("banana")}")

  // ============================================
  // MAP (Key-value pairs)
  // ============================================

  val ages: Map[String, Int] = Map(
    "Alice" -> 30,
    "Bob" -> 25,
    "Charlie" -> 35
  )

  def mapOperations(): Unit =
    // Safe access with get (returns Option)
    println(s"Alice's age: ${ages.get("Alice")}")       // Some(30)
    println(s"Unknown age: ${ages.get("Unknown")}")     // None

    // Access with default
    println(s"Dave's age: ${ages.getOrElse("Dave", 0)}")

    // Add/update
    val updated = ages + ("Dave" -> 28)
    val removed = ages - "Bob"

    // Iterate
    ages.foreach { case (name, age) =>
      println(s"$name is $age years old")
    }

  // ============================================
  // TRANSFORMATION OPERATIONS
  // ============================================

  val nums = List(1, 2, 3, 4, 5)

  // map - transform each element
  def mapExample(): List[Int] =
    nums.map(_ * 2)  // List(2, 4, 6, 8, 10)

  // filter - keep elements that match predicate
  def filterExample(): List[Int] =
    nums.filter(_ > 2)  // List(3, 4, 5)

  // flatMap - map and flatten
  def flatMapExample(): List[Int] =
    nums.flatMap(n => List(n, n * 10))  // List(1,10,2,20,3,30,4,40,5,50)

  // fold/reduce - combine elements
  def foldExample(): Int =
    nums.foldLeft(0)(_ + _)  // 15 (sum)

  def reduceExample(): Int =
    nums.reduce(_ + _)  // 15 (sum, no initial value)

  // collect - partial function application
  def collectExample(): List[String] =
    nums.collect {
      case n if n % 2 == 0 => s"even-$n"
    }  // List("even-2", "even-4")

  // groupBy - create map of grouped elements
  def groupByExample(): Map[String, List[Int]] =
    nums.groupBy(n => if n % 2 == 0 then "even" else "odd")

  // partition - split by predicate
  def partitionExample(): (List[Int], List[Int]) =
    nums.partition(_ > 3)  // (List(4,5), List(1,2,3))

  // ============================================
  // FOR-COMPREHENSIONS
  // ============================================

  // For-comprehension with List
  def combinations(): List[(Int, Char)] =
    for
      n <- List(1, 2, 3)
      c <- List('a', 'b')
    yield (n, c)
    // List((1,a), (1,b), (2,a), (2,b), (3,a), (3,b))

  // With guards (filters)
  def filteredCombinations(): List[(Int, Int)] =
    for
      x <- 1 to 5
      y <- 1 to 5
      if x != y
      if x + y < 6
    yield (x, y)

  // Nested iteration with maps
  case class Person(name: String, children: List[String])

  val people = List(
    Person("Alice", List("Bob", "Charlie")),
    Person("Dave", List("Eve"))
  )

  def allChildren(): List[String] =
    for
      person <- people
      child <- person.children
    yield s"${child} (child of ${person.name})"

  // ============================================
  // LAZY COLLECTIONS (Views)
  // ============================================

  def lazyProcessing(): Seq[Int] =
    val result = (1 to 1000000)
      .view                    // Make lazy
      .map(_ * 2)
      .filter(_ % 4 == 0)
      .take(10)               // Only compute 10 elements
      .toList
    result

  // ============================================
  // MAIN METHOD
  // ============================================

  @main def runCollections(): Unit =
    println("=== List Operations ===")
    listOperations()

    println("\n=== Vector Operations ===")
    vectorOperations()

    println("\n=== Set Operations ===")
    setOperations()

    println("\n=== Map Operations ===")
    mapOperations()

    println("\n=== Transformations ===")
    println(s"map: ${mapExample()}")
    println(s"filter: ${filterExample()}")
    println(s"flatMap: ${flatMapExample()}")
    println(s"fold: ${foldExample()}")
    println(s"collect: ${collectExample()}")
    println(s"groupBy: ${groupByExample()}")
    println(s"partition: ${partitionExample()}")

    println("\n=== For-Comprehensions ===")
    println(s"combinations: ${combinations()}")
    println(s"filtered: ${filteredCombinations().toList}")
    println(s"children: ${allChildren()}")

    println("\n=== Lazy Processing ===")
    println(s"lazy: ${lazyProcessing()}")
