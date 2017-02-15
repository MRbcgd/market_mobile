var fs=require('fs')
var ejs=require('ejs')
var http=require('http')
var express=require('express')
var socketio=require('socket.io')

var counter=0//삼품 수량
function Product(name,image,price,count){//상품 정보를 담은 객체
  this.index=counter++
  this.name=name
  this.image=image
  this.price=price
  this.count=count
}

var products=[//상품들의 모음
  new Product('JavaScript','chrom.png',28000,30),
  new Product('JQuery','chrom.png',28000,30),
  new Product('Node.js','chrom.png',32000,30),
  new Product('Socket.io','chrom.png',17000,30),
  new Product('Connect','chrom.png',18000,30),
  new Product('Express','chrom.png',31000,30),
  new Product('EJS','chrom.png',12000,30),
]

var app=express()
var server=http.createServer(app)

app.use(express.static(__dirname + '/public'))

app.get('/',function(request,response){
  var htmlPage=fs.readFileSync('HTMLPage.html','utf8')

  response.send(ejs.render(htmlPage,{
    products:products
  }))
})

server.listen(52273,function(){
  console.log('Server running at http://127.0.0.1:52273')
})

var io=socketio.listen(server)
io.sockets.on('connection',function(socket){
  function onReturn(index){
    products[index].count++

    clearTimeout(cart[index].timerID)

    delete cart[index]

    io.sockets.emit('count',{
      index:index,
      count:products[index].count
    })
  }

  var cart={}//배열이 아니고 객체이기 때문에 쉽게 delete로 삭제가능

  //CART
  socket.on('cart',function(index){
    products[index].count--;

    cart[index]={};
    cart[index].index=index;
    cart[index].timerID=setTimeout(function(){
      onReturn(index);
    },10*60*100);
  })
  //BUY
  socket.on('buy',function(index){
    clearTimeout(cart[index].timerID)

    delete cart[index];

    io.sockets.emit('count',{
      index:index,
      count:products[index].count
    })
  })
  //RETURN
  socket.on('return',function(index){
    onReturn(index);
  });
});
