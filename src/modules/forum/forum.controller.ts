import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Forum')
@Controller('forum')
export class ForumController {}
