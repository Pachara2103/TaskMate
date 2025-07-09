import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userId: string = '';
  username: string = '';

  constructor() { }
}
