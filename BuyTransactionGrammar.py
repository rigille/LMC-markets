import pyparsing as pp
from pyparsing import Word, alphas, nums, alphanums, Literal, Combine, OneOrMore, oneOf, Suppress, delimitedList, Group, SkipTo

number = pp.pyparsing_common.number
integer = pp.pyparsing_common.integer
signed_integer = pp.pyparsing_common.signed_integer

slash = Suppress("/")
colon = Suppress(":")

year = Word(nums, exact=4).setResultsName("year")
month = Word(nums, exact=2).setResultsName("month")
day = Word(nums, exact=2).setResultsName("day")

hour = Word(nums, exact=2).setResultsName("hour")
minute = Word(nums, exact=2).setResultsName("minute")
second = Word(nums, exact=2).setResultsName("second")

date = Group( year + slash + month + slash + day + hour + colon + minute + colon + second ).setResultsName("date")

minecraft_username = Word(alphanums+"_", min=3, max=16)

buyer = minecraft_username.setResultsName("buyer")

#This is fast but it'll break if NullCase makes an admin shop that
#contains ' at ' in its name
seller = SkipTo(' at ').setResultsName("seller")

item_amount = number.setResultsName("item_amount")

#Breaks if an item contains a ' for '
item = SkipTo(' for ').setResultsName("item")

cash_amount = number.setResultsName("cash_amount")

world = (oneOf("world_nether world_the_end world")).setResultsName("world")

coordinates = Group(delimitedList(signed_integer)).setResultsName("coordinates")

buy_transaction = date + buyer + Suppress("bought") + item_amount + item + Suppress("for") + cash_amount + Suppress("from") + seller + Suppress("at") + Suppress("[") + world + Suppress("]") + coordinates

#Small test
#print(buy_transaction.parseString('2018/09/01 00:05:58 NullCase bought 3 White Wool for 25.00 from LightsChaos at [world] 29, 69, 38'))
