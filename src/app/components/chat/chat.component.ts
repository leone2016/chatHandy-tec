import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {WebSocketsService} from '../../services/web-sockets.service';
import * as Cookies from 'es-cookie';
import * as uuid from 'uuid';

interface IUsuario {
  id: string;
  username: string;
  text?: string;
  color?: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {

  userChat: IUsuario;
  myMessages = [];
  users = [];
  userTyping: IUsuario;
  chatGroup: IUsuario[];

  eventSendMessage =  'send-message';
  eventNewUser = 'change_username';
  getUser = 'get users';

  constructor( private route: ActivatedRoute,
               private webServide: WebSocketsService,
               private router: Router  ) { }

  ngOnInit(): void {
    this.userChat = this.initUser();
    this.userTyping = this.initUser();
    this.userChat.id = this.getUuid();
    this.userChat.username = this.route.snapshot.params.name;
    this.newUserConnected();
    this.getMessage();
  }
  initUser(): IUsuario {
    return {
      id: '',
      username: '',
      color: ''
    };
  }
  getUuid(): string {
    if ( !Cookies.get('uuid')  ) {
       Cookies.set('uuid', uuid.v4());
    }
    return Cookies.get('uuid');
  }

  /**
   * Listen new users
   */
  newUserConnected() {
    console.log(this.userChat);
    this.webServide.emit(this.eventNewUser, this.userChat);
    this.getUserConnected();
  }
  getUserConnected(): void {
    this.webServide.listen(this.getUser).subscribe( ( data: any ) => {
      this.users = data.filter( x => x.id !== this.userChat.id);
    });
  }

  /**
   * listen on typing
   */
  newTyping(): void {
    this.webServide.emit('typing', this.userChat);
    this.getUserTyping();
  }
  typingNone(): void {
    setTimeout( () => {
      this.userTyping = { id: this.userTyping.id, username: '' };
      this.webServide.emit('typing', this.userTyping);
    }, 1000);
  }

  getUserTyping(): void {
    this.webServide.listen('typing').subscribe( ( data: any ) => {
      this.userTyping = data;

    });
  }

  /**
   * listen on new message
   */
  getMessage(): void {
    this.webServide.listen('text-event').subscribe( ( data: any ) => {
      this.myMessages = data;
      const objDiv = document.getElementById('conversation');
      objDiv.scrollTop = objDiv.scrollHeight;
    });
  }

  myMessage( like?: string ) {
    if ( like && like.length > 0 ) {
      this.userChat.text = like;
    }
    this.webServide.emit(this.eventSendMessage, this.userChat);
    this.userChat.text = '';
    this.userTyping.username = '';
    this.getMessage();
  }
  disconnect(): void {
    console.log("test");
    Cookies.remove('uuid');
    this.router.navigate([`/`]);
  }
}
