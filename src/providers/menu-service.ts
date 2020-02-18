import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface MenuItem {
  color? : string;
  iconName? : string;
  itemName: string; 
  action: Function;
}

@Injectable()
export class MenuService {

  private menuItems : Array<MenuItem>;
  public menu$ : BehaviorSubject<Array<MenuItem>> = new BehaviorSubject([]);

  constructor() {
    this.menuItems = new Array<MenuItem>();
  }

  clear(){
    this.menuItems = new Array<MenuItem>();
  }

  addMenuItem(menuItem : MenuItem){
    this.menuItems.push(menuItem);
    this.menu$.next(this.menuItems);
  }

  addItems(itens : MenuItem[]){
    this.menuItems = this.menuItems.concat(itens);
    this.menu$.next(this.menuItems);
  }

  updateMenuItem(menuItem : MenuItem, index : number){
    this.menuItems[index] = menuItem;
    this.menu$.next(this.menuItems);
  }

  removeMenuItem(index : number){
    this.menuItems.splice(index, 1);
    this.menu$.next(this.menuItems);
  }

  addItem(itemName : string, action : Function){
    this.addMenuItem({itemName:itemName, action: action});
  }

  get items(){
    return this.menuItems;
  }

}