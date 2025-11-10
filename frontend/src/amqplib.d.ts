declare module 'amqplib' {
  export interface Message {
    content: Buffer;
    fields: any;
    properties: any;
  }

  export interface Connection {
    createChannel(): Promise<Channel>;
    close(): Promise<void>;
  }

  export interface Channel {
    assertQueue(queue: string, options?: any): Promise<any>;
    consume(queue: string, callback: (msg: Message | null) => void, options?: any): Promise<any>;
    sendToQueue(queue: string, content: Buffer, options?: any): boolean;
    ack(msg: Message): void;
    nack(msg: Message, allUpTo?: boolean, requeue?: boolean): void;
    close(): Promise<void>;
  }

  export function connect(url: string): Promise<Connection>;
}
