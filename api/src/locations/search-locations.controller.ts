import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { IsAuthorized } from "src/auth/decorators/authorize.decorator";
import { SearchLocationsService } from "./search-locations.service";
import { SearchLocationsDto } from "./dto/search-locations.dto";

@ApiTags("Locations Search")
@Controller("locations/search")
export class SearchLocationsController {
  constructor(private readonly searchLocationsService: SearchLocationsService) {}

  @Get()
  @ApiOperation({ 
    summary: "Search locations with advanced filters",
    description: "Search across all location types (provinces, districts, sectors, cells, villages, houses, isibos) with advanced filtering capabilities"
  })
  @ApiResponse({
    status: 200,
    description: "Location search results",
    type: SearchLocationsDto.Output,
  })
  @IsAuthorized()
  async searchLocations(
    @Query() searchDto: SearchLocationsDto.Input,
  ): Promise<SearchLocationsDto.Output> {
    return this.searchLocationsService.searchLocations(searchDto);
  }
}
