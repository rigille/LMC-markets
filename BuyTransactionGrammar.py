import pyparsing as pp
from pyparsing import Word, alphas, nums, alphanums, Literal, Combine, OneOrMore, oneOf, Suppress, delimitedList, Group, SkipTo

number = pp.pyparsing_common.number
integer = pp.pyparsing_common.integer
signed_integer = pp.pyparsing_common.signed_integer

slash = Literal("/")
colon = Literal(":")

date = Combine( Word(nums, exact=4) + slash + Word(nums, exact=2) + slash + Word(nums, exact=2) + Literal(" ") + Word(nums, exact=2) + colon + Word(nums, exact=2) + colon + Word(nums, exact=2) ).setResultsName("date")

minecraft_username = Word(alphanums+"_", min=3, max=16)

buyer = minecraft_username.setResultsName("buyer")

seller = SkipTo(' at').setResultsName("seller")

item_amount = number.setResultsName("item_amount")

item = SkipTo(' for').setResultsName("item")

cash_amount = number.setResultsName("cash_amount")

world = (oneOf("world_nether world_the_end world")).setResultsName("world")

coordinates = Group(delimitedList(signed_integer)).setResultsName("coordinates")

buy_transaction = date + buyer + Suppress("bought") + item_amount + item + Suppress("for") + cash_amount + Suppress("from") + seller + Suppress("at") + Suppress("[") + world + Suppress("]") + coordinates
