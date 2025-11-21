package examples

import zio.*

/**
 * Lesson 6: ZIO Basics
 *
 * ZIO is a library for asynchronous and concurrent programming in Scala.
 *
 * ZIO[R, E, A] represents an effect that:
 *   - R = Environment (dependencies needed)
 *   - E = Error type (what can go wrong)
 *   - A = Success type (what it produces)
 *
 * Common type aliases:
 *   - Task[A] = ZIO[Any, Throwable, A]     - Can fail with Throwable
 *   - UIO[A] = ZIO[Any, Nothing, A]        - Cannot fail
 *   - IO[E, A] = ZIO[Any, E, A]            - No dependencies
 */
object ZIOBasics extends ZIOAppDefault:

  // ============================================
  // CREATING ZIO EFFECTS
  // ============================================

  // Successful effect
  val successEffect: ZIO[Any, Nothing, Int] = ZIO.succeed(42)

  // Failed effect
  val failedEffect: ZIO[Any, String, Nothing] = ZIO.fail("Something went wrong")

  // From side effect (suspends execution)
  val printEffect: ZIO[Any, Nothing, Unit] = ZIO.succeed(println("Hello, ZIO!"))

  // From potentially failing code
  val parseNumber: ZIO[Any, Throwable, Int] = ZIO.attempt("123".toInt)

  // From Option
  val fromOption: ZIO[Any, Option[Nothing], Int] =
    ZIO.fromOption(Some(42))

  // From Either
  val fromEither: ZIO[Any, String, Int] =
    ZIO.fromEither(Right(42))

  // ============================================
  // TRANSFORMING EFFECTS
  // ============================================

  // map - transform success value
  val doubled: ZIO[Any, Nothing, Int] =
    successEffect.map(_ * 2)

  // flatMap - chain effects
  def fetchUser(id: Int): Task[String] =
    ZIO.succeed(s"User-$id")

  def fetchUserPosts(user: String): Task[List[String]] =
    ZIO.succeed(List(s"Post by $user"))

  val userWithPosts: Task[List[String]] =
    fetchUser(1).flatMap(user => fetchUserPosts(user))

  // For-comprehension (preferred way to chain)
  val program: Task[String] = for
    user <- fetchUser(1)
    posts <- fetchUserPosts(user)
  yield s"$user has ${posts.size} posts"

  // ============================================
  // ERROR HANDLING
  // ============================================

  val riskyOperation: ZIO[Any, String, Int] =
    ZIO.fail("Database connection failed")

  // Recover from errors
  val recovered: ZIO[Any, Nothing, Int] =
    riskyOperation.catchAll(error =>
      ZIO.succeed(0)  // Return default on error
    )

  // Recover with different effect
  val recoveredAlt: ZIO[Any, String, Int] =
    riskyOperation.orElse(ZIO.succeed(-1))

  // Map errors
  val mappedError: ZIO[Any, Exception, Int] =
    riskyOperation.mapError(msg => new Exception(msg))

  // Fold - handle both success and failure
  val folded: ZIO[Any, Nothing, String] =
    riskyOperation.fold(
      error => s"Failed: $error",
      value => s"Success: $value"
    )

  // Either - convert to Either type
  val asEither: ZIO[Any, Nothing, Either[String, Int]] =
    riskyOperation.either

  // ============================================
  // COMBINING EFFECTS
  // ============================================

  val effect1: UIO[Int] = ZIO.succeed(1)
  val effect2: UIO[Int] = ZIO.succeed(2)
  val effect3: UIO[Int] = ZIO.succeed(3)

  // zip - combine results as tuple
  val zipped: UIO[(Int, Int)] = effect1.zip(effect2)

  // zipWith - combine with function
  val summed: UIO[Int] = effect1.zipWith(effect2)(_ + _)

  // Collect all results
  val allEffects: UIO[List[Int]] =
    ZIO.collectAll(List(effect1, effect2, effect3))

  // Run effects in parallel
  val parallel: UIO[(Int, Int, Int)] =
    effect1.zipPar(effect2).zipPar(effect3).map {
      case ((a, b), c) => (a, b, c)
    }

  // ============================================
  // WORKING WITH RESOURCES
  // ============================================

  // Ensuring cleanup with ensuring
  def acquireResource(): Task[String] =
    ZIO.succeed("Resource acquired").tap(r => ZIO.succeed(println(r)))

  def releaseResource(resource: String): UIO[Unit] =
    ZIO.succeed(println(s"Released: $resource"))

  val withResource: Task[Unit] =
    acquireResource()
      .flatMap(r => ZIO.succeed(println(s"Using: $r")))
      .ensuring(ZIO.succeed(println("Cleanup done")))

  // acquireRelease for bracket pattern
  val bracketExample: ZIO[Scope, Throwable, Unit] =
    ZIO.acquireRelease(acquireResource())(releaseResource)
      .flatMap(resource => ZIO.succeed(println(s"Working with $resource")))

  // ============================================
  // DELAYS AND TIMEOUTS
  // ============================================

  import zio.Duration.*

  val delayed: UIO[Int] =
    ZIO.succeed(42).delay(1.second)

  val withTimeout: ZIO[Any, Option[Nothing], Int] =
    ZIO.succeed(42).timeout(5.seconds)

  // ============================================
  // MAIN APP
  // ============================================

  override def run: ZIO[Any, Any, Any] =
    for
      _ <- Console.printLine("=== ZIO Basics Demo ===")

      // Basic effects
      value <- successEffect
      _ <- Console.printLine(s"Success value: $value")

      // Error handling
      result <- folded
      _ <- Console.printLine(result)

      // Combining effects
      list <- allEffects
      _ <- Console.printLine(s"All effects: $list")

      // For-comprehension
      message <- program
      _ <- Console.printLine(message)

      // Resource handling
      _ <- withResource

      _ <- Console.printLine("=== Demo Complete ===")
    yield ()
