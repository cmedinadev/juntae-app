interface Evento{
  eventName : string;
  eventId? : string;
  description : string;
  place : any;
  eventDate : Date;
  code? : string;
  invitations : any;
  organizers : any;
  picture: {
      thumbnail : string, 
      cover : string 
  };
  isUserAdmin?:boolean;
  private : boolean;
  archived : boolean;
}