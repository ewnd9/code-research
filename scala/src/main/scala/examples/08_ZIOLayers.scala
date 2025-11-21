package examples

import zio.*

/**
 * Lesson 8: ZIO Layers (Dependency Injection)
 *
 * ZIO Layers provide a powerful way to handle dependencies:
 * - Type-safe dependency injection
 * - Automatic resource management
 * - Testability through layer substitution
 *
 * ZLayer[RIn, E, ROut] represents:
 *   - RIn = Dependencies needed to build this layer
 *   - E = Errors that can occur during construction
 *   - ROut = The service this layer provides
 */

// ============================================
// SERVICE DEFINITIONS (Traits)
// ============================================

// Config service
trait Config:
  def databaseUrl: String
  def apiKey: String

object Config:
  // Accessor methods
  def databaseUrl: ZIO[Config, Nothing, String] =
    ZIO.serviceWith[Config](_.databaseUrl)

  def apiKey: ZIO[Config, Nothing, String] =
    ZIO.serviceWith[Config](_.apiKey)

  // Live implementation
  val live: ZLayer[Any, Nothing, Config] = ZLayer.succeed(
    new Config:
      val databaseUrl = "jdbc:postgresql://localhost:5432/mydb"
      val apiKey = "secret-api-key-123"
  )

  // Test implementation
  val test: ZLayer[Any, Nothing, Config] = ZLayer.succeed(
    new Config:
      val databaseUrl = "jdbc:h2:mem:testdb"
      val apiKey = "test-api-key"
  )

// Database service
trait Database:
  def query(sql: String): Task[List[String]]
  def execute(sql: String): Task[Int]

object Database:
  def query(sql: String): ZIO[Database, Throwable, List[String]] =
    ZIO.serviceWithZIO[Database](_.query(sql))

  def execute(sql: String): ZIO[Database, Throwable, Int] =
    ZIO.serviceWithZIO[Database](_.execute(sql))

  // Live implementation - depends on Config
  val live: ZLayer[Config, Nothing, Database] = ZLayer {
    for
      config <- ZIO.service[Config]
      _ <- ZIO.succeed(println(s"Connecting to: ${config.databaseUrl}"))
    yield new Database:
      def query(sql: String): Task[List[String]] =
        ZIO.succeed {
          println(s"Executing query: $sql")
          List("row1", "row2", "row3")  // Simulated results
        }

      def execute(sql: String): Task[Int] =
        ZIO.succeed {
          println(s"Executing: $sql")
          1  // Simulated affected rows
        }
  }

  // Test implementation - no real database
  val test: ZLayer[Any, Nothing, Database] = ZLayer.succeed(
    new Database:
      def query(sql: String): Task[List[String]] =
        ZIO.succeed(List("test-row"))

      def execute(sql: String): Task[Int] =
        ZIO.succeed(1)
  )

// Logger service
trait Logger:
  def info(message: String): UIO[Unit]
  def error(message: String): UIO[Unit]

object Logger:
  def info(message: String): ZIO[Logger, Nothing, Unit] =
    ZIO.serviceWithZIO[Logger](_.info(message))

  def error(message: String): ZIO[Logger, Nothing, Unit] =
    ZIO.serviceWithZIO[Logger](_.error(message))

  val live: ZLayer[Any, Nothing, Logger] = ZLayer.succeed(
    new Logger:
      def info(message: String): UIO[Unit] =
        ZIO.succeed(println(s"[INFO] $message"))

      def error(message: String): UIO[Unit] =
        ZIO.succeed(println(s"[ERROR] $message"))
  )

  // Silent logger for tests
  val silent: ZLayer[Any, Nothing, Logger] = ZLayer.succeed(
    new Logger:
      def info(message: String): UIO[Unit] = ZIO.unit
      def error(message: String): UIO[Unit] = ZIO.unit
  )

// ============================================
// BUSINESS SERVICE (Uses other services)
// ============================================

trait UserRepository:
  def findById(id: Int): Task[Option[String]]
  def save(name: String): Task[Int]
  def findAll: Task[List[String]]

object UserRepository:
  def findById(id: Int): ZIO[UserRepository, Throwable, Option[String]] =
    ZIO.serviceWithZIO[UserRepository](_.findById(id))

  def save(name: String): ZIO[UserRepository, Throwable, Int] =
    ZIO.serviceWithZIO[UserRepository](_.save(name))

  def findAll: ZIO[UserRepository, Throwable, List[String]] =
    ZIO.serviceWithZIO[UserRepository](_.findAll)

  // Live implementation - depends on Database AND Logger
  val live: ZLayer[Database & Logger, Nothing, UserRepository] = ZLayer {
    for
      db <- ZIO.service[Database]
      logger <- ZIO.service[Logger]
    yield new UserRepository:
      def findById(id: Int): Task[Option[String]] =
        for
          _ <- logger.info(s"Finding user $id")
          results <- db.query(s"SELECT * FROM users WHERE id = $id")
        yield results.headOption

      def save(name: String): Task[Int] =
        for
          _ <- logger.info(s"Saving user: $name")
          count <- db.execute(s"INSERT INTO users (name) VALUES ('$name')")
        yield count

      def findAll: Task[List[String]] =
        for
          _ <- logger.info("Finding all users")
          results <- db.query("SELECT * FROM users")
        yield results
  }

// ============================================
// COMPOSING LAYERS
// ============================================

object LayerComposition:

  // Horizontal composition (++): combine independent layers
  val configAndLogger: ZLayer[Any, Nothing, Config & Logger] =
    Config.live ++ Logger.live

  // Vertical composition (>>>): pipe output to input
  val databaseFromConfig: ZLayer[Any, Nothing, Database] =
    Config.live >>> Database.live

  // Full application layer
  val fullAppLayer: ZLayer[Any, Nothing, Config & Logger & Database & UserRepository] =
    val base = Config.live ++ Logger.live
    val withDb = base ++ (base >>> Database.live)
    withDb ++ (withDb >>> UserRepository.live)

  // Alternative: ZLayer.make automatically wires dependencies
  val autoWiredLayer: ZLayer[Any, Nothing, UserRepository] =
    ZLayer.make[UserRepository](
      Config.live,
      Logger.live,
      Database.live,
      UserRepository.live
    )

  // Test layer configuration
  val testLayer: ZLayer[Any, Nothing, UserRepository] =
    ZLayer.make[UserRepository](
      Config.test,
      Logger.silent,
      Database.test,
      UserRepository.live
    )

// ============================================
// SCOPED RESOURCES
// ============================================

trait ConnectionPool:
  def getConnection: Task[String]

object ConnectionPool:
  def getConnection: ZIO[ConnectionPool, Throwable, String] =
    ZIO.serviceWithZIO[ConnectionPool](_.getConnection)

  // Scoped layer - resource is managed
  val scoped: ZLayer[Scope & Config, Nothing, ConnectionPool] = ZLayer.scoped {
    for
      config <- ZIO.service[Config]
      _ <- ZIO.succeed(println(s"Opening connection pool to ${config.databaseUrl}"))
      // Register finalizer for cleanup
      _ <- ZIO.addFinalizer(ZIO.succeed(println("Closing connection pool")))
    yield new ConnectionPool:
      def getConnection: Task[String] =
        ZIO.succeed(s"Connection to ${config.databaseUrl}")
  }

// ============================================
// MAIN APP
// ============================================

object ZIOLayers extends ZIOAppDefault:

  val program: ZIO[UserRepository & Logger, Throwable, Unit] = for
    _ <- Logger.info("Application starting")

    // Use the repository
    _ <- UserRepository.save("Alice")
    _ <- UserRepository.save("Bob")
    users <- UserRepository.findAll
    _ <- Logger.info(s"Found ${users.size} users: $users")

    user <- UserRepository.findById(1)
    _ <- Logger.info(s"User 1: $user")

    _ <- Logger.info("Application finished")
  yield ()

  override def run: ZIO[Any, Any, Any] =
    program.provide(LayerComposition.autoWiredLayer ++ Logger.live)
