import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export namespace CreateTaskDTO {
  export class Input {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsUUID()
    @IsNotEmpty()
    activityId: string;

    @IsUUID()
    @IsNotEmpty()
    isiboId: string;
  }

  export class Output {
    id: string;
    title: string;
    description: string;
    status: string;
    activity: {
      id: string;
      title: string;
    };
    isibo: {
      id: string;
      name: string;
    };
  }
}
