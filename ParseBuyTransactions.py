from BuyTransactionGrammar import buy_transaction
from tqdm import tqdm
from tabulate import tabulate

filename = 'ChestShopBuyTransactions.log' 
f = open(filename, 'r')
out_files = {}
summary_data = {}

print('Processing ' + filename + '…\n')

for line in tqdm(f.readlines()):
    parse_results = buy_transaction.parseString(line)
    item = parse_results.item

    price = str(parse_results.cash_amount/parse_results.item_amount)
    cash_amount = str(parse_results.cash_amount)
    item_amount = str(parse_results.item_amount)
    date = parse_results.date

    if not (item in out_files):
        out_files[item] = open(("items/" + item + ".tsv"), "w")
        out_files[item].write("year\tmonth\tday\thour\tminute\tsecond\tbuyer\tseller\titem\tprice\tcash_amount\titem_amount\tworld\tcoordinates\n")

        summary_data[item] = {}
        summary_data[item]["cash_amount"] = 0
        summary_data[item]["item_amount"] = 0

    summary_data[item]["cash_amount"] += parse_results.cash_amount
    summary_data[item]["item_amount"] += parse_results.item_amount
    
    tsv_log = date.year + "\t" + date.month + "\t" + date.day + "\t" + date.hour + "\t" + date.minute + "\t" + date.second + "\t" + parse_results.buyer + "\t" + parse_results.seller + "\t" + parse_results.item + "\t" + price + "\t" + cash_amount + "\t" + item_amount + "\t" + parse_results.world + "\t" + str(parse_results.coordinates) + "\n"
    out_files[item].write(tsv_log)

for item in out_files:
    out_files[item].close()

table_summary = []
for item in summary_data:
    table_summary.append([item, summary_data[item]["item_amount"], int(summary_data[item]["cash_amount"])])

table_summary = sorted(table_summary, key=lambda x: float(x[2]), reverse=True)

with open("summary.html", "w") as summary:
    summary.write(tabulate(table_summary, headers = ["Item", "Amount sold", "Volume"], tablefmt='html'))

print('\n' + filename + ' has been completely processed.')
