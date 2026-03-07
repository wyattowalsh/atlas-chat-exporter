export class ExportError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}
