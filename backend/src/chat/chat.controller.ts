import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';
import { ChatService } from './chat.service';
import { SendChatMessageDto } from './dto/chat-request.dto';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async sendMessage(
    @Body() dto: SendChatMessageDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.chatService.sendMessage(dto, user);
  }

  @Post('stream')
  async streamMessage(
    @Body() dto: SendChatMessageDto,
    @CurrentUser() user: UserPayload,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const result = await this.chatService.streamMessage(
        dto,
        user,
        (chunk: string) => {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        },
      );

      res.write(`data: ${JSON.stringify({ done: true, result })}\n\n`);
      res.end();
    } catch (err: any) {
      res.write(
        `data: ${JSON.stringify({ error: err.message || 'Stream error occurred' })}\n\n`,
      );
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
    }
  }

  @Get('conversations')
  async getConversations(@CurrentUser() user: UserPayload) {
    return this.chatService.getConversations(user);
  }

  @Get('conversations/:id')
  async getConversationById(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.chatService.getConversationById(id, user);
  }

  @Delete('conversations/:id')
  async deleteConversation(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.chatService.deleteConversation(id, user);
  }
}
