import { Module } from "@nestjs/common";
import type { DynamicModule } from "@nestjs/common";
import type { ISearchService } from "../../../../capabilities/search/contracts/search.contract.js";
import { SearchController } from "./search.controller.js";

export interface SearchModuleDeps {
  searchService: ISearchService;
}

@Module({})
export class SearchModule {
  static register(deps: SearchModuleDeps): DynamicModule {
    return {
      module: SearchModule,
      controllers: [SearchController],
      providers: [
        {
          provide: "ISearchService",
          useFactory: () => deps.searchService,
        },
      ],
    };
  }
}
