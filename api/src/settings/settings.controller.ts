import { Body, Controller, Query } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import {
  BadRequestResponse,
  ErrorResponses,
  GetOperation,
  NotFoundResponse,
  PatchOperation,
  UnauthorizedResponse,
} from "src/__shared__/decorators";
import { UpdateSettingValueDto } from "./dto/update-setting-value.dto";
import { GenericResponse } from "src/__shared__/dto/generic-response.dto";
import { FetchSettingValueDto } from "./dto/fetch-setting-value.dto";
import { ApiTags } from "@nestjs/swagger";
import { IsAuthorized } from "src/auth/decorators/authorize.decorator";

@Controller("settings")
@ApiTags("Settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @PatchOperation("", "Update setting value")
  @IsAuthorized()
  @ErrorResponses(NotFoundResponse, UnauthorizedResponse, BadRequestResponse)
  async update(@Body() updateSettingValueDto: UpdateSettingValueDto.Input) {
    const setting = await this.settingsService.update(updateSettingValueDto);
    return new GenericResponse("Setting updated successfully", setting);
  }

  @GetOperation("", "Get setting value")
  @IsAuthorized()
  @ErrorResponses(NotFoundResponse, UnauthorizedResponse, BadRequestResponse)
  async getSettingValue(@Query() input: FetchSettingValueDto.Input) {
    return await this.settingsService.getSettingValue(input);
  }
}
