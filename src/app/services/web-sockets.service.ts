import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class WebSocketsService {

  socket: any;
  server = environment.urlSocket;

  constructor() {
    this.socket = io(this.server);
  }

  listen( eventName: string) {
    return new Observable((subscriber) => {
      this.socket.on(eventName, ( data ) => {
        subscriber.next(data);
      } );
    });
  }

  emit(eventName: string, data: any) {
      this.socket.emit(eventName, data);
  }
}
