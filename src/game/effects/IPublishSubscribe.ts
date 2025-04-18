export interface IPublishSubscribe {

  subscribe(eventName: string, callback: any): void;
  unsubscribe(eventName: string, callback: any): void;
  emit(eventName: string, ...args: any[]): void;
}