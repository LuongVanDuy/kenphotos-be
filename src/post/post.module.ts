import { Module } from "@nestjs/common";
import { PostController } from "./post.controller";
import { PostService } from "./post.service";
import { PostPublicController } from "./post-public.controller";

@Module({
  controllers: [PostController, PostPublicController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
