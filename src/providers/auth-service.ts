import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from '@angular/fire/auth';
import 'rxjs/add/operator/catch';

@Injectable()
export class AuthService {

  constructor(private http: HttpClient, 
              private afAuth : AngularFireAuth) {
  }


  private generateToken(uid : string, claims : any):Observable<any> {
    let body = {uid : uid, claims : claims};
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');   
    headers.append('Authorization', 'ec9a0168-f595-4fd4-863b-8761103e4add');   
    return this.http.post('https://us-central1-juntae-app.cloudfunctions.net/createToken', body, {headers : headers});
  }

  
  signInWithCustomToken(uid : string):Observable<User>{
    return new Observable(subscribe => {
      let claims = {};
      this.generateToken(uid, claims).subscribe(res =>{
        this.afAuth.auth.signInWithCustomToken(res.data).then((result : any) =>{
          const user : User = result.user.toJSON();
          subscribe.next(user);
        });
      });
    });
  }
}
