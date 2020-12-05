

const express = require('express');
const bodyParser = require('body-parser')
const date = require(__dirname + "/date.js")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();



app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))

// setting up Mongoose Database

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
// Creating new Schema
const itemsSchema = {
    name: String
};
// Creating a new model
const Item = mongoose.model("Item", itemsSchema);
// Creating new objects
const item1 = new Item({
    name: "Welcome to your todolist!"
});
const item2 = new Item({
    name: "Hit the + button"
});
const item3 = new Item({
    name: "Hit the buttons to delete"
});
// Make an array of the objects we want to save in the database
const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);





//Getting started with Esxpress.js
app.get('/', function(req,res) {

    Item.find({}, function(err, foundItems){
        // console.log(foundItems);

        // Insert defaultItems if only the array is empty, if it is not empty, do not repeat to push in the defautItems.
        if (foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if (err) {
                    console.log(err)
                } else {
                    console.log("Successfully saved to the DB.")
                }
            });
            res.redirect("/")
        } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems})
        }
    })

// const day = date.getDate();


});

app.post("/", function(req,res) {
    // Create and save new item to the database
   const itemName = req.body.newItem;
   const listName = req.body.list;

   const item = new Item({
       name: itemName
   });

   if (listName === "Today") {
   item.save();
   res.redirect("/");
   } else {
       List.findOne({name: listName}, function(err, foundlist){
           foundlist.items.push(item);
           foundlist.save();
           res.redirect("/" + listName);
       });
   }

//    if (req.body.list === "Work") {
//        workItems.push(item);
//        res.redirect("/work");
//    } else {
//     items.push(item)
//     res.redirect("/");
//    }
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err){
            if (!err) {
                console.log("Successfully Deleted Item!")
                res.redirect("/")
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundlist){
            if (!err) {
                res.redirect("/" + listName)
            }
        });
    }
    
});

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err, foundlist){
        if (!err) {
            if (!foundlist) {
                // Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
                // console.log("Doesn't exist")
            } else {
                // Show an existing list
                res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items});
                // console.log("Exists!");
            }
        }
    })
});

app.get("/about", function(req, res){
    res.render("about");
})


app.listen(3000, function(){
console.log('You are listening to Port:3000');
});