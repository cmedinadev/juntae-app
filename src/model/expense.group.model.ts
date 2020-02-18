interface ExpenseGroupModel {
    groupId : string,
    groupName : string,
    amountTotal? : number,
    amountPerPerson? : number, 
    participants : {["userID"] : boolean}
}