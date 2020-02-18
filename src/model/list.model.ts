export interface ListModel {
    config : {allowChooseAmount?: boolean, allowChangeList? : boolean, hideChoicePartic? : boolean},
    listId : string,
    listName : string,
    description?: string
}

export interface ListItemModel {
    itemId : string;
    quantity?:number,
    itemName : string,
    packing : string,
    usernames? : string;
    members? : {
        [id: string] : { quantity : number, displayName? : string}
    }, 
    selected? : boolean;
    allowMaxAmount? : boolean, 
    maxAmount? : number;
    chosen?: boolean
}

