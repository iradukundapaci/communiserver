export namespace GatewayErrorResponseDto {
  export class Output {
    timestamp: string;
    message: string;
    status: number;

    constructor(message: string, status: number) {
      this.timestamp = new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");
      this.message = message;
      this.status = status;
    }
  }
}
