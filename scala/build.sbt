// Scala Learning Examples Project
name := "scala-learning-examples"
version := "1.0.0"
scalaVersion := "3.3.1"

// Dependencies
libraryDependencies ++= Seq(
  "org.scalatest" %% "scalatest" % "3.2.17" % Test,

  // ZIO Core
  "dev.zio" %% "zio" % "2.0.19",
  "dev.zio" %% "zio-streams" % "2.0.19",

  // ZIO HTTP for web server
  "dev.zio" %% "zio-http" % "3.0.0-RC4",

  // ZIO JSON for JSON handling
  "dev.zio" %% "zio-json" % "0.6.2",

  // ZIO Test
  "dev.zio" %% "zio-test" % "2.0.19" % Test,
  "dev.zio" %% "zio-test-sbt" % "2.0.19" % Test
)

// Enable ZIO test framework
testFrameworks += new TestFramework("zio.test.sbt.ZTestFramework")

// Compiler options
scalacOptions ++= Seq(
  "-deprecation",
  "-feature",
  "-unchecked"
)
