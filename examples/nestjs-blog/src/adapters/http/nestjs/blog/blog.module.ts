import { Module } from "@nestjs/common";
import type { DynamicModule } from "@nestjs/common";
import type { IPostRepository } from "../../../../capabilities/blog/application/ports/post-repository.port.js";
import { createBlogService } from "../../../../capabilities/blog/contracts/index.js";
import { BlogController } from "./blog.controller.js";

interface IEventBus {
  publish<T>(eventName: string, event: T): Promise<void>;
}

export interface BlogModuleDeps {
  postRepository: IPostRepository;
  eventBus?: IEventBus;
}

@Module({})
export class BlogModule {
  static register(deps: BlogModuleDeps): DynamicModule {
    return {
      module: BlogModule,
      controllers: [BlogController],
      providers: [
        {
          provide: "IBlogService",
          useFactory: () => createBlogService(deps),
        },
      ],
    };
  }
}
