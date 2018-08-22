var express=require('express');
var app=express();
var jsonstring="";
var db=null;
var collection=null;
var dayid="";
var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var conn = mongoose.connection;
var db=mongoose.connect('mongodb://localhost:27017/test_db');
var cst_func_res=null;
var carSchema=mongoose.Schema({
  name:String
});



var car=mongoose.model("car",carSchema);




var zoneSchema = mongoose.Schema({
   start_time: Number,
   end_time:Number,
   mul: Number,
   carid:{type: schema.Types.ObjectId},
   dayid: Number
});



var Zone=mongoose.model("zones",zoneSchema);



app.use(bodyParser.urlencoded({
    extended: true
}));




app.use(bodyParser.json());




MongoClient.connect("mongodb://localhost:27017", function(err, MongoClient) {
  if(err) 
    console.log(err);

    console.log("We are connected");
    db = MongoClient.db("test_db");   
});




app.get("/insert/:name/:day/:str", function (req, res) {

    var lastid=null;
    var carname=req.params.name;

    car.find({"name":carname},function(err,obj)
    { 
        if(err) 
          throw err;
        else if(obj.length == 0)
        {
            conn.collection('cars').insert({"name":carname},function(err,docs)
            {       
                console.log("last-id:"+docs['insertedIds'][0]);
                lastid=docs['insertedIds'][0];
                xyz()      
            });
        }
        else
        {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('_testcb(\'{"message":"car is already added!"} \')');
        }
    });

function xyz()
{
      console.log("xyz function");
      lastid=lastid;
      var temp_query=req.params.str;
      temp_query=JSON.parse(temp_query);

      var day_id=req.params.day;
 
      for(var i=0;i<temp_query.length;i++)
      {
          var temp_temp=temp_query[i];
          temp_temp['carid']=lastid;
          temp_temp['dayid']=day_id;
      }

      console.log(temp_query);

      Zone.create(temp_query,function(err,docs){
      
      if(err) console.log(err); 
          console.log(docs);

      collection=db.collection("zones");
      collection.aggregate([{$match:{$and:[{"dayid":parseInt(day_id)},{"carid":ObjectId(lastid)}]}},
      {
        $lookup:
        {
          from: 'cars',
          localField: 'carid',
          foreignField: '_id',
          as: 'car_data'
        }
      },
      { 
        $lookup:
        {
          from: 'days',
          localField: 'dayid',
          foreignField: 'day_id',
          as: 'day_data'
        }
      }]).toArray(function(err, docs) {
    
          if (err) throw err;
            console.log(docs);
     
          var jsonstring=docs;
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end('_testcb(\''+JSON.stringify(jsonstring)+'\')');   
  });
});
}
});







app.get("/select/:day/:car", function (req, res) {

    console.log("dayid"+req.params.day);
    console.log("carid"+req.params.car);

    var carid=req.params.car;
    var dayid=req.params.day;

    collection=db.collection("zones");
    collection.aggregate([{$match:{$and:[{"dayid":parseInt(dayid)},{"carid":ObjectId(carid)}]}},
     {
      $lookup:
       {
         from: 'cars',
         localField: 'carid',
         foreignField: '_id',
         as: 'car_data'
       }
     },
       { 
          $lookup:
          {
            from: 'days',
            localField: 'dayid',
            foreignField: 'day_id',
            as: 'day_data'
          }
        }]).toArray(function(err, docs) {
      
            if (err) throw err;
              console.log(docs);
     
            var jsonstring=docs;
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('_testcb(\''+JSON.stringify(jsonstring)+'\')');   
          });
});




app.get("/update/:id/:mul", function (req, res) {
  
    console.log(req.params.day);
    collection = db.collection("zones");
    collection.updateOne({_id:ObjectId(req.params.id)},{$set:{"mul":req.params.mul}}, function(err, obj) {
      if (err) 
        throw err;
            
      console.log(obj.result.n + " document(s) updated");
    });

    res.writeHead(200, {'Content-Type': 'text/html'});
  	res.end('_testcb(\'{"message": "updated!"}\')');
});






app.get("/delete/:id", function (req, res) {

    collection = db.collection("zones");
    
    var cursor=collection.deleteOne({_id:ObjectId(req.params.id)}, function(err, obj) {
    if (err) 
      throw err;
            
    console.log(obj.result.n + " document(s) deleted");
    }); 
        
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('_testcb(\'{"message": "deleted!"}\')')
 });




app.get("/get_allcars", function (req, res) {
	
    collection = db.collection("cars");
    var cursor = collection.find().toArray(function(err,docs)
    {
      var jsonstring=docs;
      res.writeHead(200, {'Content-Type': 'text/html'});
  		res.end('_testcb(\''+JSON.stringify(jsonstring)+'\')');
    });
});

app.listen(2500);