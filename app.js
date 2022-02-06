//jshint esversion:6

const express = require("express");
// const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// mongoose.connect("mongodb+srv://admin-troy:test123@cluster0.dt2vt.mongodb.net/todolistDB", {
//   useNewUrlParser: true
// });
mongoose.connect("mongodb+srv://admin-troy:test123@cluster0.dt2vt.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

// mongoose.connect("mongodb://localhost:27017/todolistDB", {
//   useNewUrlParser: true
// });

const itemSchema = mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = ({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect('/');
    } else {
      res.render("list.ejs", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });

});

app.get('/:customListName', (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // Create new list
        console.log('Doesn\'t exist');
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect(`/${customListName}`);
      } else {
        // Show an existing list
        res.render('list.ejs', {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({
      name: listName
    }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect(`/${listName}`);
    });
  }

});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then((data) => {
        console.log(data, "Successfully deleted checked item");
      })
      .catch((err) => {
        console.log(err, "Error");
      });
    res.redirect('/');
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function (err, foundList) {
      if (!err) {
        res.redirect(`/${listName}`);
      }
    });
  }


});

app.get("/about", function (req, res) {
  res.render("about");
});

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }

// app.listen(port, function () {
//   console.log("Server has started successfully");
// });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started succesfully");
});

// const server = app.listen(process.env.PORT || 5000, () => {
//   const port = server.address().port;
//   console.log(`Express is working on port ${port}`);
// });