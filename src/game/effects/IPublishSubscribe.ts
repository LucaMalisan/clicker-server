export interface IPublishSubscribe {

  subscribe(eventName: string, callback: any): void;
  emit(eventName: string, ...args: any[]): void;
}