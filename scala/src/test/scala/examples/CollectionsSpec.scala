package examples

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class CollectionsSpec extends AnyFlatSpec with Matchers:

  "Collections" should "have correct list values" in {
    Collections.numbers shouldBe List(1, 2, 3, 4, 5)
    Collections.empty shouldBe Nil
  }

  it should "prepend to list with ::" in {
    Collections.prepended shouldBe List(0, 1, 2, 3, 4, 5)
  }

  it should "concatenate lists with ++" in {
    Collections.concatenated shouldBe List(1, 2, 3, 4, 5, 6, 7, 8)
  }

  it should "have correct vector values" in {
    Collections.vector shouldBe Vector("a", "b", "c", "d")
  }

  it should "remove duplicates in set" in {
    Collections.fruits shouldBe Set("apple", "banana", "orange")
  }

  it should "have correct map values" in {
    Collections.ages shouldBe Map("Alice" -> 30, "Bob" -> 25, "Charlie" -> 35)
  }

  "Transformation operations" should "map correctly" in {
    Collections.mapExample() shouldBe List(2, 4, 6, 8, 10)
  }

  it should "filter correctly" in {
    Collections.filterExample() shouldBe List(3, 4, 5)
  }

  it should "flatMap correctly" in {
    Collections.flatMapExample() shouldBe List(1, 10, 2, 20, 3, 30, 4, 40, 5, 50)
  }

  it should "fold correctly" in {
    Collections.foldExample() shouldBe 15
  }

  it should "reduce correctly" in {
    Collections.reduceExample() shouldBe 15
  }

  it should "collect correctly" in {
    Collections.collectExample() shouldBe List("even-2", "even-4")
  }

  it should "groupBy correctly" in {
    val grouped = Collections.groupByExample()
    grouped("even") should contain theSameElementsAs List(2, 4)
    grouped("odd") should contain theSameElementsAs List(1, 3, 5)
  }

  it should "partition correctly" in {
    val (greater, lessOrEqual) = Collections.partitionExample()
    greater shouldBe List(4, 5)
    lessOrEqual shouldBe List(1, 2, 3)
  }

  "For-comprehensions" should "produce combinations" in {
    Collections.combinations() shouldBe List(
      (1, 'a'), (1, 'b'),
      (2, 'a'), (2, 'b'),
      (3, 'a'), (3, 'b')
    )
  }

  it should "find all children with parent info" in {
    val children = Collections.allChildren()
    children should contain("Bob (child of Alice)")
    children should contain("Charlie (child of Alice)")
    children should contain("Eve (child of Dave)")
  }

  "Lazy processing" should "only compute required elements" in {
    val result = Collections.lazyProcessing()
    result.size shouldBe 10
    result.head shouldBe 4  // 1*2=2 (not divisible by 4), 2*2=4 (first match)
  }
