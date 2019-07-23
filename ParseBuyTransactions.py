from BuyTransactionGrammar import buy_transaction

f = open('ChestShopBuyTransactions.log', 'r')
line = f.readline()
out_files = {}

while line:
    parse_results = buy_transaction.parseString(line)
    item = parse_results.item
    if not (item in out_files):
        out_files[item] = open(("items/" + item + ".tsv"), "w")
        out_files[item].write("date\tbuyer\tseller\titem\tprice\tcash_amount\titem_amount\tworld\tcoordinates\n")
    price = str(parse_results.cash_amount/parse_results.item_amount)
    cash_amount = str(parse_results.cash_amount)
    item_amount = str(parse_results.item_amount)
    tsv_log = parse_results.date + "\t" + parse_results.buyer + "\t" + parse_results.seller + "\t" + parse_results.item + "\t" + price + "\t" + cash_amount + "\t" + item_amount + "\t" + parse_results.world + "\t" + str(parse_results.coordinates) + "\n"
    out_files[item].write(tsv_log)
    line = f.readline()

for item in out_files:
    out_files[item].close()
