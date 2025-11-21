# Scala Learning Examples

A comprehensive guide to learning Scala from scratch, with practical examples and tests.

## Prerequisites

- **Java JDK 11+** (recommended: JDK 17 or 21)
- **sbt** (Scala Build Tool)

### Installing sbt

**macOS (Homebrew):**
```bash
brew install sbt
```

**Linux (SDKMAN):**
```bash
curl -s "https://get.sdkman.io" | bash
sdk install sbt
```

**Windows (Scoop):**
```powershell
scoop install sbt
```

## Project Structure

```
scala/
├── build.sbt                           # Project configuration
├── project/
│   └── build.properties                # sbt version
├── src/
│   ├── main/scala/examples/
│   │   ├── 01_Basics.scala            # Variables, types, expressions
│   │   ├── 02_Functions.scala         # Functions, lambdas, currying
│   │   ├── 03_Classes.scala           # Classes, objects, traits
│   │   ├── 04_CaseClasses.scala       # Case classes, pattern matching
│   │   ├── 05_Collections.scala       # Lists, maps, transformations
│   │   ├── 06_ZIOBasics.scala         # ZIO effects and error handling
│   │   ├── 07_ZIOHttpServer.scala     # REST API with ZIO HTTP
│   │   └── 08_ZIOLayers.scala         # Dependency injection with ZIO
│   └── test/scala/examples/
│       ├── BasicsSpec.scala
│       ├── FunctionsSpec.scala
│       ├── ClassesSpec.scala
│       ├── CaseClassesSpec.scala
│       ├── CollectionsSpec.scala
│       └── ZIOBasicsSpec.scala
└── README.md
```

## Getting Started

### 1. Navigate to the project

```bash
cd scala
```

### 2. Compile the project

```bash
sbt compile
```

### 3. Run all tests

```bash
sbt test
```

### 4. Run specific test file

```bash
sbt "testOnly examples.BasicsSpec"
sbt "testOnly examples.FunctionsSpec"
sbt "testOnly examples.ZIOBasicsSpec"
```

## Running Examples

### Run individual examples with main methods:

```bash
# Basics demo
sbt "runMain runBasics"

# Functions demo
sbt "runMain runFunctions"

# Classes demo
sbt "runMain runClasses"

# Case classes and pattern matching
sbt "runMain runCaseClasses"

# Collections demo
sbt "runMain runCollections"
```

### Run ZIO examples:

```bash
# ZIO Basics
sbt "runMain examples.ZIOBasics"

# ZIO HTTP Server (starts on port 8080)
sbt "runMain examples.ZIOHttpServer"

# ZIO Layers demo
sbt "runMain examples.ZIOLayers"
```

## Testing the HTTP Server

After starting the ZIO HTTP server:

```bash
# Health check
curl http://localhost:8080/health

# List all users
curl http://localhost:8080/users

# Get specific user
curl http://localhost:8080/users/1

# Create a new user
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Charlie", "email": "charlie@example.com"}'

# Delete a user
curl -X DELETE http://localhost:8080/users/1
```

## Interactive REPL

Start the Scala REPL with project classes loaded:

```bash
sbt console
```

Then try:
```scala
import examples.*

// Try basics
Basics.greet("World")
Basics.absoluteValue(-42)

// Try functions
Functions.add(3, 4)
val times5 = Functions.multiplier(5)
times5(10)

// Try collections
Collections.mapExample()
Collections.filterExample()
```

## Lesson Overview

### 01: Basics
- `val` (immutable) vs `var` (mutable)
- Basic types (Int, String, Boolean, etc.)
- String interpolation (`s""`, `f""`, `raw""`)
- Expressions (everything returns a value)

### 02: Functions
- Function definitions and return types
- Default and named parameters
- Higher-order functions (functions as parameters)
- Lambdas/anonymous functions
- Currying and partial application
- Varargs

### 03: Classes
- Class definitions and constructors
- Companion objects (static members)
- Traits (interfaces with implementations)
- Inheritance and abstract classes
- Sealed traits for exhaustive matching

### 04: Case Classes & Pattern Matching
- Case classes (immutable data containers)
- Pattern matching with `match`
- Option type (safe null handling)
- Either type (error handling)
- For-comprehensions with Options

### 05: Collections
- List, Vector, Set, Map
- Transformations: map, filter, flatMap, fold
- For-comprehensions
- Lazy collections (views)

### 06: ZIO Basics
- ZIO effect type: `ZIO[R, E, A]`
- Creating effects: succeed, fail, attempt
- Transforming: map, flatMap
- Error handling: catchAll, fold, either
- Combining effects: zip, collectAll

### 07: ZIO HTTP Server
- Building REST APIs with ZIO HTTP
- Routing and path parameters
- JSON encoding/decoding with zio-json
- Middleware (logging)
- Service layers

### 08: ZIO Layers
- Dependency injection with ZLayer
- Service definitions (traits)
- Layer composition (++, >>>)
- Automatic wiring with ZLayer.make
- Testing with mock layers

## Continuous Development

Watch for changes and recompile:
```bash
sbt ~compile
```

Watch and run tests on file changes:
```bash
sbt ~test
```

## Recommended Learning Path

1. Start with `01_Basics.scala` - understand immutability and expressions
2. Move to `02_Functions.scala` - master functional programming basics
3. Study `03_Classes.scala` - learn OOP in Scala
4. Deep dive into `04_CaseClasses.scala` - pattern matching is crucial!
5. Practice with `05_Collections.scala` - collection operations are used everywhere
6. Explore `06_ZIOBasics.scala` - understand effect systems
7. Build with `07_ZIOHttpServer.scala` - create real applications
8. Master `08_ZIOLayers.scala` - professional dependency management

## Resources

- [Scala Documentation](https://docs.scala-lang.org/)
- [Scala 3 Book](https://docs.scala-lang.org/scala3/book/introduction.html)
- [ZIO Documentation](https://zio.dev/)
- [ZIO HTTP](https://zio.dev/zio-http/)
