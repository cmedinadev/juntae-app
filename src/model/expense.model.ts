interface ExpenseModel {
    id : string,
    description : string,
    expenseDate : number,
    amount : number,
    groupWhoSplit : string,
    urlPaymVoucher? : string,
    filename? : string,
    usersWhoPaid : [string];
}