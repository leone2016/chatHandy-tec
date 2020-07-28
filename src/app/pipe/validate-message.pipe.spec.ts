import { ValidateMessagePipe } from './validate-message.pipe';

describe('ValidateMessagePipe', () => {
  it('create an instance', () => {
    const pipe = new ValidateMessagePipe();
    expect(pipe).toBeTruthy();
  });
});
