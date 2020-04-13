#include <iostream>
#include <iomanip>
#include <algorithm>
#include <string>
#include <vector>
#include <fstream>
#include <regex>
#include <jsoncpp/json/json.h>

struct coord
{
  int x;
  int y;
  int z;
};

bool operator==(coord a, coord b)
{
  return a.x == b.x && a.y == b.y && a.z == b.z;
}

struct buy_transaction
{
  std::string time;
  std::string buyer;
  int amount;
  std::string item;
  double volume;
  std::string seller;
  std::string world;
  coord location;
};

bool operator==(buy_transaction a, buy_transaction b)
{
  return   a.time == b.time
        && a.buyer == b.buyer
        && a.amount == b.amount
        && a.item == b.item
        && a.volume == b.volume
        && a.seller == b.seller
        && a.world == b.world
        && a.location == b.location;
}

int main()
{
  std::regex buy_grammar("(\\d{4}/\\d{2}/\\d{2} \\d{2}:\\d{2}:\\d{2}) (.*) bought (\\d+) (.*) for (\\d+(.\\d*)?) from (.*) at \\[(.*)\\] (-?\\d+), (-?\\d+), (-?\\d+)");
  std::ifstream transactions("ChestShop.log");
  if(!transactions.is_open())
  {
    std::cerr << "Couldn't open log file" << std::endl;
    return -1;
  }
  std::vector<buy_transaction> buy_transactions;
  std::string transaction_log;
  while(std::getline(transactions, transaction_log))
  {
    std::smatch sm;
    if (std::regex_match(transaction_log, sm, buy_grammar))
    {
      const std::string time = sm[1];
      const std::string buyer = sm[2];
      const int amount = std::stoi(sm[3]);
      const std::string item = sm[4];
      const double volume = std::stod(sm[5]);
      const std::string seller = sm[7];
      const std::string world = sm[8];
      const coord location {std::stoi(sm[9]), std::stoi(sm[10]), std::stoi(sm[11])};
      const buy_transaction transaction {time, buyer, amount, item, volume, seller, world, location};
      buy_transactions.push_back(transaction);
    }
  }
  transactions.close();
  if (buy_transactions.size() <= 0)
  {
    std::cout << "ERROR: No transaction found" << std::endl;
    return -1;
  }
  std::sort(buy_transactions.begin(), buy_transactions.end(), [](buy_transaction a, buy_transaction b) {
      if (a.item < b.item)
      {
        return true;
      }
      else if (a.item == b.item && a.time < b.time)
      {
        return true;
      }
      else
      {
        return false;
      }
    });

  std::vector<buy_transaction> condensed_buy_transactions;
  condensed_buy_transactions.push_back(buy_transactions[0]);
  condensed_buy_transactions[0].time = condensed_buy_transactions[0].time.substr(0, 10);
  for (int i = 1; i < buy_transactions.size(); i++)
  {
    const buy_transaction curr_transaction = buy_transactions[i];
    if (   curr_transaction.time.substr(0, 10) == condensed_buy_transactions.back().time
        && curr_transaction.buyer == condensed_buy_transactions.back().buyer
        && curr_transaction.item == condensed_buy_transactions.back().item
        && curr_transaction.seller == condensed_buy_transactions.back().seller
        && curr_transaction.world == condensed_buy_transactions.back().world
        && curr_transaction.location == condensed_buy_transactions.back().location)
    {
      condensed_buy_transactions.back().amount += curr_transaction.amount;
      condensed_buy_transactions.back().volume += curr_transaction.volume;
    }
    else
    {
      condensed_buy_transactions.push_back(curr_transaction);
      condensed_buy_transactions.back().time = curr_transaction.time.substr(0, 10);
    }
  }
  /*
  for (const auto &t: condensed_buy_transactions)
  {
    std::cout << t.time << " " << std::setw(18) << t.buyer << " bought "
      << std::setw(4) << t.amount << " " << std::setw(18) << t.item << " for " << std::setw(10) << t.volume
      << " from " << std::setw(18) << t.seller << " at [" << t.world
      << "] " << std::setw(5) << t.location.x << ", "  << std::setw(5) << t.location.y
      << ", "  << std::setw(5) << t.location.z << std::endl;
  }
  */
  std::string curr_item;
  std::ofstream item_file;
  Json::Value items_json;
  Json::Value transaction_json;
  for (const auto &t: condensed_buy_transactions)
  {
    if (t.item == curr_item)
    {
      transaction_json["time"] = t.time;
      transaction_json["buyer"] = t.buyer;
      transaction_json["amount"] = t.amount;
      transaction_json["volume"] = t.volume;
      transaction_json["seller"] = t.seller;
      transaction_json["world"] = t.world;
      transaction_json["location"]["x"] = t.location.x;
      transaction_json["location"]["y"] = t.location.y;
      transaction_json["location"]["z"] = t.location.z;
      items_json["transactions"].append(transaction_json);
    }
    else
    {
      if (curr_item.size() > 0)
      {
        item_file << items_json << std::flush;
        item_file.close();
      }
      curr_item = t.item;
      item_file.open("items/" + curr_item + ".json");

      items_json["item name"] = curr_item;

      items_json["transactions"] = Json::Value(Json::arrayValue);
      transaction_json["time"] = t.time;
      transaction_json["buyer"] = t.buyer;
      transaction_json["amount"] = t.amount;
      transaction_json["volume"] = t.volume;
      transaction_json["seller"] = t.seller;
      transaction_json["world"] = t.world;
      transaction_json["location"]["x"] = t.location.x;
      transaction_json["location"]["y"] = t.location.y;
      transaction_json["location"]["z"] = t.location.z;
      items_json["transactions"].append(transaction_json);
    }
  }
  item_file << items_json << std::flush;
  item_file.close();
  return 0;
}
