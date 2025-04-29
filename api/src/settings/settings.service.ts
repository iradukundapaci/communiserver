import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Setting } from "./entities/setting.entity";
import { Repository } from "typeorm";
import { plainToInstance } from "class-transformer";
import { UpdateSettingValueDto } from "./dto/update-setting-value.dto";
import { FetchSettingValueDto } from "./dto/fetch-setting-value.dto";

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  async update(updateSettingValueDto: UpdateSettingValueDto.Input) {
    const setting = await this.settingRepository.findOneBy({
      name: updateSettingValueDto.name,
    });

    if (!setting) {
      throw new NotFoundException("Setting not found");
    }

    setting.value = updateSettingValueDto.value;

    return this.settingRepository.save(setting);
  }

  async getSettingValue(input: FetchSettingValueDto.Input) {
    const setting = await this.findSettingByName(input.name);

    return plainToInstance(FetchSettingValueDto.Output, {
      name: setting.name,
      value: setting.value,
    });
  }

  async findSettingByName(name: string) {
    const setting = await this.settingRepository.findOneBy({ name });

    if (!setting) {
      throw new NotFoundException("Setting not found");
    }

    return setting;
  }
}
