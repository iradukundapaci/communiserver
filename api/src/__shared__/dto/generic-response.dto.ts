import { ApiProperty } from "@nestjs/swagger";

export class GenericResponse<T = any> {
  message?: string;
  @ApiProperty({ type: [Object] })
  payload?: T;

  constructor(message?: string, payload?: T) {
    this.message = message || "Success";
    this.payload = payload || null;
  }
}
