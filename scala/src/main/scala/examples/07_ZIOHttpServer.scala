package examples

import zio.*
import zio.http.*
import zio.json.*

/**
 * Lesson 7: ZIO HTTP Server
 *
 * This file demonstrates how to build a REST API with ZIO HTTP:
 * - Basic routes
 * - Path parameters
 * - Query parameters
 * - JSON handling
 * - Middleware
 */

// ============================================
// JSON DATA MODELS
// ============================================

case class User(id: Int, name: String, email: String)
object User:
  given JsonEncoder[User] = DeriveJsonEncoder.gen[User]
  given JsonDecoder[User] = DeriveJsonDecoder.gen[User]

case class CreateUserRequest(name: String, email: String)
object CreateUserRequest:
  given JsonDecoder[CreateUserRequest] = DeriveJsonDecoder.gen[CreateUserRequest]

case class ApiResponse[A](success: Boolean, data: Option[A], error: Option[String])
object ApiResponse:
  given [A: JsonEncoder]: JsonEncoder[ApiResponse[A]] = DeriveJsonEncoder.gen[ApiResponse[A]]

  def success[A](data: A): ApiResponse[A] =
    ApiResponse(success = true, data = Some(data), error = None)

  def error[A](message: String): ApiResponse[A] =
    ApiResponse(success = false, data = None, error = Some(message))

// ============================================
// USER SERVICE (Business Logic)
// ============================================

trait UserService:
  def getUser(id: Int): Task[Option[User]]
  def getAllUsers: Task[List[User]]
  def createUser(name: String, email: String): Task[User]
  def deleteUser(id: Int): Task[Boolean]

object UserService:
  // Live implementation with in-memory storage
  val live: ZLayer[Any, Nothing, UserService] = ZLayer.succeed(
    new UserService:
      private var users = Map(
        1 -> User(1, "Alice", "alice@example.com"),
        2 -> User(2, "Bob", "bob@example.com")
      )
      private var nextId = 3

      def getUser(id: Int): Task[Option[User]] =
        ZIO.succeed(users.get(id))

      def getAllUsers: Task[List[User]] =
        ZIO.succeed(users.values.toList)

      def createUser(name: String, email: String): Task[User] =
        ZIO.succeed {
          val user = User(nextId, name, email)
          users = users + (nextId -> user)
          nextId += 1
          user
        }

      def deleteUser(id: Int): Task[Boolean] =
        ZIO.succeed {
          val exists = users.contains(id)
          if exists then users = users - id
          exists
        }
  )

// ============================================
// HTTP ROUTES
// ============================================

object UserRoutes:

  def routes: Routes[UserService, Nothing] = Routes(

    // GET /health - Health check
    Method.GET / "health" -> handler {
      Response.json("""{"status": "healthy"}""")
    },

    // GET /users - Get all users
    Method.GET / "users" -> handler {
      for
        service <- ZIO.service[UserService]
        users <- service.getAllUsers
        response = ApiResponse.success(users)
      yield Response.json(response.toJson)
    }.sandbox.toHandler,

    // GET /users/:id - Get user by ID
    Method.GET / "users" / int("id") -> handler { (id: Int, req: Request) =>
      for
        service <- ZIO.service[UserService]
        maybeUser <- service.getUser(id)
        response = maybeUser match
          case Some(user) => Response.json(ApiResponse.success(user).toJson)
          case None => Response.json(ApiResponse.error[User](s"User $id not found").toJson)
                         .status(Status.NotFound)
      yield response
    }.sandbox.toHandler,

    // POST /users - Create new user
    Method.POST / "users" -> handler { (req: Request) =>
      for
        body <- req.body.asString
        createReq <- ZIO.fromEither(body.fromJson[CreateUserRequest])
                       .mapError(e => new Exception(s"Invalid JSON: $e"))
        service <- ZIO.service[UserService]
        user <- service.createUser(createReq.name, createReq.email)
        response = ApiResponse.success(user)
      yield Response.json(response.toJson).status(Status.Created)
    }.sandbox.toHandler,

    // DELETE /users/:id - Delete user
    Method.DELETE / "users" / int("id") -> handler { (id: Int, req: Request) =>
      for
        service <- ZIO.service[UserService]
        deleted <- service.deleteUser(id)
        response = if deleted then
          Response.json(ApiResponse.success("User deleted").toJson)
        else
          Response.json(ApiResponse.error[String](s"User $id not found").toJson)
            .status(Status.NotFound)
      yield response
    }.sandbox.toHandler
  )

// ============================================
// MIDDLEWARE
// ============================================

object Middleware:

  // Logging middleware
  def logging: zio.http.Middleware[Any] =
    new zio.http.Middleware[Any]:
      def apply[Env1 <: Any, Err](routes: Routes[Env1, Err]): Routes[Env1, Err] =
        routes.transform { handler =>
          Handler.fromFunctionZIO { (request: Request) =>
            for
              start <- Clock.nanoTime
              response <- handler(request)
              end <- Clock.nanoTime
              duration = (end - start) / 1_000_000
              _ <- ZIO.succeed(println(s"${request.method} ${request.url.path} - ${response.status.code} (${duration}ms)"))
            yield response
          }
        }

// ============================================
// MAIN SERVER APP
// ============================================

object ZIOHttpServer extends ZIOAppDefault:

  val port = 8080

  override def run: ZIO[Any, Any, Any] =
    for
      _ <- Console.printLine(s"Starting ZIO HTTP Server on port $port...")
      _ <- Console.printLine("Endpoints:")
      _ <- Console.printLine("  GET  /health      - Health check")
      _ <- Console.printLine("  GET  /users       - List all users")
      _ <- Console.printLine("  GET  /users/:id   - Get user by ID")
      _ <- Console.printLine("  POST /users       - Create user (JSON body)")
      _ <- Console.printLine("  DELETE /users/:id - Delete user")
      _ <- Console.printLine("")
      _ <- Console.printLine("Try: curl http://localhost:8080/users")
      _ <- Server.serve(UserRoutes.routes @@ Middleware.logging)
             .provide(
               Server.defaultWithPort(port),
               UserService.live
             )
    yield ()
