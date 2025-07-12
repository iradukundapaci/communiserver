import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { GlobalSearchService } from "../services/global-search.service";
import { GlobalSearchDto, GlobalSearchResponseDto } from "../dto/global-search.dto";

@ApiTags("Global Search")
@Controller("search")
export class GlobalSearchController {
  constructor(private readonly globalSearchService: GlobalSearchService) {}

  @Get("global")
  @ApiOperation({ summary: "Global search across all entities" })
  @ApiResponse({
    status: 200,
    description: "Search results from all entities",
    type: GlobalSearchResponseDto,
  })
  async globalSearch(@Query() dto: GlobalSearchDto): Promise<GlobalSearchResponseDto> {
    return this.globalSearchService.globalSearch(dto);
  }
}
