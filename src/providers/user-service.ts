import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable()
export class UserService {

    constructor(private angularFireAuth : AngularFireAuth) {
        this.nationalCodeCountry = window.localStorage.getItem('nationalCodeCountry') || null;
    }
    
    private user : User;
    private account : any;
    private firebaseUser : firebase.User;
    private nationalCodeCountry: string;
    //private codeCountry: string;
    
    public getUser() : User{
        return this.user;        
    } 

    public setUser(user : User){
        this.user = user;
    }

    public getNationalCodeCountry(): string{
        return this.nationalCodeCountry;
    }

    public setNationalCodeCountry(nationalCodeCountry:string){
        this.nationalCodeCountry = nationalCodeCountry;
        window.localStorage.setItem('nationalCodeCountry', nationalCodeCountry);
    }

    public getFirebaseUser() : User{
        return this.firebaseUser;        
    } 

    public setFirebaseUser(user : firebase.User){
        this.firebaseUser = user;
        this.setUser({
            uid: user.phoneNumber ? user.phoneNumber.substring(1) : user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL, 
            phoneNumber: user.phoneNumber ? user.phoneNumber : user.uid,
        });
    }

    public getAccount(){
        return this.account;
    }

    public updateProfile(user : User){
        return this.angularFireAuth.auth.currentUser.updateProfile({
            displayName : user.displayName, 
            photoURL : user.photoURL
        });
    }

    public clear(){
        this.user = null;
        this.account.firebaseUser = null;
    }
    
    /*
    private parseJwt(token) {
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    };
    */    

}
