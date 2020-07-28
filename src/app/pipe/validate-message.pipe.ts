import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'validateMessage'
})
export class ValidateMessagePipe implements PipeTransform {

  transform(value: any, ...args: any ): unknown {
    const userChat = args[0];
    return value.id === userChat.id ? 'messages messages--sent' : 'messages messages--received';
  }

}
