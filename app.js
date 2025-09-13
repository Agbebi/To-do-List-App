const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const port = process.env.PORT || 3000;

const items = [];

const app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


// MongoDB Database setup
mongoose.connect("mongodb+srv://agbebitimothy8_db_user:4940@tims.kjghuix.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to the app."
})


const item2 = new Item({
  name: "Hit the add button to add a task."
})

const item3 = new Item({
  name: "Click the checkbox to strike off the task."
})


const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


async function findList(listNameToCheck) {
  const listToCheck = await List.findOne({ name: listNameToCheck });
  return listToCheck
};



app.get("/", function (req, res) {
  async function getItems() {
    const dbItems = await Item.find({});

    return dbItems;
  };

  getItems().then(item => {
    const day = "Hi, It's " + date.getDay();

    if (item.length === 0) {
      res.render("lists", { listTitle: day, newListItems: defaultItems})
    } else {
      res.render("lists", { listTitle: day, newListItems: item })
    }
  });
})


app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const day = "Hi, It's " + date.getDay();

  const item = new Item({
    name: itemName
  });

  if (listName === day) {
    item.save();
    res.redirect("/")
  } else {
    findList(listName).then(result => {
      if (!listName) {
        console.log("There is no list Name");
      } else {
        result.items.push(item);
        result.save();

        res.redirect("/" + listName)
      }
    });
  }

})

app.post("/delete", function (req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  const day = "Hi, It's " + date.getDay();

  async function deleteItem(itemToDelete) {
    const deletedItem = await Item.findByIdAndDelete(itemToDelete);
  };

  async function deleteItemFromCustomList(nameOfList, idToRemove) {
    const updatedItem = await List.findOneAndUpdate({name: nameOfList}, 
      {$pull: {items: {_id: idToRemove}}});

      return updatedItem;
  }


  if (listName === day) {
    deleteItem(checkedItem)
    console.log("Item was removed successfully.");
    res.redirect('/');
  } else {
    deleteItemFromCustomList(listName, checkedItem);
    console.log("Item was removed successfully.");
    res.redirect("/" + listName);
  }



})

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  findList(customListName).then(list => {
    if (!list) {
      const list = new List({
        name: customListName,
        items: defaultItems
      })

      list.save();
      res.redirect("/" + customListName)
    } else {
      res.render("lists", { listTitle: list.name, newListItems: list.items })
    }
  })




})


app.post('/work', function (req, res) {
  const item = req.body.newItem;
  workItems.push(item);

  res.redirect("/work")
})



app.listen(port, function () {
  console.log("App started at port 3000!");
})
