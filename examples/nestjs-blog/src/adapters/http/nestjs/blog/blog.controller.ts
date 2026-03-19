import { Controller, Post, Get, Put, Body, Param, Inject, HttpCode, HttpException } from "@nestjs/common";
import type { IBlogService } from "../../../../capabilities/blog/contracts/index.js";
import { InvalidSlug } from "../../../../capabilities/blog/domain/errors/invalid-slug.error.js";
import { PostNotFound } from "../../../../capabilities/blog/domain/errors/post-not-found.error.js";
import { PostAlreadyPublished } from "../../../../capabilities/blog/domain/errors/post-already-published.error.js";

function toHttpStatus(error: Error): number {
  if (error instanceof InvalidSlug) return 400;
  if (error instanceof PostNotFound) return 404;
  if (error instanceof PostAlreadyPublished) return 409;
  return 500;
}

@Controller("posts")
export class BlogController {
  constructor(@Inject("IBlogService") private readonly blogService: IBlogService) {}

  @Post()
  @HttpCode(201)
  async createPost(
    @Body() body: { title: string; slug?: string; content: string; authorId: string },
  ) {
    const result = await this.blogService.createPost(body);
    if (result.isFail()) {
      const error = result.unwrapError();
      throw new HttpException(error.message, toHttpStatus(error));
    }
    return result.unwrap();
  }

  @Put(":id/publish")
  async publishPost(@Param("id") id: string) {
    const result = await this.blogService.publishPost({ postId: id });
    if (result.isFail()) {
      const error = result.unwrapError();
      throw new HttpException(error.message, toHttpStatus(error));
    }
    return result.unwrap();
  }

  @Get(":id")
  async getPost(@Param("id") id: string) {
    const result = await this.blogService.getPost({ postId: id });
    if (result.isFail()) {
      const error = result.unwrapError();
      throw new HttpException(error.message, toHttpStatus(error));
    }
    return result.unwrap();
  }

  @Get()
  async listPosts() {
    const result = await this.blogService.listPosts({});
    if (result.isFail()) {
      const error = result.unwrapError();
      throw new HttpException(error.message, toHttpStatus(error));
    }
    return result.unwrap();
  }
}
