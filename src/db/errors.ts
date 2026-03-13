export class DotBoardDataError extends Error {
  cause?: Error

  constructor(message: string, cause?: Error) {
    super(message)
    this.name = 'DotBoardDataError'
    this.cause = cause
  }
}

export class DotBoardDbError extends Error {
  operation: string
  cause?: Error

  constructor(operation: string, message: string, cause?: Error) {
    super(message)
    this.name = 'DotBoardDbError'
    this.operation = operation
    this.cause = cause
  }
}
