import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { IAppConfig } from "src/__shared__/interfaces/app-config.interface";
import { Setting } from "src/settings/entities/setting.entity";

@Injectable()
export class SettingsSeedService {
  private readonly logger = new Logger(SettingsSeedService.name);

  constructor(
    @InjectRepository(Setting)
    private readonly seetingsRepository: Repository<Setting>,
    public configService: ConfigService<IAppConfig>,
  ) {}

  async run() {
    const settingsToSeed = [
      {
        name: "Disbursement",
        value: "OFF",
      },
      {
        name: "SourcePaymentChannel",
        value: "BK",
      },
      {
        name: "ServiceFeePercentage",
        value: "0",
      },
    ];

    for (const setting of settingsToSeed) {
      const settingExist = await this.seetingsRepository.findOneBy({
        name: setting.name,
      });

      if (!settingExist) {
        const newSetting = new Setting();
        newSetting.name = setting.name;
        newSetting.value = setting.value;

        await this.seetingsRepository.save(newSetting);

        this.logger.log(`${setting.name} setting created successfully`);
      } else {
        this.logger.log(`${setting.name} setting already exists`);
      }
    }
  }
}
